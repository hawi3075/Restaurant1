const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Register a new user (Customer or Staff assigned by Admin)
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, restaurantId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in Neon DB via Prisma
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || 'CUSTOMER',
        restaurantId: restaurantId || null,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, restaurantId: user.restaurantId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, restaurantId: user.restaurantId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

// Google OAuth Login / Register
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required.' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Auto-register new Google user (no password)
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          password: '', // Google users have no password
          phone: null,
          role: 'CUSTOMER',
          restaurantId: null,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, restaurantId: user.restaurantId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
        avatar: picture || null,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'Google authentication failed. Please try again.' });
  }
};

// Request password reset
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please provide your email address.' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, return success even if user doesn't exist
      return res.json({ 
        message: 'If an account with that email exists, a password reset code has been sent.' 
      });
    }

    // Generate 6-digit verification code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the token before storing
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Create reset token record (expires in 15 minutes)
    await prisma.passwordReset.create({
      data: {
        email,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // Send email with reset code
    try {
      const transporter = createTransporter();
      
      await transporter.sendMail({
        from: `"Ma'ad Restaurant" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Code - Ma\'ad Restaurant',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .code-box { background: white; border: 3px dashed #ea580c; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
              .code { font-size: 32px; font-weight: bold; color: #ea580c; letter-spacing: 8px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🍽️ Ma'ad Restaurant</h1>
                <p style="margin: 10px 0 0 0;">Password Reset Request</p>
              </div>
              <div class="content">
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>We received a request to reset your password. Use the code below to reset your password:</p>
                
                <div class="code-box">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Your Reset Code</p>
                  <div class="code">${resetToken}</div>
                </div>
                
                <div class="warning">
                  <strong>⏰ Important:</strong> This code expires in <strong>15 minutes</strong>.
                </div>
                
                <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                
                <p>Best regards,<br><strong>Ma'ad Restaurant Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Ma'ad Restaurant. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // If email fails, still log the code for development
      console.log(`⚠️  Email failed. Reset code for ${email}: ${resetToken}`);
    }
    
    res.json({ 
      message: 'If an account with that email exists, a password reset code has been sent.',
      // Return code in development mode only
      resetCode: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Error processing password reset request.' });
  }
};

// Verify reset code and reset password
const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ error: 'Please provide email, reset code, and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Hash the provided code to compare with stored hash
    const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        email,
        token: hashedCode,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset code.' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Error resetting password.' });
  }
};

module.exports = { register, login, googleLogin, forgotPassword, resetPassword };
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    // In production, send email with resetToken
    // For now, return it in the response (REMOVE IN PRODUCTION)
    console.log(`Password reset code for ${email}: ${resetToken}`);
    
    res.json({ 
      message: 'If an account with that email exists, a password reset code has been sent.',
      // REMOVE THIS IN PRODUCTION - Only for development
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
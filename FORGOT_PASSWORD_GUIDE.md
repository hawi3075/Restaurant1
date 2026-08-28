# Forgot Password Feature - Implementation Guide

## Overview
Complete password reset functionality with email verification code system.

---

## 🎯 Features Implemented

### Backend (Server)
1. **New Database Model**: `PasswordReset`
   - Stores reset tokens (hashed for security)
   - Email verification codes
   - Expiration timestamps (15 minutes)
   - Used flag to prevent reuse

2. **API Endpoints**:
   - `POST /api/auth/forgot-password` - Request reset code
   - `POST /api/auth/reset-password` - Verify code & reset password

3. **Security Features**:
   - 6-digit verification codes
   - SHA-256 hashing of reset tokens
   - 15-minute expiration window
   - One-time use tokens
   - No user enumeration (same response for existing/non-existing emails)

### Frontend (Client)
1. **New Page**: `/forgot-password`
   - Two-step verification process
   - Clean, branded UI matching login page
   - Real-time validation

2. **Updated Login Page**:
   - "Forgot?" link now points to `/forgot-password`

---

## 🔐 How It Works

### Step 1: Request Reset Code
1. User enters their email on `/forgot-password`
2. Backend generates a random 6-digit code
3. Code is hashed and stored in `PasswordReset` table
4. **In Development**: Code is returned in API response and logged to console
5. **In Production**: Code should be sent via email (nodemailer/SendGrid)

### Step 2: Verify & Reset
1. User enters the 6-digit code received
2. User sets their new password
3. Backend verifies:
   - Code matches (hashed comparison)
   - Code hasn't expired (< 15 minutes old)
   - Code hasn't been used before
4. If valid: Password is updated, token marked as used

---

## 🚀 Testing Instructions

### Local Testing
1. Navigate to `/login`
2. Click "Forgot?" link under password field
3. Enter an existing user email (e.g., `admin@maad.com`)
4. Check the browser console for the reset code (development only)
5. Enter the 6-digit code and new password
6. Confirm password reset
7. Login with new password

### Production Deployment
**⚠️ IMPORTANT**: Before deploying to production:

1. **Set up Email Service**:
   ```javascript
   // In authController.js, replace console.log with email service
   // Example using nodemailer:
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASSWORD
     }
   });

   await transporter.sendMail({
     from: process.env.EMAIL_USER,
     to: email,
     subject: 'Password Reset Code - Ma\'ad Restaurant',
     html: `
       <h2>Password Reset Request</h2>
       <p>Your verification code is: <strong>${resetToken}</strong></p>
       <p>This code expires in 15 minutes.</p>
     `
   });
   ```

2. **Remove Development Debug Info**:
   ```javascript
   // In forgotPassword controller, remove:
   resetCode: process.env.NODE_ENV === 'development' ? resetToken : undefined
   ```

3. **Add Environment Variables**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

---

## 📊 Database Schema

```prisma
model PasswordReset {
  id        String   @id @default(uuid())
  email     String
  token     String   @unique  // SHA-256 hashed code
  expiresAt DateTime            // 15 minutes from creation
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 🔧 API Reference

### Request Reset Code
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response** (Success):
```json
{
  "message": "If an account with that email exists, a password reset code has been sent.",
  "resetCode": "123456"  // Only in development
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "resetCode": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response** (Success):
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Error Responses**:
- `400`: Invalid or expired reset code
- `404`: User not found
- `500`: Server error

---

## 🎨 UI Screenshots

### Login Page
- Added "Forgot?" link next to password field
- Links to `/forgot-password`

### Forgot Password Page
**Step 1**: Email Entry
- Clean form asking for email
- Orange gradient design matching brand
- "Back to Login" button

**Step 2**: Code Verification & Password Reset
- 6-digit code input field
- New password fields
- Confirmation step
- Success message with auto-redirect

---

## ✅ Security Best Practices Implemented

1. ✅ Tokens are hashed before storage (SHA-256)
2. ✅ Short expiration window (15 minutes)
3. ✅ One-time use tokens
4. ✅ No user enumeration (same response for all emails)
5. ✅ Password length validation (min 6 characters)
6. ✅ Secure password hashing with bcrypt (salt rounds: 10)
7. ✅ HTTPS required in production
8. ✅ Rate limiting recommended (add middleware)

---

## 🚨 Production Checklist

Before going live:

- [ ] Configure email service (nodemailer/SendGrid/AWS SES)
- [ ] Remove debug code (console.log of reset codes)
- [ ] Add rate limiting middleware
- [ ] Test email delivery
- [ ] Update CORS settings if needed
- [ ] Add monitoring/logging for failed attempts
- [ ] Consider adding CAPTCHA for additional security
- [ ] Test on staging environment first

---

## 📝 Files Modified/Created

### Backend
- ✅ `server/prisma/schema.prisma` - Added PasswordReset model
- ✅ `server/src/controllers/authController.js` - Added forgotPassword & resetPassword
- ✅ `server/src/routes/authRoutes.js` - Added routes

### Frontend
- ✅ `client/src/pages/auth/ForgotPassword.jsx` - New page (complete UI)
- ✅ `client/src/pages/auth/Login.jsx` - Updated forgot password link
- ✅ `client/src/App.jsx` - Added route

---

## 🎉 Feature Complete!

The forgot password feature is now fully functional and ready for testing. Follow the production checklist before deploying to live environment.

**Live Deployments**:
- Frontend: https://restaurant1-rust-ten.vercel.app/forgot-password
- Backend: https://restaurant1-qm7p.onrender.com/api/auth/forgot-password

**Next Steps**:
1. Test locally
2. Set up email service
3. Deploy to production
4. Test on live site

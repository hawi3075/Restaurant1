# 📧 Email Setup Guide for Forgot Password Feature

## ✅ What Was Done

1. ✅ Installed `nodemailer` package
2. ✅ Created email transporter configuration
3. ✅ Updated `authController.js` to send beautiful HTML emails
4. ✅ Added email configuration to `.env`
5. ✅ Code pushed to GitHub

---

## 🔧 Setup Instructions for Render (Production)

### Step 1: Add Environment Variables to Render

Go to your Render dashboard: https://dashboard.render.com/

1. Click on your backend service (**restaurant1-qm7p**)
2. Go to **Environment** tab
3. Add these **4 new environment variables**:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=hawig3521@gmail.com
EMAIL_PASSWORD=hojz opgn rvio aplk
NODE_ENV=production
```

**Important Notes:**
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASSWORD`: The 16-character App Password from Google (remove spaces)
  - Your app password: `hojzopgnrvioapl` (no spaces)
- `NODE_ENV=production`: This tells the system to send actual emails

### Step 2: Save and Redeploy

1. Click **Save Changes**
2. Render will automatically redeploy your backend
3. Wait 2-3 minutes for deployment to complete

---

## 📱 How the Email Feature Works Now

### Development Mode (Local)
- Sends email to user
- **Also displays the code** on the page for testing
- Logs code to server console as backup

### Production Mode (Render)
- Sends beautiful HTML email to user's inbox
- Does **NOT** display code on page (security)
- User checks their email for the code

---

## 📧 Email Preview

When a user requests password reset, they receive:

**Subject:** Password Reset Code - Ma'ad Restaurant

**Email Content:**
```
┌────────────────────────────────┐
│   🍽️ Ma'ad Restaurant          │
│   Password Reset Request       │
├────────────────────────────────┤
│                                │
│ Hello [User Name],             │
│                                │
│ We received a request to       │
│ reset your password.           │
│                                │
│ ┌──────────────────────┐       │
│ │  Your Reset Code     │       │
│ │                      │       │
│ │      1 2 3 4 5 6     │       │
│ │                      │       │
│ └──────────────────────┘       │
│                                │
│ ⏰ Important: Expires in 15min │
│                                │
│ Best regards,                  │
│ Ma'ad Restaurant Team          │
└────────────────────────────────┘
```

---

## 🧪 Testing Instructions

### Test Locally (Right Now)

1. Make sure your local `.env` has the email settings
2. Restart your local server
3. Go to `/forgot-password`
4. Enter your email: `hawig3521@gmail.com`
5. Check **both**:
   - ✅ The page (code will be displayed for testing)
   - ✅ Your Gmail inbox (real email)

### Test on Production (After Render Setup)

1. Go to: https://restaurant1-rust-ten.vercel.app/forgot-password
2. Enter any registered user email
3. Check your email inbox (and spam folder)
4. You should receive the reset code email
5. Enter the code and reset password

---

## 🔐 Gmail App Password Setup (Already Done)

You've already generated the app password: `hojz opgn rvio aplk`

But if you need to create a new one:

1. Go to Google Account: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already)
3. Go to **App Passwords**
4. Create new app password for "Mail"
5. Copy the 16-character code
6. Use it in `EMAIL_PASSWORD` (remove spaces)

---

## 📋 Checklist

- [x] Code pushed to GitHub
- [x] Gmail App Password generated
- [ ] **Add environment variables to Render** ⬅️ **DO THIS NOW!**
- [ ] Wait for Render to redeploy (2-3 minutes)
- [ ] Test on production site
- [ ] Verify email arrives in inbox

---

## 🚨 Troubleshooting

### Email not sending?

1. **Check Render logs:**
   - Go to Render dashboard
   - Click "Logs" tab
   - Look for email errors

2. **Verify App Password:**
   - Make sure it's 16 characters
   - Remove all spaces: `hojzopgnrvioapl`
   - Try regenerating if needed

3. **Check Gmail settings:**
   - Make sure "Less secure app access" is OFF (we use App Passwords instead)
   - 2-Step Verification must be ON

### Email goes to spam?

- This is normal for first-time senders
- Check spam/junk folder
- Mark as "Not Spam"
- Future emails will go to inbox

---

## 🎉 Summary

**What you need to do:**

1. Go to Render Dashboard
2. Add the 4 environment variables (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, NODE_ENV)
3. Save changes
4. Wait for redeployment
5. Test the forgot password feature!

The code is ready - you just need to add the environment variables to Render and it will work! 🚀

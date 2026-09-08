# Payment Error Fix Guide

## Current Issues

Your payment system has errors because the backend server on Render is still using `localhost` URLs for payment redirects.

## Error You're Seeing

```
❌ "The callback url must be a valid URL"
❌ POST https://backend.emerald-import-export.com/api/payments/initialize 400 (Bad Request)
```

## Root Cause

The Chapa payment gateway is receiving URLs like:
- `callback_url: http://localhost:5000/api/payments/callback/...` ❌
- `return_url: http://localhost:5173/order-success...` ❌

These should be:
- `callback_url: https://restaurant1-qm7p.onrender.com/api/payments/callback/...` ✅
- `return_url: https://maad.emerald-import-export.com/order-success...` ✅

## Solution: Update Render Environment Variables

### Step-by-Step Instructions:

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Log in with your account

2. **Select Your Backend Service**
   - Click on: **restaurant1-qm7p** (or whatever your backend service is named)

3. **Go to Environment Tab**
   - In the left sidebar, click **Environment**
   - You'll see a list of your current environment variables

4. **Add These Two Variables**
   
   Click "Add Environment Variable" button and add:
   
   **Variable 1:**
   ```
   Key: BACKEND_URL
   Value: https://restaurant1-qm7p.onrender.com
   ```
   
   **Variable 2:**
   ```
   Key: FRONTEND_URL
   Value: https://maad.emerald-import-export.com
   ```

5. **Save Changes**
   - Click **Save Changes** button at the bottom
   - Render will automatically redeploy your service (takes 2-3 minutes)

6. **Wait for Deployment**
   - Watch the "Events" tab to see deployment progress
   - Wait until you see "Deploy live" status
   - Your server will restart with the new environment variables

## Verify the Fix

After Render finishes redeploying, check the server logs:

1. Go to **Logs** tab in Render dashboard
2. Look for this line when you try to checkout:
   ```
   🔗 Payment URLs: {
     backend: 'https://restaurant1-qm7p.onrender.com',
     frontend: 'https://maad.emerald-import-export.com',
     env: 'production'
   }
   ```

3. If you see `localhost` in those URLs, the environment variables aren't set correctly.

## Test the Payment Flow

After deployment:

1. Go to: https://maad.emerald-import-export.com
2. Add an item to cart
3. Click "Checkout"
4. Fill in details and click "Proceed to Chapa"
5. You should be redirected to Chapa payment page
6. After payment, you should return to: `https://maad.emerald-import-export.com/order-success`

## What Was Changed in Code

### 1. Super Admin Theme Changed ✅
- **Before**: Purple colors (from-purple-600, bg-purple-700, etc.)
- **After**: Orange colors (from-orange-600, bg-orange-700, etc.)
- All purple colors in SuperAdminDashboard.jsx changed to orange

### 2. Payment Controller Enhanced ✅
- Added console.log to show which URLs are being used
- Improved fallback logic for production URLs
- Better environment variable handling

### 3. Environment Variables Added ✅
- `BACKEND_URL` controls callback URL for Chapa
- `FRONTEND_URL` controls return URL after payment
- These override the hardcoded defaults

## Important Notes

⚠️ **The code changes are already pushed to GitHub and deployed**

⚠️ **BUT** you must manually add the environment variables on Render - they don't deploy automatically

⚠️ **Without** the environment variables, the payment system will continue to fail

## Alternative: Check Current Backend URL

If you're not sure which backend URL to use, check your Render service:

1. Go to Render dashboard → Your service
2. Look at the top for the URL (e.g., `https://restaurant1-qm7p.onrender.com`)
3. Use that exact URL for `BACKEND_URL`

## Super Admin Login

Credentials from previous session:
- Email: `superadmin@maad.com`
- Password: `SuperAdmin@2024`
- Role: `SUPER_ADMIN`

The Super Admin dashboard now has orange theme instead of purple! 🎨

---

**Latest Commit**: efd9b77 - "Change SuperAdmin theme from purple to orange and add logging to payment URLs"

## Need Help?

If payment still doesn't work after adding environment variables:
1. Check Render logs for the "🔗 Payment URLs:" message
2. Make sure both variables are set correctly (no typos)
3. Restart your Render service manually if auto-deploy doesn't trigger

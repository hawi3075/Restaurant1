# 🚀 Render Environment Variables Setup - Visual Guide

## ⚠️ CRITICAL: Your Payment is Failing Because of Missing Environment Variables

The error you see:
```
❌ POST https://backend.emerald-import-export.com/api/payments/initialize 400
❌ Error: "The callback url must be a valid URL"
```

**This happens because Render is still using `localhost` URLs!**

---

## 📋 Step-by-Step Instructions

### Step 1: Go to Render Dashboard
1. Open your browser
2. Go to: **https://dashboard.render.com/**
3. Log in with your Render account

---

### Step 2: Find Your Backend Service
1. You'll see a list of your services
2. Look for: **restaurant1-qm7p** (or similar name for your backend)
3. Click on it

---

### Step 3: Open Environment Tab
1. On the left sidebar, find **Environment** 
2. Click on it
3. You'll see a list of your current environment variables

---

### Step 4: Add BACKEND_URL Variable
1. Scroll to the bottom
2. Click the **"Add Environment Variable"** button
3. In the **Key** field, type exactly: `BACKEND_URL`
4. In the **Value** field, type exactly: `https://restaurant1-qm7p.onrender.com`
   - ⚠️ Replace `restaurant1-qm7p` with your actual Render backend URL if different
   - ⚠️ Make sure there's NO trailing slash at the end

---

### Step 5: Add FRONTEND_URL Variable
1. Click **"Add Environment Variable"** button again
2. In the **Key** field, type exactly: `FRONTEND_URL`
3. In the **Value** field, type exactly: `https://maad.emerald-import-export.com`
   - ⚠️ Make sure there's NO trailing slash at the end

---

### Step 6: Save Changes
1. Scroll to the bottom
2. Click the blue **"Save Changes"** button
3. ✅ Render will show a message that changes are being applied

---

### Step 7: Wait for Automatic Redeploy
1. Click on the **"Events"** or **"Logs"** tab at the top
2. You'll see: "Deploying from Dash" or similar message
3. Wait 2-3 minutes
4. When you see **"Deploy live"** - your backend is ready! ✅

---

## ✅ How to Verify It's Working

### Check the Logs:
1. Go to **Logs** tab in Render
2. Look for this message (it appears when you try to checkout):
   ```
   🔗 Payment URLs: {
     backend: 'https://restaurant1-qm7p.onrender.com',
     frontend: 'https://maad.emerald-import-export.com',
     env: 'production'
   }
   ```

3. **If you see `localhost` anywhere in those URLs**, the environment variables are NOT set correctly!

---

## 🧪 Test the Payment

After Render finishes redeploying:

1. Go to: https://maad.emerald-import-export.com
2. Add an item to cart
3. Go to checkout
4. Fill in your details
5. Click **"Proceed to Chapa"**
6. ✅ You should be redirected to the Chapa payment page (not an error!)
7. Complete the payment
8. ✅ You should return to: `https://maad.emerald-import-export.com/order-success`

---

## ❓ Common Issues

### Issue 1: "I don't see the Environment tab"
- Make sure you clicked on the correct service (the **backend** service, not the frontend)
- The backend service usually has "api" or your backend name in it

### Issue 2: "What's my backend URL?"
- Look at the top of your Render service page
- You'll see a URL like: `https://restaurant1-qm7p.onrender.com`
- Use that exact URL for `BACKEND_URL`

### Issue 3: "The variables are there but payment still fails"
- Check the **Logs** tab to confirm deployment finished
- Look for the "🔗 Payment URLs:" log message
- Make sure it shows production URLs, not localhost

### Issue 4: "I added the variables but Render didn't redeploy"
- Click **"Manual Deploy"** → **"Deploy latest commit"**
- Or
- Make a small change to any file in your GitHub repo and push it

---

## 📝 Summary Checklist

Before closing this guide, make sure you:

- [ ] Logged into Render dashboard
- [ ] Found your backend service (restaurant1-qm7p)
- [ ] Opened the Environment tab
- [ ] Added `BACKEND_URL` = `https://restaurant1-qm7p.onrender.com`
- [ ] Added `FRONTEND_URL` = `https://maad.emerald-import-export.com`
- [ ] Clicked "Save Changes"
- [ ] Waited for redeploy to complete (check Logs/Events tab)
- [ ] Verified in logs that URLs are correct (not localhost)
- [ ] Tested payment on your live website

---

## 🎯 Expected Result

**Before:**
```
callback_url: http://localhost:5000/api/payments/callback/...  ❌
return_url: http://localhost:5173/order-success...  ❌
Chapa Error: "The callback url must be a valid URL"  ❌
```

**After:**
```
callback_url: https://restaurant1-qm7p.onrender.com/api/payments/callback/...  ✅
return_url: https://maad.emerald-import-export.com/order-success...  ✅
Chapa redirects to payment page  ✅
Payment completes successfully  ✅
```

---

## 🆘 Still Having Issues?

If payment still doesn't work after following ALL steps:

1. Share a screenshot of your Render Environment tab showing the two variables
2. Share a screenshot of your Render Logs showing the "🔗 Payment URLs:" message
3. I can help debug from there

---

**Remember:** The code is already perfect and deployed. You just need to add those 2 environment variables on Render! 🎯

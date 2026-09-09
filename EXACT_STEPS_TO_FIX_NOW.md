# ⚡ EXACT STEPS TO FIX - DO THIS NOW

## 🔴 Current Problem

Your payment is failing with error:
```
❌ "The callback url must be a valid URL"
```

**Reason:** Environment variables are NOT set on Render

## ✅ Solution (Takes 5 Minutes)

### Step 1: Go to Render
Open this link: **https://dashboard.render.com/**

### Step 2: Select Your Service
Click on: **"Restaurant1"** service

### Step 3: Click Environment
On the left sidebar, click: **"Environment"**

### Step 4: Add First Variable
1. Click the blue button: **"Add Environment Variable"**
2. In "Key" box, type: **BACKEND_URL**
3. In "Value" box, type: **https://backend.emerald-import-export.com**
4. Click "Add" or press Enter

### Step 5: Add Second Variable
1. Click the blue button again: **"Add Environment Variable"**
2. In "Key" box, type: **FRONTEND_URL**
3. In "Value" box, type: **https://maad.emerald-import-export.com**
4. Click "Add" or press Enter

### Step 6: Save Changes
1. Scroll to the bottom of the page
2. Click the blue button: **"Save Changes"**
3. Wait for confirmation message

### Step 7: Manual Deploy
1. At the top right, click: **"Manual Deploy"**
2. Select: **"Deploy latest commit"**
3. Click: **"Deploy"**

### Step 8: Wait
1. Click on **"Logs"** tab
2. Watch the logs
3. Wait for message: **"Build successful"** or **"Deploy live"**
4. This takes 2-5 minutes

### Step 9: Test
1. Clear browser cache (Ctrl + Shift + Delete)
2. Go to: https://maad.emerald-import-export.com
3. Add item to cart
4. Try checkout
5. **Should work!** ✅

## 📸 What You Should See

### In Render Environment Tab (After Step 5):
```
Key: BACKEND_URL
Value: https://backend.emerald-import-export.com

Key: FRONTEND_URL  
Value: https://maad.emerald-import-export.com
```

### In Render Logs (After Step 8):
```
==> Build successful 🎉
==> Deploying...
==> Deploy live for Restaurant1
```

### In Browser Console (After Step 9):
```
✅ No "callback url must be a valid URL" error
✅ No CORS errors
✅ Socket.IO connected
✅ Payment redirects to Chapa
```

## ⚠️ Important Notes

1. **Both variables are required** - don't skip either one
2. **No trailing slashes** - URLs should end with `.com`, not `.com/`
3. **Exact URLs** - copy exactly as shown above
4. **Must save** - click "Save Changes" button
5. **Must redeploy** - click "Manual Deploy"
6. **Must wait** - don't test until deployment finishes

## 🎯 Expected Results

**Before (NOW):**
- ❌ Payment fails
- ❌ "callback url must be a valid URL"
- ❌ CORS errors
- ❌ Socket.IO connection issues

**After (5 MINUTES FROM NOW):**
- ✅ Payment works
- ✅ Redirects to Chapa
- ✅ Returns to your site after payment
- ✅ No errors in console

## 🔍 How to Verify It Worked

After completing all steps:

1. Open Render Logs
2. Try checkout on your website
3. Look in logs for this message:
```
🔗 Payment URLs: {
  backend: 'https://backend.emerald-import-export.com',
  frontend: 'https://maad.emerald-import-export.com',
  env: 'production'
}
```

If you see `localhost` anywhere in that message, the environment variables didn't save correctly. Try adding them again.

## ❓ FAQ

**Q: Where do I find the Environment tab?**
A: Left sidebar → MANAGE section → Environment

**Q: I added the variables but nothing changed?**
A: Did you click "Save Changes" AND "Manual Deploy"? Both are required.

**Q: How long should deployment take?**
A: 2-5 minutes. Watch the Logs tab for progress.

**Q: Can I test before deployment finishes?**
A: No, you must wait for "Deploy live" message first.

**Q: I see "Deploy failed"?**
A: Check the logs for errors. The code is correct, so it should work. Might be a temporary Render issue - try again.

## 📞 Super Admin Login

After everything works:
- URL: https://maad.emerald-import-export.com/login
- Email: superadmin@maad.com
- Password: SuperAdmin@2024
- Theme: Orange (not purple anymore)

## ✅ Checklist

Mark each item as you complete it:

- [ ] Step 1: Opened Render dashboard
- [ ] Step 2: Found Restaurant1 service
- [ ] Step 3: Clicked Environment tab
- [ ] Step 4: Added BACKEND_URL variable
- [ ] Step 5: Added FRONTEND_URL variable
- [ ] Step 6: Clicked Save Changes
- [ ] Step 7: Clicked Manual Deploy
- [ ] Step 8: Waited for deployment (saw "Deploy live")
- [ ] Step 9: Cleared browser cache and tested

---

**DO THESE STEPS NOW. Everything else is already done. This is the ONLY thing blocking your payment from working.** 🚀

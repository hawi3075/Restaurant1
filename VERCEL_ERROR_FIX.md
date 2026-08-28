# 🔧 Fix Vercel Deployment Error

## ❌ Current Error:
```
sh: line 1: cd: client: No such file or directory
Error: Command "cd client && npm install" exited with 1
```

## ✅ Solution: Configure Root Directory

The issue is that Vercel needs to know your frontend code is in the `client` folder.

---

## 🚀 Fix in Vercel Dashboard (30 seconds)

### **Method 1: Update Project Settings (Current Deployment)**

1. **Go to Vercel Dashboard**
   - Visit: [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your project: **Restaurant1**

2. **Go to Settings**
   - Click **"Settings"** tab
   - Click **"General"** in sidebar

3. **Update Root Directory**
   - Scroll to **"Root Directory"**
   - Click **"Edit"**
   - Enter: `client`
   - Click **"Save"**

4. **Redeploy**
   - Go to **"Deployments"** tab
   - Click on latest deployment
   - Click **"..."** menu (three dots)
   - Click **"Redeploy"**
   - Wait 2-3 minutes

---

### **Method 2: Delete and Redeploy (Fresh Start)**

If Method 1 doesn't work, start fresh:

#### **Step 1: Delete Current Project**
1. Go to Vercel Dashboard
2. Select **Restaurant1** project
3. Settings → General → Delete Project
4. Confirm deletion

#### **Step 2: Import Again**
1. Click **"Add New"** → **"Project"**
2. Import your repository
3. **IMPORTANT:** In configuration:
   - **Root Directory:** Click **"Edit"** → Select **`client`** → Continue
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
   - **Install Command:** `npm install` (default)

#### **Step 3: Add Environment Variables**
Add these **one by one**:

```
VITE_API_URL=https://restaurant1-qm7p.onrender.com/api
VITE_SOCKET_URL=https://restaurant1-qm7p.onrender.com
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDujjS7c9QAYE9Cp3C4nthz0Cc_vb5bSYg
VITE_GOOGLE_CLIENT_ID=801403267793-huhti81e0s2oq2gsdtglbghue4ku35lg.apps.googleusercontent.com
```

✅ Check all three: **Production**, **Preview**, **Development**

#### **Step 4: Deploy**
Click **"Deploy"** and wait 2-3 minutes.

---

## 🎯 Expected Success Log

After fixing, you should see:

```
✓ Cloning completed in 2s
✓ Running "vercel build"
✓ Detected Vite
✓ Running "npm install"
✓ added 342 packages in 8s
✓ Running "npm run build"
✓ vite v5.0.0 building for production...
✓ ✓ 150 modules transformed.
✓ dist/index.html                   0.85 kB
✓ dist/assets/index-abc123.css      45.2 kB
✓ dist/assets/index-abc123.js      185.4 kB
✓ Build Completed in 45s
✓ Uploading build outputs
✓ Deployment Ready
```

---

## ✅ Verification

### **1. Check Deployment Status**
- Should show: **"Deployment Ready"** ✅
- Get URL: `https://your-project.vercel.app`

### **2. Test Your Site**
Visit the URL and check:
- [ ] Homepage loads
- [ ] Images appear
- [ ] No console errors (F12)
- [ ] Can navigate between pages

### **3. Test Backend Connection**
Try to login:
- Email: `admin@maad.com`
- Password: `password123`

If login works → Success! 🎉

---

## 🐛 Still Having Issues?

### **Issue: Build still fails with same error**

**Check:**
1. Root Directory is set to `client` (not `./client` or `/client`)
2. Framework is set to `Vite`
3. Try clearing build cache:
   - Settings → General → Clear Build Cache
   - Then redeploy

---

### **Issue: Build succeeds but site shows blank page**

**Solution:**
1. Check browser console (F12)
2. Look for errors
3. Verify environment variables are added
4. Check VITE_API_URL is correct

---

### **Issue: CORS errors in console**

**Solution:**
Update backend CORS:
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select **restaurant1-qm7p**
3. Environment → Add:
   ```
   CORS_ORIGIN=https://your-vercel-url.vercel.app
   ```
4. Save (service restarts automatically)

---

## 📝 Quick Checklist

Before deploying:
- [ ] Root Directory set to `client`
- [ ] Framework preset: Vite
- [ ] All 4 environment variables added
- [ ] All variables checked for Production/Preview/Development
- [ ] vercel.json updated (already done)

After deploying:
- [ ] Deployment succeeded
- [ ] Site loads without errors
- [ ] Backend CORS updated with Vercel URL
- [ ] Can login and test features

---

## 🎯 Summary

**Problem:** Vercel can't find `client` directory

**Solution:** Set Root Directory to `client` in project settings

**Steps:**
1. Settings → General → Root Directory → Edit → `client` → Save
2. Deployments → Redeploy
3. Wait 2-3 minutes
4. Test your site!

---

## 💡 Pro Tip

After successful deployment, your URLs will be:

- **Frontend:** `https://restaurant1-xyz.vercel.app`
- **Backend:** `https://restaurant1-qm7p.onrender.com`
- **Health Check:** `https://restaurant1-qm7p.onrender.com/api/health`

Don't forget to update `CORS_ORIGIN` in Render with your actual Vercel URL!

---

**Fix this in 30 seconds and your app will be live! 🚀**

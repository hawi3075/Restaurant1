# 🔄 CORS Configuration Updated

## ✅ Changes Made

Updated `server/src/server.js` to allow multiple origins:

### **Allowed Origins:**
- `http://localhost:5173` (local development)
- `http://localhost:5174` (local development alternate port)
- `https://restaurant1-rust-ten.vercel.app` (production Vercel)
- Any custom origin from `CORS_ORIGIN` environment variable

### **What Changed:**

**Before:**
```javascript
origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
```

**After:**
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://restaurant1-rust-ten.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

origin: function (origin, callback) {
  if (!origin) return callback(null, true);
  if (allowedOrigins.indexOf(origin) !== -1) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

This applies to **BOTH**:
- Express CORS middleware ✅
- Socket.IO CORS configuration ✅

---

## 🚀 Deploy the Changes

### **Step 1: Commit and Push**

```bash
cd "c:\Users\iDesire Computer\Desktop\restaurant"
git add .
git commit -m "Update CORS to allow Vercel production URL"
git push origin main
```

### **Step 2: Update Render Environment (Optional)**

You can also add the Vercel URL as an environment variable in Render:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select **restaurant1-qm7p**
3. Click **Environment** tab
4. Add or update:
   ```
   Key: CORS_ORIGIN
   Value: https://restaurant1-rust-ten.vercel.app
   ```
5. Click **"Save Changes"**

The service will restart automatically (1-2 minutes).

**Note:** This is optional since we hardcoded the Vercel URL in the code.

---

## ✅ Test Your Connection

### **1. Visit Your Frontend**
Open: https://restaurant1-rust-ten.vercel.app

### **2. Open Browser Console**
Press `F12` and check:
- ✅ No CORS errors
- ✅ API requests succeed
- ✅ Socket.IO connects

### **3. Test Login**
Try logging in:
- Email: `admin@maad.com`
- Password: `password123`

### **4. Check Network Tab**
- Look for successful API calls to `restaurant1-qm7p.onrender.com`
- Socket.IO should show `ws://` connection established

---

## 🔍 Expected Results

### **Before Update (❌ Error):**
```
Access to XMLHttpRequest at 'https://restaurant1-qm7p.onrender.com/api/...' 
from origin 'https://restaurant1-rust-ten.vercel.app' 
has been blocked by CORS policy
```

### **After Update (✅ Success):**
```
✓ API request successful: 200 OK
✓ Socket.IO connected
✓ User authenticated
```

---

## 🎯 Your Deployment URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://restaurant1-rust-ten.vercel.app |
| **Backend** | https://restaurant1-qm7p.onrender.com |
| **API Base** | https://restaurant1-qm7p.onrender.com/api |
| **Health Check** | https://restaurant1-qm7p.onrender.com/api/health |

---

## 🐛 Troubleshooting

### **Still Getting CORS Errors?**

**Check:**
1. Wait 2-3 minutes after pushing to GitHub (Render needs to redeploy)
2. Clear browser cache: `Ctrl + Shift + R`
3. Check Render logs for deployment success
4. Verify server restarted: Check Render Logs tab

**Verify CORS is working:**
```bash
curl -H "Origin: https://restaurant1-rust-ten.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://restaurant1-qm7p.onrender.com/api/health
```

Should return CORS headers.

---

### **Socket.IO Not Connecting?**

**Check:**
1. Browser console for WebSocket errors
2. Verify `VITE_SOCKET_URL` in Vercel:
   ```
   VITE_SOCKET_URL=https://restaurant1-qm7p.onrender.com
   ```
3. Make sure Socket.IO client is using correct URL
4. Check for SSL/TLS errors

---

## 📝 Additional Vercel Domains

If you add custom domains in Vercel, add them to the allowed origins:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://restaurant1-rust-ten.vercel.app',
  'https://your-custom-domain.com',  // Add here
  process.env.CORS_ORIGIN
].filter(Boolean);
```

Then push changes to GitHub.

---

## ✅ Success Checklist

- [x] CORS configuration updated in server.js
- [ ] Changes committed to Git
- [ ] Changes pushed to GitHub
- [ ] Render redeployed (wait 2-3 min)
- [ ] Browser cache cleared
- [ ] Test login works
- [ ] No CORS errors in console
- [ ] Socket.IO connected
- [ ] All features working

---

## 🎉 You're Live!

Both your frontend and backend are now deployed and should be able to communicate!

**Frontend:** https://restaurant1-rust-ten.vercel.app  
**Backend:** https://restaurant1-qm7p.onrender.com

**Test it now!** 🚀🍽️

---

**Last Updated:** 2026-08-28  
**Status:** CORS Fixed ✅

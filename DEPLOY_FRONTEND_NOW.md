# 🚀 Deploy Frontend NOW - Quick Guide

## ✅ Backend is Live!
**URL:** https://restaurant1-qm7p.onrender.com

Now let's get your frontend live in **5 minutes**!

---

## 📦 Step 1: Commit Current Changes

```bash
cd "c:\Users\iDesire Computer\Desktop\restaurant"

git add .
git commit -m "Update environment for production deployment"
git push origin main
```

---

## 🎨 Step 2: Deploy to Vercel

### **Option A: Website (Easiest - 5 minutes)**

#### 1. **Go to Vercel**
Visit: [vercel.com/new](https://vercel.com/new)

#### 2. **Sign in with GitHub**
Click **"Continue with GitHub"**

#### 3. **Import Repository**
- Find your repository
- Click **"Import"**

#### 4. **Configure Project**

**Root Directory:**
- Click **"Edit"** 
- Select **`client`** folder
- Click **"Continue"**

**Environment Variables:**
Click "Environment Variables" and add these **one by one**:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://restaurant1-qm7p.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://restaurant1-qm7p.onrender.com` |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSyDujjS7c9QAYE9Cp3C4nthz0Cc_vb5bSYg` |
| `VITE_GOOGLE_CLIENT_ID` | `801403267793-huhti81e0s2oq2gsdtglbghue4ku35lg.apps.googleusercontent.com` |

**Important:** 
- Select **all three checkboxes** (Production, Preview, Development) for each variable
- Don't add quotes around the values

#### 5. **Deploy!**
- Click **"Deploy"**
- Wait 2-3 minutes ⏱️
- Done! 🎉

You'll get a URL like: `https://restaurant-xyz.vercel.app`

---

### **Option B: Vercel CLI (For Advanced Users)**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to project
cd "c:\Users\iDesire Computer\Desktop\restaurant"

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? restaurant-app
# - Directory? client
# - Override settings? N

# Deploy to production
vercel --prod
```

---

## 🔄 Step 3: Update Backend CORS (IMPORTANT!)

After getting your Vercel URL (e.g., `https://restaurant-xyz.vercel.app`):

### **In Render Dashboard:**

1. Go to: [dashboard.render.com](https://dashboard.render.com)
2. Select service: **restaurant1-qm7p**
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   ```
   Key: CORS_ORIGIN
   Value: https://your-vercel-url.vercel.app
   ```
   ⚠️ **Use your ACTUAL Vercel URL!**
6. Click **"Save Changes"**

The service will restart automatically (takes ~1 minute).

---

## ✅ Step 4: Test Your App!

### **1. Visit Your Site**
Open: `https://your-vercel-url.vercel.app`

### **2. Test Login**
Try these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@maad.com | password123 |
| Customer | abebe@example.com | password123 |
| Chef | chef.tadesse@maad.com | password123 |

### **3. Check Browser Console**
Press `F12` and look for:
- ✅ No red errors
- ✅ API calls succeed
- ✅ Socket.IO connects

### **4. Test Features**
- [ ] Browse restaurants
- [ ] Add items to cart
- [ ] View menu details
- [ ] Check user profile
- [ ] Test on mobile (if possible)

---

## 🐛 If You See CORS Error

**Error in console:**
```
Access to XMLHttpRequest ... blocked by CORS policy
```

**Fix:**
1. Double-check `CORS_ORIGIN` in Render matches your Vercel URL **exactly**
2. No trailing slash: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`
3. Wait 1-2 minutes for Render to restart
4. Refresh your browser (Ctrl+F5)

---

## 🎯 Expected Results

### **✅ Success Looks Like:**

**Homepage loads:**
- Hero section visible
- Images load (WebP format)
- Navigation works
- Buttons clickable

**Login works:**
- Can enter credentials
- No CORS errors
- Redirects to dashboard

**API connected:**
- Restaurants load
- Food items display
- Orders can be placed

**Real-time works:**
- Socket.IO connected (check console)
- Live updates function

---

## 📊 Your Deployment URLs

After successful deployment, you'll have:

| Service | URL |
|---------|-----|
| **Frontend** | `https://your-app.vercel.app` |
| **Backend** | `https://restaurant1-qm7p.onrender.com` |
| **API Health** | `https://restaurant1-qm7p.onrender.com/api/health` |

---

## 🎉 Next Steps After Success

### **1. Share Your App**
Your app is live and ready to use!

### **2. Monitor Performance**
- Set up [UptimeRobot](https://uptimerobot.com) (free)
- Monitor both frontend and backend

### **3. Optional: Custom Domain**
In Vercel:
- Project → Settings → Domains
- Add your domain

Then update `CORS_ORIGIN` in Render to your custom domain.

### **4. Update README**
Add your live URLs to the README.md file.

---

## 💡 Pro Tips

### **Automatic Deployments**
Every time you push to GitHub:
- Vercel auto-deploys frontend
- Render auto-deploys backend

### **Preview Deployments**
Pull requests get preview URLs on Vercel - test before merging!

### **Rollback If Needed**
Vercel Dashboard → Deployments → Previous deployment → "..." → Promote to Production

---

## 📞 Need Help?

### **Quick Troubleshooting:**

1. **Build failed on Vercel:**
   - Check build logs
   - Test locally: `cd client && npm run build`
   - Fix errors and push again

2. **CORS errors:**
   - Verify `CORS_ORIGIN` in Render
   - Must match Vercel URL exactly
   - Wait for Render restart

3. **Environment variables not working:**
   - Check they're added in Vercel dashboard
   - Check all three environments selected
   - Redeploy from Vercel

### **Full Guide:**
See `VERCEL_DEPLOY.md` for complete documentation.

---

## ✅ Success Checklist

- [ ] Committed and pushed changes to GitHub
- [ ] Deployed to Vercel
- [ ] Added all environment variables
- [ ] Updated CORS_ORIGIN in Render
- [ ] Tested login
- [ ] Tested API connection
- [ ] No console errors
- [ ] Real-time features work

---

## 🎊 You're Almost Done!

**Just 3 clicks away:**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repo
3. Deploy!

**Total time:** 5 minutes

---

**Let's get your restaurant app live! 🚀🍽️**

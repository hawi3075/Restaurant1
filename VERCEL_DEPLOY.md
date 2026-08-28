# 🎨 Frontend Deployment to Vercel

## ✅ Backend Status
Your backend is successfully deployed at:
**https://restaurant1-qm7p.onrender.com**

Now let's deploy the frontend!

---

## 🚀 Quick Deploy to Vercel

### **Method 1: Using Vercel Website (Recommended)**

#### **Step 1: Sign Up / Login**
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**

#### **Step 2: Import Project**
1. Click **"Add New"** → **"Project"**
2. Click **"Import Git Repository"**
3. Find your repository: `restaurant` or your repo name
4. Click **"Import"**

#### **Step 3: Configure Project**

**Framework Preset:** Vite (should auto-detect)

**Root Directory:** `client`
- Click **"Edit"**
- Select `client` folder
- Click **"Continue"**

**Build Settings:**
- Build Command: `npm run build` (default)
- Output Directory: `dist` (default)
- Install Command: `npm install` (default)

#### **Step 4: Add Environment Variables**

Click **"Environment Variables"** and add these:

```env
VITE_API_URL=https://restaurant1-qm7p.onrender.com/api
VITE_SOCKET_URL=https://restaurant1-qm7p.onrender.com
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDujjS7c9QAYE9Cp3C4nthz0Cc_vb5bSYg
VITE_GOOGLE_CLIENT_ID=801403267793-huhti81e0s2oq2gsdtglbghue4ku35lg.apps.googleusercontent.com
```

**Important:** 
- Select **"Production"**, **"Preview"**, and **"Development"** for all variables
- Don't include quotes around values

#### **Step 5: Deploy!**
1. Click **"Deploy"**
2. Wait 2-3 minutes ⏱️
3. Your site will be live! 🎉

You'll get a URL like: `https://your-project-name.vercel.app`

---

### **Method 2: Using Vercel CLI**

#### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

#### **Step 2: Login**
```bash
vercel login
```

#### **Step 3: Deploy**
```bash
# Navigate to project root
cd "c:\Users\iDesire Computer\Desktop\restaurant"

# Deploy
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** restaurant-app (or your choice)
- **Directory?** `client`
- **Override settings?** No

#### **Step 4: Deploy to Production**
```bash
vercel --prod
```

---

## 🔄 Update Backend CORS

After you get your Vercel URL (e.g., `https://restaurant-app-xyz.vercel.app`), update your backend:

### **In Render Dashboard:**
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Select your service: **restaurant1-qm7p**
3. Click **"Environment"** tab
4. Add new environment variable:
   ```
   Key: CORS_ORIGIN
   Value: https://your-vercel-url.vercel.app
   ```
5. Click **"Save Changes"**
6. Service will automatically restart

---

## ✅ Verify Deployment

### **1. Check Frontend**
Visit your Vercel URL: `https://your-app.vercel.app`

### **2. Test Backend Connection**
Open browser console (F12) and check for:
- ✅ No CORS errors
- ✅ API requests succeed
- ✅ Socket.IO connects

### **3. Test Full Flow**
1. Try to login: `admin@maad.com` / `password123`
2. Browse restaurants
3. Add items to cart
4. Place test order
5. Check if real-time updates work

---

## 🐛 Troubleshooting

### **Issue: CORS Error**

**Browser Console Shows:**
```
Access to XMLHttpRequest at 'https://restaurant1-qm7p.onrender.com/api/...' 
from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

**Solution:**
1. Go to Render dashboard
2. Add/Update `CORS_ORIGIN` environment variable to your exact Vercel URL
3. Make sure there's no trailing slash: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`
4. Service will auto-restart

---

### **Issue: Environment Variables Not Working**

**Solution:**
1. Go to Vercel dashboard
2. Project → Settings → Environment Variables
3. Make sure all variables are added
4. Make sure they're selected for Production, Preview, and Development
5. Redeploy: Deployments → Click "..." → Redeploy

---

### **Issue: Build Failed**

**Check Build Logs:**
1. Vercel dashboard → Deployments
2. Click on failed deployment
3. Check logs for errors

**Common Causes:**
- Missing dependencies in package.json
- TypeScript errors
- Import errors
- Missing environment variables

**Solution:**
```bash
# Test build locally first
cd client
npm install
npm run build
```

Fix any errors, then push to GitHub.

---

### **Issue: Images Not Loading**

**Solution:**
Make sure all images are in `client/public/` folder:
```
client/public/
├── m1.webp
├── m7.webp
├── m8.webp
├── mg1.webp
├── mg2.webp
└── mg3.webp
```

Commit and push if missing:
```bash
git add client/public/
git commit -m "Add public images"
git push
```

---

## 📝 Post-Deployment Checklist

After successful deployment:

### **1. Update README.md**
Add your live URLs:
```markdown
## 🌐 Live Deployment

- **Frontend:** https://your-app.vercel.app
- **Backend API:** https://restaurant1-qm7p.onrender.com
- **API Health:** https://restaurant1-qm7p.onrender.com/api/health
```

### **2. Test All Features**
- [ ] Homepage loads
- [ ] User registration
- [ ] User login (all roles)
- [ ] Browse restaurants
- [ ] View menu items
- [ ] Add to cart
- [ ] Checkout process
- [ ] Order placement
- [ ] Real-time order updates
- [ ] Chef dashboard
- [ ] Waiter dashboard
- [ ] Driver dashboard
- [ ] Admin dashboard

### **3. Test on Mobile**
- [ ] Responsive design
- [ ] Touch interactions
- [ ] Images load
- [ ] Forms work
- [ ] Navigation works

### **4. Check Performance**
- [ ] Page load time < 3 seconds
- [ ] Images optimized (WebP format ✅)
- [ ] No console errors
- [ ] API responses fast

---

## 🔐 Security Updates

### **Update Google OAuth Redirect URIs**

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth client
3. Add Authorized redirect URIs:
   ```
   https://your-app.vercel.app
   https://your-app.vercel.app/auth/callback
   ```
4. Save changes

### **Update Chapa Webhook URL** (if using payments)

1. Go to Chapa dashboard
2. Update webhook URL to:
   ```
   https://restaurant1-qm7p.onrender.com/api/payments/chapa/webhook
   ```

---

## 🎯 Custom Domain (Optional)

### **Add Custom Domain to Vercel:**

1. Go to Vercel dashboard
2. Project → Settings → Domains
3. Click **"Add"**
4. Enter your domain: `yourdomain.com`
5. Follow DNS configuration instructions

### **Update Backend CORS:**
```env
CORS_ORIGIN=https://yourdomain.com
```

---

## 📊 Monitoring & Analytics

### **Set Up Monitoring:**

1. **Uptime Monitoring:** [UptimeRobot](https://uptimerobot.com)
   - Monitor: `https://your-app.vercel.app`
   - Monitor: `https://restaurant1-qm7p.onrender.com/api/health`

2. **Error Tracking:** [Sentry](https://sentry.io)
   ```bash
   npm install @sentry/react
   ```

3. **Analytics:** [Google Analytics](https://analytics.google.com)
   - Add tracking code to `index.html`

---

## 🔄 Continuous Deployment

### **Automatic Deployments:**

**Vercel** automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will:
1. Detect the push
2. Build the frontend
3. Deploy automatically
4. Send you a notification

**Preview Deployments:**
- Every pull request gets a preview URL
- Test changes before merging

---

## 💡 Pro Tips

### **1. Environment-Specific URLs**

Create separate environments:

**Production (.env.production):**
```env
VITE_API_URL=https://restaurant1-qm7p.onrender.com/api
```

**Development (.env.development):**
```env
VITE_API_URL=http://localhost:5000/api
```

### **2. Optimize Build**

Add to `client/vite.config.js`:
```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
}
```

### **3. Cache Static Assets**

Vercel automatically caches static files with optimal headers.

---

## 📞 Need Help?

### **Vercel Support:**
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Support: support@vercel.com

### **Common Resources:**
- Vercel + Vite: https://vercel.com/docs/frameworks/vite
- Environment Variables: https://vercel.com/docs/projects/environment-variables
- Custom Domains: https://vercel.com/docs/custom-domains

---

## ✅ Success Checklist

- [ ] Frontend deployed to Vercel
- [ ] Environment variables added
- [ ] Backend CORS updated
- [ ] Can login to application
- [ ] Can place orders
- [ ] Real-time features work
- [ ] Mobile-responsive
- [ ] No console errors
- [ ] Images load correctly
- [ ] API calls succeed
- [ ] Socket.IO connects
- [ ] All user roles work

---

## 🎉 You're Live!

Your restaurant management system is now fully deployed:

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://restaurant1-qm7p.onrender.com`

**Next Steps:**
1. Share the URL with users
2. Monitor for errors
3. Gather feedback
4. Iterate and improve

---

**Congratulations! Your app is now serving customers worldwide! 🍽️🎊**

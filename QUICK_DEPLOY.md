# 🚀 Quick Deploy in 15 Minutes

The fastest way to get your Restaurant Order Management System live.

## Prerequisites (5 minutes)

1. **Create Accounts** (all free):
   - [GitHub](https://github.com/signup) - to host your code
   - [Vercel](https://vercel.com/signup) - for frontend
   - [Render](https://render.com/register) - for backend & database

2. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/restaurant-app.git
   git push -u origin main
   ```

---

## Step 1: Deploy Database (2 minutes) 🗄️

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Settings:
   - **Name:** `restaurant-db`
   - **Database:** `restaurant_db`
   - **Region:** Oregon (Free)
   - **Plan:** Free
4. Click **"Create Database"**
5. **Copy the "Internal Database URL"** - you'll need this!

---

## Step 2: Deploy Backend (5 minutes) 🔧

1. Still in Render, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:

   **Basic:**
   - Name: `restaurant-backend`
   - Region: Oregon (Free)
   - Branch: `main`
   - Root Directory: `server`
   - Runtime: Node

   **Build & Deploy:**
   - Build Command:
     ```
     npm ci && npm run build
     ```
   - Start Command:
     ```
     npm start
     ```

4. **Add Environment Variables:**
   ```
   DATABASE_URL=<paste your Internal Database URL from Step 1>
   JWT_SECRET=MySuper$ecretKey123!ChangeThis
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://your-app-name.vercel.app
   ```
   
   *Note: You'll update CORS_ORIGIN after Step 3*

5. Click **"Create Web Service"** (takes ~3 minutes)

6. **Copy your backend URL** (looks like: `https://restaurant-backend-xxxx.onrender.com`)

7. **Seed the database:**
   - Go to your service → **"Shell"** tab
   - Run:
     ```bash
     node prisma/seed.js
     ```

---

## Step 3: Deploy Frontend (3 minutes) 🎨

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:

   **Project Settings:**
   - Framework Preset: **Vite**
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   ```
   
   *Replace with your actual backend URL from Step 2*

6. Click **"Deploy"** (takes ~2 minutes)

7. **Copy your frontend URL** (looks like: `https://your-app-name.vercel.app`)

---

## Step 4: Update Backend CORS (1 minute) 🔄

1. Go back to Render dashboard
2. Open your backend service
3. Go to **"Environment"** tab
4. Update `CORS_ORIGIN` variable:
   ```
   CORS_ORIGIN=https://your-app-name.vercel.app
   ```
   *Use your actual Vercel URL from Step 3*

5. Service will auto-redeploy (~2 minutes)

---

## Step 5: Test Your App! ✅

1. Visit your Vercel URL: `https://your-app-name.vercel.app`

2. **Test Login** with these accounts:
   
   | Role | Email | Password |
   |------|-------|----------|
   | Admin | admin@maad.com | password123 |
   | Customer | abebe@example.com | password123 |
   | Chef | chef.tadesse@maad.com | password123 |

3. **Check Health:**
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - Should show: `{"status":"ok","message":"ROMS Server is running"}`

---

## 🎉 You're Live!

Your restaurant app is now deployed and accessible worldwide!

**Your URLs:**
- **Customer App:** `https://your-app-name.vercel.app`
- **Backend API:** `https://your-backend-url.onrender.com/api`

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Check CORS_ORIGIN in Render matches your Vercel URL exactly
- Check VITE_API_URL in Vercel has `/api` at the end
- Wait 2-3 minutes for services to fully start

### "Database connection failed"
- Verify DATABASE_URL in Render is correct
- Check database is running in Render dashboard

### "Page not loading"
- Check Vercel deployment logs for errors
- Verify build completed successfully

### "Socket.IO not working"
- Check VITE_SOCKET_URL matches backend URL (without /api)
- Make sure backend CORS allows your frontend domain

---

## 💰 Cost Breakdown

**Free Tier Limits:**
- **Render Backend:** 750 hours/month (sleeps after 15min idle)
- **Render Database:** 90 days, then $7/month
- **Vercel Frontend:** 100GB bandwidth/month

**To avoid sleep delay**, upgrade Render to Starter plan: **$7/month**

---

## 🔄 Update Your App

After making code changes:

```bash
git add .
git commit -m "Your update message"
git push
```

Both Vercel and Render will auto-deploy!

---

## 📱 Next Steps

1. **Custom Domain** (optional):
   - Vercel: Settings → Domains → Add
   - Render: Settings → Custom Domain

2. **Email Setup** for notifications

3. **Payment Gateway** (Chapa, TeleBirr)

4. **Google Maps API** for location features

5. **Monitoring** with UptimeRobot (free)

---

## 🆘 Need More Help?

- 📖 Full guide: See `DEPLOYMENT_GUIDE.md`
- ✅ Checklist: See `DEPLOYMENT_CHECKLIST.md`
- 📧 Issues: Check Render/Vercel logs first

**Remember:**
- First deploy on Render takes 5-10 minutes
- Free tier sleeps after 15min idle (30-60s wake time)
- All URLs use HTTPS automatically
- Environment variables require redeploy to take effect

Good luck! 🚀

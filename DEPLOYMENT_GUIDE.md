# 🚀 Restaurant Order Management System - Deployment Guide

## Quick Deployment Options Comparison

| Platform | Best For | Cost | Difficulty | Setup Time |
|----------|----------|------|------------|------------|
| **Vercel + Render** | Beginners, MVPs | Free/$7/mo | ⭐ Easy | 15 min |
| **Railway** | Full-stack simplicity | $5/mo | ⭐ Easy | 10 min |
| **DigitalOcean** | Production apps | $12/mo | ⭐⭐ Medium | 30 min |
| **AWS** | Enterprise scale | $30+/mo | ⭐⭐⭐ Hard | 2+ hours |
| **VPS (Self-hosted)** | Full control | $5/mo | ⭐⭐⭐ Hard | 1+ hour |

---

## 🎯 Recommended: Vercel + Render (Free Tier)

This is the **easiest and free** option for getting started.

### Prerequisites
- GitHub account
- Vercel account (free)
- Render account (free)

---

## 📦 Step 1: Prepare Your Code

### 1.1 Update Server CORS for Production

Your server needs to accept requests from your frontend domain. The CORS is currently set to `*` (allow all), which works but isn't secure for production.

**File:** `server/src/server.js`

Update the CORS configuration:

```javascript
// Replace this line:
app.use(cors());

// With this (for production):
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Also update Socket.IO CORS:
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});
```

### 1.2 Add Build Script for Production

**File:** `server/package.json`

Add this script:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "build": "npx prisma generate",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:seed": "node prisma/seed.js",
  "db:reset": "prisma db push --force-reset && npm run db:seed"
}
```

### 1.3 Create .gitignore (if not exists)

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment files
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/
out/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store
*.swp
*.swo
.vscode/
.idea/

# Database
*.db
*.sqlite

# Uploads
uploads/*
!uploads/.gitkeep
```

### 1.4 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Restaurant Order Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/restaurant-app.git
git push -u origin main
```

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Go to Vercel

1. Visit [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import your repository

### 2.2 Configure Build Settings

- **Framework Preset:** Vite
- **Root Directory:** `client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 2.3 Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com/api
VITE_SOCKET_URL=https://YOUR-BACKEND-URL.onrender.com
```

**Note:** You'll get the backend URL from Render (next step). You can add this later.

### 2.4 Deploy

Click **"Deploy"** and wait ~2 minutes.

Your frontend will be live at: `https://your-app.vercel.app`

---

## 🔧 Step 3: Deploy Backend to Render

### 3.1 Create PostgreSQL Database

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Name: `restaurant-db`
4. Database: `restaurant_db`
5. User: (auto-generated)
6. Region: Choose closest to your users
7. Plan: **Free** (or Starter for production)
8. Click **"Create Database"**

**Save these details:**
- Internal Database URL (for your backend)
- External Database URL (if you need to connect locally)

### 3.2 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:

**Name:** `restaurant-backend`

**Root Directory:** `server`

**Environment:** `Node`

**Region:** Same as database

**Branch:** `main`

**Build Command:**
```bash
npm install && npx prisma generate && npx prisma db push
```

**Start Command:**
```bash
npm start
```

### 3.3 Add Environment Variables

Click **"Environment"** tab and add:

```
DATABASE_URL=<paste-internal-database-url-from-step-3.1>
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GEMINI_API_KEY=your-gemini-api-key
```

**Important:** 
- Replace `your-app.vercel.app` with your actual Vercel domain
- Generate a strong JWT_SECRET: `openssl rand -base64 32`

### 3.4 Deploy

Click **"Create Web Service"** and wait ~5 minutes.

Your backend will be live at: `https://restaurant-backend-xxxx.onrender.com`

### 3.5 Seed the Database

After deployment, run these commands in Render's Shell:

1. Go to your web service
2. Click **"Shell"** tab
3. Run:

```bash
npx prisma db push
node prisma/seed.js
```

---

## 🔄 Step 4: Update Frontend with Backend URL

1. Go back to Vercel
2. Open your project
3. Go to **Settings** → **Environment Variables**
4. Update:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

5. Go to **Deployments** tab
6. Click **"Redeploy"** on the latest deployment

---

## ✅ Step 5: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try to login with test accounts:
   - Admin: `admin@maad.com` / `password123`
   - Customer: `abebe@example.com` / `password123`
   - Chef: `chef.tadesse@maad.com` / `password123`

### Check Health:
- Backend health: `https://your-backend.onrender.com/api/health`
- Should return: `{"status":"ok","message":"ROMS Server is running"}`

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check CORS_ORIGIN in backend environment variables
- Check VITE_API_URL in frontend environment variables
- Make sure both URLs are HTTPS

### Database connection failed
- Check DATABASE_URL is correct (use Internal URL from Render)
- Make sure database is running on Render

### Socket.IO not working
- Check VITE_SOCKET_URL matches backend URL
- Check Socket.IO CORS origin in server.js

### 502 Bad Gateway on Render
- Check build logs for errors
- Make sure `npm start` works locally
- Check all environment variables are set

---

## 🚀 Alternative: Deploy to Railway (Simpler)

Railway is simpler because it handles both frontend and backend together.

### Step 1: Setup Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository

### Step 2: Add PostgreSQL

1. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway automatically sets `DATABASE_URL`

### Step 3: Configure Backend Service

1. Click on your service
2. Go to **Settings** → **Root Directory** → `server`
3. Add environment variables:

```
JWT_SECRET=your-secret-key
NODE_ENV=production
CORS_ORIGIN=${{RAILWAY_PUBLIC_DOMAIN}}
GEMINI_API_KEY=your-gemini-key
```

4. **Build Command:**
```bash
npm install && npx prisma generate && npx prisma db push
```

5. **Start Command:** `npm start`

### Step 4: Configure Frontend Service

1. Click **"+ New"** → **"GitHub Repo"** → Select same repo
2. Settings:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Start Command:** `npx serve dist -l $PORT`

3. Add environment variables:
```
VITE_API_URL=https://${BACKEND_RAILWAY_DOMAIN}/api
```

### Step 5: Enable Public Domains

1. Go to each service
2. Click **Settings** → **Networking** → **Generate Domain**

Done! Your app is live.

---

## 💰 Cost Estimates

### Free Tier (Hobby Projects)
- **Vercel:** Free (100GB bandwidth/month)
- **Render:** Free tier (750 hours/month, sleeps after 15min inactivity)
- **Total:** $0/month (with limitations)

### Starter (Small Business)
- **Vercel:** Free
- **Render Web Service:** $7/month
- **Render PostgreSQL:** $7/month
- **Total:** ~$14/month

### Production (Growing Business)
- **Vercel Pro:** $20/month
- **Render Starter:** $7/month
- **Render PostgreSQL:** $15/month (1GB RAM)
- **Total:** ~$42/month

---

## 🔐 Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Update CORS to specific domain (not `*`)
- [ ] Enable HTTPS only
- [ ] Add rate limiting
- [ ] Sanitize user inputs
- [ ] Update Google OAuth redirect URIs
- [ ] Set up database backups
- [ ] Add monitoring/logging
- [ ] Review API permissions

---

## 📊 Post-Deployment Monitoring

### Add these services:

1. **Uptime Monitoring:** [UptimeRobot](https://uptimerobot.com) (Free)
2. **Error Tracking:** [Sentry](https://sentry.io) (Free tier)
3. **Analytics:** [Google Analytics](https://analytics.google.com) (Free)
4. **Database Backups:** Render automatic backups (Paid plans)

---

## 🎉 Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Set up custom domain (optional)
3. ✅ Configure email service for notifications
4. ✅ Set up payment gateway (Chapa, TeleBirr)
5. ✅ Add monitoring and alerts
6. ✅ Plan for scaling (CDN, caching)
7. ✅ Document admin procedures
8. ✅ Train staff on the system

---

## 📞 Need Help?

- Check deployment logs for errors
- Test locally first: `npm run dev`
- Verify environment variables
- Check database connection
- Review CORS settings

Good luck with your deployment! 🚀

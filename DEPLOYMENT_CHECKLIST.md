# 📋 Pre-Deployment Checklist

Use this checklist before deploying your Restaurant Order Management System.

## ✅ Code Preparation

- [ ] All code pushed to GitHub/GitLab
- [ ] `.env` files are in `.gitignore` (never commit secrets!)
- [ ] `.env.example` files are up to date
- [ ] All dependencies are in `package.json`
- [ ] Application runs locally without errors
- [ ] Build process completes successfully (`npm run build`)

## ✅ Database Setup

- [ ] PostgreSQL database created on hosting platform
- [ ] DATABASE_URL environment variable configured
- [ ] Prisma schema is up to date
- [ ] Database can be seeded with test data
- [ ] Backup strategy planned

## ✅ Environment Variables

### Backend (.env)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Strong random secret (32+ characters)
- [ ] `PORT` - 5000 or platform default
- [ ] `NODE_ENV` - Set to "production"
- [ ] `CORS_ORIGIN` - Your frontend URL (e.g., https://yourapp.vercel.app)
- [ ] `GEMINI_API_KEY` - Google AI API key (if using chatbot)
- [ ] `GOOGLE_CLIENT_ID` - OAuth client ID (if using Google login)

### Frontend (.env)
- [ ] `VITE_API_URL` - Backend API URL with /api (e.g., https://api.yourapp.com/api)
- [ ] `VITE_SOCKET_URL` - Backend URL for WebSocket (e.g., https://api.yourapp.com)
- [ ] `VITE_GOOGLE_MAPS_API_KEY` - Google Maps key (optional)
- [ ] `VITE_GOOGLE_TRANSLATE_API_KEY` - Translation key (optional)

## ✅ Security Configuration

- [ ] CORS configured for specific origin (not "*")
- [ ] JWT_SECRET is strong and unique (use `openssl rand -base64 32`)
- [ ] All passwords changed from defaults
- [ ] SQL injection protection verified (Prisma handles this)
- [ ] XSS protection in place
- [ ] Rate limiting considered for API endpoints
- [ ] HTTPS enforced (hosting platforms usually handle this)

## ✅ Build Configuration

### Frontend (Vercel/Netlify)
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Node version: 18 or higher
- [ ] Root directory: `client`

### Backend (Render/Railway/Heroku)
- [ ] Build command: `npm install && npx prisma generate && npx prisma db push`
- [ ] Start command: `npm start`
- [ ] Node version: 18 or higher
- [ ] Root directory: `server`
- [ ] Health check endpoint: `/api/health`

## ✅ Testing

- [ ] Test login/signup flows
- [ ] Test all user roles (Customer, Admin, Chef, Waiter, Driver)
- [ ] Test order creation and status updates
- [ ] Test real-time features (Socket.IO)
- [ ] Test payment flows (if integrated)
- [ ] Test on mobile devices
- [ ] Test in different browsers
- [ ] Load testing for expected traffic

## ✅ Third-Party Services

- [ ] Google Maps API key configured and quota checked
- [ ] Google OAuth credentials configured (redirect URIs updated)
- [ ] Google Gemini AI API key configured
- [ ] Payment gateway configured (Chapa, TeleBirr)
- [ ] Email service configured (if sending emails)
- [ ] SMS service configured (if sending notifications)

## ✅ Monitoring & Logging

- [ ] Error tracking set up (Sentry, Rollbar)
- [ ] Uptime monitoring configured (UptimeRobot, Pingdom)
- [ ] Log aggregation in place
- [ ] Performance monitoring enabled
- [ ] Database monitoring enabled

## ✅ Documentation

- [ ] README.md updated with deployment URLs
- [ ] API documentation available
- [ ] Admin user guide created
- [ ] Staff training materials prepared
- [ ] Support contact information documented

## ✅ Post-Deployment

- [ ] Verify all pages load correctly
- [ ] Test all critical user flows
- [ ] Check real-time features work
- [ ] Verify database connections
- [ ] Test from different locations
- [ ] Monitor error logs for first 24 hours
- [ ] Set up automated backups
- [ ] Configure CI/CD for future updates

## 🚨 Emergency Contacts

**Hosting Providers:**
- Frontend: _______________
- Backend: _______________
- Database: _______________

**Domain Registrar:** _______________

**Support Email:** _______________

**Developer Contact:** _______________

## 📊 Performance Baselines

After deployment, record these for monitoring:

- [ ] Homepage load time: _____ seconds
- [ ] API response time: _____ ms
- [ ] Database query time: _____ ms
- [ ] Time to first order: _____ seconds
- [ ] Concurrent users supported: _____

## 🔄 Rollback Plan

- [ ] Keep previous deployment running until new deployment is verified
- [ ] Have database backup before migration
- [ ] Document rollback procedure
- [ ] Test rollback process in staging

---

## Quick Command Reference

### Generate Strong JWT Secret
```bash
openssl rand -base64 32
```

### Test Backend Health
```bash
curl https://your-backend.com/api/health
```

### Check Database Connection
```bash
npx prisma db pull
```

### View Backend Logs (Render)
```bash
# Go to Dashboard → Your Service → Logs
```

### Redeploy Frontend (Vercel)
```bash
vercel --prod
```

---

**Last Updated:** _______________

**Deployed By:** _______________

**Deployment Date:** _______________

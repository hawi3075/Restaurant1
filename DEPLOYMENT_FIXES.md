# 🔧 Deployment Error Fixes

## Common Deployment Errors & Solutions

---

## ✅ **FIXED: Prisma Permission Denied Error**

### Error Message:
```
sh: 1: prisma: Permission denied
==> Build failed 😞
```

### Root Cause:
Prisma was in `devDependencies` instead of `dependencies`, so it wasn't available during production builds on Render/Railway.

### Solution Applied:
1. ✅ Moved `prisma` from `devDependencies` to `dependencies`
2. ✅ Added `"build": "prisma generate"` script
3. ✅ Added `"postinstall": "prisma generate"` script (auto-runs after npm install)
4. ✅ Updated build command to use `npm run build`

### Updated Configuration:

**package.json:**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "build": "prisma generate",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "prisma": "^5.10.0",
    "@prisma/client": "^5.10.0",
    // ... other deps
  }
}
```

**Render Build Command:**
```bash
npm install && npm run build
```

The `postinstall` script ensures Prisma generates the client automatically after every `npm install`, making it work seamlessly on all platforms.

---

## 🚀 **Other Common Deployment Errors**

### 1. **Database Connection Failed**

**Error:**
```
Error: Can't reach database server
P1001: Can't reach database server at `...`
```

**Solutions:**
- ✅ Check DATABASE_URL is correct (use Internal URL on Render)
- ✅ Verify database is running
- ✅ Check firewall/network settings
- ✅ Ensure SSL mode is correct: `?sslmode=require`

**Example DATABASE_URL:**
```
postgresql://user:password@host.region.render.com:5432/dbname?sslmode=require
```

---

### 2. **Environment Variables Not Found**

**Error:**
```
JWT_SECRET is not defined
CORS_ORIGIN is not defined
```

**Solutions:**
- ✅ Add all environment variables in Render dashboard
- ✅ Check for typos in variable names
- ✅ Restart service after adding variables
- ✅ Don't use quotes in Render UI (they're added automatically)

**Required Variables:**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
PORT=5000
```

---

### 3. **Module Not Found**

**Error:**
```
Error: Cannot find module '@prisma/client'
Error: Cannot find module 'express'
```

**Solutions:**
- ✅ Ensure all dependencies are in `dependencies` (not `devDependencies`)
- ✅ Clear build cache and redeploy
- ✅ Check package.json is committed to Git
- ✅ Run `npm install` locally to verify

---

### 4. **Port Already in Use**

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
- ✅ Use `process.env.PORT` in your code:
  ```javascript
  const PORT = process.env.PORT || 5000;
  ```
- ✅ Don't hardcode port numbers
- ✅ Render assigns port automatically via PORT env var

---

### 5. **CORS Errors in Production**

**Error (Browser Console):**
```
Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy
```

**Solutions:**
- ✅ Update CORS_ORIGIN to match your frontend URL exactly
- ✅ Don't use `*` in production
- ✅ Include https:// in the URL
- ✅ No trailing slash

**Correct CORS Config:**
```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
```

---

### 6. **Socket.IO Not Connecting**

**Error:**
```
WebSocket connection failed
Socket.IO transport error
```

**Solutions:**
- ✅ Update Socket.IO CORS to match frontend URL
- ✅ Ensure VITE_SOCKET_URL is correct (without /api)
- ✅ Check if WebSocket is enabled on hosting platform
- ✅ Use https:// (not http://) in production

**Socket.IO Config:**
```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});
```

---

### 7. **Build Timeout**

**Error:**
```
Build exceeded maximum time limit
```

**Solutions:**
- ✅ Optimize dependencies (remove unused packages)
- ✅ Use `npm ci` instead of `npm install` for faster installs
- ✅ Upgrade to paid plan for longer build times
- ✅ Split frontend and backend deployments

---

### 8. **Database Migration Failed**

**Error:**
```
Migration engine error
Schema migration failed
```

**Solutions:**
- ✅ Use `npx prisma db push` (not migrate) for initial deployment
- ✅ Run migrations manually in Render shell first
- ✅ Check database permissions
- ✅ Ensure DATABASE_URL has correct credentials

**Manual Migration:**
```bash
# In Render Shell
npx prisma db push
node prisma/seed.js
```

---

### 9. **Static Files Not Found (404)**

**Error:**
```
GET /uploads/image.jpg 404 Not Found
```

**Solutions:**
- ✅ Ensure `uploads` directory exists
- ✅ Configure persistent storage (Render Disks)
- ✅ Use cloud storage (AWS S3, Cloudinary) for user uploads
- ✅ Don't rely on local filesystem in serverless/container environments

---

### 10. **Memory/CPU Limits Exceeded**

**Error:**
```
Service exceeded memory limit
Container was OOM killed
```

**Solutions:**
- ✅ Optimize database queries
- ✅ Add pagination to large data fetches
- ✅ Implement caching
- ✅ Upgrade to higher plan
- ✅ Monitor with console.log to find memory leaks

---

## 🔍 **Debugging Checklist**

When deployment fails:

1. **Check Build Logs**
   - Read error messages carefully
   - Look for the first error (not the last)
   - Check for typos in commands

2. **Verify Environment Variables**
   - All required variables set
   - No typos in variable names
   - Values are correct (URLs, secrets, etc.)

3. **Test Locally First**
   - Run `npm install && npm run build && npm start`
   - Test with production-like environment variables
   - Check if it works on your machine

4. **Check Service Status**
   - Is the database running?
   - Is the service actually deployed?
   - Check platform status page

5. **Review Recent Changes**
   - What changed since last successful deployment?
   - Did you add new dependencies?
   - Did you change environment variables?

---

## 🛠️ **Platform-Specific Commands**

### Render

**View Logs:**
- Dashboard → Service → Logs tab

**Run Shell Commands:**
- Dashboard → Service → Shell tab
```bash
# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database
node prisma/seed.js

# Check environment
env | grep DATABASE_URL
```

**Restart Service:**
- Dashboard → Service → Manual Deploy → Deploy latest commit

---

### Railway

**View Logs:**
```bash
railway logs
```

**Run Commands:**
```bash
railway run npx prisma db push
railway run node prisma/seed.js
```

**Environment Variables:**
```bash
railway variables set DATABASE_URL="postgresql://..."
railway variables list
```

---

### Vercel (Frontend)

**View Logs:**
- Dashboard → Project → Deployments → Click deployment → Logs

**Redeploy:**
```bash
vercel --prod
```

**Environment Variables:**
- Dashboard → Project → Settings → Environment Variables

---

## 📞 **Getting Help**

### Before Asking for Help:

1. ✅ Read the full error message
2. ✅ Check deployment logs
3. ✅ Verify environment variables
4. ✅ Test locally
5. ✅ Search the error on Google/Stack Overflow

### Where to Get Help:

- **Render:** https://community.render.com
- **Railway:** https://discord.gg/railway
- **Vercel:** https://vercel.com/support
- **Stack Overflow:** Tag with platform name + error
- **GitHub Issues:** Check if others have same issue

---

## ✅ **Post-Fix Verification**

After fixing deployment errors:

- [ ] Service deployed successfully
- [ ] Health check endpoint responds: `/api/health`
- [ ] Frontend can connect to backend
- [ ] Database queries work
- [ ] Socket.IO connects
- [ ] User authentication works
- [ ] Images/static files load
- [ ] No errors in browser console
- [ ] No errors in server logs

---

## 📝 **Prevention Tips**

**To avoid deployment errors:**

1. **Test locally with production settings**
   ```bash
   NODE_ENV=production npm start
   ```

2. **Keep dependencies updated**
   ```bash
   npm outdated
   npm update
   ```

3. **Use environment variables for everything**
   - Never hardcode URLs, secrets, or ports

4. **Validate before deploying**
   - Run build locally: `npm run build`
   - Check for TypeScript/linting errors
   - Test all critical paths

5. **Monitor your deployments**
   - Set up uptime monitoring
   - Check logs regularly
   - Configure error alerts

---

## 🎯 **Current Status**

✅ **Fixed Issues:**
- Prisma permission denied error
- Build command optimized
- Dependencies configured correctly

🚀 **Ready to Deploy:**
- Commit changes: `git add . && git commit -m "Fix Prisma deployment error"`
- Push to GitHub: `git push`
- Render will auto-deploy
- Check logs for success

---

**Last Updated:** 2026-08-27  
**Status:** Deployment issues resolved ✅

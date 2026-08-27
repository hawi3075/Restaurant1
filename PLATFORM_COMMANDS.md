# 🛠️ Platform-Specific Deployment Commands

Quick reference for deploying to different platforms.

---

## 🟢 Vercel (Frontend)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy from Command Line
```bash
# First time
cd client
vercel

# Production deployment
vercel --prod

# With custom settings
vercel --build-env VITE_API_URL=https://your-api.com/api
```

### Environment Variables via CLI
```bash
vercel env add VITE_API_URL production
vercel env add VITE_SOCKET_URL production
```

### View Logs
```bash
vercel logs <deployment-url>
```

---

## 🟣 Render (Backend + Database)

### Using Blueprint (render.yaml)
1. Push `render.yaml` to your repo
2. Go to Render Dashboard
3. Click "New" → "Blueprint"
4. Connect repository
5. Render reads `render.yaml` and creates all services

### Manual PostgreSQL Connection String
```bash
# From Render Dashboard → Database → Connections
postgresql://user:password@host.region.render.com:5432/database
```

### View Logs
```bash
# Go to Dashboard → Service → Logs tab
# Or use API:
curl https://api.render.com/v1/services/YOUR_SERVICE_ID/logs \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Run Shell Commands
```bash
# From Dashboard → Service → Shell tab
# Or use SSH:
ssh-keygen -t ed25519 -C "your-email@example.com"
# Add key to Render account, then:
ssh <service-name>@ssh.<region>.render.com
```

### Database Backup
```bash
# From Dashboard → Database → Snapshots
# Manual backup via pg_dump:
pg_dump DATABASE_URL > backup.sql
```

---

## 🚂 Railway (Full Stack)

### Install Railway CLI
```bash
npm install -g @railway/cli
```

### Login
```bash
railway login
```

### Deploy
```bash
# Initialize project
railway init

# Link to existing project
railway link

# Deploy
railway up

# Add environment variable
railway variables set DATABASE_URL=postgresql://...

# View logs
railway logs

# Open service
railway open
```

### Create Database
```bash
railway add postgresql
```

### Run Commands Remotely
```bash
railway run npx prisma db push
railway run node prisma/seed.js
```

---

## 🟦 DigitalOcean App Platform

### Using App Spec (YAML)
```yaml
# .do/app.yaml
name: restaurant-app
services:
  - name: backend
    source_dir: /server
    github:
      repo: username/restaurant-app
      branch: main
    build_command: npm install && npx prisma generate
    run_command: npm start
    envs:
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
      - key: JWT_SECRET
        value: your-secret
      - key: CORS_ORIGIN
        value: ${frontend.PUBLIC_URL}
  
  - name: frontend
    source_dir: /client
    build_command: npm run build
    static_site_generator: VITE
    output_dir: dist
    envs:
      - key: VITE_API_URL
        value: ${backend.PUBLIC_URL}/api

databases:
  - name: db
    engine: PG
    production: true
```

### Deploy via CLI
```bash
# Install doctl
brew install doctl  # macOS
# or download from digitalocean.com/docs/apis-clis/doctl/

# Authenticate
doctl auth init

# Create app
doctl apps create --spec .do/app.yaml

# Update app
doctl apps update YOUR_APP_ID --spec .do/app.yaml

# View logs
doctl apps logs YOUR_APP_ID
```

---

## 🟠 AWS (Advanced)

### Frontend on S3 + CloudFront

```bash
# Install AWS CLI
pip install awscli

# Configure
aws configure

# Build and upload
cd client
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Backend on EC2

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com

# Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql nginx

# Clone repo
git clone https://github.com/username/restaurant-app.git
cd restaurant-app/server

# Install dependencies
npm install
npx prisma generate
npx prisma db push

# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name restaurant-api
pm2 startup
pm2 save

# Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/default
# Add proxy_pass to http://localhost:5000
sudo nginx -t
sudo systemctl restart nginx
```

### Backend on Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
cd server
eb init

# Create environment
eb create restaurant-env

# Deploy
eb deploy

# View logs
eb logs

# Environment variables
eb setenv DATABASE_URL=postgresql://... JWT_SECRET=...
```

---

## 🐋 Docker Deployment

### Build Image
```bash
docker build -t restaurant-app .
```

### Run Locally
```bash
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  restaurant-app
```

### Push to Docker Hub
```bash
docker login
docker tag restaurant-app username/restaurant-app:latest
docker push username/restaurant-app:latest
```

### Deploy to Cloud Run (Google Cloud)
```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/restaurant-app

# Deploy
gcloud run deploy restaurant-app \
  --image gcr.io/PROJECT_ID/restaurant-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=...,JWT_SECRET=...
```

---

## 🔄 CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
          RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
        run: |
          curl -X POST \
            "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
            -H "Authorization: Bearer $RENDER_API_KEY"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./client
```

---

## 🔍 Health Check Commands

### Check Backend
```bash
curl https://your-backend.com/api/health
# Should return: {"status":"ok","message":"ROMS Server is running"}
```

### Check Database Connection
```bash
# Using Prisma Studio
npx prisma studio

# Using psql
psql DATABASE_URL
\dt  # List tables
```

### Test Socket.IO
```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c wss://your-backend.com
```

### Check Frontend Build
```bash
cd client
npm run build
npm run preview
```

---

## 📊 Monitoring Commands

### View Application Logs
```bash
# Render
render logs <service-name>

# Railway
railway logs

# Heroku
heroku logs --tail -a your-app-name

# PM2 (VPS)
pm2 logs restaurant-api
pm2 monit
```

### Database Monitoring
```bash
# Check connection count
SELECT count(*) FROM pg_stat_activity;

# Check database size
SELECT pg_size_pretty(pg_database_size('restaurant_db'));

# Active queries
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

---

## 🆘 Emergency Commands

### Rollback Deployment
```bash
# Vercel
vercel rollback

# Render (via Dashboard only)
# Go to Service → Deploys → Click "Rollback" on previous deploy

# Railway
railway rollback
```

### Reset Database
```bash
# ⚠️ DANGER: This deletes all data!
npx prisma db push --force-reset
node prisma/seed.js
```

### Clear Cache
```bash
# Vercel
vercel --prod --force

# CloudFront
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

### Restart Services
```bash
# PM2
pm2 restart restaurant-api

# Render/Railway (via Dashboard or triggers new deploy)
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## 📝 Useful Scripts to Add to package.json

```json
{
  "scripts": {
    "deploy:vercel": "cd client && vercel --prod",
    "deploy:full": "npm run deploy:vercel && npm run deploy:backend",
    "db:backup": "pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql",
    "db:migrate": "npx prisma migrate deploy",
    "logs:prod": "vercel logs production-url",
    "health:check": "curl https://your-api.com/api/health"
  }
}
```

---

**Pro Tip:** Save commonly used commands as shell aliases:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias deploy-restaurant="cd ~/restaurant && git push && vercel --prod"
alias check-api="curl https://your-api.com/api/health"
alias view-logs="railway logs"
```

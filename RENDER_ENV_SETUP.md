# Render Environment Variables Setup

## Important: Update These Environment Variables on Render

After pushing the latest changes, you **MUST** update the environment variables on your Render deployment:

### Required Environment Variables

Go to your Render dashboard → Your service → Environment tab and add/update:

```
BACKEND_URL=https://restaurant1-qm7p.onrender.com
FRONTEND_URL=https://maad.emerald-import-export.com
```

### Why This is Important

These variables control where the payment gateway (Chapa) redirects customers after payment:
- **Before**: Redirected to `localhost:5173` (your local computer)
- **After**: Will redirect to `https://maad.emerald-import-export.com` (your production site)

### Steps to Update on Render:

1. Go to https://dashboard.render.com/
2. Click on your backend service (restaurant1-qm7p)
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - Key: `BACKEND_URL`
   - Value: `https://restaurant1-qm7p.onrender.com`
6. Add another:
   - Key: `FRONTEND_URL`
   - Value: `https://maad.emerald-import-export.com`
7. Click **Save Changes**
8. Your service will automatically redeploy

### Already Set Variables (Keep These):

These should already be configured (don't change them):
- `NODE_ENV=production`
- `CORS_ORIGIN=https://maad.emerald-import-export.com`
- `DATABASE_URL=postgresql://...` (your Neon database)
- `JWT_SECRET=...`
- `CHAPA_SECRET_KEY=...`
- `CHAPA_PUBLIC_KEY=...`
- `CLOUDINARY_CLOUD_NAME=kyxsb3dn`
- `CLOUDINARY_API_KEY=...`
- `CLOUDINARY_API_SECRET=...`
- `GEMINI_API_KEY=...`
- All other existing variables

## Fixed Issues

1. ✅ **Google Maps**: Fixed API key typo in client/.env
2. ✅ **Payment Redirect**: Added BACKEND_URL and FRONTEND_URL to control redirects
3. ✅ **Localhost Issue**: System will now redirect to your production domain after payment

## After Updating Render Environment Variables

Once you've added the environment variables on Render:
1. Wait for automatic redeploy (2-3 minutes)
2. Test the checkout and payment flow
3. After payment, you should be redirected to: `https://maad.emerald-import-export.com/order-success`

No more localhost redirects! 🎉

---

**Last Updated**: Fix commit b9591ed

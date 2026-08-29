# 🖼️ Cloudinary Setup Guide - Fix Image Persistence Issue

## Problem Fixed
Images were disappearing after 4-5 hours because they were stored in the local `server/uploads/` folder, which gets cleared on server restarts or deployments. **Now all images will be stored permanently on Cloudinary cloud storage.**

---

## ✅ What Was Changed

### Backend Changes:
1. **Installed Cloudinary packages** (`cloudinary`, `multer-storage-cloudinary`)
2. **Created** `server/src/config/cloudinary.js` - Cloudinary configuration
3. **Updated** `server/src/routes/uploadRoutes.js` - Use Cloudinary storage instead of local
4. **Updated** `server/src/controllers/uploadController.js` - Return Cloudinary URLs
5. **Added** Cloudinary environment variables to `server/.env`

### Frontend Changes:
1. **Updated** `client/src/utils/imageUtils.js` - Handle Cloudinary URLs (https://)

---

## 🚀 Setup Instructions (REQUIRED - Takes 5 minutes)

### Step 1: Create Free Cloudinary Account

1. Go to: **https://cloudinary.com/users/register/free**
2. Sign up with your email (100% free, no credit card required)
3. After signup, you'll be redirected to your **Dashboard**

### Step 2: Get Your Cloudinary Credentials

On your Cloudinary Dashboard, you'll see:
- **Cloud Name**: `your_cloud_name`
- **API Key**: `123456789012345`
- **API Secret**: `abcdefghijklmnopqrstuvwxyz123`

Copy these three values.

### Step 3: Update Server Environment Variables

1. Open `server/.env` file
2. Find these lines at the bottom:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

3. Replace with your actual values:
   ```env
   CLOUDINARY_CLOUD_NAME=dz3example
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
   ```

### Step 4: Restart Your Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd server
npm run dev
```

---

## ✨ How It Works Now

### Before (Local Storage):
```
User uploads image → Saved to server/uploads/ folder → Disappears after server restart
```

### After (Cloudinary):
```
User uploads image → Uploaded to Cloudinary → Gets permanent URL → Never disappears
```

### Example URLs:

**Old (Local):**
```
/uploads/food-1234567890.jpg
```

**New (Cloudinary):**
```
https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/restaurant-uploads/food-xyz.jpg
```

---

## 🧪 Testing

1. **Login as Admin**
2. Go to **Food Management** or **Restaurant Management**
3. **Upload a new image**
4. Save and refresh the page ✅ Image should display
5. **Wait 1 hour, close browser, restart server**
6. Open the website again ✅ Image still displays!
7. Check Cloudinary dashboard - you'll see the uploaded image there

---

## 📊 Cloudinary Free Tier Limits

- ✅ **Storage**: 25 GB
- ✅ **Bandwidth**: 25 GB/month
- ✅ **Transformations**: 25,000/month
- ✅ **Images**: Unlimited uploads

This is more than enough for a restaurant website with hundreds of menu items!

---

## 🔄 Existing Images

### What happens to old images?

**Old images stored locally** (`/uploads/food-*.jpg`) will:
- Still work if they exist in the uploads folder
- Display with fallback images if the uploads folder was cleared
- Be **replaced** when you re-upload them (new uploads go to Cloudinary)

### Recommendation:
**Re-upload all existing images** through the admin panel to migrate them to Cloudinary permanently.

---

## 🐛 Troubleshooting

### Images not uploading?
1. Check `server/.env` - Make sure Cloudinary credentials are correct (no spaces, no quotes)
2. Check server logs for errors: `Error: Invalid Cloudinary credentials`
3. Verify Cloudinary dashboard shows your account is active

### Images still disappearing?
1. Make sure you restarted the server after updating `.env`
2. Check the image URL in browser DevTools - should start with `https://res.cloudinary.com/`
3. If it still shows `/uploads/`, the Cloudinary setup didn't work

### Uploads are slow?
- Cloudinary uploads take 1-3 seconds (normal)
- If taking >10 seconds, check your internet connection

---

## 📝 Technical Details

### Files Modified:
```
server/src/config/cloudinary.js         (NEW)
server/src/routes/uploadRoutes.js       (UPDATED)
server/src/controllers/uploadController.js  (UPDATED)
server/.env                              (UPDATED)
client/src/utils/imageUtils.js          (UPDATED)
```

### Image Storage Location:
- **Cloudinary Folder**: `restaurant-uploads/`
- **Max Image Size**: 5 MB (configured in cloudinary.js)
- **Allowed Formats**: jpg, jpeg, png, gif, webp
- **Auto Resize**: Images larger than 1200x1200 are automatically resized

---

## ✅ Summary

| Before | After |
|--------|-------|
| ❌ Images disappear after hours | ✅ Images permanent forever |
| ❌ Lost on server restart | ✅ Survive all restarts |
| ❌ Lost on deployment | ✅ Survive all deployments |
| ❌ Stored locally | ✅ Stored on cloud CDN |
| ❌ Slow loading | ✅ Fast global CDN |

**Action Required:** Just add your Cloudinary credentials to `server/.env` and restart the server!

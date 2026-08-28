# Image Upload System - Complete Guide

## 🎯 Overview
Your restaurant platform supports **BOTH** URL-based images and file uploads in multiple formats.

## ✅ Supported Image Formats
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WEBP** (.webp)

All formats are **already configured and working**!

## 📤 How to Upload Images

### Method 1: Upload from Your Computer
1. Go to **Admin → Foods** (or Categories/Restaurants)
2. Click **"Add New"** or **"Edit"** an existing item
3. In the image section, click the **"Upload"** tab
4. Click **"Click to upload image"**
5. Select any image file (JPG, PNG, GIF, WEBP) from your computer
6. The image will automatically upload to the server
7. Click **"Save"** to apply changes

**Upload Limits:**
- Maximum file size: **5MB**
- Accepted formats: JPG, JPEG, PNG, GIF, WEBP

### Method 2: Use Image URL
1. Go to **Admin → Foods** (or Categories/Restaurants)
2. Click **"Add New"** or **"Edit"** an existing item
3. In the image section, click the **"URL"** tab
4. Paste the image URL (e.g., `https://example.com/food.jpg` or `/uploads/dish.webp`)
5. Click **"Save"**

## 🗂️ Where Uploaded Images Are Stored

**Development (Local):**
- Path: `server/uploads/`
- Access URL: `http://localhost:3000/uploads/filename.jpg`

**Production (Render):**
- Path: `server/uploads/` (ephemeral storage)
- Access URL: `https://restaurant1-qm7p.onrender.com/uploads/filename.jpg`

⚠️ **Important:** Render uses ephemeral storage, which means uploaded files are deleted when the server restarts. For production, consider using:
- **Cloudinary** (recommended for images)
- **AWS S3**
- **Google Cloud Storage**
- **Uploadcare**

## 🔧 Image Upload Component Features

The `ImageUpload` component includes:
- ✅ Toggle between URL and file upload modes
- ✅ Real-time image preview
- ✅ File type validation
- ✅ File size validation (5MB max)
- ✅ Clear/remove image button
- ✅ Automatic upload to server
- ✅ Shows current image when editing
- ✅ Supports all major image formats

## 🐛 Fixed Issues

### Issue 1: Same Image Showing for All Foods ✅ FIXED
**Problem:** All foods were showing the same turkey image.

**Cause:** Database had `.jpg` extensions but files were `.webp`

**Solution:** Ran `fix-image-extensions.js` script to update all database paths.

```bash
cd server
node fix-image-extensions.js
```

### Issue 2: Image Not Updating When Editing ✅ FIXED
**Problem:** When editing a food, the image preview showed cached/old image.

**Cause:** React component wasn't remounting with fresh data.

**Solution:** Added `key` prop to force component remount:
```jsx
<ImageUpload
  key={`food-image-${editingFood?.id || 'new'}-${modalMode}`}
  value={form.image}
  onChange={(url) => setForm({ ...form, image: url })}
/>
```

### Issue 3: Modal Scroll Issue ✅ FIXED
**Problem:** When scrolling in the edit modal, the "Dish Name" field scrolled out of view.

**Solution:** Made header and footer sticky, body scrollable:
```jsx
<form className="max-h-[90vh] flex flex-col">
  <div className="sticky top-0">Header</div>
  <div className="overflow-y-auto flex-1">Body</div>
  <div className="sticky bottom-0">Footer</div>
</form>
```

## 🚀 Usage in Different Pages

### 1. Admin Foods Page (`AdminFoodsPage.jsx`)
- ✅ ImageUpload component integrated
- ✅ Works for both Add and Edit modes
- ✅ Shows existing images when editing

### 2. Admin Categories Page (`AdminMainCategoriesPage.jsx`)
- ✅ ImageUpload component integrated
- ✅ Works for both Add and Edit modes

### 3. Admin Restaurants Page (`AdminAddRestaurantPage.jsx`)
- ✅ ImageUpload component for logo
- ✅ ImageUpload component for cover image
- ✅ Full edit mode support

### 4. Chef Add Food Page (`ChefAddFood.jsx`)
- ✅ Custom image upload already implemented
- ✅ Toggle between URL and file upload

## 📝 Example Usage

```jsx
import ImageUpload from '../../components/ImageUpload';

// In your form:
<ImageUpload
  key={`unique-key-${itemId}`}  // Force remount on item change
  value={form.image}             // Current image URL
  onChange={(url) => setForm({ ...form, image: url })}
  label="Food Image"             // Optional label
  placeholder="Upload or enter URL"  // Optional placeholder
  required={false}               // Optional required validation
/>
```

## 🌐 Production Deployment Notes

### Current Setup:
- **Frontend:** Vercel - https://restaurant1-rust-ten.vercel.app
- **Backend:** Render - https://restaurant1-qm7p.onrender.com
- **Database:** PostgreSQL on Render

### File Upload in Production:
⚠️ **Render has ephemeral storage** - uploaded files are lost on restart.

**Recommended Solutions:**

1. **Cloudinary** (Best for images)
   ```bash
   npm install cloudinary multer-storage-cloudinary
   ```

2. **AWS S3**
   ```bash
   npm install @aws-sdk/client-s3 multer-s3
   ```

3. **For now:** Use URL-based images hosted elsewhere

## 🎨 Image Best Practices

1. **Optimize images before uploading:**
   - Use WebP format for best compression
   - Resize to appropriate dimensions (e.g., 800x600 for food images)
   - Keep file size under 500KB

2. **Naming conventions:**
   - Use descriptive names: `doro-wot.webp` not `IMG_123.jpg`
   - Avoid spaces: use hyphens or underscores

3. **Image dimensions:**
   - Food images: 800x600px (4:3 ratio)
   - Restaurant logos: 200x200px (square)
   - Restaurant covers: 1200x400px (3:1 ratio)

## 🔗 Related Files

- `client/src/components/ImageUpload.jsx` - Main upload component
- `server/src/config/upload.js` - Multer configuration
- `server/src/controllers/uploadController.js` - Upload handlers
- `server/src/routes/uploadRoutes.js` - Upload API routes
- `server/fix-image-extensions.js` - Database fix script

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check server logs for upload failures
3. Verify file format and size are within limits
4. Hard refresh browser (Ctrl+Shift+R)
5. Clear browser cache if images aren't updating

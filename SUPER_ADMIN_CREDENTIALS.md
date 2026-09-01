# 🔐 Super Admin Login Credentials

## ✅ Account Created Successfully!

### Super Admin Login Details:

```
📧 Email: superadmin@maad.com
🔑 Password: SuperAdmin@2024
👤 Name: Super Administrator
📱 Phone: +251 900 000 000
```

---

## 🚀 How to Login:

1. **Go to**: http://localhost:5173/login
2. **Enter**:
   - Email: `superadmin@maad.com`
   - Password: `SuperAdmin@2024`
3. **Click**: "Sign In"
4. **You'll be redirected to**: `/superadmin` (Super Admin Dashboard)

---

## 🎯 What You Can Do:

### As Super Admin, you have access to:

1. **Manage Admins** (`/superadmin/manage-admins`)
   - Create new admin accounts
   - Edit existing admins
   - Delete admins
   - Assign admins to specific restaurants

2. **System Settings** (`/superadmin/system-settings`)
   - Maintenance mode
   - Business information
   - Notification preferences
   - Security settings
   - Feature toggles

3. **All Admin Features**
   - Manage restaurants
   - Manage food items
   - Manage orders
   - Manage employees
   - Manage customers
   - View reviews
   - Support center

---

## 🔒 Security Notes:

- ⚠️ **Keep these credentials safe!**
- ⚠️ **Change the password after first login**
- ⚠️ **Do not share super admin access**

To change password after login:
1. Click "Profile" button (top right)
2. Scroll to "Security" section
3. Click "Change Password"
4. Enter current password: `SuperAdmin@2024`
5. Enter new password (min 6 characters)
6. Confirm new password
7. Click "Update Password"

---

## 📝 Additional Users (For Testing)

If you want to create regular admin accounts for testing:

1. Login as super admin
2. Go to `/superadmin/manage-admins`
3. Click "Add New Admin"
4. Fill in the form:
   - **Name**: Admin User
   - **Email**: admin@maad.com
   - **Password**: Admin@2024
   - **Phone**: +251 900 000 001
   - **Restaurant**: Select one or leave blank
5. Click "Create Admin"

---

## 🎨 Dashboard URLs:

- **Super Admin**: http://localhost:5173/superadmin
- **Regular Admin**: http://localhost:5173/admin
- **Chef**: http://localhost:5173/chef
- **Waiter**: http://localhost:5173/waiter
- **Driver**: http://localhost:5173/driver
- **Customer**: http://localhost:5173/

---

## ✅ Account Status:

- ✅ Created: Yes
- ✅ Role: SUPER_ADMIN
- ✅ Database: Updated
- ✅ Ready to use: Yes

---

## 🆘 Troubleshooting:

### If login fails:
1. Make sure backend server is running (`npm run dev` in server folder)
2. Make sure frontend is running (`npm run dev` in client folder)
3. Check browser console for errors (F12)
4. Try clearing browser cache (Ctrl + Shift + Delete)

### If redirected to wrong page:
1. Clear browser cache
2. Logout completely
3. Close browser
4. Reopen and login again

### If you forgot password:
Run this script again:
```bash
cd server
node create-superadmin.js
```
It will reset the password to `SuperAdmin@2024`

---

## 📞 Support:

If you have any issues, check the browser console (F12) for error messages.

---

**🎉 Your super admin account is ready to use!**

**Login now at**: http://localhost:5173/login

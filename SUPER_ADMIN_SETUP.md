# 🔐 Super Admin System - Complete Setup Guide

## ✅ What Was Created

### 1. **Super Admin Dashboard** (Purple Theme)
- **Path**: `/superadmin`
- **Features**:
  - All admin capabilities (orders, restaurants, food, employees, customers)
  - **PLUS**: Ability to manage admin accounts
  - **PLUS**: System-wide settings control
  - Purple/Amber color scheme to differentiate from regular admin (Orange)

### 2. **Manage Admins Page**
- **Path**: `/superadmin/manage-admins`
- **Features**:
  - ✅ View all admin accounts
  - ✅ Create new admins
  - ✅ Edit existing admins (name, email, phone, restaurant assignment)
  - ✅ Delete admin accounts
  - ✅ Assign admins to specific restaurants or grant system-wide access
  - Search and filter admins

### 3. **System Settings Page**
- **Path**: `/superadmin/system-settings`
- **Features**:
  - **System Status**: Maintenance mode, allow registrations
  - **Business Info**: Business name, support email/phone
  - **Notifications**: Email, SMS, push notifications
  - **Security**: Password min length, session timeout, 2FA
  - **Features**: Enable/disable AI chat, reviews, delivery, dine-in

### 4. **Database Schema Updates**
- Added `SUPER_ADMIN` role to the Role enum
- Database pushed successfully (no data loss)

---

## 📁 Files Created/Modified

### Created Files:
1. `client/src/pages/superadmin/SuperAdminDashboard.jsx` - Main dashboard
2. `client/src/pages/superadmin/SuperAdminManageAdmins.jsx` - Admin management
3. `client/src/pages/superadmin/SuperAdminSystemSettings.jsx` - System settings
4. `client/src/pages/admin/AdminProfile.jsx` - Admin profile page (bonus)

### Modified Files:
1. `client/src/App.jsx` - Added superadmin routes
2. `client/src/pages/auth/Login.jsx` - Added SUPER_ADMIN login redirect
3. `client/src/components/DashboardHeader.jsx` - Added profile button
4. `client/src/context/AuthContext.jsx` - Added updateUserProfile function
5. `server/prisma/schema.prisma` - Added SUPER_ADMIN role
6. `server/src/controllers/userController.js` - Added changePassword, updated updateProfile
7. `server/src/routes/userRoutes.js` - Added change-password route

---

## 🚀 How to Create a Super Admin Account

### Option 1: Direct Database Update (Recommended)
Run this SQL query in your Neon database console:

```sql
-- Find your existing admin user
SELECT id, name, email, role FROM "User" WHERE role = 'ADMIN' LIMIT 1;

-- Update that user to SUPER_ADMIN
UPDATE "User" 
SET role = 'SUPER_ADMIN' 
WHERE email = 'your-admin@email.com';
```

### Option 2: Using Prisma Studio
```bash
cd server
npx prisma studio
```
1. Open the `User` table
2. Find your admin user
3. Change `role` from `ADMIN` to `SUPER_ADMIN`
4. Save

### Option 3: Create via API (After having one super admin)
Once you have one super admin, you can create more via the UI at:
`/superadmin/manage-admins` > "Add New Admin"

---

## 🔐 Access Levels

### SUPER_ADMIN
- ✅ Full system access
- ✅ Manage all admins
- ✅ System-wide settings
- ✅ All restaurants, orders, food, employees
- ✅ Cannot be deleted by regular admins

### ADMIN
- ✅ Manage their assigned restaurant (if any)
- ✅ Or manage all restaurants (if not assigned to one)
- ✅ Manage orders, food, employees
- ❌ Cannot manage other admins
- ❌ Cannot access system settings

---

## 🎨 UI Differences

### Super Admin (Purple Theme)
- **Brand Color**: Purple gradient (`from-purple-600 to-purple-700`)
- **Icon Badge**: Crown icon (👑)
- **Label**: "Super Admin" in amber/gold color
- **Sidebar**: Purple accents

### Regular Admin (Orange Theme)
- **Brand Color**: Orange (`orange-600`)
- **Icon Badge**: Utensils icon
- **Label**: "Admin" in orange
- **Sidebar**: Orange accents

---

## 🔑 Login Flow

When you log in:
1. **SUPER_ADMIN** → Redirects to `/superadmin`
2. **ADMIN** → Redirects to `/admin`
3. **CHEF** → Redirects to `/chef`
4. **WAITER** → Redirects to `/waiter`
5. **DRIVER** → Redirects to `/driver`
6. **CUSTOMER** → Redirects to `/`

---

## 📋 Super Admin Menu Structure

```
🏠 Dashboard
  
👑 Super Admin
  ├── Manage Admins          (/superadmin/manage-admins)
  └── System Settings        (/superadmin/system-settings)

📦 Order Management
  ├── All Orders
  └── Pending Orders

🏪 Restaurant Management
  ├── Zone Setup
  ├── Cuisine Types
  └── All Restaurants

🍽️ Food Management
  ├── Main Categories
  └── Food Items

🚴 Deliveryman Management

👥 Employee Management
  ├── Employee Roles
  └── All Employees

👨‍👩‍👧‍👦 Customer Management
  ├── Customers
  └── Reviews

💬 Help & Support
  ├── Support Center
  └── AI Assistant

⚙️ System Setup
  └── Settings
```

---

## 🧪 Testing Steps

### 1. Create Super Admin
```sql
-- In your Neon database console
UPDATE "User" 
SET role = 'SUPER_ADMIN' 
WHERE email = 'your-admin@email.com';
```

### 2. Login as Super Admin
1. Go to `/login`
2. Enter super admin credentials
3. You'll be redirected to `/superadmin`

### 3. Test Manage Admins
1. Go to `/superadmin/manage-admins`
2. Click "Add New Admin"
3. Fill form:
   - Name: "Test Admin"
   - Email: "test-admin@example.com"
   - Password: "password123"
   - Phone: "+251 900 000 000"
   - Restaurant: (select one or leave blank)
4. Click "Create Admin"
5. New admin should appear in list

### 4. Test System Settings
1. Go to `/superadmin/system-settings`
2. Toggle some settings
3. Click "Save All Settings"
4. Refresh page - settings should persist

### 5. Test Admin Profile
1. Click "Profile" button in top header
2. Upload profile picture
3. Update name/email/phone
4. Click "Save Changes"
5. Test password change

---

## 🔒 Security Notes

1. **Super Admin Protection**:
   - Only SUPER_ADMIN can access `/superadmin/*` routes
   - Regular admins get redirected if they try to access

2. **Admin Management**:
   - Only SUPER_ADMIN can create/edit/delete admins
   - Regular admins cannot access `/users/staff` endpoints

3. **System Settings**:
   - Only SUPER_ADMIN can modify system-wide settings
   - Settings affect all users across all restaurants

---

## 📱 API Endpoints

### Manage Admins
```
GET    /api/users/staff             # Get all staff (filter by role=ADMIN)
POST   /api/users/staff             # Create admin (role: 'ADMIN')
PUT    /api/users/staff/:id         # Update admin
DELETE /api/users/staff/:id         # Delete admin
```

### System Settings
```
GET    /api/settings                # Get current settings
PUT    /api/settings                # Update settings
```

### User Profile
```
GET    /api/users/profile           # Get current user profile
PUT    /api/users/profile           # Update profile (name, email, phone, profileImage)
PUT    /api/users/change-password   # Change password
```

---

## 🎯 Next Steps

1. **Create your first super admin** (SQL update)
2. **Login and test** the super admin dashboard
3. **Create regular admins** via the UI
4. **Assign admins to restaurants** if needed
5. **Configure system settings** as desired

---

## 📝 Notes

- **Restaurant Assignment**: 
  - If an admin is assigned to a restaurant, they only see that restaurant's data
  - If NOT assigned (restaurantId = null), they see ALL restaurants

- **Profile Images**: 
  - Stored in Cloudinary (permanent)
  - Falls back to avatar with first letter if no image

- **Password Changes**:
  - Requires current password for security
  - New password must be at least 6 characters

---

## ✅ Build Status

- ✅ Database schema updated (SUPER_ADMIN role added)
- ✅ Backend routes ready
- ✅ Frontend built successfully
- ✅ All files created
- ✅ Login redirects configured

**Status**: READY TO USE! 🎉

Just create a super admin user in the database and log in at `/login`.

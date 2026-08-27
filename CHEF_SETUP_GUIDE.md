# 🚀 Chef Dashboard Setup Guide

## Quick Start (3 Steps)

### Step 1: Update Database Schema
```bash
cd server
npx prisma db push
```
This will update your database with the new Food model fields.

### Step 2: Create Uploads Directory
```bash
cd server
mkdir -p uploads/foods
```
This creates the folder for chef food image uploads.

### Step 3: Restart Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

That's it! The Chef Dashboard is now ready to use.

---

## Testing the Features

### 1. Login as Chef
```
URL: http://localhost:5174/login
Email: chef.tadesse@maad.com
Password: password123
```

### 2. Access Chef Dashboard
After login, you'll be automatically redirected to `/chef`

### 3. Navigate Through Features

#### Dashboard Home (`/chef`)
- View order statistics
- See recent active orders
- Quick action cards

#### Orders Management
- **All Orders:** `/chef/orders/all`
- **New Orders:** `/chef/orders/new` ← Accept pending orders here
- **Cooking:** `/chef/orders/cooking` ← Start preparing
- **Ready for Dine-In:** `/chef/orders/dine-in`
- **Ready for Delivery:** `/chef/orders/delivery`

#### Add New Food (`/chef/add-food`)
1. Fill in food details
2. Upload image (optional)
3. Select dietary options
4. Click "Submit for Approval"
5. Food appears in pending sidebar (waiting for admin)

#### Profile (`/chef/profile`)
1. Click camera icon to upload photo
2. Edit your information
3. Click "Save Changes"

#### Chat (`/chef/chat`)
- Select a conversation
- Send messages
- Real-time updates

#### Support (`/chef/support`)
- Fill support ticket form
- Submit for help

---

## 🧪 Testing Real-Time Features

### Test New Order Notifications

**Option 1: Use Existing Orders**
1. Open Chef Dashboard
2. Have an admin or customer create a new order
3. Chef will see real-time notification

**Option 2: Manual Socket Test**
Open browser console and run:
```javascript
const socket = io('http://localhost:5000');
socket.emit('new_order', {
  restaurantId: 'your-restaurant-id',
  id: 'test-order-123',
  status: 'PENDING',
  items: [{food: {name: 'Test Pizza'}}]
});
```

### Test Order Status Updates
1. Go to "New Orders" page
2. Click "Accept Order" on any pending order
3. Order moves to "Cooking" section automatically
4. Toast notification appears
5. Real-time update broadcasts to all connected users

---

## 📱 Feature Walkthrough

### Complete Order Flow Test

1. **Start:** New order arrives at `/chef/orders/new`
   - Red "NEW" badge appears
   - Urgency indicator shows
   - Click "ACCEPT ORDER NOW"

2. **Accepted:** Order moves to `/chef/orders/cooking`
   - Status changes to CONFIRMED
   - Click "START COOKING"

3. **Cooking:** Status updates to PREPARING
   - Cooking timer starts
   - Click "MARK AS READY" when done

4. **Ready:** Order moves to appropriate page
   - Dine-in orders → `/chef/orders/dine-in`
   - Delivery orders → `/chef/orders/delivery`

### Food Submission Flow

1. **Submit Food:**
   - Go to `/chef/add-food`
   - Fill form (name, description, price, category)
   - Upload image
   - Check dietary options (vegetarian, vegan, gluten-free)
   - Select spicy level
   - Click "Submit for Approval"

2. **Pending Status:**
   - Food appears in right sidebar
   - Status shows "⏳ Pending Review"

3. **Admin Approval (Not Yet Implemented):**
   - Admin reviews food
   - Approves or rejects
   - Chef receives notification

---

## 🔧 Troubleshooting

### Issue: Database schema not updated
**Solution:**
```bash
cd server
npx prisma generate
npx prisma db push
```

### Issue: Images not uploading
**Solution:**
Check that `uploads/foods` directory exists:
```bash
cd server
ls uploads/foods  # Should show directory
```

If not, create it:
```bash
mkdir -p uploads/foods
```

### Issue: Socket.IO not connecting
**Solution:**
1. Check server is running on port 5000
2. Check browser console for connection errors
3. Verify VITE_API_URL in `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

### Issue: Orders not appearing
**Solution:**
1. Make sure you're logged in as chef
2. Check that chef has a restaurantId assigned
3. Verify orders exist in database for that restaurant

### Issue: Profile photo not saving
**Solution:**
- Profile photos save to localStorage immediately
- Check browser localStorage: `avatar_{userId}`
- Clear localStorage and re-upload if needed

---

## 📊 Database Requirements

### Required Tables (Already Exist)
- ✅ User (with role=CHEF)
- ✅ Restaurant
- ✅ Food (updated with new fields)
- ✅ FoodCategory
- ✅ Order
- ✅ OrderItem

### New Food Model Fields
- `preparationTime` - Minutes to prepare (default: 15)
- `isVegetarian` - Boolean flag
- `isVegan` - Boolean flag
- `isGlutenFree` - Boolean flag
- `spicyLevel` - NONE/MILD/MEDIUM/HOT/EXTRA_HOT
- `status` - PENDING/APPROVED/REJECTED
- `submittedBy` - Chef user ID
- `approvedBy` - Admin user ID (when approved)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

---

## 🎯 API Endpoints Reference

### Chef-Specific Endpoints

```
GET    /api/chef/orders
GET    /api/chef/orders?status=PENDING
PUT    /api/chef/orders/:id/status
POST   /api/chef/foods (multipart/form-data)
GET    /api/chef/foods
GET    /api/chef/stats
```

### General Endpoints (Already Available)

```
GET    /api/orders
GET    /api/foods
GET    /api/categories
GET    /api/restaurants
PUT    /api/users/profile
```

---

## 🎨 UI Components Used

### Icons (Lucide React)
- ChefHat, Bell, Clock, Flame, Truck
- CheckCircle, AlertCircle, Package
- User, Mail, Phone, MapPin
- MessageSquare, HelpCircle, Send
- PlusCircle, Upload, Camera, X, Loader

### Colors (Tailwind)
- Orange/Amber for chef branding
- Purple for cooking status
- Green for ready/success
- Red for urgent/error
- Blue for info/delivery
- Yellow for pending/warning

---

## ✅ Final Checklist

Before using the Chef Dashboard:

- [ ] Database schema updated (`npx prisma db push`)
- [ ] Uploads directory created (`mkdir uploads/foods`)
- [ ] Server restarted (`npm run dev`)
- [ ] Client running (`npm run dev` in client folder)
- [ ] Logged in as chef (`chef.tadesse@maad.com`)
- [ ] Can navigate to `/chef`
- [ ] Can see orders (if any exist)
- [ ] Can submit food
- [ ] Profile photo uploads work
- [ ] Real-time updates working

---

## 🆘 Need Help?

### Common Questions

**Q: Where are the test login credentials?**  
A: Check `CHEF_DASHBOARD_COMPLETE.md` or use:
- Email: `chef.tadesse@maad.com`
- Password: `password123`

**Q: How do I create test orders?**  
A: Log in as a customer and place an order, or use the admin dashboard to create orders.

**Q: Can I test with multiple chefs?**  
A: Yes! Each chef sees only their restaurant's orders based on `restaurantId`.

**Q: What happens when food is submitted?**  
A: Food gets status "PENDING" and awaits admin approval. Admin pages need to be created to approve/reject.

---

## 🎊 You're All Set!

The Chef Dashboard is now fully functional. Enjoy exploring all the features!

**Happy Cooking! 👨‍🍳🔥**

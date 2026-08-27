# 🚚 Driver Portal - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Start the Application

**Terminal 1 - Backend:**
```powershell
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd client
npm run dev
```

### 2. Login as Driver

**URL:** `http://localhost:5174/login`

**Credentials:**
- Email: `solomon.driver@maad.com`
- Password: `password123`

### 3. Navigate Driver Dashboard

You'll automatically be redirected to: `http://localhost:5174/driver`

---

## 📱 Driver Portal Navigation

### Main Sections

1. **Dashboard (Home)**
   - View available deliveries
   - Check in-transit orders
   - See today's earnings
   - Access recent deliveries

2. **Orders Menu**
   - **New from Chef** - Accept deliveries ready for pickup
   - **On the Way** - Track active deliveries
   - **Delivered** - View completed deliveries with earnings

3. **Manual Order**
   - Create custom delivery orders
   - Enter customer details
   - Calculate delivery fee

4. **My Deliveries**
   - Complete delivery history
   - Search and filter
   - View all-time stats

5. **Profile**
   - Update personal info
   - Upload profile photo
   - Manage settings

6. **Live Chat**
   - Message support team
   - Communicate with customers

7. **Support**
   - Submit help tickets
   - Get assistance

---

## 🔄 Typical Driver Workflow

### Accepting a Delivery

1. **Dashboard shows notification:**
   - "3 new orders available"

2. **Click "New from Chef" or "View Orders":**
   - See list of READY delivery orders

3. **Review order details:**
   - Restaurant pickup location
   - Customer delivery address
   - Phone number (click to call)
   - Order items
   - Total amount
   - Your earning (10%)

4. **Click "Accept & Pick Up":**
   - Order moves to "On the Way"
   - Status changes to OUT_FOR_DELIVERY

### Completing a Delivery

1. **Go to "On the Way":**
   - See active delivery details
   - Customer address highlighted
   - Phone number available

2. **Pick up food from restaurant**

3. **Navigate to customer address:**
   - Use phone number if needed

4. **Deliver food to customer**

5. **Click "Confirm Delivered":**
   - Order moves to "Delivered"
   - Earnings added to today's total
   - Statistics update automatically

---

## 💰 Understanding Earnings

**Calculation:** 10% of order total

**Examples:**
- Order: $50.00 → You earn: **$5.00**
- Order: $120.00 → You earn: **$12.00**
- Order: $35.50 → You earn: **$3.55**

**Tracking:**
- Dashboard shows **Today's Earnings**
- Delivered page filters by time period
- My Deliveries shows complete history

---

## 🔔 Notifications

### When You'll Get Notified

1. **New Order Available:**
   - Chef marks order ready for delivery
   - Badge appears on "New from Chef"
   - Dashboard shows count

2. **Order Status Changed:**
   - Customer updates order
   - Restaurant makes changes
   - Admin modifies order

---

## 📊 Statistics Explained

### Dashboard Cards

**Available Orders:**
- Count of READY delivery orders
- Orders waiting for driver acceptance
- Real-time updates

**In Transit:**
- Your active deliveries
- Currently delivering
- Shows urgency if delayed

**Delivered Today:**
- Completed deliveries since midnight
- Resets daily at 12:00 AM

**Today's Earnings:**
- Sum of 10% from all delivered orders today
- Updates in real-time
- Shows cumulative total

---

## 🎨 UI Elements Guide

### Status Badges

- **🟢 READY** - Available for pickup
- **🔵 IN TRANSIT** - Currently delivering (with pulse animation)
- **🟣 DELIVERED** - Completed delivery

### Urgency Indicators

- **Red Border:** Order waiting 15+ minutes (new orders)
- **Red Alert:** Delivery taking 30+ minutes (in transit)

### Time Display

- "Just now" - Less than 1 minute
- "15m ago" - 15 minutes ago
- "2h ago" - 2 hours ago
- Full timestamp for older orders

---

## 🔧 Troubleshooting

### Not Seeing Orders?

**Check:**
1. Are you logged in as DRIVER role?
2. Is the backend server running?
3. Are there delivery orders marked READY?
4. Check browser console for errors

**Solution:**
- Make sure orders exist with:
  - `orderType: 'DELIVERY'`
  - `status: 'READY'`
- Check Socket.IO connection in browser console

### Earnings Not Calculating?

**Check:**
1. Did you confirm delivery?
2. Is order status DELIVERED?
3. Is order assigned to your driverId?

**Formula:** `earnings = totalAmount * 0.1`

### Profile Photo Not Saving?

**Solution:**
- Photo saved to localStorage with key `avatar_${userId}`
- Check browser storage quota
- File size should be < 5MB
- Format: jpg, png, gif, webp

---

## 📞 Need Help?

### Support Options

1. **In-App Support:**
   - Click "Support" in sidebar
   - Submit a ticket
   - Include screenshots

2. **Live Chat:**
   - Click "Live Chat" in sidebar
   - Message support team
   - Get instant help

3. **Technical Issues:**
   - Check browser console (F12)
   - Check network tab
   - Verify server is running

---

## ✅ Quick Checklist

### First Time Setup
- [ ] Backend server running (port 5000)
- [ ] Frontend client running (port 5174)
- [ ] Logged in as driver
- [ ] Can see dashboard
- [ ] Sidebar navigation works

### Daily Workflow
- [ ] Check available deliveries
- [ ] Accept new orders
- [ ] Pick up from restaurant
- [ ] Deliver to customer
- [ ] Confirm delivered
- [ ] Track earnings

### Profile Setup
- [ ] Upload profile photo
- [ ] Update contact info
- [ ] Add years of experience
- [ ] Write bio

---

## 🎯 Pro Tips

1. **Accept Early:**
   - Accept deliveries quickly to avoid delays
   - Red borders mean order is urgent

2. **Use Phone Numbers:**
   - Click customer phone to call directly
   - Confirm delivery address if unclear

3. **Track Earnings:**
   - Check dashboard daily
   - View detailed history in "My Deliveries"
   - Filter by time period

4. **Stay Updated:**
   - Keep app open for real-time notifications
   - Check "New from Chef" regularly
   - Monitor "On the Way" for active deliveries

5. **Manual Orders:**
   - Use for walk-in customers
   - Get accurate address details
   - Confirm payment method

---

## 🚀 You're Ready!

### Start Delivering:

1. **Login:** `solomon.driver@maad.com` / `password123`
2. **Dashboard:** Check available deliveries
3. **Accept:** Click "Accept & Pick Up"
4. **Deliver:** Navigate to customer
5. **Confirm:** Click "Confirm Delivered"
6. **Earn:** Watch your earnings grow!

---

**Happy Delivering! 🚚💨**

**Dashboard:** `http://localhost:5174/driver`  
**Status:** ✅ Ready to Use  
**Support:** Available via Live Chat

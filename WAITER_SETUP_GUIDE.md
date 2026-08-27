# 🍽️ Waiter Dashboard Setup Guide

## Quick Start

The Waiter Dashboard is already integrated and ready to use! No additional setup needed.

---

## 🔑 Login Credentials

```
URL: http://localhost:5174/login
Email: meron.waiter@maad.com
Password: password123
```

---

## 📱 Feature Overview

### 1. Dashboard Home (`/waiter`)
**What you'll see:**
- 📊 Stats cards (In Kitchen, Ready to Serve, Served, Total)
- 📋 Recent active orders
- ⚡ Quick action links

**Try this:**
- Click on any stat card to navigate to that section
- Click "Ready Orders" if there are orders waiting

### 2. New Coming Orders (`/waiter/orders/new`)
**What you'll see:**
- 🆕 Pending orders waiting for kitchen confirmation
- ⏰ Urgency alerts for orders waiting too long
- 📝 Customer info and special instructions

**Waiter action:**
- View new orders
- Wait for kitchen to confirm
- Orders automatically move to "Cooking" when accepted

### 3. Cooking (`/waiter/orders/cooking`)
**What you'll see:**
- 🔥 Orders currently being prepared
- ⏱️ Cooking time tracker
- 🚨 Alerts for orders taking longer than usual

**Waiter action:**
- Monitor cooking progress
- Be ready to serve when food is done
- Get notified when order is ready

### 4. Food Ready (`/waiter/orders/ready`)
**What you'll see:**
- ✅ Orders ready to be served
- 🔔 Animated "READY!" indicators
- ⚠️ Waiting time alerts

**Waiter action:**
- **Click "MARK AS SERVED"** after delivering food
- This is the main action for waiters!

### 5. New Order (POS) (`/waiter/new-order`)
**What you'll see:**
- Coming soon placeholder
- Manual order creation feature

**Future feature:**
- Create walk-in orders manually
- Select from menu
- Assign to tables

### 6. My Orders (`/waiter/my-orders`)
**What you'll see:**
- Complete order history
- Filter: Active / Completed / All
- Order details and status

### 7. Profile (`/waiter/profile`)
**What you can do:**
- 📸 Upload profile photo
- ✏️ Edit name, email, phone
- 📝 Add bio and experience
- 💾 Save changes

### 8. Chat & Support
- 💬 Live chat with customers/admin
- 🆘 Submit support tickets
- 📞 Quick contact options

---

## 🎬 Complete Workflow Example

### Scenario: Serving a Table

**Step 1: New Order Arrives**
```
✓ Notification appears: "New dine-in order received!"
✓ Order shows in "New Coming Orders"
✓ See customer name: "John Doe"
✓ See table: "Table #5"
✓ See items: "2x Pizza, 1x Salad"
```

**Step 2: Kitchen Confirms**
```
✓ Order moves to "Cooking" page automatically
✓ See "COOKING IN PROGRESS" status
✓ Track elapsed time
```

**Step 3: Food Ready**
```
✓ Notification: "Order ready to serve!"
✓ Sound alert plays
✓ Order appears in "Food Ready" page
✓ Green "READY TO SERVE NOW!" banner shows
```

**Step 4: Serve to Customer**
```
✓ Pick up food from kitchen
✓ Deliver to Table #5
✓ Click "MARK AS SERVED" button
✓ Success message: "Order marked as served!"
✓ Order moves to completed
```

---

## 🔔 Notification System

### You'll Receive Notifications For:

1. **New Orders**
   - Toast: "New dine-in order received!"
   - Badge: Red "NEW" indicator
   - Sound: notification.mp3

2. **Orders Ready**
   - Toast: "Order ready to serve!"
   - Badge: Green "READY!" indicator
   - Sound: notification.mp3
   - Animation: Pulsing green card

3. **Status Updates**
   - Real-time UI updates
   - No page refresh needed
   - Instant synchronization

---

## 🎨 Visual Indicators

### Color Meanings:
- 🟡 **Yellow** = New/Pending
- 🔵 **Blue** = Confirmed
- 🟣 **Purple** = Cooking/Preparing
- 🟢 **Green** = Ready to Serve
- 🟤 **Gray** = Completed/Served

### Icons:
- 🔔 Bell = New notification
- 🔥 Flame = Currently cooking
- ✅ Checkmark = Ready/Complete
- ⏰ Clock = Time tracking
- ⚠️ Warning = Urgent attention needed

---

## 📊 Understanding the Dashboard

### Stats Cards Explained:

1. **In Kitchen** (Blue Card)
   - Orders being prepared right now
   - Includes: PENDING + CONFIRMED + PREPARING
   - Click to see cooking orders

2. **Ready to Serve** (Green Card)
   - Food is done, waiting for you!
   - Most important for waiters
   - Click to serve customers

3. **Served Today** (Purple Card)
   - Orders you've delivered today
   - Your performance metric
   - Resets at midnight

4. **Total Orders Today** (Orange Card)
   - All orders today
   - Overall restaurant activity

---

## ⚡ Quick Tips

### For Best Performance:

1. **Keep Browser Tab Open**
   - Real-time updates need active connection
   - Notifications work automatically

2. **Check "Food Ready" Often**
   - Minimize customer wait time
   - Click notification to go directly there

3. **Use "Mark as Served" Immediately**
   - After delivering food to customer
   - Keeps order status accurate

4. **Review Special Instructions**
   - Always check amber boxes
   - Customer requests are important

5. **Monitor Cooking Times**
   - Red text = waiting long
   - May need to check with kitchen

---

## 🐛 Common Issues & Solutions

### Issue: No orders showing
**Check:**
- Are you logged in as waiter?
- Is your restaurant assigned?
- Are there actual orders in system?

**Test:**
- Log in as customer
- Create a dine-in order
- Should appear in waiter dashboard

### Issue: "Mark as Served" button not working
**Check:**
- Is order status READY_TO_SERVE?
- Are you logged in?
- Check browser console for errors

### Issue: Not receiving notifications
**Check:**
- Is Socket.IO connected? (green dot in header)
- Is server running?
- Try refreshing the page

### Issue: Orders stuck in one status
**Check:**
- Chef needs to update status
- Order workflow:
  - PENDING → CONFIRMED (chef accepts)
  - PREPARING → READY_TO_SERVE (chef marks ready)
  - READY_TO_SERVE → SERVED (waiter serves)

---

## 🎯 Best Practices

### For Excellent Service:

1. **Stay Alert**
   - Monitor "Food Ready" section
   - Serve food while hot
   - Quick response time

2. **Communicate**
   - Note special instructions
   - Check with kitchen if delayed
   - Use chat for coordination

3. **Update Status Promptly**
   - Mark as served immediately
   - Keep system accurate
   - Help other staff

4. **Professional Profile**
   - Upload clear photo
   - Keep info updated
   - Add service experience

---

## 📞 Need Help?

### Support Options:

1. **In-App Support**
   - Go to `/waiter/support`
   - Submit ticket
   - Get help from admin

2. **Live Chat**
   - Go to `/waiter/chat`
   - Message admin/manager
   - Real-time assistance

3. **Quick Contacts**
   - Email: support@maad.com
   - Phone: +251 911 234 567

---

## ✅ Daily Checklist

### Start of Shift:
- [ ] Log in to waiter dashboard
- [ ] Check profile is updated
- [ ] Review "New Orders" section
- [ ] Note any special events

### During Shift:
- [ ] Monitor "Food Ready" section
- [ ] Serve orders promptly
- [ ] Mark orders as served
- [ ] Check special instructions

### End of Shift:
- [ ] Review "Served Today" count
- [ ] Check "My Orders" history
- [ ] Report any issues
- [ ] Log out

---

## 🎊 You're Ready!

The Waiter Dashboard is designed to make your service efficient and customer satisfaction high. Enjoy using it!

**Happy Serving! 🍽️✨**

---

**Pro Tip:** Keep the "Food Ready" page bookmarked for quick access during busy hours!

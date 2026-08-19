# Backend Server Setup & Troubleshooting Guide

## ✅ Server is Now Running!

Your backend server is successfully running on **http://localhost:5000**

### Current Status:
- ✅ Server: Running on port 5000
- ✅ Socket.IO: Ready for real-time communication
- ✅ Database: Connected to Neon PostgreSQL
- ✅ API Endpoints: Available

---

## 🚀 How to Start/Stop the Server

### Start Server (Development Mode with Auto-Reload)
```bash
cd server
npm run dev
```

### Start Server (Production Mode)
```bash
cd server
npm start
```

### Stop Server
Press `Ctrl + C` in the terminal where the server is running

---

## 🔧 Common Issues & Solutions

### Issue 1: "EADDRINUSE: address already in use :::5000"
**Problem**: Another process is using port 5000

**Solution**:
```powershell
# Find the process using port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess

# Kill the process (replace XXXX with the process ID)
Stop-Process -Id XXXX -Force

# Or use this one-liner
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

### Issue 2: "Failed to load resource: net::ERR_CONNECTION_REFUSED"
**Problem**: Backend server is not running

**Solution**: Start the server using `npm run dev` in the server folder

### Issue 3: "500 Internal Server Error" on Registration
**Possible Causes**:
1. Database connection issue
2. Missing required fields
3. Duplicate email/phone number

**Check Server Logs**: Look at the terminal where server is running for detailed error messages

---

## 📁 Server Structure

```
server/
├── src/
│   ├── server.js          # Main server file
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth, validation, etc.
│   └── utils/             # Helper functions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js            # Sample data
├── .env                   # Environment variables
└── package.json           # Dependencies
```

---

## 🗄️ Database Commands

### Generate Prisma Client (after schema changes)
```bash
npm run db:generate
```

### Push Schema to Database
```bash
npm run db:push
```

### Seed Database with Sample Data
```bash
npm run db:seed
```

### Reset Database (⚠️ Deletes all data)
```bash
npm run db:reset
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Addresses
- `GET /api/addresses` - Get all addresses
- `POST /api/addresses` - Add new address
- `DELETE /api/addresses/:id` - Delete address

### Foods
- `GET /api/foods` - Get all foods
- `GET /api/foods/:id` - Get single food
- `GET /api/foods/categories` - Get all categories

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get single restaurant

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

---

## 🔐 Environment Variables (.env)

```env
PORT=5000
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret_key"
```

**Important**: Never commit `.env` file to Git!

---

## 📊 Monitoring Server

### Check if server is running
```powershell
# Check if port 5000 is in use
Test-NetConnection -ComputerName localhost -Port 5000
```

### View server logs
The server logs appear in the terminal where you ran `npm run dev`

---

## 🐛 Debug Mode

To see detailed logs, you can modify the server to log all requests:

```javascript
// Add this middleware in server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

---

## 🔄 Auto-Restart on File Changes

The server uses **nodemon** which automatically restarts when you save changes to any `.js` file.

To manually restart:
```bash
# Type 'rs' in the terminal and press Enter
rs
```

---

## ✨ Quick Start Checklist

- [x] Install dependencies: `npm install`
- [x] Configure `.env` file
- [x] Generate Prisma client: `npm run db:generate`
- [x] Push database schema: `npm run db:push`
- [x] (Optional) Seed sample data: `npm run db:seed`
- [x] Start server: `npm run dev`
- [x] Test API: Visit http://localhost:5000

---

## 🆘 Need Help?

1. **Check server logs** in the terminal
2. **Test API endpoints** using Postman or curl
3. **Verify database connection** in .env file
4. **Ensure port 5000 is free**
5. **Check for error messages** in both frontend and backend consoles

---

## 📝 Notes

- The server is configured to accept requests from any origin (CORS enabled)
- JWT tokens are used for authentication
- Socket.IO is enabled for real-time features
- The database uses PostgreSQL (hosted on Neon)

Your server is ready! You can now use the application without connection errors. 🎊

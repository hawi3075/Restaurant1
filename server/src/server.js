const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] }
});

app.use(cors());
app.use(express.json());

// Make io available to routes
app.set('io', io);

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ROMS Server is running' });
});

// Socket.io Real-Time Event Handling for Staff Workflows
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join role/restaurant specific rooms
  socket.on('join_room', (roomKey) => {
    socket.join(roomKey);
    console.log(`Socket ${socket.id} joined room: ${roomKey}`);
  });

  // Join user-specific room for personal notifications
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined user room: ${userId}`);
  });

  // Chef -> Driver / Waiter notification sync
  socket.on('update_order_status', (data) => {
    // data: { orderId, status, restaurantId, targetRole, customerId }
    io.to(data.restaurantId).emit('order_status_updated', data);
    if (data.customerId) {
      io.to(data.customerId).emit('order_status_updated', data);
    }
  });

  // New order notification
  socket.on('new_order', (data) => {
    io.to(data.restaurantId).emit('new_order', data);
  });

  // Chat message
  socket.on('send_message', (data) => {
    io.to(data.recipientId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`ROMS Server running on port ${PORT}`);
  console.log(`Socket.IO ready for real-time communication`);
});
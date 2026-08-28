const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

// Explicitly load .env from the parent server directory since server.js is inside /src
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import Google Gen AI SDK and initialize with explicit API key
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Prisma client for DB access in socket handlers
const prisma = require('./config/prisma');

const app = express();
const server = http.createServer(app);

// CORS configuration for production and development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://restaurant1-rust-ten.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

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
const chefRoutes = require('./routes/chefRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/supportRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chef', chefRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ROMS Server is running' });
});

// Socket.io Real-Time Event Handling for Staff Workflows & AI Chatbot
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

  // AI-Powered Chat message handler
  // Live Chat & Support Message Handler
  socket.on('send_message', async (data) => {
    // Persist message to DB (non-AI messages only)
    if (!data.useAi && data.senderId && data.text) {
      try {
        await prisma.supportMessage.create({
          data: {
            senderId: data.senderId,
            senderName: data.senderName || data.sender || 'Unknown',
            senderRole: data.userRole || data.senderRole || 'CUSTOMER',
            text: data.text,
            recipientId: data.recipientId || null,
            isFromAdmin: data.userRole === 'ADMIN' || data.sender === 'admin',
          },
        });
      } catch (e) {
        console.error('Failed to persist support message:', e.message);
      }
    }

    // Forward message to specific recipient user room if specified
    if (data.recipientId) {
      io.to(data.recipientId).emit('receive_message', data);
    }

    // Always broadcast user/staff support messages to admin_global room so Admin sees them live
    if (data.sender !== 'admin' && data.userRole !== 'ADMIN') {
      io.to('admin_global').emit('receive_message', data);
    }

    // Optional: Gemini AI response for automated support if no human admin responds immediately
    if (data.useAi || data.recipientId === 'ai_support') {
      try {
        const userRole = data.userRole || 'Customer';
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: data.text || data.message || '',
          config: {
            systemInstruction: `You are Ma'ad Support, an intelligent, friendly AI assistant for "Ma'ad", a restaurant and food delivery platform based in Adama, Ethiopia. 
            Current User Role: ${userRole}.
            Adapt your response based on the user's role:
            - If Customer: Help with traditional Ethiopian foods (Doro Wot, Kitfo, Tibs, Shiro), order tracking, delivery fees (50 ETB), and Chapa payments.
            - If Admin: Assist with restaurant administration, POS, order oversight, food catalog, employee roles, and system management.
            - If Chef: Provide kitchen operation guidance, order prep advice, Ethiopian recipe standard specs, kitchen workflows, and inventory tracking.
            - If Waiter: Assist with table service management, fast order status checks, customer menu suggestions, and billing guidance.
            - If Driver: Help with Adama delivery routes/navigation, order pickup procedures, 50 ETB delivery fee policy, and customer handoff tips.
            Keep your answers concise, helpful, professional, and polite.`,
            temperature: 0.7,
          },
        });

        const botReply = {
          id: Date.now() + 1,
          sender: "Ma'ad Support",
          senderName: "Ma'ad AI Support",
          text: response.text,
          timestamp: new Date(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        socket.emit('receive_message', botReply);
      } catch (error) {
        console.error("Gemini AI Chat Error:", error);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`ROMS Server running on port ${PORT}`);
  console.log(`Socket.IO ready for real-time communication with Gemini AI`);
});
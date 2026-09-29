const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

// Explicitly load .env from the parent server directory since server.js is inside /src
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import Google Gen AI SDK and initialize with explicit API key
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Debug: Check if API key is loaded
console.log(`🔑 GEMINI_API_KEY loaded: ${process.env.GEMINI_API_KEY ? 'YES ✓' : 'NO ✗'}`);
console.log(`🔑 GEMINI_API_KEY preview: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'MISSING'}`);

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Import RAG context
const { siteContext } = require('./config/ragContext');

// Prisma client for DB access in socket handlers
const prisma = require('./config/prisma');

const app = express();
const server = http.createServer(app);

// CORS configuration for production and development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://restaurant1-rust-ten.vercel.app',
  'http://maad.emerald-import-export.com',
  'https://maad.emerald-import-export.com',
  'https://emerald-import-export.com',
  'http://backend.emerald-import-export.com',
  'https://backend.emerald-import-export.com',
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

// Matches ANY Vercel preview/branch URL for this specific project
const vercelPreviewPattern = /^https:\/\/restaurant1-[a-z0-9-]+-hawis-projects-b3fda57f\.vercel\.app$/;

function isAllowedOrigin(origin) {
  if (!origin) return true; // mobile apps, curl, server-to-server, etc.
  if (allowedOrigins.indexOf(origin) !== -1) return true;
  if (vercelPreviewPattern.test(origin)) return true;
  return false;
}

const corsOptions = {
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) {
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
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files (uploads) with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static('uploads'));

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
const uploadRoutes = require('./routes/uploadRoutes');
const chatRoutes = require('./routes/chatRoutes');

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
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

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
    io.to(data.restaurantId).emit('order_status_updated', data);
    if (data.customerId) {
      io.to(data.customerId).emit('order_status_updated', data);
    }
  });

  // New order notification
  socket.on('new_order', (data) => {
    io.to(data.restaurantId).emit('new_order', data);
  });

  // AI-Powered Chat message handler & Live Support
  socket.on('send_message', async (data) => {
    // Save non-AI messages (contact messages and admin responses) to database
    if (data.senderId && data.text && !data.useAi) {
      try {
        await prisma.supportMessage.create({
          data: {
            senderId: String(data.senderId), // Ensure senderId is string
            senderName: data.senderName || data.sender || 'Unknown',
            senderRole: data.userRole || data.senderRole || 'CUSTOMER',
            text: data.text,
            recipientId: data.recipientId || null,
            isFromAdmin: data.userRole === 'ADMIN' || data.isFromAdmin || false,
          },
        });
        console.log(`✓ Message saved for senderId: ${data.senderId}, senderName: ${data.senderName}`);
      } catch (e) {
        console.error('Failed to persist support message:', e.message);
      }
    }

    if (data.recipientId) {
      io.to(data.recipientId).emit('receive_message', data);
    }

    if (data.sender !== 'admin' && data.userRole !== 'ADMIN') {
      io.to('admin_global').emit('receive_message', data);
    }

    if (data.useAi || data.recipientId === 'ai_support') {
      try {
        console.log(`🤖 AI Request received: useAi=${data.useAi}, text="${data.text}", recipientId=${data.recipientId}`);
        console.log(`🔑 API Key available: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
        const userRole = data.userRole || 'Customer';
        
        // Send immediate acknowledgment to client
        socket.emit('receive_message', {
          id: Date.now() + 0.5,
          sender: "Ma'ad Support",
          senderName: "Ma'ad AI Support",
          text: '⏳ Processing your request...',
          timestamp: new Date(),
          isProcessing: true
        });

        console.log(`📡 Initializing Gemini model...`);
        const model = ai.getGenerativeModel({ 
          model: 'gemini-pro',
          systemInstruction: `You are Ma'ad Support, an intelligent, friendly AI assistant for "Ma'ad", a restaurant and food delivery platform.
          
${siteContext}

Current User Role: ${userRole}.

Your Instructions:
1. Answer questions about Ma'ad using the context provided above
2. Be helpful, friendly, and professional
3. If user asks about something not in the context, say "I don't have information about that, but our support team can help"
4. Keep responses concise (2-3 sentences max)
5. Adapt your response based on the user's role:
   - For Customers: Help with menus, orders, delivery, payments
   - For Admin/Staff: Assist with management, operations, system features`
        });
        
        console.log(`📤 Sending request to Gemini API...`);
        const generatePromise = model.generateContent(data.text || data.message || 'Hello');
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini API timeout after 8 seconds')), 8000)
        );
        
        const response = await Promise.race([generatePromise, timeoutPromise]);

        console.log(`✅ AI Response received from Gemini`);
        
        const responseText = response.response?.text?.() || 'I could not generate a response at this time. Please try again.';
        
        console.log(`📝 Response: "${responseText.substring(0, 100)}..."`);
        
        const botReply = {
          id: Date.now() + 1,
          sender: "Ma'ad Support",
          senderName: "Ma'ad AI Support",
          text: responseText,
          timestamp: new Date(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        console.log(`📤 Emitting response to client socket: ${socket.id}`);
        socket.emit('receive_message', botReply);
      } catch (error) {
        console.error("❌ Gemini AI Chat Error:", error.message);
        console.error("❌ Error details:", error);
        console.error("❌ Error stack:", error.stack);
        
        // Send helpful error message to user
        let errorMessage = 'I apologize, but I\'m temporarily unavailable. Please try again in a moment.';
        
        if (error.message.includes('timeout')) {
          errorMessage = 'I\'m taking longer than usual to respond. Please try again.';
          console.error(`⏱️ TIMEOUT: Gemini took too long to respond`);
        } else if (error.message.includes('API') || error.message.includes('401') || error.message.includes('403') || error.message.includes('UNAUTHENTICATED') || error.message.includes('PERMISSION_DENIED')) {
          errorMessage = 'Our AI service encountered an authentication issue. Our support team is here to help.';
          console.error(`🔑 API Authentication Error: ${error.message}`);
        } else if (error.message.includes('INVALID_ARGUMENT')) {
          errorMessage = 'I encountered an issue processing your request. Please try asking something else.';
          console.error(`⚠️ Invalid argument: ${error.message}`);
        }
        
        console.log(`📨 Sending error message to client`);
        socket.emit('receive_message', {
          id: Date.now() + 1,
          sender: "Ma'ad Support",
          senderName: "Ma'ad AI Support",
          text: errorMessage,
          timestamp: new Date(),
          isError: true
        });
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
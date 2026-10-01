const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

// Explicitly load .env from the parent server directory since server.js is inside /src
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import Google Gen AI SDK and initialize with explicit API key
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Model name: set GEMINI_MODEL in Render to change it without editing code
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Debug: Check if API key is loaded (never print any part of the key)
const apiKey = (process.env.GEMINI_API_KEY || '').trim();
console.log(`🔑 GEMINI_API_KEY loaded: ${apiKey ? 'YES ✓' : 'NO ✗'}`);
console.log(`🔑 GEMINI_API_KEY length: ${apiKey.length}`);
console.log(`🤖 Gemini model: ${GEMINI_MODEL}`);

let ai;
try {
  ai = new GoogleGenerativeAI(apiKey);
  console.log(`✅ GoogleGenerativeAI initialized successfully`);
} catch (error) {
  console.error(`❌ Failed to initialize GoogleGenerativeAI:`, error.message);
  ai = null;
}

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

// Test Gemini API endpoint for debugging
app.get('/api/test-ai', async (req, res) => {
  try {
    console.log('🧪 Testing Gemini AI...');

    if (!ai) {
      return res.status(500).json({
        success: false,
        error: 'GoogleGenerativeAI not initialized',
        apiKeyLoaded: !!apiKey
      });
    }

    console.log('🤖 Getting model...');
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

    console.log('📤 Sending test request...');
    const result = await model.generateContent('Say hello in one word');

    const text = result.response?.text?.();
    console.log('✅ Got response:', text);

    res.json({
      success: true,
      message: 'AI is working!',
      model: GEMINI_MODEL,
      response: text,
      apiKeyLoaded: !!apiKey
    });
  } catch (error) {
    console.error('❌ AI Test Error:', error.message);
    res.status(500).json({
      success: false,
      model: GEMINI_MODEL,
      status: error.status || null,
      error: error.message,
      apiKeyLoaded: !!apiKey
    });
  }
});

// Models to try in order. If the first is busy (503) or slow, the next one is used.
// Override with GEMINI_MODEL and GEMINI_FALLBACK_MODELS (comma separated) in Render.
const MODEL_CHAIN = [
  GEMINI_MODEL,
  ...(process.env.GEMINI_FALLBACK_MODELS || 'gemini-3.1-flash-lite,gemini-flash-latest').split(',')
].map((m) => m.trim()).filter(Boolean).filter((m, i, a) => a.indexOf(m) === i);
const PER_MODEL_TIMEOUT_MS = 12000;

function isRetryable(error) {
  const msg = String(error?.message || '');
  const status = error?.status;
  return (
    msg.includes('timeout') ||
    [404, 429, 500, 503].includes(status) ||
    msg.includes('overloaded') ||
    msg.includes('RESOURCE_EXHAUSTED')
  );
}

async function generateWithFallback(text, systemInstruction) {
  let lastError;
  for (const name of MODEL_CHAIN) {
    let timeoutId;
    try {
      console.log(`📡 Trying Gemini model: ${name}`);
      const model = ai.getGenerativeModel({ model: name, systemInstruction });
      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`Gemini API timeout after ${PER_MODEL_TIMEOUT_MS / 1000} seconds`)),
          PER_MODEL_TIMEOUT_MS
        );
      });
      const result = await Promise.race([model.generateContent(text), timeout]);
      return { result, modelUsed: name };
    } catch (err) {
      lastError = err;
      console.error(`⚠️ Model ${name} failed (status ${err.status || 'n/a'}): ${err.message}`);
      if (!isRetryable(err)) throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw lastError;
}

// Turn a Gemini error into a friendly message for the customer
function getFriendlyAiError(error) {
  const msg = String(error?.message || '');
  const status = error?.status;

  if (msg.includes('timeout')) {
    return { text: 'I\'m taking longer than usual to respond. Please try again.', reason: 'TIMEOUT' };
  }
  if (status === 404 || msg.includes('404')) {
    return { text: 'Our AI assistant is being updated. Please try again shortly or contact support.', reason: 'MODEL NOT FOUND (check GEMINI_MODEL)' };
  }
  if (status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return { text: 'Our AI assistant is very busy right now. Please try again in a minute.', reason: 'RATE LIMIT / QUOTA' };
  }
  if (status === 401 || status === 403 || msg.includes('API_KEY_INVALID') || msg.includes('API key not valid') || msg.includes('PERMISSION_DENIED') || msg.includes('UNAUTHENTICATED')) {
    return { text: 'Our AI service encountered an authentication issue. Our support team is here to help.', reason: 'AUTHENTICATION / API KEY' };
  }
  if (status === 400 || msg.includes('INVALID_ARGUMENT')) {
    return { text: 'I encountered an issue processing your request. Please try asking something else.', reason: 'INVALID ARGUMENT' };
  }
  if (status === 503 || msg.includes('503') || msg.includes('overloaded')) {
    return { text: 'Our AI assistant is temporarily overloaded. Please try again in a moment.', reason: 'SERVICE OVERLOADED' };
  }
  return { text: 'I apologize, but I\'m temporarily unavailable. Please try again in a moment.', reason: 'UNKNOWN' };
}

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
    console.log(`\n📨 MESSAGE RECEIVED: useAi=${data.useAi}, recipientId=${data.recipientId}, text="${data.text?.substring(0, 50)}..."`);

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

    if (data.recipientId && data.recipientId !== 'ai_support') {
      io.to(data.recipientId).emit('receive_message', data);
    }

    if (data.sender !== 'admin' && data.userRole !== 'ADMIN' && !data.useAi) {
      io.to('admin_global').emit('receive_message', data);
    }

    
    const isAiRequest = data.useAi === true || data.recipientId === 'ai_support';
    console.log(`🤔 Is AI Request: ${isAiRequest}`);

    if (isAiRequest) {
      console.log(`✅ PROCESSING AI REQUEST!`);

      if (!ai) {
        console.error(`❌ AI Handler Error: GoogleGenerativeAI not initialized`);
        socket.emit('receive_message', {
          id: Date.now() + 1,
          sender: "Ma'ad Support",
          senderName: "Ma'ad AI Support",
          text: 'Our AI service is temporarily unavailable due to configuration issues. Please try again later or contact support.',
          timestamp: new Date(),
          isError: true
        });
        return;
      }

      try {
        console.log(`🤖 AI Request received: useAi=${data.useAi}, text="${data.text}"`);
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

        const systemInstruction = `You are Ma'ad Support, an intelligent, friendly AI assistant for "Ma'ad", a restaurant and food delivery platform.

${siteContext}

Current User Role: ${userRole}.

Your Instructions:
1. Answer questions about Ma'ad using the context provided above
2. Be helpful, friendly, and professional
3. If user asks about something not in the context, say "I don't have information about that, but our support team can help"
4. Keep responses concise (2-3 sentences max)
5. Adapt your response based on the user's role:
   - For Customers: Help with menus, orders, delivery, payments
   - For Admin/Staff: Assist with management, operations, system features`;

        console.log(`📤 Sending request to Gemini API...`);
        const { result: response, modelUsed } = await generateWithFallback(
          data.text || data.message || 'Hello',
          systemInstruction
        );

        console.log(`✅ AI Response received from Gemini (${modelUsed})`);

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
        console.error("❌ Error status:", error.status, error.statusText);
        console.error("❌ Error stack:", error.stack);

        const friendly = getFriendlyAiError(error);
        console.error(`⚠️ AI failure reason: ${friendly.reason}`);

        console.log(`📨 Sending error message to client`);
        socket.emit('receive_message', {
          id: Date.now() + 1,
          sender: "Ma'ad Support",
          senderName: "Ma'ad AI Support",
          text: friendly.text,
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
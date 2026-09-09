const axios = require('axios');
const prisma = require('../config/prisma');

// Get base URLs from environment or use defaults
const getBaseUrls = () => {
  const backend = process.env.BACKEND_URL || 'https://backend.emerald-import-export.com';
  const frontend = process.env.FRONTEND_URL || 'https://maad.emerald-import-export.com';
  
  console.log('🔗 Payment URLs:', { backend, frontend });
  return { backend, frontend };
};

// Temporary storage for pending order payloads keyed by tx_ref
const pendingOrders = new Map();

// Initialize Chapa Payment WITH Order Data (Order created after payment succeeds)
const initializeChapaPaymentWithOrder = async (req, res) => {
  try {
    const { orderData, amount, email, first_name, last_name, phone_number } = req.body;

    if (!orderData || !amount) {
      return res.status(400).json({ error: 'Please provide order data and amount.' });
    }

    const tx_ref = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const secretKey = (process.env.CHAPA_SECRET_KEY || '').trim();

    if (!secretKey) {
      return res.status(400).json({ error: 'Chapa Secret Key is not configured on the server.' });
    }

    // Add customerId from authenticated user and store temporarily
    const completeOrderData = {
      ...orderData,
      customerId: req.user.id,  // Add customer ID from authenticated user
      total: amount,
    };
    
    pendingOrders.set(tx_ref, completeOrderData);
    console.log(`💾 Stored pending order for tx_ref: ${tx_ref}, customerId: ${req.user.id}`);

    // Clean and validate inputs for Chapa
    let customerEmail = (email || '').trim();
    if (!customerEmail || customerEmail.toLowerCase().endsWith('@example.com') || customerEmail.toLowerCase().endsWith('@test.com')) {
      customerEmail = 'customer@gmail.com';
    }

    const customerFirstName = (first_name || '').trim() || 'Valued';
    const customerLastName = (last_name || '').trim() || customerFirstName;
    
    let customerPhone = (phone_number || '').trim().replace(/[\s-]/g, '');
    if (!customerPhone || customerPhone.length < 9) {
      customerPhone = '0912345678';
    }

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount: parseFloat(amount).toFixed(2),
        currency: 'ETB',
        email: customerEmail,
        first_name: customerFirstName,
        last_name: customerLastName,
        phone_number: customerPhone,
        tx_ref,
        // Hardcoded clean URL to completely avoid validation errors
        callback_url: 'https://backend.emerald-import-export.com/api/payments/callback',
        return_url: `https://maad.emerald-import-export.com/order-success?tx_ref=${tx_ref}`,
        customization: {
          title: "Maad Payment",
          description: `Order Payment`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.status === 'success' && response.data.data?.checkout_url) {
      return res.status(200).json({
        success: true,
        checkout_url: response.data.data.checkout_url,
        tx_ref,
      });
    }

    res.status(400).json({
      error: response.data?.message || 'Chapa initialization failed',
      details: response.data,
    });
  } catch (error) {
    console.error('Chapa Initialization Error:', error.response?.data || error.message);
    
    let errMsg = 'Payment initialization failed.';
    const responseMessage = error.response?.data?.message;

    if (responseMessage) {
      if (typeof responseMessage === 'string') {
        errMsg = responseMessage;
      } else if (typeof responseMessage === 'object') {
        if (responseMessage.email) {
          errMsg = 'Invalid email address provided for payment. Please use a valid email address (e.g. user@gmail.com).';
        } else if (responseMessage.phone_number) {
          errMsg = 'Invalid phone number provided for payment. Please use a valid Ethiopian phone number (e.g. 0912345678).';
        } else {
          errMsg = Object.values(responseMessage).flat().join(', ');
        }
      }
    } else if (error.response?.data?.error) {
      errMsg = typeof error.response.data.error === 'string' ? error.response.data.error : JSON.stringify(error.response.data.error);
    } else if (error.message) {
      errMsg = error.message;
    }

    const statusCode = error.response?.status && error.response.status >= 400 && error.response.status < 600
      ? error.response.status
      : 500;

    res.status(statusCode).json({ error: errMsg });
  }
};

// Initialize standard Chapa Payment
const initializeChapaPayment = async (req, res) => {
  try {
    const { orderId, amount, email, first_name, last_name, phone_number } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'Please provide order ID and amount.' });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: 'Associated order not found.' });
    }

    const tx_ref = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const secretKey = (process.env.CHAPA_SECRET_KEY || '').trim();

    if (!secretKey) {
      return res.status(400).json({ error: 'Chapa Secret Key is not configured on the server.' });
    }

    await prisma.payment.upsert({
      where: { orderId },
      update: { transactionId: tx_ref, status: 'PENDING', amount: parseFloat(amount) },
      create: {
        orderId,
        amount: parseFloat(amount),
        method: 'CHAPA',
        status: 'PENDING',
        transactionId: tx_ref,
      },
    });

    let customerEmail = (email || '').trim();
    if (!customerEmail || customerEmail.toLowerCase().endsWith('@example.com') || customerEmail.toLowerCase().endsWith('@test.com')) {
      customerEmail = 'customer@gmail.com';
    }

    const customerFirstName = (first_name || '').trim() || 'Valued';
    const customerLastName = (last_name || '').trim() || customerFirstName;
    
    let customerPhone = (phone_number || '').trim().replace(/[\s-]/g, '');
    if (!customerPhone || customerPhone.length < 9) {
      customerPhone = '0912345678';
    }

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount: parseFloat(amount).toFixed(2),
        currency: 'ETB',
        email: customerEmail,
        first_name: customerFirstName,
        last_name: customerLastName,
        phone_number: customerPhone,
        tx_ref,
        callback_url: 'https://backend.emerald-import-export.com/api/payments/callback',
        return_url: `https://maad.emerald-import-export.com/order-success?tx_ref=${tx_ref}&orderId=${orderId}`,
        customization: {
          title: "Maad Payment",
          description: `Order ${orderId}`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.status === 'success' && response.data.data?.checkout_url) {
      return res.status(200).json({
        success: true,
        checkout_url: response.data.data.checkout_url,
        tx_ref,
      });
    }

    res.status(400).json({
      error: response.data?.message || 'Chapa initialization failed',
      details: response.data,
    });
  } catch (error) {
    console.error('Chapa Initialization Error:', error.response?.data || error.message);
    let errMsg = error.response?.data?.message || error.message || 'Payment initialization failed.';
    res.status(500).json({ error: typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg) });
  }
};

// Helper function to create order in DB after payment verification succeeds
const createOrderFromPendingData = async (tx_ref, verifiedAmount) => {
  const orderPayload = pendingOrders.get(tx_ref);
  if (!orderPayload) return null;

  try {
    // Create the order with status CONFIRMED since payment is verified
    const newOrder = await prisma.order.create({
      data: {
        ...orderPayload,
        status: 'CONFIRMED',
        items: {
          create: orderPayload.items?.map(item => ({
            foodId: item.foodId,
            quantity: item.quantity,
            price: item.price,
          })) || []
        }
      },
      include: {
        items: { include: { food: true } },
        customer: { select: { name: true, phone: true, email: true } },
        restaurant: true,
        address: true,
      },
    });

    // Create completed payment record linked to this order
    await prisma.payment.create({
      data: {
        orderId: newOrder.id,
        amount: verifiedAmount,
        method: 'CHAPA',
        status: 'COMPLETED',
        transactionId: tx_ref,
      }
    });

    // Clear from memory map
    pendingOrders.delete(tx_ref);
    return newOrder;
  } catch (err) {
    console.error('Error creating order from pending cache:', err);
    return null;
  }
};

// Chapa Callback Handler
const handleChapaCallback = async (req, res) => {
  try {
    const tx_ref = req.query.tx_ref || req.body?.tx_ref || req.params.tx_ref;
    console.log(`📥 Chapa Callback received for tx_ref: ${tx_ref}`);

    if (!tx_ref) {
      return res.status(400).json({ success: false, error: 'Missing transaction reference' });
    }

    const secretKey = (process.env.CHAPA_SECRET_KEY || '').trim();
    const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    if (response.data.status === 'success' || response.data.data?.status === 'success') {
      const verifiedAmount = parseFloat(response.data.data?.amount || 0);
      
      // Check if order already exists by payment tx_ref
      let paymentRecord = await prisma.payment.findFirst({ where: { transactionId: tx_ref } });
      let orderId = paymentRecord ? paymentRecord.orderId : null;
      let updatedOrder = null;

      if (!orderId && pendingOrders.has(tx_ref)) {
        // Create the order now since payment passed!
        updatedOrder = await createOrderFromPendingData(tx_ref, verifiedAmount);
        orderId = updatedOrder?.id;
      } else if (orderId) {
        await prisma.payment.updateMany({
          where: { orderId },
          data: { status: 'COMPLETED', transactionId: tx_ref, amount: verifiedAmount },
        });
        updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' },
          include: {
            items: { include: { food: true } },
            customer: { select: { name: true, phone: true, email: true } },
            restaurant: true,
            address: true,
          },
        });
      }

      const io = req.app.get('io');
      if (io && updatedOrder) {
        io.to(updatedOrder.restaurantId).emit('new_order', updatedOrder);
        io.to('admin_global').emit('new_order', updatedOrder);
      }

      return res.status(200).json({ success: true, message: 'Payment processed successfully', tx_ref, orderId });
    }

    return res.status(400).json({ success: false, error: 'Payment verification failed' });
  } catch (error) {
    console.error('❌ Callback Error:', error.response?.data || error.message);
    return res.status(500).json({ success: false, error: 'Error processing payment callback' });
  }
};

// Verify Chapa Payment (Return URL endpoint)
const verifyChapaPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;
    const wantsJson = req.query.format === 'json' || req.headers.accept?.includes('application/json');

    const secretKey = (process.env.CHAPA_SECRET_KEY || '').trim();
    const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    if (response.data.status === 'success' || response.data.data?.status === 'success') {
      const verifiedAmount = parseFloat(response.data.data?.amount || 0);
      let paymentRecord = await prisma.payment.findFirst({ where: { transactionId: tx_ref } });
      let orderId = paymentRecord ? paymentRecord.orderId : null;
      let updatedOrder = null;

      if (!orderId && pendingOrders.has(tx_ref)) {
        updatedOrder = await createOrderFromPendingData(tx_ref, verifiedAmount);
        orderId = updatedOrder?.id;
      } else if (orderId) {
        await prisma.payment.updateMany({
          where: { orderId },
          data: { status: 'COMPLETED', transactionId: tx_ref, amount: verifiedAmount },
        });
        updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' },
          include: {
            items: { include: { food: true } },
            customer: { select: { name: true, phone: true, email: true } },
            restaurant: true,
            address: true,
          },
        });
      }

      const io = req.app.get('io');
      if (io && updatedOrder) {
        io.to(updatedOrder.restaurantId).emit('new_order', updatedOrder);
        io.to('admin_global').emit('new_order', updatedOrder);
      }

      const urls = getBaseUrls();
      if (wantsJson) {
        return res.status(200).json({ success: true, message: 'Payment verified', order: updatedOrder, tx_ref });
      }
      return res.redirect(`${urls.frontend}/order-success?status=success&tx_ref=${tx_ref}&orderId=${orderId || ''}`);
    } else {
      const urls = getBaseUrls();
      if (wantsJson) {
        return res.status(400).json({ success: false, error: 'Verification failed.' });
      }
      return res.redirect(`${urls.frontend}/order-success?status=failed&tx_ref=${tx_ref}`);
    }
  } catch (error) {
    console.error('Verification Error:', error.response?.data || error.message);
    const urls = getBaseUrls();
    if (req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, error: 'Error verifying payment.' });
    }
    return res.redirect(`${urls.frontend}/order-success?status=error&tx_ref=${req.params.tx_ref || ''}`);
  }
};

const createPayment = async (req, res) => {
  // standard fallback
  try {
    const { orderId, amount, method, transactionId } = req.body;
    const payment = await prisma.payment.create({
      data: { orderId, amount: parseFloat(amount), method, status: 'COMPLETED', transactionId: transactionId || `TXN-${Date.now()}` },
    });
    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await prisma.payment.findUnique({ where: { orderId }, include: { order: true } });
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { 
  initializeChapaPayment,
  initializeChapaPaymentWithOrder,
  handleChapaCallback,
  verifyChapaPayment, 
  createPayment, 
  getPaymentByOrderId 
};
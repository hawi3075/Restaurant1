const axios = require('axios');
const prisma = require('../config/prisma');

// Initialize Chapa Payment
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
        callback_url: `http://localhost:5000/api/payments/verify/${tx_ref}?orderId=${orderId}`,
        return_url: `http://localhost:5000/api/payments/verify/${tx_ref}?orderId=${orderId}`,
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

// Verify Chapa Payment
const verifyChapaPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;
    const orderId = req.query.orderId || req.body?.orderId;
    const wantsJson = req.query.format === 'json' || req.headers.accept?.includes('application/json');

    const secretKey = (process.env.CHAPA_SECRET_KEY || '').trim();
    const verifyConfig = {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    };

    const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, verifyConfig);

    if (response.data.status === 'success' || response.data.data?.status === 'success') {
      let updatedOrder = null;
      if (orderId) {
        // Record payment in database if not already created
        const existingPayment = await prisma.payment.findUnique({ where: { orderId } });
        if (!existingPayment) {
          await prisma.payment.create({
            data: {
              orderId,
              amount: parseFloat(response.data.data?.amount || 0),
              method: 'CHAPA',
              status: 'COMPLETED',
              transactionId: tx_ref,
            },
          });
        }

        // Update order status to CONFIRMED
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

        // Broadcast real-time notification to Chef and Staff via Socket.IO
        const io = req.app.get('io');
        if (io && updatedOrder) {
          io.to(updatedOrder.restaurantId).emit('new_order', updatedOrder);
          io.to('admin_global').emit('new_order', updatedOrder);
        }
      }

      if (wantsJson) {
        return res.status(200).json({ success: true, message: 'Payment verified successfully', order: updatedOrder, tx_ref });
      }

      return res.redirect(`http://localhost:5173/order-success?status=success&tx_ref=${tx_ref}&orderId=${orderId || ''}`);
    } else {
      if (wantsJson) {
        return res.status(400).json({ success: false, error: 'Chapa transaction verification failed.' });
      }
      return res.redirect(`http://localhost:5173/order-success?status=failed&tx_ref=${tx_ref}`);
    }
  } catch (error) {
    console.error('Verification Error:', error.response?.data || error.message);
    const wantsJson = req.query.format === 'json' || req.headers.accept?.includes('application/json');
    if (wantsJson) {
      return res.status(500).json({ success: false, error: 'Error verifying payment with Chapa.' });
    }
    return res.redirect(`http://localhost:5173/order-success?status=error&tx_ref=${req.params.tx_ref || ''}`);
  }
};

// Process or record manual/standard payment for an order
const createPayment = async (req, res) => {
  try {
    const { orderId, amount, method, transactionId } = req.body;

    if (!orderId || !amount || !method) {
      return res.status(400).json({ error: 'Please provide order ID, amount, and payment method.' });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: 'Associated order not found.' });
    }

    // Create payment record in Neon database
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: parseFloat(amount),
        method, // e.g., 'CASH', 'TELEBIRR'
        status: 'COMPLETED',
        transactionId: transactionId || `TXN-${Date.now()}`,
      },
    });

    // Automatically update order confirmation if payment is completed
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
      include: {
        items: { include: { food: true } },
        customer: { select: { name: true, phone: true, email: true } },
        restaurant: true,
        address: true,
      },
    });

    // Broadcast real-time notification to Chef and Staff via Socket.IO
    const io = req.app.get('io');
    if (io && updatedOrder) {
      io.to(updatedOrder.restaurantId).emit('new_order', updatedOrder);
      io.to('admin_global').emit('new_order', updatedOrder);
    }

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Internal server error during payment processing.' });
  }
};

// Get payment details by order ID
const getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found for this order.' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { 
  initializeChapaPayment, 
  verifyChapaPayment, 
  createPayment, 
  getPaymentByOrderId 
};
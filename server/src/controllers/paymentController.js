const axios = require('axios');
const prisma = require('../config/prisma');

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

// Remove whitespace/newlines, stray quotes and trailing slashes from env URLs
const cleanUrl = (value, fallback) =>
  String(value || fallback)
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim()
    .replace(/\/+$/, '');

// BACKEND_URL  = where THIS server lives (Render), without /api
// FRONTEND_URL = where customers see the website (cPanel)
const getBaseUrls = () => {
  const backend = cleanUrl(process.env.BACKEND_URL, 'https://restaurant1-qm7p.onrender.com');
  const frontend = cleanUrl(process.env.FRONTEND_URL, 'https://abdupower.com');
  console.log('🔗 Payment URLs:', { backend, frontend });
  return { backend, frontend };
};

const ORDER_INCLUDE = {
  items: { include: { food: true } },
  customer: { select: { name: true, phone: true, email: true } },
  restaurant: true,
  address: true,
};

const buildCustomer = ({ email, first_name, last_name, phone_number }) => {
  let customerEmail = (email || '').trim();
  if (!customerEmail || /@(example|test)\.com$/i.test(customerEmail)) {
    customerEmail = 'customer@gmail.com';
  }

  const first = (first_name || '').trim() || 'Valued';
  const last = (last_name || '').trim() || first;

  let phone = (phone_number || '').trim().replace(/[\s-]/g, '');
  if (!phone || phone.length < 9) {
    phone = '0912345678';
  }

  return { email: customerEmail, first_name: first, last_name: last, phone_number: phone };
};

const describeChapaError = (error) => {
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
    const e = error.response.data.error;
    errMsg = typeof e === 'string' ? e : JSON.stringify(e);
  } else if (error.message) {
    errMsg = error.message;
  }

  const status =
    error.response?.status && error.response.status >= 400 && error.response.status < 600
      ? error.response.status
      : 500;

  return { errMsg, status };
};

/* -------------------------------------------------------------------------- */
/* Pending order storage (in memory)                                          */
/* -------------------------------------------------------------------------- */
// NOTE: this is cleared whenever the server restarts or a redeploy happens.
// Do not deploy while testing a payment. Long term, store these in the database.

const pendingOrders = new Map();
const PENDING_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

setInterval(() => {
  const now = Date.now();
  for (const [ref, data] of pendingOrders) {
    if (now - (data._storedAt || 0) > PENDING_TTL_MS) pendingOrders.delete(ref);
  }
}, 30 * 60 * 1000).unref();

// Requests currently being finalized, so the callback and the return URL
// (which usually arrive together) never create the same order twice.
const inflight = new Map();

/* -------------------------------------------------------------------------- */
/* Initialize payment WITH order data (order is created after payment)        */
/* -------------------------------------------------------------------------- */

const initializeChapaPaymentWithOrder = async (req, res) => {
  let tx_ref = null;

  try {
    const { orderData, email, first_name, last_name, phone_number } = req.body;
    const clientAmount = parseFloat(req.body.amount);

    console.log('🔍 Payment initialization with order data, user:', req.user?.id);

    if (!orderData || !req.body.amount) {
      return res.status(400).json({ error: 'Please provide order data and amount.' });
    }

    if (!orderData.restaurantId) {
      console.log('❌ Missing restaurantId in orderData');
      return res.status(400).json({ error: 'Restaurant ID is required in order data.' });
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.log('❌ Missing or empty items in orderData');
      return res.status(400).json({ error: 'Order items are required.' });
    }

    const secretKey = (process.env.CHAPA_SECRET_KEY || '').trim();
    if (!secretKey) {
      return res.status(400).json({ error: 'Chapa Secret Key is not configured on the server.' });
    }

    // ---- Prices come from the database, never from the browser ----
    const requested = orderData.items.map((i) => ({
      foodId: i.foodId,
      quantity: Math.max(1, parseInt(i.quantity, 10) || 1),
    }));

    if (requested.some((i) => !i.foodId)) {
      return res.status(400).json({ error: 'Every order item needs a foodId.' });
    }

    const foodIds = [...new Set(requested.map((i) => i.foodId))];
    const foods = await prisma.food.findMany({
      where: { id: { in: foodIds } },
      select: { id: true, name: true, price: true },
    });
    const foodById = new Map(foods.map((f) => [f.id, f]));

    if (foodIds.some((id) => !foodById.has(id))) {
      return res.status(400).json({
        error: 'One or more items in your cart are no longer available. Please refresh your cart.',
      });
    }

    const items = requested.map((i) => {
      const food = foodById.get(i.foodId);
      return { foodId: i.foodId, quantity: i.quantity, price: food.price, name: food.name };
    });

    const deliveryFee = Math.max(0, parseFloat(orderData.deliveryFee) || 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalAmount = Math.round((subtotal + deliveryFee) * 100) / 100;

    if (!Number.isNaN(clientAmount) && Math.abs(clientAmount - totalAmount) > 0.01) {
      console.warn(`⚠️ Client amount ${clientAmount} differs from server total ${totalAmount}. Using server total.`);
    }

    tx_ref = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const { backend } = getBaseUrls();

    pendingOrders.set(tx_ref, {
      ...orderData,
      items,
      customerId: req.user.id,
      totalAmount,
      deliveryFee,
      _storedAt: Date.now(),
    });
    console.log(`💾 Stored pending order for tx_ref: ${tx_ref}, customerId: ${req.user.id}, total: ${totalAmount}`);

    const customer = buildCustomer({ email, first_name, last_name, phone_number });

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount: totalAmount.toFixed(2),
        currency: 'ETB',
        ...customer,
        tx_ref,
        // Chapa calls this (server to server) after payment
        callback_url: `${backend}/api/payments/callback`,
        // Customer comes back here; the backend creates the order, then
        // redirects to the frontend success page.
        return_url: `${backend}/api/payments/verify/${tx_ref}`,
        customization: {
          title: 'Maad Payment',
          description: 'Order Payment',
        },
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

    pendingOrders.delete(tx_ref);
    return res.status(400).json({
      error: response.data?.message || 'Chapa initialization failed',
      details: response.data,
    });
  } catch (error) {
    if (tx_ref) pendingOrders.delete(tx_ref);
    console.error('Chapa Initialization Error:', error.response?.data || error.message);
    const { errMsg, status } = describeChapaError(error);
    return res.status(status).json({ error: errMsg });
  }
};

/* -------------------------------------------------------------------------- */
/* Initialize standard payment (order already exists)                         */
/* -------------------------------------------------------------------------- */

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

    const secretKey = (process.env.CHAPA_SECRET_KEY || '').trim();
    if (!secretKey) {
      return res.status(400).json({ error: 'Chapa Secret Key is not configured on the server.' });
    }

    const tx_ref = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const { backend } = getBaseUrls();

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

    const customer = buildCustomer({ email, first_name, last_name, phone_number });

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount: parseFloat(amount).toFixed(2),
        currency: 'ETB',
        ...customer,
        tx_ref,
        callback_url: `${backend}/api/payments/callback`,
        return_url: `${backend}/api/payments/verify/${tx_ref}`,
        customization: {
          title: 'Maad Payment',
          description: `Order ${orderId}`,
        },
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

    return res.status(400).json({
      error: response.data?.message || 'Chapa initialization failed',
      details: response.data,
    });
  } catch (error) {
    console.error('Chapa Initialization Error:', error.response?.data || error.message);
    const { errMsg, status } = describeChapaError(error);
    return res.status(status).json({ error: errMsg });
  }
};

/* -------------------------------------------------------------------------- */
/* Verify + finalize                                                          */
/* -------------------------------------------------------------------------- */

// Ask Chapa whether the payment really succeeded.
// Only data.status counts. The top-level "status" just means the API call worked.
const verifyWithChapa = async (tx_ref) => {
  const secretKey = (process.env.CHAPA_SECRET_KEY || '').trim();
  const response = await axios.get(
    `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(tx_ref)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  const paid = response.data?.data?.status === 'success';
  const amount = parseFloat(response.data?.data?.amount || 0);
  return { paid, amount };
};

// Create the order from the pending data, together with its payment, in one
// atomic write. Returns null if it cannot be created.
const createOrderFromPendingData = async (tx_ref, verifiedAmount) => {
  const payload = pendingOrders.get(tx_ref);

  if (!payload) {
    console.error(`❌ No order payload found for tx_ref: ${tx_ref} (server restarted or payment never initialized here)`);
    return null;
  }

  if (!payload.customerId || !payload.restaurantId || !payload.items || payload.items.length === 0) {
    console.error(`❌ Invalid pending order for tx_ref: ${tx_ref}`, {
      customerId: payload.customerId,
      restaurantId: payload.restaurantId,
      itemCount: payload.items?.length || 0,
    });
    pendingOrders.delete(tx_ref);
    return null;
  }

  // Claim the payload so nothing else can create the same order
  pendingOrders.delete(tx_ref);

  try {
    const subtotal = payload.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const calculatedTotal = Math.round((subtotal + (payload.deliveryFee || 0)) * 100) / 100;

    if (verifiedAmount && Math.abs(verifiedAmount - calculatedTotal) > 0.01) {
      console.warn(`⚠️ Paid amount ${verifiedAmount} differs from order total ${calculatedTotal} for ${tx_ref}`);
    }

    const newOrder = await prisma.order.create({
      data: {
        customerId: payload.customerId,
        restaurantId: payload.restaurantId,
        orderType: payload.orderType || 'DELIVERY',
        totalAmount: calculatedTotal,
        deliveryFee: payload.deliveryFee || 0,
        discount: payload.discount || 0,
        specialInstructions: payload.specialInstructions || null,
        addressId: payload.addressId || null,
        deliveryAddress: payload.deliveryAddress || null,
        latitude: payload.latitude ? parseFloat(payload.latitude) : null,
        longitude: payload.longitude ? parseFloat(payload.longitude) : null,
        status: 'PENDING', // waits for chef acceptance
        items: {
          create: payload.items.map((item) => ({
            foodId: item.foodId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        },
        payment: {
          create: {
            amount: verifiedAmount || calculatedTotal,
            method: 'CHAPA',
            status: 'COMPLETED',
            transactionId: tx_ref,
          },
        },
      },
      include: ORDER_INCLUDE,
    });

    console.log(`✅ Order created successfully with ID: ${newOrder.id} (tx_ref: ${tx_ref})`);
    return newOrder;
  } catch (err) {
    console.error('❌ Error creating order from pending data:', err.message);
    // Nothing was written, so keep the payload so a retry can still work
    pendingOrders.set(tx_ref, payload);
    return null;
  }
};

// Shared by the callback and the return URL. Safe to call more than once for
// the same tx_ref. Returns { order, isNew }.
const finalizePayment = (tx_ref, verifiedAmount) => {
  if (inflight.has(tx_ref)) return inflight.get(tx_ref);

  const job = (async () => {
    const paymentRecord = await prisma.payment.findFirst({ where: { transactionId: tx_ref } });

    if (paymentRecord) {
      if (paymentRecord.status === 'COMPLETED') {
        const order = await prisma.order.findUnique({
          where: { id: paymentRecord.orderId },
          include: ORDER_INCLUDE,
        });
        return { order, isNew: false };
      }

      // Order existed already (standard flow); mark it paid
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { status: 'COMPLETED', amount: verifiedAmount || paymentRecord.amount },
      });
      const order = await prisma.order.update({
        where: { id: paymentRecord.orderId },
        data: { status: 'PENDING' },
        include: ORDER_INCLUDE,
      });
      return { order, isNew: true };
    }

    if (pendingOrders.has(tx_ref)) {
      const order = await createOrderFromPendingData(tx_ref, verifiedAmount);
      return { order, isNew: !!order };
    }

    return { order: null, isNew: false };
  })().finally(() => inflight.delete(tx_ref));

  inflight.set(tx_ref, job);
  return job;
};

const emitNewOrder = (req, order) => {
  const io = req.app.get('io');
  if (io && order) {
    io.to(order.restaurantId).emit('new_order', order);
    io.to('admin_global').emit('new_order', order);
  }
};

/* -------------------------------------------------------------------------- */
/* Chapa callback (server to server). Chapa sends GET ?trx_ref=...            */
/* -------------------------------------------------------------------------- */

const handleChapaCallback = async (req, res) => {
  try {
    const raw =
      req.query.tx_ref ||
      req.query.trx_ref ||
      req.body?.tx_ref ||
      req.body?.trx_ref ||
      req.params.tx_ref;
    const tx_ref = raw ? String(raw).trim() : '';

    console.log(`📥 Chapa Callback received for tx_ref: ${tx_ref}`);

    if (!tx_ref) {
      return res.status(400).json({ success: false, error: 'Missing transaction reference' });
    }

    const { paid, amount } = await verifyWithChapa(tx_ref);
    if (!paid) {
      return res.status(400).json({ success: false, error: 'Payment not completed' });
    }

    const { order, isNew } = await finalizePayment(tx_ref, amount);

    if (!order) {
      console.error(`❌ PAID BUT NO ORDER: tx_ref ${tx_ref}, amount ${amount}. Needs manual follow-up.`);
    }
    if (isNew) emitNewOrder(req, order);

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      tx_ref,
      orderId: order?.id || null,
    });
  } catch (error) {
    console.error('❌ Callback Error:', error.response?.data || error.message);
    return res.status(500).json({ success: false, error: 'Error processing payment callback' });
  }
};

/* -------------------------------------------------------------------------- */
/* Return URL: customer lands here after paying                               */
/* -------------------------------------------------------------------------- */

const verifyChapaPayment = async (req, res) => {
  const tx_ref = String(req.params.tx_ref || '').trim();
  const { frontend } = getBaseUrls();
  const wantsJson = req.query.format === 'json' || req.headers.accept?.includes('application/json');

  try {
    const { paid, amount } = await verifyWithChapa(tx_ref);

    if (!paid) {
      if (wantsJson) {
        return res.status(400).json({ success: false, error: 'Verification failed.' });
      }
      return res.redirect(`${frontend}/order-success?status=failed&tx_ref=${encodeURIComponent(tx_ref)}`);
    }

    const { order, isNew } = await finalizePayment(tx_ref, amount);

    if (!order) {
      console.error(`❌ PAID BUT NO ORDER: tx_ref ${tx_ref}, amount ${amount}. Needs manual follow-up.`);
    }
    if (isNew) emitNewOrder(req, order);

    if (wantsJson) {
      return res.status(200).json({ success: true, message: 'Payment verified', order, tx_ref });
    }
    return res.redirect(
      `${frontend}/order-success?status=success&tx_ref=${encodeURIComponent(tx_ref)}&orderId=${order?.id || ''}`
    );
  } catch (error) {
    console.error('Verification Error:', error.response?.data || error.message);
    if (wantsJson) {
      return res.status(500).json({ success: false, error: 'Error verifying payment.' });
    }
    return res.redirect(`${frontend}/order-success?status=error&tx_ref=${encodeURIComponent(tx_ref)}`);
  }
};

/* -------------------------------------------------------------------------- */
/* Other payment endpoints                                                    */
/* -------------------------------------------------------------------------- */

const createPayment = async (req, res) => {
  try {
    const { orderId, amount, method, transactionId } = req.body;
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: parseFloat(amount),
        method,
        status: 'COMPLETED',
        transactionId: transactionId || `TXN-${Date.now()}`,
      },
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
  getPaymentByOrderId,
};
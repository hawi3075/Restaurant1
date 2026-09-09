const express = require('express');
const router = express.Router();
const { 
  createPayment, 
  getPaymentByOrderId, 
  initializeChapaPayment,
  initializeChapaPaymentWithOrder,
  handleChapaCallback, 
  verifyChapaPayment 
} = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

// Chapa Payment Routes
router.post('/initialize', verifyToken, initializeChapaPayment);
router.post('/initialize-with-order', verifyToken, initializeChapaPaymentWithOrder);

// Chapa Webhook Callbacks (Chapa posts to the clean base URL)
router.post('/callback', handleChapaCallback);
router.post('/callback/:tx_ref', handleChapaCallback); // Optional fallback if tx_ref is in path
router.get('/callback/:tx_ref', handleChapaCallback);  // Fallback GET callback

router.get('/verify/:tx_ref', verifyChapaPayment);     // Manual verification or return URL

// Existing Payment Routes
router.post('/', verifyToken, createPayment);
router.get('/:orderId', verifyToken, getPaymentByOrderId);

module.exports = router;
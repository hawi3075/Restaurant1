const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPaymentByOrderId,
  initializeChapaPayment,
  initializeChapaPaymentWithOrder,
  handleChapaCallback,
  verifyChapaPayment,
} = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

// Chapa Payment Routes
router.post('/initialize', verifyToken, initializeChapaPayment);
router.post('/initialize-with-order', verifyToken, initializeChapaPaymentWithOrder);

// Chapa Callback (Chapa calls this with GET ?trx_ref=..., some setups use POST)
router.get('/callback', handleChapaCallback);
router.post('/callback', handleChapaCallback);
router.get('/callback/:tx_ref', handleChapaCallback);
router.post('/callback/:tx_ref', handleChapaCallback);

// Return URL: verifies the payment, creates the order, redirects to the frontend
router.get('/verify/:tx_ref', verifyChapaPayment);

// Existing Payment Routes (keep these AFTER the fixed routes above)
router.post('/', verifyToken, createPayment);
router.get('/:orderId', verifyToken, getPaymentByOrderId);

module.exports = router;
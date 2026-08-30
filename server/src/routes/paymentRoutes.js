const express = require('express');
const router = express.Router();
const { 
  createPayment, 
  getPaymentByOrderId, 
  initializeChapaPayment,
  handleChapaCallback, 
  verifyChapaPayment 
} = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

// Chapa Payment Routes
router.post('/initialize', verifyToken, initializeChapaPayment);
router.post('/callback/:tx_ref', handleChapaCallback); // Chapa callback endpoint
router.get('/callback/:tx_ref', handleChapaCallback);  // Chapa callback endpoint (GET)
router.get('/verify/:tx_ref', verifyChapaPayment);     // Manual verification or return URL

// Existing Payment Routes
router.post('/', verifyToken, createPayment);
router.get('/:orderId', verifyToken, getPaymentByOrderId);

module.exports = router;
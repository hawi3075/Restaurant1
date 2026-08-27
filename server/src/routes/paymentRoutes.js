const express = require('express');
const router = express.Router();
const { 
  createPayment, 
  getPaymentByOrderId, 
  initializeChapaPayment, 
  verifyChapaPayment 
} = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

// Chapa Payment Routes
router.post('/initialize', verifyToken, initializeChapaPayment);
router.get('/verify/:tx_ref', verifyChapaPayment); // Chapa redirects here via GET

// Existing Payment Routes
router.post('/', verifyToken, createPayment);
router.get('/:orderId', verifyToken, getPaymentByOrderId);

module.exports = router;
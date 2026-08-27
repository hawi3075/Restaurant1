const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const { 
  getProfile, 
  updateProfile, 
  getAllCustomers, 
  getAllStaff, 
  createStaff, 
  deleteStaff,
  deleteCustomer,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress
} = require('../controllers/userController');

// User profile routes (All authenticated users)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Address management
router.post('/addresses', verifyToken, addAddress);
router.get('/addresses', verifyToken, getAddresses);
router.put('/addresses/:id', verifyToken, updateAddress);
router.delete('/addresses/:id', verifyToken, deleteAddress);

// Admin routes
router.get('/customers', verifyToken, verifyRole(['ADMIN']), getAllCustomers);
router.delete('/customers/:id', verifyToken, verifyRole(['ADMIN']), deleteCustomer);
router.get('/staff', verifyToken, verifyRole(['ADMIN']), getAllStaff);
router.post('/staff', verifyToken, verifyRole(['ADMIN']), createStaff);
router.delete('/staff/:id', verifyToken, verifyRole(['ADMIN']), deleteStaff);

module.exports = router;
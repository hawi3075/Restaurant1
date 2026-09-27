const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const { upload } = require('../config/cloudinary'); // Use Cloudinary storage

// Import controllers
const { 
  submitFood, 
  getChefSubmittedFoods,
  getChefOrders,
  updateChefOrderStatus,
  getChefStats
} = require('../controllers/chefController');

// Chef food submission routes
router.post('/foods', verifyToken, verifyRole(['CHEF']), upload.single('image'), submitFood);
router.get('/foods', verifyToken, verifyRole(['CHEF']), getChefSubmittedFoods);

// Chef order management routes
router.get('/orders', verifyToken, verifyRole(['CHEF']), getChefOrders);
router.put('/orders/:id/status', verifyToken, verifyRole(['CHEF']), updateChefOrderStatus);

// Chef dashboard stats
router.get('/stats', verifyToken, verifyRole(['CHEF']), getChefStats);

module.exports = router;

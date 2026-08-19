const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const { 
  getRestaurants, 
  getRestaurantById, 
  createRestaurant 
} = require('../controllers/restaurantController');

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Admin only routes
router.post('/', verifyToken, verifyRole(['ADMIN']), createRestaurant);

module.exports = router;

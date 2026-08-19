const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const { 
  createReview, 
  getReviewsByFood, 
  getAllReviews, 
  deleteReview 
} = require('../controllers/reviewController');

// Customer routes
router.post('/', verifyToken, verifyRole(['CUSTOMER']), createReview);

// Public route
router.get('/food/:foodId', getReviewsByFood);

// Admin routes
router.get('/', verifyToken, verifyRole(['ADMIN']), getAllReviews);
router.delete('/:id', verifyToken, verifyRole(['ADMIN']), deleteReview);

module.exports = router;

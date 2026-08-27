const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/foods/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'food-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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

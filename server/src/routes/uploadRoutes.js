const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary'); // Use Cloudinary storage
const { uploadSingle, uploadMultiple } = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/auth');

// Upload single image (protected route - requires authentication)
router.post('/single', verifyToken, upload.single('image'), uploadSingle);

// Upload multiple images (protected route - requires authentication)
router.post('/multiple', verifyToken, upload.array('images', 5), uploadMultiple);

module.exports = router;

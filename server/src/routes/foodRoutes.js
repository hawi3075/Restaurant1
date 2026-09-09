const express = require('express');
const router = express.Router();
const { 
  getCategories, 
  createCategory, 
  getFoods, 
  getFoodById, 
  createFood,
  updateCategory,
  deleteCategory,
  updateFood,
  deleteFood,
  getAddons,
  createAddon,
  updateAddon,
  deleteAddon
} = require('../controllers/foodController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Category endpoints
router.get('/categories', getCategories);
router.post('/categories', verifyToken, verifyRole(['ADMIN', 'SUPER_ADMIN']), createCategory);
router.put('/categories/:id', verifyToken, verifyRole(['ADMIN', 'SUPER_ADMIN']), updateCategory);
router.delete('/categories/:id', verifyToken, verifyRole(['ADMIN', 'SUPER_ADMIN']), deleteCategory);

// Addon endpoints (register before /:id parameter route)
router.get('/addons', getAddons);
router.post('/addons', verifyToken, verifyRole(['ADMIN', 'SUPER_ADMIN']), createAddon);
router.put('/addons/:id', verifyToken, verifyRole(['ADMIN', 'SUPER_ADMIN']), updateAddon);
router.delete('/addons/:id', verifyToken, verifyRole(['ADMIN', 'SUPER_ADMIN']), deleteAddon);

// Food endpoints
router.get('/', getFoods);
router.get('/:id', getFoodById);
router.post('/', verifyToken, verifyRole(['ADMIN', 'SUPER_ADMIN']), createFood);
router.put('/:id', verifyToken, verifyRole(['ADMIN', 'SUPER_ADMIN']), updateFood);
router.delete('/:id', verifyToken, verifyRole(['ADMIN', 'SUPER_ADMIN']), deleteFood);

module.exports = router;
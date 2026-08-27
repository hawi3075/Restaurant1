const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const { 
  getRestaurants, 
  getRestaurantById, 
  getPublicStats,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} = require('../controllers/restaurantController');

// Public routes
router.get('/', getRestaurants);
router.get('/stats', getPublicStats);
router.get('/:id', getRestaurantById);
router.get('/:id/tables', async (req, res) => {
  try {
    const { id } = req.params;
    const tables = await require('../config/prisma').table.findMany({
      where: { restaurantId: id, status: 'AVAILABLE' },
      orderBy: { tableNumber: 'asc' },
    });
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Failed to fetch tables.' });
  }
});

// Admin only routes
router.post('/', verifyToken, verifyRole(['ADMIN']), createRestaurant);
router.put('/:id', verifyToken, verifyRole(['ADMIN']), updateRestaurant);
router.delete('/:id', verifyToken, verifyRole(['ADMIN']), deleteRestaurant);

module.exports = router;

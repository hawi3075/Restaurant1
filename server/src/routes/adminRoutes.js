const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/auth');
const {
  getZones,
  createZone,
  updateZone,
  deleteZone,
  getCuisines,
  createCuisine,
  updateCuisine,
  deleteCuisine,
  getSettings,
  updateSettings
} = require('../controllers/adminController');

// Public settings endpoint for customer & staff dashboards
router.get('/settings', getSettings);

// All subsequent endpoints require admin access
router.use(verifyToken, verifyRole(['ADMIN']));

// Settings update (Admin only)
router.put('/settings', updateSettings);

// Zones
router.get('/zones', getZones);
router.post('/zones', createZone);
router.put('/zones/:id', updateZone);
router.delete('/zones/:id', deleteZone);

// Cuisines
router.get('/cuisines', getCuisines);
router.post('/cuisines', createCuisine);
router.put('/cuisines/:id', updateCuisine);
router.delete('/cuisines/:id', deleteCuisine);

module.exports = router;

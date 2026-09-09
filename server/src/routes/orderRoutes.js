const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { verifyToken, verifyRole } = require('../middleware/auth');

router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getOrders);
router.put('/:id/status', verifyToken, verifyRole(['ADMIN', 'SUPER_ADMIN', 'CHEF', 'WAITER', 'DRIVER']), updateOrderStatus);

module.exports = router;
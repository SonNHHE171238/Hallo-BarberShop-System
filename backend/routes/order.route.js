const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorizeRoles, optionalAuthenticate } = require('../middlewares/auth.middleware');

// Public/Guest route (Cho phép tạo đơn không cần đăng nhập)
router.post('/', optionalAuthenticate, orderController.createOrder);

// Customer routes
router.get('/my-orders', authenticate, orderController.getMyOrders);

// Admin routes
router.get('/', authenticate, authorizeRoles('admin'), orderController.getAllOrders);
router.put('/:id/status', authenticate, authorizeRoles('admin'), orderController.updateOrderStatus);

module.exports = router;

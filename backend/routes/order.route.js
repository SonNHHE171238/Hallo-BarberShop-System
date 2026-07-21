const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorizeRoles, optionalAuthenticate } = require('../middlewares/auth.middleware');

// Public/Guest route (Cho phép tạo đơn không cần đăng nhập)
router.post('/', optionalAuthenticate, orderController.createOrder);
router.get('/track/:code', orderController.trackOrderByCode);
router.get('/lookup/:phone', orderController.lookupOrdersByPhone);
router.post('/track/:code/recreate-payment', orderController.recreatePaymentLink);
router.get('/:code/reviewed-products', orderController.getReviewedProducts);

// Customer routes
router.get('/my-orders', authenticate, orderController.getMyOrders);

// Admin routes
router.get('/stats/overview', authenticate, authorizeRoles('admin', 'staff'), orderController.getOrderStats);
router.get('/', authenticate, authorizeRoles('admin'), orderController.getAllOrders);
router.get('/:id', authenticate, authorizeRoles('admin', 'staff'), orderController.getOrderById);
router.put('/:id/status', authenticate, authorizeRoles('admin', 'staff'), orderController.updateOrderStatus);
router.put('/:id/note', authenticate, authorizeRoles('admin', 'staff'), orderController.updateInternalNote);
router.put('/:id/pay-cod', authenticate, authorizeRoles('admin', 'staff'), orderController.confirmCODPayment);

module.exports = router;

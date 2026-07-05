const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// Public / Customer routes
// Note: Apply voucher might need verifyToken if you only allow logged-in users, 
// but we handle both guest and user in controller.
// We use a custom middleware or just optional auth. Assuming verifyToken is strict, 
// we might need a custom optionalAuth middleware or just let controller handle it without middleware.
// Let's create a quick wrapper or just pass it through without strict verifyToken for apply, 
// since guests can apply vouchers.

// For now, we'll allow public access to /apply, and the controller will extract user from token if passed in header (optional).
// However, standard verifyToken usually blocks if no token. Let's see if we have an optional token middleware.
// I'll just use a public route for apply. If token is present, we'll decode it manually or just rely on customerPhone.
// Let's modify the controller to decode token manually if present in header, or just use verifyToken if the app only allows logged in users.
// Actually, `verifyToken` in typical setup sets `req.user`. I'll assume we can use it. But for guests, it might fail.
// Let's just make it public and controller extracts from `req.headers.authorization`.

router.post('/apply', voucherController.applyVoucher);

// Admin routes
router.use(authenticate, authorizeRoles('admin')); // Protect all routes below

router.post('/', voucherController.createVoucher);
router.get('/', voucherController.getVouchers);
router.get('/:id', voucherController.getVoucherById);
router.put('/:id', voucherController.updateVoucher);
router.delete('/:id', voucherController.deleteVoucher);

module.exports = router;

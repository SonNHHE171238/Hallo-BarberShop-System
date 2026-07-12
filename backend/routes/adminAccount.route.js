const express = require('express');
const router = express.Router();
const adminAccountController = require('../controllers/adminAccount.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');


// Áp dụng middleware kiểm tra đăng nhập và bắt buộc phải là 'admin'
router.use(authenticate);
router.use(authorizeRoles('admin'));

// Các API Quản lý tài khoản
router.get('/', adminAccountController.getAllAccounts);
router.post('/', adminAccountController.createAccount);
router.delete('/:id', adminAccountController.deleteAccount);
router.patch('/:id/restore', adminAccountController.restoreAccount);
router.patch('/:id/status', adminAccountController.updateAccountStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const importReceiptController = require('../controllers/importReceipt.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(authenticate);

// Admin and Staff can create and get their receipts
router.post('/', authorizeRoles('admin', 'staff'), importReceiptController.createReceipt);
router.get('/', authorizeRoles('admin', 'staff'), importReceiptController.getReceipts);

// Only Admin can approve or reject
router.put('/:id/approve', authorizeRoles('admin'), importReceiptController.approveReceipt);
router.put('/:id/reject', authorizeRoles('admin'), importReceiptController.rejectReceipt);

module.exports = router;

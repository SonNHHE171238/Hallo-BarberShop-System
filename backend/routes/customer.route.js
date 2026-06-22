const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// All customer routes require authentication and customer role
router.use(authenticate);
router.use(authorizeRoles('customer'));

router.get('/dashboard', customerController.getDashboardData);

module.exports = router;

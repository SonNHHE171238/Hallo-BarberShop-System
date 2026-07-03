const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/dashboard', authenticate, authorizeRoles('admin'), analyticsController.getDashboardData);

module.exports = router;

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');

// Public route for customers to get active services
router.get('/', serviceController.getActiveServices);

module.exports = router;

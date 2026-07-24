const express = require('express');
const router = express.Router();
const productFeedbackController = require('../controllers/product-feedback.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// Public
// The routes for GET and POST by productId are already in product.route.js 
// (/api/products/:id/feedbacks). We keep them there for logical grouping.
// This route file is for the global feedback management.

// Admin routes
router.get('/all', authenticate, authorizeRoles('admin'), productFeedbackController.getAllProductFeedbacks);

// Customer delete route
router.delete('/:id', authenticate, authorizeRoles('customer'), productFeedbackController.deleteFeedback);

module.exports = router;

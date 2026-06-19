const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

/**
 * Public endpoints (accessible by all authenticated users)
 */

// Get all services
router.get('/', serviceController.getAllServices);

// Get service by ID
router.get('/:id', serviceController.getServiceById);

/**
 * Admin-only endpoints
 * Require authentication and admin/staff role
 */

// Create new service
router.post(
  '/',
  authenticate,
  authorizeRoles('admin', 'staff'),
  serviceController.createService
);

// Update service
router.put(
  '/:id',
  authenticate,
  authorizeRoles('admin', 'staff'),
  serviceController.updateService
);

// Delete service
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('admin', 'staff'),
  serviceController.deleteService
);

module.exports = router;

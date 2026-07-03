const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', brandController.getAllBrands);

// Admin routes
router.use(authenticate);
router.use(authorizeRoles('admin'));

router.post('/', brandController.createBrand);
router.put('/:id', brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

module.exports = router;

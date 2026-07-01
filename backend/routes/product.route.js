const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/brands', productController.getBrands);
router.get('/:id', productController.getProductById);

// Admin routes
router.use(authenticate);
router.use(authorizeRoles('admin'));

router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;

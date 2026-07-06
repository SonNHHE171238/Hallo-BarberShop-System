const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const uploadCloud = require('../config/cloudinary.config');

const productFeedbackController = require('../controllers/product-feedback.controller');

// Public routes
router.get('/', productController.getProducts);
router.get('/brands', productController.getBrands);
router.get('/stats', productController.getProductStats);
router.get('/:id', productController.getProductById);

// Feedback routes
router.get('/:id/feedbacks', productFeedbackController.getFeedbacksByProduct); // Public
router.post('/:id/feedbacks', productFeedbackController.createFeedback); // Public via orderCode

// Admin routes
router.use(authenticate);
router.use(authorizeRoles('admin'));

router.post('/', uploadCloud.single('image'), productController.createProduct);
router.put('/:id', uploadCloud.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;

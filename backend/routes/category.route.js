const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// Public route: Lấy danh sách danh mục (đang active)
router.get('/', categoryController.getAllCategories);

// Admin routes
router.use(authenticate);
router.use(authorizeRoles('admin'));

router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;

const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

// Public routes
router.get('/public', blogController.getPublicBlogs);
router.get('/public/:slug', blogController.getBlogBySlug);

// Protected routes (Admin & Staff)
router.use(authenticate);

router.get('/admin', authorizeRoles('admin', 'staff'), blogController.getAdminBlogs);
router.post('/', authorizeRoles('admin', 'staff'), blogController.createBlog);
router.put('/:id', authorizeRoles('admin', 'staff'), blogController.updateBlog);
router.delete('/:id', authorizeRoles('admin', 'staff'), blogController.deleteBlog);

// Review route (Admin only)
router.patch('/:id/review', authorizeRoles('admin'), blogController.reviewBlog);

module.exports = router;

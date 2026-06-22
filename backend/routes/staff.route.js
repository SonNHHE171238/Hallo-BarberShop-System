const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// Áp dụng middleware phân quyền cho tất cả các route của staff dashboard
// Phải đăng nhập và có role admin hoặc staff
router.use(authenticate);
router.use(authorizeRoles('admin', 'staff'));

router.get('/dashboard/metrics', staffController.getDashboardMetrics);
router.get('/dashboard/upcoming-bookings', staffController.getUpcomingBookings);
router.get('/dashboard/barbers-status', staffController.getBarbersStatus);
router.put('/dashboard/bookings/:id/checkin', staffController.toggleCheckIn);
router.get('/appointments', staffController.getAppointments);

module.exports = router;

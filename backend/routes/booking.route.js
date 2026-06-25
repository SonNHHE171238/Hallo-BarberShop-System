const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingCore.controller');
const bookingAdminController = require('../controllers/bookingAdmin.controller');
const bookingStatsController = require('../controllers/bookingStats.controller');
const bookingAvailabilityController = require('../controllers/bookingAvailability.controller');

const { authenticate, authorizeRoles, optionalAuthenticate } = require('../middlewares/auth.middleware');
const {
  applyRoleBasedBookingFilter,
  requireAdminForBookingConfirmation,
  checkBookingUpdatePermission
} = require('../middlewares/booking.middleware');

// Test endpoints
router.post('/test/booking-flow-auto-assign', bookingController.testBookingFlowAutoAssign);

// Booking CRUD operations
router.post('/', authenticate, bookingController.createBooking);
router.post('/single-page', optionalAuthenticate, bookingController.createBookingSinglePage);
router.get('/me', authenticate, applyRoleBasedBookingFilter, bookingController.getMyBookings);
router.get('/barber/today', authenticate, authorizeRoles('barber'), bookingController.getBarberTodayBookings);
router.get('/barber/history', authenticate, authorizeRoles('barber'), bookingController.getBarberHistoryBookings);
router.get('/all', authenticate, applyRoleBasedBookingFilter, bookingController.getAllBookings);

// Stats
router.get('/stats', authenticate, bookingStatsController.getBookingStats);
router.get('/chart-stats', bookingStatsController.getBookingChartStats);
router.get('/admin/metrics', authenticate, authorizeRoles('admin'), bookingStatsController.getAdminDashboardMetrics);
router.get('/admin/top-barbers', authenticate, authorizeRoles('admin'), bookingStatsController.getAdminTopBarbers);

// Walk-in booking
router.get('/walk-in/available-slots', authenticate, authorizeRoles('admin'), bookingAvailabilityController.getWalkInAvailableSlots);
router.post('/walk-in', authenticate, authorizeRoles('admin'), bookingController.createWalkInBooking);

// Parameterized routes must come last
router.get('/:id', authenticate, bookingController.getBookingDetail);

// Admin-only booking management
router.get('/pending/list', authenticate, authorizeRoles('admin'), bookingAdminController.getPendingBookings);
router.put('/:bookingId/confirm', authenticate, requireAdminForBookingConfirmation, bookingAdminController.confirmBooking);
router.post('/bulk-confirm', authenticate, requireAdminForBookingConfirmation, bookingAdminController.bulkConfirmBookings);
router.put('/:bookingId/assign-barber', authenticate, authorizeRoles('admin'), bookingController.assignBarberToBooking);

// Booking status management
router.put('/:bookingId/status', authenticate, checkBookingUpdatePermission, bookingController.updateBookingStatus);
router.put('/:bookingId/cancel', authenticate, bookingController.cancelBooking);
router.put('/:bookingId', authenticate, checkBookingUpdatePermission, bookingController.updateBookingDetails);

// Admin booking rejection
router.put('/:bookingId/reject', authenticate, authorizeRoles('admin'), bookingAdminController.rejectBooking);

// Barber no-show management
router.put('/:bookingId/no-show', authenticate, bookingAdminController.markNoShow);

// Time-based completion checking
router.get('/:bookingId/completion-eligibility', authenticate, bookingAvailabilityController.checkCompletionEligibility);

// Booking conflict checking
router.post('/check-availability', authenticate, bookingAvailabilityController.checkAvailability);
router.get('/conflicts', authenticate, bookingAvailabilityController.getBookingConflicts);

// Route for dynamic time slots
router.post('/available-slots', bookingController.getAvailableSlots);

module.exports = router;

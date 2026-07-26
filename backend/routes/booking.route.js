const express = require('express');
const router = express.Router();

const bookingCreateController = require('../controllers/bookingCreate.controller');
const bookingReadController = require('../controllers/bookingRead.controller');
const bookingUpdateController = require('../controllers/bookingUpdate.controller');
const bookingAdminController = require('../controllers/bookingAdmin.controller');
const bookingStatsController = require('../controllers/bookingStats.controller');
const bookingAvailabilityController = require('../controllers/bookingAvailability.controller');
const customerBookingController = require('../controllers/customerChangeTime.controller');

const { authenticate, authorizeRoles, optionalAuthenticate } = require('../middlewares/auth.middleware');
const {
  applyRoleBasedBookingFilter,
  requireAdminForBookingConfirmation,
  checkBookingUpdatePermission
} = require('../middlewares/booking.middleware');

// Test endpoints
router.post('/test/booking-flow-auto-assign', bookingUpdateController.testBookingFlowAutoAssign);
router.post('/pre-check', bookingCreateController.preCheckBooking);

// Booking CRUD operations
router.post('/', authenticate, bookingCreateController.createBooking);
router.post('/single-page', optionalAuthenticate, bookingCreateController.createBookingSinglePage);
router.get('/me', authenticate, applyRoleBasedBookingFilter, bookingReadController.getMyBookings);
router.get('/barber/today', authenticate, authorizeRoles('barber'), bookingReadController.getBarberTodayBookings);
router.get('/barber/history', authenticate, authorizeRoles('barber'), bookingReadController.getBarberHistoryBookings);
router.get('/barber/detail/:id', authenticate, authorizeRoles('barber'), bookingReadController.getBarberBookingDetail);
router.get('/all', authenticate, applyRoleBasedBookingFilter, bookingReadController.getAllBookings);

// Stats
router.get('/stats', authenticate, bookingStatsController.getBookingStats);
router.get('/chart-stats', bookingStatsController.getBookingChartStats);
router.get('/admin/metrics', authenticate, authorizeRoles('admin'), bookingStatsController.getAdminDashboardMetrics);
router.get('/admin/top-barbers', authenticate, authorizeRoles('admin'), bookingStatsController.getAdminTopBarbers);

// Walk-in booking
router.get('/walk-in/available-slots', authenticate, authorizeRoles('admin'), bookingAvailabilityController.getWalkInAvailableSlots);
router.post('/walk-in', authenticate, authorizeRoles('admin'), bookingCreateController.createWalkInBooking);

// Parameterized routes must come last
router.get('/lookup/:phone', bookingReadController.lookupBookingsByPhone);
router.get('/:id/payment-status', bookingReadController.getBookingPaymentStatus);

// Guest specific detail, cancel, reschedule routes (require phone verification in query/body)
router.get('/:id/guest', bookingReadController.getGuestBookingDetail);
router.put('/:id/guest/cancel', bookingUpdateController.guestCancelBooking);
router.put('/:id/guest/reschedule', bookingUpdateController.guestRescheduleBooking);

router.get('/:id', authenticate, bookingReadController.getBookingDetail);

// Admin-only booking management
router.get('/pending/list', authenticate, authorizeRoles('admin'), bookingAdminController.getPendingBookings);
router.put('/:bookingId/confirm', authenticate, requireAdminForBookingConfirmation, bookingAdminController.confirmBooking);
router.post('/bulk-confirm', authenticate, requireAdminForBookingConfirmation, bookingAdminController.bulkConfirmBookings);
router.put('/:bookingId/assign-barber', authenticate, authorizeRoles('admin', 'staff'), bookingUpdateController.assignBarberToBooking);

// Booking status management
router.put('/:bookingId/status', authenticate, checkBookingUpdatePermission, bookingUpdateController.updateBookingStatus);
router.put('/:bookingId/cancel', authenticate, bookingUpdateController.cancelBooking);
router.put('/:bookingId/reschedule', authenticate, customerBookingController.rescheduleBooking);
router.put('/:bookingId', authenticate, checkBookingUpdatePermission, bookingUpdateController.updateBookingDetails);

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
router.post('/available-slots', bookingReadController.getAvailableSlots);

module.exports = router;

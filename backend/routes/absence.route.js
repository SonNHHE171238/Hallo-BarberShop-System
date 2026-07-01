const express = require('express');
const router = express.Router();
const absenceController = require('../controllers/absence.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// Routes for Barbers to submit requests
router.post('/request', authenticate, authorizeRoles('admin', 'staff', 'barber'), absenceController.createAbsenceRequest);

// Routes to get requests
router.get('/', authenticate, authorizeRoles('admin', 'staff', 'barber'), absenceController.getAbsenceRequests);

// Routes for Admin/Staff to resolve affected bookings
router.put('/:absenceId/resolve/:affectedBookingId', authenticate, authorizeRoles('admin', 'staff'), absenceController.resolveAffectedBooking);

// Routes for Admin/Staff to approve or reject requests
router.put('/:absenceId/approve', authenticate, authorizeRoles('admin', 'staff'), absenceController.approveAbsence);
router.put('/:absenceId/reject', authenticate, authorizeRoles('admin', 'staff'), absenceController.rejectAbsence);

module.exports = router;

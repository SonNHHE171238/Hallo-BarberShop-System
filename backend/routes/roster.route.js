const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/roster.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// --- Admin Endpoints ---
router.post('/', authenticate, authorizeRoles('admin'), rosterController.createRoster);
router.get('/', authenticate, authorizeRoles('admin'), rosterController.getRosters);
router.get('/:id', authenticate, authorizeRoles('admin'), rosterController.getRosterDetails);
router.put('/:id/status', authenticate, authorizeRoles('admin'), rosterController.updateRosterStatus);
router.put('/:id/registrations/:userId', authenticate, authorizeRoles('admin'), rosterController.adminAdjustShift);
router.post('/:id/publish', authenticate, authorizeRoles('admin'), rosterController.publishRoster);

// --- Staff/Barber Endpoints ---
router.get('/current/active', authenticate, authorizeRoles('admin', 'staff', 'barber'), rosterController.getCurrentRoster);
router.get('/current/published', authenticate, authorizeRoles('admin', 'staff', 'barber'), rosterController.getCurrentPublishedRoster);
router.get('/:id/my-registration', authenticate, authorizeRoles('admin', 'staff', 'barber'), rosterController.getMyRegistration);
router.post('/:id/register', authenticate, authorizeRoles('staff'), rosterController.registerShifts);

module.exports = router;

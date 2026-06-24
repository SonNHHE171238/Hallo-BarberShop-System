const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barber.controller');

const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// Public route for customers to get active barbers
router.get('/', barberController.getActiveBarbers);
router.get('/:id/absences', barberController.getBarberAbsences);

// Barber self-management routes
router.get('/me', authenticate, authorizeRoles('barber', 'admin'), barberController.getMeBarber);
router.put('/me/availability', authenticate, authorizeRoles('barber', 'admin'), barberController.updateMyAvailability);

module.exports = router;

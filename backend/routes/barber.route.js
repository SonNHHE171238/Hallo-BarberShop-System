const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barber.controller');

// Public route for customers to get active barbers
router.get('/', barberController.getActiveBarbers);
router.get('/:id/absences', barberController.getBarberAbsences);

module.exports = router;

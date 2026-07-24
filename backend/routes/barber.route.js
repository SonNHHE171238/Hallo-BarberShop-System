const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barber.controller');

const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const uploadCloud = require('../config/cloudinary.config');

// Public route for customers to get active barbers
router.get('/', barberController.getActiveBarbers);
router.get('/:id/absences', barberController.getBarberAbsences);

// Barber self-management routes
router.get('/me', authenticate, authorizeRoles('barber'), barberController.getMeBarber);
router.put('/me/availability', authenticate, authorizeRoles('barber'), barberController.updateMyAvailability);
router.put('/me/profile', authenticate, authorizeRoles('barber'), barberController.updateMyProfile);

// Gallery management
router.post('/me/gallery', authenticate, authorizeRoles('barber'), uploadCloud.array('images', 5), barberController.uploadGalleryImages);
router.delete('/me/gallery', authenticate, authorizeRoles('barber'), barberController.removeGalleryImage);

module.exports = router;

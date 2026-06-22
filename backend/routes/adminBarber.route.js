const express = require('express');
const router = express.Router();
const adminBarberController = require('../controllers/adminBarber.controller');

router.post('/create', adminBarberController.createAdminBarber);
router.get('/', adminBarberController.getAllAdminBarbers);
router.get('/:barberId/full', adminBarberController.getAdminBarberFull);
router.get('/:barberId', adminBarberController.getAdminBarberById);
router.put('/:barberId', adminBarberController.updateAdminBarber);
router.patch('/:barberId/deactivate', adminBarberController.deactivateAdminBarber);
router.patch('/:barberId/activate', adminBarberController.activateAdminBarber);

module.exports = router;

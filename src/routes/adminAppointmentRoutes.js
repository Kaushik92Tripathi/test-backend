const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const adminAppointmentController = require('../controllers/adminAppointmentController');

// All routes require admin authentication
router.use(adminAuth);

// Search and filter appointments
router.get('/search', adminAppointmentController.searchAppointments);

// Update appointment status
router.patch('/:id/status', adminAppointmentController.updateAppointmentStatus);

module.exports = router; 
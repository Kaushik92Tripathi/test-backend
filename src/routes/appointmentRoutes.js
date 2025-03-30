const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

// Get all appointments (admin only)
router.get('/', auth, appointmentController.getAllAppointments);

// Get appointment by ID
router.get('/:id', auth, appointmentController.getAppointmentById);

// Create new appointment
router.post('/', auth, appointmentController.createAppointment);

// Update appointment status
router.patch('/:id/status', adminAuth, appointmentController.updateAppointmentStatus);

// Cancel appointment
router.patch('/:id/cancel', auth, appointmentController.cancelAppointment);

// Get appointments for a specific doctor and user
router.get('/doctor/:doctorId/user', auth, appointmentController.getDoctorAppointmentsForUser);

module.exports = router; 
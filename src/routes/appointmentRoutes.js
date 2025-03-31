const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/sessionAuth');
const appointmentController = require('../controllers/appointmentController');

// Get all appointments (admin only)
router.get('/', isAuthenticated, appointmentController.getAllAppointments);

// Get appointment by ID
router.get('/:id', isAuthenticated, appointmentController.getAppointmentById);

// Create new appointment
router.post('/', isAuthenticated, appointmentController.createAppointment);

// Update appointment status (admin only)
router.patch('/:id/status', isAdmin, appointmentController.updateAppointmentStatus);

// Cancel appointment
router.patch('/:id/cancel', isAuthenticated, appointmentController.cancelAppointment);

// Get appointments for a specific doctor and user
router.get('/doctor/:doctorId/user', isAuthenticated, appointmentController.getDoctorAppointmentsForUser);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/sessionAuth');
const adminDoctorController = require('../controllers/adminDoctorController');
const doctorController = require('../controllers/doctorController');
const adminAppointmentController = require('../controllers/adminAppointmentController');
const adminDashboardController = require('../controllers/adminDashboardController');
// All routes require admin authentication
router.use(isAdmin);

// Search and filter appointments
router.get('/search', adminAppointmentController.searchAppointments);

// Update appointment status
router.patch('/appointments/:id/status', adminAppointmentController.updateAppointmentStatus);
// Get dashboard stats
router.get('/dashboard/stats', adminDashboardController.getDashboardData);
// Get all doctors
router.get('/', doctorController.getAllDoctors);

// Get doctor by ID
router.get('/:id', doctorController.getDoctorById);

// Create new doctor
router.post('/doctors', adminDoctorController.createDoctor);

// Update doctor
// router.put('/:id', adminDoctorController.updateDoctor);

// Delete doctor
router.delete('/doctors/:id', adminDoctorController.deleteDoctor);

// Toggle doctor availability
router.patch('/doctors/:id/availability', adminDoctorController.toggleDoctorAvailability);

module.exports = router; 
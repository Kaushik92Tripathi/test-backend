const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const adminDoctorController = require('../controllers/adminDoctorController');
const doctorController = require('../controllers/doctorController');

// All routes require admin authentication
router.use(adminAuth);

// Get all doctors
router.get('/', doctorController.getAllDoctors);

// Get doctor by ID
router.get('/:id', doctorController.getDoctorById);

// Create new doctor
router.post('/', adminDoctorController.createDoctor);

// Update doctor
router.put('/:id', adminDoctorController.updateDoctor);

// Delete doctor
router.delete('/:id', adminDoctorController.deleteDoctor);

// Toggle doctor availability
router.patch('/:id/availability', adminDoctorController.toggleDoctorAvailability);

module.exports = router; 
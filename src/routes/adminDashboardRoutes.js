const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const adminDashboardController = require('../controllers/adminDashboardController');

// All routes require admin authentication
router.use(adminAuth);

// Get dashboard stats
router.get('/stats', adminDashboardController.getDashboardData);

// Get recent appointments
// router.get('/recent-appointments', adminDashboardController.getRecentAppointments);

// Get recent doctors
// router.get('/recent-doctors', adminDashboardController.getRecentDoctors);

// Get recent patients
// router.get('/recent-patients', adminDashboardController.getRecentPatients);

module.exports = router; 
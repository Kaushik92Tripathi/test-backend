const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const adminDashboardController = require('../controllers/adminDashboardController');

// All routes require admin authentication
router.use(adminAuth);

// Get dashboard stats
router.get('/stats', adminDashboardController.getDashboardData);

module.exports = router; 
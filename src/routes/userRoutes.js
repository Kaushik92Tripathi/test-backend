const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/sessionAuth');
const userController = require('../controllers/userController');

// Get user profile
router.get('/profile', isAuthenticated, userController.getUserProfile);

// Update user profile
router.put('/profile', isAuthenticated, userController.updateUserProfile);

// Get user appointments
router.get('/appointments', isAuthenticated, userController.getUserAppointments);

module.exports = router; 
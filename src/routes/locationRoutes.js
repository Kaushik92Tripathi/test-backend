const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { isAuthenticated } = require('../middleware/sessionAuth');

// Get locations for a specific doctor
router.get('/', isAuthenticated, locationController.getDoctorLocations);

module.exports = router; 
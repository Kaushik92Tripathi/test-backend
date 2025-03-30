const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Get locations for a specific doctor
router.get('/', locationController.getDoctorLocations);

module.exports = router; 
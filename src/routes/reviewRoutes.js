const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

// Get reviews for a specific doctor
router.get('/',auth, reviewController.getDoctorReviews);

// Add a new review
router.post('/', auth, reviewController.createReview);

// Update appointment status
router.put('/appointments/:id', auth, reviewController.updateAppointmentStatus);

module.exports = router;
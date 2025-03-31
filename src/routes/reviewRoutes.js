const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { isAuthenticated } = require('../middleware/sessionAuth');

// Get reviews for a specific doctor
router.get('/', isAuthenticated, reviewController.getDoctorReviews);

// Add a new review
router.post('/', isAuthenticated, reviewController.createReview);

module.exports = router;
const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { isAuthenticated } = require("../middleware/sessionAuth");

// Get top doctors
router.get("/top", isAuthenticated, doctorController.getTopDoctors);

// Get all doctors with filters and pagination
router.get("/", isAuthenticated, doctorController.getAllDoctors);

// Get doctor by ID
router.get("/:id", isAuthenticated, doctorController.getDoctorById);

// Get doctor's availability
router.get("/:id/availability", isAuthenticated, doctorController.getDoctorAvailability);

module.exports = router;

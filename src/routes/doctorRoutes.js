const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { auth } = require("../middleware/auth");

// Get top doctors
router.get("/top", auth, doctorController.getTopDoctors);

// Get all doctors with filters and pagination
router.get("/", auth, doctorController.getAllDoctors);

// Get doctor by ID
router.get("/:id", auth, doctorController.getDoctorById);

// Get doctor's availability
router.get("/:id/availability", auth, doctorController.getDoctorAvailability);

module.exports = router;

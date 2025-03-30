const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log('Environment:', process.env.NODE_ENV);
console.log('Frontend URL:', process.env.FRONTEND_URL);
console.log('Backend URL:', process.env.BACKEND_URL);

const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const locationRoutes = require('./routes/locationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const adminDoctorRoutes = require('./routes/adminDoctorRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin/doctors', adminDoctorRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'MedCare API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();

// Local Strategy Routes
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'patient' } = req.body;
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );

    // Create user profile
    await pool.query(
      'INSERT INTO user_profiles (user_id) VALUES ($1)',
      [result.rows[0].id]
    );

    // Log the user in
    req.login(result.rows[0], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed after registration' });
      }
      res.status(201).json({
        user: result.rows[0]
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profile_picture: req.user.profile_picture
    }
  });
});

// Google Strategy Routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/userinfo.profile']
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/auth/error`,
    failureMessage: true
  }), 
  (req, res) => {
    // Successful authentication
    console.log('Google auth successful, redirecting to frontend callback');
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const result = await pool.query(
        `SELECT u.*, up.profile_picture 
         FROM users u 
         LEFT JOIN user_profiles up ON u.id = up.user_id 
         WHERE u.id = $1`,
        [req.user.id]
      );
      
      const user = result.rows[0];
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile_picture: user.profile_picture
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Error fetching user data' });
    }
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router; 
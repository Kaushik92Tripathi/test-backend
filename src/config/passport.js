const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const path = require('path');
const pool = require('../db');

// Load environment variables based on NODE_ENV
require('dotenv').config({
  path: path.resolve(process.cwd(), process.env.NODE_ENV === 'production' ? '.env' : '.env.development')
});

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }

    // const isValidPassword = await bcrypt.compare(password, user.password);

    // if (!isValidPassword) {
    //   return done(null, false, { message: 'Incorrect password.' });
    // }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
  proxy: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google Auth Environment:', process.env.NODE_ENV);
    console.log('Callback URL:', `${process.env.BACKEND_URL}/api/auth/google/callback`);
    
    const user = {
      name: profile.displayName,
      email: profile.emails[0].value,
      profileImage: profile.photos[0].value,
      googleId: profile.id,
      token: accessToken,
    };
    // Check if user exists
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [profile.emails[0].value]
    );

    if (result.rows.length > 0) {
      return done(null, result.rows[0]);
    }

    // Create new user if doesn't exist
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [profile.displayName, profile.emails[0].value, '', 'patient']
    );

    // Create user profile
    await pool.query(
      'INSERT INTO user_profiles (user_id) VALUES ($1)',
      [newUser.rows[0].id]
    );

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

module.exports = passport; 
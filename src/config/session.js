const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('../db');

const isDevelopment = process.env.NODE_ENV === 'development';
console.log('Session Environment:', process.env.NODE_ENV);
console.log('Frontend URL:', process.env.FRONTEND_URL);

const sessionConfig = {
  store: new pgSession({
    pool,
    tableName: 'sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  },
  name: 'connect.sid'
};

// Add session debugging in production
if (!isDevelopment) {
  console.log('Session Config:', {
    secure: sessionConfig.cookie.secure,
    sameSite: sessionConfig.cookie.sameSite,
    maxAge: sessionConfig.cookie.maxAge
  });
}

module.exports = sessionConfig; 
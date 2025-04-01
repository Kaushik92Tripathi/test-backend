const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('../db');

const isDevelopment = process.env.NODE_ENV === 'development';

const sessionConfig = {
  store: new pgSession({
    pool: pool,
    tableName: 'sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: !isDevelopment, // Only use secure cookies in production
    httpOnly: true,
    sameSite: isDevelopment ? 'lax' : 'none', // Use 'none' for cross-origin in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  }
};

module.exports = sessionConfig; 
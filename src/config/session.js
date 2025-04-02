const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('../db');

const isDevelopment = process.env.NODE_ENV === 'development';
console.log('Session Environment:', process.env.NODE_ENV);
console.log('Frontend URL:', process.env.FRONTEND_URL);

const sessionConfig = {
  store: new pgSession({
    pool: pool,
    tableName: 'sessions',
    createTableIfMissing: true,
    pruneSessionInterval: 1000 * 60 * 60 // 1 hour
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  name: 'sessionId', // Custom cookie name
  rolling: true, // Refresh cookie on each request
  cookie: {
    secure: !isDevelopment,
    httpOnly: true,
    sameSite: isDevelopment ? 'lax' : 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: isDevelopment ? undefined : '.onrender.com' // Allow cookie to work on all subdomains in production
  }
};

// Add session debugging in production
if (!isDevelopment) {
  console.log('Session Config:', {
    secure: sessionConfig.cookie.secure,
    sameSite: sessionConfig.cookie.sameSite,
    domain: sessionConfig.cookie.domain,
    maxAge: sessionConfig.cookie.maxAge
  });
}

module.exports = sessionConfig; 
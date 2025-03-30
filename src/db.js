const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({
  path: path.resolve(process.cwd(), process.env.NODE_ENV === 'production' ? '.env' : '.env.development')
});

console.log('Database Environment:', process.env.NODE_ENV);
console.log('Database Host:', process.env.DB_HOST);

let pool;

if (process.env.NODE_ENV === 'production') {
  // Production database configuration
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // Development database configuration
  pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
  });
}

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

module.exports = pool;
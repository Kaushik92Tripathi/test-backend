const { Pool } = require('pg');
require('dotenv').config();

// Use the DATABASE_URL if available, otherwise fall back to individual params
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // This is often needed for Render's PostgreSQL
    })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
    });

module.exports = pool;
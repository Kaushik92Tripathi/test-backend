const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'medcare',
  password: process.env.DB_PASSWORD || '3ffadd9651c7',
  port: process.env.DB_PORT || 5432,
});

async function seedDatabase() {
  try {
    // Read the seed file
    const seedFile = path.join(__dirname, '../seed.sql');
    const seedSQL = fs.readFileSync(seedFile, 'utf8');

    // Execute the seed file
    await pool.query(seedSQL);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase(); 
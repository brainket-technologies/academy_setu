import pg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pg;

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query('ALTER TABLE segments ADD COLUMN IF NOT EXISTS menus TEXT[] DEFAULT \'{}\'');
    console.log('Added menus to segments');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    pool.end();
  }
}

run();

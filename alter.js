const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres'
});

async function main() {
  try {
    await pool.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admins(id) ON DELETE SET NULL;`);
    console.log('Success');
  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
main();

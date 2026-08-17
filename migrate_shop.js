const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/academic_app' });

async function migrate() {
  try {
    await pool.query('ALTER TABLE shop_products ADD COLUMN IF NOT EXISTS moq INT DEFAULT 1');
    console.log('Added moq column to shop_products');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
migrate();

const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE institute_website_settings 
      ADD COLUMN IF NOT EXISTS page_sections_visibility JSONB DEFAULT '{}'::jsonb;
    `)
    console.log('✅ page_sections_visibility column added / confirmed')

    await pool.query(`
      ALTER TABLE institute_website_settings 
      ADD COLUMN IF NOT EXISTS page_content JSONB DEFAULT '{}'::jsonb;
    `)
    console.log('✅ page_content column added / confirmed')

    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'institute_website_settings'
      ORDER BY ordinal_position ASC;
    `)
    console.log('Columns count:', res.rows.length)
  } catch (err) {
    console.error('Migration error:', err)
  } finally {
    await pool.end()
  }
}

migrate()

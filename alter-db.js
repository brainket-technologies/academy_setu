const { Pool } = require('pg')

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_Eh0SDjQ4MylI@ep-small-tooth-atx53vb8.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
})

async function run() {
  try {
    console.log('Adding plain_password column to institutions table...')
    await pool.query('ALTER TABLE institutions ADD COLUMN IF NOT EXISTS plain_password VARCHAR(255)')
    console.log('Successfully added plain_password column.')
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await pool.end()
  }
}

run()

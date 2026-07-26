const { Pool } = require('pg')

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_Eh0SDjQ4MylI@ep-small-tooth-atx53vb8.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
})

async function run() {
  try {
    console.log('Querying users table...')
    const res = await pool.query('SELECT role, count(*) FROM users GROUP BY role')
    console.log('Users distribution:', res.rows)
    
    const instRes = await pool.query('SELECT count(*) FROM institutions')
    console.log('Institutions count:', instRes.rows[0].count)
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await pool.end()
  }
}

run()

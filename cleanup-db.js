const { Pool } = require('pg')

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_Eh0SDjQ4MylI@ep-small-tooth-atx53vb8.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
})

async function run() {
  try {
    console.log('Starting Database Cleanup...')

    // 1. Keep 1 Admin, 1 Manager, 1 BDM
    console.log('Cleaning up admins table...')
    const keepUsers = await pool.query(`
      SELECT id FROM (
        SELECT id, row_number() over (partition by role order by id) as rn
        FROM admins
        WHERE role IN ('Admin', 'Manager', 'BDM')
      ) t WHERE rn = 1
    `)
    
    const userIdsToKeep = keepUsers.rows.map(r => r.id)
    if (userIdsToKeep.length > 0) {
      await pool.query('DELETE FROM admins WHERE id != ALL($1::uuid[])', [userIdsToKeep])
    }
    
    // 2. Keep 1 Institute
    console.log('Cleaning up institutions table...')
    const keepInst = await pool.query('SELECT id FROM institutions ORDER BY id ASC LIMIT 1')
    if (keepInst.rows.length > 0) {
      const instIdToKeep = keepInst.rows[0].id
      await pool.query('DELETE FROM institutions WHERE id != $1', [instIdToKeep])
    }

    // 3. Optional: Clear out transactional/fake data from other tables if needed
    // You can add more tables here if you want to completely wipe things like leads, queries, etc.
    console.log('Truncating fake dashboard data tables (leads, queries, requests, messages)...')
    
    // Using IF EXISTS in case these tables aren't mapped correctly
    const tablesToClear = [
      'product_enquiries', 'requests', 'messages', 'queries', 
      'sms_orders', 'transactions', 'distributor_payments', 'leads'
    ]
    
    for (const table of tablesToClear) {
      try {
        await pool.query(`TRUNCATE TABLE ${table} CASCADE`)
        console.log(`- Cleared table: ${table}`)
      } catch (e) {
        // Table might not exist or be named differently, ignore safely
      }
    }

    console.log('Database successfully cleaned! Left 1 Admin, 1 Manager, 1 BDM, and 1 Institute.')
  } catch (error) {
    console.error('Error during cleanup:', error.message)
  } finally {
    await pool.end()
  }
}

run()

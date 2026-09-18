const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function clearData() {
  try {
    const resBills = await pool.query('DELETE FROM bills');
    console.log(`Deleted ${resBills.rowCount} rows from bills.`);

    const resReqs = await pool.query('DELETE FROM requests');
    console.log(`Deleted ${resReqs.rowCount} rows from requests.`);

    try {
      const resInstPlans = await pool.query('DELETE FROM institute_plans');
      console.log(`Deleted ${resInstPlans.rowCount} rows from institute_plans.`);
    } catch (e) {
      console.log('institute_plans table note:', e.message);
    }

    try {
      const resApps = await pool.query('UPDATE applications SET plan_id = NULL');
      console.log(`Reset plan_id on ${resApps.rowCount} applications.`);
    } catch (e) {
      console.log('Applications update note:', e.message);
    }

    console.log('SUCCESS: All plans, bills, and payment requests cleared cleanly for testing!');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing data:', err);
    process.exit(1);
  }
}

clearData();

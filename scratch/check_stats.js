const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const admins = await client.query('SELECT id, name, role, last_login_at, login_time, logout_time, login_time_type FROM admins');
  console.log('Admins:', admins.rows);
  const lh = await client.query('SELECT * FROM lead_history LIMIT 10');
  console.log('Lead history:', lh.rows);
  const apps = await client.query('SELECT id, amount, status, created_at, assigned_to FROM applications LIMIT 10');
  console.log('Applications:', apps.rows);
  const leads = await client.query('SELECT id, school_name, institution_name, assigned_to, assigned_to_id, status_id FROM leads LIMIT 10');
  console.log('Leads:', leads.rows);
  await client.end();
}

main().catch(console.error);

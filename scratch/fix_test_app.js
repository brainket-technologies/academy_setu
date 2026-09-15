const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  await client.query("UPDATE institutions SET assigned_to = NULL WHERE id IN (SELECT institution_id FROM applications WHERE application_no = 'AS2026127')");
  const check = await client.query("SELECT a.application_no, i.name, i.assigned_to FROM applications a JOIN institutions i ON a.institution_id = i.id WHERE a.application_no = 'AS2026127'");
  console.log('UPDATED RECORD:', check.rows);
  await client.end();
}

run().catch(console.error);

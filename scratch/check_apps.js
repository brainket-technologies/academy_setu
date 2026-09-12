const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'applications'
  `);
  console.log('App cols:', cols.rows.map(c => c.column_name));

  const apps = await client.query('SELECT * FROM applications LIMIT 5');
  console.log('Sample apps:', apps.rows);

  const leads = await client.query('SELECT * FROM leads LIMIT 5');
  console.log('Sample leads:', leads.rows);

  await client.end();
}

main().catch(console.error);

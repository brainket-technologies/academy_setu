const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const cols = await client.query(`
    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'admins';
  `);
  console.log('Admins columns:', cols.rows);
  const user = await client.query('SELECT * FROM admins WHERE id = $1', ['e174b1d0-04a6-4aa8-816c-9eda8036d8ad']);
  console.log('User data:', user.rows[0]);
  await client.end();
}

main().catch(console.error);

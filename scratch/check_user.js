const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT id, name, email, role, phone, id_no FROM admins WHERE id = $1', ['e174b1d0-04a6-4aa8-816c-9eda8036d8ad']);
  console.log('USER IN DB:', res.rows);
  await client.end();
}

main().catch(console.error);

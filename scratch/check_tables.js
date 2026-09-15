const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('admins', 'users', 'roles');
  `);
  console.log('Tables found:', tables.rows);
  
  const hasUsers = tables.rows.some(r => r.table_name === 'users');
  if (hasUsers) {
    const usersCols = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
    `);
    console.log('Users columns:', usersCols.rows.map(r => r.column_name));
    const userRow = await client.query('SELECT * FROM users WHERE id = $1', ['e174b1d0-04a6-4aa8-816c-9eda8036d8ad']);
    console.log('User in users table:', userRow.rows);
  }
  await client.end();
}

main().catch(console.error);

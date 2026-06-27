const { Client } = require('pg');
const fs = require('fs');

const connectionString = "postgresql://postgres:haDQVIttUuCGLpaGLDnXiHwDoEUGIoMw@thomas.proxy.rlwy.net:43367/railway";
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const counts = await client.query('SELECT COUNT(*)::int FROM applications');
  const rows = await client.query('SELECT id, status, school_name FROM applications');
  
  const output = {
    totalCount: counts.rows[0].count,
    rows: rows.rows
  };

  fs.writeFileSync('db-output.json', JSON.stringify(output, null, 2));
  await client.end();
}

main().catch(err => {
  fs.writeFileSync('db-output.json', JSON.stringify({ error: err.toString() }, null, 2));
});

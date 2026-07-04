const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({
  connectionString: 'postgresql://postgres:haDQVIttUuCGLpaGLDnXiHwDoEUGIoMw@thomas.proxy.rlwy.net:43367/railway',
  ssl: { rejectUnauthorized: false }
});

pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'leads'").then(res => {
  fs.writeFileSync('schema-output.txt', JSON.stringify(res.rows, null, 2));
  process.exit(0);
}).catch(console.error);

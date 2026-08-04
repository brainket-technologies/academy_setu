const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log("Connected to DB!");

  // List all segments
  const segments = await client.query('SELECT id, name FROM segments');
  console.log("\n--- Segments ---");
  console.table(segments.rows);

  // List plans and their segments
  const plans = await client.query('SELECT id, plan_name, segment_id, segment FROM plans');
  console.log("\n--- Plans ---");
  console.table(plans.rows);

  // List applications and their plan_id / institution_id
  const apps = await client.query('SELECT id, application_no, plan_id, institution_id FROM applications');
  console.log("\n--- Applications ---");
  console.table(apps.rows);

  // List institutions and their segment_id
  const insts = await client.query('SELECT id, name, segment_id FROM institutions');
  console.log("\n--- Institutions ---");
  console.table(insts.rows);

  // Run our segment count query to see step-by-step
  const segmentsCount = await client.query(`
    SELECT s.id, s.name,
           COUNT(DISTINCT a.institution_id)::int AS institution_count
    FROM segments s
    LEFT JOIN plans p ON p.segment_id = s.id
    LEFT JOIN applications a ON a.plan_id = p.id AND a.institution_id IS NOT NULL
    GROUP BY s.id, s.name
  `);
  console.log("\n--- Our query output ---");
  console.table(segmentsCount.rows);

  await client.end();
}

main().catch(err => {
  console.error("Error running script:", err);
  process.exit(1);
});

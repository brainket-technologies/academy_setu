const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const userId = '3bc7ca2a-5da8-4522-877d-834b72f1aba2'; // Prerna
  const followupsRes = await client.query(`
    SELECT 
      h.id, 
      COALESCE(NULLIF(l.institution_name, ''), NULLIF(l.contact_person, ''), 'Lead') as name,
      l.mobile_no,
      h.follow_up_date,
      h.remarks,
      h.created_at
    FROM lead_history h
    JOIN leads l ON h.lead_id = l.id
    WHERE (COALESCE(l.assigned_to_id::text, l.assigned_to::text) = $1 OR l.created_by::text = $1)
      AND h.follow_up_date IS NOT NULL
      AND h.follow_up_date::date <= CURRENT_DATE
    ORDER BY h.follow_up_date DESC
    LIMIT 5
  `, [userId]);
  console.log('FOLLOWUPS:', followupsRes.rows);

  const leadsRes = await client.query(`
    SELECT id, institution_name, contact_person, mobile_no, created_at
    FROM leads
    WHERE (COALESCE(assigned_to_id::text, assigned_to::text) = $1 OR created_by::text = $1)
    ORDER BY created_at DESC
    LIMIT 5
  `, [userId]);
  console.log('LEADS:', leadsRes.rows);

  const appsRes = await client.query(`
    SELECT 
      a.id, 
      a.application_no, 
      COALESCE(NULLIF(a.school_name, ''), NULLIF(i.name, ''), 'Institution') AS school_name,
      COALESCE(NULLIF(a.contact_person, ''), NULLIF(i.contact_person, ''), NULLIF(i.principal_name, ''), '') AS contact_person,
      a.status, 
      a.created_at
    FROM applications a
    LEFT JOIN institutions i ON a.institution_id = i.id
    WHERE (a.created_by::text = $1 OR i.assigned_to::text = $1)
    ORDER BY a.created_at DESC
    LIMIT 5
  `, [userId]);
  console.log('APPS:', appsRes.rows);
  await client.end();
}

main().catch(console.error);

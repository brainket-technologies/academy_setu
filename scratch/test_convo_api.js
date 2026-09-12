const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log("Connected to DB!");

  const currentUserName = 'Super Admin';
  console.log("Testing with currentUserName:", currentUserName);

  try {
    const allContactsRes = await client.query(`
      SELECT DISTINCT name, type FROM (
        SELECT name, role as type FROM admins WHERE name != $1 AND is_active = true
        UNION ALL
        SELECT name, 'Institute' as type FROM institutions WHERE name IS NOT NULL AND name != ''
        UNION ALL
        SELECT name, 'Distributor' as type FROM distributors WHERE name IS NOT NULL AND name != ''
      ) contacts
      ORDER BY type, name
    `, [currentUserName]);
    console.log("allContacts count:", allContactsRes.rows.length);
    console.table(allContactsRes.rows);

    const allContacts = allContactsRes.rows;
    const data = [];

    for (const { name: contact, type } of allContacts) {
      console.log(`Fetching messages for ${contact}...`);
      const latestRes = await client.query(
        `SELECT * FROM messages 
         WHERE (sender = $1 AND receiver = $2) 
            OR (sender = $2 AND receiver = $1)
         ORDER BY created_at DESC LIMIT 1`,
        [contact, currentUserName]
      );

      const unreadRes = await client.query(
        `SELECT COUNT(*)::int FROM messages 
         WHERE sender = $1 AND receiver = $2 AND is_read = false`,
        [contact, currentUserName]
      );

      const msg = latestRes.rows[0];
      data.push({
        contact,
        type,
        latest_message: msg?.message || '',
        latest_timestamp: msg?.created_at || null,
        unread_count: unreadRes.rows[0].count,
        latest_sender: msg?.sender || ''
      });
    }

    console.log("Done. Final data count:", data.length);
    console.table(data);
  } catch (err) {
    console.error("Error in conversation logic:", err);
  }

  await client.end();
}

main().catch(console.error);

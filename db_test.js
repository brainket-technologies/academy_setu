const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/academic_db' // Assuming default local connection
});

async function run() {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS device_recharge_requests CASCADE;
      DROP TABLE IF EXISTS device_plans CASCADE;
      DROP TABLE IF EXISTS device_types CASCADE;
      DROP TABLE IF EXISTS device_brands CASCADE;
      DROP TABLE IF EXISTS sms_template_request_history CASCADE;
      DROP TABLE IF EXISTS sms_template_requests CASCADE;
      DROP TABLE IF EXISTS sms_templates CASCADE;
      DROP TABLE IF EXISTS sms_orders CASCADE;
      DROP TABLE IF EXISTS product_dispatches CASCADE;
      DROP TABLE IF EXISTS product_enquiries CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS states_districts CASCADE;
      DROP TABLE IF EXISTS expense_records CASCADE;
      DROP TABLE IF EXISTS income_records CASCADE;
      DROP TABLE IF EXISTS income_sessions CASCADE;
      DROP TABLE IF EXISTS income_parties CASCADE;
      DROP TABLE IF EXISTS income_categories CASCADE;
      DROP TABLE IF EXISTS distributor_payments CASCADE;
      DROP TABLE IF EXISTS distributors CASCADE;
      DROP TABLE IF EXISTS queries CASCADE;
      DROP TABLE IF EXISTS referrals CASCADE;
      DROP TABLE IF EXISTS lead_history CASCADE;
      DROP TABLE IF EXISTS leads CASCADE;
      DROP TABLE IF EXISTS lead_statuses CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS ticket_categories CASCADE;
      DROP TABLE IF EXISTS tickets CASCADE;
      DROP TABLE IF EXISTS requests CASCADE;
      DROP TABLE IF EXISTS bills CASCADE;
      DROP TABLE IF EXISTS promo_codes CASCADE;
      DROP TABLE IF EXISTS plan_billing_items CASCADE;
      DROP TABLE IF EXISTS plans CASCADE;
      DROP TABLE IF EXISTS applications CASCADE;
      DROP TABLE IF EXISTS institutions CASCADE;
      DROP TABLE IF EXISTS segments CASCADE;
      DROP TABLE IF EXISTS admins CASCADE;
    `);
    console.log("Drops succeeded");
    
    // I won't run all creations, I just need to know what failed.
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();

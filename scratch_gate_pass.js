const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Eh0SDjQ4MylI@ep-small-tooth-atx53vb8.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  // Create gate pass entries log table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS institute_gate_pass_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id UUID NOT NULL,
      pass_id UUID REFERENCES institute_gate_passes(id) ON DELETE SET NULL,
      pass_type VARCHAR(20) DEFAULT 'one-time',
      user_type VARCHAR(20),
      student_name VARCHAR(255),
      class_name VARCHAR(100),
      section_name VARCHAR(50),
      roll_no VARCHAR(50),
      receiver_name VARCHAR(255),
      receiver_mobile VARCHAR(20),
      receiver_relation VARCHAR(100),
      live_photo_url TEXT,
      visit_date DATE,
      visit_time VARCHAR(20),
      entry_gate VARCHAR(100),
      exit_gate VARCHAR(100),
      vehicle_no VARCHAR(50),
      reason TEXT,
      remarks TEXT,
      verification_status BOOLEAN DEFAULT false,
      status VARCHAR(20) DEFAULT 'Checked-In',
      check_in TIMESTAMPTZ DEFAULT NOW(),
      check_out TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('institute_gate_pass_entries table created!');
  process.exit(0);
}
main().catch(e => { console.error('ERR:', e.message); process.exit(1); });

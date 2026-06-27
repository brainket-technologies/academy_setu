import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Create admins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        phone VARCHAR(20) DEFAULT '',
        avatar_url TEXT DEFAULT '',
        is_active BOOLEAN DEFAULT true,
        id_no VARCHAR(50) DEFAULT '',
        id_card_url TEXT DEFAULT '',
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Add new columns to admins if not exists
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS id_no VARCHAR(50) DEFAULT ''`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS id_card_url TEXT DEFAULT ''`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS joining_date DATE`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}'`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS gender VARCHAR(50)`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS address TEXT`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS state VARCHAR(100)`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS district VARCHAR(100)`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS pincode VARCHAR(20)`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS aadhar_no VARCHAR(50)`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS aadhar_card_url TEXT`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS signature_url TEXT`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS login_time_type VARCHAR(50) DEFAULT 'Always'`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS login_time VARCHAR(50)`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS logout_time VARCHAR(50)`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS login_expire_date DATE`)
    await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS device_permission_count INTEGER DEFAULT 1`)

    // Check if admin already exists
    const existing = await pool.query(
      "SELECT id FROM admins WHERE email = 'admin@academysetu.com' LIMIT 1"
    )

    if (existing.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10)
      await pool.query(
        `INSERT INTO admins (name, email, password_hash, role, id_no, phone, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Super Admin', 'admin@academysetu.com', hashedPassword, 'Admin', 'AS001', '9999999999', true]
      )
    }

    // Seed Ashok, Rahul, Suraj, Vikram safely
    const hashedPassword = await bcrypt.hash('User@123', 10)
    await pool.query(`
      INSERT INTO admins (name, email, password_hash, role, id_no, phone, is_active) VALUES
      ('Ashok', 'ashok@academysetu.com', $1, 'Admin', 'AS123', '9999999999', true),
      ('Rahul', 'rahul@academysetu.com', $1, 'Manager', 'AS123', '9999999999', false),
      ('Suraj', 'suraj@academysetu.com', $1, 'BDM', 'AS123', '9999999999', true),
      ('Vikram', 'vikram@academysetu.com', $1, 'Support Team', 'AS123', '9999999999', true)
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword])

    // Create segments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS segments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        services TEXT[] NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Create applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_no VARCHAR(50) NOT NULL UNIQUE,
        school_name VARCHAR(255) NOT NULL,
        school_code VARCHAR(100),
        affiliated_to VARCHAR(255),
        affiliation_code VARCHAR(100),
        contact_person VARCHAR(255) NOT NULL,
        mobile_no VARCHAR(20),
        email_id VARCHAR(255),
        address TEXT,
        state VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        pincode VARCHAR(20),
        principal_name VARCHAR(255),
        principal_gender VARCHAR(50),
        principal_sign TEXT,
        principal_photo TEXT,
        director_name VARCHAR(255),
        director_gender VARCHAR(50),
        director_sign TEXT,
        director_photo TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Applied',
        enquiry_status VARCHAR(100),
        plan VARCHAR(255),
        promo_code VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // In case the table already existed, add the new columns if they do not exist
    await pool.query(`
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS school_code VARCHAR(100);
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS affiliated_to VARCHAR(255);
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS affiliation_code VARCHAR(100);
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS mobile_no VARCHAR(20);
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS email_id VARCHAR(255);
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS principal_name VARCHAR(255);
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS principal_gender VARCHAR(50);
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS principal_sign TEXT;
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS principal_photo TEXT;
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS director_name VARCHAR(255);
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS director_gender VARCHAR(50);
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS director_sign TEXT;
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS director_photo TEXT;
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS enquiry_status VARCHAR(100);
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS plan VARCHAR(255);
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS promo_code VARCHAR(255);
    `)



    // Seed segments if empty
    const segmentCount = await pool.query("SELECT COUNT(*) FROM segments")
    if (parseInt(segmentCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO segments (name, services, description) VALUES
        ('School', ARRAY['Student Service'], 'School segment for primary and secondary education'),
        ('Coaching', ARRAY['Teacher Service'], 'Coaching segment for test preparation'),
        ('College', ARRAY['Employee Service'], 'College segment for higher education'),
        ('Teacher', ARRAY['Student Service'], 'Teacher tracking and assignments'),
        ('Principal', ARRAY['Teacher Service'], 'Principal administration'),
        ('Administration', ARRAY['Employee Service'], 'General administrative activities'),
        ('Driver', ARRAY['Certificate Service'], 'Driver documentation and tracking'),
        ('Student', ARRAY['ID Card Service'], 'Student identification services'),
        ('Parents', ARRAY['Admit Card Service'], 'Parent communication portal'),
        ('Influencer', ARRAY['Worksheet Service'], 'Influencer outreach program'),
        ('Staff', ARRAY['Gate Pass Service'], 'Staff gate passes'),
        ('Manager', ARRAY['Transport Service'], 'Manager transport services'),
        ('Vice Principal', ARRAY['Other Service'], 'Vice Principal oversight');
      `)
    }

    // Seed applications if empty
    const appCount = await pool.query("SELECT COUNT(*) FROM applications")
    if (parseInt(appCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO applications (application_no, school_name, contact_person, state, district, status) VALUES
        ('AS2026123', 'abcdschoolname', 'Rahul', 'Uttar Pradesh', 'Lucknow', 'Applied'),
        ('AS2026124', 'abcdschoolname', 'Shivam', 'Uttar Pradesh', 'Varanasi', 'Generate'),
        ('AS2026125', 'abcdschoolname', 'Rishi', 'Madhya Pradesh', 'Bhopal', 'Requested'),
        ('AS2026126', 'abcdschoolname', 'Ashutosh', 'Punjab', 'Chandigarh', 'Completed'),
        ('AS2026127', 'abcdschoolname', 'Kirti', 'Himachal Pradesh', 'Chandigarh', 'Applied'),
        ('AS2026128', 'abcdschoolname', 'Priti', 'Uttar Pradesh', 'Prayagraj', 'Generate'),
        ('AS2026129', 'abcdschoolname', 'Suman', 'Maharashtra', 'Mumbai', 'Requested'),
        ('AS2026130', 'abcdschoolname', 'Yogesh', 'Punjab', 'Chandigarh', 'Completed'),
        ('AS2026131', 'abcdschoolname', 'Rimi', 'Bihar', 'Patna', 'Applied'),
        ('AS2026132', 'abcdschoolname', 'Suraj', 'Punjab', 'Chandigarh', 'Generate'),
        ('AS2026133', 'abcdschoolname', 'Amit', 'Haryana', 'Gurugram', 'Completed'),
        ('AS2026134', 'abcdschoolname', 'Pooja', 'Delhi', 'New Delhi', 'Applied');
      `)
    }

    // Create plans table (without JSONB billing columns)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        segment TEXT NOT NULL,
        applied_by TEXT NOT NULL,
        plan_for TEXT NOT NULL DEFAULT 'All User',
        plan_name TEXT NOT NULL,
        description TEXT,
        no_of_students INTEGER,
        students_fee_relaxation INTEGER,
        additional_charge_per_student NUMERIC(10,2),
        first_billing_duration INTEGER,
        renewal_billing_duration INTEGER,
        renewal_pre_bill_generate_days INTEGER,
        renewal_payment_relaxation NUMERIC(5,2),
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Drop JSONB columns if they exist on the old plans table
    await pool.query(`ALTER TABLE plans DROP COLUMN IF EXISTS first_billing_items`)
    await pool.query(`ALTER TABLE plans DROP COLUMN IF EXISTS renewal_billing_items`)

    // Create plan_billing_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plan_billing_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
        billing_type TEXT NOT NULL CHECK (billing_type IN ('first', 'renewal')),
        serial_no INTEGER NOT NULL,
        item_description TEXT NOT NULL DEFAULT '',
        price NUMERIC(10,2) NOT NULL DEFAULT 0,
        tax_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
        tax_price NUMERIC(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_plan_billing_items_plan_id ON plan_billing_items(plan_id)`)

    // Create promo_codes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT DEFAULT '',
        segment VARCHAR(255) DEFAULT '',
        applicable_by VARCHAR(255) DEFAULT '',
        applicable_one BOOLEAN DEFAULT false,
        discount_name VARCHAR(255) DEFAULT '',
        discount_type VARCHAR(10) NOT NULL DEFAULT 'Percentage' CHECK (discount_type IN ('Percentage', 'Fixed')),
        discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
        max_uses INTEGER NOT NULL DEFAULT 0,
        current_uses INTEGER NOT NULL DEFAULT 0,
        start_date DATE,
        has_expiry BOOLEAN DEFAULT false,
        expiry_date DATE,
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Add new columns if table already existed
    await pool.query(`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS segment VARCHAR(255) DEFAULT ''`)
    await pool.query(`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS applicable_by VARCHAR(255) DEFAULT ''`)
    await pool.query(`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS applicable_one BOOLEAN DEFAULT false`)
    await pool.query(`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS discount_name VARCHAR(255) DEFAULT ''`)
    await pool.query(`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS start_date DATE`)
    await pool.query(`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS has_expiry BOOLEAN DEFAULT false`)
    await pool.query(`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS expiry_date DATE`)

    // Seed promo_codes if empty
    const promoCount = await pool.query("SELECT COUNT(*) FROM promo_codes")
    if (parseInt(promoCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO promo_codes (code, description, segment, applicable_by, applicable_one, discount_name, discount_type, discount_value, max_uses) VALUES
        ('WELCOME10', '10% off for new users', 'School', 'Website Purchase', false, 'Welcome Discount', 'Percentage', 10, 100),
        ('FLAT500', 'Flat ₹500 off on all plans', 'College', 'Only Admin', false, 'Flat Discount', 'Fixed', 500, 50),
        ('STUDENT20', '20% discount for students', 'Student', 'BDM', true, 'Student Offer', 'Percentage', 20, 200);
      `)
    }

    // Seed plans if empty
    const planCount = await pool.query("SELECT COUNT(*) FROM plans")
    if (parseInt(planCount.rows[0].count) === 0) {
      const segments = ['Plan 1','Plan 1','Plan 1','Plan 1','Student','Parents','Influencer','Staff','Manager','Vice Principal']
      const appliedBy = ['Website Purchase','Only Admin','BDM','Manager']
      for (let i = 0; i < 10; i++) {
        const planRes = await pool.query(
          `INSERT INTO plans (segment, applied_by, plan_for, plan_name, description, no_of_students, students_fee_relaxation, additional_charge_per_student, first_billing_duration, renewal_billing_duration, renewal_pre_bill_generate_days, renewal_payment_relaxation)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
          [
            segments[i], appliedBy[i % 4], 'All User', segments[i], 'Auto-generated plan', 100, 10, 50,
            365, 365, 5, 10
          ]
        )
        const planId = planRes.rows[0].id
        await pool.query(
          `INSERT INTO plan_billing_items (plan_id, billing_type, serial_no, item_description, price, tax_percentage, tax_price)
           VALUES ($1, 'first', 1, 'Service Fee', 1000, 20, 200),
                  ($2, 'renewal', 1, 'Service Fee', 1000, 20, 200)`,
          [planId, planId]
        )
      }
    }

    // Create bills table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        segment VARCHAR(255) NOT NULL,
        school_name VARCHAR(255) NOT NULL,
        plan_name VARCHAR(255) NOT NULL,
        payment_mode VARCHAR(50) NOT NULL,
        payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        amount NUMERIC(10,2) NOT NULL DEFAULT 0,
        transaction_id VARCHAR(100),
        status VARCHAR(50) NOT NULL DEFAULT 'Paid',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed bills if empty
    const billsCount = await pool.query("SELECT COUNT(*) FROM bills")
    if (parseInt(billsCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO bills (segment, school_name, plan_name, payment_mode, payment_date, amount, transaction_id, status) VALUES
        ('School', 'abcdschool', 'Plan 1', 'Bank Account', '2026-01-12', 1000.00, 'TXN10001', 'Paid'),
        ('College', 'abcdschool', 'Plan 2', 'UPI ID', '2026-01-12', 2000.00, 'TXN10002', 'Paid'),
        ('Coaching', 'abcdschool', 'Plan 3', 'QR Mode', '2026-01-12', 3000.00, 'TXN10003', 'Paid');
      `)
    }

    // Create requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        school_name VARCHAR(255) NOT NULL,
        plan_name VARCHAR(255) NOT NULL,
        payment_mode VARCHAR(50) NOT NULL,
        transaction_id VARCHAR(100),
        amount NUMERIC(10,2) NOT NULL DEFAULT 0,
        transaction_amount NUMERIC(10,2) DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        screenshots JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed requests if empty
    const requestsCount = await pool.query("SELECT COUNT(*) FROM requests")
    if (parseInt(requestsCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO requests (school_name, plan_name, payment_mode, transaction_id, amount, transaction_amount, status, screenshots) VALUES
        ('abcdschoolname', 'Plan 1', 'Bank Account', 'TXN.1235', 2000.00, 2000.00, 'Accept', '[{"amount": 1000, "filename": "Screenshot 1.jpg"}, {"amount": 1000, "filename": "Screenshot 2.jpg"}]'::jsonb),
        ('abcdschoolname', 'Plan 2', 'UPI', 'TXN.12345', 10000.00, 0.00, 'Pending', '[{"amount": 5000, "filename": "Screenshot 1.jpg"}, {"amount": 5000, "filename": "Screenshot 1.jpg"}]'::jsonb),
        ('abcdschoolname', 'Plan 3', 'QR', 'TXN.12345', 20000.00, 20000.00, 'Accept', '[{"amount": 10000, "filename": "Screenshot 1.jpg"}, {"amount": 10000, "filename": "Screenshot 1.jpg"}]'::jsonb);
      `)
    }

    // Create tickets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_no VARCHAR(50) UNIQUE NOT NULL,
        assigned_to VARCHAR(100) DEFAULT '',
        segment VARCHAR(100) NOT NULL,
        school_name VARCHAR(255) NOT NULL,
        ticket_category VARCHAR(255) DEFAULT '',
        sub_category VARCHAR(255) DEFAULT '',
        priority VARCHAR(50) DEFAULT 'Low',
        complainer_name VARCHAR(255) DEFAULT '',
        complainer_mobile VARCHAR(50) DEFAULT '',
        description TEXT DEFAULT '',
        image_attachment VARCHAR(255) DEFAULT '',
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed tickets if empty
    const ticketsCount = await pool.query("SELECT COUNT(*) FROM tickets")
    if (parseInt(ticketsCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO tickets (ticket_no, assigned_to, segment, school_name, ticket_category, sub_category, priority, complainer_name, complainer_mobile, description, image_attachment, status) VALUES
        ('Tick12345', 'Riya', 'School', 'Student Registration', 'Billing Issue', 'Invoice Error', 'Low', 'John Doe', '9876543210', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'screenshot_txn_bank.png', 'Pending'),
        ('Tick12346', 'Riya', 'College', 'Teacher Document', 'Technical Support', 'Login Failure', 'Low', 'Jane Smith', '9876543211', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'screenshot_txn_upi.png', 'Requested'),
        ('Tick12347', 'Riya', 'Institute', 'Employee Attendance', 'Account Settings', 'Profile Edit', 'Low', 'Bob Johnson', '9876543212', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'screenshot_txn_qr.png', 'Completed');
      `)
    }

    // Create ticket_categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT DEFAULT '',
        parent_category VARCHAR(255) DEFAULT '',
        segment VARCHAR(255) DEFAULT '',
        low_timeline VARCHAR(255) DEFAULT '',
        medium_timeline VARCHAR(255) DEFAULT '',
        high_timeline VARCHAR(255) DEFAULT '',
        is_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Add new columns in case table already existed
    await pool.query(`
      ALTER TABLE ticket_categories ADD COLUMN IF NOT EXISTS parent_category VARCHAR(255) DEFAULT '';
      ALTER TABLE ticket_categories ADD COLUMN IF NOT EXISTS segment VARCHAR(255) DEFAULT '';
      ALTER TABLE ticket_categories ADD COLUMN IF NOT EXISTS low_timeline VARCHAR(255) DEFAULT '';
      ALTER TABLE ticket_categories ADD COLUMN IF NOT EXISTS medium_timeline VARCHAR(255) DEFAULT '';
      ALTER TABLE ticket_categories ADD COLUMN IF NOT EXISTS high_timeline VARCHAR(255) DEFAULT '';
      ALTER TABLE ticket_categories ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
    `)

    // Clean and seed exact layout ticket categories
    await pool.query("DELETE FROM ticket_categories")
    await pool.query(`
      INSERT INTO ticket_categories (name, parent_category, segment, low_timeline, medium_timeline, high_timeline, is_deleted, created_at) VALUES
      ('Student Registration', 'Students', '10/01/2026', '1-2 Hour', '4-5 Hour', '6-7 Hour', false, '2025-09-15 11:00:00+05:30'),
      ('Teacher Document', 'Teacher', '10/01/2026', '4-5 Hour', '2-3 Hour', '8-9 Hour', false, '2025-09-15 11:00:00+05:30'),
      ('Employee Attendance', 'Employee', '10/01/2026', '2-3 Hour', '5-6 Hour', '1-2 Hour', false, '2025-09-16 11:00:00+05:30'),
      ('Billing Issue', 'Billing', '10/01/2026', '1-2 Hour', '4-5 Hour', '6-7 Hour', true, '2025-09-10 11:00:00+05:30'),
      ('Technical Support', 'Technical', '10/01/2026', '4-5 Hour', '2-3 Hour', '8-9 Hour', true, '2025-09-10 11:00:00+05:30'),
      ('Account Settings', 'Account', '10/01/2026', '2-3 Hour', '5-6 Hour', '1-2 Hour', true, '2025-09-10 11:00:00+05:30');
    `)

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender VARCHAR(100) NOT NULL,
        receiver VARCHAR(100) NOT NULL,
        message TEXT NOT NULL DEFAULT '',
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed messages if empty
    const messagesCount = await pool.query("SELECT COUNT(*) FROM messages")
    if (parseInt(messagesCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO messages (sender, receiver, message, is_read, created_at) VALUES
        ('Manager', 'Super Admin', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', true, CURRENT_DATE + TIME '20:30:00'),
        ('Super Admin', 'Manager', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', true, CURRENT_DATE + TIME '20:34:00'),
        ('Manager', 'Super Admin', 'Lorem ipsum dolor sit amet,', true, CURRENT_DATE + TIME '20:36:00'),
        ('Super Admin', 'Manager', 'Lorem ipsum dolor sit amet,', true, CURRENT_DATE + TIME '20:58:00'),
        ('BDM', 'Super Admin', 'Lorem ipsum dolor sit amet,', false, CURRENT_DATE + TIME '12:11:00'),
        ('Admin', 'Super Admin', 'Lorem ipsum dolor sit amet, consec...', false, CURRENT_DATE + TIME '14:40:00');
      `)
    }

    // Create lead_statuses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lead_statuses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        text_color VARCHAR(50) DEFAULT '',
        bg_color VARCHAR(50) DEFAULT '',
        show_on_bdm BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed lead_statuses if empty
    const statusesCount = await pool.query("SELECT COUNT(*) FROM lead_statuses")
    if (parseInt(statusesCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO lead_statuses (name, text_color, bg_color, show_on_bdm, created_at) VALUES
        ('Completed', '#10B981', '#E6F4EA', true, CURRENT_DATE + TIME '11:00:00'),
        ('Pending', '#F59E0B', '#FEF3C7', true, CURRENT_DATE + TIME '11:00:00'),
        ('Cancelled', '#EF4444', '#FEE2E2', true, CURRENT_DATE + TIME '11:00:00'),
        ('Created', '#D97706', '#FEF3C7', true, CURRENT_DATE + TIME '11:00:00');
      `)
    }

    // Create leads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_source VARCHAR(150) NOT NULL,
        mobile_no VARCHAR(50) NOT NULL,
        email_id VARCHAR(150) DEFAULT '',
        contact_person VARCHAR(255) DEFAULT '',
        school_name VARCHAR(255) NOT NULL,
        state VARCHAR(100) DEFAULT '',
        district VARCHAR(100) DEFAULT '',
        no_of_students INTEGER DEFAULT 0,
        status VARCHAR(100) DEFAULT 'Created',
        assigned_to VARCHAR(150) DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Create lead_history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lead_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        communication_option VARCHAR(50) NOT NULL,
        call_duration VARCHAR(100) DEFAULT '',
        remarks TEXT DEFAULT '',
        follow_up_date DATE,
        status VARCHAR(100) DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed leads and histories if empty
    const leadsCount = await pool.query("SELECT COUNT(*) FROM leads")
    if (parseInt(leadsCount.rows[0].count) === 0) {
      const res1 = await pool.query(`
        INSERT INTO leads (lead_source, mobile_no, email_id, contact_person, school_name, state, district, no_of_students, status, assigned_to, created_at, updated_at)
        VALUES ('Offline Meeting', '9999999999', 'test1@school.com', 'John Doe', 'abcdschool', 'Uttar Pradesh', 'Lucknow', 500, 'Created', 'Riya', '2025-09-15 11:00:00+05:30', '2025-09-15 11:00:00+05:30')
        RETURNING id
      `)
      const leadId1 = res1.rows[0].id
      await pool.query(`
        INSERT INTO lead_history (lead_id, communication_option, call_duration, remarks, follow_up_date, status, created_at)
        VALUES ($1, 'Call', '2 min', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', '2025-09-20', 'Created', '2025-09-15 11:00:00+05:30')
      `, [leadId1])

      const res2 = await pool.query(`
        INSERT INTO leads (lead_source, mobile_no, email_id, contact_person, school_name, state, district, no_of_students, status, assigned_to, created_at, updated_at)
        VALUES ('YouTube', '9999999999', 'test2@school.com', 'Jane Smith', 'abcdschool', 'Uttar Pradesh', 'Noida', 400, 'Created', 'Riya', '2025-09-15 11:00:00+05:30', '2025-09-15 11:00:00+05:30')
        RETURNING id
      `)
      const leadId2 = res2.rows[0].id
      await pool.query(`
        INSERT INTO lead_history (lead_id, communication_option, call_duration, remarks, follow_up_date, status, created_at)
        VALUES ($1, 'Message', '', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', '2025-09-21', 'Created', '2025-09-15 11:00:00+05:30')
      `, [leadId2])

      const res3 = await pool.query(`
        INSERT INTO leads (lead_source, mobile_no, email_id, contact_person, school_name, state, district, no_of_students, status, assigned_to, created_at, updated_at)
        VALUES ('Facebook', '9999999999', 'test3@school.com', 'Bob Johnson', 'abcdschool', 'Madhya Pradesh', 'Bhopal', 600, 'Created', 'Riya', '2025-09-15 11:00:00+05:30', '2025-09-15 11:00:00+05:30')
        RETURNING id
      `)
      const leadId3 = res3.rows[0].id
      await pool.query(`
        INSERT INTO lead_history (lead_id, communication_option, call_duration, remarks, follow_up_date, status, created_at)
        VALUES ($1, 'Call', '5 min', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', '2025-09-22', 'Created', '2025-09-15 11:00:00+05:30')
      `, [leadId3])
    }

    // Create referrals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referral_by VARCHAR(255) NOT NULL,
        referral_to VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        mobile_no VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed referrals if empty
    const referralsCount = await pool.query("SELECT COUNT(*) FROM referrals")
    if (parseInt(referralsCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO referrals (referral_by, referral_to, name, address, mobile_no, status, created_at) VALUES
        ('abcdschool', 'abcdschool', 'Alok', 'Lucknow, UP', '9999999999', 'Pending', NOW() - interval '3 days'),
        ('abcdschool', 'abcdschool', 'Ravi', 'Noida, UP', '9999999999', 'Onboarded', NOW() - interval '2 days'),
        ('abcdschool', 'abcdschool', 'Priya', 'Bhopal, MP', '9999999999', 'Pending', NOW() - interval '1 day');
      `)
      
      // Seed a few more rows for pagination
      for (let i = 4; i <= 25; i++) {
        const names = ['Vikram', 'Sanjay', 'Neha', 'Sunita', 'Rajesh', 'Anjali', 'Karan', 'Deepa']
        const cities = ['Lucknow, UP', 'Noida, UP', 'Bhopal, MP', 'Varanasi, UP', 'Mumbai, MH', 'Patna, BR', 'Delhi, DL']
        const statuses = ['Pending', 'Onboarded']
        const name = names[i % names.length] + ' ' + i
        const city = cities[i % cities.length]
        const status = statuses[i % statuses.length]
        await pool.query(
          `INSERT INTO referrals (referral_by, referral_to, name, address, mobile_no, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW() - ($7 * interval '1 hour'))`,
          ['abcdschool', 'abcdschool', name, city, '9999999999', status, i * 3]
        )
      }
    }

    // Create queries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS queries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        mobile_no VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL DEFAULT '',
        query_for VARCHAR(255) NOT NULL DEFAULT '',
        message TEXT NOT NULL DEFAULT '',
        response_message TEXT DEFAULT '',
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed queries if empty
    const queriesCount = await pool.query("SELECT COUNT(*) FROM queries")
    if (parseInt(queriesCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO queries (name, mobile_no, email, query_for, message, response_message, status, created_at) VALUES
        ('Ashok', '9999999999', 'abcd@gmail.com', 'Lorem Ipsum', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Responded', NOW() - interval '3 days'),
        ('Rahul', '9999999999', 'abcd@gmail.com', 'Lorem Ipsum', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Responded', NOW() - interval '2 days'),
        ('Suraj', '9999999999', 'abcd@gmail.com', 'Lorem Ipsum', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', '', 'Pending', NOW() - interval '1 day');
      `)

      // Seed extra rows for pagination
      for (let i = 4; i <= 25; i++) {
        const qnames = ['Vijay', 'Priya', 'Ravi', 'Anita', 'Karan', 'Meena', 'Raju', 'Deepa']
        const qname = qnames[i % qnames.length] + ' ' + i
        const qstatus = i % 3 === 0 ? 'Pending' : 'Responded'
        await pool.query(
          `INSERT INTO queries (name, mobile_no, email, query_for, message, response_message, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - ($8 * interval '1 hour'))`,
          [qname, '9999999999', 'abcd@gmail.com', 'Lorem Ipsum', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', qstatus === 'Responded' ? 'Thank you for your query.' : '', qstatus, i * 4]
        )
      }
    }

    // Create distributors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS distributors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dist_id VARCHAR(100) UNIQUE NOT NULL,
        joining_date DATE,
        name VARCHAR(255) NOT NULL,
        mobile_no VARCHAR(50) NOT NULL,
        email VARCHAR(255) DEFAULT '',
        gender VARCHAR(50) DEFAULT '',
        photo_url TEXT DEFAULT '',
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) DEFAULT '',
        address TEXT DEFAULT '',
        state VARCHAR(100) DEFAULT '',
        district VARCHAR(100) DEFAULT '',
        pincode VARCHAR(20) DEFAULT '',
        aadhar_no VARCHAR(50) DEFAULT '',
        aadhar_url TEXT DEFAULT '',
        signature_url TEXT DEFAULT '',
        agreement_url TEXT DEFAULT '',
        commission_in VARCHAR(50) DEFAULT '',
        commission_value NUMERIC(10,2) DEFAULT 0,
        commission_type VARCHAR(50) DEFAULT '',
        assign_area TEXT DEFAULT '',
        account_holder_name VARCHAR(255) DEFAULT '',
        account_number VARCHAR(100) DEFAULT '',
        ifsc_code VARCHAR(50) DEFAULT '',
        bank_name VARCHAR(255) DEFAULT '',
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Add new columns to distributors if they don't exist
    await pool.query(`ALTER TABLE distributors ADD COLUMN IF NOT EXISTS pan_no VARCHAR(20) DEFAULT ''`)
    await pool.query(`ALTER TABLE distributors ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255) DEFAULT ''`)
    await pool.query(`ALTER TABLE distributors ADD COLUMN IF NOT EXISTS qr_code_url TEXT DEFAULT ''`)
    await pool.query(`ALTER TABLE distributors ADD COLUMN IF NOT EXISTS commission_total NUMERIC(10,2) DEFAULT 0`)

    // Seed distributors if empty
    const distCount = await pool.query("SELECT COUNT(*) FROM distributors")
    if (parseInt(distCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO distributors (dist_id, joining_date, name, mobile_no, email, gender, username, address, state, district, pincode, commission_in, commission_value, commission_type, assign_area, account_holder_name, account_number, ifsc_code, bank_name, pan_no, upi_id, commission_total, status, created_at) VALUES
        ('DIST001', '2025-01-10', 'Ashok', '9999999999', 'ashok@email.com', 'Male', 'ashok_dist', '123, Main Street', 'Uttar Pradesh', 'Lucknow', '226001', 'Percentage', 10, 'Regular', 'Lucknow Region', 'Ashok Kumar', '1234567890', 'ABCD1234567890', 'SBI Bank', 'ABCDE1234F', 'abcd1234567890', 25000, 'Active', NOW() - interval '60 days'),
        ('DIST002', '2025-02-15', 'Rahul', '9999999999', 'rahul@email.com', 'Male', 'rahul_dist', '456, MG Road', 'Madhya Pradesh', 'Bhopal', '462001', 'Amount', 500, 'One Time', 'Bhopal Region', 'Rahul Sharma', '9876543210', 'WXYZ9876543210', 'HDFC Bank', 'FGHIJ5678K', 'rahul_upi@bank', 12000, 'Active', NOW() - interval '30 days'),
        ('DIST003', '2025-03-20', 'Suraj', '9999999999', 'suraj@email.com', 'Male', 'suraj_dist', '789, Civil Lines', 'Delhi', 'New Delhi', '110001', 'Percentage', 15, 'Regular', 'Delhi NCR', 'Suraj Verma', '1122334455', 'PQRS1122334455', 'ICICI Bank', 'LMNOP9012Q', 'suraj_pay@upi', 10000, 'Active', NOW() - interval '10 days');
      `)
    } else {
      // Update existing seeded distributors with new fields
      await pool.query(`UPDATE distributors SET commission_total = 25000, upi_id = 'abcd1234567890', account_holder_name = 'Ashok Kumar', account_number = '1234567890', ifsc_code = 'ABCD1234567890' WHERE name = 'Ashok' AND commission_total = 0`)
      await pool.query(`UPDATE distributors SET commission_total = 12000, upi_id = 'rahul_upi@bank', account_holder_name = 'Rahul Sharma', account_number = '9876543210', ifsc_code = 'WXYZ9876543210' WHERE name = 'Rahul' AND commission_total = 0`)
      await pool.query(`UPDATE distributors SET commission_total = 10000, upi_id = 'suraj_pay@upi', account_holder_name = 'Suraj Verma', account_number = '1122334455', ifsc_code = 'PQRS1122334455' WHERE name = 'Suraj' AND commission_total = 0`)
    }

    // Create distributor_payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS distributor_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
        distributor_name VARCHAR(255) NOT NULL,
        amount NUMERIC(10,2) NOT NULL DEFAULT 0,
        payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        payment_mode VARCHAR(100) DEFAULT '',
        transaction_id VARCHAR(100) DEFAULT '',
        status VARCHAR(50) DEFAULT 'Paid',
        remarks TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed payment records if none exist
    const payCount = await pool.query("SELECT COUNT(*) FROM distributor_payments")
    if (parseInt(payCount.rows[0].count) === 0) {
      const dist1 = await pool.query("SELECT id FROM distributors ORDER BY created_at ASC LIMIT 1")
      if (dist1.rows.length > 0) {
        const did = dist1.rows[0].id
        const dname = (await pool.query("SELECT name FROM distributors WHERE id = $1", [did])).rows[0]?.name || 'Ashok'
        await pool.query(`
          INSERT INTO distributor_payments (distributor_id, distributor_name, amount, payment_date, payment_mode, transaction_id, status, created_at) VALUES
          ($1, $2, 10000.00, '2025-01-11', 'Bank Account', 'abcd123456789', 'Paid', '2025-01-11 11:00:00+05:30'),
          ($1, $2, 25000.00, '2025-02-13', 'UPI', 'abcd123456789', 'Paid', '2025-02-13 11:00:00+05:30')
        `, [did, dname])
      }
    }

    // Create income categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS income_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT DEFAULT '',
        category_type VARCHAR(50) DEFAULT 'Income',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    await pool.query(`ALTER TABLE income_categories ADD COLUMN IF NOT EXISTS category_type VARCHAR(50) DEFAULT 'Income'`)

    // Create income parties table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS income_parties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        mobile_no VARCHAR(50) DEFAULT '',
        email VARCHAR(255) DEFAULT '',
        party_category VARCHAR(50) DEFAULT 'Income',
        contact_person VARCHAR(255) DEFAULT '',
        amount NUMERIC(10,2) DEFAULT 0,
        gst_no VARCHAR(100) DEFAULT '',
        address TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)
    await pool.query(`ALTER TABLE income_parties ADD COLUMN IF NOT EXISTS party_category VARCHAR(50) DEFAULT 'Income'`)
    await pool.query(`ALTER TABLE income_parties ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255) DEFAULT ''`)
    await pool.query(`ALTER TABLE income_parties ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2) DEFAULT 0`)
    await pool.query(`ALTER TABLE income_parties ADD COLUMN IF NOT EXISTS gst_no VARCHAR(100) DEFAULT ''`)
    await pool.query(`ALTER TABLE income_parties ADD COLUMN IF NOT EXISTS address TEXT DEFAULT ''`)

    // Create income sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS income_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Create income records table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS income_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trans_id VARCHAR(100) DEFAULT '',
        income_category VARCHAR(255) DEFAULT '',
        amount NUMERIC(10,2) DEFAULT 0,
        payment_mode VARCHAR(100) DEFAULT '',
        received_date DATE NOT NULL DEFAULT CURRENT_DATE,
        received_from VARCHAR(255) DEFAULT '',
        payment_account VARCHAR(100) DEFAULT '',
        reference_no VARCHAR(100) DEFAULT '',
        session_name VARCHAR(100) DEFAULT '',
        photo_url TEXT DEFAULT '',
        status VARCHAR(50) DEFAULT 'Paid',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed income categories if empty
    const icCount = await pool.query("SELECT COUNT(*) FROM income_categories")
    if (parseInt(icCount.rows[0].count) <= 8) { // if standard seeds or empty
      await pool.query("DELETE FROM income_categories")
      await pool.query(`
        INSERT INTO income_categories (name, category_type, description) VALUES
        ('Utilities', 'Income', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,'),
        ('Maintenance', 'Income', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,'),
        ('Transportation', 'Expense', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,'),
        ('Sports', 'Income', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,'),
        ('Office Supplies', 'Expense', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,')
      `)
    }

    // Seed income parties if empty
    const ipCount = await pool.query("SELECT COUNT(*) FROM income_parties")
    if (parseInt(ipCount.rows[0].count) <= 5) {
      await pool.query("DELETE FROM income_parties")
      await pool.query(`
        INSERT INTO income_parties (name, party_category, contact_person, amount, mobile_no, email, gst_no) VALUES
        ('Budget', 'Income', 'Sudhir Rawat', 3000.00, '9999999999', 'abcd123@gmail.com', 'abcd1234/0000'),
        ('Ranjeet', 'Income', 'Sudhir Rawat', 3000.00, '9999999999', 'abcd123@gmail.com', 'abcd1234/0000'),
        ('Komal', 'Expense', 'Sudhir Rawat', 3000.00, '9999999999', 'abcd123@gmail.com', 'abcd1234/0000'),
        ('Sohan', 'Income', 'Sudhir Rawat', 3000.00, '9999999999', 'abcd123@gmail.com', 'abcd1234/0000'),
        ('Vehicle', 'Expense', 'Sudhir Rawat', 3000.00, '9999999999', 'abcd123@gmail.com', 'abcd1234/0000')
      `)
    }

    // Seed income sessions if empty
    const isCount = await pool.query("SELECT COUNT(*) FROM income_sessions")
    if (parseInt(isCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO income_sessions (name) VALUES ('2023-24'), ('2024-25'), ('2025-26')
      `)
    }

    // Seed income records if empty
    const irCount = await pool.query("SELECT COUNT(*) FROM income_records")
    if (parseInt(irCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO income_records (trans_id, income_category, amount, payment_mode, received_date, received_from, payment_account, session_name, status, created_at) VALUES
        ('123/456', 'Budget', 2500.00, 'Cash', '2025-01-02', 'Neeraj', 'SBI', '2024-25', 'Paid', NOW() - interval '10 days'),
        ('123/456', 'Refreshment', 800.00, 'UPI', '2025-01-02', 'Sourabh', 'HDFC', '2024-25', 'Unpaid', NOW() - interval '9 days'),
        ('123/456', 'School Bus', 2500.00, 'RTGS', '2025-01-02', 'Kamlesh', 'ICICI', '2024-25', 'Paid', NOW() - interval '8 days'),
        ('124/456', 'Library Fee', 500.00, 'Cash', '2025-01-05', 'Priya Singh', 'SBI', '2024-25', 'Paid', NOW() - interval '7 days'),
        ('125/456', 'Lab Fee', 1200.00, 'UPI', '2025-01-06', 'Amit Verma', 'HDFC', '2024-25', 'Paid', NOW() - interval '6 days'),
        ('126/456', 'Sports Fee', 300.00, 'Cash', '2025-01-07', 'Neeraj', 'SBI', '2024-25', 'Unpaid', NOW() - interval '5 days'),
        ('127/456', 'Tuition Fee', 3500.00, 'RTGS', '2025-01-08', 'Sourabh', 'ICICI', '2024-25', 'Paid', NOW() - interval '4 days'),
        ('128/456', 'Exam Fee', 750.00, 'UPI', '2025-01-09', 'Kamlesh', 'HDFC', '2024-25', 'Paid', NOW() - interval '3 days'),
        ('129/456', 'Budget', 4000.00, 'Cash', '2025-01-10', 'Priya Singh', 'SBI', '2024-25', 'Unpaid', NOW() - interval '2 days'),
        ('130/456', 'Refreshment', 600.00, 'UPI', '2025-01-11', 'Amit Verma', 'HDFC', '2024-25', 'Paid', NOW() - interval '1 day'),
        ('131/456', 'School Bus', 2500.00, 'Cash', '2025-01-12', 'Neeraj', 'SBI', '2024-25', 'Paid', NOW() - interval '12 hours'),
        ('132/456', 'Library Fee', 450.00, 'RTGS', '2025-01-13', 'Sourabh', 'ICICI', '2024-25', 'Paid', NOW() - interval '6 hours')
      `)
    }

    // Create expense_records table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expense_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trans_id VARCHAR(100) DEFAULT '',
        expense_category VARCHAR(255) DEFAULT '',
        amount NUMERIC(10,2) DEFAULT 0,
        payment_mode VARCHAR(100) DEFAULT '',
        expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
        paid_by VARCHAR(255) DEFAULT '',
        paid_to VARCHAR(255) DEFAULT '',
        payment_account VARCHAR(100) DEFAULT '',
        received_by VARCHAR(255) DEFAULT '',
        approved_by VARCHAR(255) DEFAULT '',
        photo_url TEXT DEFAULT '',
        status VARCHAR(50) DEFAULT 'Paid',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed expense records if empty
    const erCount = await pool.query("SELECT COUNT(*) FROM expense_records")
    if (parseInt(erCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO expense_records (trans_id, expense_category, amount, payment_mode, expense_date, paid_by, paid_to, payment_account, status, created_at) VALUES
        ('123/456', 'Budget', 2500.00, 'Cash', '2025-01-02', 'Neeraj', 'Gokul', 'SBI', 'Paid', NOW() - interval '5 days'),
        ('123/456', 'Refreshment', 800.00, 'UPI', '2025-01-02', 'Sourabh', 'Kamal', 'HDFC', 'Unpaid', NOW() - interval '4 days'),
        ('123/456', 'School Bus', 2500.00, 'RTGS', '2025-01-02', 'Kamlesh', 'Anil', 'ICICI', 'Paid', NOW() - interval '3 days')
      `)
    }

    // Create states_districts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS states_districts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        state_name VARCHAR(255) UNIQUE NOT NULL,
        districts TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed states_districts if empty
    const sdCount = await pool.query("SELECT COUNT(*) FROM states_districts")
    if (parseInt(sdCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO states_districts (state_name, districts) VALUES
        ('Uttar Pradesh', ARRAY['Lucknow', 'Kanpur', 'Amethi', 'Jaunpur']),
        ('Bihar', ARRAY['District 1', 'District 2', 'District 3']),
        ('Delhi', ARRAY['District 1', 'District 2', 'District 3'])
      `)
    }

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        images TEXT[] DEFAULT '{}',
        mrp_price NUMERIC(10,2) NOT NULL,
        sell_price NUMERIC(10,2) NOT NULL,
        colors TEXT[] DEFAULT '{}',
        sizes TEXT[] DEFAULT '{}',
        features TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Create product_enquiries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_enquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        school_name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        mobile_no VARCHAR(20) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        enquiry_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Create product_dispatches table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_dispatches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        school_name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        mobile_no VARCHAR(20) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_description TEXT DEFAULT '',
        quantity INTEGER NOT NULL,
        size VARCHAR(50) DEFAULT '',
        product_as VARCHAR(50) DEFAULT 'Gift',
        dispatch_date DATE NOT NULL DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'Payment Pending',
        price NUMERIC(10,2) DEFAULT 0,
        tax_percent NUMERIC(5,2) DEFAULT 0,
        total_amount NUMERIC(10,2) DEFAULT 0,
        courier_name VARCHAR(255) DEFAULT '',
        courier_id VARCHAR(255) DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Add columns dynamically if table already existed
    await pool.query(`ALTER TABLE product_dispatches ADD COLUMN IF NOT EXISTS product_description TEXT DEFAULT ''`)
    await pool.query(`ALTER TABLE product_dispatches ADD COLUMN IF NOT EXISTS size VARCHAR(50) DEFAULT ''`)
    await pool.query(`ALTER TABLE product_dispatches ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0`)
    await pool.query(`ALTER TABLE product_dispatches ADD COLUMN IF NOT EXISTS tax_percent NUMERIC(5,2) DEFAULT 0`)
    await pool.query(`ALTER TABLE product_dispatches ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) DEFAULT 0`)
    await pool.query(`ALTER TABLE product_dispatches ADD COLUMN IF NOT EXISTS product_as VARCHAR(50) DEFAULT 'Gift'`)
    await pool.query(`ALTER TABLE product_dispatches ADD COLUMN IF NOT EXISTS courier_name VARCHAR(255) DEFAULT ''`)
    await pool.query(`ALTER TABLE product_dispatches ADD COLUMN IF NOT EXISTS courier_id VARCHAR(255) DEFAULT ''`)

    // Seed products if empty
    const productCount = await pool.query("SELECT COUNT(*) FROM products")
    if (parseInt(productCount.rows[0].count) === 0) {
      // Create 6 seed products matching the product cards in Image 3
      for (let i = 1; i <= 6; i++) {
        await pool.query(`
          INSERT INTO products (name, description, images, mrp_price, sell_price, colors, sizes, features)
          VALUES (
            $1, 
            $2, 
            $3, 
            $4, 
            $5, 
            $6, 
            $7, 
            $8
          )
        `, [
          `Product Name ${i === 1 ? ': Lorem ipsum dolor sit amet' : ''}`,
          `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
          [
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80'
          ],
          2000.00,
          1000.00,
          ['Royal Brown', 'Light Grey', 'Blue', 'Dark Blue'],
          ['30', '32', '34', '36'],
          ['Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum', 'Lorem ipsum']
        ])
      }

      // Also insert a few generic products
      await pool.query(`
        INSERT INTO products (name, description, images, mrp_price, sell_price, colors, sizes, features)
        VALUES 
        ('xyz product', 'A high quality tablet for smart class learning.', ARRAY['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'], 1500.00, 999.00, ARRAY['Black', 'White'], ARRAY['Standard'], ARRAY['WiFi', 'Interactive Screen', '10 hr Battery'])
      `)
    }

    // Seed product enquiries if empty
    const enquiryCount = await pool.query("SELECT COUNT(*) FROM product_enquiries")
    if (parseInt(enquiryCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO product_enquiries (school_name, address, name, mobile_no, product_name, quantity, enquiry_date)
        VALUES 
        ('abcdschool', 'Device 1', 'Alok Kumar', '9999999999', 'xyz product', 32, '2026-09-14'),
        ('abcdschool', 'Device 2', 'Shubham Pandey', '9999999999', 'xyz product', 25, '2025-10-14'),
        ('abcdschool', 'Device 3', 'Akriti Tiwari', '9999999999', 'xyz product', 50, '2025-10-01')
      `)
    }

    // Seed product dispatches if empty
    const dispatchCount = await pool.query("SELECT COUNT(*) FROM product_dispatches")
    if (parseInt(dispatchCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO product_dispatches (school_name, address, name, mobile_no, product_name, quantity, dispatch_date, status)
        VALUES 
        ('abcdschool', 'Device 1', 'Alok Kumar', '9999999999', 'xyz product', 32, '2028-09-14', 'Payment Pending'),
        ('abcdschool', 'Device 2', 'Shubham Pandey', '9999999999', 'xyz product', 25, '2025-10-14', 'Order Generated'),
        ('abcdschool', 'Device 3', 'Akriti Tiwari', '9999999999', 'xyz product', 50, '2025-10-01', 'Working'),
        ('abcdschool', 'Device 3', 'Akriti Tiwari', '9999999999', 'xyz product', 50, '2025-10-01', 'Order Dispatched')
      `)
    }

    // Create sms_orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sms_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        school_name VARCHAR(255) NOT NULL,
        mobile_no VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        sms_quantity INTEGER NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'New Order',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Create sms_templates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sms_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_name VARCHAR(255) NOT NULL,
        message_content TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed sms_orders if empty
    const smsOrderCount = await pool.query("SELECT COUNT(*) FROM sms_orders")
    if (parseInt(smsOrderCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO sms_orders (school_name, mobile_no, email, sms_quantity, amount, status)
        VALUES 
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'New Order'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 1000, 3400.00, 'New Order'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'New Order'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'Active'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 1000, 3400.00, 'Active'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'Active'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'Under Verification'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 1000, 3400.00, 'Under Verification'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'Under Verification'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'Inactive'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 1000, 3400.00, 'Inactive'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'Inactive')
      `)
    }

    // Seed sms_templates if empty
    const smsTemplateCount = await pool.query("SELECT COUNT(*) FROM sms_templates")
    if (parseInt(smsTemplateCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO sms_templates (template_name, message_content, status)
        VALUES 
        ('Admission Open Notification', 'Dear Parent, Admissions are now open for the session 2026-27. Please visit the school office or apply online.', 'Approved'),
        ('Monthly Attendance Alert', 'Dear Parent, your child was absent today without prior notice. Please contact class teacher.', 'Approved'),
        ('Exam Schedule Announcement', 'Dear Parents, the date sheet for upcoming half-yearly exams has been uploaded to the school portal.', 'Pending')
      `)
    }

    // Create sms_template_requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sms_template_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        assigned_to VARCHAR(100) DEFAULT '',
        school_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255) NOT NULL,
        mobile_no VARCHAR(20) NOT NULL,
        email_id VARCHAR(255) NOT NULL,
        remarks TEXT DEFAULT '',
        state VARCHAR(255) DEFAULT '',
        district VARCHAR(255) DEFAULT '',
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Create sms_template_request_history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sms_template_request_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id UUID REFERENCES sms_template_requests(id) ON DELETE CASCADE,
        communication_option VARCHAR(50) DEFAULT 'Call',
        call_duration VARCHAR(100) DEFAULT '',
        remarks TEXT DEFAULT '',
        follow_up_date DATE,
        status VARCHAR(50) DEFAULT '',
        lead_source VARCHAR(100) DEFAULT 'Offline Meeting',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed requests if empty
    const reqCount = await pool.query("SELECT COUNT(*) FROM sms_template_requests")
    if (parseInt(reqCount.rows[0].count) === 0) {
      const res1 = await pool.query(`
        INSERT INTO sms_template_requests (assigned_to, school_name, contact_person, mobile_no, email_id, remarks, state, district, status)
        VALUES ('Riya', 'abcdschool', 'Ashok', '9999999999', 'abcd@gmail.com', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Uttar Pradesh', 'Lucknow', 'Pending')
        RETURNING id
      `)
      await pool.query(`
        INSERT INTO sms_template_request_history (request_id, communication_option, remarks, status, lead_source, created_at, updated_at)
        VALUES ($1, 'Call', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Pending', 'Offline Meeting', '2025-09-15 11:00:00+05:30', '2025-09-15 11:00:00+05:30')
      `, [res1.rows[0].id])

      const res2 = await pool.query(`
        INSERT INTO sms_template_requests (assigned_to, school_name, contact_person, mobile_no, email_id, remarks, state, district, status)
        VALUES ('Riya', 'abcdschool', 'Rajesh', '9999999999', 'abcd@gmail.com', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Uttar Pradesh', 'Noida', 'Created')
        RETURNING id
      `)
      await pool.query(`
        INSERT INTO sms_template_request_history (request_id, communication_option, remarks, status, lead_source, created_at, updated_at)
        VALUES ($1, 'Message', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Created', 'Offline Meeting', '2025-09-15 11:00:00+05:30', '2025-09-15 11:00:00+05:30')
      `, [res2.rows[0].id])

      const res3 = await pool.query(`
        INSERT INTO sms_template_requests (assigned_to, school_name, contact_person, mobile_no, email_id, remarks, state, district, status)
        VALUES ('Riya', 'abcdschool', 'Shubham', '9999999999', 'abcd@gmail.com', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Madhya Pradesh', 'Bhopal', 'Active')
        RETURNING id
      `)
      await pool.query(`
        INSERT INTO sms_template_request_history (request_id, communication_option, remarks, status, lead_source, created_at, updated_at)
        VALUES ($1, 'Call', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Active', 'Offline Meeting', '2025-09-15 11:00:00+05:30', '2025-09-15 11:00:00+05:30')
      `, [res3.rows[0].id])
    }    // Create device_brands table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_brands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `)

    // Create device_types table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `)

    // Create device_plans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        duration_type VARCHAR(50) DEFAULT 'Days',
        duration INTEGER NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        tax_percent NUMERIC(5,2) DEFAULT 18,
        total_amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        brand VARCHAR(255) DEFAULT 'Brand 1',
        device_type VARCHAR(255) DEFAULT 'GPS',
        device_name VARCHAR(255) DEFAULT 'Device 1',
        imei_no VARCHAR(100) DEFAULT '1234567890',
        description TEXT DEFAULT '',
        plan_description TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Create device_recharge_requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_recharge_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        school_name VARCHAR(255) NOT NULL,
        device_name VARCHAR(255) NOT NULL,
        imei_no VARCHAR(100) NOT NULL,
        device_type VARCHAR(100) NOT NULL,
        image_url TEXT DEFAULT '',
        plan_duration VARCHAR(100) DEFAULT '30 Days',
        amount NUMERIC(10,2) NOT NULL,
        payment_reference VARCHAR(255) DEFAULT '',
        brand VARCHAR(255) DEFAULT 'Brand 1',
        description TEXT DEFAULT 'Lorem Ipsum',
        sim_imei_no VARCHAR(100) DEFAULT '1234567890',
        sim_no VARCHAR(50) DEFAULT '9999999999',
        tax_percent NUMERIC(5,2) DEFAULT 18,
        total_amount NUMERIC(10,2) NOT NULL,
        start_date DATE,
        end_date DATE,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    // Seed device_brands if empty
    const deviceBrandsCount = await pool.query("SELECT COUNT(*) FROM device_brands")
    if (parseInt(deviceBrandsCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO device_brands (name) VALUES ('Brand 1'), ('Brand 2'), ('Brand 3')
      `)
    }

    // Seed device_types if empty
    const deviceTypesCount = await pool.query("SELECT COUNT(*) FROM device_types")
    if (parseInt(deviceTypesCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO device_types (name) VALUES ('GPS'), ('Finger Print'), ('Attendance')
      `)
    }

    // Seed device_plans if empty
    const devicePlansCount = await pool.query("SELECT COUNT(*) FROM device_plans")
    if (parseInt(devicePlansCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO device_plans (name, duration_type, duration, amount, tax_percent, total_amount, status, brand, device_type, device_name, imei_no)
        VALUES 
        ('Plan 30 Days', 'Days', 30, 2000.00, 18, 2360.00, 'Active', 'Brand 1', 'GPS', 'Device 1', '1234567890'),
        ('Plan 90 Days', 'Days', 90, 3000.00, 18, 3540.00, 'Active', 'Brand 2', 'Finger Print', 'Device 2', '1234567890'),
        ('Plan 365 Days', 'Days', 365, 4000.00, 18, 4720.00, 'Active', 'Brand 3', 'Attendance', 'Device 3', '1234567890')
      `)
    }

    // Seed device_recharge_requests if empty
    const deviceRequestsCount = await pool.query("SELECT COUNT(*) FROM device_recharge_requests")
    if (parseInt(deviceRequestsCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO device_recharge_requests (school_name, device_name, imei_no, device_type, plan_duration, amount, brand, description, sim_imei_no, sim_no, tax_percent, total_amount, start_date, end_date, verified)
        VALUES 
        ('abcdschool', 'Device 1', '1234567890', 'GPS', '30 Days', 2000.00, 'Brand 1', 'Lorem Ipsum', '1234567890', '9999999999', 18, 2360.00, '2025-09-15', '2028-09-14', FALSE),
        ('abcdschool', 'Device 2', '1234567890', 'Finger Print', '90 Days', 3000.00, 'Brand 1', 'Lorem Ipsum', '1234567890', '9999999999', 18, 3540.00, '2025-09-15', '2025-10-14', FALSE),
        ('abcdschool', 'Device 3', '1234567890', 'Attendance', '365 Days', 4000.00, 'Brand 1', 'Lorem Ipsum', '1234567890', '9999999999', 18, 4720.00, '2025-09-15', '2025-10-01', TRUE)
      `)
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables created and seeded successfully.',
      credentials: {
        email: 'admin@academysetu.com',
        password: 'Admin@123',
      },
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

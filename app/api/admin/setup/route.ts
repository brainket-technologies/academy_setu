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
        phone VARCHAR(20),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

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

    // Check if admin already exists
    const existing = await pool.query(
      "SELECT id FROM admins WHERE email = 'admin@academysetu.com' LIMIT 1"
    )

    if (existing.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10)
      await pool.query(
        `INSERT INTO admins (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)`,
        ['Super Admin', 'admin@academysetu.com', hashedPassword, 'admin']
      )
    }

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

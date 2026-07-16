import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // 1. Drop existing tables
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
    `)

    // 2. Create Core Foundation Tables (WITH BACKWARD COMPATIBILITY FIELDS)
    await pool.query(`
      CREATE TABLE admins ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(50) NOT NULL DEFAULT 'admin', phone VARCHAR(20) DEFAULT '', avatar_url TEXT DEFAULT '', is_active BOOLEAN DEFAULT true, id_no VARCHAR(50) DEFAULT '', id_card_url TEXT DEFAULT '', joining_date DATE, permissions TEXT[] DEFAULT '{}', gender VARCHAR(50), address TEXT, state VARCHAR(100), district VARCHAR(100), pincode VARCHAR(20), aadhar_no VARCHAR(50), aadhar_card_url TEXT, signature_url TEXT, login_time_type VARCHAR(50) DEFAULT 'Always', login_time VARCHAR(50), logout_time VARCHAR(50), login_expire_date DATE, device_permission_count INTEGER DEFAULT 1, last_login_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE segments ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL UNIQUE, services TEXT[] NOT NULL, description TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institutions ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL, code VARCHAR(100) UNIQUE, segment_id UUID REFERENCES segments(id) ON DELETE SET NULL, affiliated_to VARCHAR(255), affiliation_code VARCHAR(100), contact_person VARCHAR(255) NOT NULL, mobile_no VARCHAR(20), email_id VARCHAR(255), address TEXT, state VARCHAR(100) NOT NULL, district VARCHAR(100) NOT NULL, pincode VARCHAR(20), principal_name VARCHAR(255), principal_gender VARCHAR(50), principal_sign TEXT, principal_photo TEXT, director_name VARCHAR(255), director_gender VARCHAR(50), director_sign TEXT, director_photo TEXT, status VARCHAR(50) NOT NULL DEFAULT 'Active', assigned_to UUID REFERENCES admins(id) ON DELETE SET NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE applications ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), application_no VARCHAR(50) NOT NULL UNIQUE, institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, school_name VARCHAR(255), contact_person VARCHAR(255), status VARCHAR(50) NOT NULL DEFAULT 'Applied', enquiry_status VARCHAR(100), plan_id UUID, promo_code VARCHAR(255), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE plans ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), segment_id UUID REFERENCES segments(id) ON DELETE CASCADE, segment VARCHAR(255), applied_by TEXT NOT NULL, plan_for TEXT NOT NULL DEFAULT 'All User', plan_name TEXT NOT NULL, description TEXT, no_of_students INTEGER, students_fee_relaxation INTEGER, additional_charge_per_student NUMERIC(10,2), first_billing_duration INTEGER, renewal_billing_duration INTEGER, renewal_pre_bill_generate_days INTEGER, renewal_payment_relaxation NUMERIC(5,2), status TEXT DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE plan_billing_items ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE, billing_type TEXT NOT NULL CHECK (billing_type IN ('first', 'renewal')), serial_no INTEGER NOT NULL, item_description TEXT NOT NULL DEFAULT '', price NUMERIC(10,2) NOT NULL DEFAULT 0, tax_percentage NUMERIC(5,2) NOT NULL DEFAULT 0, tax_price NUMERIC(10,2) NOT NULL DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE promo_codes ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code VARCHAR(50) UNIQUE NOT NULL, description TEXT DEFAULT '', segment_id UUID REFERENCES segments(id) ON DELETE SET NULL, segment VARCHAR(255), applicable_by VARCHAR(255) DEFAULT '', applicable_one BOOLEAN DEFAULT false, discount_name VARCHAR(255) DEFAULT '', discount_type VARCHAR(10) NOT NULL DEFAULT 'Percentage' CHECK (discount_type IN ('Percentage', 'Fixed')), discount_value NUMERIC(10,2) NOT NULL DEFAULT 0, max_uses INTEGER NOT NULL DEFAULT 0, current_uses INTEGER NOT NULL DEFAULT 0, start_date DATE, has_expiry BOOLEAN DEFAULT false, expiry_date DATE, status TEXT DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE bills ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, plan_id UUID REFERENCES plans(id) ON DELETE SET NULL, school_name VARCHAR(255), plan_name VARCHAR(255), payment_mode VARCHAR(50) NOT NULL, payment_date DATE NOT NULL DEFAULT CURRENT_DATE, amount NUMERIC(10,2) NOT NULL DEFAULT 0, transaction_id VARCHAR(100), status VARCHAR(50) NOT NULL DEFAULT 'Paid', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE requests ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, plan_id UUID REFERENCES plans(id) ON DELETE SET NULL, school_name VARCHAR(255), plan_name VARCHAR(255), payment_mode VARCHAR(50) NOT NULL, transaction_id VARCHAR(100), amount NUMERIC(10,2) NOT NULL DEFAULT 0, transaction_amount NUMERIC(10,2) DEFAULT 0, status VARCHAR(50) NOT NULL DEFAULT 'Pending', screenshots JSONB NOT NULL DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE ticket_categories ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) UNIQUE NOT NULL, description TEXT DEFAULT '', parent_category VARCHAR(255) DEFAULT '', segment_id UUID REFERENCES segments(id) ON DELETE SET NULL, segment VARCHAR(255), low_timeline VARCHAR(255) DEFAULT '', medium_timeline VARCHAR(255) DEFAULT '', high_timeline VARCHAR(255) DEFAULT '', is_deleted BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE tickets ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ticket_no VARCHAR(50) UNIQUE NOT NULL, assigned_to_id UUID REFERENCES admins(id) ON DELETE SET NULL, assigned_to VARCHAR(255), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, school_name VARCHAR(255), category_id UUID REFERENCES ticket_categories(id) ON DELETE SET NULL, ticket_category VARCHAR(255), segment VARCHAR(255), sub_category VARCHAR(255) DEFAULT '', priority VARCHAR(50) DEFAULT 'Low', complainer_name VARCHAR(255) DEFAULT '', complainer_mobile VARCHAR(50) DEFAULT '', description TEXT DEFAULT '', image_attachment VARCHAR(255) DEFAULT '', status VARCHAR(50) NOT NULL DEFAULT 'Pending', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE lead_statuses ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100) UNIQUE NOT NULL, text_color VARCHAR(50) DEFAULT '', bg_color VARCHAR(50) DEFAULT '', show_on_bdm BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE leads ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lead_source VARCHAR(150) NOT NULL, mobile_no VARCHAR(50) NOT NULL, email_id VARCHAR(150) DEFAULT '', contact_person VARCHAR(255) DEFAULT '', institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL, institution_name VARCHAR(255) NOT NULL, state VARCHAR(100) DEFAULT '', district VARCHAR(100) DEFAULT '', no_of_students INTEGER DEFAULT 0, status_id UUID REFERENCES lead_statuses(id) ON DELETE SET NULL, assigned_to_id UUID REFERENCES admins(id) ON DELETE SET NULL, assigned_to VARCHAR(255), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE lead_history ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lead_id UUID REFERENCES leads(id) ON DELETE CASCADE, communication_option VARCHAR(50) NOT NULL, call_duration VARCHAR(100) DEFAULT '', remarks TEXT DEFAULT '', follow_up_date DATE, status_id UUID REFERENCES lead_statuses(id) ON DELETE SET NULL, created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE distributors ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), dist_id VARCHAR(100) UNIQUE NOT NULL, joining_date DATE, name VARCHAR(255) NOT NULL, mobile_no VARCHAR(50) NOT NULL, email VARCHAR(255) DEFAULT '', gender VARCHAR(50) DEFAULT '', photo_url TEXT DEFAULT '', username VARCHAR(100) UNIQUE NOT NULL, password_hash VARCHAR(255) DEFAULT '', address TEXT DEFAULT '', state VARCHAR(100) DEFAULT '', district VARCHAR(100) DEFAULT '', pincode VARCHAR(20) DEFAULT '', aadhar_no VARCHAR(50) DEFAULT '', aadhar_url TEXT DEFAULT '', signature_url TEXT DEFAULT '', agreement_url TEXT DEFAULT '', commission_in VARCHAR(50) DEFAULT '', commission_value NUMERIC(10,2) DEFAULT 0, commission_type VARCHAR(50) DEFAULT '', assign_area TEXT DEFAULT '', account_holder_name VARCHAR(255) DEFAULT '', account_number VARCHAR(100) DEFAULT '', ifsc_code VARCHAR(50) DEFAULT '', bank_name VARCHAR(255) DEFAULT '', pan_no VARCHAR(20) DEFAULT '', upi_id VARCHAR(255) DEFAULT '', qr_code_url TEXT DEFAULT '', commission_total NUMERIC(10,2) DEFAULT 0, status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE distributor_payments ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE, amount NUMERIC(10,2) NOT NULL DEFAULT 0, payment_date DATE NOT NULL DEFAULT CURRENT_DATE, payment_mode VARCHAR(100) DEFAULT '', transaction_id VARCHAR(100) DEFAULT '', status VARCHAR(50) DEFAULT 'Paid', remarks TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE referrals ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), referral_by_admin UUID REFERENCES admins(id) ON DELETE CASCADE, referral_by_distributor UUID REFERENCES distributors(id) ON DELETE CASCADE, referral_to_institution UUID REFERENCES institutions(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, mobile_no VARCHAR(50) NOT NULL, status VARCHAR(50) DEFAULT 'Pending', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE income_categories ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL UNIQUE, description TEXT DEFAULT '', category_type VARCHAR(50) DEFAULT 'Income', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE income_parties ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL, mobile_no VARCHAR(50) DEFAULT '', email VARCHAR(255) DEFAULT '', party_category VARCHAR(50) DEFAULT 'Income', contact_person VARCHAR(255) DEFAULT '', amount NUMERIC(10,2) DEFAULT 0, gst_no VARCHAR(100) DEFAULT '', address TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE income_sessions ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100) NOT NULL UNIQUE, created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE income_records ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), trans_id VARCHAR(100) DEFAULT '', category_id UUID REFERENCES income_categories(id) ON DELETE SET NULL, income_category VARCHAR(255), amount NUMERIC(10,2) DEFAULT 0, payment_mode VARCHAR(100) DEFAULT '', received_date DATE NOT NULL DEFAULT CURRENT_DATE, party_id UUID REFERENCES income_parties(id) ON DELETE SET NULL, received_from VARCHAR(255), payment_account VARCHAR(100) DEFAULT '', reference_no VARCHAR(100) DEFAULT '', session_id UUID REFERENCES income_sessions(id) ON DELETE SET NULL, photo_url TEXT DEFAULT '', status VARCHAR(50) DEFAULT 'Paid', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE expense_records ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), trans_id VARCHAR(100) DEFAULT '', category_id UUID REFERENCES income_categories(id) ON DELETE SET NULL, amount NUMERIC(10,2) DEFAULT 0, payment_mode VARCHAR(100) DEFAULT '', expense_date DATE NOT NULL DEFAULT CURRENT_DATE, paid_by_id UUID REFERENCES admins(id) ON DELETE SET NULL, paid_by VARCHAR(255), paid_to_id UUID REFERENCES income_parties(id) ON DELETE SET NULL, paid_to VARCHAR(255), payment_account VARCHAR(100) DEFAULT '', received_by VARCHAR(255) DEFAULT '', approved_by_id UUID REFERENCES admins(id) ON DELETE SET NULL, approved_by VARCHAR(255), photo_url TEXT DEFAULT '', status VARCHAR(50) DEFAULT 'Paid', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE products ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL, description TEXT NOT NULL, images TEXT[] DEFAULT '{}', mrp_price NUMERIC(10,2) NOT NULL, sell_price NUMERIC(10,2) NOT NULL, colors TEXT[] DEFAULT '{}', sizes TEXT[] DEFAULT '{}', features TEXT[] DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE product_enquiries ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, school_name VARCHAR(255), product_id UUID REFERENCES products(id) ON DELETE CASCADE, product_name VARCHAR(255), quantity INTEGER NOT NULL, enquiry_date DATE NOT NULL DEFAULT CURRENT_DATE, name VARCHAR(255), mobile_no VARCHAR(50), address TEXT, created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE product_dispatches ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, school_name VARCHAR(255), product_id UUID REFERENCES products(id) ON DELETE CASCADE, product_name VARCHAR(255), quantity INTEGER NOT NULL, size VARCHAR(50) DEFAULT '', product_as VARCHAR(50) DEFAULT 'Gift', dispatch_date DATE NOT NULL DEFAULT CURRENT_DATE, status VARCHAR(50) DEFAULT 'Payment Pending', price NUMERIC(10,2) DEFAULT 0, tax_percent NUMERIC(5,2) DEFAULT 0, total_amount NUMERIC(10,2) DEFAULT 0, courier_name VARCHAR(255) DEFAULT '', courier_id VARCHAR(255) DEFAULT '', name VARCHAR(255), mobile_no VARCHAR(50), address TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE sms_orders ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, school_name VARCHAR(255), mobile_no VARCHAR(50), email VARCHAR(255), sms_quantity INTEGER NOT NULL, amount NUMERIC(10,2) NOT NULL, status VARCHAR(50) NOT NULL DEFAULT 'New Order', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE sms_templates ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), template_name VARCHAR(255) NOT NULL, message_content TEXT NOT NULL, status VARCHAR(50) NOT NULL DEFAULT 'Pending', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE sms_template_requests ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), assigned_to_id UUID REFERENCES admins(id) ON DELETE SET NULL, assigned_to VARCHAR(255), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, school_name VARCHAR(255), contact_person VARCHAR(255), mobile_no VARCHAR(50), remarks TEXT DEFAULT '', status VARCHAR(50) DEFAULT 'Pending', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE sms_template_request_history ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), request_id UUID REFERENCES sms_template_requests(id) ON DELETE CASCADE, communication_option VARCHAR(50) DEFAULT 'Call', call_duration VARCHAR(100) DEFAULT '', remarks TEXT DEFAULT '', follow_up_date DATE, status VARCHAR(50) DEFAULT '', lead_source VARCHAR(100) DEFAULT 'Offline Meeting', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE device_brands ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL UNIQUE );
      CREATE TABLE device_types ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL UNIQUE );
      CREATE TABLE device_plans ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL, duration_type VARCHAR(50) DEFAULT 'Days', duration INTEGER NOT NULL, amount NUMERIC(10,2) NOT NULL, tax_percent NUMERIC(5,2) DEFAULT 18, total_amount NUMERIC(10,2) NOT NULL, status VARCHAR(50) DEFAULT 'Active', brand_id UUID REFERENCES device_brands(id) ON DELETE SET NULL, type_id UUID REFERENCES device_types(id) ON DELETE SET NULL, device_name VARCHAR(255) DEFAULT 'Device 1', imei_no VARCHAR(100) DEFAULT '1234567890', description TEXT DEFAULT '', plan_description TEXT DEFAULT '', image_url TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE device_recharge_requests ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, school_name VARCHAR(255), device_plan_id UUID REFERENCES device_plans(id) ON DELETE SET NULL, device_name VARCHAR(255), device_type VARCHAR(100), image_url TEXT DEFAULT '', plan_duration VARCHAR(100) DEFAULT '30 Days', amount NUMERIC(10,2) NOT NULL, payment_reference VARCHAR(255) DEFAULT '', description TEXT DEFAULT 'Lorem Ipsum', sim_imei_no VARCHAR(100) DEFAULT '1234567890', sim_no VARCHAR(50) DEFAULT '9999999999', tax_percent NUMERIC(5,2) DEFAULT 18, total_amount NUMERIC(10,2) NOT NULL, start_date DATE, end_date DATE, verified BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE states_districts ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), state_name VARCHAR(255) UNIQUE NOT NULL, districts TEXT[] DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE queries ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL, mobile_no VARCHAR(50) NOT NULL, email VARCHAR(255) NOT NULL DEFAULT '', query_for VARCHAR(255) NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', response_message TEXT DEFAULT '', status VARCHAR(50) DEFAULT 'Pending', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE messages ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), sender_id UUID REFERENCES admins(id) ON DELETE CASCADE, receiver_id UUID REFERENCES admins(id) ON DELETE CASCADE, message TEXT NOT NULL DEFAULT '', is_read BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW() );
    `)

    // 3. SEEDING LOGIC
    const hashedPassword = await bcrypt.hash('Admin@123', 10)
    const userPassword = await bcrypt.hash('User@123', 10)

    // Admins (5)
    await pool.query(`INSERT INTO admins (name, email, password_hash, role, id_no, phone, is_active) VALUES 
      ('Super Admin', 'admin@academysetu.com', $1, 'Admin', 'AS001', '9999999999', true),
      ('Ashok', 'ashok@academysetu.com', $2, 'Admin', 'AS123', '9999999999', true),
      ('Rahul', 'rahul@academysetu.com', $2, 'Manager', 'AS123', '9999999999', false),
      ('Suraj', 'suraj@academysetu.com', $2, 'BDM', 'AS123', '9999999999', true),
      ('Riya', 'riya@academysetu.com', $2, 'Manager', 'AS123', '9999999999', true),
      ('Vikram', 'vikram@academysetu.com', $2, 'Support Team', 'AS123', '9999999999', true)`, [hashedPassword, userPassword])

    const adminIds = (await pool.query("SELECT id FROM admins")).rows.map(r => r.id)
    const superAdminId = adminIds[0]
    const ashokId = adminIds[1]
    const riyaId = adminIds[4]

    // Segments (5)
    await pool.query(`INSERT INTO segments (name, services, description) VALUES
      ('School', ARRAY['Student Service'], 'School segment'),
      ('Coaching', ARRAY['Teacher Service'], 'Coaching segment'),
      ('College', ARRAY['Employee Service'], 'College segment'),
      ('Teacher', ARRAY['Student Service'], 'Teacher tracking'),
      ('Institute', ARRAY['Student Service'], 'Institute segment')`)
    const segmentIds = (await pool.query("SELECT id FROM segments")).rows.map(r => r.id)

    // Institutions (5)
    await pool.query(`INSERT INTO institutions (name, code, segment_id, contact_person, mobile_no, state, district, status, assigned_to) VALUES
      ('Delhi Public School', 'AS2026123', $1, 'Rahul', '9999999991', 'Uttar Pradesh', 'Lucknow', 'Active', $6),
      ('St Xaviers College', 'AS2026124', $2, 'Shivam', '9999999992', 'Uttar Pradesh', 'Varanasi', 'Active', $6),
      ('Aakash Institute', 'AS2026125', $3, 'Rishi', '9999999993', 'Madhya Pradesh', 'Bhopal', 'Active', $6),
      ('KV School', 'AS2026126', $4, 'Amit', '9999999994', 'Delhi', 'New Delhi', 'Active', $6),
      ('MIT College', 'AS2026127', $5, 'Neha', '9999999995', 'Maharashtra', 'Pune', 'Active', $6)`,
      [...segmentIds, riyaId])
    const instIds = (await pool.query("SELECT id FROM institutions")).rows.map(r => r.id)

    // Applications (5)
    await pool.query(`INSERT INTO applications (application_no, institution_id, school_name, contact_person, status) VALUES
      ('APP-1001', $1, 'Delhi Public School', 'Rahul', 'Applied'), 
      ('APP-1002', $2, 'St Xaviers College', 'Shivam', 'Approved'), 
      ('APP-1003', $3, 'Aakash Institute', 'Rishi', 'Rejected'), 
      ('APP-1004', $4, 'KV School', 'Amit', 'Applied'), 
      ('APP-1005', $5, 'MIT College', 'Neha', 'Applied')`, instIds)

    // Plans (5)
    await pool.query(`INSERT INTO plans (segment_id, segment, applied_by, plan_for, plan_name, description, no_of_students) VALUES 
      ($1, 'School', 'Website', 'All User', 'Basic Plan', 'Basic', 100),
      ($2, 'Coaching', 'Admin', 'All User', 'Pro Plan', 'Pro', 500),
      ($3, 'College', 'BDM', 'All User', 'Enterprise Plan', 'Enterprise', 1000),
      ($4, 'Teacher', 'Website', 'All User', 'Starter Plan', 'Starter', 50),
      ($5, 'Institute', 'Admin', 'All User', 'Max Plan', 'Max', 2000)`, segmentIds)
    const planIds = (await pool.query("SELECT id FROM plans")).rows.map(r => r.id)

    // Plan Billing Items (5)
    await pool.query(`INSERT INTO plan_billing_items (plan_id, billing_type, serial_no, item_description, price) VALUES
      ($1, 'first', 1, 'Setup Fee', 500),
      ($2, 'first', 1, 'Pro Setup Fee', 1000),
      ($3, 'first', 1, 'Enterprise Setup Fee', 2000),
      ($4, 'first', 1, 'Starter Setup Fee', 200),
      ($5, 'first', 1, 'Max Setup Fee', 3000)`, planIds)

    // Promo Codes (5)
    await pool.query(`INSERT INTO promo_codes (code, segment_id, segment, discount_type, discount_value, status) VALUES
      ('WELCOME10', $1, 'School', 'Percentage', 10, 'Active'),
      ('FESTIVE20', $2, 'Coaching', 'Percentage', 20, 'Active'),
      ('FLAT500', $3, 'College', 'Fixed', 500, 'Active'),
      ('NEWYEAR', $4, 'Teacher', 'Percentage', 15, 'Active'),
      ('SPECIAL', $5, 'Institute', 'Fixed', 1000, 'Active')`, segmentIds)

    // Bills (5)
    await pool.query(`INSERT INTO bills (institution_id, plan_id, school_name, plan_name, payment_mode, amount, transaction_id, status) VALUES
      ($1, $6, 'Delhi Public School', 'Basic Plan', 'Bank Account', 1000.00, 'TXN10001', 'Paid'),
      ($2, $7, 'St Xaviers College', 'Pro Plan', 'UPI ID', 2000.00, 'TXN10002', 'Paid'),
      ($3, $8, 'Aakash Institute', 'Enterprise Plan', 'QR Mode', 3000.00, 'TXN10003', 'Pending'),
      ($4, $9, 'KV School', 'Starter Plan', 'Cash', 4000.00, 'TXN10004', 'Paid'),
      ($5, $10, 'MIT College', 'Max Plan', 'Bank Account', 5000.00, 'TXN10005', 'Failed')`, [...instIds, ...planIds])

    // Requests (5)
    await pool.query(`INSERT INTO requests (institution_id, plan_id, school_name, plan_name, payment_mode, transaction_id, amount, status) VALUES
      ($1, $6, 'Delhi Public School', 'Basic Plan', 'Bank Account', 'TXN.1235', 2000.00, 'Accept'),
      ($2, $7, 'St Xaviers College', 'Pro Plan', 'UPI', 'TXN.1236', 10000.00, 'Pending'),
      ($3, $8, 'Aakash Institute', 'Enterprise Plan', 'QR', 'TXN.1237', 20000.00, 'Accept'),
      ($4, $9, 'KV School', 'Starter Plan', 'Cash', 'TXN.1238', 5000.00, 'Reject'),
      ($5, $10, 'MIT College', 'Max Plan', 'UPI', 'TXN.1239', 8000.00, 'Pending')`, [...instIds, ...planIds])

    // Ticket Categories (5)
    await pool.query(`INSERT INTO ticket_categories (name, parent_category, segment_id, segment) VALUES
      ('Registration', 'Students', $1, 'School'), 
      ('Documents', 'Teacher', $2, 'Coaching'), 
      ('Billing', 'Finance', $3, 'College'), 
      ('Hardware', 'IT', $4, 'Teacher'), 
      ('Software', 'IT', $5, 'Institute')`, segmentIds)
    const catIds = (await pool.query("SELECT id FROM ticket_categories")).rows.map(r => r.id)

    // Tickets (5)
    await pool.query(`INSERT INTO tickets (ticket_no, assigned_to_id, assigned_to, institution_id, school_name, category_id, ticket_category, segment, status) VALUES
      ('Tick001', $1, 'Super Admin', $6, 'Delhi Public School', $11, 'Registration', 'School', 'Pending'), 
      ('Tick002', $2, 'Ashok', $7, 'St Xaviers College', $12, 'Documents', 'Coaching', 'Requested'), 
      ('Tick003', $3, 'Rahul', $8, 'Aakash Institute', $13, 'Billing', 'College', 'Completed'), 
      ('Tick004', $4, 'Suraj', $9, 'KV School', $14, 'Hardware', 'Teacher', 'Pending'), 
      ('Tick005', $5, 'Riya', $10, 'MIT College', $15, 'Software', 'Institute', 'Completed')`,
      [...adminIds.slice(0,5), ...instIds, ...catIds])

    // Lead Statuses (4)
    await pool.query(`INSERT INTO lead_statuses (name) VALUES ('Completed'), ('Pending'), ('Cancelled'), ('Created')`)
    const lsId = (await pool.query("SELECT id FROM lead_statuses LIMIT 1")).rows[0].id

    // Leads (5)
    await pool.query(`INSERT INTO leads (lead_source, mobile_no, institution_id, institution_name, status_id, assigned_to_id, assigned_to) VALUES 
      ('Offline', '9999911111', $3, 'Delhi Public School', $1, $2, 'Ashok'), 
      ('Web', '9999922222', $4, 'St Xaviers College', $1, $2, 'Ashok'), 
      ('Referral', '9999933333', $5, 'Aakash Institute', $1, $2, 'Ashok'), 
      ('Email', '9999944444', $6, 'KV School', $1, $2, 'Ashok'), 
      ('Call', '9999955555', $7, 'MIT College', $1, $2, 'Ashok')`, [lsId, riyaId, ...instIds])
    const leadIds = (await pool.query("SELECT id FROM leads")).rows.map(r => r.id)

    // Lead History (5)
    await pool.query(`INSERT INTO lead_history (lead_id, communication_option, remarks, status_id) VALUES
      ($1, 'Call', 'Interested', $6),
      ($2, 'Email', 'Waiting for reply', $6),
      ($3, 'Meeting', 'Positive response', $6),
      ($4, 'WhatsApp', 'Shared details', $6),
      ($5, 'Call', 'Not reachable', $6)`, [...leadIds, lsId])

    // Distributors (5)
    await pool.query(`INSERT INTO distributors (dist_id, name, mobile_no, username, status) VALUES
      ('D01', 'Distributor A', '1111111111', 'dist_a', 'Active'),
      ('D02', 'Distributor B', '2222222222', 'dist_b', 'Active'),
      ('D03', 'Distributor C', '3333333333', 'dist_c', 'Inactive'),
      ('D04', 'Distributor D', '4444444444', 'dist_d', 'Active'),
      ('D05', 'Distributor E', '5555555555', 'dist_e', 'Active')`)
    const distIds = (await pool.query("SELECT id FROM distributors")).rows.map(r => r.id)

    // Distributor Payments (5)
    await pool.query(`INSERT INTO distributor_payments (distributor_id, amount, payment_mode, status) VALUES
      ($1, 5000, 'UPI', 'Paid'),
      ($2, 3000, 'Bank Transfer', 'Paid'),
      ($3, 1000, 'Cash', 'Pending'),
      ($4, 4500, 'UPI', 'Paid'),
      ($5, 2000, 'Bank Transfer', 'Paid')`, distIds)

    // Referrals (5)
    await pool.query(`INSERT INTO referrals (referral_by_admin, referral_to_institution, name, address, mobile_no, status) VALUES
      ($1, $2, 'Referral 1', 'Delhi', '9000000001', 'Pending'),
      ($1, $3, 'Referral 2', 'Mumbai', '9000000002', 'Approved'),
      ($1, $4, 'Referral 3', 'Pune', '9000000003', 'Rejected'),
      ($1, $5, 'Referral 4', 'Bhopal', '9000000004', 'Pending'),
      ($1, $6, 'Referral 5', 'Lucknow', '9000000005', 'Pending')`, [ashokId, ...instIds])

    // Income Categories & Sessions & Parties
    await pool.query(`INSERT INTO income_categories (name, category_type) VALUES ('Fees', 'Income'), ('Donation', 'Income'), ('Sponsorship', 'Income'), ('Salary', 'Expense'), ('Maintenance', 'Expense')`)
    const catIncomeIds = (await pool.query("SELECT id FROM income_categories")).rows.map(r => r.id)
    await pool.query(`INSERT INTO income_sessions (name) VALUES ('2023-24'), ('2024-25'), ('2025-26')`)
    const sessIds = (await pool.query("SELECT id FROM income_sessions")).rows.map(r => r.id)
    await pool.query(`INSERT INTO income_parties (name, party_category) VALUES ('Party A', 'Income'), ('Party B', 'Income'), ('Vendor A', 'Expense'), ('Vendor B', 'Expense')`)
    const partyIds = (await pool.query("SELECT id FROM income_parties")).rows.map(r => r.id)

    // Income & Expense Records
    await pool.query(`INSERT INTO income_records (category_id, amount, session_id, party_id, status) VALUES
      ($1, 15000, $4, $7, 'Paid'),
      ($2, 25000, $5, $8, 'Paid'),
      ($3, 10000, $6, $7, 'Pending')`, [catIncomeIds[0], catIncomeIds[1], catIncomeIds[2], sessIds[0], sessIds[1], sessIds[2], partyIds[0], partyIds[1]])
    await pool.query(`INSERT INTO expense_records (category_id, amount, paid_by_id, paid_to_id, status) VALUES
      ($1, 5000, $3, $5, 'Paid'),
      ($2, 2000, $4, $6, 'Paid')`, [catIncomeIds[3], catIncomeIds[4], superAdminId, ashokId, partyIds[2], partyIds[3]])

    // Products & related
    await pool.query(`INSERT INTO products (name, description, mrp_price, sell_price) VALUES
      ('Laptop', 'Study Laptop', 50000, 45000),
      ('Tablet', 'Study Tablet', 20000, 18000),
      ('Uniform', 'School Uniform', 2000, 1500),
      ('Books', 'Textbooks set', 1500, 1200),
      ('Bag', 'School Bag', 1000, 800)`)
    const prodIds = (await pool.query("SELECT id FROM products")).rows.map(r => r.id)
    
    await pool.query(`INSERT INTO product_enquiries (institution_id, product_id, quantity, name, mobile_no) VALUES
      ($1, $3, 10, 'Rahul', '9000000001'),
      ($2, $4, 20, 'Shivam', '9000000002')`, [instIds[0], instIds[1], prodIds[0], prodIds[1]])
      
    await pool.query(`INSERT INTO product_dispatches (institution_id, product_id, quantity, status) VALUES
      ($1, $3, 5, 'Dispatched'),
      ($2, $4, 10, 'Delivered')`, [instIds[0], instIds[1], prodIds[0], prodIds[1]])

    // SMS related
    await pool.query(`INSERT INTO sms_orders (institution_id, sms_quantity, amount, status) VALUES
      ($1, 10000, 5000, 'Completed'),
      ($2, 5000, 2500, 'Pending')`, [instIds[0], instIds[1]])
    await pool.query(`INSERT INTO sms_templates (template_name, message_content, status) VALUES
      ('Welcome', 'Welcome to our school!', 'Approved'),
      ('Fee Reminder', 'Please pay your dues.', 'Approved')`)

    // Devices
    await pool.query(`INSERT INTO device_brands (name) VALUES ('Samsung'), ('Apple'), ('Lenovo'), ('Dell'), ('HP')`)
    const brandIds = (await pool.query("SELECT id FROM device_brands")).rows.map(r => r.id)
    await pool.query(`INSERT INTO device_types (name) VALUES ('Mobile'), ('Tablet'), ('Laptop'), ('Desktop'), ('Watch')`)
    const typeIds = (await pool.query("SELECT id FROM device_types")).rows.map(r => r.id)
    await pool.query(`INSERT INTO device_plans (name, duration, amount, total_amount, brand_id, type_id) VALUES
      ('Plan 1', 30, 500, 590, $1, $3),
      ('Plan 2', 90, 1400, 1652, $2, $4)`, [brandIds[0], brandIds[1], typeIds[0], typeIds[1]])
    const devPlanIds = (await pool.query("SELECT id FROM device_plans")).rows.map(r => r.id)
    await pool.query(`INSERT INTO device_recharge_requests (institution_id, device_plan_id, amount, total_amount) VALUES
      ($1, $3, 500, 590),
      ($2, $4, 1400, 1652)`, [instIds[0], instIds[1], devPlanIds[0], devPlanIds[1]])

    // Others
    await pool.query(`INSERT INTO states_districts (state_name, districts) VALUES ('Delhi', ARRAY['New Delhi', 'North Delhi']), ('Maharashtra', ARRAY['Mumbai', 'Pune'])`)
    await pool.query(`INSERT INTO queries (name, mobile_no, message) VALUES ('Test User', '9999999999', 'How to join?'), ('User 2', '8888888888', 'Pricing details?')`)
    await pool.query(`INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, 'Hello Ashok'), ($2, $1, 'Hi Super Admin')`, [superAdminId, ashokId])

    return NextResponse.json({ success: true, message: 'Seeded 5 rows across tables.' })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 200 })
  }
}

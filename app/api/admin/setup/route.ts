import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // 1. Drop existing tables
    await pool.query(`
      DROP TABLE IF EXISTS institute_lesson_plans CASCADE;
      DROP TABLE IF EXISTS institute_study_materials CASCADE;
      DROP TABLE IF EXISTS institute_online_quizzes CASCADE;
      DROP TABLE IF EXISTS institute_offline_tests CASCADE;
      DROP TABLE IF EXISTS institute_gallery CASCADE;
      DROP TABLE IF EXISTS institute_support_tickets CASCADE;
      DROP TABLE IF EXISTS institute_houses CASCADE;
      DROP TABLE IF EXISTS institute_tags CASCADE;
      DROP TABLE IF EXISTS institute_custom_forms CASCADE;
      DROP TABLE IF EXISTS institute_payment_settings CASCADE;
      DROP TABLE IF EXISTS institute_ledger CASCADE;
      DROP TABLE IF EXISTS institute_homework CASCADE;
      DROP TABLE IF EXISTS institute_timetable CASCADE;
      DROP TABLE IF EXISTS institute_app_users CASCADE;
      DROP TABLE IF EXISTS institute_notifications CASCADE;
      DROP TABLE IF EXISTS institute_notices CASCADE;
      DROP TABLE IF EXISTS institute_messages CASCADE;
      DROP TABLE IF EXISTS institute_academic_calendar CASCADE;
      DROP TABLE IF EXISTS institute_gate_passes CASCADE;
      DROP TABLE IF EXISTS institute_income CASCADE;
      DROP TABLE IF EXISTS institute_expenses CASCADE;
      DROP TABLE IF EXISTS institute_payroll CASCADE;
      DROP TABLE IF EXISTS institute_leave CASCADE;
      DROP TABLE IF EXISTS institute_attendance CASCADE;
      DROP TABLE IF EXISTS institute_transportation CASCADE;
      DROP TABLE IF EXISTS institute_transfer_certificates CASCADE;
      DROP TABLE IF EXISTS institute_admit_cards CASCADE;
      DROP TABLE IF EXISTS institute_marksheets CASCADE;
      DROP TABLE IF EXISTS institute_certificates CASCADE;
      DROP TABLE IF EXISTS institute_id_cards CASCADE;
      DROP TABLE IF EXISTS institute_fees_collection CASCADE;
      DROP TABLE IF EXISTS institute_fees_setup CASCADE;
      DROP TABLE IF EXISTS institute_parents CASCADE;
      DROP TABLE IF EXISTS institute_employees CASCADE;
      DROP TABLE IF EXISTS institute_teachers CASCADE;
      DROP TABLE IF EXISTS institute_students CASCADE;
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
      CREATE TABLE institute_students ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, admission_no VARCHAR(100) NOT NULL, roll_no VARCHAR(50) DEFAULT '', name VARCHAR(255) NOT NULL, fee NUMERIC(10,2) DEFAULT 0, remark TEXT DEFAULT '', status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_teachers ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, username VARCHAR(100) NOT NULL, name VARCHAR(255) NOT NULL, contact VARCHAR(50), email VARCHAR(255), assigned_classes TEXT[], status VARCHAR(50) DEFAULT 'Active', joining_date DATE, created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_employees ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, username VARCHAR(100) NOT NULL, name VARCHAR(255) NOT NULL, contact VARCHAR(50), role VARCHAR(100), status VARCHAR(50) DEFAULT 'Active', joining_date DATE, created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_parents ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, username VARCHAR(100) NOT NULL, name VARCHAR(255) NOT NULL, contact VARCHAR(50), student_count INTEGER DEFAULT 1, fees VARCHAR(100), status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_fees_setup ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, fee_head VARCHAR(255) NOT NULL, fee_class VARCHAR(100), amount NUMERIC(10,2) NOT NULL, frequency VARCHAR(100) DEFAULT 'Monthly', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_fees_collection ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, student_name VARCHAR(255) NOT NULL, fee_class VARCHAR(100), paid_amount NUMERIC(10,2) NOT NULL, due_amount NUMERIC(10,2) NOT NULL, payment_date DATE DEFAULT CURRENT_DATE, payment_mode VARCHAR(100), status VARCHAR(50) DEFAULT 'Paid', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_id_cards ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, template_name VARCHAR(255), name VARCHAR(255) NOT NULL, roll_no VARCHAR(100), card_class VARCHAR(100), status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_certificates ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, template_name VARCHAR(255), student_name VARCHAR(255) NOT NULL, issue_date DATE DEFAULT CURRENT_DATE, status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_marksheets ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, exam_name VARCHAR(255) NOT NULL, class_name VARCHAR(100), student_name VARCHAR(255) NOT NULL, total_marks VARCHAR(100), status VARCHAR(50) DEFAULT 'Declared', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_admit_cards ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, exam_name VARCHAR(255) NOT NULL, class_name VARCHAR(100), student_name VARCHAR(255) NOT NULL, roll_no VARCHAR(100), status VARCHAR(50) DEFAULT 'Generated', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_transfer_certificates ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, tc_no VARCHAR(100) UNIQUE NOT NULL, student_name VARCHAR(255) NOT NULL, issue_date DATE DEFAULT CURRENT_DATE, status VARCHAR(50) DEFAULT 'Issued', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_transportation ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, route_name VARCHAR(255) NOT NULL, vehicle_no VARCHAR(100) NOT NULL, driver_name VARCHAR(255), driver_mobile VARCHAR(50), rent NUMERIC(10,2) DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_attendance ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, student_name VARCHAR(255) NOT NULL, roll_no VARCHAR(100), attendance_date DATE DEFAULT CURRENT_DATE, status VARCHAR(50) DEFAULT 'Present', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_leave ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, role VARCHAR(100), leave_from DATE, leave_to DATE, reason TEXT, status VARCHAR(50) DEFAULT 'Approved', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_payroll ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, employee_name VARCHAR(255) NOT NULL, month_year VARCHAR(100) NOT NULL, net_salary NUMERIC(10,2) NOT NULL, status VARCHAR(50) DEFAULT 'Paid', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_expenses ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, category VARCHAR(255) NOT NULL, amount NUMERIC(10,2) NOT NULL, expense_date DATE DEFAULT CURRENT_DATE, status VARCHAR(50) DEFAULT 'Approved', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_income ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, category VARCHAR(255) NOT NULL, amount NUMERIC(10,2) NOT NULL, income_date DATE DEFAULT CURRENT_DATE, status VARCHAR(50) DEFAULT 'Received', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_payment_settings ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, gateway_name VARCHAR(100), api_key VARCHAR(255), api_secret VARCHAR(255), status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_ledger ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, date DATE DEFAULT CURRENT_DATE, description VARCHAR(255), debit NUMERIC(10,2) DEFAULT 0, credit NUMERIC(10,2) DEFAULT 0, balance NUMERIC(10,2) DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_homework ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, class_name VARCHAR(100), section VARCHAR(100), subject VARCHAR(100), assigned_date DATE, submission_date DATE, description TEXT, status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_timetable ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, class_name VARCHAR(100), section VARCHAR(100), day VARCHAR(50), subject VARCHAR(100), teacher_name VARCHAR(255), start_time VARCHAR(50), end_time VARCHAR(50), room_no VARCHAR(50), created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_app_users ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, user_type VARCHAR(100), name VARCHAR(255), contact VARCHAR(50), last_login TIMESTAMPTZ, status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_notifications ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, title VARCHAR(255), message TEXT, target_audience VARCHAR(100), sent_date TIMESTAMPTZ DEFAULT NOW(), status VARCHAR(50) DEFAULT 'Sent', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_notices ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, title VARCHAR(255), description TEXT, publish_date DATE, valid_until DATE, target_audience VARCHAR(100), status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_messages ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, sender VARCHAR(100), receiver VARCHAR(100), message TEXT, sent_at TIMESTAMPTZ DEFAULT NOW(), status VARCHAR(50) DEFAULT 'Sent', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_academic_calendar ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, event_title VARCHAR(255), start_date DATE, end_date DATE, event_type VARCHAR(100), description TEXT, created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_lesson_plans ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, class_name VARCHAR(100), subject VARCHAR(100), topic VARCHAR(255), date DATE, status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_study_materials ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, class_name VARCHAR(100), subject VARCHAR(100), title VARCHAR(255), file_url TEXT, status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_online_quizzes ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, title VARCHAR(255), class_name VARCHAR(100), subject VARCHAR(100), quiz_date DATE, duration VARCHAR(50), status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_offline_tests ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, title VARCHAR(255), class_name VARCHAR(100), subject VARCHAR(100), test_date DATE, marks VARCHAR(50), status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_gallery ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, event_name VARCHAR(255), event_date DATE, image_url TEXT, status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_support_tickets ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, ticket_no VARCHAR(100), subject VARCHAR(255), description TEXT, priority VARCHAR(50), status VARCHAR(50) DEFAULT 'Open', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_houses ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, name VARCHAR(100), color VARCHAR(50), description TEXT, status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_tags ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, name VARCHAR(100), color VARCHAR(50), status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_custom_forms ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, form_name VARCHAR(255), description TEXT, link TEXT, status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
      CREATE TABLE institute_gate_passes ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE, visitor_name VARCHAR(255), contact VARCHAR(50), purpose VARCHAR(255), to_meet VARCHAR(255), check_in TIMESTAMPTZ, check_out TIMESTAMPTZ, status VARCHAR(50) DEFAULT 'Active', created_at TIMESTAMPTZ DEFAULT NOW() );
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

    // Seeding new institute tables (with instIds[0] as target institution)
    await pool.query(`INSERT INTO institute_students (institution_id, admission_no, roll_no, name, fee, remark, status) VALUES
      ($1, '0423', '21', 'Sohan Singh', 7500, 'Misconduct', 'Suspended'),
      ($1, '0424', '10', 'Rohit Sharma', 7500, 'Attendance Issue', 'Suspended'),
      ($1, '0425', '8', 'Priya Patel', 7500, 'Fee Default', 'Suspended'),
      ($1, '0426', '12', 'Arjun Kumar', 7500, 'Regular student', 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_teachers (institution_id, username, name, contact, email, assigned_classes, status, joining_date) VALUES
      ($1, 'Teach123', 'Sudhir Rawat', '9990990099', 'sudhirawat123@gmail.com', ARRAY['1-A', '1-B', '2-B'], 'Active', '2026-01-01'),
      ($1, 'Teach124', 'Priya Sharma', '9990990088', 'priya.sharma@gmail.com', ARRAY['4-A', '4-B', '5-A'], 'Inactive', '2026-03-01'),
      ($1, 'Teach125', 'Amit Verma', '9990990077', 'amit.verma@gmail.com', ARRAY['6-A', '7-A', '7-B'], 'Active', '2026-03-15')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_employees (institution_id, username, name, contact, role, status, joining_date) VALUES
      ($1, 'Emp101', 'Ravi Shankar', '9991112223', 'Accountant', 'Active', '2025-05-10'),
      ($1, 'Emp102', 'Sunita Rao', '9992223334', 'Receptionist', 'Active', '2025-08-15'),
      ($1, 'Emp103', 'Madan Lal', '9993334445', 'Security Guard', 'Inactive', '2024-11-20')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_parents (institution_id, username, name, contact, student_count, fees, status) VALUES
      ($1, 'Par123', 'Sudhir Rawat', '9999999999', 1, '241000/-', 'Active'),
      ($1, 'Par124', 'Rajesh Gupta', '9999999998', 2, '180000/-', 'Inactive'),
      ($1, 'Par125', 'Mahesh Sen', '9999999997', 1, '120000/-', 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_fees_setup (institution_id, fee_head, fee_class, amount, frequency) VALUES
      ($1, 'Tuition Fee', 'Class 5', 5000, 'Monthly'),
      ($1, 'Admission Fee', 'Class 1', 15000, 'One-time'),
      ($1, 'Library Fee', 'Class 8', 1200, 'Annual')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_fees_collection (institution_id, student_name, fee_class, paid_amount, due_amount, payment_mode, status) VALUES
      ($1, 'Sohan Singh', 'Class 5', 5000, 0, 'UPI', 'Paid'),
      ($1, 'Rohit Sharma', 'Class 5', 4000, 1000, 'Cash', 'Partial'),
      ($1, 'Priya Patel', 'Class 8', 0, 1200, 'None', 'Unpaid')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_id_cards (institution_id, template_name, name, roll_no, card_class, status) VALUES
      ($1, 'Modern Theme', 'Arjun Kumar', '12', 'Class 5', 'Active'),
      ($1, 'Classic Theme', 'Sohan Singh', '21', 'Class 5', 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_certificates (institution_id, template_name, student_name, status) VALUES
      ($1, 'Transfer Certificate Template', 'Sohan Singh', 'Active'),
      ($1, 'Character Certificate Template', 'Rohit Sharma', 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_marksheets (institution_id, exam_name, class_name, student_name, total_marks, status) VALUES
      ($1, 'Final Exam 2025', 'Class 5', 'Arjun Kumar', '450/500', 'Declared'),
      ($1, 'Final Exam 2025', 'Class 5', 'Sohan Singh', '380/500', 'Declared')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_admit_cards (institution_id, exam_name, class_name, student_name, roll_no, status) VALUES
      ($1, 'Half Yearly Exam', 'Class 5', 'Arjun Kumar', '12', 'Generated'),
      ($1, 'Half Yearly Exam', 'Class 5', 'Sohan Singh', '21', 'Generated')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_transfer_certificates (institution_id, tc_no, student_name, status) VALUES
      ($1, 'TC-2026-001', 'Sohan Singh', 'Issued'),
      ($1, 'TC-2026-002', 'Rohit Sharma', 'Pending')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_transportation (institution_id, route_name, vehicle_no, driver_name, driver_mobile, rent) VALUES
      ($1, 'Route A (Noida)', 'UP-16-AT-9999', 'Ramesh Kumar', '9998887776', 2500),
      ($1, 'Route B (Greater Noida)', 'UP-16-BT-8888', 'Suresh Kumar', '9998887775', 3000)`, [instIds[0]])

    await pool.query(`INSERT INTO institute_attendance (institution_id, student_name, roll_no, status) VALUES
      ($1, 'Arjun Kumar', '12', 'Present'),
      ($1, 'Sohan Singh', '21', 'Absent'),
      ($1, 'Rohit Sharma', '10', 'Present')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_leave (institution_id, name, role, reason, status) VALUES
      ($1, 'Priya Sharma', 'Teacher', 'Medical Leave', 'Approved'),
      ($1, 'Ravi Shankar', 'Employee', 'Personal Work', 'Pending')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_payroll (institution_id, employee_name, month_year, net_salary, status) VALUES
      ($1, 'Ravi Shankar', 'January 2026', 25000, 'Paid'),
      ($1, 'Sunita Rao', 'January 2026', 18000, 'Paid')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_expenses (institution_id, category, amount, status) VALUES
      ($1, 'Stationery', 4500, 'Approved'),
      ($1, 'Electricity Bill', 12000, 'Approved')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_income (institution_id, category, amount, status) VALUES
      ($1, 'Admission Fee Collection', 75000, 'Received'),
      ($1, 'Donation Received', 150000, 'Received')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_payment_settings (institution_id, gateway_name, api_key, api_secret, status) VALUES
      ($1, 'Razorpay', 'rzp_test_123', 'secret_123', 'Active'),
      ($1, 'Paytm', 'paytm_test_456', 'secret_456', 'Inactive')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_ledger (institution_id, description, debit, credit, balance) VALUES
      ($1, 'Opening Balance', 0, 100000, 100000),
      ($1, 'Stationery Purchase', 5000, 0, 95000)`, [instIds[0]])

    await pool.query(`INSERT INTO institute_homework (institution_id, class_name, section, subject, assigned_date, submission_date, description, status) VALUES
      ($1, 'Class 5', 'A', 'Maths', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', 'Complete Chapter 4 Exercises', 'Active'),
      ($1, 'Class 5', 'B', 'Science', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', 'Draw Plant Cell', 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_timetable (institution_id, class_name, section, day, subject, teacher_name, start_time, end_time, room_no) VALUES
      ($1, 'Class 5', 'A', 'Monday', 'Maths', 'Sudhir Rawat', '09:00 AM', '09:45 AM', 'Room 101'),
      ($1, 'Class 5', 'A', 'Monday', 'Science', 'Amit Verma', '09:45 AM', '10:30 AM', 'Room 102')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_app_users (institution_id, user_type, name, contact, last_login, status) VALUES
      ($1, 'Student', 'Arjun Kumar', '9999999991', NOW(), 'Active'),
      ($1, 'Parent', 'Sudhir Rawat', '9999999999', NOW(), 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_notifications (institution_id, title, message, target_audience, status) VALUES
      ($1, 'Holiday Notice', 'School will remain closed tomorrow.', 'All', 'Sent'),
      ($1, 'Fee Reminder', 'Please pay the pending dues by 10th.', 'Parents', 'Sent')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_notices (institution_id, title, description, publish_date, valid_until, target_audience, status) VALUES
      ($1, 'Annual Sports Day', 'Sports day will be held on 15th.', CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', 'All', 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_messages (institution_id, sender, receiver, message, status) VALUES
      ($1, 'Admin', 'Sudhir Rawat', 'Please submit the syllabus plan.', 'Sent')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_academic_calendar (institution_id, event_title, start_date, end_date, event_type, description) VALUES
      ($1, 'Mid Term Exams', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '40 days', 'Examination', 'Half yearly exams for all classes')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_gate_passes (institution_id, visitor_name, contact, purpose, to_meet, check_in, status) VALUES
      ($1, 'Ramesh Gupta', '9876543210', 'Admissions', 'Principal', NOW(), 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_lesson_plans (institution_id, class_name, subject, topic, date, status) VALUES
      ($1, 'Class 5', 'Science', 'Plant Cells', CURRENT_DATE, 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_study_materials (institution_id, class_name, subject, title, file_url, status) VALUES
      ($1, 'Class 5', 'Science', 'Chapter 4 Notes', 'https://example.com/notes.pdf', 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_online_quizzes (institution_id, title, class_name, subject, quiz_date, duration, status) VALUES
      ($1, 'Science Mid Quiz', 'Class 5', 'Science', CURRENT_DATE + INTERVAL '5 days', '30 Mins', 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_offline_tests (institution_id, title, class_name, subject, test_date, marks, status) VALUES
      ($1, 'Maths Unit Test', 'Class 5', 'Maths', CURRENT_DATE + INTERVAL '10 days', '50', 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_gallery (institution_id, event_name, event_date, image_url, status) VALUES
      ($1, 'Annual Function 2025', CURRENT_DATE - INTERVAL '10 days', 'https://example.com/gallery1.jpg', 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_support_tickets (institution_id, ticket_no, subject, description, priority, status) VALUES
      ($1, 'TKT-2026-001', 'Smartboard not working', 'Room 101 smartboard is blank', 'High', 'Open')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_houses (institution_id, name, color, description, status) VALUES
      ($1, 'Red House', 'Red', 'Courage and Bravery', 'Active'),
      ($1, 'Blue House', 'Blue', 'Peace and Truth', 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_tags (institution_id, name, color, status) VALUES
      ($1, 'New Admission', 'Green', 'Active'),
      ($1, 'Defaulter', 'Red', 'Active')`, [instIds[0]])

    await pool.query(`INSERT INTO institute_custom_forms (institution_id, form_name, description, link, status) VALUES
      ($1, 'Transport Opt-In Form', 'For students applying for school transport', 'https://forms.example.com/123', 'Active')`, [instIds[0]])

    return NextResponse.json({ success: true, message: 'Seeded 5 rows across tables.' })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 200 })
  }
}

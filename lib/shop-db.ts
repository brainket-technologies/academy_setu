import pool from './db'

export async function ensureShopDb() {
  try {
    // 1. Create tables if they do not exist
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

    // 2. Seed products if empty
    const productCount = await pool.query("SELECT COUNT(*)::int FROM products")
    if (productCount.rows[0].count === 0) {
      // Seed products matching the grid cards from screenshot
      for (let i = 1; i <= 6; i++) {
        await pool.query(`
          INSERT INTO products (name, description, images, mrp_price, sell_price, colors, sizes, features)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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

      await pool.query(`
        INSERT INTO products (name, description, images, mrp_price, sell_price, colors, sizes, features)
        VALUES ('xyz product', 'A high quality tablet for smart class learning.', ARRAY['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'], 1500.00, 999.00, ARRAY['Black', 'White'], ARRAY['Standard'], ARRAY['WiFi', 'Interactive Screen', '10 hr Battery'])
      `)
    }

    // 3. Seed enquiries if empty
    const enquiryCount = await pool.query("SELECT COUNT(*)::int FROM product_enquiries")
    if (enquiryCount.rows[0].count === 0) {
      await pool.query(`
        INSERT INTO product_enquiries (school_name, address, name, mobile_no, product_name, quantity, enquiry_date)
        VALUES 
        ('abcdschool', 'Device 1', 'Alok Kumar', '9999999999', 'xyz product', 32, '2026-09-14'),
        ('abcdschool', 'Device 2', 'Shubham Pandey', '9999999999', 'xyz product', 25, '2025-10-14'),
        ('abcdschool', 'Device 3', 'Akriti Tiwari', '9999999999', 'xyz product', 50, '2025-10-01')
      `)
    }

    // 4. Seed dispatches if empty
    const dispatchCount = await pool.query("SELECT COUNT(*)::int FROM product_dispatches")
    if (dispatchCount.rows[0].count === 0) {
      await pool.query(`
        INSERT INTO product_dispatches (school_name, address, name, mobile_no, product_name, quantity, dispatch_date, status)
        VALUES 
        ('abcdschool', 'Device 1', 'Alok Kumar', '9999999999', 'xyz product', 32, '2028-09-14', 'Payment Pending'),
        ('abcdschool', 'Device 2', 'Shubham Pandey', '9999999999', 'xyz product', 25, '2025-10-14', 'Order Generated'),
        ('abcdschool', 'Device 3', 'Akriti Tiwari', '9999999999', 'xyz product', 50, '2025-10-01', 'Working'),
        ('abcdschool', 'Device 3', 'Akriti Tiwari', '9999999999', 'xyz product', 50, '2025-10-01', 'Order Dispatched')
      `)
    }

    // 5. Create sms_orders table
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

    // 6. Create sms_templates table
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
    const smsOrderCount = await pool.query("SELECT COUNT(*)::int FROM sms_orders")
    if (smsOrderCount.rows[0].count === 0) {
      // Seed New Orders
      await pool.query(`
        INSERT INTO sms_orders (school_name, mobile_no, email, sms_quantity, amount, status)
        VALUES 
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'New Order'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 1000, 3400.00, 'New Order'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'New Order')
      `)

      // Seed Active Orders
      await pool.query(`
        INSERT INTO sms_orders (school_name, mobile_no, email, sms_quantity, amount, status)
        VALUES 
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'Active'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 1000, 3400.00, 'Active'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'Active')
      `)

      // Seed Under Verification Orders
      await pool.query(`
        INSERT INTO sms_orders (school_name, mobile_no, email, sms_quantity, amount, status)
        VALUES 
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'Under Verification'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 1000, 3400.00, 'Under Verification'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'Under Verification')
      `)

      // Seed Inactive Orders
      await pool.query(`
        INSERT INTO sms_orders (school_name, mobile_no, email, sms_quantity, amount, status)
        VALUES 
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'Inactive'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 1000, 3400.00, 'Inactive'),
        ('abcdschool', '9999999999', 'abcd@gmail.com', 500, 1770.00, 'Inactive')
      `)
    }

    // Seed sms_templates if empty
    const smsTemplateCount = await pool.query("SELECT COUNT(*)::int FROM sms_templates")
    if (smsTemplateCount.rows[0].count === 0) {
      await pool.query(`
        INSERT INTO sms_templates (template_name, message_content, status)
        VALUES 
        ('Admission Open Notification', 'Dear Parent, Admissions are now open for the session 2026-27. Please visit the school office or apply online.', 'Approved'),
        ('Monthly Attendance Alert', 'Dear Parent, your child was absent today without prior notice. Please contact class teacher.', 'Approved'),
        ('Exam Schedule Announcement', 'Dear Parents, the date sheet for upcoming half-yearly exams has been uploaded to the school portal.', 'Pending')
      `)
    }

    // 7. Create sms_template_requests table
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

    // 8. Create sms_template_request_history table
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
    const reqCount = await pool.query("SELECT COUNT(*)::int FROM sms_template_requests")
    if (reqCount.rows[0].count === 0) {
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
    }

    // 9. Create device_brands table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_brands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `)

    // 10. Create device_types table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `)

    // 11. Create device_plans table
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

    // 10. Create device_recharge_requests table
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
    const deviceBrandsCount = await pool.query("SELECT COUNT(*)::int FROM device_brands")
    if (deviceBrandsCount.rows[0].count === 0) {
      await pool.query(`
        INSERT INTO device_brands (name) VALUES ('Brand 1'), ('Brand 2'), ('Brand 3')
      `)
    }

    // Seed device_types if empty
    const deviceTypesCount = await pool.query("SELECT COUNT(*)::int FROM device_types")
    if (deviceTypesCount.rows[0].count === 0) {
      await pool.query(`
        INSERT INTO device_types (name) VALUES ('GPS'), ('Finger Print'), ('Attendance')
      `)
    }

    // Seed device_plans if empty
    const devicePlansCount = await pool.query("SELECT COUNT(*)::int FROM device_plans")
    if (devicePlansCount.rows[0].count === 0) {
      await pool.query(`
        INSERT INTO device_plans (name, duration_type, duration, amount, tax_percent, total_amount, status, brand, device_type, device_name, imei_no)
        VALUES 
        ('Plan 30 Days', 'Days', 30, 2000.00, 18, 2360.00, 'Active', 'Brand 1', 'GPS', 'Device 1', '1234567890'),
        ('Plan 90 Days', 'Days', 90, 3000.00, 18, 3540.00, 'Active', 'Brand 2', 'Finger Print', 'Device 2', '1234567890'),
        ('Plan 365 Days', 'Days', 365, 4000.00, 18, 4720.00, 'Active', 'Brand 3', 'Attendance', 'Device 3', '1234567890')
      `)
    }

    // Seed device_recharge_requests if empty
    const deviceRequestsCount = await pool.query("SELECT COUNT(*)::int FROM device_recharge_requests")
    if (deviceRequestsCount.rows[0].count === 0) {
      await pool.query(`
        INSERT INTO device_recharge_requests (school_name, device_name, imei_no, device_type, plan_duration, amount, brand, description, sim_imei_no, sim_no, tax_percent, total_amount, start_date, end_date, verified)
        VALUES 
        ('abcdschool', 'Device 1', '1234567890', 'GPS', '30 Days', 2000.00, 'Brand 1', 'Lorem Ipsum', '1234567890', '9999999999', 18, 2360.00, '2025-09-15', '2028-09-14', FALSE),
        ('abcdschool', 'Device 2', '1234567890', 'Finger Print', '90 Days', 3000.00, 'Brand 1', 'Lorem Ipsum', '1234567890', '9999999999', 18, 3540.00, '2025-09-15', '2025-10-14', FALSE),
        ('abcdschool', 'Device 3', '1234567890', 'Attendance', '365 Days', 4000.00, 'Brand 1', 'Lorem Ipsum', '1234567890', '9999999999', 18, 4720.00, '2025-09-15', '2025-10-01', TRUE)
      `)
    }

  } catch (error) {
    console.error('Error ensuring Shop DB:', error)
  }
}

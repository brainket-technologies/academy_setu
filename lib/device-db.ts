import pool from './db'

declare global {
  var _deviceDbPromise: Promise<void> | undefined
}

export async function ensureDeviceDb(): Promise<void> {
  if (!globalThis._deviceDbPromise) {
    globalThis._deviceDbPromise = (async () => {
      try {
        // 1. Ensure device_types table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS device_types (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT DEFAULT '',
            status VARCHAR(50) DEFAULT 'Active',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `)

        // 2. Ensure device_setup table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS device_setup (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            device_type VARCHAR(255) DEFAULT '',
            name VARCHAR(255) NOT NULL,
            model VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `)

        // 3. Ensure device_plans table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS device_plans (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            duration_type VARCHAR(50) DEFAULT 'Days',
            duration INTEGER NOT NULL DEFAULT 30,
            amount NUMERIC(10,2) NOT NULL DEFAULT 0,
            tax_percent NUMERIC(5,2) DEFAULT 18,
            total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
            status VARCHAR(50) DEFAULT 'Active',
            device_type VARCHAR(255) DEFAULT 'GPS',
            device_name VARCHAR(255) DEFAULT '',
            device_model VARCHAR(255) DEFAULT '',
            imei_no VARCHAR(100) DEFAULT '',
            description TEXT DEFAULT '',
            plan_description TEXT DEFAULT '',
            image_url TEXT DEFAULT '',
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `)
        await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS device_type VARCHAR(255) DEFAULT 'GPS'`)
        await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS device_model VARCHAR(255) DEFAULT ''`)
        await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS brand VARCHAR(255) DEFAULT ''`)

        // 4. Ensure institute_devices table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS institute_devices (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            institute_id VARCHAR(255) DEFAULT '',
            institute_name VARCHAR(255) DEFAULT 'Cosmopolitan Inter',
            device_name VARCHAR(255) NOT NULL,
            device_type VARCHAR(255) NOT NULL,
            device_model VARCHAR(255) DEFAULT '',
            brand VARCHAR(255) DEFAULT '',
            sim_no VARCHAR(50) DEFAULT '',
            sim_imei VARCHAR(100) DEFAULT '',
            device_sr_no VARCHAR(100) DEFAULT '',
            plan_name VARCHAR(255) DEFAULT '',
            duration_days INTEGER DEFAULT 365,
            amount NUMERIC(10,2) DEFAULT 0,
            tax_percent NUMERIC(5,2) DEFAULT 18,
            total_amount NUMERIC(10,2) DEFAULT 0,
            payment_mode VARCHAR(50) DEFAULT 'Online / UPI',
            transaction_id VARCHAR(100) DEFAULT '',
            payment_status VARCHAR(50) DEFAULT 'Paid',
            status VARCHAR(50) DEFAULT 'Active',
            image_url TEXT DEFAULT '',
            valid_from DATE DEFAULT CURRENT_DATE,
            valid_to DATE DEFAULT (CURRENT_DATE + INTERVAL '365 days'),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `)

        // 5. Ensure device_recharge_requests table
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
            description TEXT DEFAULT '',
            sim_imei_no VARCHAR(100) DEFAULT '',
            sim_no VARCHAR(50) DEFAULT '',
            tax_percent NUMERIC(5,2) DEFAULT 18,
            total_amount NUMERIC(10,2) NOT NULL,
            start_date DATE,
            end_date DATE,
            verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `)

        // 6. Seed device_setup if empty
        const setupCount = await pool.query('SELECT COUNT(*)::int FROM device_setup')
        if (setupCount.rows[0].count === 0) {
          await pool.query(`
            INSERT INTO device_setup (device_type, name, model) VALUES
            ('GPS', 'VT05 Vehicle GPS Tracker', 'VT05-4G'),
            ('GPS', 'OBD-II Realtime Fleet Tracker', 'OBD-200X'),
            ('Finger Print Sensor', 'ZKTeco Optical Fingerprint Reader', 'BioPro-K40'),
            ('Biometric Attendance', 'AI Face Recognition & Temp Scanner', 'FacePass-V5'),
            ('RFID Card Reader', 'RFID Smart Gate Walkthrough Reader', 'UHF-Gate800')
          `)
        }

        // 7. Seed device_plans if empty
        const planCount = await pool.query('SELECT COUNT(*)::int FROM device_plans')
        if (planCount.rows[0].count === 0) {
          await pool.query(`
            INSERT INTO device_plans 
            (name, duration_type, duration, amount, tax_percent, total_amount, status, device_type, device_name, device_model, description, plan_description, image_url)
            VALUES
            (
              '1 Year GPS Tracking & IoT SIM', 'Days', 365, 2499.00, 18.00, 2948.82, 'Active',
              'GPS', 'VT05 Vehicle GPS Tracker', 'VT05-4G',
              'High-precision 4G GPS tracker for school buses and vans with live ignition, speed & geofencing.',
              'Includes 1-year unlimited data SIM card, access to live web tracking & mobile app, and replacement warranty.',
              'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80'
            ),
            (
              '6 Months Fleet Tracking Plan', 'Days', 180, 1799.00, 18.00, 2122.82, 'Active',
              'GPS', 'OBD-II Realtime Fleet Tracker', 'OBD-200X',
              'Plug-and-play GPS tracker connected directly to the vehicle OBD port. Zero wire cutting.',
              'Includes vehicle health diagnostics, fuel monitoring, 6-month tracking license, and SOS alerts.',
              'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80'
            ),
            (
              'Annual Biometric Attendance License', 'Days', 365, 3499.00, 18.00, 4128.82, 'Active',
              'Finger Print Sensor', 'ZKTeco Optical Fingerprint Reader', 'BioPro-K40',
              'Standalone biometric fingerprint terminal with 1,000 template capacity and battery backup.',
              'Includes cloud sync software, automated student SMS alerts upon check-in, and priority remote setup.',
              'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=600&auto=format&fit=crop&q=80'
            ),
            (
              'Annual Touchless Face Attendance Package', 'Days', 365, 4999.00, 18.00, 5898.82, 'Active',
              'Biometric Attendance', 'AI Face Recognition & Temp Scanner', 'FacePass-V5',
              'Dual-camera AI facial recognition terminal. Rapid 0.2s matching speed and anti-spoofing detection.',
              'Complete package with cloud dashboard, parent push notifications, and 24/7 dedicated support.',
              'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80'
            ),
            (
              '1 Year Smart Gate Pass Service', 'Days', 365, 2999.00, 18.00, 3538.82, 'Active',
              'RFID Card Reader', 'RFID Smart Gate Walkthrough Reader', 'UHF-Gate800',
              'High-frequency RFID reader for school gates. Detects student smart ID cards from up to 6 meters.',
              'Includes automatic gate attendance logging, web portal integration, and 100 free RFID cards.',
              'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80'
            )
          `)
        }

      } catch (error) {
        console.error('Error ensuring Device DB:', error)
        globalThis._deviceDbPromise = undefined
        throw error
      }
    })()
  }
  return globalThis._deviceDbPromise
}

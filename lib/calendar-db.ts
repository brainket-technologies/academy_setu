import pool from './db'

declare global {
  var _calendarDbPromise: Promise<void> | undefined
}

export async function ensureCalendarDb(): Promise<void> {
  if (!globalThis._calendarDbPromise) {
    globalThis._calendarDbPromise = (async () => {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS school_academic_calendar (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            institute_name VARCHAR(255) NOT NULL DEFAULT 'Cosmopolitan Inter',
            title VARCHAR(255) NOT NULL,
            event_type VARCHAR(100) NOT NULL DEFAULT 'Event',
            is_holiday BOOLEAN DEFAULT false,
            holiday_type VARCHAR(50) DEFAULT 'Full Day',
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            all_day BOOLEAN DEFAULT true,
            start_time VARCHAR(50) DEFAULT '',
            end_time VARCHAR(50) DEFAULT '',
            location VARCHAR(255) DEFAULT '',
            target_classes JSONB DEFAULT '["All Classes"]'::jsonb,
            color VARCHAR(50) DEFAULT '#0d9488',
            description TEXT DEFAULT '',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `)

        await pool.query(`ALTER TABLE school_academic_calendar ADD COLUMN IF NOT EXISTS is_holiday BOOLEAN DEFAULT false`)
        await pool.query(`ALTER TABLE school_academic_calendar ADD COLUMN IF NOT EXISTS holiday_type VARCHAR(50) DEFAULT 'Full Day'`)
        await pool.query(`ALTER TABLE school_academic_calendar ADD COLUMN IF NOT EXISTS all_day BOOLEAN DEFAULT true`)
        await pool.query(`ALTER TABLE school_academic_calendar ADD COLUMN IF NOT EXISTS start_time VARCHAR(50) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_academic_calendar ADD COLUMN IF NOT EXISTS end_time VARCHAR(50) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_academic_calendar ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_academic_calendar ADD COLUMN IF NOT EXISTS target_classes JSONB DEFAULT '["All Classes"]'::jsonb`)
        await pool.query(`ALTER TABLE school_academic_calendar ADD COLUMN IF NOT EXISTS color VARCHAR(50) DEFAULT '#0d9488'`)
        await pool.query(`ALTER TABLE school_academic_calendar ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''`)

        // Seed sample events if empty
        const countRes = await pool.query('SELECT COUNT(*)::int FROM school_academic_calendar')
        if (countRes.rows[0].count === 0) {
          await pool.query(`
            INSERT INTO school_academic_calendar (
              institute_name, title, event_type, is_holiday, holiday_type,
              start_date, end_date, all_day, start_time, end_time,
              location, target_classes, color, description
            ) VALUES
            -- November 2026 (Current Month)
            (
              'Cosmopolitan Inter', 'Term 2 Academic Session Commencement', 'Academic Event', false, 'Not Applicable',
              '2026-11-02', '2026-11-02', false, '08:30 AM', '10:00 AM',
              'Main Assembly Ground', '["All Classes"]'::jsonb, '#0d9488',
              'Welcome morning assembly for all classes and announcement of term schedule.'
            ),
            (
              'Cosmopolitan Inter', 'Inter-School Science & Robotics Fair', 'Academic Event', false, 'Not Applicable',
              '2026-11-05', '2026-11-05', false, '09:00 AM', '01:30 PM',
              'Science & Robotics Labs', '["All Classes"]'::jsonb, '#6366f1',
              'Annual science fair showcasing student robotics and experimental models.'
            ),
            (
              'Cosmopolitan Inter', 'Govardhan Puja Festival Holiday', 'Holiday', true, 'Full Day',
              '2026-11-10', '2026-11-10', true, '', '',
              'Campus Wide', '["All Classes"]'::jsonb, '#10b981',
              'School will remain completely closed on account of Govardhan Puja.'
            ),
            (
              'Cosmopolitan Inter', 'Childrens Day Celebration & Sports Carnival', 'Celebration / Assembly', false, 'Not Applicable',
              '2026-11-14', '2026-11-14', false, '08:00 AM', '01:00 PM',
              'School Playground', '["All Classes"]'::jsonb, '#f59e0b',
              'Grand celebration with fun games, sports carnival, and faculty performances.'
            ),
            (
              'Cosmopolitan Inter', 'Unit Assessment - Mathematics & Science', 'Examination', false, 'Not Applicable',
              '2026-11-18', '2026-11-18', false, '08:30 AM', '11:30 AM',
              'Examination Halls', '["Class 8", "Class 9", "Class 10"]'::jsonb, '#e11d48',
              'Monthly formative unit test assessment for grades 8 to 10.'
            ),
            (
              'Cosmopolitan Inter', 'Guru Nanak Jayanti', 'Holiday', true, 'Full Day',
              '2026-11-24', '2026-11-24', true, '', '',
              'Campus Wide', '["All Classes"]'::jsonb, '#10b981',
              'National holiday on the auspicious occasion of Guru Nanak Jayanti. School closed.'
            ),
            (
              'Cosmopolitan Inter', 'Monthly Parents Teachers Meeting (PTM)', 'Meeting / PTM', false, 'Not Applicable',
              '2026-11-28', '2026-11-28', false, '08:30 AM', '12:30 PM',
              'Classrooms', '["All Classes"]'::jsonb, '#dc2626',
              'Individual student academic reviews and fee settlement desk.'
            ),
            (
              'Cosmopolitan Inter', 'Faculty Monthly Review & Half Day', 'Holiday', true, 'Half Day',
              '2026-11-30', '2026-11-30', false, '08:00 AM', '12:00 PM',
              'School Campus', '["All Classes"]'::jsonb, '#64748b',
              'Classes close at 12:00 PM followed by faculty monthly review meeting.'
            ),
            -- April 2026
            (
              'Cosmopolitan Inter', 'Annual School Function 2026', 'Cultural Event', false, 'Not Applicable',
              '2026-04-01', '2026-04-01', false, '08:00 AM', '01:00 PM',
              'Main Auditorium', '["All Classes"]'::jsonb, '#0d9488',
              'Grand annual cultural program showcasing student performances, drama, music and awards ceremony.'
            ),
            (
              'Cosmopolitan Inter', 'Fee Day & Parents Teachers Meeting', 'Meeting / PTM', false, 'Not Applicable',
              '2026-04-03', '2026-04-03', false, '08:00 AM', '12:00 PM',
              'Respective Classrooms', '["All Classes"]'::jsonb, '#dc2626',
              'Quarterly PTM discussion with parents on student academic performance and fee desk clearance.'
            ),
            (
              'Cosmopolitan Inter', 'Extra Special Remedial Class', 'Academic Event', false, 'Not Applicable',
              '2026-04-09', '2026-04-09', false, '10:00 AM', '01:00 PM',
              'Science & Math Labs', '["Class 9", "Class 10"]'::jsonb, '#eab308',
              'Targeted board preparation and doubt-solving session for secondary students.'
            ),
            (
              'Cosmopolitan Inter', 'Dr. B.R. Ambedkar Jayanti', 'Holiday', true, 'Full Day',
              '2026-04-14', '2026-04-14', true, '', '',
              'Campus Wide', '["All Classes"]'::jsonb, '#10b981',
              'National holiday on account of Dr. B.R. Ambedkar Jayanti. School remains completely closed.'
            ),
            (
              'Cosmopolitan Inter', 'Festival Holiday (Eid-ul-Fitr)', 'Holiday', true, 'Full Day',
              '2026-04-23', '2026-04-23', true, '', '',
              'Campus Wide', '["All Classes"]'::jsonb, '#10b981',
              'School will remain closed for all students, teaching and administrative staff.'
            );
          `)
        }
      } catch (error) {
        console.error('Error ensuring academic calendar DB:', error)
        globalThis._calendarDbPromise = undefined
      }
    })()
  }

  await globalThis._calendarDbPromise
}


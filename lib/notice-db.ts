import pool from './db'

declare global {
  var _noticeDbPromise: Promise<void> | undefined
}

export async function ensureNoticeDb(): Promise<void> {
  if (!globalThis._noticeDbPromise) {
    globalThis._noticeDbPromise = (async () => {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS school_notices (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            institute_name VARCHAR(255) NOT NULL DEFAULT 'Cosmopolitan Inter',
            subject_title VARCHAR(255) NOT NULL,
            subject_category VARCHAR(100) DEFAULT 'General',
            message TEXT NOT NULL,
            priority VARCHAR(50) DEFAULT 'Normal',
            schedule_at VARCHAR(100) DEFAULT '',
            schedule_date DATE,
            schedule_time VARCHAR(50) DEFAULT '',
            is_scheduled BOOLEAN DEFAULT FALSE,
            sent_to_user INTEGER DEFAULT 0,
            recipients_type VARCHAR(100) DEFAULT 'Everyone',
            target_audience JSONB DEFAULT '{}'::jsonb,
            has_file BOOLEAN DEFAULT FALSE,
            file_name VARCHAR(255) DEFAULT '',
            file_url TEXT DEFAULT '',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `)

        await pool.query(`ALTER TABLE school_notices ADD COLUMN IF NOT EXISTS subject_category VARCHAR(100) DEFAULT 'General'`)
        await pool.query(`ALTER TABLE school_notices ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Normal'`)
        await pool.query(`ALTER TABLE school_notices ADD COLUMN IF NOT EXISTS schedule_at VARCHAR(100) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_notices ADD COLUMN IF NOT EXISTS schedule_date DATE`)
        await pool.query(`ALTER TABLE school_notices ADD COLUMN IF NOT EXISTS schedule_time VARCHAR(50) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_notices ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT FALSE`)
        await pool.query(`ALTER TABLE school_notices ADD COLUMN IF NOT EXISTS sent_to_user INTEGER DEFAULT 0`)
        await pool.query(`ALTER TABLE school_notices ADD COLUMN IF NOT EXISTS recipients_type VARCHAR(100) DEFAULT 'Everyone'`)
        await pool.query(`ALTER TABLE school_notices ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT '{}'::jsonb`)
        await pool.query(`ALTER TABLE school_notices ADD COLUMN IF NOT EXISTS has_file BOOLEAN DEFAULT FALSE`)
        await pool.query(`ALTER TABLE school_notices ADD COLUMN IF NOT EXISTS file_name VARCHAR(255) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_notices ADD COLUMN IF NOT EXISTS file_url TEXT DEFAULT ''`)

        // Seed sample notices if empty
        const countRes = await pool.query('SELECT COUNT(*)::int FROM school_notices')
        if (countRes.rows[0].count === 0) {
          await pool.query(`
            INSERT INTO school_notices (
              institute_name, subject_title, subject_category, message, priority,
              schedule_at, sent_to_user, recipients_type, has_file, file_name, created_at
            )
            VALUES 
            (
              'Cosmopolitan Inter',
              'Diwali Vacation & Academic Schedule Notice',
              'Holiday Announcement',
              'Dear Parents and Students, The school will observe Diwali vacations from November 10 to November 15, 2026. Regular classes will resume from November 16 as per normal winter timetable.',
              'Important',
              '10/11/2026 09:00 AM',
              248,
              'Everyone',
              false,
              '',
              NOW() - INTERVAL '1 day'
            ),
            (
              'Cosmopolitan Inter',
              'First Term Examination Date Sheet & Guidelines',
              'Exam Schedule',
              'The Date Sheet for First Term Examinations (Classes 8 to 12) has been published on the student mobile app. Please check the examination syllabus and ensure students carry their Admit Cards.',
              'Urgent',
              '05/11/2026 10:30 AM',
              184,
              'All Students',
              true,
              'Term_1_Datesheet_2026.pdf',
              NOW() - INTERVAL '3 days'
            ),
            (
              'Cosmopolitan Inter',
              'Parent-Teacher Meeting (PTM) for Classes 8-12',
              'PTM Meeting',
              'Notice is hereby given that the Parent-Teacher Meeting is scheduled for Saturday, 8th November 2026 between 8:30 AM to 12:30 PM. Parents are requested to attend to review academic progress.',
              'Normal',
              '08/11/2026 08:30 AM',
              204,
              'All Parents',
              false,
              '',
              NOW() - INTERVAL '5 days'
            )
          `)
        }
      } catch (error) {
        console.error('Error ensuring notice DB:', error)
        globalThis._noticeDbPromise = undefined
      }
    })()
  }
  return globalThis._noticeDbPromise
}


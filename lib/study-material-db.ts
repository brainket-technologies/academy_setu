import pool from './db'

declare global {
  var _studyMaterialDbPromise: Promise<void> | undefined
  var _lessonsDbPromise: Promise<void> | undefined
}

export async function ensureLessonsDb(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS school_study_material_lessons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        institute_name VARCHAR(255) NOT NULL DEFAULT 'Cosmopolitan Inter',
        class_name VARCHAR(100) NOT NULL,
        section VARCHAR(100) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        lesson_name VARCHAR(255) NOT NULL,
        lesson_number VARCHAR(50) DEFAULT '',
        description TEXT DEFAULT '',
        color VARCHAR(50) DEFAULT 'teal',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `)

    await pool.query(`ALTER TABLE school_study_materials ADD COLUMN IF NOT EXISTS lesson_folder VARCHAR(255) DEFAULT ''`)
  } catch (err) {
    console.error('ensureLessonsDb error:', err)
  }
}

export async function ensureStudyMaterialDb(): Promise<void> {
  if (!globalThis._studyMaterialDbPromise) {
    globalThis._studyMaterialDbPromise = (async () => {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS school_study_materials (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            institute_name VARCHAR(255) NOT NULL DEFAULT 'Cosmopolitan Inter',
            class_name VARCHAR(100) NOT NULL,
            section VARCHAR(100) NOT NULL,
            subject VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content_type VARCHAR(50) NOT NULL DEFAULT 'pdf',
            chapter_topic VARCHAR(255) DEFAULT '',
            url TEXT NOT NULL DEFAULT '',
            file_name VARCHAR(255) DEFAULT '',
            file_size VARCHAR(50) DEFAULT '',
            description TEXT DEFAULT '',
            allow_download BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `)

        await pool.query(`ALTER TABLE school_study_materials ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'pdf'`)
        await pool.query(`ALTER TABLE school_study_materials ADD COLUMN IF NOT EXISTS chapter_topic VARCHAR(255) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_study_materials ADD COLUMN IF NOT EXISTS lesson_folder VARCHAR(255) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_study_materials ADD COLUMN IF NOT EXISTS file_name VARCHAR(255) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_study_materials ADD COLUMN IF NOT EXISTS file_size VARCHAR(50) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_study_materials ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT true`)

        // Create Lessons / Chapter Folders Table
        await pool.query(`
          CREATE TABLE IF NOT EXISTS school_study_material_lessons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            institute_name VARCHAR(255) NOT NULL DEFAULT 'Cosmopolitan Inter',
            class_name VARCHAR(100) NOT NULL,
            section VARCHAR(100) NOT NULL,
            subject VARCHAR(100) NOT NULL,
            lesson_name VARCHAR(255) NOT NULL,
            lesson_number VARCHAR(50) DEFAULT '',
            description TEXT DEFAULT '',
            color VARCHAR(50) DEFAULT 'teal',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `)

      } catch (error) {
        console.error('Error ensuring study material DB:', error)
        globalThis._studyMaterialDbPromise = undefined
      }
    })()
  }

  await globalThis._studyMaterialDbPromise
}


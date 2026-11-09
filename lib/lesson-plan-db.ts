import pool from './db'

declare global {
  var _lessonPlanDbPromise: Promise<void> | undefined
}

export async function ensureLessonPlanDb(): Promise<void> {
  if (!globalThis._lessonPlanDbPromise) {
    globalThis._lessonPlanDbPromise = (async () => {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS school_lesson_plans (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            institute_name VARCHAR(255) NOT NULL DEFAULT 'Cosmopolitan Inter',
            class_name VARCHAR(100) NOT NULL,
            section VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            chapter_folder VARCHAR(255) DEFAULT '',
            subject VARCHAR(100) NOT NULL,
            methodology VARCHAR(255) NOT NULL,
            description TEXT DEFAULT '',
            date VARCHAR(50) DEFAULT '',
            total_milestones INTEGER DEFAULT 1,
            progress INTEGER DEFAULT 0,
            milestones JSONB DEFAULT '[]'::jsonb,
            attachment_name VARCHAR(255) DEFAULT '',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `)

        await pool.query(`ALTER TABLE school_lesson_plans ADD COLUMN IF NOT EXISTS chapter_folder VARCHAR(255) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_lesson_plans ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0`)
        await pool.query(`ALTER TABLE school_lesson_plans ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb`)
        await pool.query(`ALTER TABLE school_lesson_plans ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_lesson_plans ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''`)

        // Seed sample lesson plans if empty
        const countRes = await pool.query('SELECT COUNT(*)::int FROM school_lesson_plans')
        if (countRes.rows[0].count === 0) {
          const m1 = JSON.stringify([
            { id: 1, topic: 'Introduction to standard quadratic form ax² + bx + c = 0', startDate: '2026-10-15', endDate: '2026-10-18', completed: true },
            { id: 2, topic: 'Factorization & Splitting the middle term method', startDate: '2026-10-19', endDate: '2026-10-23', completed: true },
            { id: 3, topic: 'Quadratic formula derivation and discriminant tests', startDate: '2026-10-24', endDate: '2026-10-28', completed: true },
            { id: 4, topic: 'Word problems on speed, distance, and geometric areas', startDate: '2026-10-29', endDate: '2026-11-04', completed: false }
          ])

          const m2 = JSON.stringify([
            { id: 1, topic: 'Light Dependent Reactions and Chlorophyll absorption', startDate: '2026-10-20', endDate: '2026-10-24', completed: true },
            { id: 2, topic: 'Calvin Cycle and Carbon fixation pathway', startDate: '2026-10-25', endDate: '2026-10-29', completed: true },
            { id: 3, topic: 'Cellular respiration and ATP synthase mechanics', startDate: '2026-10-30', endDate: '2026-11-05', completed: false }
          ])

          const m3 = JSON.stringify([
            { id: 1, topic: 'Act III Scene 1: Caesar assassination speech and dialogue', startDate: '2026-10-22', endDate: '2026-10-26', completed: true },
            { id: 2, topic: 'Antony funeral oration rhetorical devices and irony', startDate: '2026-10-27', endDate: '2026-10-31', completed: true },
            { id: 3, topic: 'Character analysis: Brutus honor vs Antony rhetoric', startDate: '2026-11-01', endDate: '2026-11-06', completed: false },
            { id: 4, topic: 'Essay writing practice and thematic quotes recall', startDate: '2026-11-07', endDate: '2026-11-12', completed: false }
          ])

          const m4 = JSON.stringify([
            { id: 1, topic: 'Babur invasion and Battle of Panipat 1526', startDate: '2026-10-10', endDate: '2026-10-14', completed: true },
            { id: 2, topic: 'Akbar administrative Mansabdari and Sulh-i Kul policies', startDate: '2026-10-15', endDate: '2026-10-19', completed: true },
            { id: 3, topic: 'Mughal architectural monuments: Agra, Delhi and Lahore', startDate: '2026-10-20', endDate: '2026-10-24', completed: true },
            { id: 4, topic: 'End of term review test and map plotting exercise', startDate: '2026-10-25', endDate: '2026-10-28', completed: true }
          ])

          await pool.query(`
            INSERT INTO school_lesson_plans (
              institute_name, class_name, section, title, subject, methodology,
              description, date, total_milestones, progress, milestones, attachment_name, created_at
            )
            VALUES 
            (
              'Cosmopolitan Inter', 'Class 10', 'Section A', 'Quadratic Equations & Roots Analysis',
              'Mathematics', 'Interactive Problem Solving & Visual Graphing',
              'Comprehensive study of quadratic polynomial equations, graph representations, and real-life algebraic modeling.',
              '02/11/2026', 4, 75, $1::jsonb, 'Quadratic_Formula_Worksheet.pdf', NOW() - INTERVAL '2 days'
            ),
            (
              'Cosmopolitan Inter', 'Class 9', 'Section B', 'Photosynthesis & Cellular Bio-energetics',
              'Science', 'Lab Demonstration & Animated Slides',
              'Detailed analysis of chloroplast structures, light reactions, and comparative cellular respiration pathways.',
              '01/11/2026', 3, 67, $2::jsonb, 'Bio_Photosynthesis_LabGuide.pdf', NOW() - INTERVAL '4 days'
            ),
            (
              'Cosmopolitan Inter', 'Class 11 - Science', 'Section A', 'Shakespeare Julius Caesar - Act III Analysis',
              'English', 'Role Play, Group Discussions & Textual Criticism',
              'Rhetorical analysis of Mark Antony funeral speech, dramatic tension, and iambic pentameter rhythms.',
              '28/10/2026', 4, 50, $3::jsonb, 'Julius_Caesar_Study_Notes.pdf', NOW() - INTERVAL '6 days'
            ),
            (
              'Cosmopolitan Inter', 'Class 8', 'Section A', 'Mughal Empire & Administrative Reforms',
              'Social Studies', 'Timeline Mapping & Visual Artifacts',
              'In-depth study of Mughal governance, revenue administration, agrarian policies, and cultural synthesis.',
              '25/10/2026', 4, 100, $4::jsonb, '', NOW() - INTERVAL '10 days'
            )
          `, [m1, m2, m3, m4])
        }
      } catch (error) {
        console.error('Error ensuring lesson plan DB:', error)
        globalThis._lessonPlanDbPromise = undefined
      }
    })()
  }
  return globalThis._lessonPlanDbPromise
}


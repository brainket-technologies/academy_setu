import pool from './db'

declare global {
  var _studyMaterialDbPromise: Promise<void> | undefined
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
        await pool.query(`ALTER TABLE school_study_materials ADD COLUMN IF NOT EXISTS file_name VARCHAR(255) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_study_materials ADD COLUMN IF NOT EXISTS file_size VARCHAR(50) DEFAULT ''`)
        await pool.query(`ALTER TABLE school_study_materials ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT true`)

        // Check if sample data exists
        const countRes = await pool.query('SELECT COUNT(*)::int FROM school_study_materials')
        if (countRes.rows[0].count === 0) {
          await pool.query(`
            INSERT INTO school_study_materials (
              institute_name, class_name, section, subject, title,
              content_type, chapter_topic, url, file_name, file_size,
              description, allow_download
            ) VALUES
            -- Class 10 / Section A / Mathematics
            (
              'Cosmopolitan Inter', 'Class 10', 'Section A', 'Mathematics',
              'Quadratic Equations Complete Formulas & Revision Guide',
              'pdf', 'Chapter 4: Quadratic Equations',
              'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              'Quadratic_Formula_Guide.pdf', '2.4 MB',
              'Detailed formula breakdown, derivation of discriminant D = b^2 - 4ac, and 25 solved exam questions.',
              true
            ),
            (
              'Cosmopolitan Inter', 'Class 10', 'Section A', 'Mathematics',
              'Splitting Middle Term & Roots Derivation - Masterclass',
              'youtube', 'Chapter 4: Quadratic Equations',
              'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              'YouTube Video Lecture', '24 mins',
              'Step-by-step video lecture explaining algebraic factorization and graphical parabolic roots analysis.',
              false
            ),
            (
              'Cosmopolitan Inter', 'Class 10', 'Section A', 'Mathematics',
              'Quadratic Formula Practice Problems & Grade Calculator',
              'excel', 'Chapter 4: Quadratic Equations',
              'https://example.com/quad_problem_matrix.xlsx',
              'Quad_Problem_Matrix.xlsx', '1.1 MB',
              'Interactive spreadsheet with automated answer checker and 50 practice numerical equations.',
              true
            ),
            (
              'Cosmopolitan Inter', 'Class 10', 'Section A', 'Mathematics',
              'Visualizing Parabolic Curves and Polynomial Graphs',
              'ppt', 'Chapter 4: Quadratic Equations',
              'https://example.com/parabolas.pptx',
              'Parabolas_In_Real_Life.pptx', '4.8 MB',
              'High-definition presentation slides covering bridge arches, satellite dishes, and parabolic trajectories.',
              true
            ),
            (
              'Cosmopolitan Inter', 'Class 10', 'Section A', 'Mathematics',
              'Khan Academy Advanced Algebra Reference Hub',
              'url', 'General Reference',
              'https://www.khanacademy.org/math/algebra',
              'External Interactive Portal', 'Web Link',
              'Online interactive practice modules, quizzes and foundational revision for high school algebra.',
              false
            ),
            -- Class 10 / Section A / Science
            (
              'Cosmopolitan Inter', 'Class 10', 'Section A', 'Science',
              'Photosynthesis Light & Dark Reaction Summary Notes',
              'pdf', 'Chapter 6: Life Processes',
              'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              'Photosynthesis_Notes.pdf', '3.1 MB',
              'Comprehensive study guide on chloroplast anatomy, thylakoid reactions, and Calvin cycle pathways.',
              true
            ),
            (
              'Cosmopolitan Inter', 'Class 10', 'Section A', 'Science',
              'Cellular Bioenergetics Animation & ATP Synthesis',
              'youtube', 'Chapter 6: Life Processes',
              'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              'YouTube Lecture', '18 mins',
              '3D microscopic animation illustrating mitochondria proton gradients and ATP synthase mechanics.',
              false
            ),
            -- Class 1 / Section A / English
            (
              'Cosmopolitan Inter', 'Class 1', 'Section A', 'English',
              'Phonics & Alphabet Rhymes Visual Guide',
              'pdf', 'Unit 1: Alphabet & Phonics',
              'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              'Phonics_Alphabet_Guide.pdf', '1.5 MB',
              'Colorful illustrated phonics chart with vowel sounds, consonant blends, and animal illustrations.',
              true
            ),
            (
              'Cosmopolitan Inter', 'Class 1', 'Section A', 'English',
              'Interactive Phonics Songs & Storytime',
              'youtube', 'Unit 1: Alphabet & Phonics',
              'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              'YouTube Story Video', '12 mins',
              'Engaging musical video lesson introducing basic sentence structure and phoneme blending for grade 1.',
              false
            );
          `)
        }
      } catch (error) {
        console.error('Error ensuring study material DB:', error)
        globalThis._studyMaterialDbPromise = undefined
      }
    })()
  }

  await globalThis._studyMaterialDbPromise
}


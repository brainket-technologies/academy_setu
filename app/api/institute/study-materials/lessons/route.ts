import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureStudyMaterialDb, ensureLessonsDb } from '@/lib/study-material-db'
import { getSession } from '@/lib/session'
import { normalizeClassName, normalizeSectionName } from '@/lib/institute-classes'

export async function GET(request: NextRequest) {
  try {
    await ensureStudyMaterialDb()
    await ensureLessonsDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const { searchParams } = new URL(request.url)
    const className = searchParams.get('className') || ''
    const section = searchParams.get('section') || ''
    const subject = searchParams.get('subject') || ''
    const search = searchParams.get('search') || ''

    let query = `
      SELECT l.*,
        TO_CHAR(l.created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted,
        COUNT(m.id)::int as material_count,
        COUNT(CASE WHEN m.content_type = 'pdf' THEN 1 END)::int as pdf_count,
        COUNT(CASE WHEN m.content_type = 'youtube' THEN 1 END)::int as video_count,
        COUNT(CASE WHEN m.content_type = 'excel' THEN 1 END)::int as excel_count,
        COUNT(CASE WHEN m.content_type = 'ppt' THEN 1 END)::int as ppt_count,
        COUNT(CASE WHEN m.content_type = 'url' THEN 1 END)::int as url_count
      FROM school_study_material_lessons l
      LEFT JOIN school_study_materials m ON (
        TRIM(LOWER(COALESCE(NULLIF(m.lesson_folder, ''), m.chapter_topic, ''))) = TRIM(LOWER(l.lesson_name))
        AND TRIM(LOWER(m.class_name)) = TRIM(LOWER(l.class_name))
        AND TRIM(LOWER(m.section)) = TRIM(LOWER(l.section))
        AND TRIM(LOWER(m.subject)) = TRIM(LOWER(l.subject))
      )
      WHERE (l.institute_name ILIKE $1 OR l.institute_name = 'Cosmopolitan Inter')
    `
    const params: any[] = [`%${instituteName}%`]

    if (className && className !== 'All') {
      params.push(className)
      query += ` AND l.class_name = $${params.length}`
    }

    if (section && section !== 'All') {
      params.push(section)
      query += ` AND l.section = $${params.length}`
    }

    if (subject && subject !== 'All') {
      params.push(subject)
      query += ` AND l.subject = $${params.length}`
    }

    if (search.trim()) {
      params.push(`%${search.trim()}%`)
      query += ` AND (l.lesson_name ILIKE $${params.length} OR l.lesson_number ILIKE $${params.length} OR l.description ILIKE $${params.length})`
    }

    query += `
      GROUP BY l.id
      ORDER BY l.created_at ASC
    `

    const result = await pool.query(query, params)

    const mapped = result.rows.map(row => ({
      id: row.id,
      className: row.class_name,
      section: row.section,
      subject: row.subject,
      lessonName: row.lesson_name,
      lessonNumber: row.lesson_number || '',
      description: row.description || '',
      color: row.color || 'teal',
      materialCount: row.material_count || 0,
      pdfCount: row.pdf_count || 0,
      videoCount: row.video_count || 0,
      excelCount: row.excel_count || 0,
      pptCount: row.ppt_count || 0,
      urlCount: row.url_count || 0,
      createdAt: row.created_at_formatted
    }))

    return NextResponse.json({ success: true, data: mapped })
  } catch (error: any) {
    console.error('Study material lessons GET error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureStudyMaterialDb()
    await ensureLessonsDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const body = await request.json()
    const {
      className,
      section,
      subject,
      lessonName,
      lessonNumber = '',
      description = '',
      color = 'teal'
    } = body

    if (!className || !section || !subject || !lessonName || !lessonName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Class, Section, Subject, and Lesson Name are required' },
        { status: 400 }
      )
    }

    const canonicalClass = normalizeClassName(className)
    const canonicalSection = normalizeSectionName(section)
    const canonicalSubject = subject.trim()
    const canonicalName = lessonName.trim()

    // 1. Pre-check: Check if folder already exists in same class, section, subject
    const existingCheck = await pool.query(`
      SELECT *, TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
      FROM school_study_material_lessons
      WHERE (institute_name ILIKE $1 OR institute_name = 'Cosmopolitan Inter')
        AND LOWER(TRIM(class_name)) = LOWER(TRIM($2))
        AND LOWER(TRIM(REGEXP_REPLACE(section, '^Section\\s*', '', 'i'))) = LOWER(TRIM(REGEXP_REPLACE($3, '^Section\\s*', '', 'i')))
        AND LOWER(TRIM(subject)) = LOWER(TRIM($4))
        AND LOWER(TRIM(lesson_name)) = LOWER(TRIM($5))
      LIMIT 1
    `, [
      `%${instituteName}%`,
      canonicalClass,
      canonicalSection,
      canonicalSubject,
      canonicalName
    ])

    if (existingCheck.rows.length > 0) {
      const existing = existingCheck.rows[0]
      return NextResponse.json({
        success: true,
        message: `Folder "${existing.lesson_name}" already exists in ${canonicalClass} • ${canonicalSection} • ${canonicalSubject}.`,
        data: {
          id: existing.id,
          className: existing.class_name,
          section: existing.section,
          subject: existing.subject,
          lessonName: existing.lesson_name,
          lessonNumber: existing.lesson_number || '',
          description: existing.description || '',
          color: existing.color || 'teal',
          materialCount: 0,
          createdAt: existing.created_at_formatted
        },
        alreadyExisted: true
      })
    }

    const insertQuery = `
      INSERT INTO school_study_material_lessons (
        institute_name, class_name, section, subject,
        lesson_name, lesson_number, description, color
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (
        LOWER(TRIM(institute_name)),
        LOWER(TRIM(class_name)),
        LOWER(TRIM(REGEXP_REPLACE(section, '^Section\\s*', '', 'i'))),
        LOWER(TRIM(subject)),
        LOWER(TRIM(lesson_name))
      ) DO UPDATE SET updated_at = NOW()
      RETURNING *, TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
    `

    const result = await pool.query(insertQuery, [
      instituteName,
      canonicalClass,
      canonicalSection,
      canonicalSubject,
      canonicalName,
      lessonNumber ? lessonNumber.trim() : '',
      description ? description.trim() : '',
      color || 'teal'
    ])

    const row = result.rows[0]
    const created = {
      id: row.id,
      className: row.class_name,
      section: row.section,
      subject: row.subject,
      lessonName: row.lesson_name,
      lessonNumber: row.lesson_number || '',
      description: row.description || '',
      color: row.color || 'teal',
      materialCount: 0,
      createdAt: row.created_at_formatted
    }

    return NextResponse.json({ success: true, data: created })
  } catch (error: any) {
    console.error('Study material lessons POST error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

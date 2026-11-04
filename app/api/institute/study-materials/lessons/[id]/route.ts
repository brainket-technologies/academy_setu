import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureStudyMaterialDb } from '@/lib/study-material-db'
import { getSession } from '@/lib/session'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureStudyMaterialDb()
    const { id } = await params
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const body = await request.json()
    const { lessonName, lessonNumber = '', description = '', color = 'teal' } = body

    if (!lessonName || !lessonName.trim()) {
      return NextResponse.json({ success: false, error: 'Lesson Name is required' }, { status: 400 })
    }

    // Get old lesson name to update materials if renamed
    const oldRes = await pool.query('SELECT * FROM school_study_material_lessons WHERE id = $1', [id])
    if (oldRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Lesson folder not found' }, { status: 404 })
    }
    const oldLesson = oldRes.rows[0]

    const query = `
      UPDATE school_study_material_lessons
      SET lesson_name = $1, lesson_number = $2, description = $3, color = $4, updated_at = NOW()
      WHERE id = $5 AND (institute_name ILIKE $6 OR institute_name = 'Cosmopolitan Inter')
      RETURNING *, TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
    `

    const res = await pool.query(query, [
      lessonName.trim(),
      lessonNumber.trim(),
      description.trim(),
      color,
      id,
      `%${instituteName}%`
    ])

    // If lesson name changed, update associated materials
    if (oldLesson.lesson_name !== lessonName.trim()) {
      await pool.query(
        `UPDATE school_study_materials
         SET lesson_folder = $1, chapter_topic = $1
         WHERE (lesson_folder = $2 OR chapter_topic = $2)
           AND class_name = $3 AND section = $4 AND subject = $5`,
        [lessonName.trim(), oldLesson.lesson_name, oldLesson.class_name, oldLesson.section, oldLesson.subject]
      )
    }

    const row = res.rows[0]
    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        className: row.class_name,
        section: row.section,
        subject: row.subject,
        lessonName: row.lesson_name,
        lessonNumber: row.lesson_number || '',
        description: row.description || '',
        color: row.color || 'teal',
        createdAt: row.created_at_formatted
      }
    })
  } catch (error: any) {
    console.error('Study material lesson PUT error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureStudyMaterialDb()
    const { id } = await params
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const query = `
      DELETE FROM school_study_material_lessons
      WHERE id = $1 AND (institute_name ILIKE $2 OR institute_name = 'Cosmopolitan Inter')
      RETURNING id, lesson_name, class_name, section, subject
    `
    const res = await pool.query(query, [id, `%${instituteName}%`])

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Lesson folder not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Lesson folder deleted successfully' })
  } catch (error: any) {
    console.error('Study material lesson DELETE error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}


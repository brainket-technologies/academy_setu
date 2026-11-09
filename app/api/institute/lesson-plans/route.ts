import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureLessonPlanDb } from '@/lib/lesson-plan-db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    await ensureLessonPlanDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const className = searchParams.get('className') || ''
    const section = searchParams.get('section') || ''
    const subject = searchParams.get('subject') || ''
    const chapterFolder = searchParams.get('chapterFolder') || ''
    const progressStatus = searchParams.get('status') || ''

    let query = `
      SELECT *, 
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
      FROM school_lesson_plans
      WHERE (institute_name ILIKE $1 OR institute_name = 'Cosmopolitan Inter')
    `
    const params: any[] = [`%${instituteName}%`]

    if (search.trim()) {
      params.push(`%${search.trim()}%`)
      query += ` AND (title ILIKE $${params.length} OR subject ILIKE $${params.length} OR methodology ILIKE $${params.length} OR class_name ILIKE $${params.length} OR chapter_folder ILIKE $${params.length})`
    }

    if (className && className !== 'All' && className !== 'Select class') {
      params.push(className)
      query += ` AND class_name = $${params.length}`
    }

    if (section && section !== 'All' && section !== 'Select section') {
      params.push(section)
      query += ` AND section = $${params.length}`
    }

    if (subject && subject !== 'All' && subject !== 'Select subject') {
      params.push(subject)
      query += ` AND subject = $${params.length}`
    }

    if (chapterFolder && chapterFolder !== 'All') {
      params.push(chapterFolder)
      query += ` AND (chapter_folder = $${params.length} OR title = $${params.length})`
    }

    if (progressStatus === 'completed') {
      query += ` AND progress >= 100`
    } else if (progressStatus === 'in_progress') {
      query += ` AND progress > 0 AND progress < 100`
    } else if (progressStatus === 'not_started') {
      query += ` AND progress = 0`
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)

    const mapped = result.rows.map(row => ({
      id: row.id,
      className: row.class_name,
      section: row.section,
      title: row.title,
      chapterFolder: row.chapter_folder || row.title || 'General Chapter',
      subject: row.subject,
      methodology: row.methodology,
      description: row.description || '',
      date: row.date || new Date(row.created_at).toLocaleDateString('en-GB'),
      totalMilestones: row.total_milestones || 1,
      progress: parseInt(String(row.progress || 0)),
      milestones: Array.isArray(row.milestones) ? row.milestones : [],
      attachmentName: row.attachment_name || '',
      createdAt: row.created_at_formatted || new Date(row.created_at).toLocaleDateString('en-GB')
    }))

    return NextResponse.json({ success: true, data: mapped })
  } catch (error: any) {
    console.error('Fetch lesson plans error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureLessonPlanDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const body = await request.json()
    let {
      className,
      section,
      title,
      chapterFolder = '',
      subject,
      methodology,
      description = '',
      milestones = [],
      progress = 0,
      attachmentName = ''
    } = body

    const milestoneList = Array.isArray(milestones) ? milestones : []

    // Fallback if title/methodology not passed explicitly at plan level
    if (!title && milestoneList.length > 0) {
      title = milestoneList[0].lesson || milestoneList[0].topic || `${subject} Lesson Plan`
    }
    if (!methodology && milestoneList.length > 0) {
      methodology = milestoneList[0].methodology || 'Structured Teaching'
    }
    if (!description && milestoneList.length > 0) {
      description = milestoneList[0].description || ''
    }

    if (!className || !section || !title || !subject) {
      return NextResponse.json({
        success: false,
        error: 'Class, Section, Subject, and at least one Lesson are required.'
      }, { status: 400 })
    }
    const totalMilestones = milestoneList.filter((m: any) => m.topic && m.topic.trim()).length || Math.max(1, milestoneList.length)
    const validProgress = Math.min(100, Math.max(0, parseInt(String(progress || 0))))
    const resolvedFolder = (chapterFolder || title || 'General Chapter').trim()

    const insertRes = await pool.query(`
      INSERT INTO school_lesson_plans (
        institute_name, class_name, section, title, chapter_folder, subject, methodology,
        description, date, total_milestones, progress, milestones, attachment_name,
        created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, TO_CHAR(CURRENT_DATE, 'DD/MM/YYYY'), $9, $10, $11::jsonb, $12,
        NOW(), NOW()
      )
      RETURNING *,
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
    `, [
      instituteName,
      className.trim(),
      section.trim(),
      title.trim(),
      resolvedFolder,
      subject.trim(),
      methodology.trim(),
      description.trim(),
      totalMilestones,
      validProgress,
      JSON.stringify(milestoneList),
      attachmentName.trim()
    ])

    const row = insertRes.rows[0]

    return NextResponse.json({
      success: true,
      message: 'Lesson plan created successfully!',
      data: {
        id: row.id,
        className: row.class_name,
        section: row.section,
        title: row.title,
        chapterFolder: row.chapter_folder || resolvedFolder,
        subject: row.subject,
        methodology: row.methodology,
        description: row.description,
        date: row.date,
        totalMilestones: row.total_milestones,
        progress: row.progress,
        milestones: row.milestones,
        attachmentName: row.attachment_name,
        createdAt: row.created_at_formatted
      }
    })
  } catch (error: any) {
    console.error('Create lesson plan error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}


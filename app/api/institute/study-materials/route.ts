import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureStudyMaterialDb } from '@/lib/study-material-db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    await ensureStudyMaterialDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const { searchParams } = new URL(request.url)
    const className = searchParams.get('className') || ''
    const section = searchParams.get('section') || ''
    const subject = searchParams.get('subject') || ''
    const lessonFolder = searchParams.get('lessonFolder') || ''
    const contentType = searchParams.get('contentType') || ''
    const search = searchParams.get('search') || ''

    let query = `
      SELECT *, 
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
      FROM school_study_materials
      WHERE (institute_name ILIKE $1 OR institute_name = 'Cosmopolitan Inter')
    `
    const params: any[] = [`%${instituteName}%`]

    if (className && className !== 'All') {
      params.push(className)
      query += ` AND class_name = $${params.length}`
    }

    if (section && section !== 'All') {
      params.push(section)
      query += ` AND section = $${params.length}`
    }

    if (subject && subject !== 'All') {
      params.push(subject)
      query += ` AND subject = $${params.length}`
    }

    if (lessonFolder && lessonFolder !== 'All') {
      params.push(lessonFolder)
      query += ` AND (lesson_folder = $${params.length} OR chapter_topic = $${params.length})`
    }

    if (contentType && contentType !== 'all') {
      params.push(contentType.toLowerCase())
      query += ` AND LOWER(content_type) = $${params.length}`
    }

    if (search.trim()) {
      params.push(`%${search.trim()}%`)
      query += ` AND (title ILIKE $${params.length} OR chapter_topic ILIKE $${params.length} OR description ILIKE $${params.length} OR file_name ILIKE $${params.length})`
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)

    const mapped = result.rows.map(row => ({
      id: row.id,
      className: row.class_name,
      section: row.section,
      subject: row.subject,
      title: row.title,
      contentType: row.content_type,
      chapterTopic: row.chapter_topic || row.lesson_folder || '',
      lessonFolder: row.lesson_folder || row.chapter_topic || '',
      url: row.url || '',
      fileName: row.file_name || '',
      fileSize: row.file_size || '',
      description: row.description || '',
      allowDownload: !!row.allow_download,
      createdAt: row.created_at_formatted
    }))

    return NextResponse.json({ success: true, data: mapped })
  } catch (error: any) {
    console.error('Study materials GET error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureStudyMaterialDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const body = await request.json()
    const {
      className,
      section,
      subject,
      title,
      contentType = 'pdf',
      chapterTopic = '',
      lessonFolder = '',
      url = '',
      fileName = '',
      fileSize = '',
      description = '',
      allowDownload = true
    } = body

    if (!className || !section || !subject || !title || !title.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Class, Section, Subject, and Material Title are required.'
      }, { status: 400 })
    }

    if (!url || !url.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Please provide a valid file, YouTube video link, or URL resource.'
      }, { status: 400 })
    }

    const effectiveFolder = (lessonFolder || chapterTopic || '').trim()

    const insertRes = await pool.query(`
      INSERT INTO school_study_materials (
        institute_name, class_name, section, subject, title,
        content_type, chapter_topic, lesson_folder, url, file_name, file_size,
        description, allow_download, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, NOW(), NOW()
      )
      RETURNING *,
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
    `, [
      instituteName,
      className.trim(),
      section.trim(),
      subject.trim(),
      title.trim(),
      contentType.toLowerCase().trim(),
      effectiveFolder,
      effectiveFolder,
      url.trim(),
      fileName.trim(),
      fileSize.trim(),
      description.trim(),
      !!allowDownload
    ])

    const row = insertRes.rows[0]

    return NextResponse.json({
      success: true,
      message: 'Study material added successfully!',
      data: {
        id: row.id,
        className: row.class_name,
        section: row.section,
        subject: row.subject,
        title: row.title,
        contentType: row.content_type,
        chapterTopic: row.chapter_topic,
        url: row.url,
        fileName: row.file_name,
        fileSize: row.file_size,
        description: row.description,
        allowDownload: !!row.allow_download,
        createdAt: row.created_at_formatted
      }
    })
  } catch (error: any) {
    console.error('Study materials POST error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}


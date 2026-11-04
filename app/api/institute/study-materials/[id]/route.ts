import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureStudyMaterialDb } from '@/lib/study-material-db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureStudyMaterialDb()
    const { id } = await params

    const result = await pool.query(`
      SELECT *, 
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
      FROM school_study_materials
      WHERE id = $1
    `, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Study material not found' }, { status: 404 })
    }

    const row = result.rows[0]
    return NextResponse.json({
      success: true,
      data: {
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
      }
    })
  } catch (error: any) {
    console.error('Study material GET by ID error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureStudyMaterialDb()
    const { id } = await params
    const body = await request.json()

    const {
      title,
      contentType,
      chapterTopic,
      lessonFolder,
      url,
      fileName,
      fileSize,
      description,
      allowDownload
    } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }

    const effectiveFolder = lessonFolder !== undefined ? lessonFolder.trim() : (chapterTopic !== undefined ? chapterTopic.trim() : null)

    const updateRes = await pool.query(`
      UPDATE school_study_materials
      SET
        title = COALESCE($1, title),
        content_type = COALESCE($2, content_type),
        chapter_topic = COALESCE($3, chapter_topic),
        lesson_folder = COALESCE($4, lesson_folder),
        url = COALESCE($5, url),
        file_name = COALESCE($6, file_name),
        file_size = COALESCE($7, file_size),
        description = COALESCE($8, description),
        allow_download = COALESCE($9, allow_download),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *,
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
    `, [
      title ? title.trim() : null,
      contentType ? contentType.toLowerCase().trim() : null,
      effectiveFolder,
      effectiveFolder,
      url !== undefined ? url.trim() : null,
      fileName !== undefined ? fileName.trim() : null,
      fileSize !== undefined ? fileSize.trim() : null,
      description !== undefined ? description.trim() : null,
      allowDownload !== undefined ? !!allowDownload : null,
      id
    ])

    if (updateRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Study material not found' }, { status: 404 })
    }

    const row = updateRes.rows[0]
    return NextResponse.json({
      success: true,
      message: 'Study material updated successfully!',
      data: {
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
      }
    })
  } catch (error: any) {
    console.error('Study material PUT error:', error)
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

    const deleteRes = await pool.query(`
      DELETE FROM school_study_materials
      WHERE id = $1
      RETURNING id
    `, [id])

    if (deleteRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Study material not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Study material deleted successfully!'
    })
  } catch (error: any) {
    console.error('Study material DELETE error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}


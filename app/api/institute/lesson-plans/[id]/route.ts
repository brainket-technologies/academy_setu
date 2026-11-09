import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureLessonPlanDb } from '@/lib/lesson-plan-db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureLessonPlanDb()
    const { id } = await params
    const result = await pool.query(`
      SELECT *, 
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
      FROM school_lesson_plans
      WHERE id = $1
    `, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Lesson plan not found' }, { status: 404 })
    }

    const row = result.rows[0]
    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        className: row.class_name,
        section: row.section,
        title: row.title,
        chapterFolder: row.chapter_folder || row.title || 'General Chapter',
        subject: row.subject,
        methodology: row.methodology,
        description: row.description,
        date: row.date,
        totalMilestones: row.total_milestones,
        progress: parseInt(String(row.progress || 0)),
        milestones: Array.isArray(row.milestones) ? row.milestones : [],
        attachmentName: row.attachment_name,
        createdAt: row.created_at_formatted
      }
    })
  } catch (error: any) {
    console.error('Fetch lesson plan error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureLessonPlanDb()
    const { id } = await params
    const body = await request.json()

    // 1. Check existing record
    const existingRes = await pool.query('SELECT * FROM school_lesson_plans WHERE id = $1', [id])
    if (existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Lesson plan not found' }, { status: 404 })
    }
    const current = existingRes.rows[0]

    // Check if this is a quick progress update or full edit
    const {
      className = current.class_name,
      section = current.section,
      title = current.title,
      chapterFolder = current.chapter_folder || current.title,
      subject = current.subject,
      methodology = current.methodology,
      description = current.description,
      milestones,
      progress,
      attachmentName = current.attachment_name
    } = body

    const updatedMilestones = milestones !== undefined ? milestones : current.milestones
    const milestoneList = Array.isArray(updatedMilestones) ? updatedMilestones : []
    const totalMilestones = milestoneList.filter((m: any) => (m.topic || m.lesson) && (m.topic || m.lesson).trim()).length || Math.max(1, milestoneList.length)
    
    let validProgress = progress !== undefined ? parseInt(String(progress)) : parseInt(String(current.progress || 0))
    validProgress = Math.min(100, Math.max(0, isNaN(validProgress) ? 0 : validProgress))

    let finalTitle = title || current.title
    if (!finalTitle && milestoneList.length > 0) {
      finalTitle = milestoneList[0].lesson || milestoneList[0].topic || current.title
    }
    let finalMethodology = methodology || current.methodology
    if (!finalMethodology && milestoneList.length > 0) {
      finalMethodology = milestoneList[0].methodology || current.methodology
    }

    const updateRes = await pool.query(`
      UPDATE school_lesson_plans
      SET class_name = $1,
          section = $2,
          title = $3,
          chapter_folder = $4,
          subject = $5,
          methodology = $6,
          description = $7,
          milestones = $8::jsonb,
          total_milestones = $9,
          progress = $10,
          attachment_name = $11,
          updated_at = NOW()
      WHERE id = $12
      RETURNING *,
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
    `, [
      className.trim(),
      section.trim(),
      finalTitle.trim(),
      (chapterFolder || finalTitle || 'General Chapter').trim(),
      subject.trim(),
      finalMethodology.trim(),
      description.trim(),
      JSON.stringify(milestoneList),
      totalMilestones,
      validProgress,
      attachmentName,
      id
    ])

    const row = updateRes.rows[0]

    return NextResponse.json({
      success: true,
      message: 'Lesson plan updated successfully!',
      data: {
        id: row.id,
        className: row.class_name,
        section: row.section,
        title: row.title,
        chapterFolder: row.chapter_folder || row.title || 'General Chapter',
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
    console.error('Update lesson plan error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PUT(request, { params })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureLessonPlanDb()
    const { id } = await params
    const result = await pool.query('DELETE FROM school_lesson_plans WHERE id = $1 RETURNING id', [id])
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Lesson plan not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Lesson plan deleted successfully' })
  } catch (error: any) {
    console.error('Delete lesson plan error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}


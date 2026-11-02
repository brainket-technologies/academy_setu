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
      subject = current.subject,
      methodology = current.methodology,
      description = current.description,
      milestones,
      progress,
      attachmentName = current.attachment_name
    } = body

    const updatedMilestones = milestones !== undefined ? milestones : current.milestones
    const milestoneList = Array.isArray(updatedMilestones) ? updatedMilestones : []
    const totalMilestones = milestoneList.filter((m: any) => m.topic && m.topic.trim()).length || Math.max(1, milestoneList.length)
    
    let validProgress = progress !== undefined ? parseInt(String(progress)) : parseInt(String(current.progress || 0))
    validProgress = Math.min(100, Math.max(0, isNaN(validProgress) ? 0 : validProgress))

    const updateRes = await pool.query(`
      UPDATE school_lesson_plans
      SET class_name = $1,
          section = $2,
          title = $3,
          subject = $4,
          methodology = $5,
          description = $6,
          milestones = $7::jsonb,
          total_milestones = $8,
          progress = $9,
          attachment_name = $10,
          updated_at = NOW()
      WHERE id = $11
      RETURNING *,
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
    `, [
      className.trim(),
      section.trim(),
      title.trim(),
      subject.trim(),
      methodology.trim(),
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


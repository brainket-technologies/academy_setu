import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureNoticeDb } from '@/lib/notice-db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureNoticeDb()
    const { id } = await params
    const result = await pool.query(`
      SELECT *, 
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
      FROM school_notices
      WHERE id = $1
    `, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Notice not found' }, { status: 404 })
    }

    const row = result.rows[0]
    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        subjectTitle: row.subject_title,
        subjectCategory: row.subject_category,
        sentToUser: row.sent_to_user,
        message: row.message,
        priority: row.priority,
        scheduleAt: row.schedule_at,
        scheduleDate: row.schedule_date,
        scheduleTime: row.schedule_time,
        isScheduled: row.is_scheduled,
        recipientsType: row.recipients_type,
        targetAudience: row.target_audience,
        hasFile: row.has_file,
        fileName: row.file_name,
        fileUrl: row.file_url,
        createdAt: row.created_at_formatted
      }
    })
  } catch (error: any) {
    console.error('Fetch notice error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureNoticeDb()
    const { id } = await params
    const result = await pool.query('DELETE FROM school_notices WHERE id = $1 RETURNING id', [id])
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Notice not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Notice deleted successfully' })
  } catch (error: any) {
    console.error('Delete notice error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}


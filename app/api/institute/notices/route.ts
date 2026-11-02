import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureNoticeDb } from '@/lib/notice-db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    await ensureNoticeDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const priority = searchParams.get('priority') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    let query = `
      SELECT *, 
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
      FROM school_notices
      WHERE (institute_name ILIKE $1 OR institute_name = 'Cosmopolitan Inter')
    `
    const params: any[] = [`%${instituteName}%`]

    if (search.trim()) {
      params.push(`%${search.trim()}%`)
      query += ` AND (subject_title ILIKE $${params.length} OR message ILIKE $${params.length} OR subject_category ILIKE $${params.length})`
    }

    if (category && category !== 'All' && category !== 'Select Category') {
      params.push(category)
      query += ` AND subject_category = $${params.length}`
    }

    if (priority && priority !== 'All') {
      params.push(priority)
      query += ` AND priority = $${params.length}`
    }

    if (startDate) {
      params.push(startDate)
      query += ` AND (created_at::date >= $${params.length}::date OR schedule_date >= $${params.length}::date)`
    }

    if (endDate) {
      params.push(endDate)
      query += ` AND (created_at::date <= $${params.length}::date OR schedule_date <= $${params.length}::date)`
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)

    const mapped = result.rows.map(row => ({
      id: row.id,
      subjectTitle: row.subject_title,
      subjectCategory: row.subject_category || 'General',
      sentToUser: row.sent_to_user || 204,
      message: row.message,
      priority: row.priority || 'Normal',
      scheduleAt: row.schedule_at || (row.schedule_date ? `${new Date(row.schedule_date).toLocaleDateString('en-GB')} ${row.schedule_time || ''}` : row.created_at_formatted),
      scheduleDate: row.schedule_date ? new Date(row.schedule_date).toISOString().split('T')[0] : '',
      scheduleTime: row.schedule_time || '',
      isScheduled: row.is_scheduled || false,
      recipientsType: row.recipients_type || 'Everyone',
      targetAudience: row.target_audience || {},
      hasFile: !!row.has_file,
      fileName: row.file_name || '',
      fileUrl: row.file_url || '',
      createdAt: row.created_at_formatted || new Date(row.created_at).toLocaleDateString('en-GB')
    }))

    return NextResponse.json({ success: true, data: mapped })
  } catch (error: any) {
    console.error('Fetch notices error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureNoticeDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const body = await request.json()
    const {
      subjectTitle,
      subjectCategory = 'General',
      message,
      priority = 'Normal',
      scheduleDate,
      scheduleTime,
      isScheduled = false,
      sentToUser = 204,
      recipientsType = 'Everyone',
      targetAudience = {},
      hasFile = false,
      fileName = '',
      fileUrl = ''
    } = body

    if (!subjectTitle?.trim() || !message?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Subject Title and Message body are required.'
      }, { status: 400 })
    }

    let scheduleAtFormatted = ''
    if (isScheduled && scheduleDate) {
      try {
        const d = new Date(scheduleDate)
        scheduleAtFormatted = `${d.toLocaleDateString('en-GB')} ${scheduleTime || '10:00 AM'}`
      } catch {
        scheduleAtFormatted = `${scheduleDate} ${scheduleTime || ''}`
      }
    } else {
      const now = new Date()
      scheduleAtFormatted = `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    }

    const insertRes = await pool.query(`
      INSERT INTO school_notices (
        institute_name, subject_title, subject_category, message, priority,
        schedule_at, schedule_date, schedule_time, is_scheduled, sent_to_user,
        recipients_type, target_audience, has_file, file_name, file_url,
        created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        NOW(), NOW()
      )
      RETURNING *,
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
    `, [
      instituteName,
      subjectTitle.trim(),
      subjectCategory.trim(),
      message.trim(),
      priority,
      scheduleAtFormatted,
      scheduleDate || null,
      scheduleTime || '',
      !!isScheduled,
      parseInt(String(sentToUser)) || 204,
      recipientsType,
      JSON.stringify(targetAudience),
      !!hasFile,
      fileName,
      fileUrl
    ])

    const row = insertRes.rows[0]

    return NextResponse.json({
      success: true,
      message: isScheduled ? 'Notice scheduled successfully!' : 'Notice broadcasted to mobile app successfully!',
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
    console.error('Create notice error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}


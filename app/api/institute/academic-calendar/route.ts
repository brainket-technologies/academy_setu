import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureCalendarDb } from '@/lib/calendar-db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    await ensureCalendarDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const filterType = searchParams.get('type') || ''
    const filterHoliday = searchParams.get('is_holiday') // 'true' | 'false'
    const month = searchParams.get('month') // e.g. '2026-04'

    let query = `
      SELECT *, 
        TO_CHAR(start_date, 'YYYY-MM-DD') as start_date_str,
        TO_CHAR(end_date, 'YYYY-MM-DD') as end_date_str,
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
      FROM school_academic_calendar
      WHERE (institute_name ILIKE $1 OR institute_name = 'Cosmopolitan Inter')
    `
    const params: any[] = [`%${instituteName}%`]

    if (search.trim()) {
      params.push(`%${search.trim()}%`)
      query += ` AND (title ILIKE $${params.length} OR event_type ILIKE $${params.length} OR location ILIKE $${params.length} OR description ILIKE $${params.length})`
    }

    if (filterType && filterType !== 'All' && filterType !== 'Category') {
      params.push(filterType)
      query += ` AND event_type = $${params.length}`
    }

    if (filterHoliday === 'true') {
      query += ` AND is_holiday = true`
    } else if (filterHoliday === 'false') {
      query += ` AND is_holiday = false`
    }

    if (month && month.includes('-')) {
      const [y, m] = month.split('-')
      params.push(parseInt(y), parseInt(m))
      query += ` AND (
        (EXTRACT(YEAR FROM start_date) = $${params.length - 1} AND EXTRACT(MONTH FROM start_date) = $${params.length})
        OR
        (EXTRACT(YEAR FROM end_date) = $${params.length - 1} AND EXTRACT(MONTH FROM end_date) = $${params.length})
      )`
    }

    query += ' ORDER BY start_date ASC, start_time ASC'

    const result = await pool.query(query, params)

    const mapped = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      eventType: row.event_type,
      isHoliday: !!row.is_holiday,
      holidayType: row.holiday_type || 'Full Day',
      startDate: row.start_date_str,
      endDate: row.end_date_str,
      allDay: !!row.all_day,
      startTime: row.start_time || '',
      endTime: row.end_time || '',
      location: row.location || '',
      targetClasses: Array.isArray(row.target_classes) ? row.target_classes : ['All Classes'],
      color: row.color || '#0d9488',
      description: row.description || '',
      createdAt: row.created_at_formatted
    }))

    return NextResponse.json({ success: true, data: mapped })
  } catch (error: any) {
    console.error('Academic calendar GET error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureCalendarDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const body = await request.json()
    const {
      title,
      eventType = 'Event',
      isHoliday = false,
      holidayType = 'Full Day',
      startDate,
      endDate,
      allDay = true,
      startTime = '',
      endTime = '',
      location = '',
      targetClasses = ['All Classes'],
      color = '#0d9488',
      description = ''
    } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Event or Holiday Title is required.' }, { status: 400 })
    }

    if (!startDate) {
      return NextResponse.json({ success: false, error: 'Start Date is required.' }, { status: 400 })
    }

    const finalEndDate = endDate || startDate
    const finalColor = isHoliday ? (color || '#10b981') : (color || '#0d9488')

    const insertRes = await pool.query(`
      INSERT INTO school_academic_calendar (
        institute_name, title, event_type, is_holiday, holiday_type,
        start_date, end_date, all_day, start_time, end_time,
        location, target_classes, color, description, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12::jsonb, $13, $14, NOW(), NOW()
      )
      RETURNING *,
        TO_CHAR(start_date, 'YYYY-MM-DD') as start_date_str,
        TO_CHAR(end_date, 'YYYY-MM-DD') as end_date_str,
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
    `, [
      instituteName,
      title.trim(),
      eventType.trim(),
      !!isHoliday,
      isHoliday ? holidayType : 'Not Applicable',
      startDate,
      finalEndDate,
      !!allDay,
      startTime.trim(),
      endTime.trim(),
      location.trim(),
      JSON.stringify(Array.isArray(targetClasses) ? targetClasses : ['All Classes']),
      finalColor,
      description.trim()
    ])

    const row = insertRes.rows[0]

    return NextResponse.json({
      success: true,
      message: `${isHoliday ? 'Holiday' : 'Event'} created successfully!`,
      data: {
        id: row.id,
        title: row.title,
        eventType: row.event_type,
        isHoliday: !!row.is_holiday,
        holidayType: row.holiday_type,
        startDate: row.start_date_str,
        endDate: row.end_date_str,
        allDay: !!row.all_day,
        startTime: row.start_time,
        endTime: row.end_time,
        location: row.location,
        targetClasses: row.target_classes,
        color: row.color,
        description: row.description,
        createdAt: row.created_at_formatted
      }
    })
  } catch (error: any) {
    console.error('Academic calendar POST error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}


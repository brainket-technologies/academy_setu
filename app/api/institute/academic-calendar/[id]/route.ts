import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureCalendarDb } from '@/lib/calendar-db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureCalendarDb()
    const { id } = await params

    const result = await pool.query(`
      SELECT *, 
        TO_CHAR(start_date, 'YYYY-MM-DD') as start_date_str,
        TO_CHAR(end_date, 'YYYY-MM-DD') as end_date_str,
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
      FROM school_academic_calendar
      WHERE id = $1
    `, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })
    }

    const row = result.rows[0]
    return NextResponse.json({
      success: true,
      data: {
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
      }
    })
  } catch (error: any) {
    console.error('Academic calendar GET ID error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureCalendarDb()
    const { id } = await params
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

    const updateRes = await pool.query(`
      UPDATE school_academic_calendar
      SET title = $1,
          event_type = $2,
          is_holiday = $3,
          holiday_type = $4,
          start_date = $5,
          end_date = $6,
          all_day = $7,
          start_time = $8,
          end_time = $9,
          location = $10,
          target_classes = $11::jsonb,
          color = $12,
          description = $13,
          updated_at = NOW()
      WHERE id = $14
      RETURNING *,
        TO_CHAR(start_date, 'YYYY-MM-DD') as start_date_str,
        TO_CHAR(end_date, 'YYYY-MM-DD') as end_date_str,
        TO_CHAR(created_at, 'DD/MM/YYYY hh:mi AM') as created_at_formatted
    `, [
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
      description.trim(),
      id
    ])

    if (updateRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })
    }

    const row = updateRes.rows[0]
    return NextResponse.json({
      success: true,
      message: `${isHoliday ? 'Holiday' : 'Event'} updated successfully!`,
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
    console.error('Academic calendar PUT error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureCalendarDb()
    const { id } = await params

    const deleteRes = await pool.query(`DELETE FROM school_academic_calendar WHERE id = $1 RETURNING id`, [id])
    if (deleteRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Calendar entry deleted successfully!' })
  } catch (error: any) {
    console.error('Academic calendar DELETE error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}


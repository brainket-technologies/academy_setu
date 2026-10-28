'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

// Ensure DB table exists for attendance
async function ensureAttendanceTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS institute_attendance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id VARCHAR(255) NOT NULL,
      student_name VARCHAR(255),
      roll_no VARCHAR(100),
      admission_no VARCHAR(100),
      class_name VARCHAR(100),
      section_name VARCHAR(50),
      attendance_date DATE NOT NULL,
      status VARCHAR(50) NOT NULL,
      source_mode VARCHAR(50) DEFAULT 'Manual',
      marked_by VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_inst_att_lookup 
      ON institute_attendance(institution_id, attendance_date, class_name, section_name);
  `)
}

export async function fetchStudentAttendance(dateStr?: string, className?: string, sectionName?: string) {
  try {
    await ensureAttendanceTable()
    const session = await getSession('institute_session')
    const instId = session?.userId || 'default-inst'

    let query = `
      SELECT * FROM institute_attendance 
      WHERE (institution_id = $1 OR institution_id = 'default-inst')
    `
    const params: any[] = [instId]
    let pIdx = 2

    if (dateStr) {
      query += ` AND attendance_date = $${pIdx++}`
      params.push(dateStr)
    }
    if (className && className !== 'All Classes') {
      query += ` AND LOWER(class_name) = LOWER($${pIdx++})`
      params.push(className.trim())
    }
    if (sectionName && sectionName !== 'All Sections') {
      const cleanSec = sectionName.replace(/^section\s+/i, '').trim().toLowerCase()
      query += ` AND (LOWER(section_name) = LOWER($${pIdx}) OR LOWER(REPLACE(section_name, 'Section ', '')) = LOWER($${pIdx}))`
      params.push(cleanSec)
      pIdx++
    }

    query += ` ORDER BY roll_no ASC, student_name ASC`

    const res = await pool.query(query, params)
    return { success: true, data: res.rows }
  } catch (err: any) {
    console.error('fetchStudentAttendance error:', err)
    return { success: false, error: err.message, data: [] }
  }
}

export interface AttendanceRecordPayload {
  studentId?: string
  studentName: string
  rollNo: string
  admissionNo?: string
  status: 'Present' | 'Absent' | 'Leave'
  sourceMode?: string
}

export async function saveStudentAttendanceBatch(params: {
  dateStr: string
  className: string
  sectionName: string
  records: AttendanceRecordPayload[]
  sourceMode?: string
  markedBy?: string
}) {
  try {
    await ensureAttendanceTable()
    const session = await getSession('institute_session')
    const instId = session?.userId || 'default-inst'

    const { dateStr, className, sectionName, records, sourceMode = 'Manual', markedBy = 'Staff' } = params

    if (!records || records.length === 0) {
      return { success: false, error: 'No attendance records provided' }
    }

    // Delete existing records for this class, section and date to prevent duplicates
    await pool.query(
      `DELETE FROM institute_attendance 
       WHERE institution_id = $1 
         AND attendance_date = $2 
         AND LOWER(class_name) = LOWER($3) 
         AND (LOWER(section_name) = LOWER($4) OR LOWER(REPLACE(section_name, 'Section ', '')) = LOWER($4))`,
      [instId, dateStr, className.trim(), sectionName.replace(/^section\s+/i, '').trim().toLowerCase()]
    )

    // Insert new records
    for (const rec of records) {
      await pool.query(
        `INSERT INTO institute_attendance (
          institution_id,
          student_name,
          roll_no,
          admission_no,
          class_name,
          section_name,
          attendance_date,
          status,
          source_mode,
          marked_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          instId,
          rec.studentName,
          rec.rollNo,
          rec.admissionNo || '',
          className,
          sectionName,
          dateStr,
          rec.status,
          rec.sourceMode || sourceMode,
          markedBy
        ]
      )
    }

    return { 
      success: true, 
      count: records.length,
      sessionReference: `ATT-${dateStr.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
    }
  } catch (err: any) {
    console.error('saveStudentAttendanceBatch error:', err)
    return { success: false, error: err.message }
  }
}

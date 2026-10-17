'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export interface ExamMarksheetSetupRecord {
  id: string
  group: string
  exam: string
  classGrade: string
  marksGrade: string
  templateName: string
  session: string
  examDate?: string
  admitCardDate?: string
  lockExam?: boolean
  lastDateToEnter?: string
  config?: any
  date: string
  time: string
}

// -------------------------------------------------------------
// READ ALL / FILTER
// -------------------------------------------------------------
export async function fetchMarksheetSetups() {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    const res = await pool.query(`
      SELECT 
        id,
        group_name as "group",
        exam_name as "exam",
        class_grade as "classGrade",
        marks_grade as "marksGrade",
        template_name as "templateName",
        session,
        TO_CHAR(exam_date, 'YYYY-MM-DD') as "examDate",
        TO_CHAR(admit_card_date, 'YYYY-MM-DD') as "admitCardDate",
        lock_exam as "lockExam",
        TO_CHAR(last_date_to_enter, 'YYYY-MM-DD') as "lastDateToEnter",
        config,
        TO_CHAR(created_at, 'DD/MM/YYYY') as "date",
        TO_CHAR(created_at, 'HH12:MI AM') as "time"
      FROM institute_marksheet_setups
      WHERE (institution_id = $1 OR institution_id = 'default_institution')
      ORDER BY created_at DESC
    `, [institutionId])

    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

// -------------------------------------------------------------
// READ SINGLE SETUP BY ID
// -------------------------------------------------------------
export async function fetchMarksheetSetupById(id: string) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    const res = await pool.query(`
      SELECT 
        id,
        group_name as "group",
        exam_name as "exam",
        class_grade as "classGrade",
        marks_grade as "marksGrade",
        template_name as "templateName",
        session,
        TO_CHAR(exam_date, 'YYYY-MM-DD') as "examDate",
        TO_CHAR(admit_card_date, 'YYYY-MM-DD') as "admitCardDate",
        lock_exam as "lockExam",
        TO_CHAR(last_date_to_enter, 'YYYY-MM-DD') as "lastDateToEnter",
        config,
        TO_CHAR(created_at, 'DD/MM/YYYY') as "date",
        TO_CHAR(created_at, 'HH12:MI AM') as "time"
      FROM institute_marksheet_setups
      WHERE id = $1 AND (institution_id = $2 OR institution_id = 'default_institution')
    `, [id, institutionId])

    if (!res.rows[0]) {
      return { success: false, error: 'Setup not found', data: null }
    }
    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message, data: null }
  }
}

// -------------------------------------------------------------
// CREATE / UPDATE
// -------------------------------------------------------------
export async function saveMarksheetSetup(data: {
  id?: string
  groupName: string
  examName: string
  classGrade: string
  marksGrade?: string
  templateName?: string
  session?: string
  examDate?: string
  admitCardDate?: string
  lockExam?: boolean
  lastDateToEnter?: string
  config?: any
}) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    if (data.id) {
      // Update existing setup
      const res = await pool.query(`
        UPDATE institute_marksheet_setups
        SET 
          group_name = $1,
          exam_name = $2,
          class_grade = $3,
          marks_grade = $4,
          template_name = $5,
          session = $6,
          exam_date = $7,
          admit_card_date = $8,
          lock_exam = $9,
          last_date_to_enter = $10,
          config = $11,
          updated_at = now()
        WHERE id = $12 AND (institution_id = $13 OR institution_id = 'default_institution')
        RETURNING id, group_name as "group", exam_name as "exam", class_grade as "classGrade"
      `, [
        data.groupName || 'Exam',
        data.examName,
        data.classGrade,
        data.marksGrade || 'Percentage',
        data.templateName || 'CBSE Royal Emerald',
        data.session || '2025-2026',
        data.examDate ? new Date(data.examDate) : null,
        data.admitCardDate ? new Date(data.admitCardDate) : null,
        data.lockExam || false,
        data.lastDateToEnter ? new Date(data.lastDateToEnter) : null,
        JSON.stringify(data.config || {}),
        data.id,
        institutionId
      ])

      return { success: true, data: res.rows[0] }
    } else {
      // Insert new setup
      const res = await pool.query(`
        INSERT INTO institute_marksheet_setups (
          institution_id, group_name, exam_name, class_grade, marks_grade,
          template_name, session, exam_date, admit_card_date, lock_exam,
          last_date_to_enter, config
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, group_name as "group", exam_name as "exam", class_grade as "classGrade"
      `, [
        institutionId,
        data.groupName || 'Exam',
        data.examName,
        data.classGrade,
        data.marksGrade || 'Percentage',
        data.templateName || 'CBSE Royal Emerald',
        data.session || '2025-2026',
        data.examDate ? new Date(data.examDate) : null,
        data.admitCardDate ? new Date(data.admitCardDate) : null,
        data.lockExam || false,
        data.lastDateToEnter ? new Date(data.lastDateToEnter) : null,
        JSON.stringify(data.config || {})
      ])

      return { success: true, data: res.rows[0] }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// -------------------------------------------------------------
// BULK SAVE FROM WIZARD (Multiple classes)
// -------------------------------------------------------------
export async function saveMultipleMarksheetSetups(setups: Array<{
  groupName: string
  examName: string
  classGrade: string
  marksGrade?: string
  templateName?: string
  session?: string
  examDate?: string
  admitCardDate?: string
  lockExam?: boolean
  lastDateToEnter?: string
  config?: any
}>) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    const results = []
    for (const item of setups) {
      const res = await pool.query(`
        INSERT INTO institute_marksheet_setups (
          institution_id, group_name, exam_name, class_grade, marks_grade,
          template_name, session, exam_date, admit_card_date, lock_exam,
          last_date_to_enter, config
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, group_name as "group", exam_name as "exam", class_grade as "classGrade"
      `, [
        institutionId,
        item.groupName || 'Exam',
        item.examName,
        item.classGrade,
        item.marksGrade || 'Percentage',
        item.templateName || 'CBSE Royal Emerald',
        item.session || '2025-2026',
        item.examDate ? new Date(item.examDate) : null,
        item.admitCardDate ? new Date(item.admitCardDate) : null,
        item.lockExam || false,
        item.lastDateToEnter ? new Date(item.lastDateToEnter) : null,
        JSON.stringify(item.config || {})
      ])
      results.push(res.rows[0])
    }

    return { success: true, count: results.length, data: results }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// -------------------------------------------------------------
// DELETE
// -------------------------------------------------------------
export async function deleteMarksheetSetup(id: string) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    await pool.query(`
      DELETE FROM institute_marksheet_setups
      WHERE id = $1 AND (institution_id = $2 OR institution_id = 'default_institution')
    `, [id, institutionId])

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// -------------------------------------------------------------
// EXAM GROUPS (institute_exam_groups)
// -------------------------------------------------------------
export async function fetchExamGroups() {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    const res = await pool.query(`
      SELECT 
        id, 
        group_name as "groupName", 
        description,
        TO_CHAR(created_at, 'DD/MM/YYYY') as "date",
        TO_CHAR(created_at, 'HH12:MI AM') as "time"
      FROM institute_exam_groups
      WHERE (institution_id = $1 OR institution_id = 'default_institution')
      ORDER BY created_at ASC
    `, [institutionId])

    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function saveExamGroup(groupName: string, description?: string) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    const res = await pool.query(`
      INSERT INTO institute_exam_groups (institution_id, group_name, description)
      VALUES ($1, $2, $3)
      RETURNING 
        id, 
        group_name as "groupName", 
        description,
        TO_CHAR(created_at, 'DD/MM/YYYY') as "date",
        TO_CHAR(created_at, 'HH12:MI AM') as "time"
    `, [institutionId, groupName.trim(), description?.trim() || ''])

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}


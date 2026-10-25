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

    // Deduplicate / consolidate setups that share the same exam name, group, and session into one setup row
    const consolidatedMap = new Map<string, any>()
    for (const row of res.rows) {
      if (typeof row.config === 'string') {
        try { row.config = JSON.parse(row.config) } catch (e) {}
      }
      if (!row.lastDateToEnter && (row.config?.resultDate || row.config?.lastDateToEnter)) {
        row.lastDateToEnter = row.config?.resultDate || row.config?.lastDateToEnter
      }
      if (!row.examDate && (row.config?.examDate || row.config?.dateOfExam)) {
        row.examDate = row.config?.examDate || row.config?.dateOfExam
      }
      const key = `${(row.exam || '').trim().toLowerCase()}__${(row.session || '').trim().toLowerCase()}`
      if (!consolidatedMap.has(key)) {
        consolidatedMap.set(key, { ...row })
      } else {
        const existing = consolidatedMap.get(key)
        // Combine classGrade if distinct
        const existingGrade = existing.classGrade || ''
        const rowGrade = row.classGrade || ''
        if (rowGrade && !existingGrade.toLowerCase().includes(rowGrade.toLowerCase())) {
          existing.classGrade = `${existingGrade}, ${rowGrade}`
        }
        // Merge config.classes if present
        if (Array.isArray(row.config?.classes)) {
          existing.config = existing.config || {}
          const existingClasses = Array.isArray(existing.config.classes) ? existing.config.classes : []
          existing.config.classes = [...existingClasses, ...row.config.classes]
        }
      }
    }

    return { success: true, data: Array.from(consolidatedMap.values()) }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

function parseSqlDate(val?: any): string | null {
  if (!val) return null
  const s = String(val).trim()
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  if (s.includes('T')) {
    const p = s.split('T')[0]
    if (/^\d{4}-\d{2}-\d{2}$/.test(p)) return p
  }
  const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
  }
  try {
    const d = new Date(s)
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0]
    }
  } catch (e) {}
  return null
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
    const row = res.rows[0]
    let cfg = row.config
    if (typeof cfg === 'string') {
      try {
        cfg = JSON.parse(cfg)
      } catch (e) {
        cfg = {}
      }
    }
    if (!row.examDate && (cfg?.examDate || cfg?.dateOfExam)) {
      row.examDate = parseSqlDate(cfg.examDate || cfg.dateOfExam)
    }
    if (!row.admitCardDate) {
      row.admitCardDate = parseSqlDate(cfg?.admitCardDate || cfg?.admitCardSettings?.admitCardDate || row.examDate)
    }
    if (!row.lastDateToEnter) {
      row.lastDateToEnter = parseSqlDate(cfg?.lastDateToEnter || cfg?.resultDate || row.examDate)
    }
    return { success: true, data: row }
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
    const parsedExamDate = parseSqlDate(data.examDate)
    const parsedAdmitCardDate = parseSqlDate(data.admitCardDate) || parsedExamDate
    const parsedLastDate = parseSqlDate(data.lastDateToEnter) || parsedExamDate

    if (data.id) {
      // Update existing setup
      const updateRes = await pool.query(`
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
        data.groupName || 'Quarterly',
        data.examName,
        data.classGrade,
        data.marksGrade || 'Percentage',
        data.templateName || 'CBSE Royal Emerald',
        data.session || '2025-2026',
        parsedExamDate,
        parsedAdmitCardDate,
        data.lockExam || false,
        parsedLastDate,
        JSON.stringify(data.config || {}),
        data.id,
        institutionId
      ])

      return { success: true, data: updateRes.rows[0] }
    } else {
      // Check if setup already exists for this exam name and session
      const existing = await pool.query(`
        SELECT id FROM institute_marksheet_setups
        WHERE (institution_id = $1 OR institution_id = 'default_institution')
          AND LOWER(TRIM(exam_name)) = LOWER(TRIM($2))
          AND LOWER(TRIM(session)) = LOWER(TRIM($3))
        LIMIT 1
      `, [institutionId, data.examName, data.session || '2025-2026'])

      if (existing.rows.length > 0) {
        const existingId = existing.rows[0].id
        const updateExistingRes = await pool.query(`
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
          WHERE id = $12
          RETURNING id, group_name as "group", exam_name as "exam", class_grade as "classGrade"
        `, [
          data.groupName || 'Quarterly',
          data.examName,
          data.classGrade,
          data.marksGrade || 'Percentage',
          data.templateName || 'CBSE Royal Emerald',
          data.session || '2025-2026',
          parsedExamDate,
          parsedAdmitCardDate,
          data.lockExam || false,
          parsedLastDate,
          JSON.stringify(data.config || {}),
          existingId
        ])

        return { success: true, data: updateExistingRes.rows[0] }
      }

      // Insert new setup
      const insertRes = await pool.query(`
        INSERT INTO institute_marksheet_setups (
          institution_id, group_name, exam_name, class_grade, marks_grade,
          template_name, session, exam_date, admit_card_date, lock_exam,
          last_date_to_enter, config
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, group_name as "group", exam_name as "exam", class_grade as "classGrade"
      `, [
        institutionId,
        data.groupName || 'Quarterly',
        data.examName,
        data.classGrade,
        data.marksGrade || 'Percentage',
        data.templateName || 'CBSE Royal Emerald',
        data.session || '2025-2026',
        parsedExamDate,
        parsedAdmitCardDate,
        data.lockExam || false,
        parsedLastDate,
        JSON.stringify(data.config || {})
      ])

      return { success: true, data: insertRes.rows[0] }
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
const DEFAULT_SYSTEM_EXAM_GROUPS = [
  { groupName: 'Quarterly', description: 'Quarterly examination assessment scheme' },
  { groupName: 'Half Yearly', description: 'Half Yearly examination assessment scheme' },
  { groupName: 'Yearly', description: 'Yearly comprehensive examination scheme' },
  { groupName: 'Annually', description: 'Annual final examination scheme' }
]

export async function fetchExamGroups() {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    // 1. Ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS institute_exam_groups (
        id SERIAL PRIMARY KEY,
        institution_id VARCHAR(255) NOT NULL,
        group_name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // 2. Fetch existing groups
    let res = await pool.query(`
      SELECT 
        id, 
        group_name as "groupName", 
        description,
        TO_CHAR(created_at, 'DD/MM/YYYY') as "date",
        TO_CHAR(created_at, 'HH12:MI AM') as "time"
      FROM institute_exam_groups
      WHERE (institution_id = $1 OR institution_id = 'default_institution')
      ORDER BY id ASC
    `, [institutionId])

    // 3. Seed default groups if empty
    if (res.rows.length === 0) {
      for (const defGroup of DEFAULT_SYSTEM_EXAM_GROUPS) {
        await pool.query(`
          INSERT INTO institute_exam_groups (institution_id, group_name, description)
          VALUES ($1, $2, $3)
        `, [institutionId, defGroup.groupName, defGroup.description])
      }

      res = await pool.query(`
        SELECT 
          id, 
          group_name as "groupName", 
          description,
          TO_CHAR(created_at, 'DD/MM/YYYY') as "date",
          TO_CHAR(created_at, 'HH12:MI AM') as "time"
        FROM institute_exam_groups
        WHERE (institution_id = $1 OR institution_id = 'default_institution')
        ORDER BY id ASC
      `, [institutionId])
    }

    return { success: true, data: res.rows }
  } catch (err: any) {
    const today = new Date()
    const formattedDate = today.toLocaleDateString('en-GB')
    const formattedTime = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const fallbackData = DEFAULT_SYSTEM_EXAM_GROUPS.map((g, idx) => ({
      id: idx + 1,
      groupName: g.groupName,
      description: g.description,
      date: formattedDate,
      time: formattedTime
    }))
    return { success: true, data: fallbackData }
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

export async function updateExamGroup(id: number | string, groupName: string, description?: string) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    const res = await pool.query(`
      UPDATE institute_exam_groups
      SET group_name = $1, description = $2
      WHERE id = $3 AND (institution_id = $4 OR institution_id = 'default_institution')
      RETURNING 
        id, 
        group_name as "groupName", 
        description,
        TO_CHAR(created_at, 'DD/MM/YYYY') as "date",
        TO_CHAR(created_at, 'HH12:MI AM') as "time"
    `, [groupName.trim(), description?.trim() || '', id, institutionId])

    if (res.rows.length === 0) {
      return { success: false, error: 'Group not found or unauthorized' }
    }

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteExamGroup(id: number | string) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    await pool.query(`
      DELETE FROM institute_exam_groups
      WHERE id = $1 AND (institution_id = $2 OR institution_id = 'default_institution')
    `, [id, institutionId])

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// -------------------------------------------------------------
// INSTITUTION PROFILE DETAILS (Auto-fetch for Principal, Name, etc.)
// -------------------------------------------------------------
export async function fetchCurrentInstitutionDetails() {
  const session = await getSession('institute_session')
  const institutionId = session?.userId

  try {
    let res: any = null
    if (institutionId && institutionId !== 'default_institution') {
      res = await pool.query(`
        SELECT 
          id, 
          name, 
          affiliated_to as "affiliatedTo", 
          affiliation_code as "affiliationCode", 
          contact_person as "contactPerson", 
          mobile_no as "mobileNo", 
          email_id as "emailId", 
          address, 
          state, 
          district, 
          pincode, 
          principal_name as "principalName", 
          principal_sign as "principalSign"
        FROM institutions
        WHERE id = $1
      `, [institutionId])
    }

    if (!res || res.rows.length === 0) {
      res = await pool.query(`
        SELECT 
          id, 
          name, 
          affiliated_to as "affiliatedTo", 
          affiliation_code as "affiliationCode", 
          contact_person as "contactPerson", 
          mobile_no as "mobileNo", 
          email_id as "emailId", 
          address, 
          state, 
          district, 
          pincode, 
          principal_name as "principalName", 
          principal_sign as "principalSign"
        FROM institutions
        ORDER BY created_at ASC
        LIMIT 1
      `)
    }

    if (res && res.rows.length > 0) {
      return { success: true, data: res.rows[0] }
    }
    return { success: false, data: null }
  } catch (err: any) {
    return { success: false, error: err.message, data: null }
  }
}


'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export interface CertificateTypeData {
  id?: string
  title: string
  subtitle?: string
  prefix: string
  startNo: string
  classes: string[]
  designId: number
  content?: string
  titleBgColor?: string
  textColor?: string
  fontSize?: string
  hiddenFields?: string[]
  themeColor?: string
  principalName?: string
  principalLabel?: string
  schoolName?: string
  schoolAddress?: string
  customLabels?: Record<string, string>
}

let certTableEnsured = false
async function ensureCertificateTypeColumns() {
  if (certTableEnsured) return
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS institute_certificate_types (
        id SERIAL PRIMARY KEY,
        institution_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        prefix VARCHAR(50),
        start_no VARCHAR(50),
        classes TEXT[],
        design_id INT DEFAULT 1,
        content TEXT,
        title_bg_color VARCHAR(50),
        text_color VARCHAR(50),
        font_size VARCHAR(50),
        hidden_fields TEXT[],
        theme_color VARCHAR(50),
        principal_name VARCHAR(255),
        school_name VARCHAR(255),
        school_address VARCHAR(255),
        custom_labels JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE institute_certificate_types ADD COLUMN IF NOT EXISTS theme_color VARCHAR(50);
      ALTER TABLE institute_certificate_types ADD COLUMN IF NOT EXISTS principal_name VARCHAR(255);
      ALTER TABLE institute_certificate_types ADD COLUMN IF NOT EXISTS school_name VARCHAR(255);
      ALTER TABLE institute_certificate_types ADD COLUMN IF NOT EXISTS school_address VARCHAR(255);
      ALTER TABLE institute_certificate_types ADD COLUMN IF NOT EXISTS custom_labels JSONB;
    `)
    certTableEnsured = true
  } catch (e) {
    // Ignore migration catch
  }
}

// -------------------------------------------------------------
// CERTIFICATE TYPES (Saved in PostgreSQL: institute_certificate_types)
// -------------------------------------------------------------
export async function fetchCertificateTypes() {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  await ensureCertificateTypeColumns()

  try {
    const res = await pool.query(`
      SELECT 
        id, 
        title, 
        subtitle, 
        prefix, 
        start_no as "startNo", 
        classes, 
        design_id as "designId", 
        content, 
        title_bg_color as "titleBgColor", 
        text_color as "textColor", 
        font_size as "fontSize", 
        hidden_fields as "hiddenFields", 
        theme_color as "themeColor",
        principal_name as "principalName",
        school_name as "schoolName",
        school_address as "schoolAddress",
        custom_labels as "customLabels",
        TO_CHAR(created_at, 'DD/MM/YYYY') as "date",
        TO_CHAR(created_at, 'HH12:MI AM') as "time"
      FROM institute_certificate_types
      WHERE (institution_id = $1 OR institution_id = 'default_institution')
      ORDER BY created_at DESC
    `, [institutionId])

    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function saveCertificateType(data: CertificateTypeData) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  await ensureCertificateTypeColumns()

  const chosenTheme = data.themeColor || data.titleBgColor || '#1E3A8A'

  try {
    if (data.id) {
      const res = await pool.query(`
        UPDATE institute_certificate_types SET
          title = $1,
          subtitle = $2,
          prefix = $3,
          start_no = $4,
          classes = $5,
          design_id = $6,
          content = $7,
          title_bg_color = $8,
          text_color = $9,
          font_size = $10,
          hidden_fields = $11,
          theme_color = $12,
          principal_name = $13,
          school_name = $14,
          school_address = $15,
          custom_labels = $16
        WHERE id = $17 AND (institution_id = $18 OR institution_id = 'default_institution')
        RETURNING id, title, subtitle, prefix, start_no as "startNo", classes, design_id as "designId", theme_color as "themeColor"
      `, [
        data.title || 'Certificate of Achievement',
        data.subtitle || 'Official Institutional Recognition',
        data.prefix || 'CER/2025/',
        data.startNo || '101',
        data.classes || ['All Classes'],
        data.designId || 1,
        data.content || '',
        chosenTheme,
        data.textColor || '#0f172a',
        data.fontSize || '14',
        data.hiddenFields || [],
        chosenTheme,
        data.principalName || 'Dr. S. K. Sharma',
        data.schoolName || 'COSMOPOLITAN INTER COLLEGE',
        data.schoolAddress || 'Knowledge Park, Sector 62, New Delhi',
        data.customLabels ? JSON.stringify(data.customLabels) : null,
        data.id,
        institutionId
      ])
      return { success: true, data: res.rows[0] }
    } else {
      const res = await pool.query(`
        INSERT INTO institute_certificate_types (
          institution_id, title, subtitle, prefix, start_no, classes,
          design_id, content, title_bg_color, text_color, font_size, hidden_fields,
          theme_color, principal_name, school_name, school_address, custom_labels
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id, title, subtitle, prefix, start_no as "startNo", classes, design_id as "designId", theme_color as "themeColor"
      `, [
        institutionId,
        data.title || 'Certificate of Achievement',
        data.subtitle || 'Official Institutional Recognition',
        data.prefix || 'CER/2025/',
        data.startNo || '101',
        data.classes || ['All Classes'],
        data.designId || 1,
        data.content || '',
        chosenTheme,
        data.textColor || '#0f172a',
        data.fontSize || '14',
        data.hiddenFields || [],
        chosenTheme,
        data.principalName || 'Dr. S. K. Sharma',
        data.schoolName || 'COSMOPOLITAN INTER COLLEGE',
        data.schoolAddress || 'Knowledge Park, Sector 62, New Delhi',
        data.customLabels ? JSON.stringify(data.customLabels) : null
      ])
      return { success: true, data: res.rows[0] }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteCertificateType(id: string) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    await pool.query(`
      DELETE FROM institute_certificate_types
      WHERE id = $1 AND (institution_id = $2 OR institution_id = 'default_institution')
    `, [id, institutionId])

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// -------------------------------------------------------------
// ISSUED CERTIFICATES (Saved in PostgreSQL: institute_issued_certificates)
// -------------------------------------------------------------
export interface IssuedCertificateData {
  id?: string
  certificateTypeId?: string
  title: string
  certificateNo?: string
  studentId?: string
  studentName: string
  className?: string
  sectionName?: string
  exam?: string
  issueDate?: string
  designId?: number
  fatherName?: string
  rollNo?: string
  admissionNo?: string
  schoolName?: string
  remarks?: string
  content?: string
  details?: any
}

export async function fetchIssuedCertificates() {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    const res = await pool.query(`
      SELECT 
        id, 
        certificate_type_id as "certificateTypeId",
        title, 
        certificate_no as "certificateNo", 
        student_id as "studentId", 
        student_name as "student", 
        class_name as "class", 
        section_name as "section", 
        exam, 
        TO_CHAR(issue_date, 'DD/MM/YYYY') as "date",
        TO_CHAR(issue_date, 'YYYY-MM-DD') as "rawDate",
        TO_CHAR(created_at, 'HH12:MI AM') as "time",
        created_at as "createdAt",
        details
      FROM institute_issued_certificates
      WHERE (institution_id = $1 OR institution_id = 'default_institution')
      ORDER BY created_at DESC
    `, [institutionId])

    const formatted = res.rows.map((row: any) => {
      const details = typeof row.details === 'object' && row.details !== null ? row.details : {}
      return {
        ...row,
        designId: details.designId || 1,
        themeColor: details.themeColor || '#1E3A8A',
        fatherName: details.fatherName || '',
        rollNo: details.rollNo || '',
        admissionNo: details.admissionNo || '',
        schoolName: details.schoolName || 'COSMOPOLITAN INTER COLLEGE',
        remarks: details.remarks || '',
        content: details.content || ''
      }
    })

    return { success: true, data: formatted }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function saveIssuedCertificate(data: IssuedCertificateData) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    const certNo = data.certificateNo || `CER/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`
    const details = {
      ...(data.details || {}),
      designId: Number(data.designId) || 1,
      themeColor: data.details?.themeColor || '#1E3A8A',
      fatherName: data.fatherName || '',
      rollNo: data.rollNo || '',
      admissionNo: data.admissionNo || '',
      schoolName: data.schoolName || 'COSMOPOLITAN INTER COLLEGE',
      remarks: data.remarks || '',
      content: data.content || ''
    }

    const res = await pool.query(`
      INSERT INTO institute_issued_certificates (
        institution_id, certificate_type_id, title, certificate_no,
        student_id, student_name, class_name, section_name, exam,
        issue_date, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING 
        id, 
        certificate_type_id as "certificateTypeId",
        title, 
        certificate_no as "certificateNo", 
        student_id as "studentId", 
        student_name as "student", 
        class_name as "class", 
        section_name as "section", 
        exam, 
        TO_CHAR(issue_date, 'DD/MM/YYYY') as "date",
        TO_CHAR(created_at, 'HH12:MI AM') as "time",
        details
    `, [
      institutionId,
      data.certificateTypeId || null,
      data.title || 'Certificate of Achievement',
      certNo,
      data.studentId || null,
      data.studentName,
      data.className || 'Class 10',
      data.sectionName || 'Section A',
      data.exam || 'Annual Academic Exam',
      data.issueDate ? new Date(data.issueDate) : new Date(),
      JSON.stringify(details)
    ])

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteIssuedCertificate(id: string) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    await pool.query(`
      DELETE FROM institute_issued_certificates
      WHERE id = $1 AND (institution_id = $2 OR institution_id = 'default_institution')
    `, [id, institutionId])

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function fetchStudentsForCertificate() {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    // Detect which columns actually exist in institute_students
    const colsRes = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'institute_students'
    `)
    const colSet = new Set(colsRes.rows.map((r: any) => String(r.column_name).toLowerCase()))

    if (colSet.size === 0) {
      return { success: true, data: [] }
    }

    const hasCol = (col: string) => colSet.has(col.toLowerCase())

    const nameExpr = hasCol('name') && hasCol('first_name')
      ? "COALESCE(NULLIF(name, ''), TRIM(CONCAT(first_name, ' ', COALESCE(last_name, ''))))"
      : hasCol('name')
      ? "name"
      : hasCol('first_name')
      ? "TRIM(CONCAT(first_name, ' ', COALESCE(last_name, '')))"
      : "''"

    const admExpr = hasCol('admission_no') ? "admission_no" : "''"
    const rollExpr = hasCol('roll_no') ? "roll_no" : "''"
    const classExpr = hasCol('class_name') ? "class_name" : hasCol('class') ? "class" : "''"
    const secExpr = hasCol('section_name') ? "section_name" : hasCol('section') ? "section" : "''"
    const fatherExpr = hasCol('father_name') ? "father_name" : hasCol('guardian_name') ? "guardian_name" : "''"

    const whereClause = hasCol('institution_id')
      ? "(institution_id::text = $1::text OR $1 = 'default_institution')"
      : "1=1"

    const res = await pool.query(`
      SELECT 
        id,
        ${nameExpr} as name,
        ${admExpr} as "admissionNo",
        ${rollExpr} as "rollNo",
        ${classExpr} as "className",
        ${secExpr} as "sectionName",
        ${fatherExpr} as "fatherName"
      FROM institute_students
      WHERE ${whereClause}
      ORDER BY id DESC
    `, hasCol('institution_id') ? [institutionId] : [])

    const formatted = res.rows.map((r: any) => {
      const fullName = (r.name || '').trim()
      return {
        id: String(r.id),
        name: fullName,
        admissionNo: r.admissionNo || '',
        rollNo: r.rollNo || r.admissionNo || '',
        className: r.className || '',
        section: r.sectionName || '',
        fatherName: r.fatherName || ''
      }
    }).filter((s: any) => s.name && s.name.toLowerCase() !== 'student')

    return { success: true, data: formatted }
  } catch (err: any) {
    console.error('Safe fetch students for certificate:', err.message)
    return { success: true, data: [] }
  }
}


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
}

// -------------------------------------------------------------
// CERTIFICATE TYPES (Saved in PostgreSQL: institute_certificate_types)
// -------------------------------------------------------------
export async function fetchCertificateTypes() {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

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

  try {
    const res = await pool.query(`
      INSERT INTO institute_certificate_types (
        institution_id, title, subtitle, prefix, start_no, classes,
        design_id, content, title_bg_color, text_color, font_size, hidden_fields
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, title, subtitle, prefix, start_no as "startNo", classes, design_id as "designId"
    `, [
      institutionId,
      data.title || 'Certificate of Achievement',
      data.subtitle || 'Official Institutional Recognition',
      data.prefix || 'CER/2025/',
      data.startNo || '101',
      data.classes || ['All Classes'],
      data.designId || 1,
      data.content || '',
      data.titleBgColor || '#1e3a8a',
      data.textColor || '#0f172a',
      data.fontSize || '14',
      data.hiddenFields || []
    ])

    return { success: true, data: res.rows[0] }
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
        fatherName: details.fatherName || '',
        rollNo: details.rollNo || '',
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
      fatherName: data.fatherName || '',
      rollNo: data.rollNo || '',
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
    const res = await pool.query(`
      SELECT 
        id,
        name,
        admission_no as "admissionNo",
        roll_no as "rollNo"
      FROM institute_students
      WHERE (institution_id = $1 OR $1 = 'default_institution')
      ORDER BY name ASC
    `, [institutionId])

    const defaultStudents = [
      { id: 'std-1', name: 'Aarav Sharma', admissionNo: 'AS-2024-1048', rollNo: '1001', className: 'Class 10', section: 'Section A', fatherName: 'Rajesh Sharma' },
      { id: 'std-2', name: 'Ananya Verma', admissionNo: 'GHA-2024-8842', rollNo: '8024', className: 'Class 8', section: 'Section B', fatherName: 'Vikram Verma' },
      { id: 'std-3', name: 'Rohan Mehra', admissionNo: 'AS-2024-1102', rollNo: '1012', className: 'Class 10', section: 'Section A', fatherName: 'Sanjay Mehra' },
      { id: 'std-4', name: 'Priyanshu Das', admissionNo: 'PR-2024-3320', rollNo: '1205', className: 'Class 12 - Science', section: 'Section C', fatherName: 'Manoj Das' },
      { id: 'std-5', name: 'Sara Khan', admissionNo: 'SK-2024-5510', rollNo: '9018', className: 'Class 9', section: 'Section A', fatherName: 'Tariq Khan' },
      { id: 'std-6', name: 'Devendra Patel', admissionNo: 'DP-2024-7721', rollNo: '1109', className: 'Class 11 - Science', section: 'Section B', fatherName: 'Ramesh Patel' },
    ]

    if (res.rows.length === 0) {
      return { success: true, data: defaultStudents }
    }

    const merged = res.rows.map((r: any, idx: number) => ({
      id: r.id,
      name: r.name || 'Student',
      admissionNo: r.admissionNo || `ADM-${1000 + idx}`,
      rollNo: r.rollNo || `${100 + idx}`,
      className: 'Class 10',
      section: 'Section A',
      fatherName: 'Guardian Name'
    }))

    return { success: true, data: merged }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

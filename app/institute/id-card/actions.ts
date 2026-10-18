'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export interface IdCardPerson {
  id: string
  uniqueId: string
  name: string
  role: 'Student' | 'Teacher' | 'Employee'
  className: string
  section: string
  session: string
  contact: string
  email: string
  fatherName?: string
  motherName?: string
  dob?: string
  bloodGroup?: string
  qualification?: string
  joiningDate?: string
  designation?: string
  department?: string
  avatar?: string
  designId: 1 | 2
  generatedAt: string
}

export interface IdCardSetupData {
  id?: string
  title: string
  cardFor: 'Student' | 'Teacher' | 'Employee'
  session: string
  designId: number
  tagline?: string
  schoolName?: string
  schoolAddress?: string
  schoolPhone?: string
  schoolEmail?: string
  udiseCode?: string
  schoolCode?: string
  affiliatedTo?: string
  affiliationCode?: string
  showWatermark?: boolean
  showPrincipalSign?: boolean
  showTopHeaderTagline?: boolean
  printQr?: boolean
  showBloodGroup?: boolean
  bottomNotes?: string
  themeColor?: string
  principalName?: string
  customLabels?: Record<string, string>
}

let tableEnsured = false
async function ensureIdCardSetupColumns() {
  if (tableEnsured) return
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS institute_id_card_setups (
        id SERIAL PRIMARY KEY,
        institution_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        card_for VARCHAR(50) NOT NULL,
        session VARCHAR(50) NOT NULL,
        design_id INT DEFAULT 1,
        tagline VARCHAR(255),
        school_name VARCHAR(255),
        school_address VARCHAR(255),
        school_phone VARCHAR(50),
        school_email VARCHAR(100),
        udise_code VARCHAR(50),
        school_code VARCHAR(50),
        affiliated_to VARCHAR(100),
        affiliation_code VARCHAR(100),
        show_watermark BOOLEAN DEFAULT TRUE,
        show_principal_sign BOOLEAN DEFAULT TRUE,
        show_top_header_tagline BOOLEAN DEFAULT TRUE,
        print_qr BOOLEAN DEFAULT TRUE,
        show_blood_group BOOLEAN DEFAULT TRUE,
        bottom_notes TEXT,
        theme_color VARCHAR(50),
        principal_name VARCHAR(255),
        custom_labels JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE institute_id_card_setups ADD COLUMN IF NOT EXISTS theme_color VARCHAR(50);
      ALTER TABLE institute_id_card_setups ADD COLUMN IF NOT EXISTS principal_name VARCHAR(255);
      ALTER TABLE institute_id_card_setups ADD COLUMN IF NOT EXISTS custom_labels JSONB;
    `)
    tableEnsured = true
  } catch (e) {
    // Ignore if already migrated
  }
}

// -------------------------------------------------------------
// ID CARD SETUPS (Saved in PostgreSQL: institute_id_card_setups)
// -------------------------------------------------------------
export async function fetchIdCardSetups() {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  await ensureIdCardSetupColumns()

  try {
    const res = await pool.query(`
      SELECT 
        id, 
        title, 
        card_for as "for", 
        session, 
        design_id as "designId", 
        tagline, 
        school_name as "schoolName", 
        school_address as "schoolAddress", 
        school_phone as "schoolPhone", 
        school_email as "schoolEmail", 
        udise_code as "udiseCode", 
        school_code as "schoolCode", 
        affiliated_to as "affiliatedTo", 
        affiliation_code as "affiliationCode", 
        show_watermark as "showWatermark", 
        show_principal_sign as "showPrincipalSign", 
        show_top_header_tagline as "showTopHeaderTagline", 
        print_qr as "printQr", 
        show_blood_group as "showBloodGroup", 
        bottom_notes as "bottomNotes", 
        theme_color as "themeColor",
        principal_name as "principalName",
        custom_labels as "customLabels",
        TO_CHAR(created_at, 'DD/MM/YYYY') as "date",
        TO_CHAR(created_at, 'HH12:MI AM') as "time"
      FROM institute_id_card_setups
      WHERE (institution_id = $1 OR institution_id = 'default_institution')
      ORDER BY created_at DESC
    `, [institutionId])

    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

export async function saveIdCardSetup(data: IdCardSetupData) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  await ensureIdCardSetupColumns()

  try {
    const res = await pool.query(`
      INSERT INTO institute_id_card_setups (
        institution_id, title, card_for, session, design_id, tagline,
        school_name, school_address, school_phone, school_email, udise_code,
        school_code, affiliated_to, affiliation_code, show_watermark,
        show_principal_sign, show_top_header_tagline, print_qr, show_blood_group, bottom_notes,
        theme_color, principal_name, custom_labels
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING id, title, card_for as "for", session, design_id as "designId", theme_color as "themeColor"
    `, [
      institutionId,
      data.title || 'ID Card Design',
      data.cardFor || 'Student',
      data.session || '2025-26',
      data.designId || 1,
      data.tagline || '',
      data.schoolName || 'COSMOPOLITAN INTER COLLEGE',
      data.schoolAddress || 'Knowledge Park, Sector 62, New Delhi',
      data.schoolPhone || '+91 11 2345 6789',
      data.schoolEmail || 'info@academy.edu',
      data.udiseCode || '',
      data.schoolCode || '',
      data.affiliatedTo || 'CBSE, New Delhi',
      data.affiliationCode || '',
      data.showWatermark ?? true,
      data.showPrincipalSign ?? true,
      data.showTopHeaderTagline ?? true,
      data.printQr ?? true,
      data.showBloodGroup ?? true,
      data.bottomNotes || '',
      data.themeColor || '#0284c7',
      data.principalName || 'K.Singhal',
      JSON.stringify(data.customLabels || {})
    ])

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteIdCardSetup(id: string) {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  try {
    await pool.query(`
      DELETE FROM institute_id_card_setups
      WHERE id = $1 AND (institution_id = $2 OR institution_id = 'default_institution')
    `, [id, institutionId])

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// -------------------------------------------------------------
// ID CARD PEOPLE (Students, Teachers, Employees)
// -------------------------------------------------------------
export async function fetchIdCardPeople(): Promise<{ success: boolean; data?: IdCardPerson[]; error?: string }> {
  const session = await getSession('institute_session')
  const institutionId = session?.userId || 'default_institution'

  const people: IdCardPerson[] = []

  try {
    // 1. Fetch Students
    try {
      const studentsRes = await pool.query(`
        SELECT id, first_name, last_name, admission_no, roll_no, class_name, section_name, 
               contact, email, dob, blood_group, father_name, mother_name, avatar, created_at
        FROM institute_students 
        WHERE (institution_id = $1 OR $1 = 'default_institution')
          AND (status IS NULL OR status != 'Deleted')
        ORDER BY created_at DESC
      `, [institutionId])

      studentsRes.rows.forEach((s: any, idx: number) => {
        const fullName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Student'
        const createdAt = s.created_at ? new Date(s.created_at) : new Date()
        people.push({
          id: `student-${s.id || idx}`,
          uniqueId: s.admission_no || `ADM-${1000 + idx}`,
          name: fullName,
          role: 'Student',
          className: s.class_name ? (s.class_name.toLowerCase().startsWith('class') ? s.class_name : `Class ${s.class_name}`) : 'Class X',
          section: s.section_name ? (s.section_name.toLowerCase().startsWith('sec') ? s.section_name : `Section ${s.section_name}`) : 'Section A',
          session: '2025-26',
          contact: s.contact || '+91 98765 43210',
          email: s.email || '',
          fatherName: s.father_name || 'Rajesh Sharma',
          motherName: s.mother_name || 'Sunita Sharma',
          dob: s.dob || '14/08/2010',
          bloodGroup: s.blood_group || (idx % 2 === 0 ? 'O+' : 'B+'),
          avatar: s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
          designId: (idx % 2 === 0 ? 1 : 2) as 1 | 2,
          generatedAt: createdAt.toLocaleDateString('en-GB')
        })
      })
    } catch (err: any) {
      console.warn('Error fetching students for ID cards:', err.message)
    }

    // 2. Fetch Teachers
    try {
      const teachersRes = await pool.query(`
        SELECT id, username, name, contact, email, assigned_classes, status, 
               TO_CHAR(joining_date, 'DD/MM/YYYY') as "joiningDate", avatar, details, created_at
        FROM institute_teachers
        WHERE (institution_id = $1 OR $1 = 'default_institution')
          AND (status IS NULL OR status = 'Active')
        ORDER BY created_at DESC
      `, [institutionId])

      teachersRes.rows.forEach((t: any, idx: number) => {
        const details = typeof t.details === 'object' && t.details !== null ? t.details : {}
        const qualification = details?.qualification || 'M.Sc, B.Ed'
        const department = details?.department || 'Science & Mathematics'
        const designation = details?.designation || (Array.isArray(t.assigned_classes) && t.assigned_classes[0]) || 'Senior Faculty'
        const createdAt = t.created_at ? new Date(t.created_at) : new Date()

        people.push({
          id: `teacher-${t.id || idx}`,
          uniqueId: t.username || `TCH-${200 + idx}`,
          name: t.name || 'Faculty Member',
          role: 'Teacher',
          className: designation,
          section: department,
          session: '2025-26',
          contact: t.contact || '+91 98112 34567',
          email: t.email || 'faculty@academy.edu',
          bloodGroup: details?.bloodGroup || 'AB+',
          qualification: qualification,
          joiningDate: t.joiningDate || '12/07/2018',
          designation: designation,
          department: department,
          avatar: t.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(t.name || 'Teacher')}`,
          designId: (idx % 2 === 0 ? 1 : 2) as 1 | 2,
          generatedAt: createdAt.toLocaleDateString('en-GB')
        })
      })
    } catch (err: any) {
      console.warn('Error fetching teachers for ID cards:', err.message)
    }

    // 3. Fetch Employees / Staff
    try {
      const staffRes = await pool.query(`
        SELECT id, username, name, role, contact, email, status, 
               TO_CHAR(joining_date, 'DD/MM/YYYY') as "joinDate", avatar, details, created_at
        FROM institute_staff_members
        WHERE (institution_id = $1 OR $1 = 'default_institution')
          AND (status IS NULL OR status != 'Deleted')
        ORDER BY created_at DESC
      `, [institutionId])

      staffRes.rows.forEach((emp: any, idx: number) => {
        const details = typeof emp.details === 'object' && emp.details !== null ? emp.details : {}
        const department = details?.department || 'Administration & Accounts'
        const designation = emp.role || details?.designation || 'Staff Member'
        const createdAt = emp.created_at ? new Date(emp.created_at) : new Date()

        people.push({
          id: `employee-${emp.id || idx}`,
          uniqueId: emp.username || `EMP-${300 + idx}`,
          name: emp.name || 'Staff Member',
          role: 'Employee',
          className: designation,
          section: department,
          session: '2025-26',
          contact: emp.contact || '+91 97123 45678',
          email: emp.email || 'staff@academy.edu',
          bloodGroup: details?.bloodGroup || 'A+',
          joiningDate: emp.joinDate || '05/02/2020',
          designation: designation,
          department: department,
          avatar: emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name || 'Staff')}`,
          designId: (idx % 2 === 0 ? 1 : 2) as 1 | 2,
          generatedAt: createdAt.toLocaleDateString('en-GB')
        })
      })
    } catch (err: any) {
      console.warn('Error fetching employees for ID cards:', err.message)
    }

    return { success: true, data: people }
  } catch (err: any) {
    return { success: false, error: err.message, data: [] }
  }
}

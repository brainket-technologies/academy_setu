'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

async function ensureTeachersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS institute_teachers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id VARCHAR(255) NOT NULL,
      username VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      contact VARCHAR(50),
      email VARCHAR(255),
      assigned_classes TEXT[],
      status VARCHAR(50) DEFAULT 'Active',
      joining_date DATE DEFAULT CURRENT_DATE,
      avatar TEXT,
      details JSONB,
      applicable_start_date DATE,
      basic_salary NUMERIC,
      gross_salary NUMERIC,
      leave_quota_frequency VARCHAR(50) DEFAULT 'Annually',
      leave_effective_date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_inst_teachers_inst ON institute_teachers(institution_id);
    ALTER TABLE institute_teachers ADD COLUMN IF NOT EXISTS avatar TEXT;
    ALTER TABLE institute_teachers ADD COLUMN IF NOT EXISTS details JSONB;
    ALTER TABLE institute_teachers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE institute_teachers ADD COLUMN IF NOT EXISTS username VARCHAR(255);
    ALTER TABLE institute_teachers ADD COLUMN IF NOT EXISTS assigned_classes TEXT[];
    ALTER TABLE institute_teachers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
    ALTER TABLE institute_teachers ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE;
    ALTER TABLE institute_teachers ADD COLUMN IF NOT EXISTS applicable_start_date DATE;
    ALTER TABLE institute_teachers ADD COLUMN IF NOT EXISTS basic_salary NUMERIC;
    ALTER TABLE institute_teachers ADD COLUMN IF NOT EXISTS gross_salary NUMERIC;
    ALTER TABLE institute_teachers ADD COLUMN IF NOT EXISTS leave_quota_frequency VARCHAR(50) DEFAULT 'Annually';
    ALTER TABLE institute_teachers ADD COLUMN IF NOT EXISTS leave_effective_date DATE;
  `)
}

export async function fetchTeachers() {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureTeachersTable()
    const res = await pool.query(`
      SELECT id, username, name, contact, email, assigned_classes as "assignedClasses", status, 
             TO_CHAR(joining_date, 'DD/MM/YYYY') as "joiningDate"
      FROM institute_teachers
      WHERE institution_id = $1
      ORDER BY created_at DESC
    `, [session.userId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteTeacher(id: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await pool.query(`
      DELETE FROM institute_teachers
      WHERE id = $1 AND institution_id = $2
    `, [id, session.userId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createTeacher(data: any) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureTeachersTable()
    const fullName = `${data.personal?.firstName || ''} ${data.personal?.lastName || ''}`.trim() || data.name || 'New Teacher'
    const username = data.personal?.username || data.username || `TCH${Date.now().toString().slice(-4)}`
    const contact = data.personal?.contact || data.contact || ''
    const email = data.personal?.email || data.email || ''
    const avatar = data.personal?.photo || data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`
    
    // Process assigned classes
    let assignedClasses: string[] = []
    if (Array.isArray(data.classes?.assignedClasses)) {
      assignedClasses = data.classes.assignedClasses
        .filter((c: any) => c && c.class)
        .map((c: any) => `${c.class}${c.section ? ` - Sec ${c.section}` : ''}${c.subject ? ` (${c.subject})` : ''}`)
    } else if (Array.isArray(data.assignedClasses)) {
      assignedClasses = data.assignedClasses
    }
    
    if (assignedClasses.length === 0 && data.classes?.classTeacher?.class) {
      const ct = data.classes.classTeacher
      assignedClasses.push(`${ct.class}${ct.section ? ` - Sec ${ct.section}` : ''}${ct.subject ? ` (${ct.subject})` : ''}`)
    }

    const status = data.personal?.status || data.status || 'Active'
    const joiningDate = data.personal?.joiningDate ? new Date(data.personal.joiningDate) : new Date()
    const applicableStartDate = data.payroll?.applicableStartDate ? new Date(data.payroll.applicableStartDate) : null
    const basicSalary = parseFloat(data.payroll?.basicSalary) || null
    const grossSalary = parseFloat(data.payroll?.grossSalary) || null
    const leaveQuotaFrequency = data.payroll?.leaveQuotaFrequency || 'Annually'
    const leaveEffectiveDate = (data.payroll?.leaveEffectiveDate || data.payroll?.casualLeaveFrom) ? new Date(data.payroll.leaveEffectiveDate || data.payroll.casualLeaveFrom) : null

    const res = await pool.query(`
      INSERT INTO institute_teachers (
        institution_id, username, name, contact, email, assigned_classes, status, joining_date, avatar, details,
        applicable_start_date, basic_salary, gross_salary, leave_quota_frequency, leave_effective_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, username, name, contact, email, assigned_classes as "assignedClasses", status, 
                TO_CHAR(joining_date, 'DD/MM/YYYY') as "joiningDate", avatar
    `, [session.userId, username, fullName, contact, email, assignedClasses, status, joiningDate, avatar, JSON.stringify(data),
        applicableStartDate, basicSalary, grossSalary, leaveQuotaFrequency, leaveEffectiveDate])

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function fetchTeacherById(id: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureTeachersTable()
    const res = await pool.query(`
      SELECT id, username, name, contact, email, assigned_classes as "assignedClasses", status, 
             TO_CHAR(joining_date, 'YYYY-MM-DD') as "joiningDate",
             TO_CHAR(applicable_start_date, 'YYYY-MM-DD') as "applicableStartDate",
             basic_salary as "basicSalary",
             gross_salary as "grossSalary",
             leave_quota_frequency as "leaveQuotaFrequency",
             TO_CHAR(leave_effective_date, 'YYYY-MM-DD') as "leaveEffectiveDate",
             avatar, details
      FROM institute_teachers
      WHERE id = $1 AND institution_id = $2
    `, [id, session.userId])

    if (res.rows.length === 0) {
      return { success: false, error: 'Teacher not found' }
    }

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateTeacher(id: string, data: any) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureTeachersTable()
    const fullName = `${data.personal?.firstName || ''} ${data.personal?.lastName || ''}`.trim() || data.name || 'Teacher'
    const username = data.personal?.username || data.username || ''
    const contact = data.personal?.contact || data.contact || ''
    const email = data.personal?.email || data.email || ''
    const avatar = data.personal?.photo || data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`
    
    // Process assigned classes
    let assignedClasses: string[] = []
    if (Array.isArray(data.classes?.assignedClasses)) {
      assignedClasses = data.classes.assignedClasses
        .filter((c: any) => c && c.class)
        .map((c: any) => `${c.class}${c.section ? ` - Sec ${c.section}` : ''}${c.subject ? ` (${c.subject})` : ''}`)
    } else if (Array.isArray(data.assignedClasses)) {
      assignedClasses = data.assignedClasses
    }
    
    if (assignedClasses.length === 0 && data.classes?.classTeacher?.class) {
      const ct = data.classes.classTeacher
      assignedClasses.push(`${ct.class}${ct.section ? ` - Sec ${ct.section}` : ''}${ct.subject ? ` (${ct.subject})` : ''}`)
    }

    const status = data.personal?.status || data.status || 'Active'
    const joiningDate = data.personal?.joiningDate ? new Date(data.personal.joiningDate) : new Date()
    const applicableStartDate = data.payroll?.applicableStartDate ? new Date(data.payroll.applicableStartDate) : null
    const basicSalary = parseFloat(data.payroll?.basicSalary) || null
    const grossSalary = parseFloat(data.payroll?.grossSalary) || null
    const leaveQuotaFrequency = data.payroll?.leaveQuotaFrequency || 'Annually'
    const leaveEffectiveDate = (data.payroll?.leaveEffectiveDate || data.payroll?.casualLeaveFrom) ? new Date(data.payroll.leaveEffectiveDate || data.payroll.casualLeaveFrom) : null

    const res = await pool.query(`
      UPDATE institute_teachers 
      SET username = $1, 
          name = $2, 
          contact = $3, 
          email = $4, 
          assigned_classes = $5, 
          status = $6, 
          joining_date = $7, 
          avatar = $8, 
          details = $9,
          applicable_start_date = $10,
          basic_salary = $11,
          gross_salary = $12,
          leave_quota_frequency = $13,
          leave_effective_date = $14,
          updated_at = NOW()
      WHERE id = $15 AND institution_id = $16
      RETURNING id, username, name, contact, email, assigned_classes as "assignedClasses", status, 
                TO_CHAR(joining_date, 'DD/MM/YYYY') as "joiningDate", avatar
    `, [username, fullName, contact, email, assignedClasses, status, joiningDate, avatar, JSON.stringify(data),
        applicableStartDate, basicSalary, grossSalary, leaveQuotaFrequency, leaveEffectiveDate, id, session.userId])

    if (res.rows.length === 0) {
      return { success: false, error: 'Teacher not found or unauthorized' }
    }

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}


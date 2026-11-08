'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

async function ensureEmployeesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS institute_staff_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id VARCHAR(255) NOT NULL,
      username VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      contact VARCHAR(50),
      email VARCHAR(255),
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
    CREATE INDEX IF NOT EXISTS idx_inst_staff_inst ON institute_staff_members(institution_id);
    CREATE INDEX IF NOT EXISTS idx_inst_staff_status ON institute_staff_members(status);
    ALTER TABLE institute_staff_members ADD COLUMN IF NOT EXISTS avatar TEXT;
    ALTER TABLE institute_staff_members ADD COLUMN IF NOT EXISTS details JSONB;
    ALTER TABLE institute_staff_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE institute_staff_members ADD COLUMN IF NOT EXISTS username VARCHAR(255);
    ALTER TABLE institute_staff_members ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
    ALTER TABLE institute_staff_members ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE;
    ALTER TABLE institute_staff_members ADD COLUMN IF NOT EXISTS applicable_start_date DATE;
    ALTER TABLE institute_staff_members ADD COLUMN IF NOT EXISTS basic_salary NUMERIC;
    ALTER TABLE institute_staff_members ADD COLUMN IF NOT EXISTS gross_salary NUMERIC;
    ALTER TABLE institute_staff_members ADD COLUMN IF NOT EXISTS leave_quota_frequency VARCHAR(50) DEFAULT 'Annually';
    ALTER TABLE institute_staff_members ADD COLUMN IF NOT EXISTS leave_effective_date DATE;
  `)
}

export async function fetchEmployees() {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureEmployeesTable()
    const res = await pool.query(`
      SELECT 
        id, 
        username, 
        name, 
        role, 
        contact, 
        email, 
        status, 
        TO_CHAR(joining_date, 'DD/MM/YYYY') as "joinDate",
        avatar,
        created_at as "createdAt"
      FROM institute_staff_members
      WHERE institution_id = $1 AND status != 'Deleted'
      ORDER BY created_at DESC
    `, [session.userId])

    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function fetchDeletedEmployees() {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureEmployeesTable()
    const res = await pool.query(`
      SELECT 
        id, 
        username, 
        name, 
        role, 
        contact, 
        email, 
        status, 
        TO_CHAR(joining_date, 'DD/MM/YYYY') as "joinDate",
        avatar,
        created_at as "createdAt"
      FROM institute_staff_members
      WHERE institution_id = $1 AND status = 'Deleted'
      ORDER BY updated_at DESC
    `, [session.userId])

    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteEmployee(id: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureEmployeesTable()
    await pool.query(`
      UPDATE institute_staff_members
      SET status = 'Deleted', updated_at = NOW()
      WHERE id = $1 AND institution_id = $2
    `, [id, session.userId])

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function restoreEmployee(id: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureEmployeesTable()
    await pool.query(`
      UPDATE institute_staff_members
      SET status = 'Active', updated_at = NOW()
      WHERE id = $1 AND institution_id = $2
    `, [id, session.userId])

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function permanentDeleteEmployee(id: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureEmployeesTable()
    await pool.query(`
      DELETE FROM institute_staff_members
      WHERE id = $1 AND institution_id = $2
    `, [id, session.userId])

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createEmployee(data: any) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureEmployeesTable()
    const p = data.personal || data
    const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name || 'New Staff'
    const username = p.staffId || p.username || `EMP${Date.now().toString().slice(-4)}`
    const role = p.role || p.designation || 'Staff'
    const contact = p.contact || p.mobileNo || ''
    const email = p.email || ''
    const status = p.status || 'Active'
    const joiningDate = p.joiningDate ? new Date(p.joiningDate) : new Date()
    const avatar = p.photo || p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`

    const payroll = data.payroll || {}
    const applicableStartDate = payroll.applicableStartDate ? new Date(payroll.applicableStartDate) : null
    const basicSalary = parseFloat(payroll.basicSalary) || null
    const grossSalary = parseFloat(payroll.grossSalary) || null
    const leaveQuotaFrequency = payroll.leaveQuotaFrequency || 'Annually'
    const leaveEffectiveDate = (payroll.leaveEffectiveDate || payroll.casualLeaveFrom) ? new Date(payroll.leaveEffectiveDate || payroll.casualLeaveFrom) : null

    const res = await pool.query(`
      INSERT INTO institute_staff_members (
        institution_id, username, name, role, contact, email, status, joining_date, avatar, details,
        applicable_start_date, basic_salary, gross_salary, leave_quota_frequency, leave_effective_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, username, name, role, contact, email, status, 
                TO_CHAR(joining_date, 'DD/MM/YYYY') as "joinDate", avatar
    `, [session.userId, username, name, role, contact, email, status, joiningDate, avatar, JSON.stringify(data),
        applicableStartDate, basicSalary, grossSalary, leaveQuotaFrequency, leaveEffectiveDate])

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function fetchEmployeeById(id: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureEmployeesTable()
    const res = await pool.query(`
      SELECT 
        id, 
        username, 
        name, 
        role, 
        contact, 
        email, 
        status, 
        TO_CHAR(joining_date, 'YYYY-MM-DD') as "joiningDate",
        TO_CHAR(applicable_start_date, 'YYYY-MM-DD') as "applicableStartDate",
        basic_salary as "basicSalary",
        gross_salary as "grossSalary",
        leave_quota_frequency as "leaveQuotaFrequency",
        TO_CHAR(leave_effective_date, 'YYYY-MM-DD') as "leaveEffectiveDate",
        avatar,
        details
      FROM institute_staff_members
      WHERE id = $1 AND institution_id = $2
    `, [id, session.userId])

    if (res.rows.length === 0) {
      return { success: false, error: 'Employee not found' }
    }

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateEmployee(id: string, data: any) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureEmployeesTable()
    const p = data.personal || data
    const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name || 'Staff'
    const username = p.staffId || p.username || ''
    const role = p.role || p.designation || 'Staff'
    const contact = p.contact || p.mobileNo || ''
    const email = p.email || ''
    const status = p.status || 'Active'
    const joiningDate = p.joiningDate ? new Date(p.joiningDate) : new Date()
    const avatar = p.photo || p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`

    const payroll = data.payroll || {}
    const applicableStartDate = payroll.applicableStartDate ? new Date(payroll.applicableStartDate) : null
    const basicSalary = parseFloat(payroll.basicSalary) || null
    const grossSalary = parseFloat(payroll.grossSalary) || null
    const leaveQuotaFrequency = payroll.leaveQuotaFrequency || 'Annually'
    const leaveEffectiveDate = (payroll.leaveEffectiveDate || payroll.casualLeaveFrom) ? new Date(payroll.leaveEffectiveDate || payroll.casualLeaveFrom) : null

    const res = await pool.query(`
      UPDATE institute_staff_members
      SET username = $1,
          name = $2,
          role = $3,
          contact = $4,
          email = $5,
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
      RETURNING id, username, name, role, contact, email, status, 
                TO_CHAR(joining_date, 'DD/MM/YYYY') as "joinDate", avatar
    `, [username, name, role, contact, email, status, joiningDate, avatar, JSON.stringify(data),
        applicableStartDate, basicSalary, grossSalary, leaveQuotaFrequency, leaveEffectiveDate, id, session.userId])

    if (res.rows.length === 0) {
      return { success: false, error: 'Employee not found or unauthorized' }
    }

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}


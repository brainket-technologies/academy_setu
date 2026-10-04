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
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_inst_staff_inst ON institute_staff_members(institution_id);
    CREATE INDEX IF NOT EXISTS idx_inst_staff_status ON institute_staff_members(status);
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

    const res = await pool.query(`
      INSERT INTO institute_staff_members (institution_id, username, name, role, contact, email, status, joining_date, avatar, details)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, username, name, role, contact, email, status, 
                TO_CHAR(joining_date, 'DD/MM/YYYY') as "joinDate", avatar
    `, [session.userId, username, name, role, contact, email, status, joiningDate, avatar, JSON.stringify(data)])

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}


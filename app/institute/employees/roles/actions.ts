'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

async function ensureRolesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS institute_employee_roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_inst_emp_roles_inst ON institute_employee_roles(institution_id);
  `)
}

export async function fetchEmployeeRoles() {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureRolesTable()
    const res = await pool.query(`
      SELECT 
        id, 
        name, 
        created_at as "createdAt",
        TO_CHAR(created_at, 'DD/MM/YYYY HH12:MI AM') as "formattedCreatedAt"
      FROM institute_employee_roles
      WHERE institution_id = $1
      ORDER BY created_at DESC
    `, [session.userId])

    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createEmployeeRole(name: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  const trimmed = name.trim()
  if (!trimmed) {
    return { success: false, error: 'Role name is required' }
  }

  try {
    await ensureRolesTable()

    // Check duplicate
    const check = await pool.query(`
      SELECT id FROM institute_employee_roles
      WHERE institution_id = $1 AND LOWER(name) = LOWER($2)
      LIMIT 1
    `, [session.userId, trimmed])

    if (check.rows.length > 0) {
      return { success: false, error: 'A role with this name already exists' }
    }

    const res = await pool.query(`
      INSERT INTO institute_employee_roles (institution_id, name)
      VALUES ($1, $2)
      RETURNING id, name, created_at as "createdAt", TO_CHAR(created_at, 'DD/MM/YYYY HH12:MI AM') as "formattedCreatedAt"
    `, [session.userId, trimmed])

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateEmployeeRole(id: string, name: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  const trimmed = name.trim()
  if (!trimmed) {
    return { success: false, error: 'Role name is required' }
  }

  try {
    await ensureRolesTable()

    // Check duplicate excluding self
    const check = await pool.query(`
      SELECT id FROM institute_employee_roles
      WHERE institution_id = $1 AND LOWER(name) = LOWER($2) AND id != $3
      LIMIT 1
    `, [session.userId, trimmed, id])

    if (check.rows.length > 0) {
      return { success: false, error: 'Another role with this name already exists' }
    }

    const res = await pool.query(`
      UPDATE institute_employee_roles
      SET name = $1, updated_at = NOW()
      WHERE id = $2 AND institution_id = $3
      RETURNING id, name, created_at as "createdAt", TO_CHAR(created_at, 'DD/MM/YYYY HH12:MI AM') as "formattedCreatedAt"
    `, [trimmed, id, session.userId])

    if (res.rows.length === 0) {
      return { success: false, error: 'Role not found' }
    }

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteEmployeeRole(id: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await ensureRolesTable()
    await pool.query(`
      DELETE FROM institute_employee_roles
      WHERE id = $1 AND institution_id = $2
    `, [id, session.userId])

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

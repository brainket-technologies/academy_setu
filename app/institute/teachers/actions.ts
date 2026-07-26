'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function fetchTeachers() {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
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

'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function fetchStudents(filters?: any) {
  const session = await getSession('admin_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }
  
  try {
    const res = await pool.query(`
      SELECT * FROM institute_students 
      WHERE institution_id = $1 
      ORDER BY created_at ASC
    `, [session.userId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function moveStudent(id: string, data: { moveTo: string, remark: string, disableLogin: boolean }) {
  const session = await getSession('admin_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await pool.query(`
      UPDATE institute_students 
      SET status = $1, remark = $2, login_disabled = $3
      WHERE id = $4 AND institution_id = $5
    `, [
       data.moveTo,
       data.remark,
       data.disableLogin,
       id,
       session.userId
    ])
    
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

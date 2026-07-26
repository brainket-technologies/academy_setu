'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function fetchLeadStatuses() {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }
  
  try {
    const res = await pool.query(`
      SELECT id, status_name, text_color, bg_color, created_at
      FROM institute_lead_statuses
      WHERE institution_id = $1
      ORDER BY created_at ASC
    `, [session.userId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function saveLeadStatus(data: any) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    if (data.id) {
       return { success: true }
    } else {
       const res = await pool.query(`
         INSERT INTO institute_lead_statuses (
           institution_id, status_name, text_color, bg_color
         ) VALUES ($1, $2, $3, $4) RETURNING id
       `, [
         session.userId, 
         data.statusName, 
         data.textColor, 
         data.bgColor
       ])
       return { success: true, id: res.rows[0].id }
    }
  } catch(err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteLeadStatus(statusId: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await pool.query('DELETE FROM institute_lead_statuses WHERE id = $1 AND institution_id = $2', [statusId, session.userId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

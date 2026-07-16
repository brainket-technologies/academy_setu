'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function fetchLeadSources() {
  const session = await getSession('admin_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }
  
  try {
    const res = await pool.query(`
      SELECT id, category_name, is_user_role, user_role, options, created_at
      FROM institute_lead_sources
      WHERE institution_id = $1
      ORDER BY created_at ASC
    `, [session.userId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function saveLeadSource(data: any) {
  const session = await getSession('admin_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    if (data.id) {
       // Future update implementation
       return { success: true }
    } else {
       const res = await pool.query(`
         INSERT INTO institute_lead_sources (
           institution_id, category_name, is_user_role, user_role, options
         ) VALUES ($1, $2, $3, $4, $5) RETURNING id
       `, [
         session.userId, 
         data.categoryName, 
         data.isUserRole, 
         data.isUserRole ? data.userRole : null,
         data.isUserRole ? null : JSON.stringify(data.options || [])
       ])
       return { success: true, id: res.rows[0].id }
    }
  } catch(err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteLeadSource(sourceId: string) {
  const session = await getSession('admin_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await pool.query('DELETE FROM institute_lead_sources WHERE id = $1 AND institution_id = $2', [sourceId, session.userId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

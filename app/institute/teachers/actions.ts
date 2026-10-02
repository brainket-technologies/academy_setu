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

export async function createTeacher(data: any) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    const fullName = `${data.personal?.firstName || ''} ${data.personal?.lastName || ''}`.trim() || data.name || 'New Teacher'
    const username = data.personal?.username || data.username || `TCH${Date.now().toString().slice(-4)}`
    const contact = data.personal?.contact || data.contact || ''
    const email = data.personal?.email || data.email || ''
    
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

    const res = await pool.query(`
      INSERT INTO institute_teachers (institution_id, username, name, contact, email, assigned_classes, status, joining_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, name, contact, email, assigned_classes as "assignedClasses", status, 
                TO_CHAR(joining_date, 'DD/MM/YYYY') as "joiningDate"
    `, [session.userId, username, fullName, contact, email, assignedClasses, status, joiningDate])

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}


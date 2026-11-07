'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function fetchStudents(filters?: any) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }
  
  try {
    const res = await pool.query(`
      SELECT 
        id,
        institution_id,
        COALESCE(NULLIF(name, ''), TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))) as name,
        COALESCE(first_name, SPLIT_PART(name, ' ', 1)) as first_name,
        COALESCE(last_name, SUBSTRING(name FROM POSITION(' ' IN name) + 1)) as last_name,
        admission_no,
        roll_no,
        class_name,
        section_name,
        contact,
        email,
        status,
        fees_status,
        avatar,
        gender,
        fee,
        remark,
        created_at,
        updated_at
      FROM institute_students 
      WHERE institution_id = $1 
      ORDER BY roll_no ASC, created_at ASC
    `, [session.userId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function moveStudent(id: string, data: { moveTo: string, remark: string, disableLogin: boolean }) {
  const session = await getSession('institute_session')
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

export async function createStudent(data: any) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    const firstName = data.firstName || data.first_name || 'Unknown'
    const lastName = data.lastName || data.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim() || data.name || 'Unknown'

    const res = await pool.query(`
      INSERT INTO institute_students (
        institution_id, name, first_name, last_name, admission_no, roll_no, class_name, section_name, contact, email, status, fees_status, gender, avatar
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `, [
      session.userId,
      fullName,
      firstName,
      lastName,
      data.admissionNo || data.admission_no || `ADM-${Date.now()}`,
      data.rollNo || data.roll_no || '',
      data.class || data.className || data.class_name || '',
      data.section || data.sectionName || data.section_name || '',
      data.mobileNo || data.contact || '',
      data.emailId || data.email || '',
      data.status || 'Active',
      data.fees_status || 'Unpaid',
      data.gender || 'Male',
      data.avatar || ''
    ])
    return { success: true, id: res.rows[0].id }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteStudent(id: string | number) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await pool.query(`
      DELETE FROM institute_students 
      WHERE (id::text = $1::text OR admission_no = $1::text) AND institution_id = $2
    `, [String(id), session.userId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function fetchStudentFees(studentId: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    // 1. Get the total fees assigned to this student in collection records
    const res = await pool.query(`
      SELECT SUM(total_amount) as total_fees, SUM(amount_paid) as total_paid, SUM(discount_amount) as total_discount
      FROM institute_fees_collection
      WHERE institution_id = $1 AND student_id = $2
    `, [session.userId, studentId])

    const data = res.rows[0]
    const total_fees = parseFloat(data.total_fees || 0)
    const total_paid = parseFloat(data.total_paid || 0)
    const total_discount = parseFloat(data.total_discount || 0)
    const due_amount = Math.max(0, total_fees - total_paid - total_discount)

    return { 
      success: true, 
      data: {
        total_fees,
        total_paid,
        total_discount,
        due_amount,
        total_balance: due_amount
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function fetchDraftStudents() {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }
  
  try {
    const res = await pool.query(`
      SELECT * FROM institute_students 
      WHERE institution_id = $1 AND (status = 'Draft' OR status ILIKE '%draft%')
      ORDER BY updated_at DESC, created_at DESC
    `, [session.userId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteDraftStudent(id: string | number) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await pool.query(`
      DELETE FROM institute_students 
      WHERE id = $1 AND institution_id = $2
    `, [id, session.userId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

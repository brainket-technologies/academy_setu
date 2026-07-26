'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function fetchLeads(filters?: any) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }
  
  try {
    let query = `
      SELECT id, first_name, last_name, mobile_no, father_name, admission_class, 
             scheduled_at, assigned_to, status, remark, created_at, source
      FROM institute_enquiries
      WHERE institution_id = $1
      ORDER BY created_at DESC
    `
    const res = await pool.query(query, [session.userId])
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function saveLead(data: any) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    if (data.id) {
       // For future edit functionality of the entire lead
       return { success: true }
    } else {
       const res = await pool.query(`
         INSERT INTO institute_enquiries (
           institution_id, admission_class, source, referred_by,
           first_name, last_name, mobile_no, email_id, dob, gender,
           nationality, religion, category, aadhar_no,
           father_name, father_contact_no, father_occupation, father_annual_income,
           mother_name, mother_contact_no, mother_occupation, mother_annual_income,
           address, state, district, pincode, status, remark,
           previous_school_name, previous_attended_class, previous_school_affiliated_to,
           other_qualifications
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
           $11, $12, $13, $14, $15, $16, $17, $18,
           $19, $20, $21, $22, $23, $24, $25, $26,
           $27, $28, $29, $30, $31, $32
         ) RETURNING id
       `, [
         session.userId, data.admissionClass, data.source, data.referredBy,
         data.firstName, data.lastName, data.mobileNo, data.emailId, data.dob || null, data.gender,
         data.nationality, data.religion, data.category, data.aadharNo,
         data.fatherName, data.fatherContact, data.fatherOccupation, data.fatherIncome,
         data.motherName, data.motherContact, data.motherOccupation, data.motherIncome,
         data.address, data.state, data.district, data.pincode, data.status || 'Active', data.remark,
         data.prevSchoolName, data.prevClass, data.prevAffiliation,
         JSON.stringify(data.otherQualifications || [])
       ])
       return { success: true, id: res.rows[0].id }
    }
  } catch(err: any) {
    return { success: false, error: err.message }
  }
}

export async function addFollowup(leadId: string, data: any) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
     await pool.query(`
       INSERT INTO institute_enquiry_followups (
         enquiry_id, communication_option, call_duration, remarks, follow_up_date, status
       ) VALUES ($1, $2, $3, $4, $5, $6)
     `, [
       leadId, data.communicationOption, data.callDuration, data.remarks, data.followUpDate || null, data.status
     ])

     await pool.query(`
       UPDATE institute_enquiries 
       SET status = COALESCE($1, status), remark = COALESCE($2, remark), scheduled_at = $3
       WHERE id = $4 AND institution_id = $5
     `, [data.status, data.remarks, data.followUpDate || null, leadId, session.userId])

     return { success: true }
  } catch (err: any) {
     return { success: false, error: err.message }
  }
}

export async function deleteLead(leadId: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await pool.query('DELETE FROM institute_enquiries WHERE id = $1 AND institution_id = $2', [leadId, session.userId])
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

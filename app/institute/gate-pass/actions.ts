'use server'

import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function createOneTimeGatePass(data: {
  passType: 'one-time' | 'permanent'
  userType: 'Student' | 'Visitor'
  // Student fields
  studentName?: string
  className?: string
  sectionName?: string
  rollNo?: string
  parentsMobile?: string
  // Receiver fields
  receiverName?: string
  receiverMobile?: string
  receiverRelation?: string
  // Aadhar (permanent only)
  aadharNo?: string
  aadharFrontUrl?: string
  aadharBackUrl?: string
  validFrom?: string
  validTo?: string
  // Visitor fields
  visitorName?: string
  visitorMobile?: string
  // Common
  vehicleNo?: string
  entryGate?: string
  exitGate?: string
  reason?: string
  remarks?: string
  visitDate?: string
  visitTime?: string
  photoUrl?: string
}) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    const isStudent = data.userType === 'Student'
    const res = await pool.query(`
      INSERT INTO institute_gate_passes (
        institution_id, pass_type, user_type,
        visitor_name, contact, purpose, to_meet,
        student_name, class_name, section_name, roll_no, parents_mobile,
        receiver_name, receiver_mobile, receiver_relation,
        aadhar_no, aadhar_front_url, aadhar_back_url,
        valid_from, valid_to,
        vehicle_no, entry_gate, exit_gate, reason, remarks,
        visit_date, visit_time, photo_url,
        status, check_in
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15,
        $16, $17, $18,
        $19, $20,
        $21, $22, $23, $24, $25,
        $26, $27, $28,
        'Active', NOW()
      )
      RETURNING id
    `, [
      session.userId,
      data.passType || 'one-time',
      data.userType,
      isStudent ? data.studentName : data.visitorName,
      isStudent ? data.parentsMobile : data.visitorMobile,
      data.reason || '',
      isStudent ? data.receiverName : '',
      data.studentName || null,
      data.className || null,
      data.sectionName || null,
      data.rollNo || null,
      data.parentsMobile || null,
      data.receiverName || null,
      data.receiverMobile || null,
      data.receiverRelation || null,
      data.aadharNo || null,
      data.aadharFrontUrl || null,
      data.aadharBackUrl || null,
      data.validFrom || null,
      data.validTo || null,
      data.vehicleNo || null,
      data.entryGate || null,
      data.exitGate || null,
      data.reason || null,
      data.remarks || null,
      data.visitDate || null,
      data.visitTime || null,
      data.photoUrl || null
    ])

    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function fetchGatePasses(passType?: 'one-time' | 'permanent') {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    const params: any[] = [session.userId]
    let query = `
      SELECT * FROM institute_gate_passes
      WHERE institution_id = $1
    `
    if (passType) {
      params.push(passType)
      query += ` AND pass_type = $${params.length}`
    }
    query += ` ORDER BY created_at DESC`

    const res = await pool.query(query, params)
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteGatePass(id: string) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    await pool.query(
      `DELETE FROM institute_gate_passes WHERE id = $1 AND institution_id = $2`,
      [id, session.userId]
    )
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ── ENTRY ACTIONS ──

export async function createGatePassEntry(data: {
  passId?: string
  passType: 'one-time' | 'permanent'
  userType: 'Student' | 'Visitor'
  studentName?: string
  className?: string
  sectionName?: string
  rollNo?: string
  receiverName?: string
  receiverMobile?: string
  receiverRelation?: string
  livePhotoUrl?: string
  visitDate?: string
  visitTime?: string
  entryGate?: string
  exitGate?: string
  vehicleNo?: string
  reason?: string
  remarks?: string
  verificationStatus?: boolean
}) {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    const res = await pool.query(`
      INSERT INTO institute_gate_pass_entries (
        institution_id, pass_id, pass_type, user_type,
        student_name, class_name, section_name, roll_no,
        receiver_name, receiver_mobile, receiver_relation,
        live_photo_url, visit_date, visit_time,
        entry_gate, exit_gate, vehicle_no,
        reason, remarks, verification_status,
        status, check_in
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, $11,
        $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20,
        'Checked-In', NOW()
      )
      RETURNING id
    `, [
      session.userId,
      data.passId || null,
      data.passType,
      data.userType,
      data.studentName || null,
      data.className || null,
      data.sectionName || null,
      data.rollNo || null,
      data.receiverName || null,
      data.receiverMobile || null,
      data.receiverRelation || null,
      data.livePhotoUrl || null,
      data.visitDate || null,
      data.visitTime || null,
      data.entryGate || null,
      data.exitGate || null,
      data.vehicleNo || null,
      data.reason || null,
      data.remarks || null,
      data.verificationStatus || false
    ])
    return { success: true, data: res.rows[0] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function fetchGatePassEntries() {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    const res = await pool.query(
      `SELECT * FROM institute_gate_pass_entries WHERE institution_id = $1 ORDER BY created_at DESC`,
      [session.userId]
    )
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function fetchRegisteredPasses(passType: 'permanent' | 'one-time') {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }

  try {
    const res = await pool.query(
      `SELECT * FROM institute_gate_passes WHERE institution_id = $1 AND pass_type = $2 ORDER BY created_at DESC`,
      [session.userId, passType]
    )
    return { success: true, data: res.rows }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const query = `
      SELECT 
        r.*, 
        COALESCE(i.name, r.school_name, 'Institution') as school_name, 
        i.code as school_code,
        i.contact_person,
        i.mobile_no,
        i.email_id,
        i.address,
        i.state,
        i.district,
        i.pincode,
        i.affiliated_to,
        i.affiliation_code,
        i.principal_name,
        i.director_name,
        i.status as institute_status,
        COALESCE(p.segment, s.name, 'School') as segment,
        p.plan_name
      FROM requests r
      LEFT JOIN institutions i ON (r.institution_id = i.id OR (r.institution_id IS NULL AND i.name ILIKE r.school_name))
      LEFT JOIN segments s ON i.segment_id = s.id
      LEFT JOIN plans p ON r.plan_id = p.id
      WHERE r.id = $1
    `
    const result = await pool.query(query, [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, transaction_amount } = body

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 })
    }

    // 1. Fetch current request details
    const reqRes = await pool.query('SELECT * FROM requests WHERE id = $1', [id])
    if (reqRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 })
    }
    const currentReq = reqRes.rows[0]

    // Block modification if request is already accepted
    if (currentReq.status === 'Accept' || currentReq.status === 'Accepted' || currentReq.status === 'Approved') {
      return NextResponse.json({
        success: false,
        error: 'This request has already been accepted and its status cannot be changed.'
      }, { status: 400 })
    }

    // 2. Update the request status and transaction amount
    const updatedRes = await pool.query(
      `UPDATE requests 
       SET status = $1, transaction_amount = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, parseFloat(transaction_amount || '0'), id]
    )

    const updatedReq = updatedRes.rows[0]

    // 3. If accepted, sync/insert into the bills table and activate institution plan instantly
    if (status === 'Accept' || status === 'Accepted' || status === 'Approved') {
      let schoolName = currentReq.school_name
      let planName = currentReq.plan_name
      let institutionId = currentReq.institution_id

      if (!institutionId && schoolName) {
        const instFind = await pool.query('SELECT id FROM institutions WHERE name = $1 LIMIT 1', [schoolName])
        if (instFind.rows.length > 0) {
          institutionId = instFind.rows[0].id
        }
      }

      if ((!schoolName || !planName) && institutionId) {
        const instRes = await pool.query('SELECT name FROM institutions WHERE id = $1', [institutionId])
        if (instRes.rows.length > 0) schoolName = instRes.rows[0].name
      }

      if (!planName && currentReq.plan_id) {
        const planRes = await pool.query('SELECT plan_name, segment FROM plans WHERE id = $1', [currentReq.plan_id])
        if (planRes.rows.length > 0) planName = planRes.rows[0].plan_name
      }

      const planRes = await pool.query(
        'SELECT id, segment, segment_id FROM plans WHERE id = $1 OR plan_name = $2 LIMIT 1',
        [currentReq.plan_id, planName]
      )
      const planId = planRes.rows.length > 0 ? planRes.rows[0].id : currentReq.plan_id
      const segment = planRes.rows.length > 0 ? planRes.rows[0].segment : 'School'
      const segmentId = planRes.rows.length > 0 ? planRes.rows[0].segment_id : null

      const finalAmount = parseFloat(transaction_amount || currentReq.amount || '0')

      // Insert/Update Bills table
      const billCheck = await pool.query(
        "SELECT id, bill_type FROM bills WHERE (transaction_id = $1 AND transaction_id != '') OR (institution_id = $2 AND status = 'Pending') LIMIT 1",
        [currentReq.transaction_id || '', institutionId]
      )

      const requestType = currentReq.request_type || (currentReq.is_renewal ? 'renew' : 'new')

      if (billCheck.rows.length === 0) {
        await pool.query(
          `INSERT INTO bills (school_name, plan_name, payment_mode, payment_date, amount, transaction_id, status, institution_id, plan_id, bill_type)
           VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, 'Paid', $6, $7, $8)`,
          [
            schoolName || 'Institution',
            planName || 'Standard Plan',
            currentReq.payment_mode || 'Payment Gateway',
            finalAmount,
            currentReq.transaction_id || '',
            institutionId,
            planId,
            requestType
          ]
        )
      } else {
        await pool.query(
          `UPDATE bills SET 
            amount = $1, 
            status = 'Paid', 
            payment_date = CURRENT_DATE, 
            institution_id = COALESCE(institution_id, $3), 
            plan_id = COALESCE(plan_id, $4),
            bill_type = COALESCE($6, bill_type, 'new')
           WHERE id = $2 OR (transaction_id = $5 AND $5 != '')`,
          [
            finalAmount, 
            billCheck.rows[0].id, 
            institutionId, 
            planId,
            currentReq.transaction_id || '',
            requestType
          ]
        )
      }

      // INSTANT PLAN ACTIVATION FOR INSTITUTION
      if (institutionId) {
        await pool.query(
          `UPDATE institutions 
           SET status = 'Active', 
               segment_id = COALESCE($1, segment_id),
               updated_at = NOW() 
           WHERE id = $2`,
          [segmentId, institutionId]
        )

        await pool.query(
          `UPDATE applications 
           SET status = 'Completed', 
               enquiry_status = 'Successfully Onboarded',
               plan_id = COALESCE($1, plan_id),
               payment_mode = COALESCE($2, payment_mode),
               amount = CASE WHEN $3::numeric > 0 THEN $3::numeric ELSE amount END,
               updated_at = NOW()
           WHERE institution_id = $4`,
          [planId, currentReq.payment_mode, finalAmount, institutionId]
        )
      }
    } else if (status === 'Reject' || status === 'Rejected') {
      const billCheck = await pool.query('SELECT id FROM bills WHERE transaction_id = $1 AND transaction_id != \'\' LIMIT 1', [currentReq.transaction_id || ''])
      if (billCheck.rows.length > 0) {
        await pool.query(
          `UPDATE bills SET status = 'Failed' WHERE id = $1`,
          [billCheck.rows[0].id]
        )
      }
    }

    return NextResponse.json({ success: true, data: updatedReq })
  } catch (error) {
    console.error('Request update error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

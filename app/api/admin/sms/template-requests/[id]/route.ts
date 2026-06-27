import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureShopDb()
    const { id } = await context.params

    const requestResult = await pool.query('SELECT * FROM sms_template_requests WHERE id = $1', [id])
    if (requestResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 })
    }

    const historyResult = await pool.query(
      'SELECT * FROM sms_template_request_history WHERE request_id = $1 ORDER BY created_at DESC',
      [id]
    )

    const data = {
      ...requestResult.rows[0],
      history: historyResult.rows
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Fetch template request detail error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureShopDb()
    const { id } = await context.params
    const body = await request.json()
    const { assigned_to, communication_option, call_duration, remarks, follow_up_date, status } = body

    // 1. If updating assigned_to only
    if (assigned_to !== undefined) {
      const result = await pool.query(
        'UPDATE sms_template_requests SET assigned_to = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [assigned_to, id]
      )
      return NextResponse.json({ success: true, data: result.rows[0] })
    }

    // 2. Otherwise update timeline request details and logs
    await pool.query(
      `INSERT INTO sms_template_request_history (request_id, communication_option, call_duration, remarks, follow_up_date, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, communication_option, call_duration || '', remarks, follow_up_date || null, status]
    )

    const updatedRequest = await pool.query(
      `UPDATE sms_template_requests 
       SET status = $1, remarks = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, remarks, id]
    )

    return NextResponse.json({ success: true, data: updatedRequest.rows[0] })
  } catch (error) {
    console.error('Update template request error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

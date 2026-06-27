import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query('SELECT * FROM requests WHERE id = $1', [id])
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

    // 2. Update the request status and transaction amount
    const updatedRes = await pool.query(
      `UPDATE requests 
       SET status = $1, transaction_amount = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, parseFloat(transaction_amount || '0'), id]
    )

    const updatedReq = updatedRes.rows[0]

    // 3. If accepted, sync/insert into the bills table
    if (status === 'Accept') {
      const planRes = await pool.query('SELECT segment FROM plans WHERE plan_name = $1 LIMIT 1', [currentReq.plan_name])
      const segment = planRes.rows.length > 0 ? planRes.rows[0].segment : 'School'

      const billCheck = await pool.query('SELECT id FROM bills WHERE transaction_id = $1 LIMIT 1', [currentReq.transaction_id])
      if (billCheck.rows.length === 0) {
        await pool.query(
          `INSERT INTO bills (segment, school_name, plan_name, payment_mode, payment_date, amount, transaction_id, status)
           VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, 'Paid')`,
          [
            segment,
            currentReq.school_name,
            currentReq.plan_name,
            currentReq.payment_mode,
            parseFloat(transaction_amount || currentReq.amount),
            currentReq.transaction_id
          ]
        )
      } else {
        // Update existing bill amount if it already exists
        await pool.query(
          `UPDATE bills SET amount = $1, status = 'Paid' WHERE transaction_id = $2`,
          [parseFloat(transaction_amount || currentReq.amount), currentReq.transaction_id]
        )
      }
    }

    return NextResponse.json({ success: true, data: updatedReq })
  } catch (error) {
    console.error('Request update error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

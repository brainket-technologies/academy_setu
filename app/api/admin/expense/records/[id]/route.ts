import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    const query = `DELETE FROM expense_records WHERE id = $1 RETURNING *`
    const result = await pool.query(query, [id])

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully'
    })
  } catch (error) {
    console.error('Delete expense record error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      trans_id,
      expense_category,
      amount,
      payment_mode,
      expense_date,
      paid_by,
      paid_to,
      payment_account,
      received_by,
      approved_by,
      photo_url,
      status
    } = body

    if (!expense_category || !amount || !payment_mode || !expense_date || !paid_by || !paid_to) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const query = `
      UPDATE expense_records
      SET trans_id = $1,
          expense_category = $2,
          amount = $3,
          payment_mode = $4,
          expense_date = $5,
          paid_by = $6,
          paid_to = $7,
          payment_account = $8,
          received_by = $9,
          approved_by = $10,
          photo_url = $11,
          status = $12,
          updated_at = NOW()
      WHERE id = $13
      RETURNING *
    `
    const result = await pool.query(query, [
      trans_id || '',
      expense_category,
      amount,
      payment_mode,
      expense_date,
      paid_by,
      paid_to,
      payment_account || '',
      received_by || '',
      approved_by || '',
      photo_url || '',
      status || 'Paid',
      id
    ])

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Update expense record error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

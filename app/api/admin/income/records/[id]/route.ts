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

    const query = `DELETE FROM income_records WHERE id = $1 RETURNING *`
    const result = await pool.query(query, [id])

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully'
    })
  } catch (error) {
    console.error('Delete income record error:', error)
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
      income_category,
      amount,
      payment_mode,
      received_date,
      received_from,
      payment_account,
      session_name,
      photo_url,
      status
    } = body

    if (!income_category || !amount || !payment_mode || !received_date || !received_from) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const query = `
      UPDATE income_records
      SET trans_id = $1,
          income_category = $2,
          amount = $3,
          payment_mode = $4,
          received_date = $5,
          received_from = $6,
          payment_account = $7,
          session_name = $8,
          photo_url = $9,
          status = $10,
          updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `
    const result = await pool.query(query, [
      trans_id || '',
      income_category,
      amount,
      payment_mode,
      received_date,
      received_from,
      payment_account || '',
      session_name || '',
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
    console.error('Update income record error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

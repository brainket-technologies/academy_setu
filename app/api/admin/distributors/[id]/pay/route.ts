import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET transaction history for a specific distributor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await pool.query(
      `SELECT * FROM distributor_payments WHERE distributor_id = $1 ORDER BY created_at DESC`,
      [id]
    )
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// POST - record a payment to a distributor
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { amount, payment_mode, transaction_id, remarks } = body

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ success: false, error: 'Valid amount is required' }, { status: 400 })
    }
    if (!payment_mode) {
      return NextResponse.json({ success: false, error: 'Payment mode is required' }, { status: 400 })
    }

    const distResult = await pool.query('SELECT name FROM distributors WHERE id = $1', [id])
    if (distResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Distributor not found' }, { status: 404 })
    }
    const distributorName = distResult.rows[0].name

    // Generate a transaction ID if not provided
    const txnId = transaction_id || `TXN${Date.now().toString(36).toUpperCase()}`

    const result = await pool.query(
      `INSERT INTO distributor_payments (distributor_id, distributor_name, amount, payment_date, payment_mode, transaction_id, status, remarks)
       VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, 'Paid', $6)
       RETURNING *`,
      [id, distributorName, parseFloat(amount), payment_mode, txnId, remarks || '']
    )

    // Update distributor updated_at
    await pool.query('UPDATE distributors SET updated_at = NOW() WHERE id = $1', [id])

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Distributor pay error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

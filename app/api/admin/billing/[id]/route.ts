import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query('SELECT * FROM bills WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Bill not found' }, { status: 404 })
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
    const { segment, school_name, plan_name, payment_mode, payment_date, amount, transaction_id, status } = body

    const result = await pool.query(
      `UPDATE bills SET
        segment = COALESCE($1, segment),
        school_name = COALESCE($2, school_name),
        plan_name = COALESCE($3, plan_name),
        payment_mode = COALESCE($4, payment_mode),
        payment_date = COALESCE($5, payment_date),
        amount = COALESCE($6, amount),
        transaction_id = COALESCE($7, transaction_id),
        status = COALESCE($8, status),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [
        segment,
        school_name,
        plan_name,
        payment_mode,
        payment_date,
        amount != null ? parseFloat(amount) : undefined,
        transaction_id,
        status,
        id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Bill not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query('DELETE FROM bills WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Bill not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

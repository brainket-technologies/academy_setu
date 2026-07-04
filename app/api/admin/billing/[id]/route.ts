import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query(`
      SELECT b.*, i.name as school_name, p.plan_name
      FROM bills b
      LEFT JOIN institutions i ON b.institution_id = i.id
      LEFT JOIN plans p ON b.plan_id = p.id
      WHERE b.id = $1
    `, [id])
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
    const { institution_id, plan_id, payment_mode, payment_date, amount, transaction_id, status } = body

    const result = await pool.query(
      `UPDATE bills SET
        institution_id = COALESCE($1, institution_id),
        plan_id = COALESCE($2, plan_id),
        payment_mode = COALESCE($3, payment_mode),
        payment_date = COALESCE($4, payment_date),
        amount = COALESCE($5, amount),
        transaction_id = COALESCE($6, transaction_id),
        status = COALESCE($7, status),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *`,
      [
        institution_id,
        plan_id,
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
    return NextResponse.json({ success: true, message: 'Bill deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

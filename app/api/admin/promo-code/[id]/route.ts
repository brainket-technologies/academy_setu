import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query('SELECT * FROM promo_codes WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Promo code not found' }, { status: 404 })
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
    const { code, description, segment, applicable_by, applicable_one, discount_name, discount_type, discount_value, max_uses, start_date, has_expiry, expiry_date, status } = body

    const result = await pool.query(
      `UPDATE promo_codes SET
        code = COALESCE($1, code),
        description = COALESCE($2, description),
        segment = COALESCE($3, segment),
        applicable_by = COALESCE($4, applicable_by),
        applicable_one = COALESCE($5, applicable_one),
        discount_name = COALESCE($6, discount_name),
        discount_type = COALESCE($7, discount_type),
        discount_value = COALESCE($8, discount_value),
        max_uses = COALESCE($9, max_uses),
        start_date = COALESCE($10, start_date),
        has_expiry = COALESCE($11, has_expiry),
        expiry_date = CASE WHEN $12::boolean THEN $13 ELSE expiry_date END,
        status = COALESCE($14, status),
        updated_at = NOW()
      WHERE id = $15
      RETURNING *`,
      [
        code ? code.toUpperCase() : undefined,
        description,
        segment,
        applicable_by,
        applicable_one,
        discount_name,
        discount_type,
        discount_value,
        max_uses != null ? max_uses : undefined,
        start_date || null,
        has_expiry,
        has_expiry,
        has_expiry ? (expiry_date || null) : null,
        status,
        id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Promo code not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query('DELETE FROM promo_codes WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Promo code not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

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
    const result = await pool.query('SELECT * FROM device_recharge_requests WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Fetch recharge request error:', error)
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
    const { start_date, end_date, verified } = body

    const result = await pool.query(
      `UPDATE device_recharge_requests 
       SET start_date = $1, end_date = $2, verified = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING *`,
      [start_date || null, end_date || null, verified === true, id]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Update recharge request error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

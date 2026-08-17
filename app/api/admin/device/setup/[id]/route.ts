import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureShopDb()
    const { id } = await context.params
    const body = await request.json()
    const { name, model } = body

    if (!name || !model) {
      return NextResponse.json({ success: false, error: 'Name and model are required' }, { status: 400 })
    }

    const result = await pool.query(
      `UPDATE device_setup SET name = $1, model = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [name, model, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Update device setup error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureShopDb()
    const { id } = await context.params

    const result = await pool.query(
      `DELETE FROM device_setup WHERE id = $1 RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Delete device setup error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

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
    const { 
      name, duration_type, duration, amount, tax_percent, status,
      brand, device_type, device_name, imei_no, description, plan_description, image_url
    } = body

    const taxPercent = parseFloat(String(tax_percent || '18'))
    const amt = parseFloat(String(amount))
    const total = amt + (amt * (taxPercent / 100))

    const result = await pool.query(
      `UPDATE device_plans 
       SET name = $1, duration_type = $2, duration = $3, amount = $4, tax_percent = $5, total_amount = $6, status = $7,
           brand = $8, device_type = $9, device_name = $10, imei_no = $11, description = $12, plan_description = $13, image_url = $14
       WHERE id = $15 
       RETURNING *`,
      [
        name, duration_type, parseInt(String(duration)), amt, taxPercent, total, status,
        brand, device_type, device_name, imei_no, description, plan_description, image_url,
        id
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Update plan error:', error)
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
    await pool.query('DELETE FROM device_plans WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete plan error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

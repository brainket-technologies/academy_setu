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
    const { status, school_name, mobile_no, email, sms_quantity, amount } = body

    if (status) {
      // Just update status
      const result = await pool.query(
        `UPDATE sms_orders 
         SET status = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [status, id]
      )
      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'SMS order not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: result.rows[0] })
    }

    // Otherwise update full record
    const result = await pool.query(
      `UPDATE sms_orders
       SET school_name = $1, mobile_no = $2, email = $3, sms_quantity = $4, amount = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [school_name, mobile_no, email, parseInt(sms_quantity), parseFloat(amount), id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'SMS order not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Update SMS order error:', error)
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

    const result = await pool.query('DELETE FROM sms_orders WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'SMS order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'SMS order deleted successfully' })
  } catch (error) {
    console.error('Delete SMS order error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

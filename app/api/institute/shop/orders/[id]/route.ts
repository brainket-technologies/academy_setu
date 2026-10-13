import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureShopDb()
    const { id } = await params
    const body = await request.json()
    const { status = 'Order Generated' } = body

    const result = await pool.query(`
      UPDATE product_dispatches 
      SET status = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *,
        TO_CHAR(dispatch_date, 'DD/MM/YYYY') as dispatch_date_formatted,
        TO_CHAR(created_at, 'DD/MM/YYYY') as created_at_formatted
    `, [status, id])

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    const row = result.rows[0]
    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        productName: row.product_name,
        quantity: row.quantity,
        perPiecePrice: parseFloat(row.price),
        totalPrice: parseFloat(row.price) * parseInt(row.quantity),
        tax: `${row.tax_percent}%`,
        finalAmount: parseFloat(row.total_amount),
        updatedAt: row.created_at_formatted || row.dispatch_date_formatted,
        status: row.status,
        size: row.size,
        productDescription: row.product_description,
        name: row.name,
        mobile: row.mobile_no,
        address: row.address
      }
    })
  } catch (error: any) {
    console.error('Update shop order error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

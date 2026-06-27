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

    const result = await pool.query('SELECT * FROM product_dispatches WHERE id = $1 LIMIT 1', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Dispatch record not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Fetch dispatch error:', error)
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
    const { 
      school_name, address, name, mobile_no, product_name, 
      product_description, quantity, size, product_as, dispatch_date, status,
      price, tax_percent, total_amount, courier_name, courier_id
    } = body

    if (!school_name || !address || !name || !mobile_no || !product_name || !quantity || !status) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const result = await pool.query(
      `UPDATE product_dispatches 
       SET school_name = $1, address = $2, name = $3, mobile_no = $4, product_name = $5, 
           product_description = $6, quantity = $7, size = $8, product_as = $9, dispatch_date = $10, status = $11,
           price = $12, tax_percent = $13, total_amount = $14, courier_name = $15, courier_id = $16, updated_at = NOW()
       WHERE id = $17
       RETURNING *`,
      [
        school_name,
        address,
        name,
        mobile_no,
        product_name,
        product_description || '',
        parseInt(quantity),
        size || '',
        product_as || 'Gift',
        dispatch_date || new Date().toISOString().split('T')[0],
        status,
        parseFloat(price) || 0,
        parseFloat(tax_percent) || 0,
        parseFloat(total_amount) || 0,
        courier_name || '',
        courier_id || '',
        id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Dispatch record not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Update dispatch error:', error)
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

    const result = await pool.query('DELETE FROM product_dispatches WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Dispatch record not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Dispatch record deleted successfully' })
  } catch (error) {
    console.error('Delete dispatch error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

// Next.js App Router dynamic route config - Next.js 16 requires dynamic params to be resolved.
// In Next.js, context parameters are passed as promise in dynamic route segment handlers.
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureShopDb()
    const { id } = await context.params

    const result = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Fetch product error:', error)
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
    const { name, description, images, mrp_price, sell_price, colors, sizes, features } = body

    if (!name || !description || mrp_price === undefined || sell_price === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const result = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, images = $3, mrp_price = $4, sell_price = $5, colors = $6, sizes = $7, features = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        name,
        description,
        images || [],
        mrp_price,
        sell_price,
        colors || [],
        sizes || [],
        features || [],
        id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Update product error:', error)
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

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

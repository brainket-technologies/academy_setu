import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function GET(request: NextRequest) {
  try {
    await ensureShopDb()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let query = 'SELECT * FROM products'
    const params: any[] = []

    if (search) {
      query += ' WHERE name ILIKE $1 OR description ILIKE $1'
      params.push(`%${search}%`)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Fetch products error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureShopDb()
    const body = await request.json()
    const { name, description, images, mrp_price, sell_price, colors, sizes, features } = body

    if (!name || !description || mrp_price === undefined || sell_price === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, images, mrp_price, sell_price, colors, sizes, features)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name,
        description,
        images || [],
        mrp_price,
        sell_price,
        colors || [],
        sizes || [],
        features || []
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

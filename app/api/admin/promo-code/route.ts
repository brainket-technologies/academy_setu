import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    let query = 'SELECT * FROM promo_codes'
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(code ILIKE $${params.length} OR description ILIKE $${params.length})`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)')
    const countResult = await pool.query(countQuery, params)
    const totalCount = parseInt(countResult.rows[0].count)

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(pageSize, offset)

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: { totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) }
    })
  } catch (error) {
    console.error('Promo code list error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, description, segment, applicable_by, applicable_one, discount_name, discount_type, discount_value, max_uses, start_date, has_expiry, expiry_date } = body

    if (!code || !discount_type || discount_value == null) {
      return NextResponse.json({ success: false, error: 'Code, Discount Type, and Discount Value are required' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO promo_codes (code, description, segment, applicable_by, applicable_one, discount_name, discount_type, discount_value, max_uses, start_date, has_expiry, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        code.toUpperCase(),
        description || '',
        segment || '',
        applicable_by || '',
        applicable_one || false,
        discount_name || '',
        discount_type,
        discount_value,
        max_uses || 0,
        start_date || null,
        has_expiry || false,
        has_expiry ? (expiry_date || null) : null
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Promo code create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

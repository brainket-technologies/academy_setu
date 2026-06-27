import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryType = searchParams.get('category_type') || ''
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('start_date') || ''
    const endDate = searchParams.get('end_date') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)

    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 0

    if (categoryType) {
      paramIndex++
      conditions.push(`category_type = $${paramIndex}`)
      params.push(categoryType)
    }

    if (search) {
      paramIndex++
      conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
    }

    if (startDate) {
      paramIndex++
      conditions.push(`created_at >= $${paramIndex}`)
      params.push(startDate)
    }

    if (endDate) {
      paramIndex++
      conditions.push(`created_at <= $${paramIndex}::date + interval '1 day' - interval '1 second'`)
      params.push(endDate)
    }

    let query = 'SELECT * FROM income_categories'
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    query += ' ORDER BY created_at DESC'

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)')
    const countResult = await pool.query(countQuery, params)
    const totalCount = parseInt(countResult.rows[0].count, 10)

    const offset = (page - 1) * pageSize
    query += ` LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`
    params.push(pageSize, offset)

    const result = await pool.query(query, params)
    return NextResponse.json({
      success: true,
      data: result.rows,
      totalCount
    })
  } catch (error) {
    console.error('Fetch income categories error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category_type } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 })
    }

    const query = `
      INSERT INTO income_categories (name, description, category_type)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const result = await pool.query(query, [name, description || '', category_type || 'Income'])
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Create income category error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

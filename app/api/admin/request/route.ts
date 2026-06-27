import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    let query = 'SELECT * FROM requests'
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(school_name ILIKE $${params.length} OR transaction_id ILIKE $${params.length})`)
    }

    if (status) {
      params.push(status)
      conditions.push(`status = $${params.length}`)
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
    console.error('Request list error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { school_name, plan_name, payment_mode, transaction_id, amount, status, screenshots } = body

    if (!school_name || !plan_name || !payment_mode || !amount) {
      return NextResponse.json({ success: false, error: 'School Name, Plan Name, Payment Mode, and Amount are required' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO requests (school_name, plan_name, payment_mode, transaction_id, amount, status, screenshots)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        school_name,
        plan_name,
        payment_mode,
        transaction_id || '',
        parseFloat(amount),
        status || 'Pending',
        JSON.stringify(screenshots || [])
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Request create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let query = 'SELECT * FROM lead_statuses'
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`name ILIKE $${params.length}`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    const countResult = await pool.query(
      `SELECT COUNT(*)::int FROM (${query}) as count_table`,
      params
    )
    const totalCount = countResult.rows[0].count

    query += ' ORDER BY COALESCE(order_index, 0) ASC, created_at ASC'

    const result = await pool.query(query, params)

    return NextResponse.json({ success: true, data: result.rows, meta: { totalCount } })
  } catch (error) {
    console.error('Lead status fetch error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, text_color, bg_color, show_on_bdm, order_index } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Status Name is required' }, { status: 400 })
    }

    const maxOrderRes = await pool.query('SELECT COALESCE(MAX(order_index), 0) as max_order FROM lead_statuses')
    const finalOrder = order_index !== undefined ? Number(order_index) : (Number(maxOrderRes.rows[0]?.max_order || 0) + 1)

    const result = await pool.query(
      `INSERT INTO lead_statuses (name, text_color, bg_color, show_on_bdm, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, text_color || '#333333', bg_color || '#F3F4F6', show_on_bdm !== false, finalOrder]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Lead status create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

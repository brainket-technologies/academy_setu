import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    let query = `SELECT * FROM referrals`
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (status) {
      params.push(status)
      conditions.push(`status = $${params.length}`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    const countQuery = `SELECT COUNT(*)::int FROM (` + query + `) as count_table`
    const countResult = await pool.query(countQuery, params)
    const totalCount = countResult.rows[0].count

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(pageSize, offset)

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: {
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    console.error('Referrals fetch error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('start_date') || ''
    const endDate = searchParams.get('end_date') || ''
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

    if (search) {
      params.push(`%${search}%`)
      const searchParam = `$${params.length}`
      conditions.push(`(name ILIKE ${searchParam} OR mobile_no ILIKE ${searchParam} OR address ILIKE ${searchParam} OR referral_by ILIKE ${searchParam} OR referral_to ILIKE ${searchParam})`)
    }

    if (startDate) {
      params.push(startDate)
      conditions.push(`created_at >= $${params.length}`)
    }

    if (endDate) {
      params.push(endDate)
      conditions.push(`created_at <= $${params.length}::date + interval '1 day'`)
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

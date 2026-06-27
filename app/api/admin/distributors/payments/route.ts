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

    // Get distributors with their paid amounts (sum of payments)
    let baseQuery = `
      SELECT
        d.id, d.dist_id, d.name, d.mobile_no, d.email, d.gender,
        d.account_holder_name, d.account_number, d.ifsc_code, d.bank_name,
        d.upi_id, d.qr_code_url, d.commission_total,
        d.updated_at, d.created_at,
        COALESCE(SUM(dp.amount), 0) AS paid_amount,
        d.commission_total - COALESCE(SUM(dp.amount), 0) AS due_amount,
        CASE
          WHEN d.commission_total - COALESCE(SUM(dp.amount), 0) <= 0 THEN 'Paid'
          WHEN COALESCE(SUM(dp.amount), 0) = 0 THEN 'Unpaid'
          ELSE 'Pending'
        END AS payment_status
      FROM distributors d
      LEFT JOIN distributor_payments dp ON dp.distributor_id = d.id AND dp.status = 'Paid'
    `

    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(d.name ILIKE $${params.length} OR d.mobile_no ILIKE $${params.length} OR d.email ILIKE $${params.length})`)
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ')
    }

    baseQuery += ' GROUP BY d.id'

    if (status && status !== 'all') {
      baseQuery += ` HAVING CASE
        WHEN d.commission_total - COALESCE(SUM(dp.amount), 0) <= 0 THEN 'Paid'
        WHEN COALESCE(SUM(dp.amount), 0) = 0 THEN 'Unpaid'
        ELSE 'Pending'
      END = $${params.length + 1}`
      params.push(status)
    }

    const countQuery = `SELECT COUNT(*)::int FROM (${baseQuery}) AS ct`
    const countResult = await pool.query(countQuery, params)
    const totalCount = countResult.rows[0].count

    const finalQuery = baseQuery + ` ORDER BY d.created_at ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(pageSize, offset)

    const result = await pool.query(finalQuery, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: { totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) }
    })
  } catch (error) {
    console.error('Distributor payments list error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

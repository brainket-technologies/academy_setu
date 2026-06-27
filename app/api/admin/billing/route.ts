import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withCache, apiCache } from '@/lib/api-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const segment = searchParams.get('segment') || ''
    const schoolName = searchParams.get('school_name') || ''
    const paymentMode = searchParams.get('payment_mode') || ''
    const dateRange = searchParams.get('date_range') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    const cacheKey = `billing:${segment}:${schoolName}:${paymentMode}:${dateRange}:${page}:${pageSize}`

    const data = await withCache(cacheKey, async () => {
      const conditions: string[] = []
      const params: (string | number)[] = []

      if (segment) { params.push(segment); conditions.push(`segment = $${params.length}`) }
      if (schoolName) { params.push(`%${schoolName}%`); conditions.push(`school_name ILIKE $${params.length}`) }
      if (paymentMode) { params.push(paymentMode); conditions.push(`payment_mode = $${params.length}`) }
      if (dateRange === 'Last Week') conditions.push(`payment_date >= CURRENT_DATE - INTERVAL '7 days'`)
      else if (dateRange === 'Last 15 Days') conditions.push(`payment_date >= CURRENT_DATE - INTERVAL '15 days'`)

      const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''

      // Single query: COUNT(*) OVER() avoids a separate count round-trip
      const query = `
        SELECT *, COUNT(*) OVER()::int AS _total_count
        FROM bills
        ${where}
        ORDER BY payment_date DESC, created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `
      params.push(pageSize, offset)
      const result = await pool.query(query, params)
      const totalCount = result.rows[0]?._total_count ?? 0
      const rows = result.rows.map(({ _total_count, ...r }) => r)
      return { rows, totalCount }
    }, 20_000) // 20-second TTL

    return NextResponse.json(
      {
        success: true,
        data: data.rows,
        meta: { totalCount: data.totalCount, page, pageSize, totalPages: Math.ceil(data.totalCount / pageSize) }
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60',
        }
      }
    )
  } catch (error) {
    console.error('Billing list error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { segment, school_name, plan_name, payment_mode, payment_date, amount, transaction_id, status } = body

    if (!segment || !school_name || !plan_name || !payment_mode || !amount) {
      return NextResponse.json({ success: false, error: 'Segment, School Name, Plan Name, Payment Mode, and Amount are required' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO bills (segment, school_name, plan_name, payment_mode, payment_date, amount, transaction_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        segment,
        school_name,
        plan_name,
        payment_mode,
        payment_date || new Date(),
        parseFloat(amount),
        transaction_id || '',
        status || 'Paid'
      ]
    )

    // Invalidate billing cache so next read is fresh
    apiCache.invalidate('billing:')

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Billing create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

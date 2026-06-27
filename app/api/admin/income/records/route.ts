import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withCache, apiCache } from '@/lib/api-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const paymentMode = searchParams.get('payment_mode') || ''
    const session = searchParams.get('session') || ''
    const receivedFrom = searchParams.get('received_from') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    const cacheKey = `income:${search}:${category}:${paymentMode}:${session}:${receivedFrom}:${startDate}:${endDate}:${page}:${pageSize}`

    const data = await withCache(cacheKey, async () => {
      const conditions: string[] = []
      const params: any[] = []

      if (search) { params.push(`%${search}%`); conditions.push(`(trans_id ILIKE $${params.length} OR received_from ILIKE $${params.length} OR income_category ILIKE $${params.length})`) }
      if (category) { params.push(category); conditions.push(`income_category = $${params.length}`) }
      if (paymentMode) { params.push(paymentMode); conditions.push(`payment_mode = $${params.length}`) }
      if (session) { params.push(session); conditions.push(`session_name = $${params.length}`) }
      if (receivedFrom) { params.push(receivedFrom); conditions.push(`received_from = $${params.length}`) }
      if (startDate) { params.push(startDate); conditions.push(`received_date >= $${params.length}`) }
      if (endDate) { params.push(endDate); conditions.push(`received_date <= $${params.length}`) }

      const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''

      const query = `
        SELECT *, COUNT(*) OVER()::int AS _total_count
        FROM income_records
        ${where}
        ORDER BY created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `
      params.push(pageSize, offset)
      const result = await pool.query(query, params)
      const totalCount = result.rows[0]?._total_count ?? 0
      const rows = result.rows.map(({ _total_count, ...r }) => r)
      return { rows, totalCount }
    }, 20_000)

    return NextResponse.json(
      { success: true, data: data.rows, meta: { totalCount: data.totalCount, page, pageSize, totalPages: Math.ceil(data.totalCount / pageSize) } },
      { headers: { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60' } }
    )
  } catch (error) {
    console.error('Income records fetch error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      trans_id,
      income_category,
      amount,
      payment_mode,
      received_date,
      received_from,
      payment_account,
      session_name,
      photo_url,
      status
    } = body

    if (!income_category || !amount || !payment_mode || !received_date || !received_from) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const query = `
      INSERT INTO income_records (
        trans_id, income_category, amount, payment_mode, received_date,
        received_from, payment_account, session_name, photo_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `
    const result = await pool.query(query, [
      trans_id || '',
      income_category,
      amount,
      payment_mode,
      received_date,
      received_from,
      payment_account || '',
      session_name || '',
      photo_url || '',
      status || 'Paid'
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Income records insert error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

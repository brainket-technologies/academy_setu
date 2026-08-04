import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withCache, apiCache } from '@/lib/api-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolName = searchParams.get('school_name') || ''
    const paymentMode = searchParams.get('payment_mode') || ''
    const dateRange = searchParams.get('date_range') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    const cacheKey = `billing:${schoolName}:${paymentMode}:${dateRange}:${page}:${pageSize}`

    const data = await withCache(cacheKey, async () => {
      const conditions: string[] = []
      const params: (string | number)[] = []

      if (schoolName) { params.push(`%${schoolName}%`); conditions.push(`i.name ILIKE $${params.length}`) }
      if (paymentMode) { params.push(paymentMode); conditions.push(`b.payment_mode = $${params.length}`) }
      if (dateRange === 'Last Week') conditions.push(`b.payment_date >= CURRENT_DATE - INTERVAL '7 days'`)
      else if (dateRange === 'Last 15 Days') conditions.push(`b.payment_date >= CURRENT_DATE - INTERVAL '15 days'`)

      conditions.push("b.status = 'Paid'")
      const where = ' WHERE ' + conditions.join(' AND ')

      const query = `
        SELECT b.*, 
          i.name as school_name, i.state, i.district,
          p.plan_name,
          COALESCE(p.segment, s.name) as segment,
          COUNT(*) OVER()::int AS _total_count
        FROM bills b
        LEFT JOIN institutions i ON b.institution_id = i.id
        LEFT JOIN plans p ON b.plan_id = p.id
        LEFT JOIN segments s ON i.segment_id = s.id
        ${where}
        ORDER BY b.payment_date DESC, b.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `
      params.push(pageSize, offset)
      const result = await pool.query(query, params)
      const totalCount = result.rows[0]?._total_count ?? 0
      const rows = result.rows.map(({ _total_count, ...r }) => r)
      return { rows, totalCount }
    }, 20_000)

    return NextResponse.json(
      {
        success: true,
        data: data.rows,
        meta: { totalCount: data.totalCount, page, pageSize, totalPages: Math.ceil(data.totalCount / pageSize) }
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Billing list error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { school_name, institution_id, plan_name, plan_id, payment_mode, payment_date, amount, transaction_id, status } = body

    if (!payment_mode || !amount) {
      return NextResponse.json({ success: false, error: 'Payment Mode and Amount are required' }, { status: 400 })
    }

    // Resolve institution_id
    let finalInstitutionId = institution_id
    if (!finalInstitutionId && school_name) {
      const instRes = await pool.query('SELECT id FROM institutions WHERE name ILIKE $1 LIMIT 1', [school_name])
      finalInstitutionId = instRes.rows[0]?.id || null
    }

    // Resolve plan_id
    let finalPlanId = plan_id
    if (!finalPlanId && plan_name) {
      const planRes = await pool.query('SELECT id FROM plans WHERE plan_name ILIKE $1 LIMIT 1', [plan_name])
      finalPlanId = planRes.rows[0]?.id || null
    }

    if (finalPlanId && finalInstitutionId) {
      const planInfo = await pool.query('SELECT segment_id FROM plans WHERE id = $1', [finalPlanId])
      if (planInfo.rows.length > 0 && planInfo.rows[0].segment_id) {
        await pool.query('UPDATE institutions SET segment_id = $1 WHERE id = $2 AND segment_id IS NULL', [
          planInfo.rows[0].segment_id,
          finalInstitutionId
        ])
      }
    }

    const result = await pool.query(
      `INSERT INTO bills (institution_id, plan_id, payment_mode, payment_date, amount, transaction_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        finalInstitutionId,
        finalPlanId,
        payment_mode,
        payment_date || new Date(),
        parseFloat(amount),
        transaction_id || '',
        status || 'Paid'
      ]
    )

    // Insert into requests so it shows up in the Request menu
    await pool.query(
      `INSERT INTO requests (institution_id, plan_id, school_name, plan_name, payment_mode, transaction_id, amount, status)
       VALUES ($1, $2, (SELECT name FROM institutions WHERE id = $1 LIMIT 1), (SELECT plan_name FROM plans WHERE id = $2 LIMIT 1), $3, $4, $5, $6)`,
      [
        finalInstitutionId,
        finalPlanId,
        payment_mode,
        transaction_id || '',
        parseFloat(amount),
        status === 'Paid' ? 'Accept' : (status === 'Failed' ? 'Reject' : 'Pending')
      ]
    )

    apiCache.invalidate('billing:')

    const bill = result.rows[0]
    // Enrich with institution and plan names
    const enriched = await pool.query(`
      SELECT b.*, i.name as school_name, p.plan_name
      FROM bills b
      LEFT JOIN institutions i ON b.institution_id = i.id
      LEFT JOIN plans p ON b.plan_id = p.id
      WHERE b.id = $1
    `, [bill.id])

    return NextResponse.json({ success: true, data: enriched.rows[0] || bill })
  } catch (error) {
    console.error('Billing create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

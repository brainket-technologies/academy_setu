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

    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(i.name ILIKE $${params.length} OR r.transaction_id ILIKE $${params.length})`)
    }
    if (status) {
      params.push(status)
      conditions.push(`r.status = $${params.length}`)
    }

    const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''

    const countQuery = `
      SELECT COUNT(*)::int as count
      FROM requests r
      LEFT JOIN institutions i ON r.institution_id = i.id
      ${where}
    `
    const countResult = await pool.query(countQuery, params)
    const totalCount = countResult.rows[0].count

    const query = `
      SELECT r.*, i.name as school_name, p.plan_name
      FROM requests r
      LEFT JOIN institutions i ON r.institution_id = i.id
      LEFT JOIN plans p ON r.plan_id = p.id
      ${where}
      ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `
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
    const { school_name, institution_id, plan_name, plan_id, payment_mode, transaction_id, amount, status, screenshots } = body

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

    const result = await pool.query(
      `INSERT INTO requests (institution_id, plan_id, payment_mode, transaction_id, amount, status, screenshots)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        finalInstitutionId,
        finalPlanId,
        payment_mode,
        transaction_id || '',
        parseFloat(amount),
        status || 'Pending',
        JSON.stringify(screenshots || [])
      ]
    )

    const req = result.rows[0]
    const enriched = await pool.query(`
      SELECT r.*, i.name as school_name, p.plan_name
      FROM requests r
      LEFT JOIN institutions i ON r.institution_id = i.id
      LEFT JOIN plans p ON r.plan_id = p.id
      WHERE r.id = $1
    `, [req.id])

    return NextResponse.json({ success: true, data: enriched.rows[0] || req })
  } catch (error) {
    console.error('Request create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

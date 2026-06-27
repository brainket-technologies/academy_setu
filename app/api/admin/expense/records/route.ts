import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const paymentMode = searchParams.get('payment_mode') || ''
    const paidBy = searchParams.get('paid_by') || ''
    const paidTo = searchParams.get('paid_to') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    let query = `SELECT * FROM expense_records`
    const conditions: string[] = []
    const params: any[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(
        `(trans_id ILIKE $${params.length} OR paid_by ILIKE $${params.length} OR paid_to ILIKE $${params.length} OR expense_category ILIKE $${params.length})`
      )
    }

    if (category) {
      params.push(category)
      conditions.push(`expense_category = $${params.length}`)
    }

    if (paymentMode) {
      params.push(paymentMode)
      conditions.push(`payment_mode = $${params.length}`)
    }

    if (paidBy) {
      params.push(paidBy)
      conditions.push(`paid_by = $${params.length}`)
    }

    if (paidTo) {
      params.push(paidTo)
      conditions.push(`paid_to = $${params.length}`)
    }

    if (startDate) {
      params.push(startDate)
      conditions.push(`expense_date >= $${params.length}`)
    }

    if (endDate) {
      params.push(endDate)
      conditions.push(`expense_date <= $${params.length}`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    const countQuery = `SELECT COUNT(*)::int FROM (${query}) as count_table`
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
    console.error('Expense records fetch error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      trans_id,
      expense_category,
      amount,
      payment_mode,
      expense_date,
      paid_by,
      paid_to,
      payment_account,
      received_by,
      approved_by,
      photo_url,
      status
    } = body

    if (!expense_category || !amount || !payment_mode || !expense_date || !paid_by || !paid_to) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const query = `
      INSERT INTO expense_records (
        trans_id, expense_category, amount, payment_mode, expense_date,
        paid_by, paid_to, payment_account, received_by, approved_by, photo_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `
    const result = await pool.query(query, [
      trans_id || '',
      expense_category,
      amount,
      payment_mode,
      expense_date,
      paid_by,
      paid_to,
      payment_account || '',
      received_by || '',
      approved_by || '',
      photo_url || '',
      status || 'Paid'
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Expense records insert error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

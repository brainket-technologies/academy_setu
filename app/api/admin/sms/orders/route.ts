import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function GET(request: NextRequest) {
  try {
    await ensureShopDb()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = 'SELECT * FROM sms_orders WHERE 1=1'
    const params: any[] = []

    if (status && status !== 'All') {
      params.push(status)
      query += ` AND status = $${params.length}`
    }

    if (search) {
      params.push(`%${search}%`)
      query += ` AND (school_name ILIKE $${params.length} OR mobile_no ILIKE $${params.length} OR email ILIKE $${params.length})`
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Fetch SMS orders error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureShopDb()
    const body = await request.json()
    const { school_name, mobile_no, email, sms_quantity, amount, status } = body

    if (!school_name || !mobile_no || !email || !sms_quantity || !amount) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO sms_orders (school_name, mobile_no, email, sms_quantity, amount, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        school_name,
        mobile_no,
        email,
        parseInt(sms_quantity),
        parseFloat(amount),
        status || 'New Order'
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Create SMS order error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

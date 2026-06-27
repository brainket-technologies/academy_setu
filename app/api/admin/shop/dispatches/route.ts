import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function GET(request: NextRequest) {
  try {
    await ensureShopDb()
    const { searchParams } = new URL(request.url)
    const school = searchParams.get('school') || ''
    const status = searchParams.get('status') || ''
    const fromDate = searchParams.get('fromDate') || ''
    const toDate = searchParams.get('toDate') || ''
    const search = searchParams.get('search') || ''

    let query = 'SELECT * FROM product_dispatches WHERE 1=1'
    const params: any[] = []

    if (school && school !== 'All' && school !== 'Select an Option') {
      params.push(school)
      query += ` AND school_name = $${params.length}`
    }

    if (status && status !== 'All' && status !== 'Select an Option') {
      params.push(status)
      query += ` AND status = $${params.length}`
    }

    if (fromDate) {
      params.push(fromDate)
      query += ` AND dispatch_date >= $${params.length}`
    }

    if (toDate) {
      params.push(toDate)
      query += ` AND dispatch_date <= $${params.length}`
    }

    if (search) {
      params.push(`%${search}%`)
      query += ` AND (name ILIKE $${params.length} OR product_name ILIKE $${params.length} OR school_name ILIKE $${params.length})`
    }

    query += ' ORDER BY dispatch_date DESC, created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Fetch dispatches error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureShopDb()
    const body = await request.json()
    const { 
      school_name, address, name, mobile_no, product_name, 
      product_description, quantity, size, product_as, dispatch_date, status,
      price, tax_percent, total_amount, courier_name, courier_id
    } = body

    if (!school_name || !address || !name || !mobile_no || !product_name || !quantity) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO product_dispatches (
        school_name, address, name, mobile_no, product_name, 
        product_description, quantity, size, product_as, dispatch_date, status,
        price, tax_percent, total_amount, courier_name, courier_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        school_name,
        address,
        name,
        mobile_no,
        product_name,
        product_description || '',
        parseInt(quantity),
        size || '',
        product_as || 'Gift',
        dispatch_date || new Date().toISOString().split('T')[0],
        status || 'Payment Pending',
        parseFloat(price) || 0,
        parseFloat(tax_percent) || 0,
        parseFloat(total_amount) || 0,
        courier_name || '',
        courier_id || ''
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Create dispatch error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

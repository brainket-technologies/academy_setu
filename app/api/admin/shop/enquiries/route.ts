import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function GET(request: NextRequest) {
  try {
    await ensureShopDb()
    const { searchParams } = new URL(request.url)
    const school = searchParams.get('school') || ''
    const fromDate = searchParams.get('fromDate') || ''
    const toDate = searchParams.get('toDate') || ''
    const search = searchParams.get('search') || ''

    let query = 'SELECT * FROM product_enquiries WHERE 1=1'
    const params: any[] = []

    if (school && school !== 'All' && school !== 'Select an Option') {
      params.push(school)
      query += ` AND school_name = $${params.length}`
    }

    if (fromDate) {
      params.push(fromDate)
      query += ` AND enquiry_date >= $${params.length}`
    }

    if (toDate) {
      params.push(toDate)
      query += ` AND enquiry_date <= $${params.length}`
    }

    if (search) {
      params.push(`%${search}%`)
      query += ` AND (name ILIKE $${params.length} OR product_name ILIKE $${params.length} OR school_name ILIKE $${params.length})`
    }

    query += ' ORDER BY enquiry_date DESC, created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Fetch enquiries error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureShopDb()
    const body = await request.json()
    const { school_name, address, name, mobile_no, product_name, quantity, enquiry_date } = body

    if (!school_name || !address || !name || !mobile_no || !product_name || !quantity) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO product_enquiries (school_name, address, name, mobile_no, product_name, quantity, enquiry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        school_name,
        address,
        name,
        mobile_no,
        product_name,
        parseInt(quantity),
        enquiry_date || new Date().toISOString().split('T')[0]
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Create enquiry error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

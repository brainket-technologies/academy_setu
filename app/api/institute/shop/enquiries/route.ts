import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    await ensureShopDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    let query = `
      SELECT *, 
        TO_CHAR(enquiry_date, 'DD/MM/YYYY') as enquiry_date_formatted,
        TO_CHAR(created_at, 'DD/MM/YYYY') as created_at_formatted
      FROM product_enquiries 
      WHERE (school_name ILIKE $1 OR school_name = 'abcdschool')
    `
    const params: any[] = [`%${instituteName}%`]

    if (status && status !== 'Select an Option' && status !== 'All') {
      params.push(status)
      query += ` AND status = $${params.length}`
    }

    if (search.trim()) {
      params.push(`%${search.trim()}%`)
      query += ` AND (product_name ILIKE $${params.length} OR name ILIKE $${params.length} OR remarks ILIKE $${params.length})`
    }

    query += ' ORDER BY created_at DESC, enquiry_date DESC'

    const result = await pool.query(query, params)

    const mapped = result.rows.map(row => {
      const perPiece = parseFloat(row.price || 0)
      const qty = parseInt(row.quantity || 1)
      const total = row.total_amount ? parseFloat(row.total_amount) : (perPiece * qty)

      return {
        id: row.id,
        schoolName: row.school_name,
        name: row.name,
        mobile: row.mobile_no,
        address: row.address,
        productName: row.product_name,
        quantity: qty,
        size: row.size || '',
        color: row.color || '',
        price: perPiece,
        totalAmount: total,
        status: row.status || 'Enquired',
        remarks: row.remarks || '',
        adminRemarks: row.admin_remarks || '',
        paymentStatus: row.payment_status || 'Unpaid',
        enquiryDate: row.enquiry_date_formatted || (row.enquiry_date ? new Date(row.enquiry_date).toLocaleDateString('en-GB') : ''),
        createdAt: row.created_at_formatted || (row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB') : '')
      }
    })

    return NextResponse.json({ success: true, data: mapped })
  } catch (error: any) {
    console.error('Fetch institute enquiries error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureShopDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const body = await request.json()
    const {
      productName,
      quantity,
      size = '',
      color = '',
      price = 0,
      totalAmount = 0,
      name,
      mobile,
      address,
      remarks = ''
    } = body

    if (!productName || !quantity || !name || !mobile) {
      return NextResponse.json({
        success: false,
        error: 'Product Name, Quantity, Contact Name, and Mobile Number are required.'
      }, { status: 400 })
    }

    const qty = parseInt(String(quantity)) || 1
    const unitPrice = parseFloat(String(price || 0))
    const total = parseFloat(String(totalAmount || 0)) || (unitPrice * qty)

    const result = await pool.query(
      `INSERT INTO product_enquiries (
        school_name, address, name, mobile_no, product_name, quantity,
        size, color, price, total_amount, remarks, status, enquiry_date,
        payment_status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Enquired', CURRENT_DATE, 'Unpaid', NOW(), NOW())
      RETURNING *,
        TO_CHAR(enquiry_date, 'DD/MM/YYYY') as enquiry_date_formatted,
        TO_CHAR(created_at, 'DD/MM/YYYY') as created_at_formatted`,
      [
        instituteName,
        address ? address.trim() : 'Campus Delivery',
        name.trim(),
        mobile.trim(),
        productName.trim(),
        qty,
        size,
        color,
        unitPrice,
        total,
        remarks.trim()
      ]
    )

    const row = result.rows[0]
    return NextResponse.json({
      success: true,
      message: 'Product inquiry submitted successfully! Admin will review and provide a quote with payment link.',
      data: {
        id: row.id,
        schoolName: row.school_name,
        name: row.name,
        mobile: row.mobile_no,
        address: row.address,
        productName: row.product_name,
        quantity: row.quantity,
        size: row.size,
        color: row.color,
        price: parseFloat(row.price || 0),
        totalAmount: parseFloat(row.total_amount || 0),
        status: row.status,
        remarks: row.remarks,
        adminRemarks: row.admin_remarks,
        enquiryDate: row.enquiry_date_formatted
      }
    })
  } catch (error: any) {
    console.error('Create institute inquiry error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await ensureShopDb()
    const { id } = await params
    const result = await pool.query('SELECT * FROM product_enquiries WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Fetch enquiry error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await ensureShopDb()
    const { id } = await params
    const body = await request.json()
    const { school_name, address, name, mobile_no, product_name, quantity, enquiry_date, status, remarks } = body

    const existingResult = await pool.query('SELECT * FROM product_enquiries WHERE id = $1', [id])
    if (existingResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 })
    }
    const current = existingResult.rows[0]

    const updatedSchool = school_name !== undefined ? school_name : current.school_name
    const updatedAddress = address !== undefined ? address : current.address
    const updatedName = name !== undefined ? name : current.name
    const updatedMobile = mobile_no !== undefined ? mobile_no : current.mobile_no
    const updatedProduct = product_name !== undefined ? product_name : current.product_name
    const updatedQuantity = quantity !== undefined ? parseInt(quantity) : current.quantity
    const updatedDate = enquiry_date !== undefined ? enquiry_date : current.enquiry_date
    const updatedStatus = status !== undefined ? status : (current.status || 'Pending')
    const updatedRemarks = remarks !== undefined ? remarks : (current.remarks || '')

    const result = await pool.query(
      `UPDATE product_enquiries
       SET school_name = $1,
           address = $2,
           name = $3,
           mobile_no = $4,
           product_name = $5,
           quantity = $6,
           enquiry_date = $7,
           status = $8,
           remarks = $9,
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        updatedSchool,
        updatedAddress,
        updatedName,
        updatedMobile,
        updatedProduct,
        updatedQuantity,
        updatedDate,
        updatedStatus,
        updatedRemarks,
        id
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Update enquiry error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return PUT(request, { params })
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await ensureShopDb()
    const { id } = await params
    const result = await pool.query('DELETE FROM product_enquiries WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Enquiry deleted successfully' })
  } catch (error) {
    console.error('Delete enquiry error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

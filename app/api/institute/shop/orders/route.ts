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
    const fromDate = searchParams.get('fromDate') || ''
    const toDate = searchParams.get('toDate') || ''

    let query = `
      SELECT *, 
        TO_CHAR(dispatch_date, 'DD/MM/YYYY') as dispatch_date_formatted,
        TO_CHAR(created_at, 'DD/MM/YYYY') as created_at_formatted
      FROM product_dispatches 
      WHERE (school_name ILIKE $1 OR school_name = 'abcdschool')
    `
    const params: any[] = [`%${instituteName}%`]

    if (status && status !== 'Select an Option' && status !== 'All') {
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

    if (search.trim()) {
      params.push(`%${search.trim()}%`)
      query += ` AND (product_name ILIKE $${params.length} OR name ILIKE $${params.length})`
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)

    const mapped = result.rows.map(row => {
      const perPiece = parseFloat(row.price || 0)
      const qty = parseInt(row.quantity || 1)
      const total = perPiece * qty
      const taxPercent = parseFloat(row.tax_percent || 18)
      const finalAmt = row.total_amount ? parseFloat(row.total_amount) : total + (total * (taxPercent / 100))

      return {
        id: row.id,
        productName: row.product_name,
        quantity: qty,
        perPiecePrice: perPiece,
        totalPrice: total,
        tax: `${taxPercent}%`,
        finalAmount: finalAmt,
        updatedAt: row.created_at_formatted || row.dispatch_date_formatted || new Date(row.dispatch_date).toLocaleDateString('en-GB'),
        status: row.status || 'Payment Pending',
        size: row.size || '',
        productDescription: row.product_description || '',
        name: row.name,
        mobile: row.mobile_no,
        address: row.address,
        courierName: row.courier_name || '',
        courierId: row.courier_id || '',
        productAs: row.product_as || 'Purchase',
        createdAt: row.created_at
      }
    })

    return NextResponse.json({ success: true, data: mapped })
  } catch (error: any) {
    console.error('Fetch institute shop orders error:', error)
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
      productDescription = '',
      quantity,
      size = '',
      color = '',
      price,
      taxPercent = 18,
      name,
      mobile,
      address,
      status = 'Order Generated',
      productAs = 'Purchase'
    } = body

    if (!productName || !quantity || !name || !mobile) {
      return NextResponse.json({
        success: false,
        error: 'Product Name, Quantity, Contact Name, and Mobile Number are required.'
      }, { status: 400 })
    }

    const qty = parseInt(String(quantity)) || 1
    const unitPrice = parseFloat(String(price || 0))
    const tax = parseFloat(String(taxPercent || 18))
    const total = unitPrice * qty
    const finalAmount = total + (total * (tax / 100))

    const fullDescription = [
      productDescription,
      color ? `Color: ${color}` : '',
      size ? `Size: ${size}` : ''
    ].filter(Boolean).join(' • ')

    // 1. Insert into product_dispatches
    const dispatchRes = await pool.query(`
      INSERT INTO product_dispatches (
        school_name, address, name, mobile_no, product_name, 
        product_description, quantity, size, product_as, dispatch_date, status,
        price, tax_percent, total_amount, courier_name, courier_id, transactions,
        created_at, updated_at
      )
      VALUES 
      (
        $1, $2, $3, $4, $5, 
        $6, $7, $8, $9, CURRENT_DATE, $10,
        $11, $12, $13, '', '', '[]'::jsonb,
        NOW(), NOW()
      )
      RETURNING *,
        TO_CHAR(dispatch_date, 'DD/MM/YYYY') as dispatch_date_formatted,
        TO_CHAR(created_at, 'DD/MM/YYYY') as created_at_formatted
    `, [
      instituteName,
      address || 'School Campus Delivery',
      name.trim(),
      mobile.trim(),
      productName.trim(),
      fullDescription,
      qty,
      size,
      productAs,
      status,
      unitPrice,
      tax,
      finalAmount
    ])

    // 2. Also insert into product_enquiries for admin CRM
    try {
      await pool.query(`
        INSERT INTO product_enquiries (school_name, address, name, mobile_no, product_name, quantity, enquiry_date, status, remarks)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8)
      `, [
        instituteName,
        address || 'School Campus Delivery',
        name.trim(),
        mobile.trim(),
        productName.trim(),
        qty,
        status,
        `Placed order for ${qty} pcs (${color ? 'Color: ' + color + ', ' : ''}${size ? 'Size: ' + size : ''})`
      ])
    } catch (e) {
      console.warn('Enquiry creation note:', e)
    }

    const created = dispatchRes.rows[0]

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        id: created.id,
        productName: created.product_name,
        quantity: created.quantity,
        perPiecePrice: parseFloat(created.price),
        totalPrice: parseFloat(created.price) * parseInt(created.quantity),
        tax: `${created.tax_percent}%`,
        finalAmount: parseFloat(created.total_amount),
        updatedAt: created.created_at_formatted || created.dispatch_date_formatted || new Date().toLocaleDateString('en-GB'),
        status: created.status,
        size: created.size,
        productDescription: created.product_description,
        name: created.name,
        mobile: created.mobile_no,
        address: created.address
      }
    })
  } catch (error: any) {
    console.error('Create shop order error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

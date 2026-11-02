import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'
import { getSession } from '@/lib/session'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureShopDb()
    const { id } = await params
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const body = await request.json()
    const { action, paymentReference = '' } = body

    // 1. Fetch existing enquiry
    const enqRes = await pool.query('SELECT * FROM product_enquiries WHERE id = $1', [id])
    if (enqRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Inquiry not found' }, { status: 404 })
    }
    const enquiry = enqRes.rows[0]

    if (action === 'pay') {
      // Mark enquiry as Order Generated / Paid
      const updatedEnq = await pool.query(
        `UPDATE product_enquiries
         SET status = 'Order Generated',
             payment_status = 'Paid',
             updated_at = NOW()
         WHERE id = $1
         RETURNING *,
           TO_CHAR(enquiry_date, 'DD/MM/YYYY') as enquiry_date_formatted,
           TO_CHAR(created_at, 'DD/MM/YYYY') as created_at_formatted`,
        [id]
      )

      const row = updatedEnq.rows[0]
      const unitPrice = parseFloat(row.price || 0)
      const qty = parseInt(row.quantity || 1)
      const total = parseFloat(row.total_amount || 0) || (unitPrice * qty)

      // 2. Insert into product_dispatches
      const dispatchNote = [
        `Paid via Institute Shop Portal (Ref: ${paymentReference || 'INST-PAY-' + Date.now().toString().slice(-6)})`,
        row.color ? `Color: ${row.color}` : '',
        row.size ? `Size: ${row.size}` : '',
        row.admin_remarks ? `Admin Note: ${row.admin_remarks}` : ''
      ].filter(Boolean).join(' • ')

      await pool.query(
        `INSERT INTO product_dispatches (
          school_name, address, name, mobile_no, product_name,
          product_description, quantity, size, product_as, dispatch_date, status,
          price, tax_percent, total_amount, courier_name, courier_id, transactions,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Purchase', CURRENT_DATE, 'Order Generated', $9, 18, $10, '', '', '[]'::jsonb, NOW(), NOW())`,
        [
          row.school_name || instituteName,
          row.address || 'Campus Delivery',
          row.name,
          row.mobile_no,
          row.product_name,
          dispatchNote,
          qty,
          row.size || '',
          unitPrice,
          total
        ]
      )

      return NextResponse.json({
        success: true,
        message: 'Payment received successfully! Order has been generated.',
        data: row
      })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Institute enquiry pay error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}


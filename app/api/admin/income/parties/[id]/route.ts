import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    const query = `DELETE FROM income_parties WHERE id = $1 RETURNING *`
    const result = await pool.query(query, [id])

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Party not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Party deleted successfully'
    })
  } catch (error) {
    console.error('Delete income party error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    const body = await request.json()
    const { name, mobile_no, email, party_category, contact_person, amount, gst_no, address } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Party name is required' }, { status: 400 })
    }

    const query = `
      UPDATE income_parties
      SET name = $1, mobile_no = $2, email = $3, party_category = $4,
          contact_person = $5, amount = $6, gst_no = $7, address = $8
      WHERE id = $9
      RETURNING *
    `
    const result = await pool.query(query, [
      name,
      mobile_no || '',
      email || '',
      party_category || 'Income',
      contact_person || '',
      amount ? parseFloat(amount) : 0,
      gst_no || '',
      address || '',
      id
    ])

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Party not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Update income party error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

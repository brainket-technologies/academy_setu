import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await pool.query('SELECT * FROM distributors WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Distributor not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await pool.query('DELETE FROM distributors WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Distributor not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Distributor deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      dist_id, joining_date, name, mobile_no, email, gender, username, password,
      address, state, district, pincode, aadhar_no,
      commission_in, commission_value, commission_type, assign_area,
      account_holder_name, account_number, ifsc_code, bank_name
    } = body

    let updateQuery = `UPDATE distributors SET 
        dist_id = $1, joining_date = $2, name = $3, mobile_no = $4, email = $5, gender = $6, username = $7,
        address = $8, state = $9, district = $10, pincode = $11, aadhar_no = $12,
        commission_in = $13, commission_value = $14, commission_type = $15, assign_area = $16,
        account_holder_name = $17, account_number = $18, ifsc_code = $19, bank_name = $20,
        updated_at = NOW()`
    
    const queryValues = [
        dist_id, joining_date || null, name, mobile_no, email || '', gender || '', username,
        address || '', state || '', district || '', pincode || '', aadhar_no || '',
        commission_in || '', parseFloat(commission_value || '0'), commission_type || '', assign_area || '',
        account_holder_name || '', account_number || '', ifsc_code || '', bank_name || '',
    ]

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10)
      updateQuery += `, password_hash = $21`
      queryValues.push(passwordHash)
      updateQuery += ` WHERE id = $22 RETURNING *`
      queryValues.push(id)
    } else {
      updateQuery += ` WHERE id = $21 RETURNING *`
      queryValues.push(id)
    }

    const result = await pool.query(updateQuery, queryValues)

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Distributor not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Update Distributor Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update distributor' }, { status: 500 })
  }
}

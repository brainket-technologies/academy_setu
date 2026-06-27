import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    const query = `DELETE FROM admins WHERE id = $1 RETURNING id`
    const result = await pool.query(query, [id])

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
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
    const { 
      name, email, password, role, phone, id_no, avatar_url, is_active,
      joining_date, permissions, gender, address, state, district, pincode,
      aadhar_no, aadhar_card_url, signature_url, login_time_type, login_time,
      logout_time, login_expire_date, device_permission_count
    } = body

    if (!name || !email || !role) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Check email uniqueness if email changed
    const checkEmail = await pool.query('SELECT id FROM admins WHERE email = $1 AND id <> $2 LIMIT 1', [email, id])
    if (checkEmail.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'Email already in use by another account' }, { status: 400 })
    }

    let result
    if (password) {
      // update password too
      const passwordHash = await bcrypt.hash(password, 10)
      const query = `
        UPDATE admins
        SET name = $1, email = $2, password_hash = $3, role = $4,
            phone = $5, id_no = $6, avatar_url = $7, is_active = $8,
            joining_date = $9, permissions = $10, gender = $11, address = $12,
            state = $13, district = $14, pincode = $15, aadhar_no = $16,
            aadhar_card_url = $17, signature_url = $18, login_time_type = $19,
            login_time = $20, logout_time = $21, login_expire_date = $22,
            device_permission_count = $23, updated_at = NOW()
        WHERE id = $24
        RETURNING *
      `
      result = await pool.query(query, [
        name,
        email,
        passwordHash,
        role,
        phone || '',
        id_no || '',
        avatar_url || '',
        is_active !== undefined ? is_active : true,
        joining_date || null,
        permissions || [],
        gender || '',
        address || '',
        state || '',
        district || '',
        pincode || '',
        aadhar_no || '',
        aadhar_card_url || '',
        signature_url || '',
        login_time_type || 'Always',
        login_time || '',
        logout_time || '',
        login_expire_date || null,
        device_permission_count ? parseInt(String(device_permission_count)) : 1,
        id
      ])
    } else {
      // don't update password
      const query = `
        UPDATE admins
        SET name = $1, email = $2, role = $3, phone = $4, id_no = $5,
            avatar_url = $6, is_active = $7, joining_date = $8,
            permissions = $9, gender = $10, address = $11, state = $12,
            district = $13, pincode = $14, aadhar_no = $15, aadhar_card_url = $16,
            signature_url = $17, login_time_type = $18, login_time = $19,
            logout_time = $20, login_expire_date = $21, device_permission_count = $22,
            updated_at = NOW()
        WHERE id = $23
        RETURNING *
      `
      result = await pool.query(query, [
        name,
        email,
        role,
        phone || '',
        id_no || '',
        avatar_url || '',
        is_active !== undefined ? is_active : true,
        joining_date || null,
        permissions || [],
        gender || '',
        address || '',
        state || '',
        district || '',
        pincode || '',
        aadhar_no || '',
        aadhar_card_url || '',
        signature_url || '',
        login_time_type || 'Always',
        login_time || '',
        logout_time || '',
        login_expire_date || null,
        device_permission_count ? parseInt(String(device_permission_count)) : 1,
        id
      ])
    }

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

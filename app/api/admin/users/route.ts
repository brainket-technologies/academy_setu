import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const roleFilter = searchParams.get('role') || 'All'
    const id = searchParams.get('id') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    // If querying a single user by ID
    if (id) {
      const singleRes = await pool.query('SELECT * FROM admins WHERE id = $1 LIMIT 1', [id])
      if (singleRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: singleRes.rows[0] })
    }

    let query = `
      SELECT id, name, email, role, phone, avatar_url, is_active, id_no, id_card_url,
             joining_date, permissions, gender, address, state, district, pincode,
             aadhar_no, aadhar_card_url, signature_url, login_time_type, login_time,
             logout_time, login_expire_date, device_permission_count, created_at
      FROM admins
    `
    const conditions: string[] = []
    const params: any[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(
        `(name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length} OR id_no ILIKE $${params.length})`
      )
    }

    if (roleFilter && roleFilter !== 'All') {
      if (roleFilter === 'Custom') {
        conditions.push(`role NOT IN ('Admin', 'Manager', 'BDM')`)
      } else {
        params.push(roleFilter)
        conditions.push(`role = $${params.length}`)
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    const countQuery = `SELECT COUNT(*)::int FROM (${query}) as count_table`
    const countResult = await pool.query(countQuery, params)
    const totalCount = countResult.rows[0].count

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(pageSize, offset)

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: {
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    console.error('Fetch users error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, email, password, role, phone, id_no, avatar_url, is_active,
      joining_date, permissions, gender, address, state, district, pincode,
      aadhar_no, aadhar_card_url, signature_url, login_time_type, login_time,
      logout_time, login_expire_date, device_permission_count 
    } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email already exists
    const checkEmail = await pool.query('SELECT id FROM admins WHERE email = $1 LIMIT 1', [email])
    if (checkEmail.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const query = `
      INSERT INTO admins (
        name, email, password_hash, role, phone, id_no, avatar_url, is_active,
        joining_date, permissions, gender, address, state, district, pincode,
        aadhar_no, aadhar_card_url, signature_url, login_time_type, login_time,
        logout_time, login_expire_date, device_permission_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `
    const result = await pool.query(query, [
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
      device_permission_count ? parseInt(String(device_permission_count)) : 1
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

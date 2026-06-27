import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    let query = `SELECT id, dist_id, name, mobile_no, email, gender, state, district, commission_in, commission_value, commission_type, assign_area, status, created_at FROM distributors`
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(name ILIKE $${params.length} OR mobile_no ILIKE $${params.length} OR dist_id ILIKE $${params.length})`)
    }

    const status = searchParams.get('status')
    if (status) {
      params.push(status)
      conditions.push(`status = $${params.length}`)
    }

    const startDate = searchParams.get('start_date')
    if (startDate) {
      params.push(startDate)
      conditions.push(`created_at >= $${params.length}::timestamp`)
    }

    const endDate = searchParams.get('end_date')
    if (endDate) {
      params.push(endDate)
      conditions.push(`created_at < $${params.length}::date + interval '1 day'`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    const countQuery = `SELECT COUNT(*)::int FROM (${query}) as t`
    const countResult = await pool.query(countQuery, params)
    const totalCount = countResult.rows[0].count

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(pageSize, offset)

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: { totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) }
    })
  } catch (error) {
    console.error('Distributors fetch error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      dist_id, joining_date, name, mobile_no, email, gender,
      username,
      address, state, district, pincode, aadhar_no,
      commission_in, commission_value, commission_type, assign_area,
      account_holder_name, account_number, ifsc_code, bank_name
    } = body

    if (!dist_id || !name || !mobile_no || !username) {
      return NextResponse.json(
        { success: false, error: 'ID No., Name, Mobile No., and Username are required' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `INSERT INTO distributors (
        dist_id, joining_date, name, mobile_no, email, gender,
        username, password_hash,
        address, state, district, pincode, aadhar_no,
        commission_in, commission_value, commission_type, assign_area,
        account_holder_name, account_number, ifsc_code, bank_name,
        status, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,'Active',NOW(),NOW())
      RETURNING id, dist_id, name, mobile_no, status`,
      [
        dist_id, joining_date || null, name, mobile_no, email || '', gender || '',
        username, '',
        address || '', state || '', district || '', pincode || '', aadhar_no || '',
        commission_in || '', parseFloat(commission_value || '0'), commission_type || '', assign_area || '',
        account_holder_name || '', account_number || '', ifsc_code || '', bank_name || ''
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Distributor create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

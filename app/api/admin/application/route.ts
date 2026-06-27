import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const tab = searchParams.get('tab') || 'all'
  const start_date = searchParams.get('start_date') || ''
  const end_date = searchParams.get('end_date') || ''
  const status = searchParams.get('status') || ''
  const state = searchParams.get('state') || ''
  const district = searchParams.get('district') || ''

  try {
    // 1. Fetch counts
    const countsResult = await pool.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status IN ('Applied', 'Requested') THEN 1 END)::int as new
      FROM applications
    `)
    const { total, new: newCount } = countsResult.rows[0]

    // 2. Fetch applications with filters
    let query = 'SELECT id, application_no, school_name, contact_person, state, district, status, created_at FROM applications'
    const values: string[] = []
    const conditions: string[] = []

    if (status) {
      conditions.push('status = $' + (values.length + 1))
      values.push(status)
    }

    if (state) {
      conditions.push('state ILIKE $' + (values.length + 1))
      values.push(`%${state}%`)
    }

    if (district) {
      conditions.push('district ILIKE $' + (values.length + 1))
      values.push(`%${district}%`)
    }

    if (start_date) {
      conditions.push('created_at::date >= $' + (values.length + 1))
      values.push(start_date)
    }

    if (end_date) {
      conditions.push('created_at::date <= $' + (values.length + 1))
      values.push(end_date)
    }

    if (search) {
      conditions.push('(school_name ILIKE $' + (values.length + 1) + 
                      ' OR contact_person ILIKE $' + (values.length + 1) + 
                      ' OR state ILIKE $' + (values.length + 1) + 
                      ' OR district ILIKE $' + (values.length + 1) + 
                      ' OR application_no ILIKE $' + (values.length + 1) + ')')
      values.push(`%${search}%`)
    }

    if (tab === 'new') {
      conditions.push("status IN ('Applied', 'Requested')")
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY created_at DESC'
    const result = await pool.query(query, values)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: {
        totalCount: total,
        newCount: newCount
      }
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      school_name, school_code, affiliated_to, affiliation_code,
      contact_person, mobile_no, email_id, address, state, district, pincode,
      principal_name, principal_gender, principal_sign, principal_photo,
      director_name, director_gender, director_sign, director_photo,
      status, enquiry_status, plan, promo_code
    } = body

    if (!school_name || !contact_person || !mobile_no || !address || !state || !district || !pincode) {
      return NextResponse.json({ success: false, error: 'All required fields are missing.' }, { status: 400 })
    }

    // Generate a unique application_no
    const countResult = await pool.query('SELECT COUNT(*) FROM applications')
    const count = parseInt(countResult.rows[0].count) + 125
    const applicationNo = `AS2026${count}`

    const result = await pool.query(
      `INSERT INTO applications (
        application_no, school_name, school_code, affiliated_to, affiliation_code,
        contact_person, mobile_no, email_id, address, state, district, pincode,
        principal_name, principal_gender, principal_sign, principal_photo,
        director_name, director_gender, director_sign, director_photo,
        status, enquiry_status, plan, promo_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
       RETURNING *`,
      [
        applicationNo, school_name, school_code || '', affiliated_to || '', affiliation_code || '',
        contact_person, mobile_no, email_id || '', address, state, district, pincode,
        principal_name || '', principal_gender || 'Male', principal_sign || '', principal_photo || '',
        director_name || '', director_gender || 'Male', director_sign || '', director_photo || '',
        status || 'Applied', enquiry_status || 'Applied', plan || '', promo_code || ''
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

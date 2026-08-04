import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const state = searchParams.get('state') || ''
  const district = searchParams.get('district') || ''
  const segment = searchParams.get('segment') || ''
  const plan = searchParams.get('plan') || ''
  const planStatus = searchParams.get('plan_status') || '' // active | expired | expiring_soon

  try {
    let query = `
      SELECT 
        i.id, i.name, i.code, i.contact_person, i.mobile_no, i.email_id,
        i.state, i.district, i.status, i.created_at, i.segment_id,
        u.name as assigned_user_name,
        COALESCE(s.name, p_bill.segment, p_app.segment, p_seg.segment) as segment_name,
        COALESCE(p_bill.plan_name, p_app.plan_name) as active_plan_name,
        p_bill.plan_expiry_date as plan_expiry_date
      FROM institutions i
      LEFT JOIN admins u ON i.assigned_to = u.id
      LEFT JOIN segments s ON i.segment_id = s.id
      LEFT JOIN LATERAL (
        SELECT b.plan_name, pl.segment,
          (b.payment_date + (COALESCE(pl.first_billing_duration, 365) || ' days')::interval)::date AS plan_expiry_date
        FROM bills b 
        LEFT JOIN plans pl ON b.plan_id = pl.id
        WHERE b.institution_id = i.id AND b.status = 'Paid' 
        ORDER BY b.created_at DESC 
        LIMIT 1
      ) p_bill ON true
      LEFT JOIN LATERAL (
        SELECT pl.plan_name, pl.segment 
        FROM applications ap 
        JOIN plans pl ON ap.plan_id = pl.id 
        WHERE ap.institution_id = i.id AND ap.status = 'Completed' 
        ORDER BY ap.created_at DESC 
        LIMIT 1
      ) p_app ON true
      LEFT JOIN LATERAL (
        SELECT pl.segment 
        FROM applications ap 
        JOIN plans pl ON ap.plan_id = pl.id 
        WHERE ap.institution_id = i.id
        ORDER BY ap.created_at DESC 
        LIMIT 1
      ) p_seg ON true
      WHERE i.status = 'Active'
    `
    const values: any[] = []
    
    if (state) {
      values.push(`%${state}%`)
      query += ` AND i.state ILIKE $${values.length}`
    }

    if (district) {
      values.push(`%${district}%`)
      query += ` AND i.district ILIKE $${values.length}`
    }

    if (segment) {
      values.push(segment)
      query += ` AND i.segment_id = $${values.length}`
    }

    if (plan) {
      values.push(plan)
      query += ` AND (p_bill.plan_name = $${values.length} OR p_app.plan_name = $${values.length})`
    }

    if (search) {
      values.push(`%${search}%`)
      query += ` AND (i.name ILIKE $${values.length} OR i.contact_person ILIKE $${values.length} OR i.email_id ILIKE $${values.length})`
    }

    // Plan status filter (uses computed expiry)
    if (planStatus === 'active') {
      query += ` AND p_bill.plan_expiry_date IS NOT NULL AND p_bill.plan_expiry_date >= CURRENT_DATE`
    } else if (planStatus === 'expired') {
      query += ` AND p_bill.plan_expiry_date IS NOT NULL AND p_bill.plan_expiry_date < CURRENT_DATE`
    } else if (planStatus === 'expiring_soon') {
      query += ` AND p_bill.plan_expiry_date IS NOT NULL AND p_bill.plan_expiry_date >= CURRENT_DATE AND p_bill.plan_expiry_date <= (CURRENT_DATE + INTERVAL '30 days')`
    }

    query += ' ORDER BY i.created_at DESC'
    
    const result = await pool.query(query, values)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: {
        totalCount: result.rows.length,
      }
    })
  } catch (error) {
    console.error('Error fetching institutes:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, code, affiliated_to, affiliation_code,
      contact_person, mobile_no, email_id, address, state, district, pincode,
      principal_name, principal_gender, principal_sign, principal_photo,
      director_name, director_gender, director_sign, director_photo,
      password, status
    } = body

    if (!name || !contact_person || !mobile_no || !address || !state || !district || !pincode) {
      return NextResponse.json({ success: false, error: 'Required fields are missing.' }, { status: 400 })
    }

    const bcrypt = await import('bcryptjs')
    const password_hash = password ? await bcrypt.hash(password, 10) : ''

    const instResult = await pool.query(
      `INSERT INTO institutions (
        name, code, affiliated_to, affiliation_code,
        contact_person, mobile_no, email_id, address, state, district, pincode,
        principal_name, principal_gender, principal_sign, principal_photo,
        director_name, director_gender, director_sign, director_photo,
        password_hash, plain_password, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
       RETURNING *`,
      [
        name, code || '', affiliated_to || '', affiliation_code || '',
        contact_person, mobile_no, email_id || '', address, state, district, pincode,
        principal_name || '', principal_gender || 'Male', principal_sign || '', principal_photo || '',
        director_name || '', director_gender || 'Male', director_sign || '', director_photo || '',
        password_hash, password || '', status || 'Active'
      ]
    )

    return NextResponse.json({ success: true, data: instResult.rows[0] })
  } catch (error) {
    console.error('Error creating institute:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}



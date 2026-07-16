import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const state = searchParams.get('state') || ''
  const district = searchParams.get('district') || ''

  try {
    let query = `
      SELECT 
        i.id, i.name, i.code, i.contact_person, i.mobile_no, i.email_id,
        i.state, i.district, i.status, i.created_at,
        u.name as assigned_user_name
      FROM institutions i
      LEFT JOIN admins u ON i.assigned_to = u.id
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

    if (search) {
      values.push(`%${search}%`)
      query += ` AND (i.name ILIKE $${values.length} OR i.contact_person ILIKE $${values.length} OR i.email_id ILIKE $${values.length})`
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



import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: any) {
  try {
    const params = await context.params
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Institute ID is required' }, { status: 400 })
    }

    const query = `
      SELECT 
        id, name as school_name, code as school_code, affiliated_to, affiliation_code,
        contact_person, mobile_no, email_id, address, state, district, pincode,
        principal_name, principal_gender, principal_sign, principal_photo,
        director_name, director_gender, director_sign, director_photo,
        status, assigned_to, plain_password
      FROM institutions
      WHERE id = $1
    `
    const result = await pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Institute not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error fetching institute:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request, context: any) {
  try {
    const params = await context.params
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Institute ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      school_name, school_code, affiliated_to, affiliation_code,
      contact_person, mobile_no, email_id, address, state, district, pincode,
      principal_name, principal_gender, principal_sign, principal_photo,
      director_name, director_gender, director_sign, director_photo,
      status, password
    } = body

    if (!school_name || !contact_person || !mobile_no || !address || !state || !district || !pincode) {
      return NextResponse.json({ success: false, error: 'Required fields are missing.' }, { status: 400 })
    }

    let passwordUpdateStr = ''
    let values = [
      school_name, school_code || '', affiliated_to || '', affiliation_code || '',
      contact_person, mobile_no, email_id || '', address, state, district, pincode,
      principal_name || '', principal_gender || 'Male', principal_sign || '', principal_photo || '',
      director_name || '', director_gender || 'Male', director_sign || '', director_photo || '',
      status || 'Active', id
    ]

    if (password) {
      const bcrypt = await import('bcryptjs')
      const password_hash = await bcrypt.hash(password, 10)
      passwordUpdateStr = `, password_hash = $22, plain_password = $23`
      values.push(password_hash)
      values.push(password)
    }

    const updateQuery = `
      UPDATE institutions SET
        name = $1, code = $2, affiliated_to = $3, affiliation_code = $4,
        contact_person = $5, mobile_no = $6, email_id = $7, address = $8, state = $9, district = $10, pincode = $11,
        principal_name = $12, principal_gender = $13, principal_sign = $14, principal_photo = $15,
        director_name = $16, director_gender = $17, director_sign = $18, director_photo = $19,
        status = $20, updated_at = NOW()
        ${passwordUpdateStr}
      WHERE id = $21
      RETURNING *
    `
    
    const result = await pool.query(updateQuery, values)
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Institute not found or update failed' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error updating institute:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}


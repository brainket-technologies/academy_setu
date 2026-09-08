import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic';

async function ensureInstitutionsColumns() {
  try {
    await pool.query(`
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS code VARCHAR(100);
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS affiliated_to VARCHAR(255);
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS affiliation_code VARCHAR(100);
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS mobile_no VARCHAR(20);
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS email_id VARCHAR(255);
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS state VARCHAR(100);
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS district VARCHAR(100);
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS principal_name VARCHAR(255);
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS principal_gender VARCHAR(50) DEFAULT 'Male';
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS principal_sign TEXT;
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS principal_photo TEXT;
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS director_name VARCHAR(255);
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS director_gender VARCHAR(50) DEFAULT 'Male';
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS director_sign TEXT;
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS director_photo TEXT;
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS assigned_to UUID;
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) DEFAULT '';
      ALTER TABLE institutions ADD COLUMN IF NOT EXISTS plain_password VARCHAR(255) DEFAULT '';
    `)
  } catch (err) {
    console.error('Error ensuring institutions columns:', err)
  }
}

export async function GET(request: Request, context: any) {
  try {
    await ensureInstitutionsColumns()
    const params = await context.params
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Institute ID is required' }, { status: 400 })
    }

    const query = `
      SELECT 
        id,
        COALESCE(name, '') as school_name,
        COALESCE(code, '') as school_code,
        COALESCE(affiliated_to, '') as affiliated_to,
        COALESCE(affiliation_code, '') as affiliation_code,
        COALESCE(contact_person, '') as contact_person,
        COALESCE(mobile_no, '') as mobile_no,
        COALESCE(email_id, '') as email_id,
        COALESCE(address, '') as address,
        COALESCE(state, '') as state,
        COALESCE(district, '') as district,
        COALESCE(pincode, '') as pincode,
        COALESCE(principal_name, '') as principal_name,
        COALESCE(principal_gender, 'Male') as principal_gender,
        COALESCE(principal_sign, '') as principal_sign,
        COALESCE(principal_photo, '') as principal_photo,
        COALESCE(director_name, '') as director_name,
        COALESCE(director_gender, 'Male') as director_gender,
        COALESCE(director_sign, '') as director_sign,
        COALESCE(director_photo, '') as director_photo,
        COALESCE(status, 'Active') as status,
        assigned_to,
        COALESCE(plain_password, '') as plain_password
      FROM institutions
      WHERE id = $1
    `
    const result = await pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Institute not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error('Error fetching institute:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request, context: any) {
  try {
    await ensureInstitutionsColumns()
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

export async function DELETE(request: Request, context: any) {
  try {
    const params = await context.params
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Institute ID is required' }, { status: 400 })
    }

    const result = await pool.query('DELETE FROM institutions WHERE id = $1 RETURNING id', [id])
    
    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Institute not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Institute deleted successfully' })
  } catch (error) {
    console.error('Error deleting institute:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

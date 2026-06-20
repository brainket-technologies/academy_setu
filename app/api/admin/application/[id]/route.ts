import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await pool.query('SELECT * FROM applications WHERE id = $1 LIMIT 1', [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error fetching application detail:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      school_name, school_code, affiliated_to, affiliation_code,
      contact_person, mobile_no, email_id, address, state, district, pincode,
      principal_name, principal_gender, principal_sign, principal_photo,
      director_name, director_gender, director_sign, director_photo,
      status, enquiry_status 
    } = body

    let query = 'UPDATE applications SET'
    const values: any[] = []
    const updates: string[] = []

    const addField = (name: string, val: any) => {
      if (val !== undefined) {
        updates.push(`${name} = $` + (values.length + 1))
        values.push(val)
      }
    }

    addField('school_name', school_name)
    addField('school_code', school_code)
    addField('affiliated_to', affiliated_to)
    addField('affiliation_code', affiliation_code)
    addField('contact_person', contact_person)
    addField('mobile_no', mobile_no)
    addField('email_id', email_id)
    addField('address', address)
    addField('state', state)
    addField('district', district)
    addField('pincode', pincode)
    addField('principal_name', principal_name)
    addField('principal_gender', principal_gender)
    addField('principal_sign', principal_sign)
    addField('principal_photo', principal_photo)
    addField('director_name', director_name)
    addField('director_gender', director_gender)
    addField('director_sign', director_sign)
    addField('director_photo', director_photo)
    addField('status', status)
    addField('enquiry_status', enquiry_status)

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update.' }, { status: 400 })
    }

    updates.push('updated_at = NOW()')
    query += ' ' + updates.join(', ') + ' WHERE id = $' + (values.length + 1) + ' RETURNING *'
    values.push(id)

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await pool.query('DELETE FROM applications WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Application deleted successfully.' })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

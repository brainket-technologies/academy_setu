import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partyCategory = searchParams.get('party_category') || ''

    let query = 'SELECT * FROM income_parties'
    const params: any[] = []

    if (partyCategory) {
      query += ' WHERE party_category = $1'
      params.push(partyCategory)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Fetch income parties error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, mobile_no, email, party_category, contact_person, amount, gst_no, address } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Party name is required' }, { status: 400 })
    }

    const query = `
      INSERT INTO income_parties (name, mobile_no, email, party_category, contact_person, amount, gst_no, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `
    const result = await pool.query(query, [
      name,
      mobile_no || '',
      email || '',
      party_category || 'Income',
      contact_person || '',
      amount ? parseFloat(amount) : 0,
      gst_no || '',
      address || ''
    ])
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Create income party error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

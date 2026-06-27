import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partyCategory = searchParams.get('party_category') || ''
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('start_date') || ''
    const endDate = searchParams.get('end_date') || ''

    const conditions: string[] = []
    const params: any[] = []

    if (partyCategory) {
      conditions.push(`party_category = $${params.length + 1}`)
      params.push(partyCategory)
    }

    if (search) {
      conditions.push(`(name ILIKE $${params.length + 1} OR contact_person ILIKE $${params.length + 1} OR mobile_no ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`)
      params.push(`%${search}%`)
    }

    if (startDate) {
      conditions.push(`created_at >= $${params.length + 1}`)
      params.push(startDate)
    }

    if (endDate) {
      conditions.push(`created_at <= $${params.length + 1}`)
      params.push(endDate + ' 23:59:59')
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''

    const query = `SELECT * FROM income_parties${whereClause} ORDER BY created_at DESC`
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

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || ''
    const search = searchParams.get('search') || ''
    const filterStateId = searchParams.get('filterStateId') || ''
    
    if (id) {
      const res = await pool.query('SELECT * FROM states_districts WHERE id = $1 LIMIT 1', [id])
      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'State not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: res.rows[0] })
    }

    const params: any[] = []
    let query = 'SELECT * FROM states_districts WHERE 1=1'

    if (search) {
      params.push(`%${search}%`)
      query += ` AND (state_name ILIKE $${params.length} OR EXISTS (SELECT 1 FROM unnest(districts) AS d WHERE d ILIKE $${params.length}))`
    }

    if (filterStateId) {
      params.push(filterStateId)
      query += ` AND id = $${params.length}`
    }

    query += ' ORDER BY state_name ASC'

    const res = await pool.query(query, params)
    return NextResponse.json({
      success: true,
      data: res.rows
    })
  } catch (error) {
    console.error('Fetch states error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { state_name, districts } = body

    if (!state_name) {
      return NextResponse.json({ success: false, error: 'State Name is required' }, { status: 400 })
    }

    // Check uniqueness
    const checkUnique = await pool.query(
      'SELECT id FROM states_districts WHERE LOWER(state_name) = LOWER($1) LIMIT 1',
      [state_name]
    )
    if (checkUnique.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'State Name already exists' }, { status: 400 })
    }

    const res = await pool.query(
      `INSERT INTO states_districts (state_name, districts) VALUES ($1, $2) RETURNING *`,
      [state_name, districts || []]
    )

    return NextResponse.json({
      success: true,
      data: res.rows[0]
    })
  } catch (error) {
    console.error('Create state error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

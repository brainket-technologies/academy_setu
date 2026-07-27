import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  try {
    let query = 'SELECT id, name, menus, description, created_at FROM segments'
    const values: string[] = []

    const conditions: string[] = []
    if (search) {
      conditions.push('(name ILIKE $' + (values.length + 1) + ' OR description ILIKE $' + (values.length + 1) + ')')
      values.push(`%${search}%`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY created_at DESC'
    const result = await pool.query(query, values)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Error fetching segments:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, menus, description } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 })
    }

    const result = await pool.query(
      'INSERT INTO segments (name, menus, description) VALUES ($1, $2, $3) RETURNING *',
      [name, menus || [], description || '']
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error creating segment:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

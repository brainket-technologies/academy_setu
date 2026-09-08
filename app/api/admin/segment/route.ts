import { NextResponse } from 'next/server'
import pool from '@/lib/db'

let _segmentsEnsured = false
async function ensureSegmentsColumns() {
  if (_segmentsEnsured) return
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS segments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        menus TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE segments ADD COLUMN IF NOT EXISTS menus TEXT[] DEFAULT '{}';
      ALTER TABLE segments ADD COLUMN IF NOT EXISTS description TEXT;
    `)
    _segmentsEnsured = true
  } catch (err) {
    console.error('Failed to ensure segments table columns', err)
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  try {
    await ensureSegmentsColumns()
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
    await ensureSegmentsColumns()
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

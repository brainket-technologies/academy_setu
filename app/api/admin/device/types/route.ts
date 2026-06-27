import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function GET() {
  try {
    await ensureShopDb()
    const result = await pool.query('SELECT * FROM device_types ORDER BY name ASC')
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Fetch types error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureShopDb()
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Device type name is required' }, { status: 400 })
    }

    const result = await pool.query(
      'INSERT INTO device_types (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *',
      [name.trim()]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Create type error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

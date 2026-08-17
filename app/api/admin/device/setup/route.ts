import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function GET(request: NextRequest) {
  try {
    await ensureShopDb()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let query = 'SELECT * FROM device_setup'
    const params: any[] = []

    if (search) {
      query += ' WHERE name ILIKE $1 OR model ILIKE $1'
      params.push(`%${search}%`)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Fetch device setup error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureShopDb()
    const body = await request.json()
    const { name, model } = body

    if (!name || !model) {
      return NextResponse.json({ success: false, error: 'Name and model are required' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO device_setup (name, model) VALUES ($1, $2) RETURNING *`,
      [name, model]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Create device setup error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

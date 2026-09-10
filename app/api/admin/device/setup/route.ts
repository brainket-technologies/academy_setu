import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

async function ensureDeviceSetupTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS device_setup (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      device_type VARCHAR(255) DEFAULT '',
      name VARCHAR(255) NOT NULL,
      model VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  await pool.query(`ALTER TABLE device_setup ADD COLUMN IF NOT EXISTS device_type VARCHAR(255) DEFAULT ''`)
}

export async function GET(request: NextRequest) {
  try {
    await ensureDeviceSetupTable()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let query = 'SELECT * FROM device_setup'
    const params: any[] = []

    if (search) {
      query += ' WHERE name ILIKE $1 OR model ILIKE $1 OR COALESCE(device_type, \'\') ILIKE $1'
      params.push(`%${search}%`)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error: any) {
    console.error('Fetch device setup error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDeviceSetupTable()
    const body = await request.json()
    const { device_type = '', name, model } = body

    if (!device_type || !device_type.trim()) {
      return NextResponse.json({ success: false, error: 'Device Type is required' }, { status: 400 })
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Device Name is required' }, { status: 400 })
    }

    if (!model || !model.trim()) {
      return NextResponse.json({ success: false, error: 'Device Model is required' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO device_setup (device_type, name, model, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING *`,
      [device_type.trim(), name.trim(), model.trim()]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error('Create device setup error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

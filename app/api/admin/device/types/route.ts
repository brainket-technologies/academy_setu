import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

async function ensureDeviceTypesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS device_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  await pool.query(`ALTER TABLE device_types ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''`)
  await pool.query(`ALTER TABLE device_types ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active'`)
  await pool.query(`ALTER TABLE device_types ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`)
  await pool.query(`ALTER TABLE device_types ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`)

  // Check if empty and seed initial data
  const countRes = await pool.query('SELECT COUNT(*)::int FROM device_types')
  if (countRes.rows[0].count === 0) {
    await pool.query(`
      INSERT INTO device_types (name, description, status) VALUES 
      ('GPS', 'Real-time vehicle and asset tracking hardware', 'Active'),
      ('Finger Print Sensor', 'Biometric fingerprint scanner for authentication', 'Active'),
      ('Biometric Attendance', 'Automated student and staff attendance device', 'Active'),
      ('RFID Card Reader', 'Radio frequency smart card reader for gate check-in', 'Active')
      ON CONFLICT (name) DO NOTHING
    `)
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDeviceTypesTable()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let query = 'SELECT * FROM device_types'
    const params: any[] = []

    if (search) {
      query += ' WHERE name ILIKE $1 OR COALESCE(description, \'\') ILIKE $1'
      params.push(`%${search}%`)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error: any) {
    console.error('Fetch device types error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDeviceTypesTable()
    const body = await request.json()
    const { name, description = '', status = 'Active' } = body

    const trimmedName = (name || '').trim()
    if (!trimmedName) {
      return NextResponse.json({ success: false, error: 'Device type name is required' }, { status: 400 })
    }

    // Check if name already exists (case-insensitive)
    const existing = await pool.query('SELECT * FROM device_types WHERE LOWER(name) = LOWER($1)', [trimmedName])
    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, error: `Device type "${trimmedName}" already exists` }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO device_types (name, description, status, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING *`,
      [trimmedName, (description || '').trim(), status || 'Active']
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error('Create device type error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

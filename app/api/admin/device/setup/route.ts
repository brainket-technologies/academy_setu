import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

async function ensureDeviceSetupTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS device_setup (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      model VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)

  const countRes = await pool.query('SELECT COUNT(*)::int FROM device_setup')
  if (countRes.rows[0].count === 0) {
    await pool.query(`
      INSERT INTO device_setup (name, model) VALUES 
      ('GPS Tracker', 'TK103'),
      ('Finger Print Sensor', 'ZKTeco K40'),
      ('Biometric Attendance', 'Bio-100'),
      ('RFID Card Reader', 'EM18')
    `)
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDeviceSetupTable()
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
  } catch (error: any) {
    console.error('Fetch device setup error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDeviceSetupTable()
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
  } catch (error: any) {
    console.error('Create device setup error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

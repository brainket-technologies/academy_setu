import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

async function ensureDevicePlansTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS device_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      duration_type VARCHAR(50) DEFAULT 'Days',
      duration INTEGER NOT NULL DEFAULT 30,
      amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      tax_percent NUMERIC(5,2) DEFAULT 18,
      total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Active',
      device_type VARCHAR(255) DEFAULT 'GPS',
      device_name VARCHAR(255) DEFAULT '',
      device_model VARCHAR(255) DEFAULT '',
      imei_no VARCHAR(100) DEFAULT '',
      description TEXT DEFAULT '',
      plan_description TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT ''`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS duration_type VARCHAR(50) DEFAULT 'Days'`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 30`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2) DEFAULT 0`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS tax_percent NUMERIC(5,2) DEFAULT 18`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) DEFAULT 0`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active'`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS device_type VARCHAR(255) DEFAULT 'GPS'`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS device_name VARCHAR(255) DEFAULT ''`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS device_model VARCHAR(255) DEFAULT ''`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS imei_no VARCHAR(100) DEFAULT ''`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS plan_description TEXT DEFAULT ''`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT ''`)
  await pool.query(`ALTER TABLE device_plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`)
}

export async function GET(request: NextRequest) {
  try {
    await ensureDevicePlansTable()
    const { searchParams } = new URL(request.url)
    const deviceName = searchParams.get('deviceName') || searchParams.get('device_name') || ''
    const deviceType = searchParams.get('deviceType') || searchParams.get('device_type') || ''
    const search = searchParams.get('search') || ''

    let query = 'SELECT * FROM device_plans WHERE 1=1'
    const params: any[] = []

    if (deviceName && deviceName !== 'All Devices' && deviceName !== 'Select an Option') {
      params.push(deviceName)
      query += ` AND device_name = $${params.length}`
    }

    if (deviceType && deviceType !== 'All Device Types' && deviceType !== 'Select an Option') {
      params.push(deviceType)
      query += ` AND device_type = $${params.length}`
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`)
      query += ` AND (
        device_name ILIKE $${params.length} 
        OR device_type ILIKE $${params.length} 
        OR COALESCE(device_model, '') ILIKE $${params.length} 
        OR COALESCE(imei_no, '') ILIKE $${params.length} 
        OR name ILIKE $${params.length}
      )`
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error: any) {
    console.error('Fetch plans error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDevicePlansTable()
    const body = await request.json()
    const { 
      name, duration_type, duration, amount, tax_percent, 
      device_type, device_name, device_model = '', imei_no = '', description = '', plan_description = '', image_url = '' 
    } = body

    if (!name || !duration || amount === undefined || amount === null) {
      return NextResponse.json({ success: false, error: 'Plan Name, Duration, and Amount are required' }, { status: 400 })
    }

    const taxPercent = parseFloat(String(tax_percent || '0'))
    const amt = parseFloat(String(amount || '0'))
    const total = amt + (amt * (taxPercent / 100))

    const result = await pool.query(
      `INSERT INTO device_plans 
       (name, duration_type, duration, amount, tax_percent, total_amount, status, device_type, device_name, device_model, imei_no, description, plan_description, image_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'Active', $7, $8, $9, $10, $11, $12, $13, NOW())
       RETURNING *`,
      [
        name.trim(), duration_type || 'Days', parseInt(String(duration)), amt, taxPercent, total,
        device_type || 'GPS', device_name || '', device_model || '', imei_no || '',
        description || '', plan_description || '', image_url || ''
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error('Create plan error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

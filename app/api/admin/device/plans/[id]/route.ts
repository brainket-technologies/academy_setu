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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDevicePlansTable()
    const { id } = await context.params
    const body = await request.json()
    const { 
      name, duration_type, duration, amount, tax_percent, status,
      device_type, device_name, device_model = '', imei_no = '', description = '', plan_description = '', image_url = ''
    } = body

    const taxPercent = parseFloat(String(tax_percent || '0'))
    const amt = parseFloat(String(amount || '0'))
    const total = amt + (amt * (taxPercent / 100))

    const result = await pool.query(
      `UPDATE device_plans 
       SET name = $1, duration_type = $2, duration = $3, amount = $4, tax_percent = $5, total_amount = $6, status = $7,
           device_type = $8, device_name = $9, device_model = $10, imei_no = $11, description = $12, plan_description = $13, image_url = $14
       WHERE id = $15 
       RETURNING *`,
      [
        name.trim(), duration_type || 'Days', parseInt(String(duration)), amt, taxPercent, total, status || 'Active',
        device_type, device_name, device_model, imei_no, description, plan_description, image_url,
        id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error('Update plan error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDevicePlansTable()
    const { id } = await context.params
    const result = await pool.query('DELETE FROM device_plans WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete plan error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

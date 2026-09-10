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
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDeviceTypesTable()
    const { id } = await context.params
    const body = await request.json()
    const { name, description = '', status = 'Active' } = body

    const trimmedName = (name || '').trim()
    if (!trimmedName) {
      return NextResponse.json({ success: false, error: 'Device type name is required' }, { status: 400 })
    }

    // Check duplicate name on different id
    const existing = await pool.query(
      'SELECT * FROM device_types WHERE LOWER(name) = LOWER($1) AND id != $2',
      [trimmedName, id]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, error: `Device type "${trimmedName}" already exists` }, { status: 400 })
    }

    const result = await pool.query(
      `UPDATE device_types 
       SET name = $1, description = $2, status = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING *`,
      [trimmedName, (description || '').trim(), status || 'Active', id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Device type not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error('Update device type error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDeviceTypesTable()
    const { id } = await context.params

    const result = await pool.query(
      `DELETE FROM device_types WHERE id = $1 RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Device type not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error('Delete device type error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

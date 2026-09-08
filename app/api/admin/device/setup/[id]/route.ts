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
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDeviceSetupTable()
    const { id } = await context.params
    const body = await request.json()
    const { name, model } = body

    if (!name || !model) {
      return NextResponse.json({ success: false, error: 'Name and model are required' }, { status: 400 })
    }

    const result = await pool.query(
      `UPDATE device_setup SET name = $1, model = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [name, model, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error('Update device setup error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDeviceSetupTable()
    const { id } = await context.params

    const result = await pool.query(
      `DELETE FROM device_setup WHERE id = $1 RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error('Delete device setup error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

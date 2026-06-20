import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, services, description } = body

    if (!name || !services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json({ success: false, error: 'Name and services are required.' }, { status: 400 })
    }

    const result = await pool.query(
      'UPDATE segments SET name = $1, services = $2, description = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, services, description || '', id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Segment not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error updating segment:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await pool.query('DELETE FROM segments WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Segment not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Segment deleted successfully.' })
  } catch (error) {
    console.error('Error deleting segment:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

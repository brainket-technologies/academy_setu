import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    const res = await pool.query('DELETE FROM states_districts WHERE id = $1 RETURNING id', [id])
    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'State not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'State deleted successfully'
    })
  } catch (error) {
    console.error('Delete state error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    const body = await request.json()
    const { state_name, districts } = body

    if (!state_name) {
      return NextResponse.json({ success: false, error: 'State Name is required' }, { status: 400 })
    }

    // Check uniqueness excluding current ID
    const checkUnique = await pool.query(
      'SELECT id FROM states_districts WHERE LOWER(state_name) = LOWER($1) AND id <> $2 LIMIT 1',
      [state_name, id]
    )
    if (checkUnique.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'State Name already exists' }, { status: 400 })
    }

    const res = await pool.query(
      `UPDATE states_districts SET state_name = $1, districts = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [state_name, districts || [], id]
    )

    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'State not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0]
    })
  } catch (error) {
    console.error('Update state error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

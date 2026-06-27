import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query('SELECT * FROM ticket_categories WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      name, parent_category, segment, 
      low_timeline, medium_timeline, high_timeline,
      is_deleted
    } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    // Build dynamic update query
    const updates: string[] = []
    const paramsList: (string | number | boolean)[] = []

    const addUpdate = (field: string, val: string | number | boolean | undefined) => {
      if (val !== undefined) {
        paramsList.push(val)
        updates.push(`${field} = $${paramsList.length}`)
      }
    }

    addUpdate('name', name)
    addUpdate('parent_category', parent_category)
    addUpdate('segment', segment)
    addUpdate('low_timeline', low_timeline)
    addUpdate('medium_timeline', medium_timeline)
    addUpdate('high_timeline', high_timeline)
    addUpdate('is_deleted', is_deleted)

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    paramsList.push(id)
    const query = `UPDATE ticket_categories SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramsList.length} RETURNING *`
    
    const result = await pool.query(query, paramsList)

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    // Check if category is already soft-deleted
    const checkRes = await pool.query('SELECT is_deleted FROM ticket_categories WHERE id = $1', [id])
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    const { is_deleted } = checkRes.rows[0]

    if (is_deleted) {
      // Permanent delete
      await pool.query('DELETE FROM ticket_categories WHERE id = $1', [id])
      return NextResponse.json({ success: true, message: 'Category permanently deleted' })
    } else {
      // Soft delete
      await pool.query('UPDATE ticket_categories SET is_deleted = true, updated_at = NOW() WHERE id = $1', [id])
      return NextResponse.json({ success: true, message: 'Category moved to trash (soft-deleted)' })
    }
  } catch (error) {
    console.error('Category delete error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

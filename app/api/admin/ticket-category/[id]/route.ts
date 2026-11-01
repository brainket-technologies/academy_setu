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

    if (!name && is_deleted === undefined) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    // If parent_category is provided, ensure it's registered
    if (parent_category) {
      await pool.query(`
        INSERT INTO ticket_parent_categories (name, created_at, updated_at)
        VALUES ($1, NOW(), NOW())
        ON CONFLICT (name) DO UPDATE SET is_deleted = false, updated_at = NOW()
      `, [parent_category])
    }

    // Build dynamic update query
    const updates: string[] = []
    const paramsList: (string | number | boolean | null)[] = []

    const addUpdate = (field: string, val: string | number | boolean | undefined | null) => {
      if (val !== undefined) {
        paramsList.push(val)
        updates.push(`${field} = $${paramsList.length}`)
      }
    }

    if (name) addUpdate('name', name)
    if (parent_category !== undefined) addUpdate('parent_category', parent_category)
    if (segment !== undefined) addUpdate('segment', segment)
    if (low_timeline !== undefined) addUpdate('low_timeline', low_timeline)
    if (medium_timeline !== undefined) addUpdate('medium_timeline', medium_timeline)
    if (high_timeline !== undefined) addUpdate('high_timeline', high_timeline)
    if (is_deleted !== undefined) addUpdate('is_deleted', is_deleted)

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    paramsList.push(id)
    const query = `UPDATE ticket_categories SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramsList.length} RETURNING *`
    
    const result = await pool.query(query, paramsList)

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Subcategory not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Subcategory update error:', error)
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
      return NextResponse.json({ success: true, message: 'Subcategory permanently deleted' })
    } else {
      // Soft delete
      await pool.query('UPDATE ticket_categories SET is_deleted = true, updated_at = NOW() WHERE id = $1', [id])
      return NextResponse.json({ success: true, message: 'Subcategory moved to trash (soft-deleted)' })
    }
  } catch (error) {
    console.error('Category delete error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

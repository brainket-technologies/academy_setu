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

    const query = `DELETE FROM income_categories WHERE id = $1 RETURNING *`
    const result = await pool.query(query, [id])

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    console.error('Delete income category error:', error)
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
    const { name, description, category_type } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 })
    }

    const query = `
      UPDATE income_categories
      SET name = $1, description = $2, category_type = $3
      WHERE id = $4
      RETURNING *
    `
    const result = await pool.query(query, [name, description || '', category_type || 'Income', id])

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Update income category error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

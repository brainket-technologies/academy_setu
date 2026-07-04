import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query(`
      SELECT t.*, 
        i.name as school_name, i.state as school_state, i.district as school_district,
        tc.name as category_name
      FROM tickets t
      LEFT JOIN institutions i ON t.institution_id = i.id
      LEFT JOIN ticket_categories tc ON t.category_id = tc.id
      WHERE t.id = $1
    `, [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
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
      assigned_to, status, priority, description, category_id,
      sub_category, complainer_name, complainer_mobile, institution_id
    } = body

    const updates: string[] = []
    const paramsList: (string | number | null | undefined)[] = []

    const addUpdate = (field: string, val: string | number | null | undefined) => {
      if (val !== undefined) {
        paramsList.push(val)
        updates.push(`${field} = $${paramsList.length}`)
      }
    }

    addUpdate('assigned_to', assigned_to)
    addUpdate('status', status)
    addUpdate('priority', priority)
    addUpdate('description', description)
    addUpdate('category_id', category_id)
    addUpdate('sub_category', sub_category)
    addUpdate('complainer_name', complainer_name)
    addUpdate('complainer_mobile', complainer_mobile)
    addUpdate('institution_id', institution_id)

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    paramsList.push(id)
    const query = `UPDATE tickets SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramsList.length} RETURNING *`
    
    const result = await pool.query(query, paramsList)
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Ticket update error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query('DELETE FROM tickets WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Ticket deleted successfully' })
  } catch (error) {
    console.error('Ticket delete error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

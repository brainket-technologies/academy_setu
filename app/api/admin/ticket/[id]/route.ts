import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query('SELECT * FROM tickets WHERE id = $1', [id])
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
      assigned_to, status, priority, description, ticket_category, sub_category,
      complainer_name, complainer_mobile
    } = body

    // Build dynamic update query
    const updates: string[] = []
    const paramsList: (string | number)[] = []

    const addUpdate = (field: string, val: string | number | undefined) => {
      if (val !== undefined) {
        paramsList.push(val)
        updates.push(`${field} = $${paramsList.length}`)
      }
    }

    addUpdate('assigned_to', assigned_to)
    addUpdate('status', status)
    addUpdate('priority', priority)
    addUpdate('description', description)
    addUpdate('ticket_category', ticket_category)
    addUpdate('sub_category', sub_category)
    addUpdate('complainer_name', complainer_name)
    addUpdate('complainer_mobile', complainer_mobile)

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

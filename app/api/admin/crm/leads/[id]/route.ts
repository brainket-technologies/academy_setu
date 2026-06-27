import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    // Fetch lead details
    const leadRes = await pool.query('SELECT * FROM leads WHERE id = $1', [id])
    if (leadRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    // Fetch history
    const historyRes = await pool.query(
      'SELECT * FROM lead_history WHERE lead_id = $1 ORDER BY created_at DESC',
      [id]
    )

    const lead = leadRes.rows[0]
    lead.history = historyRes.rows

    return NextResponse.json({ success: true, data: lead })
  } catch (error) {
    console.error('Lead fetch detail error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { assigned_to, status } = body

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

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    paramsList.push(id)
    const query = `UPDATE leads SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramsList.length} RETURNING *`
    
    const result = await pool.query(query, paramsList)

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Lead update error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query('DELETE FROM leads WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Lead deleted successfully' })
  } catch (error) {
    console.error('Lead delete error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

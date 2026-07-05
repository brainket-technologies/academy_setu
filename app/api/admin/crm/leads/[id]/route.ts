import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { apiCache } from '@/lib/api-cache'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    // Fetch lead details with joined status and assigned user
    const leadRes = await pool.query(`
      SELECT l.*, 
        ls.name as status, ls.text_color as status_text_color, ls.bg_color as status_bg_color,
        a.name as assigned_to_name
      FROM leads l
      LEFT JOIN lead_statuses ls ON l.status_id = ls.id
      LEFT JOIN admins a ON l.assigned_to = a.id
      WHERE l.id = $1
    `, [id])
    if (leadRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    // Fetch history
    const historyRes = await pool.query(
      `SELECT lh.*, ls.name as status_name, ls.text_color, ls.bg_color 
       FROM lead_history lh
       LEFT JOIN lead_statuses ls ON lh.status_id = ls.id
       WHERE lh.lead_id = $1 ORDER BY lh.created_at DESC`,
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
    const { assigned_to, assigned_to_id, status_id, status, institution_name, state, district, contact_person, mobile_no, no_of_students } = body

    // Build dynamic update query
    const updates: string[] = []
    const paramsList: (string | number | null)[] = []

    const addUpdate = (field: string, val: string | number | null | undefined) => {
      if (val !== undefined) {
        paramsList.push(val)
        updates.push(`${field} = $${paramsList.length}`)
      }
    }

    let finalAssignedToId = assigned_to_id
    if (assigned_to === '') {
      finalAssignedToId = null // allow un-assigning
    } else if (!finalAssignedToId && assigned_to) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assigned_to)) {
        finalAssignedToId = assigned_to
      } else {
        const adminRes = await pool.query('SELECT id FROM admins WHERE name = $1 LIMIT 1', [assigned_to])
        if (adminRes.rows.length > 0) finalAssignedToId = adminRes.rows[0].id
      }
    }
    addUpdate('assigned_to', finalAssignedToId)
    addUpdate('institution_name', institution_name)
    addUpdate('state', state)
    addUpdate('district', district)
    addUpdate('contact_person', contact_person)
    addUpdate('mobile_no', mobile_no)
    addUpdate('no_of_students', no_of_students)

    // If status name provided instead of id, resolve it
    let finalStatusId = status_id
    if (!finalStatusId && status) {
      const statusRes = await pool.query('SELECT id FROM lead_statuses WHERE name = $1 LIMIT 1', [status])
      if (statusRes.rows.length > 0) finalStatusId = statusRes.rows[0].id
    }
    addUpdate('status_id', finalStatusId)

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    paramsList.push(id)
    const query = `UPDATE leads SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramsList.length} RETURNING *`
    
    const result = await pool.query(query, paramsList)

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    // Invalidate cache so UI refreshes immediately
    if (global._apiCache) {
      global._apiCache.invalidate('leads:')
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

    if (global._apiCache) {
      global._apiCache.invalidate('leads:')
    }
    return NextResponse.json({ success: true, message: 'Lead deleted successfully' })
  } catch (error) {
    console.error('Lead delete error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

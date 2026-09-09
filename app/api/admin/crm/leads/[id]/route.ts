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
        COALESCE(l.institution_name, '') as school_name,
        ls.name as status, ls.text_color as status_text_color, ls.bg_color as status_bg_color,
        a.name as assigned_user_name,
        a.role as assigned_user_role
      FROM leads l
      LEFT JOIN lead_statuses ls ON l.status_id = ls.id
      LEFT JOIN admins a ON a.id::text = COALESCE(l.assigned_to_id::text, l.assigned_to::text)
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
    const { 
      assigned_to, assigned_to_id, status_id, status, 
      institution_name, school_name, lead_source, email_id,
      state, district, contact_person, mobile_no, no_of_students,
      follow_up_date 
    } = body

    const updates: string[] = []
    const paramsList: (string | number | null)[] = []

    const addUpdate = (field: string, val: string | number | null | undefined) => {
      if (val !== undefined) {
        paramsList.push(val)
        updates.push(`${field} = $${paramsList.length}`)
      }
    }

    let finalAssignedToId = assigned_to_id
    if (assigned_to === '' || assigned_to_id === null) {
      finalAssignedToId = null
    } else if (!finalAssignedToId && assigned_to) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assigned_to)) {
        finalAssignedToId = assigned_to
      } else {
        const adminRes = await pool.query('SELECT id FROM admins WHERE name = $1 LIMIT 1', [assigned_to])
        if (adminRes.rows.length > 0) finalAssignedToId = adminRes.rows[0].id
      }
    }

    if (assigned_to !== undefined || assigned_to_id !== undefined) {
      addUpdate('assigned_to_id', finalAssignedToId)
      try {
        await pool.query('UPDATE leads SET assigned_to = $1 WHERE id = $2', [finalAssignedToId, id])
      } catch {
        // ignore if column assigned_to is missing or constraint error
      }
    }

    const targetSchoolName = school_name !== undefined ? school_name : institution_name
    if (targetSchoolName !== undefined) {
      addUpdate('institution_name', targetSchoolName)
    }

    if (lead_source !== undefined) addUpdate('lead_source', lead_source)
    if (email_id !== undefined) addUpdate('email_id', email_id)
    if (state !== undefined) addUpdate('state', state)
    if (district !== undefined) addUpdate('district', district)
    if (contact_person !== undefined) addUpdate('contact_person', contact_person)
    if (mobile_no !== undefined) {
      const cleanMobile = String(mobile_no).trim().replace(/\D/g, '')
      if (cleanMobile.length !== 10) {
        return NextResponse.json({ 
          success: false, 
          error: 'Mobile Number must be exactly 10 digits' 
        }, { status: 400 })
      }
      addUpdate('mobile_no', cleanMobile)
    }
    if (no_of_students !== undefined) addUpdate('no_of_students', no_of_students)

    // Resolve status_id
    let finalStatusId = status_id
    if (!finalStatusId && status) {
      const statusRes = await pool.query(
        'SELECT id FROM lead_statuses WHERE LOWER(name) = LOWER($1) OR id::text = $1 LIMIT 1', 
        [status]
      )
      if (statusRes.rows.length > 0) finalStatusId = statusRes.rows[0].id
    }
    if (finalStatusId !== undefined) {
      addUpdate('status_id', finalStatusId)
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    paramsList.push(id)
    const query = `UPDATE leads SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramsList.length} RETURNING *`
    
    const result = await pool.query(query, paramsList)

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    // Insert history log if follow_up_date was provided
    if (follow_up_date) {
      try {
        await pool.query(
          `INSERT INTO lead_history (lead_id, communication_option, call_duration, remarks, follow_up_date, status_id, created_at)
           VALUES ($1, 'Message', '', 'Lead updated', $2, $3, NOW())`,
          [id, follow_up_date, finalStatusId || result.rows[0].status_id]
        )
      } catch {
        await pool.query(
          `INSERT INTO lead_history (lead_id, communication_option, call_duration, remarks, follow_up_date, status, created_at)
           VALUES ($1, 'Message', '', 'Lead updated', $2, $3, NOW())`,
          [id, follow_up_date, status || 'Updated']
        )
      }
    }

    // Invalidate cache so UI refreshes immediately
    apiCache.clear()
    if (global._apiCache) {
      global._apiCache.clear()
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

    apiCache.clear()
    if (global._apiCache) {
      global._apiCache.clear()
    }
    return NextResponse.json({ success: true, message: 'Lead deleted successfully' })
  } catch (error) {
    console.error('Lead delete error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

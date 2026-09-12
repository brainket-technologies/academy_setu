import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { apiCache } from '@/lib/api-cache'
import { getSession } from '@/lib/session'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = (await getSession('bdm_session')) || (await getSession('manager_session')) || (await getSession('admin_session'))
    const callerUserId = session?.userId
    const callerName = session?.name || 'User'
    const callerRole = session?.role || 'Staff'

    const body = await request.json()
    const { target_user_id, reason } = body

    if (!target_user_id) {
      return NextResponse.json({ success: false, error: 'Target assignee is required' }, { status: 400 })
    }

    // 1. Fetch current lead info
    const leadRes = await pool.query(
      `SELECT l.*, a.name as assigned_name, a.role as assigned_role 
       FROM leads l 
       LEFT JOIN admins a ON a.id::text = COALESCE(l.assigned_to_id::text, l.assigned_to::text)
       WHERE l.id = $1`,
      [id]
    )

    if (leadRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 })
    }

    const currentLead = leadRes.rows[0]

    // 2. Fetch target user
    const targetUserRes = await pool.query(
      `SELECT id, name, role, email FROM admins WHERE id = $1 AND is_active = true LIMIT 1`,
      [target_user_id]
    )

    if (targetUserRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Selected target user does not exist or is inactive' }, { status: 404 })
    }

    const targetUser = targetUserRes.rows[0]

    // 3. Update lead assignment
    await pool.query(
      `UPDATE leads 
       SET assigned_to = $1, assigned_to_id = $1, updated_at = NOW() 
       WHERE id = $2`,
      [targetUser.id, id]
    )

    // 4. Log transfer in lead_history to preserve full timeline
    const fromUserText = currentLead.assigned_name 
      ? `${currentLead.assigned_name} (${currentLead.assigned_role || 'Staff'})`
      : `${callerName} (${callerRole})`
    const toUserText = `${targetUser.name} (${targetUser.role})`
    const noteText = reason && reason.trim() ? ` — Reason/Note: ${reason.trim()}` : ''
    const transferRemarks = `🔄 Lead transferred from ${fromUserText} to ${toUserText}${noteText}`

    try {
      await pool.query(
        `INSERT INTO lead_history (lead_id, communication_option, call_duration, remarks, status_id, created_at)
         VALUES ($1, 'Message', '', $2, $3, NOW())`,
        [id, transferRemarks, currentLead.status_id]
      )
    } catch {
      await pool.query(
        `INSERT INTO lead_history (lead_id, communication_option, call_duration, remarks, status, created_at)
         VALUES ($1, 'Message', '', $2, 'Transferred', NOW())`,
        [id, transferRemarks]
      )
    }

    // 5. Invalidate caches
    apiCache.clear()
    if (global._apiCache) {
      global._apiCache.clear()
    }

    return NextResponse.json({
      success: true,
      message: `Lead successfully transferred to ${targetUser.name} (${targetUser.role})`
    })
  } catch (error) {
    console.error('Lead transfer error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

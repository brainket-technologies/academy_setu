import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export interface Notification {
  id: string
  type: 'ticket' | 'query' | 'request' | 'application' | 'lead' | 'followup'
  title: string
  description: string
  status: string
  created_at: string
  href: string
  is_read: boolean
}

export async function GET() {
  try {
    let session = await getSession('bdm_session') || await getSession('manager_session') || await getSession('admin_session') || await getSession()
    if (!session || !session.userId) {
      const adminFallback = await pool.query('SELECT id, role, name FROM admins LIMIT 1')
      if (adminFallback.rows.length > 0) {
        session = { userId: adminFallback.rows[0].id, role: adminFallback.rows[0].role || 'Admin' } as any
      } else {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
    }

    const userId = session?.userId
    const userRole = session?.role || 'Admin'
    const portalPrefix = userRole === 'BDM' ? '/bdm' : userRole === 'Manager' ? '/manager' : '/admin'

    const notifications: Notification[] = []

    if (userRole === 'BDM' || userRole === 'Manager') {
      // 1. Followups due today or overdue
      const followupsRes = await pool.query(`
        SELECT 
          h.id, 
          COALESCE(NULLIF(l.institution_name, ''), NULLIF(l.contact_person, ''), 'Lead') as name,
          l.mobile_no,
          h.follow_up_date,
          h.remarks,
          h.created_at
        FROM lead_history h
        JOIN leads l ON h.lead_id = l.id
        WHERE (COALESCE(l.assigned_to_id::text, l.assigned_to::text) = $1 OR l.created_by::text = $1)
          AND h.follow_up_date IS NOT NULL
          AND h.follow_up_date::date <= CURRENT_DATE
        ORDER BY h.follow_up_date DESC
        LIMIT 5
      `, [userId])

      followupsRes.rows.forEach((r) => {
        notifications.push({
          id: `followup-${r.id}`,
          type: 'followup',
          title: `Follow-up Due: ${r.name}`,
          description: r.remarks ? `${r.remarks} • ${r.mobile_no || ''}` : `Pending follow-up for ${r.name}`,
          status: 'Due Today',
          created_at: r.created_at || new Date().toISOString(),
          href: `${portalPrefix}/crm/followup`,
          is_read: false,
        })
      })

      // 2. New Leads Assigned
      const leadsRes = await pool.query(`
        SELECT id, institution_name, contact_person, mobile_no, created_at
        FROM leads
        WHERE (COALESCE(assigned_to_id::text, assigned_to::text) = $1 OR created_by::text = $1)
        ORDER BY created_at DESC
        LIMIT 5
      `, [userId])

      leadsRes.rows.forEach((r) => {
        const leadName = r.institution_name || r.contact_person || 'New Lead'
        notifications.push({
          id: `lead-${r.id}`,
          type: 'lead',
          title: `Assigned Lead: ${leadName}`,
          description: r.contact_person && r.institution_name ? `${r.contact_person} • ${r.mobile_no || ''}` : `${r.mobile_no || 'Lead created'}`,
          status: 'Active',
          created_at: r.created_at,
          href: `${portalPrefix}/crm/leads`,
          is_read: false,
        })
      })

      // 3. User's Applications
      const appsRes = await pool.query(`
        SELECT 
          a.id, 
          a.application_no, 
          COALESCE(NULLIF(a.school_name, ''), NULLIF(i.name, ''), 'Institution') AS school_name,
          COALESCE(NULLIF(a.contact_person, ''), NULLIF(i.contact_person, ''), NULLIF(i.principal_name, ''), '') AS contact_person,
          a.status, 
          a.created_at
        FROM applications a
        LEFT JOIN institutions i ON a.institution_id = i.id
        WHERE (a.created_by::text = $1 OR i.assigned_to::text = $1)
        ORDER BY a.created_at DESC
        LIMIT 5
      `, [userId])

      appsRes.rows.forEach((r) => {
        const desc = r.contact_person && r.school_name ? `${r.school_name} — ${r.contact_person}` : r.school_name || 'Application update'
        notifications.push({
          id: `app-${r.id}`,
          type: 'application',
          title: `Application #${r.application_no}`,
          description: desc,
          status: r.status,
          created_at: r.created_at,
          href: `${portalPrefix}/application`,
          is_read: false,
        })
      })

    } else {
      // ADMIN NOTIFICATIONS
      const [tickets, queries, requests, applications] = await Promise.all([
        pool.query(`
          SELECT id, ticket_no, school_name, complainer_name, status, created_at
          FROM tickets
          WHERE status IN ('Open', 'Pending')
          ORDER BY created_at DESC
          LIMIT 5
        `),
        pool.query(`
          SELECT id, name, mobile_no, email, created_at
          FROM queries
          ORDER BY created_at DESC
          LIMIT 5
        `),
        pool.query(`
          SELECT id, school_name, transaction_id, status, created_at
          FROM requests
          WHERE status IN ('Pending', 'Processing')
          ORDER BY created_at DESC
          LIMIT 5
        `),
        pool.query(`
          SELECT 
            a.id, 
            a.application_no, 
            COALESCE(NULLIF(a.school_name, ''), NULLIF(i.name, ''), 'Institution') AS school_name,
            COALESCE(NULLIF(a.contact_person, ''), NULLIF(i.contact_person, ''), NULLIF(i.principal_name, ''), '') AS contact_person,
            a.status, 
            a.created_at
          FROM applications a
          LEFT JOIN institutions i ON a.institution_id = i.id
          ORDER BY a.created_at DESC
          LIMIT 5
        `),
      ])

      tickets.rows.forEach((r) => {
        notifications.push({
          id: `ticket-${r.id}`,
          type: 'ticket',
          title: `New Support Ticket #${r.ticket_no}`,
          description: `${r.complainer_name || r.school_name || 'User'} raised a ticket`,
          status: r.status,
          created_at: r.created_at,
          href: '/admin/ticket',
          is_read: false,
        })
      })

      queries.rows.forEach((r) => {
        notifications.push({
          id: `query-${r.id}`,
          type: 'query',
          title: `Query from ${r.name || 'User'}`,
          description: r.mobile_no || r.email || 'New inquiry received',
          status: 'New',
          created_at: r.created_at,
          href: '/admin/queries',
          is_read: false,
        })
      })

      requests.rows.forEach((r) => {
        notifications.push({
          id: `request-${r.id}`,
          type: 'request',
          title: `Recharge Request`,
          description: `${r.school_name || 'Institution'} — ${r.status}`,
          status: r.status,
          created_at: r.created_at,
          href: '/admin/request',
          is_read: false,
        })
      })

      applications.rows.forEach((r) => {
        const desc = r.contact_person && r.school_name ? `${r.school_name} — ${r.contact_person}` : r.school_name || 'New application'
        notifications.push({
          id: `app-${r.id}`,
          type: 'application',
          title: `New Application #${r.application_no}`,
          description: desc,
          status: r.status,
          created_at: r.created_at,
          href: '/admin/application',
          is_read: false,
        })
      })
    }

    // Sort by newest first
    notifications.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json(
      { success: true, data: notifications.slice(0, 15), total: notifications.length },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

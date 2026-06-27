import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export interface Notification {
  id: string
  type: 'ticket' | 'query' | 'request' | 'application'
  title: string
  description: string
  status: string
  created_at: string
  href: string
  is_read: boolean
}

export async function GET() {
  try {
    // Run all queries in parallel for maximum speed
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
        SELECT id, application_no, school_name, contact_person, status, created_at
        FROM applications
        WHERE status IN ('Applied', 'Requested')
        ORDER BY created_at DESC
        LIMIT 5
      `),
    ])

    const notifications: Notification[] = [
      ...tickets.rows.map((r) => ({
        id: `ticket-${r.id}`,
        type: 'ticket' as const,
        title: `New Support Ticket #${r.ticket_no}`,
        description: `${r.complainer_name || r.school_name} raised a ticket`,
        status: r.status,
        created_at: r.created_at,
        href: '/admin/ticket',
        is_read: false,
      })),
      ...queries.rows.map((r) => ({
        id: `query-${r.id}`,
        type: 'query' as const,
        title: `Query from ${r.name}`,
        description: r.mobile_no || r.email || 'New inquiry received',
        status: 'New',
        created_at: r.created_at,
        href: '/admin/queries',
        is_read: false,
      })),
      ...requests.rows.map((r) => ({
        id: `request-${r.id}`,
        type: 'request' as const,
        title: `Recharge Request`,
        description: `${r.school_name} — ${r.status}`,
        status: r.status,
        created_at: r.created_at,
        href: '/admin/request',
        is_read: false,
      })),
      ...applications.rows.map((r) => ({
        id: `app-${r.id}`,
        type: 'application' as const,
        title: `New Application #${r.application_no}`,
        description: `${r.school_name} — ${r.contact_person || ''}`,
        status: r.status,
        created_at: r.created_at,
        href: '/admin/application',
        is_read: false,
      })),
    ]

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

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Gather all potential contacts from admins (managers/bdm/admin), institutions, and distributors
    const allContactsRes = await pool.query(`
      SELECT name, role as type FROM admins WHERE name != 'Super Admin' AND is_active = true
      UNION ALL
      SELECT name, 'Institute' as type FROM institutions WHERE status = 'Active'
      UNION ALL
      SELECT name, 'Distributor' as type FROM distributors WHERE status = 'Active'
    `)
    const allContacts = allContactsRes.rows // [{ name, type }]
    const data = []

    for (const { name: contact, type } of allContacts) {
      // Fetch latest message between Super Admin and this contact
      const latestRes = await pool.query(
        `SELECT * FROM messages 
         WHERE (sender = $1 AND receiver = 'Super Admin') 
            OR (sender = 'Super Admin' AND receiver = $1)
         ORDER BY created_at DESC LIMIT 1`,
        [contact]
      )

      // Fetch unread count for messages sent from this contact to Super Admin
      const unreadRes = await pool.query(
        `SELECT COUNT(*)::int FROM messages 
         WHERE sender = $1 AND receiver = 'Super Admin' AND is_read = false`,
        [contact]
      )

      const msg = latestRes.rows[0]
      data.push({
        contact,
        type,
        latest_message: msg?.message || '',
        latest_timestamp: msg?.created_at || null,
        unread_count: unreadRes.rows[0].count,
        latest_sender: msg?.sender || ''
      })
    }

    // Sort contacts: those with messages first, ordered by latest message timestamp DESC, rest alphabetically
    data.sort((a, b) => {
      if (a.latest_timestamp && !b.latest_timestamp) return -1
      if (!a.latest_timestamp && b.latest_timestamp) return 1
      if (a.latest_timestamp && b.latest_timestamp) {
        return new Date(b.latest_timestamp).getTime() - new Date(a.latest_timestamp).getTime()
      }
      return a.contact.localeCompare(b.contact)
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Fetch conversations error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { receiver, message } = body

    if (!receiver || !message) {
      return NextResponse.json({ success: false, error: 'Receiver and message content are required' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO messages (sender, receiver, message, is_read, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      ['Super Admin', receiver, message, false]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

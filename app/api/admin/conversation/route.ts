import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const contacts = ['Manager', 'BDM', 'Admin']
    const data = []

    for (const contact of contacts) {
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

      if (latestRes.rows.length > 0) {
        const msg = latestRes.rows[0]
        data.push({
          contact,
          latest_message: msg.message,
          latest_timestamp: msg.created_at,
          unread_count: unreadRes.rows[0].count,
          latest_sender: msg.sender
        })
      } else {
        data.push({
          contact,
          latest_message: '',
          latest_timestamp: null,
          unread_count: 0,
          latest_sender: ''
        })
      }
    }

    // Sort contacts: those with messages first, ordered by latest message timestamp DESC
    data.sort((a, b) => {
      if (!a.latest_timestamp) return 1
      if (!b.latest_timestamp) return -1
      return new Date(b.latest_timestamp).getTime() - new Date(a.latest_timestamp).getTime()
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

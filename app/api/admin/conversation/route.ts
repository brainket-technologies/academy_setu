import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

async function resolveCurrentSession(request: NextRequest) {
  const referer = request.headers.get('referer') || ''
  const searchParams = request.nextUrl.searchParams
  const portalParam = searchParams.get('portal') || ''

  const isBdm = portalParam === 'bdm' || referer.includes('/bdm/') || referer.endsWith('/bdm')
  const isMgr = portalParam === 'manager' || referer.includes('/manager/') || referer.endsWith('/manager')
  const isAdm = portalParam === 'admin' || referer.includes('/admin/') || referer.endsWith('/admin')
  const isInst = portalParam === 'institute' || referer.includes('/institute/') || referer.endsWith('/institute')
  const isDist = portalParam === 'distributor' || referer.includes('/distributor/') || referer.endsWith('/distributor')

  const admS = await getSession('admin_session')
  const bdmS = await getSession('bdm_session')
  const mgrS = await getSession('manager_session')
  const instS = await getSession('institute_session')
  const distS = await getSession('distributor_session')

  let session = null
  if (isBdm && bdmS) session = bdmS
  else if (isMgr && mgrS) session = mgrS
  else if (isAdm && admS) session = admS
  else if (isInst && instS) session = instS
  else if (isDist && distS) session = distS
  else {
    session = admS || bdmS || mgrS || instS || distS
  }

  let currentUserId = session?.userId
  let currentUserName = session?.name
  let currentUserRole = session?.role

  if (!currentUserId) {
    if (isBdm) {
      const bdmUser = await pool.query(`SELECT id, name, role FROM admins WHERE role = 'BDM' LIMIT 1`)
      if (bdmUser.rows.length > 0) {
        currentUserId = bdmUser.rows[0].id
        currentUserName = bdmUser.rows[0].name
        currentUserRole = bdmUser.rows[0].role
      }
    } else if (isMgr) {
      const mgrUser = await pool.query(`SELECT id, name, role FROM admins WHERE role = 'Manager' LIMIT 1`)
      if (mgrUser.rows.length > 0) {
        currentUserId = mgrUser.rows[0].id
        currentUserName = mgrUser.rows[0].name
        currentUserRole = mgrUser.rows[0].role
      }
    } else {
      const defaultAdmin = await pool.query(`SELECT id, name, role FROM admins WHERE role = 'Admin' LIMIT 1`)
      if (defaultAdmin.rows.length > 0) {
        currentUserId = defaultAdmin.rows[0].id
        currentUserName = defaultAdmin.rows[0].name
        currentUserRole = defaultAdmin.rows[0].role
      }
    }
  }

  return {
    userId: currentUserId || '00000000-0000-0000-0000-000000000000',
    name: currentUserName || 'Super Admin',
    role: currentUserRole || 'Admin'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: currentUserId, name: currentUserName, role: currentUserRole } = await resolveCurrentSession(request)

    // Gather contacts: exclude current user by ID and name
    const allContactsRes = await pool.query(`
      SELECT DISTINCT id, name, type FROM (
        SELECT id, name, role as type FROM admins WHERE id != $1 AND LOWER(name) != LOWER($2) AND is_active = true
        UNION ALL
        SELECT id, name, 'Institute' as type FROM institutions WHERE id != $1 AND LOWER(name) != LOWER($2) AND name IS NOT NULL AND name != '' AND status = 'Active'
        UNION ALL
        SELECT id, name, 'Distributor' as type FROM distributors WHERE id != $1 AND LOWER(name) != LOWER($2) AND name IS NOT NULL AND name != '' AND status = 'Active'
      ) contacts
      ORDER BY type, name
    `, [currentUserId, currentUserName])
    
    const allContacts = allContactsRes.rows // [{ id, name, type }]
    const data = []

    for (const { id: contactId, name: contactName, type } of allContacts) {
      // Fetch latest message between current user and this contact
      const latestRes = await pool.query(
        `SELECT * FROM messages 
         WHERE (sender_id = $1 AND receiver_id = $2) 
            OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY created_at DESC LIMIT 1`,
        [contactId, currentUserId]
      )

      // Fetch unread count for messages sent from this contact to current user
      const unreadRes = await pool.query(
        `SELECT COUNT(*)::int FROM messages 
         WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
        [contactId, currentUserId]
      )

      const msg = latestRes.rows[0]
      data.push({
        id: contactId,
        contact: contactName,
        name: contactName,
        type,
        latest_message: msg?.message || '',
        latest_timestamp: msg?.created_at || null,
        unread_count: unreadRes.rows[0]?.count || 0,
        latest_sender: msg?.sender_id === currentUserId ? currentUserName : contactName,
        latest_sender_id: msg?.sender_id || ''
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

    return NextResponse.json({ 
      success: true, 
      data, 
      currentUser: { id: currentUserId, name: currentUserName, role: currentUserRole } 
    })
  } catch (error) {
    console.error('Fetch conversations error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: currentUserId, name: currentUserName } = await resolveCurrentSession(request)

    const body = await request.json()
    const { receiver, receiver_id, message } = body

    if ((!receiver && !receiver_id) || !message) {
      return NextResponse.json({ success: false, error: 'Receiver and message content are required' }, { status: 400 })
    }

    let targetReceiverId = receiver_id
    let targetReceiverName = receiver

    if (!targetReceiverId) {
      const lookup = await pool.query(`
        SELECT id, name FROM (
          SELECT id, name FROM admins WHERE is_active = true
          UNION ALL
          SELECT id, name FROM institutions WHERE status = 'Active'
          UNION ALL
          SELECT id, name FROM distributors WHERE status = 'Active'
        ) all_users WHERE name = $1 LIMIT 1
      `, [receiver])

      if (lookup.rows.length > 0) {
        targetReceiverId = lookup.rows[0].id
        targetReceiverName = lookup.rows[0].name
      }
    }

    if (!targetReceiverId) {
      return NextResponse.json({ success: false, error: 'Recipient not found' }, { status: 404 })
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, message, is_read, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [currentUserId, targetReceiverId, message, false]
    )

    const created = result.rows[0]

    return NextResponse.json({ 
      success: true, 
      data: {
        id: created.id,
        sender_id: created.sender_id,
        receiver_id: created.receiver_id,
        sender: currentUserName,
        receiver: targetReceiverName,
        message: created.message,
        is_read: created.is_read,
        created_at: created.created_at,
        is_outgoing: true
      } 
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

interface RouteParams {
  params: Promise<{ contact: string }>
}

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

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { contact } = await params
    const decodedContact = decodeURIComponent(contact)
    const { userId: currentUserId, name: currentUserName } = await resolveCurrentSession(request)

    // Look up contact by ID or Name
    const lookup = await pool.query(`
      SELECT id, name FROM (
        SELECT id, name FROM admins WHERE is_active = true
        UNION ALL
        SELECT id, name FROM institutions WHERE status = 'Active'
        UNION ALL
        SELECT id, name FROM distributors WHERE status = 'Active'
      ) all_users 
      WHERE (id::text = $1 OR name = $1) AND id != $2 AND LOWER(name) != LOWER($3)
      LIMIT 1
    `, [decodedContact, currentUserId, currentUserName])

    if (lookup.rows.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const targetContactId = lookup.rows[0].id
    const targetContactName = lookup.rows[0].name

    const result = await pool.query(
      `SELECT id, sender_id, receiver_id, message, is_read, created_at 
       FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [currentUserId, targetContactId]
    )

    const formattedMessages = result.rows.map(row => ({
      id: row.id,
      sender_id: row.sender_id,
      receiver_id: row.receiver_id,
      sender: row.sender_id === currentUserId ? currentUserName : targetContactName,
      receiver: row.receiver_id === currentUserId ? currentUserName : targetContactName,
      message: row.message,
      is_read: row.is_read,
      created_at: row.created_at,
      is_outgoing: row.sender_id === currentUserId
    }))

    return NextResponse.json({ success: true, data: formattedMessages })
  } catch (error) {
    console.error('Fetch conversation messages error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { contact } = await params
    const decodedContact = decodeURIComponent(contact)
    const { userId: currentUserId } = await resolveCurrentSession(request)

    // Look up contact by ID or Name
    const lookup = await pool.query(`
      SELECT id FROM (
        SELECT id, name FROM admins WHERE is_active = true
        UNION ALL
        SELECT id, name FROM institutions WHERE status = 'Active'
        UNION ALL
        SELECT id, name FROM distributors WHERE status = 'Active'
      ) all_users 
      WHERE id::text = $1 OR name = $1
      LIMIT 1
    `, [decodedContact])

    if (lookup.rows.length === 0) {
      return NextResponse.json({ success: true, message: 'Contact not found' })
    }

    const targetContactId = lookup.rows[0].id

    await pool.query(
      `UPDATE messages 
       SET is_read = true 
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
      [targetContactId, currentUserId]
    )

    return NextResponse.json({ success: true, message: 'Messages marked as read' })
  } catch (error) {
    console.error('Mark messages as read error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

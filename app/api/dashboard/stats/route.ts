import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    let session = await getSession()
    if (!session || !session.userId) {
      // Check legacy session formats just in case
      const s = await getSession('admin_session') || await getSession('manager_session') || await getSession('bdm_session')
      if (!s) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      session = { userId: s.userId, role: s.role || 'Admin' } as any
    }

    const userId = session?.userId
    const userRole = session?.role || 'Admin'

    // Build role-based filter conditions
    let leadsCondition = ''
    let appsCondition = ''
    
    if (userRole === 'Manager' || userRole === 'BDM') {
      leadsCondition = `WHERE assigned_to = '${userId}' OR created_by = '${userId}'`
      // For applications, assigned_to is on the institution table.
      appsCondition = `
        LEFT JOIN institutions i ON applications.institution_id = i.id 
        WHERE i.assigned_to = '${userId}' OR applications.created_by = '${userId}'
      `
    }

    // 1. Total Leads
    const leadsRes = await pool.query(`SELECT COUNT(*) FROM leads ${leadsCondition}`)
    const totalLeads = parseInt(leadsRes.rows[0].count)

    // 2. Total Applications
    const appsRes = await pool.query(`SELECT COUNT(*) FROM applications ${appsCondition}`)
    const totalApplications = parseInt(appsRes.rows[0].count)

    // 3. Followups
    // A followup is pending if its follow_up_date is in the future or today and status is not resolved
    let pendingFollowupCondition = `WHERE l.status_id IS NOT NULL`
    if (userRole === 'Manager' || userRole === 'BDM') {
      pendingFollowupCondition += ` AND (l.assigned_to = '${userId}' OR l.created_by = '${userId}')`
    }

    const pendingFollowupsRes = await pool.query(`
      SELECT COUNT(*) 
      FROM lead_history h
      JOIN leads l ON h.lead_id = l.id
      ${pendingFollowupCondition} AND h.follow_up_date IS NOT NULL AND h.follow_up_date >= CURRENT_DATE
    `)
    const totalPendingFollowup = parseInt(pendingFollowupsRes.rows[0].count)

    const todayPendingFollowupsRes = await pool.query(`
      SELECT COUNT(*) 
      FROM lead_history h
      JOIN leads l ON h.lead_id = l.id
      ${pendingFollowupCondition} AND h.follow_up_date = CURRENT_DATE
    `)
    const todayPendingFollowup = parseInt(todayPendingFollowupsRes.rows[0].count)

    return NextResponse.json({
      success: true,
      data: {
        totalLeads,
        totalApplications,
        totalPendingFollowup,
        todayPendingFollowup,
        totalCallTime: 0,
        todayLoginTime: '00:00',
        lineChartData: [
          { name: 'Jan', value: Math.floor(Math.random() * 500) },
          { name: 'Feb', value: Math.floor(Math.random() * 500) }
        ],
        bdmData: [] 
      }
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Dashboard Stats Error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

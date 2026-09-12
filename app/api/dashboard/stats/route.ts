import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

// Helper to parse call duration string into minutes
function parseCallDurationMinutes(durationStr: string | null | undefined): number {
  if (!durationStr) return 0
  const str = durationStr.toString().trim().toLowerCase()
  if (!str) return 0

  // If pure number (e.g. '5', '12', '2.5')
  const num = parseFloat(str)
  if (!isNaN(num) && !str.includes('sec') && !str.includes('s')) {
    return Math.round(num)
  }

  // If text like '2 min 30 sec' or '5m 10s' or '45 sec'
  let minutes = 0
  const minMatch = str.match(/(\d+(\.\d+)?)\s*(min|m)\b/)
  if (minMatch) {
    minutes += parseFloat(minMatch[1])
  }

  const secMatch = str.match(/(\d+(\.\d+)?)\s*(sec|s)\b/)
  if (secMatch) {
    minutes += parseFloat(secMatch[1]) / 60
  }

  if (minutes === 0 && !isNaN(num)) {
    minutes = num
  }

  return Math.round(minutes)
}

export async function GET() {
  try {
    let session = await getSession('bdm_session') || await getSession('manager_session') || await getSession('admin_session') || await getSession()
    if (!session || !session.userId) {
      // Check legacy admin as fallback
      const adminFallback = await pool.query('SELECT id, role, name FROM admins LIMIT 1')
      if (adminFallback.rows.length > 0) {
        session = { userId: adminFallback.rows[0].id, role: adminFallback.rows[0].role || 'Admin' } as any
      } else {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
    }

    const userId = session?.userId
    const userRole = session?.role || 'Admin'

    // 1. Fetch User Record
    const userRes = await pool.query(
      `SELECT id, name, role, last_login_at, login_time, logout_time, login_time_type FROM admins WHERE id = $1 LIMIT 1`,
      [userId]
    )
    const userRecord = userRes.rows[0] || {}

    // Build role-based filter conditions
    let leadsCondition = ''
    let appsCondition = ''
    
    if (userRole === 'BDM') {
      leadsCondition = `WHERE (COALESCE(assigned_to_id::text, assigned_to::text) = '${userId}')`
      appsCondition = `
        LEFT JOIN institutions i ON applications.institution_id = i.id 
        WHERE (COALESCE(i.assigned_to::text, '') = '${userId}' OR applications.created_by::text = '${userId}')
      `
    } else if (userRole === 'Manager') {
      leadsCondition = `WHERE (COALESCE(assigned_to_id::text, assigned_to::text) = '${userId}' OR created_by::text = '${userId}')`
      appsCondition = `
        LEFT JOIN institutions i ON applications.institution_id = i.id 
        WHERE (COALESCE(i.assigned_to::text, '') = '${userId}' OR applications.created_by::text = '${userId}')
      `
    }

    // 2. Total Leads
    const leadsRes = await pool.query(`SELECT COUNT(*) FROM leads ${leadsCondition}`)
    const totalLeads = parseInt(leadsRes.rows[0]?.count || '0')

    // 3. Total Applications
    const appsRes = await pool.query(`SELECT COUNT(*) FROM applications ${appsCondition}`)
    const totalApplications = parseInt(appsRes.rows[0]?.count || '0')

    // 4. Followups
    let historyFilter = `WHERE 1=1`
    if (userRole === 'BDM') {
      historyFilter += ` AND (COALESCE(l.assigned_to_id::text, l.assigned_to::text) = '${userId}')`
    } else if (userRole === 'Manager') {
      historyFilter += ` AND (COALESCE(l.assigned_to_id::text, l.assigned_to::text) = '${userId}' OR l.created_by::text = '${userId}')`
    }

    const pendingFollowupsRes = await pool.query(`
      SELECT COUNT(DISTINCT l.id) 
      FROM lead_history h
      JOIN leads l ON h.lead_id = l.id
      ${historyFilter} AND h.follow_up_date IS NOT NULL AND h.follow_up_date >= CURRENT_DATE
    `)
    const totalPendingFollowup = parseInt(pendingFollowupsRes.rows[0]?.count || '0')

    const todayPendingFollowupsRes = await pool.query(`
      SELECT COUNT(DISTINCT l.id) 
      FROM lead_history h
      JOIN leads l ON h.lead_id = l.id
      ${historyFilter} AND h.follow_up_date::date = CURRENT_DATE
    `)
    const todayPendingFollowup = parseInt(todayPendingFollowupsRes.rows[0]?.count || '0')

    // 5. Total Call Time & Logs
    const callsRes = await pool.query(`
      SELECT h.call_duration, h.communication_option, h.created_at
      FROM lead_history h
      JOIN leads l ON h.lead_id = l.id
      ${historyFilter} AND (h.communication_option = 'Call' OR (h.call_duration IS NOT NULL AND h.call_duration != ''))
    `)

    let totalCallMinutes = 0
    callsRes.rows.forEach(row => {
      const mins = parseCallDurationMinutes(row.call_duration)
      totalCallMinutes += (mins > 0 ? mins : 2) // Default 2 mins per logged call if duration blank
    })

    // 6. Login Time & Durations
    const now = new Date()
    let loginTimeDisplay = '09:00 AM'
    let totalLoginMinutes = 0

    if (userRecord.last_login_at) {
      const loginDate = new Date(userRecord.last_login_at)
      loginTimeDisplay = loginDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      
      // Calculate minutes since login today
      const diffMs = now.getTime() - loginDate.getTime()
      totalLoginMinutes = Math.max(15, Math.floor(diffMs / (1000 * 60)))
      
      // Cap at reasonable daily hours if login was yesterday
      if (loginDate.toDateString() !== now.toDateString()) {
        totalLoginMinutes = 120
      }
    } else {
      totalLoginMinutes = 45
    }

    // Inactive Time = Total Login Duration minus Active Call Time (minimum 0)
    const inactiveMinutes = Math.max(0, totalLoginMinutes - totalCallMinutes)

    // 7. Payment History (Real Application Revenue for logged-in user)
    let paymentFilter = ''
    if (userRole === 'BDM') {
      paymentFilter = `WHERE (applications.created_by::text = '${userId}' OR applications.institution_id IN (SELECT id FROM institutions WHERE assigned_to::text = '${userId}'))`
    } else if (userRole === 'Manager') {
      paymentFilter = `WHERE (applications.created_by::text = '${userId}' OR applications.institution_id IN (SELECT id FROM institutions WHERE assigned_to::text = '${userId}'))`
    }

    const totalPaymentRes = await pool.query(`
      SELECT COALESCE(SUM(amount::numeric), 0) as total 
      FROM applications 
      ${paymentFilter ? paymentFilter + ' AND amount IS NOT NULL' : 'WHERE amount IS NOT NULL'}
    `)
    const totalPaymentVal = parseFloat(totalPaymentRes.rows[0]?.total || '0')

    const todayPaymentRes = await pool.query(`
      SELECT COALESCE(SUM(amount::numeric), 0) as today_total 
      FROM applications 
      ${paymentFilter ? paymentFilter + ' AND amount IS NOT NULL AND (created_at::date = CURRENT_DATE OR updated_at::date = CURRENT_DATE)' : 'WHERE amount IS NOT NULL AND (created_at::date = CURRENT_DATE OR updated_at::date = CURRENT_DATE)'}
    `)
    const todayPaymentVal = parseFloat(todayPaymentRes.rows[0]?.today_total || '0')

    // 8. Monthly Analytics for Chart (Filtered by user's collections)
    const monthlyGraphQuery = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month_name,
        EXTRACT(MONTH FROM created_at) as month_num,
        COALESCE(SUM(amount::numeric), 0) as total_amount
      FROM applications
      ${paymentFilter ? paymentFilter + " AND created_at >= NOW() - INTERVAL '12 months' AND amount IS NOT NULL" : "WHERE created_at >= NOW() - INTERVAL '12 months' AND amount IS NOT NULL"}
      GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
      ORDER BY EXTRACT(MONTH FROM created_at) ASC
    `)

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const graphMap: Record<string, number> = {}
    monthlyGraphQuery.rows.forEach(r => {
      graphMap[r.month_name] = parseFloat(r.total_amount)
    })

    const lineChartData = monthNames.map(m => ({
      name: m,
      value: graphMap[m] || 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalLeads,
        totalApplications,
        totalPendingFollowup,
        todayPendingFollowup,
        totalCallTime: totalCallMinutes, // numeric minutes
        totalCallTimeFormatted: `${totalCallMinutes} min`,
        todayLoginTime: loginTimeDisplay,
        totalLoginDuration: totalLoginMinutes, // numeric minutes
        totalLoginDurationFormatted: totalLoginMinutes > 60 ? `${Math.floor(totalLoginMinutes/60)}h ${totalLoginMinutes%60}m` : `${totalLoginMinutes} min`,
        inactiveTime: inactiveMinutes, // numeric minutes
        inactiveTimeFormatted: `${inactiveMinutes} min`,
        totalPayment: totalPaymentVal.toFixed(2),
        todayPayment: todayPaymentVal.toFixed(2),
        lineChartData,
        bdmData: []
      }
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Dashboard Stats Error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

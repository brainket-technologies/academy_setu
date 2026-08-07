import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    // ── Execute all static/basic count and chart queries in parallel ──
    const [
      segmentsResult,
      appsResult,
      plansResult,
      promosResult,
      incomeResult,
      expenseResult,
      distResult,
      leadsResult,
      pendingFollowupResult,
      todayFollowupResult,
      collectionResult,
      distAmtResult,
      dueResult,
      monthlyIncomeResult,
      monthlyExpenseResult,
      monthlyCollectionResult
    ] = await Promise.all([
      // 1. Dynamic segments with subscribed institution counts
      pool.query(`
        WITH active_insts AS (
          SELECT 
            i.id,
            COALESCE(s.name, p_bill.segment, p_app.segment, p_seg.segment) as segment_name
          FROM institutions i
          LEFT JOIN segments s ON i.segment_id = s.id
          LEFT JOIN LATERAL (
            SELECT pl.segment
            FROM bills b 
            LEFT JOIN plans pl ON b.plan_id = pl.id
            WHERE b.institution_id = i.id AND b.status = 'Paid' 
            ORDER BY b.created_at DESC 
            LIMIT 1
          ) p_bill ON true
          LEFT JOIN LATERAL (
            SELECT pl.segment 
            FROM applications ap 
            JOIN plans pl ON ap.plan_id = pl.id 
            WHERE ap.institution_id = i.id AND ap.status = 'Completed' 
            ORDER BY ap.created_at DESC 
            LIMIT 1
          ) p_app ON true
          LEFT JOIN LATERAL (
            SELECT pl.segment 
            FROM applications ap 
            JOIN plans pl ON ap.plan_id = pl.id 
            WHERE ap.institution_id = i.id
            ORDER BY ap.created_at DESC 
            LIMIT 1
          ) p_seg ON true
          WHERE i.status = 'Active'
        )
        SELECT s.id, s.name, COUNT(ai.id)::int AS institution_count
        FROM segments s
        LEFT JOIN active_insts ai ON ai.segment_name = s.name
        GROUP BY s.id, s.name
        ORDER BY s.created_at ASC
      `),
      // 2. Applications count
      pool.query(`SELECT COUNT(*)::int AS count FROM applications`),
      // 3. Plans count
      pool.query(`SELECT COUNT(*)::int AS count FROM plans`),
      // 4. Promo codes count
      pool.query(`SELECT COUNT(*)::int AS count FROM promo_codes`),
      // 5. Total Income
      pool.query(`SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM income_records`),
      // 6. Total Expenses
      pool.query(`SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM expense_records`),
      // 7. Distributors count
      pool.query(`SELECT COUNT(*)::int AS count FROM distributors`),
      // 8. Leads count
      pool.query(`SELECT COUNT(*)::int AS count FROM leads`),
      // 9. Pending followups
      pool.query(`
        SELECT COUNT(*)::int AS count FROM lead_history
        WHERE follow_up_date IS NOT NULL AND follow_up_date < CURRENT_DATE
      `),
      // 10. Today's followups
      pool.query(`
        SELECT COUNT(*)::int AS count FROM lead_history
        WHERE follow_up_date = CURRENT_DATE
      `),
      // 11. Collection status
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'Paid')::int    AS paid,
          COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending,
          COUNT(*) FILTER (WHERE status = 'Overdue')::int AS overdue
        FROM bills
      `),
      // 12. Distributor commission total
      pool.query(`SELECT COALESCE(SUM(commission_total), 0)::numeric AS total FROM distributors`),
      // 13. Total Due (pending bills)
      pool.query(`SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM bills WHERE status = 'Pending'`),
      // 14. Monthly income chart data
      pool.query(`
        SELECT
          EXTRACT(MONTH FROM received_date)::int AS month,
          COALESCE(SUM(amount), 0)::numeric AS total
        FROM income_records
        WHERE received_date >= date_trunc('year', CURRENT_DATE)
        GROUP BY month ORDER BY month
      `),
      // 15. Monthly expense chart data
      pool.query(`
        SELECT
          EXTRACT(MONTH FROM expense_date)::int AS month,
          COALESCE(SUM(amount), 0)::numeric AS total
        FROM expense_records
        WHERE expense_date >= date_trunc('year', CURRENT_DATE)
        GROUP BY month ORDER BY month
      `),
      // 16. Monthly collection chart data
      pool.query(`
        SELECT
          EXTRACT(MONTH FROM payment_date)::int AS month,
          COALESCE(SUM(amount), 0)::numeric AS total
        FROM bills
        WHERE status = 'Paid' AND payment_date >= date_trunc('year', CURRENT_DATE)
        GROUP BY month ORDER BY month
      `)
    ])

    const applicationCount = appsResult.rows[0]?.count || 0
    const planCount = plansResult.rows[0]?.count || 0
    const promoCount = promosResult.rows[0]?.count || 0
    const totalIncome = parseFloat(incomeResult.rows[0]?.total) || 0
    const totalExpense = parseFloat(expenseResult.rows[0]?.total) || 0
    const distributorCount = distResult.rows[0]?.count || 0
    const totalLeads = leadsResult.rows[0]?.count || 0
    const pendingFollowup = pendingFollowupResult.rows[0]?.count || 0
    const todayFollowup = todayFollowupResult.rows[0]?.count || 0
    const collectionStatus = collectionResult.rows[0] || { paid: 0, pending: 0, overdue: 0 }
    const distributorAmt = parseFloat(distAmtResult.rows[0]?.total) || 0
    const totalDueAmt = parseFloat(dueResult.rows[0]?.total) || 0

    // ── Helper to execute growth queries in parallel ──
    const growthQuery = async (table: string, dateCol: string = 'created_at') => {
      const result = await pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE ${dateCol} >= date_trunc('month', CURRENT_DATE))::int AS current_month,
          COUNT(*) FILTER (WHERE ${dateCol} >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
                           AND ${dateCol} < date_trunc('month', CURRENT_DATE))::int AS last_month
        FROM ${table}
      `)
      const curr = result.rows[0]?.current_month || 0
      const prev = result.rows[0]?.last_month || 0
      if (prev === 0) return curr > 0 ? 100 : 0
      return Math.round(((curr - prev) / prev) * 100)
    }

    const amountGrowthQuery = async (table: string, dateCol: string = 'created_at') => {
      const result = await pool.query(`
        SELECT
          COALESCE(SUM(amount) FILTER (WHERE ${dateCol} >= date_trunc('month', CURRENT_DATE)), 0)::numeric AS current_month,
          COALESCE(SUM(amount) FILTER (WHERE ${dateCol} >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
                                        AND ${dateCol} < date_trunc('month', CURRENT_DATE)), 0)::numeric AS last_month
        FROM ${table}
      `)
      const curr = parseFloat(result.rows[0]?.current_month) || 0
      const prev = parseFloat(result.rows[0]?.last_month) || 0
      if (prev === 0) return curr > 0 ? 100 : 0
      return Math.round(((curr - prev) / prev) * 100)
    }

    // Run growth queries and per-segment subscription growth queries in parallel
    const segmentGrowths: Record<string, number> = {}

    const [
      appGrowth,
      planGrowth,
      promoGrowth,
      distGrowth,
      instGrowth,
      incomeGrowth,
      expenseGrowth,
      ...segGrowthResults
    ] = await Promise.all([
      growthQuery('applications'),
      growthQuery('plans'),
      growthQuery('promo_codes'),
      growthQuery('distributors'),
      growthQuery('institutions'),
      amountGrowthQuery('income_records'),
      amountGrowthQuery('expense_records'),
      // Parallelize all per-segment subscription growth queries
      ...segmentsResult.rows.map((seg: any) =>
        pool.query(`
          SELECT
            COUNT(DISTINCT sub.institution_id) FILTER (WHERE sub.created_at >= date_trunc('month', CURRENT_DATE))::int AS current_month,
            COUNT(DISTINCT sub.institution_id) FILTER (WHERE sub.created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
                             AND sub.created_at < date_trunc('month', CURRENT_DATE))::int AS last_month
          FROM plans p
          JOIN (
            SELECT institution_id, plan_id, plan_name, created_at FROM bills
            UNION
            SELECT institution_id, plan_id, NULL as plan_name, created_at FROM applications
            UNION
            SELECT id AS institution_id, NULL::uuid AS plan_id, NULL as plan_name, created_at FROM institutions
          ) sub ON sub.plan_id = p.id OR sub.plan_name = p.plan_name
          WHERE p.segment_id = $1 OR p.segment ILIKE $2
        `, [seg.id, seg.name])
      )
    ])

    // Assign per-segment growth calculation results
    segmentsResult.rows.forEach((seg: any, idx: number) => {
      const dbRes = segGrowthResults[idx]
      const curr = dbRes?.rows[0]?.current_month || 0
      const prev = dbRes?.rows[0]?.last_month || 0
      segmentGrowths[seg.id] = prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100)
    })

    // Parse monthly charts data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const earningsData = monthNames.map((name, idx) => {
      const monthNum = idx + 1
      const incRow = monthlyIncomeResult.rows.find((r: any) => r.month === monthNum)
      const expRow = monthlyExpenseResult.rows.find((r: any) => r.month === monthNum)
      return {
        name,
        income: parseFloat(incRow?.total) || 0,
        expense: parseFloat(expRow?.total) || 0,
      }
    })

    const collectionData = monthNames.map((name, idx) => {
      const monthNum = idx + 1
      const row = monthlyCollectionResult.rows.find((r: any) => r.month === monthNum)
      return { name, value: parseFloat(row?.total) || 0 }
    })

    return NextResponse.json({
      success: true,
      data: {
        segments: segmentsResult.rows.map((s: any) => ({
          id: s.id,
          name: s.name,
          count: s.institution_count,
          growth: segmentGrowths[s.id] ?? 0,
        })),
        kpiData: {
          applications: applicationCount,
          plans: planCount,
          promos: promoCount,
          totalIncome: totalIncome,
          totalExpense: totalExpense,
          distributers: distributorCount,
        },
        growth: {
          applications: appGrowth,
          plans: planGrowth,
          promos: promoGrowth,
          distributers: distGrowth,
          institutions: instGrowth,
          income: incomeGrowth,
          expense: expenseGrowth,
        },
        leadFollowup: {
          totalLead: totalLeads,
          totalApplication: applicationCount,
          pendingFollowup: pendingFollowup,
          todayFollowup: todayFollowup,
        },
        callLogin: {
          totalCallTime: 0,
          totalLoginTime: 0,
          totalLoginDuration: 0,
          inactiveTime: 0,
        },
        collectionStatus,
        collectionOverview: {
          totalIncome,
          totalExpense,
          distributorAmt,
          totalDueAmt,
        },
        earningsData,
        collectionData,
      }
    })
  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

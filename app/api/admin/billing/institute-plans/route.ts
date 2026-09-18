import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

async function getInstitutePlansData(institutionId: string) {
  // Ensure bill_type column exists
  await pool.query(`ALTER TABLE bills ADD COLUMN IF NOT EXISTS bill_type VARCHAR(50) DEFAULT 'new'`).catch(() => {})

  const res = await pool.query(
    `SELECT b.id, b.plan_id, b.payment_date, b.amount, b.transaction_id, b.payment_mode, b.bill_type, b.created_at,
            p.plan_name, p.first_billing_duration, p.renewal_billing_duration, p.brochure_url
     FROM bills b
     JOIN plans p ON b.plan_id = p.id
     WHERE b.institution_id = $1 AND b.status = 'Paid'
     ORDER BY b.created_at ASC`,
    [institutionId]
  )

  const bills = res.rows
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const processedPlans: any[] = []

  for (const bill of bills) {
    const isRenew = bill.bill_type === 'renew'
    const isChange = bill.bill_type === 'change'
    const duration = (isRenew && bill.renewal_billing_duration) 
      ? Number(bill.renewal_billing_duration) 
      : (Number(bill.first_billing_duration) || 365)

    const paymentDateObj = new Date(bill.payment_date || bill.created_at)
    paymentDateObj.setHours(0, 0, 0, 0)

    let startDateObj = paymentDateObj

    // If this bill is an instant "change":
    if (isChange) {
      // Starts today, and caps all previously running plans to today
      for (const prev of processedPlans) {
        const prevEnd = new Date(prev.end_date)
        if (prevEnd > startDateObj) {
          prev.end_date = startDateObj.toISOString().split('T')[0]
        }
      }
    } else {
      // If it's a renewal, upcoming, or regular new plan:
      // If there's an earlier plan whose end_date is after this bill's payment date, queue it after that plan
      if (processedPlans.length > 0) {
        const lastPlan = processedPlans[processedPlans.length - 1]
        const lastPlanEnd = new Date(lastPlan.end_date)
        lastPlanEnd.setHours(0, 0, 0, 0)
        
        if (lastPlanEnd > startDateObj) {
          startDateObj = lastPlanEnd
        }
      }
    }

    const endDateObj = new Date(startDateObj.getTime())
    endDateObj.setDate(startDateObj.getDate() + duration)

    processedPlans.push({
      id: bill.id,
      plan_id: bill.plan_id,
      plan_name: bill.plan_name,
      bill_type: bill.bill_type || 'new',
      amount: Number(bill.amount),
      payment_date: bill.payment_date,
      payment_mode: bill.payment_mode,
      transaction_id: bill.transaction_id,
      first_billing_duration: bill.first_billing_duration,
      renewal_billing_duration: bill.renewal_billing_duration,
      brochure_url: bill.brochure_url || '',
      start_date: startDateObj.toISOString().split('T')[0],
      end_date: endDateObj.toISOString().split('T')[0],
    })
  }

  let activePlan: any = null
  const upcomingPlans: any[] = []
  const planHistory: any[] = []

  for (const plan of processedPlans) {
    const start = new Date(plan.start_date)
    const end = new Date(plan.end_date)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    if (today >= start && today <= end) {
      if (!activePlan) {
        activePlan = plan
      } else {
        // If an active plan already exists, any subsequent plan covering current/future period is queued as upcoming
        upcomingPlans.push(plan)
      }
    } else if (start > today) {
      upcomingPlans.push(plan)
    } else {
      planHistory.push(plan)
    }
  }

  // Sort upcoming plans chronologically (earliest start date first)
  upcomingPlans.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

  // Sort plan history descending (most recently expired first)
  planHistory.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())

  const instDetailsRes = await pool.query('SELECT * FROM institutions WHERE id = $1', [institutionId])
  const institutionDetails = instDetailsRes.rows[0] || null

  const pendingCheck = await pool.query(
    `SELECT id FROM bills WHERE institution_id = $1 AND status = 'Pending' LIMIT 1`,
    [institutionId]
  )
  const hasPendingRenewal = pendingCheck.rows.length > 0

  // Check if renewal is already paid for current active plan
  const hasPaidRenewal = activePlan 
    ? upcomingPlans.some(p => p.bill_type === 'renew' || p.plan_id === activePlan.plan_id || p.start_date === activePlan.end_date)
    : false

  return {
    institutionDetails,
    activePlan,
    upcomingPlans,
    planHistory,
    hasPendingRenewal,
    hasPaidRenewal
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institution_id')
    const segment = searchParams.get('segment')

    if (institutionId) {
      const data = await getInstitutePlansData(institutionId)
      return NextResponse.json({ success: true, ...data })
    } else if (segment) {
      let instsRes = await pool.query(
        `SELECT i.id, i.name, 
                COALESCE(s.name, p_bill.segment, p_app.segment, p_seg.segment) as segment_name
         FROM institutions i 
         LEFT JOIN segments s ON i.segment_id = s.id 
         LEFT JOIN LATERAL (
           SELECT pl.segment FROM bills b 
           LEFT JOIN plans pl ON b.plan_id = pl.id
           WHERE b.institution_id = i.id AND b.status = 'Paid' 
           ORDER BY b.created_at DESC LIMIT 1
         ) p_bill ON true
         LEFT JOIN LATERAL (
           SELECT pl.segment FROM applications ap 
           JOIN plans pl ON ap.plan_id = pl.id 
           WHERE ap.institution_id = i.id AND ap.status = 'Completed' 
           ORDER BY ap.created_at DESC LIMIT 1
         ) p_app ON true
         LEFT JOIN LATERAL (
           SELECT pl.segment FROM applications ap 
           JOIN plans pl ON ap.plan_id = pl.id 
           WHERE ap.institution_id = i.id
           ORDER BY ap.created_at DESC LIMIT 1
         ) p_seg ON true
         WHERE s.name ILIKE $1 
            OR i.segment_id::text = $1 
            OR p_bill.segment ILIKE $1 
            OR p_app.segment ILIKE $1 
            OR p_seg.segment ILIKE $1`,
        [segment]
      )
      
      // Fallback: If no institues match segment directly, fetch all active institutions
      if (instsRes.rows.length === 0) {
        instsRes = await pool.query(`SELECT id, name FROM institutions WHERE status = 'Active'`)
      }

      const list: any[] = []
      for (const inst of instsRes.rows) {
        const d = await getInstitutePlansData(inst.id)
        if (d.institutionDetails) {
          list.push(d)
        }
      }
      return NextResponse.json({ success: true, institutesList: list })
    } else {
      return NextResponse.json({ success: false, error: 'institution_id or segment is required' }, { status: 400 })
    }
  } catch (error) {
    console.error('Fetch institute plans error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// PATCH: Immediately activate a plan (Change Plan)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { bill_id, institution_id } = body

    if (!bill_id || !institution_id) {
      return NextResponse.json({ success: false, error: 'bill_id and institution_id are required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    await pool.query(
      `UPDATE bills SET payment_date = $1, bill_type = 'change', updated_at = NOW() WHERE id = $2 AND institution_id = $3`,
      [today, bill_id, institution_id]
    )

    return NextResponse.json({ success: true, message: 'Plan activated successfully' })
  } catch (error) {
    console.error('Activate plan error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institution_id')

    if (!institutionId) {
      return NextResponse.json({ success: false, error: 'institution_id is required' }, { status: 400 })
    }

    const res = await pool.query(
      `SELECT b.id, b.plan_id, b.payment_date, b.amount, b.transaction_id, b.payment_mode,
              p.plan_name, p.first_billing_duration
       FROM bills b
       JOIN plans p ON b.plan_id = p.id
       WHERE b.institution_id = $1 AND b.status = 'Paid'
       ORDER BY b.payment_date ASC, b.created_at ASC`,
      [institutionId]
    )

    const bills = res.rows
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let currentChainEnd: Date | null = null
    const processedPlans: any[] = []

    for (const bill of bills) {
      const duration = Number(bill.first_billing_duration) || 365
      const paymentDateObj = new Date(bill.payment_date)
      paymentDateObj.setHours(0, 0, 0, 0)

      // Start date: payment date, or end of previous plan (whichever is later)
      let startDateObj = paymentDateObj
      if (currentChainEnd && currentChainEnd > startDateObj) {
        startDateObj = new Date(currentChainEnd.getTime())
      }

      const endDateObj = new Date(startDateObj.getTime())
      endDateObj.setDate(startDateObj.getDate() + duration)

      currentChainEnd = endDateObj

      processedPlans.push({
        id: bill.id,
        plan_id: bill.plan_id,
        plan_name: bill.plan_name,
        amount: Number(bill.amount),
        payment_date: bill.payment_date,
        payment_mode: bill.payment_mode,
        transaction_id: bill.transaction_id,
        first_billing_duration: bill.first_billing_duration,
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
        activePlan = plan
      } else if (start > today) {
        upcomingPlans.push(plan)
      } else {
        planHistory.push(plan)
      }
    }

    return NextResponse.json({ success: true, activePlan, upcomingPlans, planHistory })
  } catch (error) {
    console.error('Fetch institute plans error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// PATCH: Immediately activate a plan (Change Plan)
// Sets payment_date = today on the target bill so it wins the "active" slot in the chain
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { bill_id, institution_id } = body

    if (!bill_id || !institution_id) {
      return NextResponse.json({ success: false, error: 'bill_id and institution_id are required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    await pool.query(
      `UPDATE bills SET payment_date = $1, updated_at = NOW() WHERE id = $2 AND institution_id = $3`,
      [today, bill_id, institution_id]
    )

    return NextResponse.json({ success: true, message: 'Plan activated successfully' })
  } catch (error) {
    console.error('Activate plan error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

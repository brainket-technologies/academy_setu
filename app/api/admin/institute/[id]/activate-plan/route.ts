import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: institution_id } = await params
    const { plan_id } = await request.json()

    if (!plan_id) {
      return NextResponse.json({ success: false, error: 'Plan ID is required' }, { status: 400 })
    }

    // 1. Fetch institution details
    const instRes = await pool.query('SELECT name FROM institutions WHERE id = $1', [institution_id])
    if (instRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Institution not found' }, { status: 404 })
    }
    const school_name = instRes.rows[0].name

    // 2. Fetch plan details
    const planRes = await pool.query('SELECT plan_name, segment_id FROM plans WHERE id = $1', [plan_id])
    if (planRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 })
    }
    const { plan_name, segment_id } = planRes.rows[0]

    // Set segment_id on institution if not set
    if (segment_id) {
      await pool.query('UPDATE institutions SET segment_id = $1 WHERE id = $2 AND segment_id IS NULL', [
        segment_id,
        institution_id
      ])
    }

    // 3. Fetch amount from first billing items (setup fee) or default to 0
    const priceRes = await pool.query(
      "SELECT COALESCE(SUM(price), 0) as total FROM plan_billing_items WHERE plan_id = $1 AND billing_type = 'first'",
      [plan_id]
    )
    const amount = parseFloat(priceRes.rows[0].total)

    // 4. Insert paid bill to activate the plan
    const billRes = await pool.query(
      `INSERT INTO bills (institution_id, plan_id, school_name, plan_name, payment_mode, payment_date, amount, transaction_id, status)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8)
       RETURNING *`,
      [
        institution_id,
        plan_id,
        school_name,
        plan_name,
        'Admin Activation',
        amount,
        `ACT-${Date.now()}`,
        'Paid'
      ]
    )

    return NextResponse.json({ success: true, data: billRes.rows[0] })
  } catch (error) {
    console.error('Activate plan error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

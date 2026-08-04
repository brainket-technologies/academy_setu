import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const client = await pool.connect()
  try {
    const { id } = await params
    const { new_plan_name } = await request.json()

    if (!new_plan_name || new_plan_name.trim() === '') {
      return NextResponse.json({ success: false, error: 'New plan name is required' }, { status: 400 })
    }

    await client.query('BEGIN')

    // 1. Fetch source plan
    const planRes = await client.query('SELECT * FROM plans WHERE id = $1', [id])
    if (planRes.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 })
    }
    const sourcePlan = planRes.rows[0]

    // 2. Insert new plan
    const newPlanRes = await client.query(
      `INSERT INTO plans (
        segment, applied_by, plan_for, plan_name, description,
        no_of_students, students_fee_relaxation, additional_charge_per_student,
        first_billing_duration,
        renewal_billing_duration, renewal_pre_bill_generate_days,
        renewal_payment_relaxation,
        menus, brochure_url, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        sourcePlan.segment, sourcePlan.applied_by, sourcePlan.plan_for, new_plan_name, sourcePlan.description,
        sourcePlan.no_of_students, sourcePlan.students_fee_relaxation, sourcePlan.additional_charge_per_student,
        sourcePlan.first_billing_duration,
        sourcePlan.renewal_billing_duration, sourcePlan.renewal_pre_bill_generate_days,
        sourcePlan.renewal_payment_relaxation,
        sourcePlan.menus, sourcePlan.brochure_url, sourcePlan.status || 'Active'
      ]
    )
    const newPlan = newPlanRes.rows[0]

    // 3. Fetch source billing items
    const itemsRes = await client.query(
      'SELECT * FROM plan_billing_items WHERE plan_id = $1',
      [id]
    )

    // 4. Insert new billing items
    for (const item of itemsRes.rows) {
      await client.query(
        `INSERT INTO plan_billing_items (plan_id, billing_type, serial_no, item_description, price, tax_percentage, tax_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newPlan.id, item.billing_type,
          item.serial_no, item.item_description,
          item.price, item.tax_percentage, item.tax_price
        ]
      )
    }

    await client.query('COMMIT')
    return NextResponse.json({ success: true, data: newPlan })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Plan copy error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  } finally {
    client.release()
  }
}

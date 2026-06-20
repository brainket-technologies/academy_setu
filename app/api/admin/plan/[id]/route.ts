import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const planRes = await pool.query('SELECT * FROM plans WHERE id = $1', [id])
    if (planRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 })
    }

    const plan = planRes.rows[0]

    // Fetch billing items grouped by type
    const itemsRes = await pool.query(
      'SELECT * FROM plan_billing_items WHERE plan_id = $1 ORDER BY serial_no',
      [id]
    )

    plan.first_billing_items = itemsRes.rows
      .filter((r: Record<string, unknown>) => r.billing_type === 'first')
      .map((r: Record<string, unknown>) => ({
        serial_no: r.serial_no,
        item_description: r.item_description,
        price: Number(r.price),
        tax_percentage: Number(r.tax_percentage),
        tax_price: Number(r.tax_price),
      }))

    plan.renewal_billing_items = itemsRes.rows
      .filter((r: Record<string, unknown>) => r.billing_type === 'renewal')
      .map((r: Record<string, unknown>) => ({
        serial_no: r.serial_no,
        item_description: r.item_description,
        price: Number(r.price),
        tax_percentage: Number(r.tax_percentage),
        tax_price: Number(r.tax_price),
      }))

    return NextResponse.json({ success: true, data: plan })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      segment, applied_by, plan_for, plan_name, description,
      no_of_students, students_fee_relaxation, additional_charge_per_student,
      first_billing_duration, first_billing_items,
      renewal_billing_duration, renewal_pre_bill_generate_days,
      renewal_payment_relaxation, renewal_billing_items, status
    } = body

    const result = await pool.query(
      `UPDATE plans SET
        segment = COALESCE($1, segment),
        applied_by = COALESCE($2, applied_by),
        plan_for = COALESCE($3, plan_for),
        plan_name = COALESCE($4, plan_name),
        description = COALESCE($5, description),
        no_of_students = COALESCE($6, no_of_students),
        students_fee_relaxation = COALESCE($7, students_fee_relaxation),
        additional_charge_per_student = COALESCE($8, additional_charge_per_student),
        first_billing_duration = COALESCE($9, first_billing_duration),
        renewal_billing_duration = COALESCE($10, renewal_billing_duration),
        renewal_pre_bill_generate_days = COALESCE($11, renewal_pre_bill_generate_days),
        renewal_payment_relaxation = COALESCE($12, renewal_payment_relaxation),
        status = COALESCE($13, status),
        updated_at = NOW()
      WHERE id = $14
      RETURNING *`,
      [
        segment, applied_by, plan_for, plan_name, description,
        no_of_students, students_fee_relaxation, additional_charge_per_student,
        first_billing_duration,
        renewal_billing_duration, renewal_pre_bill_generate_days,
        renewal_payment_relaxation, status, id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 })
    }

    // Replace billing items: delete old, insert new
    await pool.query('DELETE FROM plan_billing_items WHERE plan_id = $1', [id])

    const insertItem = async (items: Record<string, unknown>[], billingType: string) => {
      for (const item of items) {
        await pool.query(
          `INSERT INTO plan_billing_items (plan_id, billing_type, serial_no, item_description, price, tax_percentage, tax_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            id, billingType,
            item.serial_no, item.item_description,
            item.price, item.tax_percentage, item.tax_price ?? 0
          ]
        )
      }
    }

    const fItems = first_billing_items !== undefined ? first_billing_items : null
    const rItems = renewal_billing_items !== undefined ? renewal_billing_items : null

    if (fItems !== null) await insertItem(fItems, 'first')
    if (rItems !== null) await insertItem(rItems, 'renewal')

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query('DELETE FROM plans WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

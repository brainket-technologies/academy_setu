import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    let query = `SELECT * FROM plans`
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(plan_name ILIKE $${params.length} OR segment ILIKE $${params.length})`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)')
    const countResult = await pool.query(countQuery, params)
    const totalCount = parseInt(countResult.rows[0].count)

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(pageSize, offset)

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: { totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) }
    })
  } catch (error) {
    console.error('Plan list error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      segment, applied_by, plan_for, plan_name, description,
      no_of_students, students_fee_relaxation, additional_charge_per_student,
      first_billing_duration, first_billing_items,
      renewal_billing_duration, renewal_pre_bill_generate_days,
      renewal_payment_relaxation, renewal_billing_items
    } = body

    if (!segment || !applied_by || !plan_name) {
      return NextResponse.json({ success: false, error: 'Segment, Applied By, and Plan Name are required' }, { status: 400 })
    }

    const planRes = await pool.query(
      `INSERT INTO plans (
        segment, applied_by, plan_for, plan_name, description,
        no_of_students, students_fee_relaxation, additional_charge_per_student,
        first_billing_duration,
        renewal_billing_duration, renewal_pre_bill_generate_days,
        renewal_payment_relaxation
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        segment, applied_by, plan_for || 'All User', plan_name, description || '',
        no_of_students || null, students_fee_relaxation || null, additional_charge_per_student || null,
        first_billing_duration || null,
        renewal_billing_duration || null, renewal_pre_bill_generate_days || null,
        renewal_payment_relaxation || null
      ]
    )

    const plan = planRes.rows[0]

    // Insert billing items into the normalized table
    const insertItem = async (items: Record<string, unknown>[], billingType: string) => {
      for (const item of items) {
        await pool.query(
          `INSERT INTO plan_billing_items (plan_id, billing_type, serial_no, item_description, price, tax_percentage, tax_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            plan.id, billingType,
            item.serial_no, item.item_description,
            item.price, item.tax_percentage, item.tax_price ?? 0
          ]
        )
      }
    }

    await insertItem(first_billing_items || [], 'first')
    await insertItem(renewal_billing_items || [], 'renewal')

    return NextResponse.json({ success: true, data: plan })
  } catch (error) {
    console.error('Plan create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

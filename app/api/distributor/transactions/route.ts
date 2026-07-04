import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getDistributorSessionAction } from '@/app/distributor/login/actions'

export async function GET(request: NextRequest) {
  try {
    const session = await getDistributorSessionAction()
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const paymentMode = searchParams.get('payment_mode')
    const dateStr = searchParams.get('date')

    let query = `SELECT * FROM distributor_payments WHERE distributor_id = $1`
    const params: (string | number)[] = [session.userId]

    if (status) {
      params.push(status)
      query += ` AND status = $${params.length}`
    }
    if (paymentMode) {
      params.push(paymentMode)
      query += ` AND payment_mode = $${params.length}`
    }
    if (dateStr) {
      params.push(dateStr)
      query += ` AND payment_date = $${params.length}`
    }

    query += ` ORDER BY created_at DESC`

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Distributor transactions error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

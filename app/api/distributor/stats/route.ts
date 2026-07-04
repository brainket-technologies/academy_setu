import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getDistributorSessionAction } from '@/app/distributor/login/actions'

export async function GET(request: NextRequest) {
  try {
    const session = await getDistributorSessionAction()
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const result = await pool.query(
      'SELECT commission_total as total_amount, paid_amount, due_amount FROM distributors WHERE id = $1',
      [session.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Distributor not found' }, { status: 404 })
    }

    const dist = result.rows[0]
    
    // For now, we return a mock value of 25 for collaborated colleges
    // as we don't have a specific table linking distributors to colleges yet.
    return NextResponse.json({
      success: true,
      data: {
        totalAmount: Number(dist.total_amount) || 0,
        paidAmount: Number(dist.paid_amount) || 0,
        dueAmount: Number(dist.due_amount) || 0,
        collaboratedColleges: 25
      }
    })
  } catch (error) {
    console.error('Distributor Stats error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

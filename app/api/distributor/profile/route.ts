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
      'SELECT id, dist_id, name, mobile_no, email, gender, joining_date FROM distributors WHERE id = $1',
      [session.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Distributor not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Distributor profile error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

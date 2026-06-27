import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      communication_option, call_duration, remarks, 
      follow_up_date, status 
    } = body

    if (!communication_option || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Communication option and status are required' 
      }, { status: 400 })
    }

    // 1. Insert history log
    const historyResult = await pool.query(
      `INSERT INTO lead_history (
        lead_id, communication_option, call_duration, 
        remarks, follow_up_date, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [
        id, communication_option, call_duration || '', 
        remarks || '', follow_up_date || null, status
      ]
    )

    // 2. Update status and updated_at in the main leads table
    await pool.query(
      `UPDATE leads 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2`,
      [status, id]
    )

    return NextResponse.json({ success: true, data: historyResult.rows[0] })
  } catch (error) {
    console.error('Lead history create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

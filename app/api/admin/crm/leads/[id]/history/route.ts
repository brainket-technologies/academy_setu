import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { apiCache } from '@/lib/api-cache'

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

    // Resolve status_id from lead_statuses
    let statusId = null
    const statusRes = await pool.query(
      'SELECT id FROM lead_statuses WHERE LOWER(name) = LOWER($1) OR id::text = $1 LIMIT 1', 
      [status]
    )
    if (statusRes.rows.length > 0) {
      statusId = statusRes.rows[0].id
    }

    // 1. Insert history log
    let historyResult
    try {
      historyResult = await pool.query(
        `INSERT INTO lead_history (
          lead_id, communication_option, call_duration, 
          remarks, follow_up_date, status_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
         RETURNING *`,
        [
          id, communication_option, call_duration || '', 
          remarks || '', follow_up_date || null, statusId
        ]
      )
    } catch {
      // Fallback if status_id is text column 'status'
      historyResult = await pool.query(
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
    }

    // 2. Update status in the main leads table
    if (statusId) {
      await pool.query(
        `UPDATE leads SET status_id = $1, updated_at = NOW() WHERE id = $2`,
        [statusId, id]
      )
    }

    // Clear API cache so UI refreshes immediately
    apiCache.clear()
    if (global._apiCache) {
      global._apiCache.clear()
    }

    return NextResponse.json({ success: true, data: historyResult.rows[0] })
  } catch (error) {
    console.error('Lead history create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

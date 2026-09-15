import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderedIds } = body

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid or empty orderedIds array' }, { status: 400 })
    }

    // Update order_index for each id sequentially
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (let i = 0; i < orderedIds.length; i++) {
        await client.query('UPDATE lead_statuses SET order_index = $1 WHERE id = $2', [i + 1, orderedIds[i]])
      }
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }

    const result = await pool.query('SELECT * FROM lead_statuses ORDER BY COALESCE(order_index, 0) ASC, created_at ASC')
    return NextResponse.json({ success: true, data: result.rows, message: 'Status order updated successfully' })
  } catch (error) {
    console.error('Lead status reorder error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

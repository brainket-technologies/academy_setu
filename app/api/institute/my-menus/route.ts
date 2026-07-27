import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    // For now, simulating the current logged-in institute by fetching the first one with a segment.
    // In a real application, you would resolve the institute ID from the session/token.
    const result = await pool.query(`
      SELECT s.menus 
      FROM institutions i
      JOIN segments s ON i.segment_id = s.id
      WHERE s.menus IS NOT NULL
      LIMIT 1
    `)

    if (result.rows.length > 0) {
      return NextResponse.json({ success: true, menus: result.rows[0].menus })
    }

    // Default empty menus if no segment found
    return NextResponse.json({ success: true, menus: [] })
  } catch (error) {
    console.error('Fetch my-menus error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

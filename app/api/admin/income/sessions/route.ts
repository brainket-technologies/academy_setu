import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query('SELECT * FROM income_sessions ORDER BY name ASC')
    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Fetch income sessions error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

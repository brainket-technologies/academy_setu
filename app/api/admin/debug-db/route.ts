import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const counts = await pool.query('SELECT COUNT(*)::int as count FROM applications')
    const rows = await pool.query('SELECT id, status, school_name FROM applications')
    return NextResponse.json({
      success: true,
      totalCountInDB: counts.rows[0].count,
      rowsInDB: rows.rows
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) })
  }
}

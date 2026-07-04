import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM applications LIMIT 10')
    return NextResponse.json({ success: true, count: result.rowCount, data: result.rows })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_name IN ('tickets','leads','bills','applications','institutions','plans','distributors','lead_statuses','ticket_categories','admins')
      ORDER BY table_name, ordinal_position
    `)
    // Group by table
    const grouped: Record<string, string[]> = {}
    for (const row of res.rows) {
      if (!grouped[row.table_name]) grouped[row.table_name] = []
      grouped[row.table_name].push(row.column_name)
    }
    return NextResponse.json({ success: true, schema: grouped })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) })
  }
}

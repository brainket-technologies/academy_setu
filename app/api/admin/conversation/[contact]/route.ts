import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ contact: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { contact } = await params

    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender = $1 AND receiver = 'Super Admin') 
          OR (sender = 'Super Admin' AND receiver = $1)
       ORDER BY created_at ASC`,
      [contact]
    )

    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Fetch conversation messages error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { contact } = await params

    await pool.query(
      `UPDATE messages 
       SET is_read = true 
       WHERE sender = $1 AND receiver = 'Super Admin' AND is_read = false`,
      [contact]
    )

    return NextResponse.json({ success: true, message: 'Messages marked as read' })
  } catch (error) {
    console.error('Mark messages as read error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

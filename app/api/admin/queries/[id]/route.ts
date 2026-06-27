import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { response_message } = body

    if (!response_message || !response_message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Response Message is required' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `UPDATE queries
       SET response_message = $1, status = 'Responded', updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [response_message.trim(), id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Query not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Query respond error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await pool.query(
      `DELETE FROM queries WHERE id = $1 RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Query not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Query deleted successfully' })
  } catch (error) {
    console.error('Query delete error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

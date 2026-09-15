import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, text_color, bg_color, show_on_bdm, order_index } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Status Name is required' }, { status: 400 })
    }

    let query = `UPDATE lead_statuses SET name = $1, text_color = $2, bg_color = $3, show_on_bdm = $4`
    const values: any[] = [name, text_color, bg_color, show_on_bdm]

    if (order_index !== undefined) {
      values.push(Number(order_index))
      query += `, order_index = $${values.length}`
    }

    values.push(id)
    query += ` WHERE id = $${values.length} RETURNING *`

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Status not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Lead status update error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await pool.query('DELETE FROM lead_statuses WHERE id = $1 RETURNING *', [id])
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Status not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: 'Status deleted successfully' })
  } catch (error) {
    console.error('Lead status delete error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

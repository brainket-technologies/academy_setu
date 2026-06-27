import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function GET(request: NextRequest) {
  try {
    await ensureShopDb()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = 'SELECT * FROM sms_templates WHERE 1=1'
    const params: any[] = []

    if (status && status !== 'All') {
      params.push(status)
      query += ` AND status = $${params.length}`
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Fetch SMS templates error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureShopDb()
    const body = await request.json()
    const { template_name, message_content } = body

    if (!template_name || !message_content) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO sms_templates (template_name, message_content, status)
       VALUES ($1, $2, 'Pending')
       RETURNING *`,
      [template_name, message_content]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Create SMS template error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function GET(request: NextRequest) {
  try {
    await ensureShopDb()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let query = 'SELECT * FROM sms_template_requests WHERE 1=1'
    const params: any[] = []

    if (search) {
      params.push(`%${search}%`)
      query += ` AND (school_name ILIKE $${params.length} OR contact_person ILIKE $${params.length} OR mobile_no ILIKE $${params.length})`
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Fetch template requests error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

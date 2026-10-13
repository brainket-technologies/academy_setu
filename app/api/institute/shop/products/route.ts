import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function GET(request: NextRequest) {
  try {
    await ensureShopDb()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    let query = 'SELECT * FROM products'
    const params: any[] = []

    if (search.trim()) {
      query += ' WHERE name ILIKE $1 OR description ILIKE $1'
      params.push(`%${search.trim()}%`)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error: any) {
    console.error('Fetch institute shop products error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

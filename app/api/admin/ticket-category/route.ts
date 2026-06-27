import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'all'
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('start_date') || ''
    const endDate = searchParams.get('end_date') || ''

    // Fetch counts
    const countsRes = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE is_deleted = false) as active_count,
        COUNT(*) FILTER (WHERE is_deleted = true) as deleted_count
      FROM ticket_categories
    `)
    const counts = {
      active: parseInt(countsRes.rows[0].active_count || '0'),
      deleted: parseInt(countsRes.rows[0].deleted_count || '0')
    }

    // Fetch categories based on tab and filters
    const showDeleted = tab === 'deleted'
    let query = `SELECT * FROM ticket_categories WHERE is_deleted = $1`
    const params: any[] = [showDeleted]
    let paramIdx = 2

    if (search) {
      query += ` AND (name ILIKE $${paramIdx} OR parent_category ILIKE $${paramIdx} OR segment ILIKE $${paramIdx})`
      params.push(`%${search}%`)
      paramIdx++
    }

    if (startDate) {
      query += ` AND created_at >= $${paramIdx}`
      params.push(startDate)
      paramIdx++
    }

    if (endDate) {
      query += ` AND created_at <= $${paramIdx}`
      params.push(endDate)
      paramIdx++
    }

    query += ` ORDER BY created_at DESC`

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: { counts }
    })
  } catch (error) {
    console.error('Category list error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, parent_category, segment, 
      low_timeline, medium_timeline, high_timeline 
    } = body

    if (!name || !parent_category || !segment) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, Parent Category, and Segment are required' 
      }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO ticket_categories (
        name, parent_category, segment, 
        low_timeline, medium_timeline, high_timeline, 
        is_deleted, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW()) 
       RETURNING *`,
      [
        name, parent_category, segment, 
        low_timeline || '', medium_timeline || '', high_timeline || ''
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Category create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

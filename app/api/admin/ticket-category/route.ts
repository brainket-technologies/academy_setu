import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ticket_parent_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      is_deleted BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)
}

export async function GET(request: NextRequest) {
  try {
    await ensureTables()
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
      active: parseInt(countsRes.rows[0]?.active_count || '0'),
      deleted: parseInt(countsRes.rows[0]?.deleted_count || '0')
    }

    // Fetch parent categories
    const parentsRes = await pool.query(`
      SELECT name FROM ticket_parent_categories WHERE is_deleted = false ORDER BY name ASC
    `)
    const parentNames = parentsRes.rows.map(r => r.name)

    // Also pick up any distinct parent_category in ticket_categories not yet in parent list
    const subParentsRes = await pool.query(`
      SELECT DISTINCT parent_category 
      FROM ticket_categories 
      WHERE parent_category IS NOT NULL AND parent_category != ''
    `)
    const combinedParents = Array.from(
      new Set([...parentNames, ...subParentsRes.rows.map(r => r.parent_category)])
    ).sort()

    // Fetch subcategories based on tab and filters
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
      meta: { 
        counts,
        parents: combinedParents
      }
    })
  } catch (error) {
    console.error('Category list error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTables()
    const body = await request.json()
    const { 
      low_timeline, medium_timeline, high_timeline 
    } = body

    const name = String(body.name || '').trim()
    const parent_category = String(body.parent_category || '').trim()
    let segment = String(body.segment || '').trim()

    if (!name || !parent_category) {
      return NextResponse.json({ 
        success: false, 
        error: 'Subcategory Name and Parent Category are required' 
      }, { status: 400 })
    }

    // Default segment if not provided
    if (!segment) {
      try {
        const segRes = await pool.query('SELECT name FROM segments LIMIT 1')
        segment = segRes.rows[0]?.name || 'Institute'
      } catch {
        segment = 'Institute'
      }
    }

    // Look up segment_id if exists
    let segment_id: string | null = null
    try {
      const segIdRes = await pool.query('SELECT id FROM segments WHERE name = $1 LIMIT 1', [segment])
      segment_id = segIdRes.rows[0]?.id || null
    } catch {}

    // Ensure parent category exists in ticket_parent_categories table
    await pool.query(`
      INSERT INTO ticket_parent_categories (name, created_at, updated_at)
      VALUES ($1, NOW(), NOW())
      ON CONFLICT (name) DO UPDATE SET is_deleted = false, updated_at = NOW()
    `, [parent_category])

    // Check if subcategory already exists under this parent
    const existing = await pool.query(`
      SELECT * FROM ticket_categories 
      WHERE LOWER(name) = LOWER($1) AND LOWER(parent_category) = LOWER($2)
      LIMIT 1
    `, [name, parent_category])

    if (existing.rows.length > 0) {
      const row = existing.rows[0]
      // If deleted, un-delete and update
      const updated = await pool.query(`
        UPDATE ticket_categories 
        SET is_deleted = false,
            segment = $1,
            segment_id = $2,
            low_timeline = $3,
            medium_timeline = $4,
            high_timeline = $5,
            updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `, [
        segment,
        segment_id,
        low_timeline || row.low_timeline || '',
        medium_timeline || row.medium_timeline || '',
        high_timeline || row.high_timeline || '',
        row.id
      ])
      return NextResponse.json({ success: true, data: updated.rows[0] })
    }

    // Insert new subcategory
    const result = await pool.query(
      `INSERT INTO ticket_categories (
        name, parent_category, segment, segment_id,
        low_timeline, medium_timeline, high_timeline, 
        is_deleted, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW()) 
       RETURNING *`,
      [
        name, 
        parent_category, 
        segment,
        segment_id,
        low_timeline || '', 
        medium_timeline || '', 
        high_timeline || ''
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Category create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(t.ticket_no ILIKE $${params.length} OR i.name ILIKE $${params.length} OR t.complainer_name ILIKE $${params.length})`)
    }
    if (status) {
      params.push(status)
      conditions.push(`t.status = $${params.length}`)
    }

    const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''

    // Count query
    const countQuery = `
      SELECT COUNT(*)::int as count
      FROM tickets t
      LEFT JOIN institutions i ON t.institution_id = i.id
      ${where}
    `
    const countResult = await pool.query(countQuery, params)
    const totalCount = countResult.rows[0].count

    // Data query with joins
    const query = `
      SELECT 
        t.*,
        i.name as school_name,
        i.state as school_state,
        i.district as school_district,
        tc.name as category_name
      FROM tickets t
      LEFT JOIN institutions i ON t.institution_id = i.id
      LEFT JOIN ticket_categories tc ON t.category_id = tc.id
      ${where}
      ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `
    params.push(pageSize, offset)
    const result = await pool.query(query, params)

    const countsResult = await pool.query(`
      SELECT 
        COUNT(*)::int as all_count,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END)::int as pending_count,
        COUNT(CASE WHEN status = 'Requested' THEN 1 END)::int as requested_count,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END)::int as completed_count
      FROM tickets
    `)
    const counts = {
      all: countsResult.rows[0].all_count,
      pending: countsResult.rows[0].pending_count,
      requested: countsResult.rows[0].requested_count,
      completed: countsResult.rows[0].completed_count
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: { totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize), counts }
    })
  } catch (error) {
    console.error('Ticket list error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      school_name, institution_id, ticket_no, category_id, sub_category, 
      priority, complainer_name, complainer_mobile, description, image_attachment, 
      status, assigned_to
    } = body

    if (!category_id) {
      return NextResponse.json({ success: false, error: 'Category is required' }, { status: 400 })
    }

    // Resolve institution_id if school_name provided
    let finalInstitutionId = institution_id
    if (!finalInstitutionId && school_name) {
      const instRes = await pool.query('SELECT id FROM institutions WHERE name ILIKE $1 LIMIT 1', [school_name])
      finalInstitutionId = instRes.rows[0]?.id || null
    }

    // Generate ticket number if not provided
    const finalTicketNo = ticket_no || `TICK${Math.floor(100000 + Math.random() * 900000)}`

    const result = await pool.query(
      `INSERT INTO tickets (ticket_no, assigned_to, institution_id, category_id, sub_category, priority, complainer_name, complainer_mobile, description, image_attachment, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        finalTicketNo,
        assigned_to || '',
        finalInstitutionId,
        category_id,
        sub_category || '',
        priority || 'Low',
        complainer_name || '',
        complainer_mobile || '',
        description || '',
        image_attachment || '',
        status || 'Pending'
      ]
    )

    // Fetch the joined data to return
    const ticket = result.rows[0]
    const enrichedRes = await pool.query(`
      SELECT t.*, i.name as school_name, tc.name as category_name
      FROM tickets t
      LEFT JOIN institutions i ON t.institution_id = i.id
      LEFT JOIN ticket_categories tc ON t.category_id = tc.id
      WHERE t.id = $1
    `, [ticket.id])

    return NextResponse.json({ success: true, data: enrichedRes.rows[0] || ticket })
  } catch (error) {
    console.error('Ticket create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

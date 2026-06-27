import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const segment = searchParams.get('segment') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    let query = 'SELECT * FROM tickets'
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(ticket_no ILIKE $${params.length} OR school_name ILIKE $${params.length} OR complainer_name ILIKE $${params.length})`)
    }

    if (status) {
      params.push(status)
      conditions.push(`status = $${params.length}`)
    }

    if (segment) {
      params.push(segment)
      conditions.push(`segment = $${params.length}`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)')
    const countResult = await pool.query(countQuery, params)
    const totalCount = parseInt(countResult.rows[0].count)

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(pageSize, offset)

    const result = await pool.query(query, params)

    const countsResult = await pool.query(`
      SELECT 
        COUNT(*) as all_count,
        COUNT(*) FILTER (WHERE status = 'Pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'Requested') as requested_count,
        COUNT(*) FILTER (WHERE status = 'Completed') as completed_count
      FROM tickets
    `)
    const counts = {
      all: parseInt(countsResult.rows[0].all_count || '0'),
      pending: parseInt(countsResult.rows[0].pending_count || '0'),
      requested: parseInt(countsResult.rows[0].requested_count || '0'),
      completed: parseInt(countsResult.rows[0].completed_count || '0')
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
      segment, school_name, ticket_no, ticket_category, sub_category, 
      priority, complainer_name, complainer_mobile, description, image_attachment, status 
    } = body

    if (!segment || !school_name || !ticket_category) {
      return NextResponse.json({ success: false, error: 'Segment, School Name, and Category are required' }, { status: 400 })
    }

    // Generate ticket number if not provided
    const finalTicketNo = ticket_no || `Tick${Math.floor(100000 + Math.random() * 900000)}`

    const result = await pool.query(
      `INSERT INTO tickets (ticket_no, assigned_to, segment, school_name, ticket_category, sub_category, priority, complainer_name, complainer_mobile, description, image_attachment, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        finalTicketNo,
        '', // Initially not assigned
        segment,
        school_name,
        ticket_category,
        sub_category || '',
        priority || 'Low',
        complainer_name || '',
        complainer_mobile || '',
        description || '',
        image_attachment || '',
        status || 'Pending'
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Ticket create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

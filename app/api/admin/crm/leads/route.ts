import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const source = searchParams.get('source') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    let query = `
      SELECT l.*, 
        (SELECT remarks FROM lead_history lh WHERE lh.lead_id = l.id ORDER BY lh.created_at DESC LIMIT 1) as latest_remarks,
        (SELECT follow_up_date FROM lead_history lh WHERE lh.lead_id = l.id ORDER BY lh.created_at DESC LIMIT 1) as latest_follow_up
      FROM leads l
    `
    const conditions: string[] = []
    const params: (string | number)[] = []

    if (search) {
      params.push(`%${search}%`)
      conditions.push(`(l.school_name ILIKE $${params.length} OR l.contact_person ILIKE $${params.length} OR l.mobile_no ILIKE $${params.length})`)
    }

    if (source) {
      params.push(source)
      conditions.push(`l.lead_source = $${params.length}`)
    }

    if (status) {
      params.push(status)
      conditions.push(`l.status = $${params.length}`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    const countQuery = `SELECT COUNT(*)::int FROM (` + query + `) as count_table`
    const countResult = await pool.query(countQuery, params)
    const totalCount = countResult.rows[0].count

    query += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(pageSize, offset)

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: { totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) }
    })
  } catch (error) {
    console.error('Leads fetch error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      lead_source, mobile_no, email_id, contact_person, 
      school_name, state, district, no_of_students, status 
    } = body

    if (!lead_source || !mobile_no || !school_name || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Lead Source, Mobile No., School Name, and Status are required' 
      }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO leads (
        lead_source, mobile_no, email_id, contact_person, 
        school_name, state, district, no_of_students, status,
        assigned_to, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '', NOW(), NOW())
       RETURNING *`,
      [
        lead_source, mobile_no, email_id || '', contact_person || '',
        school_name, state || '', district || '', parseInt(no_of_students || '0'), status
      ]
    )

    const newLead = result.rows[0]

    // Create an initial history log
    await pool.query(
      `INSERT INTO lead_history (lead_id, communication_option, call_duration, remarks, follow_up_date, status, created_at)
       VALUES ($1, 'Message', '', 'Lead created', NULL, $2, NOW())`,
      [newLead.id, status]
    )

    return NextResponse.json({ success: true, data: newLead })
  } catch (error) {
    console.error('Lead create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

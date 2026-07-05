import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { withCache, apiCache } from '@/lib/api-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const source = searchParams.get('source') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const assigned_to = searchParams.get('assigned_to') || ''
    const offset = (page - 1) * pageSize

    const cacheKey = `leads:${search}:${source}:${status}:${assigned_to}:${page}:${pageSize}`

    const data = await withCache(cacheKey, async () => {
      const conditions: string[] = []
      const params: (string | number)[] = []

      if (search) {
        params.push(`%${search}%`)
        conditions.push(`(l.institution_name ILIKE $${params.length} OR l.contact_person ILIKE $${params.length} OR l.mobile_no ILIKE $${params.length})`)
      }
      if (source) { params.push(source); conditions.push(`l.lead_source = $${params.length}`) }
      if (status) { params.push(status); conditions.push(`ls.name = $${params.length}`) }
      
      if (assigned_to === 'unassigned') {
        conditions.push(`l.assigned_to_id IS NULL`)
      } else if (assigned_to) {
        params.push(assigned_to)
        conditions.push(`l.assigned_to_id = $${params.length}`)
      }

      const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''

      // Use lateral subqueries + COUNT(*) OVER() — single DB round-trip
      const query = `
        SELECT l.*,
          ls.name as status,
          ls.text_color as status_text_color,
          ls.bg_color as status_bg_color,
          (SELECT remarks FROM lead_history lh WHERE lh.lead_id = l.id ORDER BY lh.created_at DESC LIMIT 1) AS latest_remarks,
          (SELECT follow_up_date FROM lead_history lh WHERE lh.lead_id = l.id ORDER BY lh.created_at DESC LIMIT 1) AS latest_follow_up,
          a.name as assigned_user_name,
          a.role as assigned_user_role,
          COUNT(*) OVER()::int AS _total_count
        FROM leads l
        LEFT JOIN lead_statuses ls ON l.status_id = ls.id
        LEFT JOIN admins a ON l.assigned_to_id = a.id
        ${where}
        ORDER BY l.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `
      params.push(pageSize, offset)
      const result = await pool.query(query, params)
      const totalCount = result.rows[0]?._total_count ?? 0
      const rows = result.rows.map(({ _total_count, ...r }) => r)
      return { rows, totalCount }
    }, 20_000)

    return NextResponse.json(
      { success: true, data: data.rows, meta: { totalCount: data.totalCount, page, pageSize, totalPages: Math.ceil(data.totalCount / pageSize) } },
      { headers: { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=60' } }
    )
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
      school_name, state, district, no_of_students, status_id, status
    } = body

    if (!lead_source || !mobile_no || !school_name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Lead Source, Mobile No., and School Name are required' 
      }, { status: 400 })
    }

    // Resolve status_id if only status name is given
    let finalStatusId = status_id
    if (!finalStatusId && status) {
      const statusRes = await pool.query('SELECT id FROM lead_statuses WHERE name = $1 LIMIT 1', [status])
      if (statusRes.rows.length > 0) finalStatusId = statusRes.rows[0].id
    }
    if (!finalStatusId) {
      const statusRes = await pool.query("SELECT id FROM lead_statuses ORDER BY created_at LIMIT 1")
      if (statusRes.rows.length > 0) finalStatusId = statusRes.rows[0].id
    }

    const result = await pool.query(
      `INSERT INTO leads (
        lead_source, mobile_no, email_id, contact_person, 
        institution_name, state, district, no_of_students, status_id,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        lead_source, mobile_no, email_id || '', contact_person || '',
        school_name, state || '', district || '', parseInt(no_of_students || '0'), finalStatusId
      ]
    )

    const newLead = result.rows[0]

    // Create an initial history log
    await pool.query(
      `INSERT INTO lead_history (lead_id, communication_option, call_duration, remarks, follow_up_date, status_id, created_at)
       VALUES ($1, 'Message', '', 'Lead created', NULL, $2, NOW())`,
      [newLead.id, finalStatusId]
    )

    // Invalidate cache
    apiCache.clear()

    return NextResponse.json({ success: true, data: { ...newLead, school_name } })
  } catch (error) {
    console.error('Lead create error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

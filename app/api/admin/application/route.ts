import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const tab = searchParams.get('tab') || 'all'
  const start_date = searchParams.get('start_date') || ''
  const end_date = searchParams.get('end_date') || ''
  const status = searchParams.get('status') || ''
  const state = searchParams.get('state') || ''
  const district = searchParams.get('district') || ''
  const portal = searchParams.get('portal') || 'admin'

  try {
    // Determine user session to apply role-based filtering
    let userId = null
    let userRole = 'Admin'

    const checkAdmin = async () => {
      const s = await getSession('admin_session')
      if (s) { userId = s.userId; userRole = 'Admin'; return true }
      return false
    }
    const checkManager = async () => {
      const s = await getSession('manager_session')
      if (s) { userId = s.userId; userRole = s.role; return true }
      return false
    }
    const checkBdm = async () => {
      const s = await getSession('bdm_session')
      if (s) { userId = s.userId; userRole = s.role; return true }
      return false
    }

    let authenticated = false
    if (portal === 'manager') {
      authenticated = await checkManager() || await checkAdmin() || await checkBdm()
    } else if (portal === 'bdm') {
      authenticated = await checkBdm() || await checkAdmin() || await checkManager()
    } else {
      authenticated = await checkAdmin() || await checkManager() || await checkBdm()
    }

    const countsResult = await pool.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN a.status IN ('Applied', 'Requested') THEN 1 END)::int as new
      FROM applications a
      LEFT JOIN institutions i ON a.institution_id = i.id
      ${userRole === 'Manager' || userRole === 'BDM' ? `WHERE i.assigned_to = '${userId}' OR a.created_by = '${userId}'` : ''}
    `)
    const { total, new: newCount } = countsResult.rows[0]

    // 2. Fetch applications with filters
    let query = `
      SELECT 
        a.id, a.application_no, i.name as school_name, i.contact_person, 
        i.state, i.district, a.status, a.created_at, 
        i.assigned_to, u.name as assigned_user_name, u.role as assigned_user_role 
      FROM applications a
      LEFT JOIN institutions i ON a.institution_id = i.id
      LEFT JOIN admins u ON i.assigned_to = u.id
    `
    const values: any[] = []
    const conditions: string[] = []

    if (userRole === 'Manager' || userRole === 'BDM') {
      conditions.push(`(i.assigned_to = $${values.length + 1} OR a.created_by = $${values.length + 1})`)
      values.push(userId)
    }

    const assignedTo = searchParams.get('assigned_to') || ''
    if (assignedTo === 'unassigned') {
      conditions.push('i.assigned_to IS NULL')
    } else if (assignedTo) {
      conditions.push('i.assigned_to = $' + (values.length + 1))
      values.push(assignedTo)
    }

    if (status) {
      conditions.push('a.status = $' + (values.length + 1))
      values.push(status)
    }

    if (state) {
      conditions.push('i.state ILIKE $' + (values.length + 1))
      values.push(`%${state}%`)
    }

    if (district) {
      conditions.push('i.district ILIKE $' + (values.length + 1))
      values.push(`%${district}%`)
    }

    if (start_date) {
      conditions.push('a.created_at::date >= $' + (values.length + 1))
      values.push(start_date)
    }

    if (end_date) {
      conditions.push('a.created_at::date <= $' + (values.length + 1))
      values.push(end_date)
    }

    if (search) {
      conditions.push('(i.name ILIKE $' + (values.length + 1) + 
                      ' OR i.contact_person ILIKE $' + (values.length + 1) + 
                      ' OR i.state ILIKE $' + (values.length + 1) + 
                      ' OR i.district ILIKE $' + (values.length + 1) + 
                      ' OR a.application_no ILIKE $' + (values.length + 1) + ')')
      values.push(`%${search}%`)
    }

    if (tab === 'new') {
      conditions.push("a.status IN ('Applied', 'Requested')")
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY created_at DESC'
    const result = await pool.query(query, values)

    return NextResponse.json({
      success: true,
      data: result.rows,
      meta: {
        totalCount: total,
        newCount: newCount
      }
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const userId = session?.userId

    const body = await request.json()
    const { 
      school_name, school_code, affiliated_to, affiliation_code,
      contact_person, mobile_no, email_id, address, state, district, pincode,
      principal_name, principal_gender, principal_sign, principal_photo,
      director_name, director_gender, director_sign, director_photo,
      status, enquiry_status, plan, promo_code
    } = body

    if (!school_name || !contact_person || !mobile_no || !address || !state || !district || !pincode) {
      return NextResponse.json({ success: false, error: 'All required fields are missing.' }, { status: 400 })
    }

    // 1. Create or update institution first
    const instResult = await pool.query(
      `INSERT INTO institutions (
        name, code, affiliated_to, affiliation_code,
        contact_person, mobile_no, email_id, address, state, district, pincode,
        principal_name, principal_gender, principal_sign, principal_photo,
        director_name, director_gender, director_sign, director_photo,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'Active')
       RETURNING id`,
      [
        school_name, school_code || '', affiliated_to || '', affiliation_code || '',
        contact_person, mobile_no, email_id || '', address, state, district, pincode,
        principal_name || '', principal_gender || 'Male', principal_sign || '', principal_photo || '',
        director_name || '', director_gender || 'Male', director_sign || '', director_photo || ''
      ]
    )
    const institutionId = instResult.rows[0].id

    // Generate a unique application_no
    const countResult = await pool.query('SELECT COUNT(*) FROM applications')
    const count = parseInt(countResult.rows[0].count) + 125
    const applicationNo = `AS2026${count}`

    let planId = null
    if (plan) {
      const planRes = await pool.query(
        'SELECT id FROM plans WHERE id::text = $1 OR plan_name = $1 LIMIT 1',
        [plan]
      )
      if (planRes.rows.length > 0) {
        planId = planRes.rows[0].id
      }
    }

    const result = await pool.query(
      `INSERT INTO applications (
        application_no, institution_id,
        status, enquiry_status, promo_code, plan_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        applicationNo, institutionId,
        status || 'Applied', enquiry_status || 'Applied', promo_code || '', planId, userId
      ]
    )

    return NextResponse.json({ success: true, data: { ...result.rows[0], school_name: school_name, contact_person: contact_person, state: state, district: district } })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

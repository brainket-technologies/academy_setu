import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portal = searchParams.get('portal') || ''
    
    // Check if session is manager
    const managerSession = await getSession('manager_session')
    const isManagerPortal = portal === 'manager' || (managerSession && !portal)

    let roleCondition = `(role ILIKE '%Manager%' OR role ILIKE '%BDM%' OR role ILIKE '%Admin%')`
    if (portal === 'manager' || portal === 'bdm') {
      // Manager and BDM can only assign/transfer to Admin or BDM (not to Manager/self)
      roleCondition = `(role ILIKE '%BDM%' OR role ILIKE '%Admin%') AND role NOT ILIKE '%Manager%'`
    }

    const query = `
      SELECT id, name, email, role, avatar_url 
      FROM admins 
      WHERE ${roleCondition} AND is_active = true
      ORDER BY role ASC, name ASC
    `
    const result = await pool.query(query)
    
    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Fetch assignable users error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}


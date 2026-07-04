import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const query = `
      SELECT id, name, email, role, avatar_url 
      FROM admins 
      WHERE role IN ('Manager', 'BDM') AND is_active = true
      ORDER BY name ASC
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

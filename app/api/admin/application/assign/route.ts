import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: Request) {
  try {
    // Ensure column exists first
    await pool.query('ALTER TABLE applications ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admins(id) ON DELETE SET NULL;')
    
    const body = await request.json()
    const { application_ids, assigned_to } = body

    if (!Array.isArray(application_ids) || application_ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No applications selected' }, { status: 400 })
    }

    if (assigned_to === undefined) {
      return NextResponse.json({ success: false, error: 'Assigned user is missing' }, { status: 400 })
    }

    // assigned_to can be null (unassigning)
    const paramAssignedTo = assigned_to || null

    // Generate placeholders for IN clause: $2, $3, $4...
    const placeholders = application_ids.map((_, i) => `$${i + 2}`).join(',')
    
    const query = `
      UPDATE applications 
      SET assigned_to = $1, updated_at = NOW() 
      WHERE id IN (${placeholders})
    `
    
    const values = [paramAssignedTo, ...application_ids]
    
    const result = await pool.query(query, values)

    return NextResponse.json({ 
      success: true, 
      message: `Successfully assigned ${result.rowCount} applications.` 
    })
  } catch (error) {
    console.error('Assign error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

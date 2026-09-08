import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { apiCache } from '@/lib/api-cache'

export async function POST(request: NextRequest) {
  try {
    const { lead_ids, assigned_to } = await request.json()

    if (!Array.isArray(lead_ids) || lead_ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads selected' }, { status: 400 })
    }

    let finalAssignedToId = null
    if (assigned_to) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assigned_to)) {
        finalAssignedToId = assigned_to
      } else {
        const adminRes = await pool.query('SELECT id FROM admins WHERE name = $1 LIMIT 1', [assigned_to])
        if (adminRes.rows.length > 0) finalAssignedToId = adminRes.rows[0].id
      }
    }

    const placeholders = lead_ids.map((_, idx) => `$${idx + 2}`).join(',')
    
    // Update leads both assigned_to_id and assigned_to
    const query = `
      UPDATE leads
      SET assigned_to_id = $1, updated_at = NOW()
      WHERE id IN (${placeholders})
    `
    await pool.query(query, [finalAssignedToId, ...lead_ids])

    try {
      await pool.query(`UPDATE leads SET assigned_to = $1 WHERE id IN (${placeholders})`, [finalAssignedToId, ...lead_ids])
    } catch {
      // ignore if assigned_to column missing or type mismatch
    }

    apiCache.clear()
    if (global._apiCache) {
      global._apiCache.clear()
    }

    return NextResponse.json({ success: true, message: 'Leads assigned successfully' })
  } catch (error) {
    console.error('Lead bulk assign error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function GET(request: NextRequest) {
  try {
    await ensureShopDb()
    const { searchParams } = new URL(request.url)
    const schoolName = searchParams.get('schoolName') || ''
    const deviceType = searchParams.get('deviceType') || ''
    const verified = searchParams.get('verified') // 'true' or 'false'

    let query = 'SELECT * FROM device_recharge_requests WHERE 1=1'
    const params: any[] = []

    if (schoolName) {
      params.push(schoolName)
      query += ` AND school_name = $${params.length}`
    }

    if (deviceType) {
      params.push(deviceType)
      query += ` AND device_type = $${params.length}`
    }

    if (verified !== undefined && verified !== null && verified !== '') {
      params.push(verified === 'true')
      query += ` AND verified = $${params.length}`
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Fetch recharge requests error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureShopDb()
    const body = await request.json()
    const { school_name, device_name, imei_no, device_type, plan_duration, amount, payment_reference } = body

    if (!school_name || !device_name || !plan_duration) {
      return NextResponse.json({ success: false, error: 'Required fields missing' }, { status: 400 })
    }

    const amt = parseFloat(String(amount || '2000'))
    const taxPercent = 18
    const totalAmount = amt + (amt * (taxPercent / 100))

    const result = await pool.query(
      `INSERT INTO device_recharge_requests 
       (school_name, device_name, imei_no, device_type, plan_duration, amount, tax_percent, total_amount, payment_reference, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE)
       RETURNING *`,
      [school_name, device_name, imei_no || '1234567890', device_type || 'GPS', plan_duration, amt, taxPercent, totalAmount, payment_reference || '']
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Create recharge request error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

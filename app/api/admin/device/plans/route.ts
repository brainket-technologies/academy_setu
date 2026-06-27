import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureShopDb } from '@/lib/shop-db'

export async function GET(request: NextRequest) {
  try {
    await ensureShopDb()
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get('brand') || ''
    const deviceType = searchParams.get('deviceType') || ''
    const search = searchParams.get('search') || ''

    let query = 'SELECT * FROM device_plans WHERE 1=1'
    const params: any[] = []

    if (brand) {
      params.push(brand)
      query += ` AND brand = $${params.length}`
    }

    if (deviceType) {
      params.push(deviceType)
      query += ` AND device_type = $${params.length}`
    }

    if (search) {
      params.push(`%${search}%`)
      query += ` AND (device_name ILIKE $${params.length} OR imei_no ILIKE $${params.length})`
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('Fetch plans error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureShopDb()
    const body = await request.json()
    const { 
      name, duration_type, duration, amount, tax_percent, 
      brand, device_type, device_name, imei_no, description, plan_description, image_url 
    } = body

    if (!name || !duration || !amount) {
      return NextResponse.json({ success: false, error: 'Required fields missing' }, { status: 400 })
    }

    const taxPercent = parseFloat(String(tax_percent || '18'))
    const amt = parseFloat(String(amount))
    const total = amt + (amt * (taxPercent / 100))

    const result = await pool.query(
      `INSERT INTO device_plans 
       (name, duration_type, duration, amount, tax_percent, total_amount, status, brand, device_type, device_name, imei_no, description, plan_description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, 'Active', $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        name, duration_type || 'Days', parseInt(String(duration)), amt, taxPercent, total,
        brand || 'Brand 1', device_type || 'GPS', device_name || 'Device 1', imei_no || '1234567890',
        description || '', plan_description || '', image_url || ''
      ]
    )

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Create plan error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

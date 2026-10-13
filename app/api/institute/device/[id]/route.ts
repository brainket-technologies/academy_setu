import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureDeviceDb } from '@/lib/device-db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDeviceDb()
    const { id } = await params
    const body = await request.json()
    const { status, deviceName, simNo, deviceSrNo } = body

    let updates: string[] = []
    let queryParams: any[] = [id]

    if (status !== undefined) {
      queryParams.push(status)
      updates.push(`status = $${queryParams.length}`)
    }
    if (deviceName !== undefined) {
      queryParams.push(deviceName)
      updates.push(`device_name = $${queryParams.length}`)
    }
    if (simNo !== undefined) {
      queryParams.push(simNo)
      updates.push(`sim_no = $${queryParams.length}`)
    }
    if (deviceSrNo !== undefined) {
      queryParams.push(deviceSrNo)
      updates.push(`device_sr_no = $${queryParams.length}`)
    }

    updates.push(`updated_at = NOW()`)

    const query = `
      UPDATE institute_devices 
      SET ${updates.join(', ')} 
      WHERE id = $1 
      RETURNING *,
        GREATEST(0, (valid_to - CURRENT_DATE)::int) AS expiry_days,
        TO_CHAR(valid_from, 'DD/MM/YYYY') AS valid_from_formatted,
        TO_CHAR(valid_to, 'DD/MM/YYYY') AS valid_to_formatted
    `
    const result = await pool.query(query, queryParams)

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 })
    }

    const row = result.rows[0]
    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        deviceName: row.device_name,
        deviceType: row.device_type,
        deviceModel: row.device_model,
        brand: row.brand,
        simNo: row.sim_no,
        simImei: row.sim_imei,
        deviceSrNo: row.device_sr_no,
        planName: row.plan_name,
        durationDays: row.duration_days,
        amount: parseFloat(row.amount),
        taxPercent: parseFloat(row.tax_percent),
        totalAmount: parseFloat(row.total_amount),
        paymentMode: row.payment_mode,
        transactionId: row.transaction_id,
        paymentStatus: row.payment_status,
        status: row.status,
        imageUrl: row.image_url,
        validFrom: row.valid_from_formatted,
        validTo: row.valid_to_formatted,
        expiryDays: row.expiry_days
      }
    })
  } catch (error: any) {
    console.error('Update device error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDeviceDb()
    const { id } = await params
    const result = await pool.query(`DELETE FROM institute_devices WHERE id = $1 RETURNING id`, [id])

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Device deleted successfully' })
  } catch (error: any) {
    console.error('Delete device error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

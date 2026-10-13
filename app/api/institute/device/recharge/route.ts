import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureDeviceDb } from '@/lib/device-db'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    await ensureDeviceDb()
    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'

    const body = await request.json()
    const {
      deviceId,
      deviceName,
      deviceType,
      deviceSrNo,
      simNo,
      simImei = '',
      planId,
      paymentMode = 'Online / UPI',
      transactionId = '',
      description = ''
    } = body

    if (!planId) {
      return NextResponse.json({ success: false, error: 'Recharge Plan is required' }, { status: 400 })
    }

    // 1. Fetch Plan from device_plans
    const planRes = await pool.query(`SELECT * FROM device_plans WHERE id = $1`, [planId])
    if (planRes.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 })
    }
    const plan = planRes.rows[0]

    let resolvedDeviceName = deviceName || ''
    let resolvedDeviceType = deviceType || plan.device_type || 'GPS'
    let resolvedDeviceSrNo = deviceSrNo || ''
    let resolvedSimNo = simNo || ''
    let resolvedSimImei = simImei || ''
    let resolvedBrand = 'Academy Setu Tech'

    // 2. If deviceId is provided and not 'custom', fetch from institute_devices
    if (deviceId && deviceId !== 'custom') {
      const devRes = await pool.query(`SELECT * FROM institute_devices WHERE id = $1`, [deviceId])
      if (devRes.rows.length > 0) {
        const d = devRes.rows[0]
        resolvedDeviceName = d.device_name
        resolvedDeviceType = d.device_type
        resolvedDeviceSrNo = d.device_sr_no
        resolvedSimNo = d.sim_no
        resolvedSimImei = d.sim_imei
        resolvedBrand = d.brand || 'Academy Setu Tech'

        // Mark device recharge status as Pending Verification
        await pool.query(`
          UPDATE institute_devices 
          SET 
            recharge_status = 'Pending Verification',
            pending_plan_name = $1,
            updated_at = NOW()
          WHERE id = $2
        `, [plan.name, deviceId])
      }
    }

    if (!resolvedDeviceName || !resolvedDeviceSrNo) {
      return NextResponse.json({
        success: false,
        error: 'Please select a valid device or provide device name & IMEI.'
      }, { status: 400 })
    }

    const durationDays = parseInt(String(plan.duration || 365))
    const amt = parseFloat(plan.amount)
    const tax = parseFloat(plan.tax_percent || 18)
    const total = parseFloat(plan.total_amount || amt * 1.18)
    const txn = transactionId || `TXN-REQ-${Math.floor(1000000000 + Math.random() * 9000000000)}`

    // 3. Insert into device_recharge_requests with verified = FALSE (so admin sees it to verify)
    const reqRes = await pool.query(`
      INSERT INTO device_recharge_requests
      (
        school_name, device_name, imei_no, device_type, image_url,
        plan_duration, amount, payment_reference, brand, description,
        sim_imei_no, sim_no, tax_percent, total_amount, start_date, end_date, verified, created_at
      )
      VALUES
      (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, CURRENT_DATE, (CURRENT_DATE + ($15 || ' days')::INTERVAL), FALSE, NOW()
      )
      RETURNING *
    `, [
      instituteName,
      resolvedDeviceName,
      resolvedDeviceSrNo,
      resolvedDeviceType,
      plan.image_url || '',
      `${durationDays} Days`,
      amt,
      txn,
      resolvedBrand,
      description || `Recharge request: ${plan.name} (${paymentMode})`,
      resolvedSimImei,
      resolvedSimNo,
      tax,
      total,
      durationDays
    ])

    return NextResponse.json({
      success: true,
      message: 'Recharge request sent to Admin successfully! Pending verification.',
      data: reqRes.rows[0]
    })
  } catch (error: any) {
    console.error('Device recharge request error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

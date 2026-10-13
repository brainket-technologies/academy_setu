import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { ensureDeviceDb } from '@/lib/device-db'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    await ensureDeviceDb()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const deviceType = searchParams.get('deviceType') || ''

    await pool.query(`ALTER TABLE institute_devices ADD COLUMN IF NOT EXISTS recharge_status VARCHAR(50) DEFAULT 'None'`)
    await pool.query(`ALTER TABLE institute_devices ADD COLUMN IF NOT EXISTS pending_plan_name VARCHAR(255) DEFAULT ''`)

    // 1. Fetch available plans / devices from main admin (device_plans)
    let plansQuery = `SELECT * FROM device_plans WHERE status = 'Active'`
    const plansParams: any[] = []

    if (deviceType && deviceType !== 'Select an Option' && deviceType !== 'All') {
      plansParams.push(deviceType)
      plansQuery += ` AND device_type = $${plansParams.length}`
    }

    if (search.trim()) {
      plansParams.push(`%${search.trim()}%`)
      plansQuery += ` AND (
        name ILIKE $${plansParams.length} OR 
        device_name ILIKE $${plansParams.length} OR 
        COALESCE(device_model, '') ILIKE $${plansParams.length} OR 
        device_type ILIKE $${plansParams.length} OR 
        COALESCE(description, '') ILIKE $${plansParams.length}
      )`
    }

    plansQuery += ` ORDER BY created_at DESC`
    const plansResult = await pool.query(plansQuery, plansParams)

    // 2. Fetch institute devices (institute_devices)
    let devicesQuery = `
      SELECT *, 
        GREATEST(0, (valid_to - CURRENT_DATE)::int) AS expiry_days,
        TO_CHAR(valid_from, 'DD/MM/YYYY') AS valid_from_formatted,
        TO_CHAR(valid_to, 'DD/MM/YYYY') AS valid_to_formatted
      FROM institute_devices 
      WHERE 1=1
    `
    const devParams: any[] = []

    if (deviceType && deviceType !== 'Select an Option' && deviceType !== 'All') {
      devParams.push(deviceType)
      devicesQuery += ` AND device_type = $${devParams.length}`
    }

    if (search.trim()) {
      devParams.push(`%${search.trim()}%`)
      devicesQuery += ` AND (
        device_name ILIKE $${devParams.length} OR 
        COALESCE(device_sr_no, '') ILIKE $${devParams.length} OR 
        COALESCE(sim_no, '') ILIKE $${devParams.length} OR 
        COALESCE(device_model, '') ILIKE $${devParams.length} OR 
        device_type ILIKE $${devParams.length}
      )`
    }

    devicesQuery += ` ORDER BY created_at DESC`
    const devicesResult = await pool.query(devicesQuery, devParams)

    // 3. Fetch device types from admin
    const typesResult = await pool.query(`SELECT DISTINCT name FROM device_types ORDER BY name ASC`)

    // 4. Fetch device setups
    const setupsResult = await pool.query(`SELECT * FROM device_setup ORDER BY name ASC`)

    return NextResponse.json({
      success: true,
      data: {
        plans: plansResult.rows,
        devices: devicesResult.rows.map(row => ({
          id: row.id,
          deviceName: row.device_name,
          deviceType: row.device_type,
          deviceModel: row.device_model || '',
          brand: row.brand || 'Academy Setu Tech',
          simNo: row.sim_no || '',
          simImei: row.sim_imei || '',
          deviceSrNo: row.device_sr_no || '',
          planName: row.plan_name || 'Standard Plan',
          durationDays: row.duration_days || 365,
          amount: parseFloat(row.amount || 0),
          taxPercent: parseFloat(row.tax_percent || 0),
          totalAmount: parseFloat(row.total_amount || 0),
          paymentMode: row.payment_mode || 'Online',
          transactionId: row.transaction_id || '',
          paymentStatus: row.payment_status || 'Paid',
          status: row.status || 'Active',
          rechargeStatus: row.recharge_status || 'None',
          pendingPlanName: row.pending_plan_name || '',
          imageUrl: row.image_url || '',
          validFrom: row.valid_from_formatted || new Date(row.valid_from).toLocaleDateString('en-GB'),
          validTo: row.valid_to_formatted || new Date(row.valid_to).toLocaleDateString('en-GB'),
          expiryDays: row.expiry_days !== undefined ? parseInt(row.expiry_days) : 365,
          createdAt: row.created_at
        })),
        deviceTypes: typesResult.rows.map(r => r.name),
        deviceSetups: setupsResult.rows
      }
    })
  } catch (error: any) {
    console.error('Fetch institute devices error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDeviceDb()

    const session = await getSession('institute_session')
    const instituteName = session?.name || 'Cosmopolitan Inter'
    const instituteId = session?.userId || ''

    const body = await request.json()
    const {
      deviceName,
      deviceType,
      deviceModel = '',
      brand = 'Academy Setu Tech',
      simNo,
      simImei = '',
      deviceSrNo,
      planName = 'Standard Plan',
      durationDays = 365,
      amount = 0,
      taxPercent = 18,
      totalAmount = 0,
      paymentMode = 'Online / UPI',
      transactionId = '',
      imageUrl = ''
    } = body

    if (!deviceName || !deviceType || !simNo || !deviceSrNo) {
      return NextResponse.json({
        success: false,
        error: 'Device Name, Device Type, SIM No., and Serial / IMEI No. are required.'
      }, { status: 400 })
    }

    const duration = parseInt(String(durationDays)) || 365
    const amt = parseFloat(String(amount || 0))
    const tax = parseFloat(String(taxPercent || 18))
    const total = totalAmount ? parseFloat(String(totalAmount)) : amt + (amt * (tax / 100))

    const validFrom = new Date()
    const validTo = new Date()
    validTo.setDate(validTo.getDate() + duration)

    // Insert into institute_devices
    const result = await pool.query(`
      INSERT INTO institute_devices 
      (
        institute_id, institute_name, device_name, device_type, device_model, brand,
        sim_no, sim_imei, device_sr_no, plan_name, duration_days, amount, tax_percent,
        total_amount, payment_mode, transaction_id, payment_status, status, image_url,
        valid_from, valid_to, created_at, updated_at
      )
      VALUES 
      (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, 'Paid', 'Active', $17,
        $18, $19, NOW(), NOW()
      )
      RETURNING *,
        GREATEST(0, (valid_to - CURRENT_DATE)::int) AS expiry_days,
        TO_CHAR(valid_from, 'DD/MM/YYYY') AS valid_from_formatted,
        TO_CHAR(valid_to, 'DD/MM/YYYY') AS valid_to_formatted
    `, [
      instituteId,
      instituteName,
      deviceName.trim(),
      deviceType.trim(),
      deviceModel.trim(),
      brand.trim(),
      simNo.trim(),
      simImei.trim() || `IMEI-${Date.now()}`,
      deviceSrNo.trim(),
      planName.trim(),
      duration,
      amt,
      tax,
      total,
      paymentMode,
      transactionId.trim() || `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      imageUrl,
      validFrom,
      validTo
    ])

    const created = result.rows[0]

    // Also record into device_recharge_requests for the main admin
    try {
      await pool.query(`
        INSERT INTO device_recharge_requests
        (
          school_name, device_name, imei_no, device_type, image_url,
          plan_duration, amount, payment_reference, brand, description,
          sim_imei_no, sim_no, tax_percent, total_amount, start_date, end_date, verified
        )
        VALUES
        (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, FALSE
        )
      `, [
        instituteName,
        deviceName.trim(),
        deviceSrNo.trim(),
        deviceType.trim(),
        imageUrl,
        `${duration} Days`,
        amt,
        created.transaction_id,
        brand.trim(),
        `Purchased ${planName}`,
        created.sim_imei,
        simNo.trim(),
        tax,
        total,
        validFrom,
        validTo
      ])
    } catch (rechargeErr) {
      console.warn('Could not record into device_recharge_requests:', rechargeErr)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        deviceName: created.device_name,
        deviceType: created.device_type,
        deviceModel: created.device_model,
        brand: created.brand,
        simNo: created.sim_no,
        simImei: created.sim_imei,
        deviceSrNo: created.device_sr_no,
        planName: created.plan_name,
        durationDays: created.duration_days,
        amount: parseFloat(created.amount),
        taxPercent: parseFloat(created.tax_percent),
        totalAmount: parseFloat(created.total_amount),
        paymentMode: created.payment_mode,
        transactionId: created.transaction_id,
        paymentStatus: created.payment_status,
        status: created.status,
        imageUrl: created.image_url,
        validFrom: created.valid_from_formatted || new Date(created.valid_from).toLocaleDateString('en-GB'),
        validTo: created.valid_to_formatted || new Date(created.valid_to).toLocaleDateString('en-GB'),
        expiryDays: created.expiry_days,
        createdAt: created.created_at
      }
    })
  } catch (error: any) {
    console.error('Create institute device error:', error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}

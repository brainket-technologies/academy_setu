import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()
  try {
    const { id } = await params

    await client.query('BEGIN')

    // 1. Fetch referral
    const referralRes = await client.query(
      'SELECT * FROM referrals WHERE id = $1',
      [id]
    )

    if (referralRes.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { success: false, error: 'Referral not found' },
        { status: 404 }
      )
    }

    const referral = referralRes.rows[0]

    if (referral.status !== 'Pending') {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { success: false, error: `Referral status is already ${referral.status}` },
        { status: 400 }
      )
    }

    // 2. Parse State and District from address (e.g. "Lucknow, UP")
    let state = ''
    let district = ''
    if (referral.address && referral.address.includes(',')) {
      const parts = referral.address.split(',')
      district = parts[0].trim()
      const stateAbbr = parts[1].trim().toUpperCase()
      if (stateAbbr === 'UP') state = 'Uttar Pradesh'
      else if (stateAbbr === 'MP') state = 'Madhya Pradesh'
      else if (stateAbbr === 'BR') state = 'Bihar'
      else if (stateAbbr === 'MH') state = 'Maharashtra'
      else if (stateAbbr === 'DL') state = 'Delhi'
      else if (stateAbbr === 'PB') state = 'Punjab'
      else if (stateAbbr === 'HR') state = 'Haryana'
      else state = parts[1].trim()
    } else {
      district = referral.address || ''
      state = referral.address || ''
    }

    // 3. Create lead in CRM leads table
    const leadRes = await client.query(
      `INSERT INTO leads (
        lead_source, mobile_no, email_id, contact_person, 
        school_name, state, district, no_of_students, status,
        assigned_to, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '', NOW(), NOW())
       RETURNING id`,
      [
        'Referral Code',
        referral.mobile_no,
        '', // email_id
        referral.name, // contact_person
        referral.referral_to, // school_name (referred)
        state,
        district,
        0, // no_of_students
        'Created'
      ]
    )

    const leadId = leadRes.rows[0].id

    // 4. Create initial history record
    await client.query(
      `INSERT INTO lead_history (lead_id, communication_option, call_duration, remarks, follow_up_date, status, created_at)
       VALUES ($1, 'Message', '', 'Lead created from referral', NULL, 'Created', NOW())`,
      [leadId]
    )

    // 5. Update referral status to 'Converted'
    await client.query(
      `UPDATE referrals SET status = 'Converted', updated_at = NOW() WHERE id = $1`,
      [id]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      message: 'Referral converted to lead successfully',
      leadId
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Convert referral error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

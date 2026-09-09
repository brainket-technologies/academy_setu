import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await pool.query(`
      SELECT 
        a.*, 
        i.name as school_name, i.code as school_code, i.contact_person, i.mobile_no,
        i.email_id, i.address, i.state, i.district, i.pincode,
        i.affiliated_to, i.affiliation_code,
        i.principal_name, i.principal_gender, i.principal_sign, i.principal_photo,
        i.director_name, i.director_gender, i.director_sign, i.director_photo,
        i.segment_id, i.assigned_to,
        u.name as assigned_user_name, u.role as assigned_user_role,
        p.plan_name
      FROM applications a
      LEFT JOIN institutions i ON a.institution_id = i.id
      LEFT JOIN admins u ON i.assigned_to = u.id
      LEFT JOIN plans p ON a.plan_id = p.id
      WHERE a.id = $1 LIMIT 1
    `, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error fetching application detail:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      school_name, school_code, affiliated_to, affiliation_code,
      contact_person, mobile_no, email_id, address, state, district, pincode,
      principal_name, principal_gender, principal_sign, principal_photo,
      director_name, director_gender, director_sign, director_photo,
      status, enquiry_status, plan_id, promo_code, assigned_to, payment_mode, amount 
    } = body

    // First, update the institution with address/personal details
    // Get institution_id for this application
    const appRes = await pool.query('SELECT institution_id FROM applications WHERE id = $1', [id])
    if (appRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 })
    }
    const institutionId = appRes.rows[0].institution_id

    if (institutionId) {
      const instUpdates: string[] = []
      const instValues: any[] = []

      const addInstField = (name: string, val: any) => {
        if (val !== undefined) {
          instUpdates.push(`${name} = $` + (instValues.length + 1))
          instValues.push(val)
        }
      }
      addInstField('name', school_name)
      addInstField('code', school_code)
      addInstField('affiliated_to', affiliated_to)
      addInstField('affiliation_code', affiliation_code)
      addInstField('contact_person', contact_person)
      addInstField('mobile_no', mobile_no)
      addInstField('email_id', email_id)
      addInstField('address', address)
      addInstField('state', state)
      addInstField('district', district)
      addInstField('pincode', pincode)
      addInstField('principal_name', principal_name)
      addInstField('principal_gender', principal_gender)
      addInstField('principal_sign', principal_sign)
      addInstField('principal_photo', principal_photo)
      addInstField('director_name', director_name)
      addInstField('director_gender', director_gender)
      addInstField('director_sign', director_sign)
      addInstField('director_photo', director_photo)
      
      let finalAssignedTo = assigned_to
      if (assigned_to === '') {
        finalAssignedTo = null
      } else if (assigned_to) {
        // check if it's already a uuid or we need to lookup by name
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assigned_to)) {
          const adminRes = await pool.query('SELECT id FROM admins WHERE name = $1 LIMIT 1', [assigned_to])
          if (adminRes.rows.length > 0) {
            finalAssignedTo = adminRes.rows[0].id
          }
        }
      }
      addInstField('assigned_to', finalAssignedTo)

      if (enquiry_status === 'Successfully Onboarded') {
        addInstField('status', 'Active')
      }

      if (instUpdates.length > 0) {
        instValues.push(institutionId)
        await pool.query(
          `UPDATE institutions SET ${instUpdates.join(', ')}, updated_at = NOW() WHERE id = $${instValues.length}`,
          instValues
        )
      }
    }

    // Now update the application itself (only its own fields)
    const appUpdates: string[] = []
    const appValues: any[] = []

    const addAppField = (name: string, val: any) => {
      if (val !== undefined) {
        appUpdates.push(`${name} = $` + (appValues.length + 1))
        appValues.push(val)
      }
    }

    let cleanPlanId = null
    if (plan_id && String(plan_id).trim() !== '') {
      const planRes = await pool.query(
        'SELECT id FROM plans WHERE id::text = $1 OR plan_name = $1 LIMIT 1',
        [plan_id]
      )
      if (planRes.rows.length > 0) {
        cleanPlanId = planRes.rows[0].id
      }
    }

    addAppField('status', status)
    addAppField('enquiry_status', enquiry_status)
    addAppField('plan_id', cleanPlanId)
    addAppField('promo_code', promo_code !== undefined ? promo_code : null)
    addAppField('payment_mode', payment_mode !== undefined ? payment_mode : null)
    addAppField('amount', amount ? parseFloat(amount) : null)

    appUpdates.push('updated_at = NOW()')
    appValues.push(id)

    const result = await pool.query(
      `UPDATE applications SET ${appUpdates.join(', ')} WHERE id = $${appValues.length} RETURNING *`,
      appValues
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 })
    }

    // Move institution to Active & Create Request record for verification in Request tab
    if (institutionId) {
      if (enquiry_status === 'Successfully Onboarded' || status === 'Completed') {
        await pool.query("UPDATE institutions SET status = 'Active', updated_at = NOW() WHERE id = $1", [institutionId])
      }

      const { transaction_id, screenshots, screenshot_filename, screenshot_data_url } = body
      const screenshotsArr = Array.isArray(screenshots) && screenshots.length > 0
        ? screenshots
        : (screenshot_filename ? [{ filename: screenshot_filename, dataUrl: screenshot_data_url || '', amount: amount || 0 }] : [])

      const finalAmount = amount ? parseFloat(amount) : 0

      if (enquiry_status === 'Successfully Onboarded' || status === 'Completed' || screenshotsArr.length > 0 || transaction_id) {
        const existingReq = await pool.query('SELECT id FROM requests WHERE institution_id = $1 LIMIT 1', [institutionId])
        if (existingReq.rows.length > 0) {
          await pool.query(
            `UPDATE requests 
             SET plan_id = COALESCE($1, plan_id),
                 payment_mode = COALESCE($2, payment_mode),
                 transaction_id = CASE WHEN $3 != '' THEN $3 ELSE transaction_id END,
                 amount = CASE WHEN $4::numeric > 0 THEN $4::numeric ELSE amount END,
                 screenshots = CASE WHEN $5::jsonb != '[]'::jsonb THEN $5::jsonb ELSE screenshots END,
                 updated_at = NOW()
             WHERE id = $6`,
            [cleanPlanId, payment_mode || 'Payment Gateway', transaction_id || '', finalAmount, JSON.stringify(screenshotsArr), existingReq.rows[0].id]
          )
        } else {
          await pool.query(
            `INSERT INTO requests (institution_id, plan_id, payment_mode, transaction_id, amount, status, screenshots)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [institutionId, cleanPlanId, payment_mode || 'Payment Gateway', transaction_id || '', finalAmount, 'Pending', JSON.stringify(screenshotsArr)]
          )
        }
      }
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await pool.query('DELETE FROM applications WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Application not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Application deleted successfully.' })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

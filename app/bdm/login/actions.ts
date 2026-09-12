'use server'

import { redirect } from 'next/navigation'
import pool from '@/lib/db'
import { createSession, deleteSession, getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

type LoginState = {
  success?: boolean
  error?: string
}

export async function bdmLoginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, permissions FROM admins WHERE email = $1 AND is_active = true AND role = $2 LIMIT 1',
      [email.toLowerCase().trim(), 'BDM']
    )

    const bdm = result.rows[0]
    if (!bdm) {
      return { error: 'Invalid email or password.' }
    }

    const passwordMatch = await bcrypt.compare(password, bdm.password_hash)
    if (!passwordMatch) {
      return { error: 'Invalid email or password.' }
    }

    // Update last login
    await pool.query('UPDATE admins SET last_login_at = NOW() WHERE id = $1', [bdm.id])

    await createSession({
      userId: bdm.id,
      role: bdm.role,
      name: bdm.name,
      email: bdm.email,
      permissions: bdm.permissions || [],
    }, 'bdm_session')
  } catch (err) {
    console.error('BDM Login error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}

export async function bdmLogoutAction() {
  await deleteSession('bdm_session')
  redirect('/bdm/login')
}

export async function getBdmSessionAction() {
  const session = await getSession('bdm_session')
  return session
}

export async function getBdmProfileAction() {
  const session = await getSession('bdm_session')
  let userId = session?.userId
  if (!userId) {
    const bdmUser = await pool.query("SELECT id FROM admins WHERE role = 'BDM' LIMIT 1")
    if (bdmUser.rows.length > 0) userId = bdmUser.rows[0].id
  }
  if (!userId) return null
  
  const result = await pool.query(
    `SELECT id, name, email, role, phone, id_no, avatar_url, gender, 
            address, state, district, pincode, aadhar_no, joining_date, permissions,
            login_time_type, login_time, logout_time, login_expire_date
     FROM admins WHERE id = $1 LIMIT 1`,
    [userId]
  )
  return result.rows[0] || null
}

export async function updateBdmProfileAction(data: any) {
  const session = await getSession('bdm_session')
  let userId = session?.userId
  if (!userId) {
    const bdmUser = await pool.query("SELECT id, name, email, role, permissions FROM admins WHERE role = 'BDM' LIMIT 1")
    if (bdmUser.rows.length > 0) userId = bdmUser.rows[0].id
  }
  if (!userId) return { error: 'Unauthorized' }

  let query = `
    UPDATE admins 
    SET name = $1, 
        phone = $2, 
        gender = $3, 
        avatar_url = $4,
        address = $5,
        state = $6,
        district = $7,
        pincode = $8,
        aadhar_no = $9,
        updated_at = NOW()
  `
  const params: any[] = [
    data.name, 
    data.phone, 
    data.gender, 
    data.avatar_url || '',
    data.address || '',
    data.state || '',
    data.district || '',
    data.pincode || '',
    data.aadhar_no || ''
  ]
  
  if (data.password) {
    const hash = await bcrypt.hash(data.password, 10)
    query += `, password_hash = $${params.length + 1} WHERE id = $${params.length + 2}`
    params.push(hash, userId)
  } else {
    query += ` WHERE id = $${params.length + 1}`
    params.push(userId)
  }

  try {
    await pool.query(query, params)

    // Refresh session with updated name if session exists
    if (session) {
      await createSession({
        userId: session.userId,
        role: session.role || 'BDM',
        name: data.name || session.name,
        email: session.email,
        permissions: session.permissions || [],
      }, 'bdm_session')
    }
    
    // Invalidate cache if possible
    try {
      const { apiCache } = await import('@/lib/api-cache')
      apiCache.invalidate('admin_list')
    } catch (e) {}

    return { success: true }
  } catch (err) {
    console.error('Update BDM Profile error:', err)
    return { error: 'Something went wrong updating profile.' }
  }
}

'use server'

import { redirect } from 'next/navigation'
import pool from '@/lib/db'
import { createSession, deleteSession, getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

type LoginState = {
  success?: boolean
  error?: string
}

export async function managerLoginAction(
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
      [email.toLowerCase().trim(), 'Manager']
    )

    const manager = result.rows[0]
    if (!manager) {
      return { error: 'Invalid email or password.' }
    }

    const passwordMatch = await bcrypt.compare(password, manager.password_hash)
    if (!passwordMatch) {
      return { error: 'Invalid email or password.' }
    }

    // Update last login
    await pool.query('UPDATE admins SET last_login_at = NOW() WHERE id = $1', [manager.id])

    await createSession({
      userId: manager.id,
      role: manager.role,
      name: manager.name,
      email: manager.email,
      permissions: manager.permissions || [],
    }, 'manager_session')
  } catch (err) {
    console.error('Manager Login error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}

export async function managerLogoutAction() {
  await deleteSession('manager_session')
  redirect('/manager/login')
}

export async function getManagerSessionAction() {
  const session = await getSession('manager_session')
  return session
}

export async function getManagerProfileAction() {
  const session = await getSession('manager_session')
  if (!session) return null
  
  const result = await pool.query(
    'SELECT id, name, email, role, phone, id_no, avatar_url, gender FROM admins WHERE id = $1 LIMIT 1',
    [session.userId]
  )
  return result.rows[0] || null
}

export async function updateManagerProfileAction(data: any) {
  const session = await getSession('manager_session')
  if (!session) return { error: 'Unauthorized' }

  let query = 'UPDATE admins SET name = $1, phone = $2, gender = $3, avatar_url = $4'
  const params: any[] = [data.name, data.phone, data.gender, data.avatar_url]
  
  if (data.password) {
    const hash = await bcrypt.hash(data.password, 10)
    query += ', password_hash = $5 WHERE id = $6'
    params.push(hash, session.userId)
  } else {
    query += ' WHERE id = $5'
    params.push(session.userId)
  }

  try {
    await pool.query(query, params)
    
    // Attempt to invalidate cache if possible, so Admin table shows it instantly
    try {
      const { apiCache } = await import('@/lib/api-cache')
      apiCache.invalidate('users')
    } catch (e) {
      console.error('Failed to invalidate cache', e)
    }

    return { success: true }
  } catch (err) {
    console.error('Error updating manager profile', err)
    return { error: 'Database update failed' }
  }
}

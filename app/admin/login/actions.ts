'use server'

import { redirect } from 'next/navigation'
import pool from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

type LoginState = {
  success?: boolean
  error?: string
}

export async function loginAction(
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
      'SELECT id, name, email, password_hash, role FROM admins WHERE email = $1 AND is_active = true LIMIT 1',
      [email.toLowerCase().trim()]
    )

    const admin = result.rows[0]
    if (!admin) {
      return { error: 'Invalid email or password.' }
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash)
    if (!passwordMatch) {
      return { error: 'Invalid email or password.' }
    }

    // Update last login
    await pool.query('UPDATE admins SET last_login_at = NOW() WHERE id = $1', [admin.id])

    await createSession({
      userId: admin.id,
      role: admin.role,
      name: admin.name,
      email: admin.email,
    })
  } catch (err) {
    console.error('Login error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}

export async function logoutAction() {
  await deleteSession()
  redirect('/admin/login')
}

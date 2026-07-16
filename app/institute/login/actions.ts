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
      'SELECT id, name, email_id, password_hash, status FROM institutions WHERE email_id = $1 AND status = \'Active\' LIMIT 1',
      [email.toLowerCase().trim()]
    )

    const institute = result.rows[0]
    if (!institute) {
      return { error: 'Invalid email or password.' }
    }

    if (!institute.password_hash) {
      return { error: 'Account not fully set up. Please contact admin.' }
    }

    const passwordMatch = await bcrypt.compare(password, institute.password_hash)
    if (!passwordMatch) {
      return { error: 'Invalid email or password.' }
    }

    // Creating session with role 'institution'
    await createSession({
      userId: institute.id,
      role: 'institution',
      name: institute.name,
      email: institute.email_id,
    })
  } catch (err) {
    console.error('Institute Login error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}

export async function logoutAction() {
  await deleteSession()
  redirect('/institute/login')
}

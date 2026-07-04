'use server'

import { redirect } from 'next/navigation'
import pool from '@/lib/db'
import { createSession, deleteSession, getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

type LoginState = {
  success?: boolean
  error?: string
}

export async function distributorLoginAction(
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
      'SELECT id, dist_id, name, email, password_hash, status FROM distributors WHERE (email = $1 OR username = $1) AND status = $2 LIMIT 1',
      [email.toLowerCase().trim(), 'Active']
    )

    const distributor = result.rows[0]
    if (!distributor) {
      return { error: 'Invalid email or password.' }
    }

    const passwordMatch = await bcrypt.compare(password, distributor.password_hash)
    if (!passwordMatch) {
      return { error: 'Invalid email or password.' }
    }

    // We can just set role to 'Distributor' hardcoded since they are in the distributors table
    await createSession({
      userId: distributor.id,
      role: 'Distributor',
      name: distributor.name,
      email: distributor.email,
      permissions: [],
    }, 'distributor_session')
  } catch (err) {
    console.error('Distributor Login error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}

export async function distributorLogoutAction() {
  await deleteSession('distributor_session')
  redirect('/distributor/login')
}

export async function getDistributorSessionAction() {
  const session = await getSession('distributor_session')
  return session
}

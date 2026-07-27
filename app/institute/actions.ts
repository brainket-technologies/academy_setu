'use server'

import { getSession } from '@/lib/session'

export async function fetchInstituteName() {
  const session = await getSession('institute_session')
  return session?.name || 'Name'
}

export async function fetchStatesDistricts() {
  const session = await getSession('institute_session')
  if (!session?.userId) return { success: false, error: 'Unauthorized' }
  
  try {
    const { default: pool } = await import('@/lib/db')
    const res = await pool.query('SELECT state_name, districts FROM states_districts ORDER BY state_name ASC')
    const formattedData = res.rows.map(row => ({
      state: row.state_name,
      districts: row.districts || []
    }))
    return { success: true, data: formattedData }
  } catch(err: any) {
    return { success: false, error: err.message }
  }
}

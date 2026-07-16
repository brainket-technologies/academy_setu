'use server'

import { getSession } from '@/lib/session'

export async function fetchInstituteName() {
  const session = await getSession('admin_session')
  return session?.name || 'Name'
}

'use server'

import { getSession } from '@/lib/session'

export async function fetchInstituteName() {
  const session = await getSession('institute_session')
  return session?.name || 'Name'
}

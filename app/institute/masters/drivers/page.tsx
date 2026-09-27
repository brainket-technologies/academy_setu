'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function MastersDriversRedirect() {
  useEffect(() => {
    redirect('/institute/transport/driver')
  }, [])

  return null
}

'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function MastersVehiclesRedirect() {
  useEffect(() => {
    redirect('/institute/transport/vehicle')
  }, [])

  return null
}

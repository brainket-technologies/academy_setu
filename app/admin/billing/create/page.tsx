'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateBillRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/billing?create=true')
  }, [router])

  return null
}

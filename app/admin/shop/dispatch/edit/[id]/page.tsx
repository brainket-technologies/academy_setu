'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EditDispatchRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/shop/dispatch')
  }, [router])
  return null
}

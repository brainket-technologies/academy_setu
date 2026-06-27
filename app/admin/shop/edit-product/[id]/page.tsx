'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EditProductRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/shop')
  }, [router])
  return null
}

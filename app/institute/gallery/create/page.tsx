'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateEventRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main gallery page with create popup triggered
    router.replace('/institute/gallery?create=true')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-xs font-semibold text-slate-400">
      Loading Event Creator...
    </div>
  )
}

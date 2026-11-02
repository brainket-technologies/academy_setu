'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotesRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/institute/study-material')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Redirecting to Study Material...</span>
      </div>
    </div>
  )
}

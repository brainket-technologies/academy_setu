'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function CreateNoticePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main notice page and open the create modal
    router.replace('/institute/notice?openCreate=true')
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      <p className="text-sm font-semibold">Opening Notice Composer...</p>
    </div>
  )
}

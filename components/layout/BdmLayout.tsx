'use client'

import { useState, Suspense } from 'react'
import { BdmSidebar } from './BdmSidebar'
import { BdmHeader } from './BdmHeader'

export function BdmLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-[#f5f3ff] dark:bg-slate-900 font-sans antialiased">
      <Suspense fallback={<div className="hidden lg:block w-64 h-screen shrink-0" />}>
        <BdmSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0">
        <BdmHeader onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 p-4 md:p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

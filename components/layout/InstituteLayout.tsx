'use client'

import { useState } from 'react'
import { InstituteSidebar } from './InstituteSidebar'
import { InstituteHeader } from './InstituteHeader'

export function InstituteLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ background: 'transparent' }}>
      <InstituteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] dark:bg-slate-900">
        <InstituteHeader onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 p-4 md:p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

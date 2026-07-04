'use client'

import { useState, Suspense } from 'react'
import { BdmSidebar } from './BdmSidebar'
import { BdmHeader } from './BdmHeader'

export function BdmLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] dark:bg-slate-900 transition-colors duration-300">
      <Suspense fallback={<div className="hidden lg:block w-64 h-screen shrink-0 border-r border-slate-200 bg-white" />}>
        <BdmSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
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

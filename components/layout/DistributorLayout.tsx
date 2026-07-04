'use client'

import { useState } from 'react'
import { DistributorSidebar } from './DistributorSidebar'
import { DistributorHeader } from './DistributorHeader'
import { Suspense } from 'react'

export function DistributorLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] dark:bg-slate-900 transition-colors duration-300">
      <DistributorSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <DistributorHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

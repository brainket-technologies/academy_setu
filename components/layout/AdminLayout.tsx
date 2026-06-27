import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { Suspense } from 'react'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 flex">
      <Suspense fallback={<div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 h-screen fixed left-0 top-0" />}>
        <AdminSidebar />
      </Suspense>
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

'use client'

import { usePathname } from 'next/navigation'
import { InstituteLayout } from '@/components/layout/InstituteLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Do not show the dashboard sidebar on the login page
  if (pathname === '/institute/login') return <>{children}</>
  return <InstituteLayout>{children}</InstituteLayout>
}

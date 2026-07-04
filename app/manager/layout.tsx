'use client'

import { usePathname } from 'next/navigation'
import { ManagerLayout } from '@/components/layout/ManagerLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/manager/login') return <>{children}</>
  return <ManagerLayout>{children}</ManagerLayout>
}

'use client'

import { usePathname } from 'next/navigation'
import { DistributorLayout } from '@/components/layout/DistributorLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/distributor/login') return <>{children}</>
  return <DistributorLayout>{children}</DistributorLayout>
}

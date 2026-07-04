'use client'

import { usePathname } from 'next/navigation'
import { BdmLayout } from '@/components/layout/BdmLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/bdm/login') return <>{children}</>
  return <BdmLayout>{children}</BdmLayout>
}

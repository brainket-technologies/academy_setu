'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, Edit, LogOut, ChevronDown, X, History
} from 'lucide-react'

import { distributorLogoutAction } from '@/app/distributor/login/actions'

interface SubItem {
  label: string
  href: string
}

interface MenuItem {
  icon: React.ElementType
  label: string
  href: string
  subItems?: SubItem[]
}

export function DistributorSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/distributor/dashboard' },
    { icon: History, label: 'Transaction', href: '/distributor/transactions' },
    { icon: Edit, label: 'Edit Profile', href: '/distributor/profile' },
  ]

  // Track which expandable menu is open by label
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    menuItems.forEach(item => {
      if (item.subItems?.some(sub => pathname.startsWith(sub.href) && sub.href !== '#')) {
        initial[item.label] = true
      }
    })
    return initial
  })

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isParentActive = (item: MenuItem) => {
    if (item.subItems && item.subItems.length > 0) {
      return item.subItems.some(sub => {
        if (sub.href === '#') return false
        const pathOnly = sub.href.split('?')[0]
        return pathname.startsWith(pathOnly)
      })
    }
    return item.href !== '#' && pathname.startsWith(item.href)
  }

  return (
    <>
      {/* Mobile sidebar overlay backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300 w-64 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 bg-white border-r border-slate-200 shadow-[4px_0_24px_rgba(15,158,143,0.06)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-5 shrink-0 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}
            >
              <div className="w-4 h-4 border-2 border-white/90 rotate-45 rounded-sm" />
            </div>
            <div>
              <h1 className="text-[13px] font-extrabold tracking-widest leading-none"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ACADEMY SETU
              </h1>
              <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-widest mt-0.5 uppercase">Distributor Portal</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item, i) => {
            const Icon = item.icon
            const hasSubItems = item.subItems && item.subItems.length > 0
            const parentActive = isParentActive(item)
            const isMenuOpen = openMenus[item.label] ?? false

            if (hasSubItems) {
              return (
                <div key={i}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      parentActive
                        ? 'text-white shadow-lg shadow-indigo-500/25'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                    style={parentActive ? {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4.5 h-4.5 ${parentActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="text-[13px]">{item.label}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''} ${parentActive ? 'text-white/80' : 'text-slate-400'}`} />
                  </button>

                  {isMenuOpen && (
                     <div className="mt-1 ml-3 pl-4 border-l-2 border-indigo-200/60 flex flex-col gap-0.5 py-1">
                      {item.subItems!.map((sub, j) => {
                        const isSubActive = (subHref: string) => {
                          if (subHref.includes('?')) {
                            const [path, search] = subHref.split('?')
                            if (pathname !== path) return false
                            const subParams = new URLSearchParams(search)
                            return Array.from(subParams.entries()).every(([key, val]) => searchParams.get(key) === val)
                          }
                          if (pathname === subHref) return true
                          return false
                        }
                        const exactActive = isSubActive(sub.href)
                        return (
                          <Link
                            key={j}
                            href={sub.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                              exactActive
                                ? 'text-indigo-600 bg-indigo-50/80'
                                : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${exactActive ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                            {sub.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={i}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  parentActive
                    ? 'text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                }`}
                style={parentActive ? {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                } : {}}
              >
                <Icon className={`w-4.5 h-4.5 ${parentActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="text-[13px]">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          <form action={distributorLogoutAction}>
            <button 
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5 text-slate-400 group-hover:text-red-500" />
              <span className="text-[13px]">Logout</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}

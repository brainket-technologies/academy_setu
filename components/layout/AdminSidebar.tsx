'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, Users, FileText, Calendar, Tag, CreditCard, 
  MessageSquare, MessagesSquare, HelpCircle, UserCheck, Share2, 
  Truck, DollarSign, UserCog, Settings, Edit, LogOut, ChevronDown
} from 'lucide-react'

import { logoutAction } from '@/app/admin/login/actions'

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

export function AdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Segment', href: '/admin/segment' },
    { 
      icon: FileText, label: 'Application', href: '/admin/application',
      subItems: [
        { label: 'All Application', href: '/admin/application' },
        { label: 'Create Application', href: '/admin/application/create' },
      ]
    },
    { 
      icon: Calendar, label: 'Plan', href: '/admin/plan',
      subItems: [
        { label: 'All Plan', href: '/admin/plan' },
        { label: 'Create Plan', href: '/admin/plan/create' },
      ]
    },
    { icon: Tag, label: 'Promo Code', href: '/admin/promo-code' },
    { icon: CreditCard, label: 'Billing', href: '/admin/billing' },
    { icon: MessageSquare, label: 'Request', href: '/admin/request' },
    { icon: MessagesSquare, label: 'All Conversation', href: '/admin/conversation' },
    { 
      icon: HelpCircle, label: 'Help & Support', href: '#',
      subItems: [
        { label: 'All Ticket', href: '/admin/ticket' },
        { label: 'Ticket Category', href: '/admin/ticket-category' }
      ]
    },
    { 
      icon: UserCheck, label: 'CRM', href: '#',
      subItems: [
        { label: 'All Leads', href: '/admin/crm/leads' },
        { label: 'Create Lead', href: '/admin/crm/leads/create' },
        { label: 'Lead Status', href: '/admin/crm/status' }
      ]
    },
    { icon: Share2, label: 'Referral Code', href: '/admin/referral-code' },
    { icon: HelpCircle, label: 'Queries', href: '/admin/queries' },
    {
      icon: Truck, label: 'Distributers', href: '#',
      subItems: [
        { label: 'All Distributers', href: '/admin/distributors' },
        { label: 'Create Distributers', href: '/admin/distributors/create' },
        { label: 'Distributer Payment', href: '/admin/distributors/payment' }
      ]
    },
    { 
      icon: DollarSign, label: 'Income & Expense', href: '#',
      subItems: [
        { label: 'All Income', href: '/admin/income' },
        { label: 'All Expenses', href: '/admin/expense' },
        { label: 'Create Category', href: '/admin/income/category' },
        { label: 'Create Parties', href: '/admin/income/parties' }
      ]
    },
    { icon: UserCog, label: 'User Role', href: '/admin/user-role' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
    { icon: Edit, label: 'Edit Profile', href: '/admin/edit-profile' },
  ]

  // Track which expandable menu is open by label
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    // Auto-open the menu whose sub-item matches the current path
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
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-teal-600 flex items-center justify-center shrink-0">
            <div className="w-4 h-4 border-2 border-white rotate-45" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-teal-900 dark:text-teal-100 tracking-tight leading-none">ACADEMY SETU</h1>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-medium tracking-wider mt-0.5">Connecting Schools to Smart Future</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 space-y-0.5">
        {menuItems.map((item, i) => {
          const Icon = item.icon
          const hasSubItems = item.subItems && item.subItems.length > 0
          const hasDropdown = item.subItems !== undefined // has chevron
          const parentActive = isParentActive(item)
          const isOpen = openMenus[item.label] ?? false

          if (hasSubItems) {
            return (
              <div key={i}>
                {/* Parent button */}
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    parentActive
                      ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${parentActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    {item.label}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${parentActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`} />
                </button>

                {/* Sub items */}
                {isOpen && (
                  <div className="mt-0.5 ml-4 pl-5 border-l-2 border-teal-100 dark:border-teal-800 flex flex-col gap-0.5 py-1">
                    {item.subItems!.map((sub, j) => {
                      const isSubActive = (subHref: string) => {
                        if (subHref.includes('?')) {
                          const [path, search] = subHref.split('?')
                          if (pathname !== path) return false
                          const subParams = new URLSearchParams(search)
                          return Array.from(subParams.entries()).every(([key, val]) => searchParams.get(key) === val)
                        }
                        if (pathname === subHref) {
                          if (pathname === '/admin/user-role') {
                            return !searchParams.has('role')
                          }
                          return true
                        }
                        return false
                      }
                      const exactActive = isSubActive(sub.href)
                      return (
                        <Link
                          key={j}
                          href={sub.href}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            exactActive
                              ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/50'
                              : 'text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${exactActive ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                          {sub.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          // Plain link (no sub-items, but may have a decorative dropdown chevron)
          const isActive = item.href !== '#' && pathname.startsWith(item.href)
          return (
            <Link
              key={i}
              href={item.href}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.label}
              </div>
              {hasDropdown && item.subItems?.length === 0 && (
                <ChevronDown className={`w-4 h-4 ${isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700 shrink-0">
        <form action={logoutAction}>
          <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
            <LogOut className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  )
}

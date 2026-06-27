'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, Users, FileText, Calendar, Tag, CreditCard, 
  MessageSquare, MessagesSquare, HelpCircle, UserCheck, Share2, 
  Truck, DollarSign, UserCog, ShoppingCart, Settings, Edit, LogOut, ChevronDown, Cpu, X
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

export function AdminSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
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
    { 
      icon: ShoppingCart, label: 'Shop', href: '#',
      subItems: [
        { label: 'All Product', href: '/admin/shop' },
        { label: 'Product Enquiry', href: '/admin/shop/product-enquiry' },
        { label: 'Dispatch', href: '/admin/shop/dispatch' }
      ]
    },
    { 
      icon: MessageSquare, label: 'SMS', href: '#',
      subItems: [
        { label: 'SMS Order', href: '/admin/sms' },
        { label: 'Template Request', href: '/admin/sms/templates' }
      ]
    },
    { 
      icon: Cpu, label: 'Device', href: '#',
      subItems: [
        { label: 'Recharge Request', href: '/admin/device/recharge' },
        { label: 'Expiry Recharge', href: '/admin/device/expiry' },
        { label: 'Plan Setup', href: '/admin/device/plans' }
      ]
    },
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
    <>
      {/* Mobile sidebar overlay backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300 w-64 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '4px 0 24px rgba(79,70,229,0.06)',
        }}
      >
        {/* Logo */}
        <div className="p-5 shrink-0 flex items-center justify-between border-b border-white/20 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)' }}
            >
              <div className="w-4 h-4 border-2 border-white/90 rotate-45 rounded-sm" />
            </div>
            <div>
              <h1 className="text-[13px] font-extrabold tracking-widest leading-none"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ACADEMY SETU
              </h1>
              <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-widest mt-0.5 uppercase">CRM Portal</p>
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
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                    style={parentActive ? {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4.5 h-4.5 ${parentActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className="text-[13px]">{item.label}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''} ${parentActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`} />
                  </button>

                  {isMenuOpen && (
                    <div className="mt-1 ml-3 pl-4 border-l-2 border-indigo-200/60 dark:border-indigo-800/40 flex flex-col gap-0.5 py-1">
                      {item.subItems!.map((sub, j) => {
                        const isSubActive = (subHref: string) => {
                          if (subHref.includes('?')) {
                            const [path, search] = subHref.split('?')
                            if (pathname !== path) return false
                            const subParams = new URLSearchParams(search)
                            return Array.from(subParams.entries()).every(([key, val]) => searchParams.get(key) === val)
                          }
                          if (pathname === subHref) {
                            if (pathname === '/admin/user-role') return !searchParams.has('role')
                            return true
                          }
                          return false
                        }
                        const exactActive = isSubActive(sub.href)
                        return (
                          <Link
                            key={j}
                            href={sub.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                              exactActive
                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40'
                                : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/40 dark:hover:bg-white/5'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${exactActive ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            {sub.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            const isActive = item.href !== '#' && pathname.startsWith(item.href)
            return (
              <Link
                key={i}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                } : {}}
              >
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/20 dark:border-white/5 shrink-0">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50/80 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 cursor-pointer group"
            >
              <LogOut className="w-4.5 h-4.5 flex-shrink-0 text-slate-400 group-hover:text-red-500 transition-colors" />
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}

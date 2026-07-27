'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, UserPlus, Users, UserCheck, UserCog, 
  IndianRupee, Wallet, CreditCard, Award, FileText, FileCheck, 
  FileMinus, Cpu, ShoppingCart, Bus, ClipboardCheck, CalendarOff, 
  Banknote, TrendingDown, TrendingUp, Settings2, BookOpen, Book, 
  Clock, Smartphone, Bell, MessageSquare, Megaphone, Mail, 
  Calendar, Ticket, Files, MonitorPlay, Image, LifeBuoy, Home, 
  Tag, FileSignature, Database, Settings, ShieldCheck, LogOut, 
  ChevronDown, X
} from 'lucide-react'

// You might need an institute logout action later, using generic for now
const logoutAction = async () => {
  // Mock action
}

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

export function InstituteSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const [allowedMenus, setAllowedMenus] = useState<string[] | null>(null)

  useEffect(() => {
    fetch('/api/institute/my-menus')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.menus) {
          setAllowedMenus(data.menus)
        } else {
          setAllowedMenus([])
        }
      })
      .catch(err => {
        console.error('Failed to load menus', err)
        setAllowedMenus([])
      })
  }, [])

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/institute/dashboard' },
    { 
      icon: UserPlus, label: 'Leads / Enquiry', href: '#',
      subItems: [
        { label: 'All Leads', href: '/institute/leads' },
        { label: 'Leads Sources', href: '/institute/leads-sources' },
        { label: 'Leads Status', href: '/institute/leads-status' },
      ]
    },
    { 
      icon: Users, label: 'Students', href: '#',
      subItems: [
        { label: 'All Students', href: '/institute/students' },
        { label: 'Bulk Edit', href: '/institute/students/bulk-edit' },
        { label: 'Deleted Students', href: '/institute/students/deleted-students' },
        { label: 'Passed Students', href: '/institute/students/passed-students' },
        { label: 'Dropped Students', href: '/institute/students/dropped' },
        { label: 'Suspended', href: '/institute/students/suspended' },
        { label: 'Migration/Promotion', href: '/institute/students/migration' },
      ]
    },
    { 
      icon: UserCheck, label: 'Teachers', href: '#',
      subItems: [
        { label: 'All Teachers', href: '/institute/teachers' },
        { label: 'Deleted Teachers', href: '/institute/teachers/deleted' },
      ]
    },
    { 
      icon: UserCog, label: 'Employee', href: '#',
      subItems: [
        { label: 'All Employee', href: '/institute/employees' },
        { label: 'Employee Role', href: '/institute/employees/roles' },
        { label: 'Deleted Employee', href: '/institute/employees/deleted' },
      ]
    },
    { 
      icon: Users, label: 'Parents / Siblings', href: '#',
      subItems: [
        { label: 'All Parents', href: '/institute/parents' },
        { label: 'Deleted Parents', href: '/institute/parents/deleted' },
      ]
    },
    { 
      icon: IndianRupee, label: 'Fees Setup', href: '#',
      subItems: [
        { label: 'All Fee', href: '/institute/fees-setup/all-fee' },
        { label: 'Registration Fee', href: '/institute/fees-setup/registration-fee' },
        { label: 'Admission Fee', href: '/institute/fees-setup/admission-fee' },
        { label: 'Class Fee', href: '/institute/fees-setup/class-fee' },
        { label: 'Library Fee', href: '/institute/fees-setup/library-fee' },
        { label: 'Exam Fee', href: '/institute/fees-setup/exam-fee' },
        { label: 'Hostel Fee', href: '/institute/fees-setup/hostel-fee' },
        { label: 'Extra Curricular Fee', href: '/institute/fees-setup/extra-curricular-fee' },
        { label: 'Transportation Fee', href: '/institute/fees-setup/transportation-fee' },
        { label: 'Fee Receipt Design', href: '/institute/fees-setup/fee-receipt-design' },
      ]
    },
    { icon: Wallet, label: 'Fees Collection', href: '/institute/fees-collection' },
    { 
      icon: CreditCard, label: 'ID Card', href: '#',
      subItems: [
        { label: 'ID Card Setup', href: '/institute/id-card/setup' },
        { label: 'ID Card Download', href: '/institute/id-card/download' },
      ]
    },
    { 
      icon: Award, label: 'Certificate', href: '#',
      subItems: [
        { label: 'All Certificate', href: '/institute/certificate' },
        { label: 'Certificate Type', href: '/institute/certificate/type' },
      ]
    },
    { 
      icon: FileText, label: 'Exam & Marksheets', href: '#',
      subItems: [
        { label: 'Exam & Marksheet Setup', href: '/institute/exam-marksheet/setup' },
        { label: 'All Marksheet Report', href: '/institute/exam-marksheet/report' },
        { label: 'Bulk Mark Update', href: '/institute/exam-marksheet/bulk-update' },
      ]
    },
    { 
      icon: FileCheck, label: 'Admit Cards', href: '#',
      subItems: [
        { label: 'Admit Card', href: '/institute/admit-card' },
        { label: 'Exam Time Table', href: '/institute/admit-card/time-table' },
      ]
    },
    { 
      icon: FileMinus, label: 'Transfer Certificate', href: '#',
      subItems: [
        { label: 'Transfer Certificates', href: '/institute/tc' },
        { label: 'TC Settings', href: '/institute/tc/settings' },
      ]
    },
    { icon: Cpu, label: 'Device', href: '/institute/device' },
    { icon: ShoppingCart, label: 'Shop', href: '/institute/shop' },
    { 
      icon: Bus, label: 'Transportation', href: '#',
      subItems: [
        { label: 'Driver', href: '/institute/transport/driver' },
        { label: 'Vehicle', href: '/institute/transport/vehicle' },
        { label: 'Route', href: '/institute/transport/route' },
      ]
    },
    { 
      icon: ClipboardCheck, label: 'Attendance', href: '#',
      subItems: [
        { label: 'Student Attendance', href: '/institute/attendance/student' },
        { label: 'Staff Attendance', href: '/institute/attendance/staff' },
        { label: 'Attendance Log', href: '/institute/attendance/log' },
        { label: 'Biometric Devices', href: '/institute/attendance/biometric' },
      ]
    },
    { 
      icon: CalendarOff, label: 'Leave', href: '#',
      subItems: [
        { label: 'Leave Request', href: '/institute/leave/request' },
        { label: 'Leave Type', href: '/institute/leave/type' },
        { label: 'Leave Settings', href: '/institute/leave/settings' },
      ]
    },
    { 
      icon: Banknote, label: 'Payroll', href: '#',
      subItems: [
        { label: 'Manage Payroll', href: '/institute/payroll' },
      ]
    },
    { 
      icon: TrendingDown, label: 'Expenses', href: '#',
      subItems: [
        { label: 'All Expenses', href: '/institute/expenses/all-expenses' },
        { label: 'Expenses Category', href: '/institute/expenses/category' },
        { label: 'Expenses Parties', href: '/institute/expenses/parties' },
        { label: 'Expenses Settings', href: '/institute/expenses/settings' },
      ]
    },
    { 
      icon: TrendingUp, label: 'Income', href: '#',
      subItems: [
        { label: 'All Income', href: '/institute/income/all-income' },
        { label: 'Income Category', href: '/institute/income/category' },
        { label: 'Income Parties', href: '/institute/income/parties' },
      ]
    },
    { 
      icon: Settings, label: 'Payment Settings', href: '#',
      subItems: [
        { label: 'Offline Payment Setup', href: '/institute/payment-settings/offline' },
        { label: 'Manual Payment Settings', href: '/institute/payment-settings/manual' },
        { label: 'Payment Gateway Settings', href: '/institute/payment-settings/gateway' },
      ]
    },
    { 
      icon: BookOpen, label: 'Ledger & Day Book', href: '#',
      subItems: [
        { label: 'Ledger', href: '/institute/ledger-day-book/ledger' },
        { label: 'Bank Transfer', href: '/institute/ledger-day-book/bank-transfer' },
        { label: 'Day Book', href: '/institute/ledger-day-book/day-book' },
      ]
    },
    { icon: Book, label: 'Homework', href: '/institute/homework' },
    { icon: Clock, label: 'Time Table', href: '/institute/time-table' },
    { icon: Smartphone, label: 'Mobile App User', href: '/institute/mobile-app-user' },
    { icon: Bell, label: 'Notification', href: '/institute/notification' },
    { icon: MessageSquare, label: 'Text SMS', href: '/institute/sms' },
    { icon: Megaphone, label: 'Notice on App', href: '/institute/notice' },
    { 
      icon: Mail, label: 'Message Service', href: '#',
      subItems: [
        { label: 'App Notification', href: '/institute/message-service/app-notification' },
        { label: 'SMS', href: '/institute/message-service/sms' },
        { label: 'WhatsApp', href: '/institute/message-service/whatsapp' },
        { label: 'Email Setup', href: '/institute/message-service/email-setup' },
      ]
    },
    { 
      icon: Calendar, label: 'Academic Calendar', href: '#',
      subItems: [
        { label: 'Academic Calendar', href: '/institute/academic-calendar' },
        { label: 'Add Event/Holiday', href: '/institute/academic-calendar/add-event' },
      ]
    },
    { 
      icon: Ticket, label: 'Gate Pass', href: '#',
      subItems: [
        { label: 'All Gate Pass', href: '/institute/gate-pass' },
        { label: 'Gate Pass Settings', href: '/institute/gate-pass/settings' },
      ]
    },
    { icon: BookOpen, label: 'Lesson Plans', href: '/institute/lesson-plans' },
    { 
      icon: Files, label: 'Study Material', href: '#',
      subItems: [
        { label: 'Video Lecture', href: '/institute/study-material/video-lecture' },
        { label: 'PDF/Image Notes', href: '/institute/study-material/notes' },
      ]
    },
    { 
      icon: MonitorPlay, label: 'Online Quiz / Test', href: '#',
      subItems: [
        { label: 'Questions', href: '/institute/online-quiz/questions' },
        { label: 'Quiz / Test', href: '/institute/online-quiz/quiz-test' },
      ]
    },
    { icon: FileText, label: 'Offline / Weekly Test', href: '/institute/offline-test' },
    { 
      icon: Image, label: 'Events Gallery', href: '#',
      subItems: [
        { label: 'All Events', href: '/institute/gallery' },
        { label: 'Create New Events', href: '/institute/gallery/create' },
      ]
    },
    { icon: LifeBuoy, label: 'Support Tickets', href: '/institute/support' },
    { icon: Home, label: 'House / Blocks', href: '/institute/house' },
    { icon: Tag, label: 'Tags', href: '/institute/tags' },
    { 
      icon: FileSignature, label: 'Custom Forms', href: '#',
      subItems: [
        { label: 'All Forms', href: '/institute/custom-forms' },
        { label: 'Add New Forms', href: '/institute/custom-forms/create' },
      ]
    },
    { 
      icon: Database, label: 'Masters', href: '#',
      subItems: [
        { label: 'All Classes', href: '/institute/masters/classes' },
        { label: 'All Sections', href: '/institute/masters/sections' },
        { label: 'All Streams', href: '/institute/masters/streams' },
        { label: 'Subject Groups', href: '/institute/masters/subject-groups' },
        { label: 'All Subjects', href: '/institute/masters/subjects' },
        { label: 'Books', href: '/institute/masters/books' },
        { label: 'Discount Heads', href: '/institute/masters/discount-heads' },
        { label: 'Document Types', href: '/institute/masters/document-types' },
        { label: 'Departments', href: '/institute/masters/departments' },
        { label: 'Lead Sources', href: '/institute/leads-sources' },
        { label: 'Data Settings', href: '/institute/masters/data-settings' },
      ]
    },
    { icon: ShoppingCart, label: 'Shop', href: '/institute/shop' },
    { 
      icon: Settings, label: 'Settings', href: '#',
      subItems: [
        { label: 'School', href: '/institute/settings/school' },
        { label: 'Fees', href: '/institute/settings/fees' },
        { label: 'Auto Generate', href: '/institute/settings/auto-generate' },
        { label: 'Attendance', href: '/institute/settings/attendance' },
        { label: 'Options', href: '/institute/settings/options' },
        { label: 'Activities', href: '/institute/settings/activities' },
      ]
    },
    { icon: UserCog, label: 'Edit Profile', href: '/institute/profile' },
    { 
      icon: CreditCard, label: 'Subscription Menu', href: '#',
      subItems: [
        { label: 'Active Plan', href: '/institute/subscription/active-plan' },
        { label: 'All Plan', href: '/institute/subscription/all-plan' },
        { label: 'Refer to Other', href: '/institute/subscription/refer-to-other' },
      ]
    },
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
          background: 'var(--sidebar-bg, #ffffff)',
          borderRight: '1px solid var(--sidebar-border, #f1f5f9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '4px 0 24px rgba(6, 182, 212, 0.05)',
        }}
      >
        {/* Logo */}
        <div className="p-5 shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}
            >
              <div className="w-4 h-4 border-2 border-white/90 rotate-45 rounded-sm" />
            </div>
            <div>
              <h1 className="text-[13px] font-extrabold tracking-widest leading-none"
                style={{ background: 'linear-gradient(135deg, #0284c7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ACADEMY SETU
              </h1>
              <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-widest mt-0.5 uppercase">Institute Portal</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {(!allowedMenus ? [] : (allowedMenus.length > 0 ? menuItems.filter(item => allowedMenus.includes(item.label) || ['Settings', 'Dashboard', 'Edit Profile', 'Custom Forms', 'Masters', 'Tags', 'Payment Settings', 'Device', 'Shop', 'Ledger & Day Book', 'Subscription Menu'].includes(item.label)) : menuItems)).map((item, i) => {
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
                        ? 'text-white shadow-lg shadow-cyan-500/25'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-cyan-600 dark:hover:text-cyan-400'
                    }`}
                    style={parentActive ? {
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4.5 h-4.5 ${parentActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className="text-[13px]">{item.label}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''} ${parentActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`} />
                  </button>

                  {isMenuOpen && (
                    <div className="mt-1 ml-3 pl-4 border-l-2 border-cyan-100 dark:border-cyan-900/40 flex flex-col gap-0.5 py-1">
                      {item.subItems!.map((sub, j) => {
                        const isSubActive = (subHref: string) => {
                          if (subHref.includes('?')) {
                            const [path, search] = subHref.split('?')
                            if (pathname !== path) return false
                            if (typeof window === 'undefined') return true
                            const subParams = new URLSearchParams(search)
                            const currentParams = new URLSearchParams(window.location.search)
                            return Array.from(subParams.entries()).every(([key, val]) => currentParams.get(key) === val)
                          }
                          if (pathname === subHref) {
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
                                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/40'
                                : 'text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${exactActive ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
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
                    ? 'text-white shadow-lg shadow-cyan-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-cyan-600 dark:hover:text-cyan-400'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                } : {}}
              >
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md">
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

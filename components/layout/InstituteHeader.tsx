'use client'

import { Sun, Moon, Menu, ChevronDown, UserCog, LogOut } from 'lucide-react'
import { NotificationPanel } from '@/components/layout/NotificationPanel'
import { useTheme } from '@/components/theme-provider'
import { useEffect, useState, useRef } from 'react'
import { fetchInstituteName } from '@/app/institute/actions'
import { logoutAction } from '@/app/institute/login/actions'
import Link from 'next/link'

export function InstituteHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState<string>('')
  const [greeting, setGreeting] = useState<string>('Hello')
  const [instituteName, setInstituteName] = useState<string>('Name')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setMounted(true)
    
    // Fetch institute name
    fetchInstituteName().then(name => setInstituteName(name))
    
    const updateDateTime = () => {
      const now = new Date()
      const hrs = now.getHours()
      
      let greet = 'Good Evening'
      if (hrs < 12) greet = 'Good Morning'
      else if (hrs < 17) greet = 'Good Afternoon'
      setGreeting(greet)

      const formatted = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
      setCurrentDate(formatted)
    }

    updateDateTime()
    const timer = setInterval(updateDateTime, 60000 * 30)
    return () => clearInterval(timer)
  }, [])

  return (
    <header
      className="h-16 sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between transition-all duration-300"
      style={{
        background: 'var(--glass-bg, rgba(255, 255, 255, 0.8))',
        borderBottom: '1px solid var(--glass-border, rgba(255, 255, 255, 0.3))',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 1px 24px rgba(6, 182, 212, 0.05)',
      }}
    >
      {/* Left: menu toggle + greeting */}
      <div className="flex items-center gap-3 flex-1">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <span className="text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {greeting}, {instituteName} 👋
          </span>
          {currentDate && (
            <>
              <span className="text-slate-200 dark:text-slate-700 hidden sm:inline select-none">|</span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
                {currentDate}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-white/50 dark:hover:bg-white/10 border border-white/40 dark:border-white/10 rounded-xl shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        <NotificationPanel />

        <div className="h-5 w-px bg-slate-200/60 dark:bg-white/10 hidden sm:block" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-2xl transition-all duration-200 cursor-pointer group border"
            style={{
              background: 'rgba(255,255,255,0.45)',
              borderColor: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="text-right hidden sm:block">
              <p className="text-[12px] font-bold text-slate-800 dark:text-slate-100 leading-none group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{instituteName}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Admin</p>
            </div>
            <div className="relative">
              <div className="w-8 h-8 rounded-xl overflow-hidden border-2 border-white/80 dark:border-white/20 shadow-sm transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
                <img src="https://i.pravatar.cc/150?u=institute" alt="Admin" className="w-full h-full object-cover" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 flex flex-col">
                <Link 
                  href="/institute/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                >
                  <UserCog className="w-4 h-4" />
                  Edit Profile
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

'use client'

import { Sun, Moon, Menu, ChevronDown } from 'lucide-react'
import { NotificationPanel } from '@/components/layout/NotificationPanel'
import { useTheme } from '@/components/theme-provider'
import { useEffect, useState } from 'react'

export function AdminHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState<string>('')
  const [greeting, setGreeting] = useState<string>('Hello')

  useEffect(() => {
    setMounted(true)
    
    const updateDateTime = () => {
      const now = new Date()
      const hrs = now.getHours()
      
      let greet = 'Good Evening'
      if (hrs < 12) greet = 'Good Morning'
      else if (hrs < 17) greet = 'Good Afternoon'
      setGreeting(greet)

      // e.g., "Sunday, Jun 28, 2026"
      const formatted = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
      setCurrentDate(formatted)
    }

    updateDateTime()
    const timer = setInterval(updateDateTime, 60000 * 30) // Update every 30 minutes
    return () => clearInterval(timer)
  }, [])

  return (
    <header
      className="h-16 sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between transition-all duration-300"
      style={{
        background: 'var(--glass-bg)',
        borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 1px 24px rgba(79,70,229,0.06)',
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

        {/* Greeting & Date — single line */}
        <div className="flex items-center gap-2.5">
          <span className="text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {greeting}, Admin 👋
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
        {/* Theme Toggle */}
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
        <div
          className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-2xl transition-all duration-200 cursor-pointer group border"
          style={{
            background: 'rgba(255,255,255,0.45)',
            borderColor: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-bold text-slate-800 dark:text-slate-100 leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Admin</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Super Admin</p>
          </div>
          <div className="relative">
            <div className="w-8 h-8 rounded-xl overflow-hidden border-2 border-white/80 dark:border-white/20 shadow-sm transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)' }}>
              <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors hidden sm:block" />
        </div>
      </div>
    </header>
  )
}

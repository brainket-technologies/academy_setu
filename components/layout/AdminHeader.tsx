'use client'

import { Search, Bell, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useEffect, useState } from 'react'

export function AdminHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="h-20 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-10 px-8 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-96">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input 
          type="text" 
          placeholder="Search" 
          className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm dark:text-slate-200 dark:placeholder-slate-500"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative p-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}

        <button className="relative p-2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
        </button>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 pl-4 pr-1.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm cursor-pointer hover:border-teal-200 dark:hover:border-teal-600 transition-colors">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-none">Admin</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Super Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
            <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  )
}

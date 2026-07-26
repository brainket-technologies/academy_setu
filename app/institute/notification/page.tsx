'use client'

import React, { useState, useEffect } from 'react'
import { Search, CheckCircle2 } from 'lucide-react'

interface NotificationRecord {
  id: number
  title: string
  message: string
  createdAt: string
  status: 'Sent' | 'Archived'
}

const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 1,
    title: 'Lorem ipsum dolor sit amet',
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    createdAt: '18/09/2025 11:00 AM',
    status: 'Sent',
  },
  {
    id: 2,
    title: 'Lorem ipsum dolor sit amet',
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    createdAt: '18/09/2025 11:00 AM',
    status: 'Archived',
  },
  {
    id: 3,
    title: 'Lorem ipsum dolor sit amet',
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    createdAt: '18/09/2025 11:00 AM',
    status: 'Sent',
  },
]

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>(INITIAL_NOTIFICATIONS)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('school_notifications')
    if (saved) {
      try {
        setNotifications(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_notifications', JSON.stringify(INITIAL_NOTIFICATIONS))
    }
  }, [])

  const filtered = notifications.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Notification</h1>
          <p className="text-xs text-slate-400">View sent and archived notification logs</p>
        </div>

        {/* Search */}
        <div className="relative w-72 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search by Name, Mobile no..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>
      </div>

      {/* Notification table (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs">

          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left w-56">Title</th>
                <th className="px-4 py-4 text-left">Message</th>
                <th className="px-4 py-4 w-44">Created At</th>
                <th className="px-4 py-4 w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold align-top">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-800">{item.title}</td>
                  <td className="px-4 py-3.5 text-left text-slate-500 leading-relaxed max-w-md">{item.message}</td>
                  <td className="px-4 py-3.5 text-slate-450 font-semibold whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <span>📅</span>
                      <span>{item.createdAt}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-3 py-1 rounded text-[10px] font-black uppercase ${
                      item.status === 'Sent'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-red-50 text-red-500 border border-red-100'
                    }`}>
                      {item.status === 'Sent' ? '● Sent' : 'Archived'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">No notifications found.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

      </div>

    </div>
  )
}

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Bell,
  Ticket,
  MessageCircleQuestion,
  ClipboardList,
  FileText,
  RefreshCw,
  X,
  CheckCheck,
} from 'lucide-react'

interface Notification {
  id: string
  type: 'ticket' | 'query' | 'request' | 'application'
  title: string
  description: string
  status: string
  created_at: string
  href: string
  is_read: boolean
}

const TYPE_META: Record<
  Notification['type'],
  { icon: React.ElementType; color: string; bg: string; dot: string }
> = {
  ticket: {
    icon: Ticket,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    dot: 'bg-rose-500',
  },
  query: {
    icon: MessageCircleQuestion,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    dot: 'bg-violet-500',
  },
  request: {
    icon: ClipboardList,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    dot: 'bg-amber-500',
  },
  application: {
    icon: FileText,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    dot: 'bg-teal-500',
  },
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch('/api/admin/notifications')
      const json = await res.json()
      if (json.success) {
        setNotifications(json.data)
        setLastFetched(new Date())
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on first open
  useEffect(() => {
    if (open && notifications.length === 0) {
      fetchNotifications()
    }
  }, [open, notifications.length, fetchNotifications])

  // Poll every 60 seconds when panel is open
  useEffect(() => {
    if (!open) return
    const id = setInterval(() => fetchNotifications(true), 60_000)
    return () => clearInterval(id)
  }, [open, fetchNotifications])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }

  function markRead(id: string) {
    setReadIds((prev) => new Set([...prev, id]))
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={bellRef}
        id="header-notification-bell"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className={`w-4.5 h-4.5 ${open ? 'text-teal-600 dark:text-teal-400' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {unreadCount === 0 && notifications.length > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full border-2 border-white dark:border-slate-800" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-[calc(100%+8px)] w-[380px] max-w-[calc(100vw-1rem)] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-200/60 dark:shadow-black/40 z-50 overflow-hidden"
          style={{ animation: 'slideDownFade 0.18s ease-out' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 px-2 py-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => fetchNotifications()}
                disabled={loading}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[420px] divide-y divide-slate-50 dark:divide-slate-800/60">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Loading notifications…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">All caught up!</p>
                <p className="text-xs text-slate-300 dark:text-slate-600">No pending notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const meta = TYPE_META[n.type]
                const Icon = meta.icon
                const isRead = readIds.has(n.id)
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => { markRead(n.id); setOpen(false) }}
                    className={`flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${
                      isRead ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Icon bubble */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center mt-0.5`}>
                      <Icon className={`w-4.5 h-4.5 ${meta.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[13px] font-semibold leading-snug truncate ${
                          isRead
                            ? 'text-slate-500 dark:text-slate-400'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}>
                          {n.title}
                        </p>
                        {!isRead && (
                          <span className={`flex-shrink-0 w-2 h-2 ${meta.dot} rounded-full mt-1.5`} />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        {n.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                          {n.status}
                        </span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-[10px] text-slate-300 dark:text-slate-600">
                {lastFetched ? `Updated ${timeAgo(lastFetched.toISOString())}` : ''}
              </p>
              <Link
                href="/admin/ticket"
                onClick={() => setOpen(false)}
                className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                View all tickets →
              </Link>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideDownFade {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  )
}

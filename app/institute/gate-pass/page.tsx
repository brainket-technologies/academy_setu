'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, Plus, UserCheck, Printer, Download, Trash2,
  MoreVertical, CheckCircle2, Shield, X, Loader2, Users, User,
  Calendar, Clock, ExternalLink, ArrowRight, Filter
} from 'lucide-react'
import Link from 'next/link'
import { fetchGatePasses, deleteGatePass } from './actions'

export default function OneTimeGatePassPage() {
  const [passes, setPasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterUserType, setFilterUserType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetchGatePasses('one-time')
        if (res?.success && Array.isArray(res.data)) {
          setPasses(res.data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ open: true, msg, type })
    setTimeout(() => setToast(p => ({ ...p, open: false })), 3000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this one-time gate pass?')) return
    const res = await deleteGatePass(id)
    if (res?.success) {
      setPasses(prev => prev.filter(p => p.id !== id))
      setActionMenuId(null)
      showToast('Gate pass deleted successfully!', 'success')
    } else {
      showToast(res?.error || 'Failed to delete.', 'error')
    }
  }

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = passes.length
    const studentCount = passes.filter(p => String(p.user_type || '').toLowerCase() === 'student').length
    const visitorCount = passes.filter(p => String(p.user_type || '').toLowerCase() === 'visitor').length
    const todayStr = new Date().toISOString().split('T')[0]
    const todayCount = passes.filter(p => {
      const raw = p.created_at || p.visit_date
      if (!raw) return false
      try {
        const d = new Date(raw)
        if (isNaN(d.getTime())) return false
        return d.toISOString().split('T')[0] === todayStr
      } catch {
        return false
      }
    }).length
    return { total, studentCount, visitorCount, todayCount }
  }, [passes])

  // Filtered List
  const filtered = useMemo(() => {
    return passes
      .filter(p => {
        const name = String(p.visitor_name || p.student_name || '').toLowerCase()
        const receiver = String(p.receiver_name || '').toLowerCase()
        const parent = String(p.parent_name || '').toLowerCase()
        const mobile = String(p.parents_mobile || p.contact || '').toLowerCase()
        const q = searchQuery.toLowerCase()
        return !q || name.includes(q) || receiver.includes(q) || parent.includes(q) || mobile.includes(q)
      })
      .filter(p => {
        if (!filterUserType) return true
        const ut = String(p.user_type || '').toLowerCase()
        return ut === filterUserType.toLowerCase()
      })
      .filter(p => {
        if (!dateFrom && !dateTo) return true
        const d = new Date(p.created_at || p.visit_date || '')
        if (isNaN(d.getTime())) return true
        if (dateFrom && d < new Date(dateFrom)) return false
        if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false
        return true
      })
  }, [passes, searchQuery, filterUserType, dateFrom, dateTo])

  const fmtDate = (val: any) => {
    if (!val) return '—'
    try {
      const d = new Date(val)
      if (isNaN(d.getTime())) return String(val)
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    } catch { return String(val) }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* ── HEADER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-800 dark:text-white">One Time Gate Pass</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {passes.length} passes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Issue and track single-entry gate passes for students, parents, and temporary visitors.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/institute/gate-pass/one-time"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create One Time Pass</span>
          </Link>
        </div>
      </div>

      {/* ── METRIC STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Passes</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.total}</p>
          <span className="text-[11px] text-teal-600 font-semibold">One-time passes recorded</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Today&apos;s Passes</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.todayCount}</p>
          <span className="text-[11px] text-blue-600 font-semibold">Issued today</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Student Passes</span>
            <UserCheck className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.studentCount}</p>
          <span className="text-[11px] text-purple-600 font-semibold">Authorized pickups</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Visitor Passes</span>
            <User className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.visitorCount}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Campus guests</span>
        </div>
      </div>

      {/* ── SEARCH & FILTER TOOLBAR ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search by student, visitor, receiver, phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 outline-none focus:border-teal-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* User Type Filter */}
          <select
            value={filterUserType}
            onChange={e => setFilterUserType(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500 cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <option value="">All User Types</option>
            <option value="Student">Students Only</option>
            <option value="Visitor">Visitors Only</option>
          </select>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 outline-none focus:border-teal-500 text-slate-600 dark:text-slate-300"
            title="From Date"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 outline-none focus:border-teal-500 text-slate-600 dark:text-slate-300"
            title="To Date"
          />
          {(searchQuery || filterUserType || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setFilterUserType('')
                setDateFrom('')
                setDateTo('')
              }}
              className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
            <span className="text-sm font-bold">Loading one-time gate passes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto font-semibold text-xs">
            <table className="w-full text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-3.5 w-12">#</th>
                  <th className="px-3 py-3.5">User Type</th>
                  <th className="px-3 py-3.5 text-left">Person Name</th>
                  <th className="px-3 py-3.5">Class / Roll</th>
                  <th className="px-3 py-3.5 w-14">Photo</th>
                  <th className="px-3 py-3.5 text-left">Receiver / Guardian</th>
                  <th className="px-3 py-3.5">Relation</th>
                  <th className="px-3 py-3.5 text-left">Reason / Purpose</th>
                  <th className="px-3 py-3.5">Entry Gate</th>
                  <th className="px-3 py-3.5">Exit Gate</th>
                  <th className="px-3 py-3.5">Date & Time</th>
                  <th className="px-3 py-3.5 w-16 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((item, idx) => {
                  const isStudent = String(item.user_type || '').toLowerCase() === 'student'
                  const personName = item.student_name || item.visitor_name || '—'
                  const classInfo = isStudent ? `${item.class_name || ''} ${item.section_name ? '· ' + item.section_name : ''} ${item.roll_no ? '· Roll ' + item.roll_no : ''}`.trim() : '—'

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors align-middle">
                      <td className="px-3 py-3.5 text-slate-400 font-mono">
                        {String(idx + 1).padStart(2, '0')}.
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isStudent ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300' :
                          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          {isStudent ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {item.user_type || 'Visitor'}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-left whitespace-nowrap">
                        <span className="font-bold text-slate-800 dark:text-white">{personName}</span>
                        {isStudent && item.parent_name && (
                          <div className="text-[10.5px] font-semibold text-slate-400 mt-0.5 flex items-center gap-1">
                            <span>Parent:</span>
                            <span className="text-slate-600 dark:text-slate-300 font-bold">{item.parent_name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                        {classInfo}
                      </td>
                      <td className="px-3 py-3.5">
                        {item.photo_url ? (
                          <img src={item.photo_url} alt="receiver" className="w-8 h-8 rounded-full object-cover mx-auto ring-2 ring-teal-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 mx-auto flex items-center justify-center text-[10px] text-slate-500 font-bold">
                            {(personName).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-left font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {item.receiver_name || '—'}
                      </td>
                      <td className="px-3 py-3.5 text-slate-500 dark:text-slate-400">
                        {item.receiver_relation || '—'}
                      </td>
                      <td className="px-3 py-3.5 text-left text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
                        {item.reason || item.purpose || '—'}
                      </td>
                      <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300 font-bold">
                        {item.entry_gate || '1'}
                      </td>
                      <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300 font-bold">
                        {item.exit_gate || '2'}
                      </td>
                      <td className="px-3 py-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                        {fmtDate(item.created_at || item.visit_date)}
                      </td>
                      <td className="px-3 py-3.5 text-right pr-4 relative">
                        <button
                          onClick={() => setActionMenuId(actionMenuId === item.id ? null : item.id)}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 ml-auto transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        {actionMenuId === item.id && (
                          <div className="absolute right-4 top-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1 w-32 animate-in fade-in zoom-in-95 duration-150 text-left">
                            <Link
                              href={`/institute/gate-pass/print?id=${item.id}`}
                              className="flex items-center gap-2 px-4 py-2 w-full hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-500" /> Print Pass
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex items-center gap-2 px-4 py-2 w-full hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold text-red-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={12} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <Shield className="w-7 h-7 text-slate-300 dark:text-slate-500" />
                        </div>
                        <p className="font-bold text-sm">No one-time gate passes found.</p>
                        <Link
                          href="/institute/gate-pass/one-time"
                          className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-teal-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Issue One Time Pass
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── TOAST ── */}
      {toast.open && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-red-200" />}
          <span className="text-xs font-bold">{toast.msg}</span>
        </div>
      )}
    </div>
  )
}

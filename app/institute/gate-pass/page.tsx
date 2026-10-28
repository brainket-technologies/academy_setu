'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, Plus, UserCheck, Printer, Download, Pencil, Trash2,
  MoreVertical, CheckCircle2, Shield, X, Loader2, Users, User, LogIn
} from 'lucide-react'
import Link from 'next/link'
import { fetchGatePasses, deleteGatePass } from './actions'

export default function AllGatePassPage() {
  const [passes, setPasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'one-time' | 'permanent'>('one-time')
  const [filterAll, setFilterAll] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetchGatePasses()
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
    if (!confirm('Delete this gate pass?')) return
    const res = await deleteGatePass(id)
    if (res?.success) {
      setPasses(prev => prev.filter(p => p.id !== id))
      setActionMenuId(null)
      showToast('Gate pass deleted!', 'success')
    } else {
      showToast(res?.error || 'Failed to delete.', 'error')
    }
  }

  const oneTimeCount = passes.filter(p => (p.pass_type || 'one-time') === 'one-time').length
  const permanentCount = passes.filter(p => p.pass_type === 'permanent').length

  const filtered = useMemo(() => {
    return passes
      .filter(p => (p.pass_type || 'one-time') === activeTab)
      .filter(p => {
        const name = String(p.visitor_name || p.student_name || '').toLowerCase()
        const receiver = String(p.receiver_name || '').toLowerCase()
        const q = searchQuery.toLowerCase()
        return !q || name.includes(q) || receiver.includes(q)
      })
      .filter(p => {
        if (!filterAll) return true
        const ut = String(p.user_type || '').toLowerCase()
        return ut === filterAll.toLowerCase()
      })
      .filter(p => {
        if (!dateFrom && !dateTo) return true
        const d = new Date(p.created_at || p.visit_date || '')
        if (isNaN(d.getTime())) return true
        if (dateFrom && d < new Date(dateFrom)) return false
        if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false
        return true
      })
  }, [passes, activeTab, searchQuery, filterAll, dateFrom, dateTo])

  const fmtDate = (val: string) => {
    if (!val) return '—'
    try {
      return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    } catch { return val }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* ── HEADER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Gate Pass</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage visitor and student gate passes</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative w-52 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
            />
          </div>
          {/* One Time */}
          <Link
            href="/institute/gate-pass/one-time"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> One Time
          </Link>
          {/* Permanent */}
          <Link
            href="/institute/gate-pass/permanent-registration"
            className="flex items-center gap-1.5 px-4 py-2 border border-teal-500 text-teal-700 hover:bg-teal-50 rounded-xl text-xs font-bold transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" /> Permanent
          </Link>
          {/* Visitor Entry */}
          <Link
            href="/institute/gate-pass/visitor-entry"
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" /> Visitor Entry
          </Link>
        </div>
      </div>

      {/* ── TABS + FILTERS ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-sm">
          <button
            onClick={() => setActiveTab('one-time')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'one-time' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            One Time Visitor
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              activeTab === 'one-time' ? 'bg-white/20' : 'bg-teal-50 text-teal-600'
            }`}>{String(oneTimeCount).padStart(2, '0')}</span>
          </button>
          <button
            onClick={() => setActiveTab('permanent')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'permanent' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Permanent Visitor
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              activeTab === 'permanent' ? 'bg-white/20' : 'bg-teal-50 text-teal-600'
            }`}>{String(permanentCount).padStart(2, '0')}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            placeholder="From"
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-teal-500"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            placeholder="To"
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-teal-500"
          />
          <select
            value={filterAll}
            onChange={e => setFilterAll(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none bg-white min-w-[80px]"
          >
            <option value="">All</option>
            <option value="Student">Student</option>
            <option value="Staff">Staff</option>
            <option value="Visitor">Visitor</option>
          </select>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
            <span className="text-sm font-bold">Loading gate passes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto font-semibold text-xs">
            <table className="w-full text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/40 font-black text-slate-600 text-xs border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3.5 w-10">S.No</th>
                  <th className="px-3 py-3.5">User Type</th>
                  <th className="px-3 py-3.5 text-left">Name</th>
                  <th className="px-3 py-3.5">{activeTab === 'permanent' ? 'Aadhar No.' : 'Class / Roll'}</th>
                  <th className="px-3 py-3.5 w-14">Photo</th>
                  <th className="px-3 py-3.5 text-left">Receiver Name</th>
                  <th className="px-3 py-3.5">Relation</th>
                  <th className="px-3 py-3.5 text-left">{activeTab === 'permanent' ? 'Valid Until' : 'Reason'}</th>
                  <th className="px-3 py-3.5">Entry Gate</th>
                  <th className="px-3 py-3.5">Exit Gate</th>
                  <th className="px-3 py-3.5">Date</th>
                  <th className="px-3 py-3.5 w-14">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const isStudent = String(item.user_type || '').toLowerCase() === 'student'
                  const personName = item.student_name || item.visitor_name || '—'
                  const classInfo = isStudent ? `${item.class_name || ''} ${item.section_name ? '· ' + item.section_name : ''} ${item.roll_no ? '· Roll ' + item.roll_no : ''}`.trim() : '—'

                  return (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors align-middle">
                      <td className="px-3 py-3.5 text-slate-400">{idx + 1}.</td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
                          isStudent ? 'bg-blue-50 text-blue-700' :
                          item.user_type === 'Visitor' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {isStudent ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {item.user_type || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-left font-bold text-slate-800 whitespace-nowrap">{personName}</td>
                      <td className="px-3 py-3.5 text-slate-500 text-[10px] whitespace-nowrap">
                        {activeTab === 'permanent'
                          ? (item.aadhar_no ? `****${item.aadhar_no.slice(-4)}` : '—')
                          : classInfo
                        }
                      </td>
                      <td className="px-3 py-3.5">
                        {item.photo_url
                          ? <img src={item.photo_url} alt="receiver" className="w-8 h-8 rounded-full object-cover mx-auto ring-2 ring-teal-200" />
                          : <div className="w-8 h-8 rounded-full bg-slate-200 mx-auto flex items-center justify-center text-[10px] text-slate-400 font-bold">{(personName).charAt(0).toUpperCase()}</div>
                        }
                      </td>
                      <td className="px-3 py-3.5 text-left font-bold text-slate-700 whitespace-nowrap">{item.receiver_name || '—'}</td>
                      <td className="px-3 py-3.5 text-slate-500">{item.receiver_relation || '—'}</td>
                      <td className="px-3 py-3.5 text-left text-slate-500 max-w-[140px] truncate">
                        {activeTab === 'permanent'
                          ? (item.valid_to ? `Until ${new Date(item.valid_to).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : '—')
                          : (item.reason || item.purpose || '—')
                        }
                      </td>
                      <td className="px-3 py-3.5 text-slate-500">{item.entry_gate || '—'}</td>
                      <td className="px-3 py-3.5 text-slate-500">{item.exit_gate || '—'}</td>
                      <td className="px-3 py-3.5 text-slate-400 whitespace-nowrap text-[10px]">{fmtDate(item.created_at)}</td>
                      <td className="px-3 py-3.5 relative">
                        <button
                          onClick={() => setActionMenuId(actionMenuId === item.id ? null : item.id)}
                          className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 mx-auto transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        {actionMenuId === item.id && (
                          <div className="absolute right-4 top-10 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 w-32 animate-in fade-in zoom-in-95 duration-150">
                            <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 text-xs font-bold text-slate-600">
                              <Printer className="w-3.5 h-3.5 text-blue-500" /> Print
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 text-xs font-bold text-slate-600">
                              <Download className="w-3.5 h-3.5 text-amber-500" /> Download
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-red-50 text-xs font-bold text-red-500"
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
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Shield className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="font-bold text-sm">No gate passes found.</p>
                        <Link
                          href="/institute/gate-pass/one-time"
                          className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-teal-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Create First Gate Pass
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

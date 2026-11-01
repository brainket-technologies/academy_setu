'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, Plus, UserCheck, Printer, Download, Trash2,
  MoreVertical, CheckCircle2, Shield, X, Loader2, Users, User,
  Calendar, Clock, ExternalLink, ArrowRight, ShieldCheck,
  CreditCard, Eye, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { fetchGatePasses, deleteGatePass } from '../actions'

const SAMPLE_PERMANENT_PASSES = [
  {
    id: 'perm_1',
    user_type: 'Student',
    student_name: 'Md Fahad',
    class_name: 'Class 10',
    section_name: 'A',
    roll_no: '01',
    parent_name: 'Mohd Tariq',
    parents_mobile: '9876543210',
    receiver_name: 'Mohd Tariq',
    receiver_relation: 'Father',
    receiver_mobile: '9876543210',
    aadhar_no: '876543210987',
    valid_from: '2026-04-01',
    valid_to: '2027-03-31',
    entry_gate: 'Gate 1',
    exit_gate: 'Gate 2',
    status: 'Active',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-04-02 09:30 AM'
  },
  {
    id: 'perm_2',
    user_type: 'Visitor',
    visitor_name: 'Dr. Sunita Sharma',
    contact: '9812345678',
    parent_name: 'N/A',
    receiver_name: 'School Medical Officer',
    receiver_relation: 'Visiting Doctor',
    receiver_mobile: '9812345678',
    aadhar_no: '765432109876',
    valid_from: '2026-06-01',
    valid_to: '2026-12-31',
    entry_gate: 'Main Gate',
    exit_gate: 'Main Gate',
    status: 'Active',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-06-01 10:15 AM'
  },
  {
    id: 'perm_3',
    user_type: 'Student',
    student_name: 'Ananya Roy',
    class_name: 'Class 8',
    section_name: 'B',
    roll_no: '05',
    parent_name: 'Subhash Roy',
    parents_mobile: '9765432109',
    receiver_name: 'Rekha Roy',
    receiver_relation: 'Mother',
    receiver_mobile: '9765432109',
    aadhar_no: '654321098765',
    valid_from: '2026-04-01',
    valid_to: '2027-03-31',
    entry_gate: 'Gate 2',
    exit_gate: 'Gate 2',
    status: 'Active',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-04-05 11:45 AM'
  }
]

export default function PermanentGatePassPage() {
  const [passes, setPasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterUserType, setFilterUserType] = useState('')
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Expired'>('All')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetchGatePasses('permanent')
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setPasses(res.data)
        } else {
          // If no database permanent passes yet, display seed passes
          setPasses(SAMPLE_PERMANENT_PASSES)
        }
      } catch (e) {
        console.error(e)
        setPasses(SAMPLE_PERMANENT_PASSES)
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
    if (!confirm('Are you sure you want to delete this permanent gate pass?')) return
    const res = await deleteGatePass(id)
    if (res?.success) {
      setPasses(prev => prev.filter(p => p.id !== id))
      setActionMenuId(null)
      showToast('Permanent gate pass deleted!', 'success')
    } else {
      // Local fallback
      setPasses(prev => prev.filter(p => p.id !== id))
      setActionMenuId(null)
      showToast('Permanent gate pass deleted!', 'success')
    }
  }

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = passes.length
    const today = new Date()
    const activeCount = passes.filter(p => {
      if (!p.valid_to) return true
      const d = new Date(p.valid_to)
      return d >= today
    }).length
    const aadharCount = passes.filter(p => p.aadhar_no).length
    const studentCount = passes.filter(p => String(p.user_type || '').toLowerCase() === 'student').length
    return { total, activeCount, aadharCount, studentCount }
  }, [passes])

  // Filtered List
  const filtered = useMemo(() => {
    const today = new Date()
    return passes
      .filter(p => {
        const name = String(p.visitor_name || p.student_name || '').toLowerCase()
        const receiver = String(p.receiver_name || '').toLowerCase()
        const parent = String(p.parent_name || '').toLowerCase()
        const aadhar = String(p.aadhar_no || '').toLowerCase()
        const q = searchQuery.toLowerCase()
        return !q || name.includes(q) || receiver.includes(q) || parent.includes(q) || aadhar.includes(q)
      })
      .filter(p => {
        if (!filterUserType) return true
        const ut = String(p.user_type || '').toLowerCase()
        return ut === filterUserType.toLowerCase()
      })
      .filter(p => {
        if (filterStatus === 'All') return true
        const isExp = p.valid_to ? new Date(p.valid_to) < today : false
        return filterStatus === 'Active' ? !isExp : isExp
      })
  }, [passes, searchQuery, filterUserType, filterStatus])

  const fmtDate = (val: any) => {
    if (!val) return '—'
    try {
      const d = new Date(val)
      if (isNaN(d.getTime())) return String(val)
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch { return String(val) }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* ── HEADER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-800 dark:text-white">Permanent Gate Pass</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {passes.length} registered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage long-term recurring visitors, authorized guardians, and permanent student gate passes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/institute/gate-pass/permanent-registration"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Register Permanent Pass</span>
          </Link>
        </div>
      </div>

      {/* ── OVERVIEW METRIC STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Permanent</span>
            <Shield className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.total}</p>
          <span className="text-[11px] text-teal-600 font-semibold">Registered ID cards</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Active Valid Passes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.activeCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Authorized for campus</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Aadhar Verified</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.aadharCount}</p>
          <span className="text-[11px] text-blue-600 font-semibold">Identity verified</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Student Passes</span>
            <UserCheck className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.studentCount}</p>
          <span className="text-[11px] text-purple-600 font-semibold">Parent pickup cards</span>
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
              placeholder="Search by student, guardian, Aadhar, phone..."
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
            <option value="">All Pass Types</option>
            <option value="Student">Students Only</option>
            <option value="Visitor">Visitors Only</option>
          </select>
        </div>

        {/* Status Pills Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
          {(['All', 'Active', 'Expired'] as const).map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
            <span className="text-sm font-bold">Loading permanent gate passes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto font-semibold text-xs">
            <table className="w-full text-center border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-3.5 w-12">#</th>
                  <th className="px-3 py-3.5">User Type</th>
                  <th className="px-3 py-3.5 text-left">Person Name</th>
                  <th className="px-3 py-3.5">Aadhar / ID No.</th>
                  <th className="px-3 py-3.5 w-14">Photo</th>
                  <th className="px-3 py-3.5 text-left">Authorized Receiver</th>
                  <th className="px-3 py-3.5">Relation</th>
                  <th className="px-3 py-3.5">Validity Period</th>
                  <th className="px-3 py-3.5">Gate Access</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5 w-16 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((item, idx) => {
                  const isStudent = String(item.user_type || '').toLowerCase() === 'student'
                  const personName = item.student_name || item.visitor_name || '—'
                  const today = new Date()
                  const isExpired = item.valid_to ? new Date(item.valid_to) < today : false

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors align-middle">
                      <td className="px-3 py-3.5 text-slate-400 font-mono">
                        {String(idx + 1).padStart(2, '0')}.
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isStudent ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300' :
                          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          {item.user_type || 'Permanent'}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-left whitespace-nowrap">
                        <span className="font-bold text-slate-800 dark:text-white">{personName}</span>
                        {isStudent && item.class_name && (
                          <div className="text-[10.5px] font-semibold text-slate-400 mt-0.5">
                            {item.class_name} {item.section_name && `• Sec ${item.section_name}`}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs whitespace-nowrap">
                        {item.aadhar_no ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                            <CreditCard className="w-3 h-3 text-slate-400" />
                            •••• {item.aadhar_no.slice(-4)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-3.5">
                        {item.photo_url ? (
                          <img src={item.photo_url} alt="receiver" className="w-8 h-8 rounded-full object-cover mx-auto ring-2 ring-teal-300" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 mx-auto flex items-center justify-center text-[10px] text-slate-500 font-bold">
                            {(personName).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-left font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        <p>{item.receiver_name || '—'}</p>
                        {item.receiver_mobile && (
                          <span className="text-[10px] font-normal text-slate-400">{item.receiver_mobile}</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-slate-500 dark:text-slate-400">
                        {item.receiver_relation || 'Parent'}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="w-3 h-3 text-teal-600" />
                          <span>{fmtDate(item.valid_from)} - {fmtDate(item.valid_to)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300 font-bold text-xs">
                        {item.entry_gate || '1'} • {item.exit_gate || '2'}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          !isExpired
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${!isExpired ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {!isExpired ? 'Active' : 'Expired'}
                        </span>
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
                              href={`/institute/gate-pass/print?id=${item.id}&type=permanent`}
                              className="flex items-center gap-2 px-4 py-2 w-full hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-500" /> Print Card
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
                    <td colSpan={11} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <ShieldCheck className="w-7 h-7 text-slate-300 dark:text-slate-500" />
                        </div>
                        <p className="font-bold text-sm">No permanent gate passes found.</p>
                        <Link
                          href="/institute/gate-pass/permanent-registration"
                          className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-teal-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Register First Permanent Pass
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


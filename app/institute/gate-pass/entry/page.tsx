'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Search, Plus, LogIn, Trash2, Printer, Eye, Filter, Calendar,
  CheckCircle2, ShieldCheck, UserCheck, AlertCircle, ArrowLeft,
  RefreshCw, Car, Clock, Phone, User, Users, ChevronDown, X,
  Download, FileText, Check, ShieldAlert
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchGatePassEntries, deleteGatePassEntry } from '../actions'

interface GatePassEntryItem {
  id: string
  pass_id?: string
  pass_type?: string
  user_type?: string
  student_name?: string
  class_name?: string
  section_name?: string
  roll_no?: string
  receiver_name?: string
  receiver_mobile?: string
  receiver_relation?: string
  live_photo_url?: string
  visit_date?: string
  visit_time?: string
  entry_gate?: string
  exit_gate?: string
  vehicle_no?: string
  reason?: string
  remarks?: string
  verification_status?: boolean
  status?: string
  check_in?: string
  created_at?: string
}

export default function GatePassEntryPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<GatePassEntryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | '7days' | 'custom'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all')

  // Modals
  const [selectedEntry, setSelectedEntry] = useState<GatePassEntryItem | null>(null)
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({
    open: false,
    msg: '',
    type: 'success'
  })

  const printRef = useRef<HTMLDivElement>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ open: true, msg, type })
    setTimeout(() => setToast(p => ({ ...p, open: false })), 3500)
  }

  // Load entries from DB and localStorage
  const loadEntries = async () => {
    setLoading(true)
    try {
      let localEntries: GatePassEntryItem[] = []
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('school_gate_pass_entries')
          if (raw) localEntries = JSON.parse(raw)
        } catch (e) {}
      }

      const res = await fetchGatePassEntries()
      const dbEntries: GatePassEntryItem[] = (res?.success && Array.isArray(res.data)) ? res.data : []

      // Merge and deduplicate by ID
      const dbIds = new Set(dbEntries.map(e => String(e.id)))
      const uniqueLocal = localEntries.filter(e => !dbIds.has(String(e.id)))
      const combined = [...dbEntries, ...uniqueLocal]

      // Sort newest first
      combined.sort((a, b) => {
        const da = new Date(a.created_at || a.check_in || a.visit_date || '').getTime() || 0
        const db = new Date(b.created_at || b.check_in || b.visit_date || '').getTime() || 0
        return db - da
      })

      setEntries(combined)
    } catch (err: any) {
      console.error(err)
      showToast('Failed to load entries.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [])

  // Delete entry
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gate pass entry record?')) return
    try {
      await deleteGatePassEntry(id)
      setEntries(prev => prev.filter(e => e.id !== id))

      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('school_gate_pass_entries')
          if (raw) {
            const list = JSON.parse(raw).filter((e: any) => e.id !== id)
            localStorage.setItem('school_gate_pass_entries', JSON.stringify(list))
          }
        } catch (e) {}
      }
      showToast('Gate pass entry deleted successfully!', 'success')
      if (selectedEntry?.id === id) {
        setPrintModalOpen(false)
        setDetailsModalOpen(false)
        setSelectedEntry(null)
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete entry.', 'error')
    }
  }

  // Print slip handler
  const handlePrint = () => {
    window.print()
  }

  // Class list extracted dynamically
  const availableClasses = useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => {
      if (e.class_name && typeof e.class_name === 'string' && e.class_name.trim()) {
        set.add(e.class_name.trim())
      }
    })
    return Array.from(set).sort()
  }, [entries])

  // Filtered entries
  const filteredEntries = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    return entries.filter(e => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const match =
          (e.receiver_name && e.receiver_name.toLowerCase().includes(q)) ||
          (e.student_name && e.student_name.toLowerCase().includes(q)) ||
          (e.receiver_mobile && e.receiver_mobile.includes(q)) ||
          (e.roll_no && e.roll_no.toLowerCase().includes(q)) ||
          (e.vehicle_no && e.vehicle_no.toLowerCase().includes(q)) ||
          (e.reason && e.reason.toLowerCase().includes(q)) ||
          (e.entry_gate && e.entry_gate.toLowerCase().includes(q))
        if (!match) return false
      }

      // Class Filter
      if (selectedClass) {
        if (!e.class_name || e.class_name.trim().toLowerCase() !== selectedClass.trim().toLowerCase()) {
          return false
        }
      }

      // Verification Filter
      if (verificationFilter === 'verified' && !e.verification_status) return false
      if (verificationFilter === 'unverified' && e.verification_status) return false

      // Date Range Filter
      const entryDateRaw = e.visit_date || (e.created_at ? e.created_at.split('T')[0] : '')
      if (dateRangeFilter === 'today') {
        if (entryDateRaw !== todayStr) return false
      } else if (dateRangeFilter === '7days') {
        if (!entryDateRaw) return false
        const d = new Date(entryDateRaw)
        if (isNaN(d.getTime()) || d < sevenDaysAgo) return false
      } else if (dateRangeFilter === 'custom') {
        if (dateFrom && entryDateRaw && entryDateRaw < dateFrom) return false
        if (dateTo && entryDateRaw && entryDateRaw > dateTo) return false
      }

      return true
    })
  }, [entries, searchQuery, selectedClass, verificationFilter, dateRangeFilter, dateFrom, dateTo])

  // Stats calculation
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const total = entries.length
    const today = entries.filter(e => (e.visit_date === todayStr || (e.created_at && e.created_at.startsWith(todayStr)))).length
    const verified = entries.filter(e => e.verification_status).length
    const uniqueReceivers = new Set(entries.map(e => (e.receiver_name || '').trim()).filter(Boolean)).size

    return { total, today, verified, uniqueReceivers }
  }, [entries])

  // Format date helper
  const formatDate = (val?: string) => {
    if (!val) return '—'
    try {
      const d = new Date(val)
      if (isNaN(d.getTime())) return val
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return val
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-200">

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-[#1b3a60] to-teal-700 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/institute/gate-pass"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">Gate Pass Entry</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-400 text-teal-950 uppercase tracking-wider">
                Permanent Passes
              </span>
            </div>
            <p className="text-xs text-teal-100 mt-0.5">
              Log, monitor, and print slips for all verified permanent visitor entries
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadEntries}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors"
            title="Refresh Entries"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <Link
            href="/institute/gate-pass/permanent-registration"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" /> Register Permanent Pass
          </Link>

          <Link
            href="/institute/gate-pass/visitor-entry"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-teal-900 hover:bg-teal-50 rounded-xl text-xs font-black shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Log Permanent Entry
          </Link>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Entries</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.total}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Permanent check-ins</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <LogIn className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Check-ins</p>
            <h3 className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">{stats.today}</h3>
            <p className="text-[10px] text-teal-600/80 mt-0.5">Active today</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Photo Verified</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.verified}</h3>
            <p className="text-[10px] text-emerald-600/80 mt-0.5">Aadhar / Face match</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Unique Receivers</p>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.uniqueReceivers}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Authorized visitors</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTERS BAR ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by receiver name, student name, roll no, mobile, or vehicle..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
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

          {/* Quick Date Filters */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 gap-1 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setDateRangeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRangeFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setDateRangeFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRangeFilter === 'today'
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDateRangeFilter('7days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRangeFilter === '7days'
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRangeFilter('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateRangeFilter === 'custom'
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-700/60">
          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Class:</span>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="">All Classes ({availableClasses.length})</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Verification filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Verification:</span>
            <select
              value={verificationFilter}
              onChange={e => setVerificationFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
          {dateRangeFilter === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-slate-500">From:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500"
              />
              <span className="text-xs font-bold text-slate-500">To:</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-teal-500"
              />
            </div>
          )}

          {/* Reset Filters button if any filter active */}
          {(searchQuery || selectedClass || verificationFilter !== 'all' || dateRangeFilter !== 'all' || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedClass('')
                setVerificationFilter('all')
                setDateRangeFilter('all')
                setDateFrom('')
                setDateTo('')
              }}
              className="text-xs font-bold text-red-500 hover:text-red-700 ml-auto flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── ENTRIES TABLE ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden print:hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-xs font-bold">Loading Gate Pass Entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-white">No Gate Pass Entries Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              {entries.length === 0
                ? "No permanent visitor check-ins have been logged yet. Click below to log the first entry."
                : "No entries match your search or filter criteria. Try adjusting the filters above."}
            </p>
            {entries.length === 0 ? (
              <Link
                href="/institute/gate-pass/visitor-entry"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Log Permanent Entry Now
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedClass('')
                  setVerificationFilter('all')
                  setDateRangeFilter('all')
                }}
                className="mt-4 text-xs font-bold text-teal-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Receiver / Visitor</th>
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4">Visit Date & Time</th>
                  <th className="py-3.5 px-4">Gate</th>
                  <th className="py-3.5 px-4">Vehicle / Reason</th>
                  <th className="py-3.5 px-4 text-center">Verification</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredEntries.map((entry, index) => {
                  const hasPhoto = Boolean(entry.live_photo_url)
                  const studentDisplay = entry.student_name || '—'
                  const classSection = [entry.class_name, entry.section_name].filter(Boolean).join(' - ')

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-teal-50/30 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      {/* S.No */}
                      <td className="py-3 px-4 text-center text-slate-400 font-semibold">
                        {index + 1}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {entry.status || 'Checked-In'}
                        </span>
                      </td>

                      {/* Receiver / Visitor */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {hasPhoto ? (
                            <img
                              src={entry.live_photo_url}
                              alt={entry.receiver_name || 'Receiver'}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0 font-black text-xs">
                              {entry.receiver_name ? entry.receiver_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {entry.receiver_name || 'Unknown Receiver'}
                              {entry.receiver_relation && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                  {entry.receiver_relation}
                                </span>
                              )}
                            </div>
                            {entry.receiver_mobile && (
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {entry.receiver_mobile}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Student Details */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {studentDisplay}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          {classSection && <span>{classSection}</span>}
                          {entry.roll_no && (
                            <span className="bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                              Roll: {entry.roll_no}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Visit Date & Time */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          {formatDate(entry.visit_date || entry.created_at)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {entry.visit_time || '—'}
                        </div>
                      </td>

                      {/* Gate */}
                      <td className="py-3 px-4">
                        <div className="text-slate-700 dark:text-slate-300 font-semibold">
                          In: <span className="font-bold text-slate-900 dark:text-white">{entry.entry_gate || 'Main Gate'}</span>
                        </div>
                        {entry.exit_gate && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Out: {entry.exit_gate}
                          </div>
                        )}
                      </td>

                      {/* Vehicle / Reason */}
                      <td className="py-3 px-4 max-w-[200px]">
                        {entry.vehicle_no && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                            <Car className="w-3 h-3" />
                            {entry.vehicle_no}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate" title={entry.reason || 'No reason recorded'}>
                          {entry.reason || '—'}
                        </p>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3 px-4 text-center">
                        {entry.verification_status ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print slip */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEntry(entry)
                              setPrintModalOpen(true)
                            }}
                            title="Print Gate Pass Entry Slip"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* View detail */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEntry(entry)
                              setDetailsModalOpen(true)
                            }}
                            title="View Full Details"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(entry.id)}
                            title="Delete Entry"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 text-slate-400 hover:border-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          PRINT GATE PASS ENTRY SLIP MODAL
      ══════════════════════════════════════════════════════ */}
      {printModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#1b3a60] text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-teal-300" />
                <h3 className="text-sm font-black tracking-wide">Print Gate Pass Slip</h3>
              </div>
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Pass Area */}
            <div className="p-6 overflow-y-auto space-y-4" ref={printRef} id="printable-gate-pass">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 bg-white text-slate-800 space-y-4">
                
                {/* School / Slip Header */}
                <div className="text-center pb-3 border-b border-slate-200">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-200 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    Verified Permanent Gate Pass
                  </div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Visitor & Student Check-In Slip
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Slip ID: <span className="font-mono font-bold text-slate-700">{selectedEntry.id.slice(0, 8).toUpperCase()}</span> • Check-In: {formatDate(selectedEntry.visit_date || selectedEntry.created_at)} {selectedEntry.visit_time || ''}
                  </p>
                </div>

                {/* Receiver & Student 2-Column Info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Receiver Info */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Authorized Receiver
                    </p>
                    <div className="flex items-start gap-2.5">
                      {selectedEntry.live_photo_url ? (
                        <img
                          src={selectedEntry.live_photo_url}
                          alt={selectedEntry.receiver_name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-300 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center font-black text-slate-500 shrink-0">
                          {selectedEntry.receiver_name?.charAt(0) || 'R'}
                        </div>
                      )}
                      <div>
                        <div className="font-black text-slate-900 leading-tight">
                          {selectedEntry.receiver_name || '—'}
                        </div>
                        <div className="text-[11px] text-teal-700 font-bold mt-0.5">
                          {selectedEntry.receiver_relation || 'Visitor'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {selectedEntry.receiver_mobile || '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Student Details
                    </p>
                    <div className="font-black text-slate-900 leading-tight">
                      {selectedEntry.student_name || '—'}
                    </div>
                    <div className="text-[11px] text-slate-600 font-semibold mt-1">
                      Class: <span className="font-bold text-slate-800">{selectedEntry.class_name || '—'}</span>
                      {selectedEntry.section_name && ` (${selectedEntry.section_name})`}
                    </div>
                    <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                      Roll No: <span className="font-bold text-slate-800">{selectedEntry.roll_no || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Details Grid */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Entry Gate</span>
                    <span className="font-bold text-slate-800">{selectedEntry.entry_gate || 'Main Gate'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Exit Gate</span>
                    <span className="font-bold text-slate-800">{selectedEntry.exit_gate || 'Main Gate'}</span>
                  </div>
                  {selectedEntry.vehicle_no && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Vehicle Number</span>
                      <span className="font-mono font-bold text-slate-800">{selectedEntry.vehicle_no}</span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 block">Purpose / Reason</span>
                    <span className="font-semibold text-slate-700">{selectedEntry.reason || 'Pickup / Visit'}</span>
                  </div>
                </div>

                {/* Signatures Footer */}
                <div className="pt-6 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 border-t border-slate-200">
                  <div>
                    <div className="border-b border-slate-300 pb-5"></div>
                    <p className="font-bold mt-1 text-slate-700">Visitor Signature</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-300 pb-5"></div>
                    <p className="font-bold mt-1 text-slate-700">Security Guard</p>
                  </div>
                  <div>
                    <div className="border-b border-slate-300 pb-5"></div>
                    <p className="font-bold mt-1 text-slate-700">Institute Stamp</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2.5 print:hidden">
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" /> Print Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          DETAILS MODAL
      ══════════════════════════════════════════════════════ */}
      {detailsModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-4 bg-[#1b3a60] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-300" />
                <h3 className="text-sm font-black">Gate Pass Entry Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Photo & Receiver Banner */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                {selectedEntry.live_photo_url ? (
                  <img
                    src={selectedEntry.live_photo_url}
                    alt={selectedEntry.receiver_name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-300 dark:border-slate-600 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-500 text-lg shrink-0">
                    {selectedEntry.receiver_name?.charAt(0) || 'R'}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedEntry.receiver_name || '—'}
                  </h4>
                  <p className="text-teal-600 dark:text-teal-400 font-bold mt-0.5">
                    Relation: {selectedEntry.receiver_relation || 'Authorized Visitor'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selectedEntry.receiver_mobile || '—'}
                  </p>
                </div>
              </div>

              {/* Student Details */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-slate-400">
                  Student Information
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Student Name</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEntry.student_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Class & Section</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {[selectedEntry.class_name, selectedEntry.section_name].filter(Boolean).join(' - ') || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Roll Number</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEntry.roll_no || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Pass Type</span>
                    <span className="font-bold text-teal-600 capitalize">{selectedEntry.pass_type || 'Permanent'}</span>
                  </div>
                </div>
              </div>

              {/* Visit Details */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-slate-400">
                  Visit & Security Log
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Visit Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(selectedEntry.visit_date || selectedEntry.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Visit Time</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEntry.visit_time || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Entry Gate</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEntry.entry_gate || 'Main Gate'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Exit Gate</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEntry.exit_gate || 'Main Gate'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Vehicle Number</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEntry.vehicle_no || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Verification Status</span>
                    <span className={`font-bold ${selectedEntry.verification_status ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {selectedEntry.verification_status ? 'Photo / Aadhar Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[10px] block">Purpose / Reason</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEntry.reason || '—'}</span>
                  </div>
                  {selectedEntry.remarks && (
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] block">Remarks</span>
                      <span className="text-slate-600 dark:text-slate-300">{selectedEntry.remarks}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDelete(selectedEntry.id)}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Entry
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDetailsModalOpen(false)
                    setPrintModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-sm transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toast.open && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}


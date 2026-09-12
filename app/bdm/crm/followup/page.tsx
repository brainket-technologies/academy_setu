'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, Edit3, Calendar, Clock, Loader2, 
  ChevronLeft, ChevronRight, Phone, MessageSquare, 
  ArrowLeft, RefreshCw, X, Check, Save, User, 
  Building2, Filter, ChevronDown, ChevronUp, History, 
  PhoneCall, Sparkles, AlertTriangle, CheckCircle2, ArrowUpDown
} from 'lucide-react'
import { toast } from 'sonner'
import { getBdmSessionAction } from '@/app/bdm/login/actions'

interface Lead {
  id: string
  lead_source: string
  mobile_no: string
  email_id: string
  contact_person: string
  school_name: string
  institution_name?: string
  state: string
  district: string
  no_of_students: number
  status: string
  status_text_color?: string
  status_bg_color?: string
  created_at: string
  updated_at: string
  latest_remarks?: string
  latest_follow_up?: string
}

interface LeadHistory {
  id: string
  lead_id: string
  communication_option: 'Call' | 'Message'
  call_duration: string
  remarks: string
  follow_up_date: string | null
  status: string
  status_name?: string
  created_at: string
}

interface LeadStatus {
  id: string
  name: string
  text_color: string
  bg_color: string
  show_on_bdm: boolean
}

function BdmFollowupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter')
  const [userName, setUserName] = useState('Prerna')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [statuses, setStatuses] = useState<LeadStatus[]>([])

  // Search & Filters
  const [searchText, setSearchText] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [followupDatePreset, setFollowupDatePreset] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'overdue' | 'upcoming'>('all')

  useEffect(() => {
    if (filterParam && ['today', 'tomorrow', 'this_week', 'overdue', 'upcoming', 'all'].includes(filterParam)) {
      setFollowupDatePreset(filterParam as any)
    }
  }, [filterParam])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [dateType, setDateType] = useState<'followup' | 'interaction'>('followup')
  const [orderBy, setOrderBy] = useState<'nearest_followup' | 'recent_interaction' | 'created_at'>('nearest_followup')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Follow-up / Edit Communication Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [leadHistory, setLeadHistory] = useState<LeadHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State inside Modal
  const [commOption, setCommOption] = useState<'Call' | 'Message'>('Call')
  const [callDuration, setCallDuration] = useState('')
  const [remarks, setRemarks] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [leadStatus, setLeadStatus] = useState('')

  // Quick preset remarks for faster logging
  const QUICK_REMARKS = [
    'Not answering', 'Busy', 'Call later', 'Asked for demo', 
    'Meeting scheduled', 'Interested', 'Follow up next week', 'Wrong number'
  ]

  // Fetch BDM Session to get user name
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getBdmSessionAction()
        if (session && session.name) {
          setUserName(session.name)
        }
      } catch (err) {
        console.error('Session error', err)
      }
    }
    fetchSession()
  }, [])

  // Fetch Statuses
  const fetchStatuses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/crm/status')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setStatuses(data.data)
      }
    } catch (err) {
      console.error('Status fetch error', err)
    }
  }, [])

  // Fetch Leads (BDM filtered by server session)
  const fetchLeads = useCallback(async (
    page: number, 
    search: string, 
    source: string, 
    status: string,
    preset: string,
    from: string,
    to: string,
    dtype: string,
    order: string
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('pageSize', pageSize.toString())
      params.append('order_by', order)
      params.append('date_type', dtype)

      if (search) params.append('search', search)
      if (source) params.append('source', source)
      if (status) params.append('status', status)
      if (preset && preset !== 'all') params.append('followup_date_filter', preset)
      if (from) params.append('from_date', from)
      if (to) params.append('to_date', to)

      const res = await fetch(`/api/admin/crm/leads?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setLeads(data.data || [])
        if (data.meta) {
          setTotalCount(data.meta.totalCount || 0)
          setTotalPages(data.meta.totalPages || 1)
          setCurrentPage(data.meta.page || 1)
        }
      } else {
        toast.error('Failed to load leads')
      }
    } catch (err) {
      console.error('Fetch leads error', err)
      toast.error('Something went wrong loading leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatuses()
  }, [fetchStatuses])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads(
        currentPage, 
        searchText, 
        filterSource, 
        filterStatus, 
        followupDatePreset, 
        fromDate, 
        toDate, 
        dateType, 
        orderBy
      )
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchLeads, currentPage, searchText, filterSource, filterStatus, followupDatePreset, fromDate, toDate, dateType, orderBy])

  // Reset all filters
  const handleResetFilters = () => {
    setSearchText('')
    setFilterSource('')
    setFilterStatus('')
    setFollowupDatePreset('all')
    setFromDate('')
    setToDate('')
    setDateType('followup')
    setOrderBy('nearest_followup')
    setCurrentPage(1)
  }

  // Open Edit / Follow-up Modal for a lead
  const handleOpenEdit = async (lead: Lead) => {
    setSelectedLead(lead)
    setLeadStatus(lead.status || '')
    setCommOption('Call')
    setCallDuration('')
    setRemarks('')
    setFollowUpDate(lead.latest_follow_up ? new Date(lead.latest_follow_up).toISOString().slice(0, 16) : '')
    setIsModalOpen(true)
    setHistoryLoading(true)

    try {
      const res = await fetch(`/api/admin/crm/leads/${lead.id}`)
      const data = await res.json()
      if (data.success && data.data) {
        setSelectedLead(data.data)
        setLeadHistory(data.data.history || [])
        if (data.data.status) {
          setLeadStatus(data.data.status)
        }
      }
    } catch (err) {
      console.error('Fetch lead detail error', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  // Submit follow-up / communication log
  const handleSubmitFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead) return
    if (!remarks.trim()) {
      toast.error('Please enter response / remarks')
      return
    }
    if (!leadStatus) {
      toast.error('Please select a status')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/crm/leads/${selectedLead.id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communication_option: commOption,
          call_duration: commOption === 'Call' ? callDuration : '',
          remarks: remarks.trim(),
          follow_up_date: followUpDate || null,
          status: leadStatus
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Follow-up and response logged successfully!')
        setIsModalOpen(false)
        setSelectedLead(null)
        setRemarks('')
        setCallDuration('')
        setFollowUpDate('')
        // Refresh leads list
        fetchLeads(currentPage, searchText, filterSource, filterStatus, followupDatePreset, fromDate, toDate, dateType, orderBy)
      } else {
        toast.error(data.error || 'Failed to submit follow-up')
      }
    } catch (err) {
      console.error('Submit follow up error', err)
      toast.error('Something went wrong submitting follow-up')
    } finally {
      setSubmitting(false)
    }
  }

  // Format date helper
  const formatDateDisplay = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch {
      return dateStr
    }
  }

  // Format date with Relative badges (Today, Tomorrow, Overdue)
  const formatFollowUpDate = (dateStr: string | null | undefined) => {
    if (!dateStr) {
      return <span className="text-slate-400 italic text-[11px]">Not Scheduled</span>
    }
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      
      const now = new Date()
      const isPast = d.getTime() < now.getTime()
      
      const isToday = d.toDateString() === now.toDateString()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const isTomorrow = d.toDateString() === tomorrow.toDateString()

      const formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      const formattedTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            {isToday ? (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider">
                TODAY
              </span>
            ) : isTomorrow ? (
              <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-black text-[9px] uppercase tracking-wider">
                TOMORROW
              </span>
            ) : isPast ? (
              <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" />
                OVERDUE
              </span>
            ) : null}

            <span className={`font-bold text-xs ${isPast ? 'text-rose-600 dark:text-rose-400' : isToday ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-blue-600 dark:text-blue-400'}`}>
              {formattedDate}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {formattedTime}
          </span>
        </div>
      )
    } catch {
      return dateStr
    }
  }

  // Render Status Badge
  const renderStatusBadge = (statusName: string | null | undefined) => {
    if (!statusName) return <span className="text-slate-400">-</span>
    const matched = statuses.find(s => s.name.toLowerCase() === statusName.toLowerCase())
    if (matched) {
      return (
        <span 
          className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-xs inline-block border"
          style={{ 
            color: matched.text_color || '#4f46e5',
            backgroundColor: matched.bg_color || 'rgba(99, 102, 241, 0.1)',
            borderColor: matched.text_color ? `${matched.text_color}40` : 'rgba(99, 102, 241, 0.2)'
          }}
        >
          {statusName}
        </span>
      )
    }

    const lower = statusName.toLowerCase()
    let colorStyle = 'bg-slate-100 text-slate-700 border-slate-200'
    if (lower.includes('explained') || lower.includes('working')) colorStyle = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
    if (lower.includes('answering') || lower.includes('busy')) colorStyle = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300'
    if (lower.includes('won') || lower.includes('paid') || lower.includes('active')) colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300'
    if (lower.includes('lost') || lower.includes('junk')) colorStyle = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300'

    return (
      <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border shadow-xs ${colorStyle}`}>
        {statusName}
      </span>
    )
  }

  const hasActiveFilters = Boolean(
    searchText || 
    filterSource || 
    filterStatus || 
    followupDatePreset !== 'all' || 
    fromDate || 
    toDate || 
    orderBy !== 'nearest_followup'
  )

  return (
    <>
      <div className="flex flex-col gap-6 w-full pb-16">
        
        {/* Top Header Card */}
        <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-2xl px-8 py-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
                CRM Follow-up
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-300 text-xs">Nearest Follow-up Priority</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              MANAGE Leads – <span className="text-blue-400">{userName}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Nearest scheduled follow-ups appear on top. Review recent customer responses & pending callbacks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/bdm/crm/leads"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              All Leads
            </Link>
          </div>
        </div>

        {/* Date Filter Preset Pills & Search Toolbar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-4">
          
          {/* Preset Followup Date Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
            
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Follow-up Date:
              </span>

              {[
                { id: 'all', label: 'All Leads' },
                { id: 'today', label: 'Today' },
                { id: 'tomorrow', label: 'Tomorrow' },
                { id: 'this_week', label: 'This Week (7 Days)' },
                { id: 'overdue', label: 'Overdue' },
                { id: 'upcoming', label: 'Upcoming' },
              ].map((p) => {
                const isActive = followupDatePreset === p.id && !fromDate && !toDate
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setFollowupDatePreset(p.id as any)
                      setFromDate('')
                      setToDate('')
                      setCurrentPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>

            {/* Sort Order Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
                Sort:
              </span>
              <select
                value={orderBy}
                onChange={(e) => {
                  setOrderBy(e.target.value as any)
                  setCurrentPage(1)
                }}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="nearest_followup">Nearest Follow-up First (Default)</option>
                <option value="recent_interaction">Recent Interaction First</option>
                <option value="created_at">Newest Created First</option>
              </select>
            </div>

          </div>

          {/* Search bar & Filter toggles */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by school name, contact, mobile..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showFilters || hasActiveFilters
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                Custom Filters
                {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => fetchLeads(currentPage, searchText, filterSource, filterStatus, followupDatePreset, fromDate, toDate, dateType, orderBy)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              </button>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

          </div>

          {/* Expandable Custom Date Range & Attribute Filters */}
          {showFilters && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              
              {/* Date Filter Type */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Filter Date By</label>
                <select
                  value={dateType}
                  onChange={(e) => setDateType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="followup">Follow-up Date</option>
                  <option value="interaction">Last Interaction Date</option>
                  <option value="created">Lead Creation Date</option>
                </select>
              </div>

              {/* From Date */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value)
                    setFollowupDatePreset('all')
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value)
                    setFollowupDatePreset('all')
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  {statuses.map(st => (
                    <option key={st.id} value={st.name}>{st.name}</option>
                  ))}
                </select>
              </div>

              {/* Source */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Lead Source</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="">All Sources</option>
                  <option value="Offline Meeting">Offline Meeting</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Direct">Direct</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            </div>
          )}

        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[360px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-700 text-white dark:bg-slate-900 border-b border-slate-600 text-xs font-bold tracking-wider uppercase">
                  <th className="py-4 px-4 text-center w-14">#</th>
                  <th className="py-4 px-4">NAME</th>
                  <th className="py-4 px-4">Mobile</th>
                  <th className="py-4 px-4">Source</th>
                  <th className="py-4 px-4">Last Response</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Follow Up</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                        <span className="font-bold text-xs">Loading follow-up leads...</span>
                      </div>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center text-slate-400">
                      <p className="font-bold text-base text-slate-700 dark:text-slate-200">No leads match your selected date or filters</p>
                      <p className="text-xs text-slate-400 mt-1">Try changing the date filter or view all leads.</p>
                      <button
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md transition-all cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, idx) => {
                    const leadNumber = (currentPage - 1) * pageSize + idx + 1
                    const shortId = lead.id.replace(/\D/g, '').slice(0, 5) || `${leadNumber}`
                    const isEven = idx % 2 === 1

                    return (
                      <tr
                        key={lead.id}
                        className={`transition-colors group hover:bg-blue-50/40 dark:hover:bg-slate-700/30 ${
                          isEven ? 'bg-slate-50/60 dark:bg-slate-800/40' : 'bg-white dark:bg-slate-800'
                        }`}
                      >
                        {/* # Sequence or ID */}
                        <td className="py-4 px-4 text-center font-bold text-slate-600 dark:text-slate-300">
                          {shortId}
                        </td>

                        {/* NAME (School / Contact) */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-850 dark:text-slate-100 text-[13px]">
                            {lead.contact_person || lead.school_name || lead.institution_name || 'N/A'}
                          </div>
                          {lead.contact_person && (lead.school_name || lead.institution_name) && (
                            <div className="text-[11px] text-slate-400 font-medium">
                              {lead.school_name || lead.institution_name}
                            </div>
                          )}
                        </td>

                        {/* Mobile */}
                        <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-200">
                          {lead.mobile_no || 'N/A'}
                        </td>

                        {/* Source */}
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[11px]">
                            {lead.lead_source || 'Direct'}
                          </span>
                        </td>

                        {/* Last Response */}
                        <td className="py-4 px-4">
                          <span className="font-medium text-slate-700 dark:text-slate-300 line-clamp-2 max-w-xs">
                            {lead.latest_remarks || <span className="text-slate-400 italic">No response logged</span>}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                          {formatDateDisplay(lead.updated_at || lead.created_at)}
                        </td>

                        {/* Follow Up (Nearest on top with relative badges) */}
                        <td className="py-4 px-4 text-[11px] whitespace-nowrap">
                          {formatFollowUpDate(lead.latest_follow_up)}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          {renderStatusBadge(lead.status)}
                        </td>

                        {/* Action - Edit Button */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-700 dark:text-slate-200">{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
              <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-bold text-slate-700 dark:text-slate-200">{totalCount}</span> entries
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 font-bold transition-all"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((pageNum, idx, arr) => (
                  <React.Fragment key={pageNum}>
                    {idx > 0 && arr[idx - 1] !== pageNum - 1 && (
                      <span className="px-1 text-slate-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 font-bold transition-all"
              >
                Next
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* QUICK FOLLOW-UP / COMMUNICATION MODAL */}
      {isModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-100 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Log Communication</span>
                <h3 className="text-base font-bold text-white leading-tight">
                  {selectedLead.contact_person || selectedLead.school_name}
                </h3>
                <p className="text-xs text-slate-300">
                  {selectedLead.mobile_no} • {selectedLead.school_name || selectedLead.district || 'Lead Info'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              
              {/* Form to log follow-up response */}
              <form onSubmit={handleSubmitFollowUp} className="flex flex-col gap-5">
                
                {/* 1. Communication Mode & Call Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Communication Mode <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCommOption('Call')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                          commOption === 'Call'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Phone Call
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommOption('Message')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                          commOption === 'Message'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp / SMS
                      </button>
                    </div>
                  </div>

                  {commOption === 'Call' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Call Duration (Optional)</label>
                      <input
                        type="text"
                        value={callDuration}
                        onChange={(e) => setCallDuration(e.target.value)}
                        placeholder="e.g. 2 min 30 sec"
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Last Response / Remarks */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Response / Remarks <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Click preset chip to auto-fill</span>
                  </div>

                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REMARKS.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRemarks(item)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-300 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-600 cursor-pointer"
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    required
                    placeholder="Enter customer response, feedback, or follow-up note..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* 3. Next Follow-up Date & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Next Follow-Up Date & Time</label>
                    <input
                      type="datetime-local"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Update Status <span className="text-red-500">*</span></label>
                    <select
                      value={leadStatus}
                      onChange={(e) => setLeadStatus(e.target.value)}
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    >
                      <option value="">Select Status</option>
                      {statuses.map(st => (
                        <option key={st.id} value={st.name}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Follow-up
                      </>
                    )}
                  </button>
                </div>

              </form>

              {/* Previous Communication History */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-500" />
                  Previous Communication Logs
                </h4>

                {historyLoading ? (
                  <div className="py-6 text-center text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-xs">Loading history...</span>
                  </div>
                ) : leadHistory.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    No previous logs recorded yet for this lead.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {leadHistory.map((item, idx) => (
                      <div 
                        key={item.id || idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                            {item.communication_option === 'Call' ? (
                              <Phone className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            <span>{item.communication_option}</span>
                            {item.call_duration && (
                              <span className="text-[10px] font-normal text-slate-400">({item.call_duration})</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {formatDateDisplay(item.created_at)}
                          </span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 font-medium pl-5">
                          {item.remarks}
                        </p>

                        <div className="flex items-center justify-between pl-5 pt-1 text-[10px] text-slate-400">
                          <span>Status: <strong className="text-slate-600 dark:text-slate-300">{item.status_name || item.status}</strong></span>
                          {item.follow_up_date && (
                            <span>Follow Up: <strong className="text-blue-600 dark:text-blue-400">{formatDateDisplay(item.follow_up_date)}</strong></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </>
  )
}

export default function BdmFollowupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading follow-ups...</div>}>
      <BdmFollowupContent />
    </Suspense>
  )
}

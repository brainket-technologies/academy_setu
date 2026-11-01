'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, Plus, Eye, Trash2, X, CheckCircle2, AlertCircle, 
  Upload, Loader2, Clock, Ticket, MessageSquare, AlertTriangle, 
  Filter, RotateCcw, Calendar, FileText, ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface TicketRecord {
  id: number
  ticketId: string
  priority: 'Low' | 'Medium' | 'High'
  type: 'Complaint' | 'Feedback' | string
  title: string
  replies: string
  status: 'Active' | 'Resolved' | 'Inactive'
  createdAt: string
  description?: string
  category?: string
  subCategory?: string
  attachedFiles?: string
}

interface SubCategoryItem {
  id: string
  name: string
  parent_category: string
  segment?: string
  low_timeline?: string
  medium_timeline?: string
  high_timeline?: string
}

const INITIAL_TICKETS: TicketRecord[] = []

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<TicketRecord[]>(INITIAL_TICKETS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('')
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All')

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null)

  // Dynamic Categories & Subcategories fetched from DB (managed by Admin)
  const [parentCategories, setParentCategories] = useState<string[]>([])
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Create Form State
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low')
  const [ticketType, setTicketType] = useState<'Complaint' | 'Feedback'>('Complaint')
  const [issueBrief, setIssueBrief] = useState('')
  const [attachedFiles, setAttachedFiles] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load tickets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('school_support_tickets')
    if (saved) {
      try {
        setTickets(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_support_tickets', JSON.stringify(INITIAL_TICKETS))
    }
  }, [])

  // Fetch admin-created Categories and Subcategories from DB
  useEffect(() => {
    async function loadAdminCategories() {
      setLoadingCategories(true)
      try {
        // 1. Fetch parent categories
        const pRes = await fetch('/api/admin/ticket-parent-category')
        const pData = await pRes.json()
        let parents: string[] = []
        if (pData.success && Array.isArray(pData.data)) {
          parents = pData.data.map((c: any) => c.name).filter(Boolean)
        }

        // 2. Fetch subcategories
        const sRes = await fetch('/api/admin/ticket-category?tab=all')
        const sData = await sRes.json()
        if (sData.success && Array.isArray(sData.data)) {
          setSubCategories(sData.data)
          if (sData.meta?.parents && Array.isArray(sData.meta.parents)) {
            parents = Array.from(new Set([...parents, ...sData.meta.parents])).sort()
          }
        }
        setParentCategories(parents)
      } catch (err) {
        console.error('Failed to load categories from database:', err)
      } finally {
        setLoadingCategories(false)
      }
    }
    loadAdminCategories()
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this support ticket?')) {
      const updated = tickets.filter(t => t.id !== id)
      setTickets(updated)
      localStorage.setItem('school_support_tickets', JSON.stringify(updated))
      showToast('Ticket deleted successfully!')
    }
  }

  const handleToggleStatus = (id: number) => {
    const updated = tickets.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'Active' ? 'Resolved' : 'Active'
        return { ...t, status: nextStatus as any }
      }
      return t
    })
    setTickets(updated)
    localStorage.setItem('school_support_tickets', JSON.stringify(updated))
    showToast('Ticket status updated!')
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(prev => prev ? { ...prev, status: prev.status === 'Active' ? 'Resolved' : 'Active' } : null)
    }
  }

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!category.trim() || !subCategory.trim() || !ticketType || !issueBrief.trim()) {
      alert('Please fill in all mandatory fields.')
      return
    }

    const newTicket: TicketRecord = {
      id: Date.now(),
      ticketId: 'Tick' + Math.floor(100 + Math.random() * 900),
      priority,
      type: ticketType,
      title: issueBrief.slice(0, 40) + (issueBrief.length > 40 ? '...' : ''),
      replies: '0',
      status: 'Active',
      createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      description: issueBrief.trim(),
      category: category.trim(),
      subCategory: subCategory.trim(),
      attachedFiles
    }

    const updated = [newTicket, ...tickets]
    setTickets(updated)
    localStorage.setItem('school_support_tickets', JSON.stringify(updated))

    // Reset Form
    setCategory('')
    setSubCategory('')
    setPriority('Low')
    setTicketType('Complaint')
    setIssueBrief('')
    setAttachedFiles('')
    setCreateModalOpen(false)
    showToast('Support ticket submitted successfully!')
  }

  // Format timeline helper
  const formatTimeline = (val?: string) => {
    if (!val) return ''
    const trimmed = String(val).trim()
    if (!trimmed) return ''
    if (/^\d+$/.test(trimmed)) {
      return `${trimmed} hours`
    }
    return trimmed
  }

  // Active subcategory object and dynamic timeline calculation
  const activeSubItem = subCategories.find(
    s => s.name === subCategory && s.parent_category === category
  )

  const rawActiveTimeline = priority === 'High'
    ? (activeSubItem?.high_timeline || '4 hours')
    : priority === 'Medium'
      ? (activeSubItem?.medium_timeline || '12 hours')
      : (activeSubItem?.low_timeline || '24 hours')

  const activeTimeline = formatTimeline(rawActiveTimeline) || rawActiveTimeline

  const handleSubCategoryChange = (val: string) => {
    setSubCategory(val)
    const match = subCategories.find(s => s.name === val && s.parent_category === category)
    if (match) {
      if (match.low_timeline && !match.medium_timeline && !match.high_timeline) {
        setPriority('Low')
      } else if (match.high_timeline && !match.low_timeline && !match.medium_timeline) {
        setPriority('High')
      }
    }
  }

  // Filtered tickets
  const filtered = tickets.filter(t => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchId = t.ticketId.toLowerCase().includes(q)
      const matchType = t.type.toLowerCase().includes(q)
      const matchTitle = (t.title && t.title.toLowerCase().includes(q)) || (t.description && t.description.toLowerCase().includes(q))
      const matchCat = t.category && t.category.toLowerCase().includes(q)
      const matchSub = t.subCategory && t.subCategory.toLowerCase().includes(q)
      if (!matchId && !matchType && !matchTitle && !matchCat && !matchSub) return false
    }
    if (selectedTypeFilter && t.type !== selectedTypeFilter) return false
    if (selectedPriorityFilter && t.priority !== selectedPriorityFilter) return false
    if (selectedCategoryFilter && t.category !== selectedCategoryFilter) return false
    if (selectedStatusFilter !== 'All' && t.status !== selectedStatusFilter) return false
    return true
  })

  // Quick stats
  const totalTickets = tickets.length
  const activeCount = tickets.filter(t => t.status === 'Active').length
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length
  const complaintsCount = tickets.filter(t => t.type === 'Complaint').length
  const feedbackCount = tickets.filter(t => t.type === 'Feedback').length

  const hasActiveFilters = Boolean(
    searchQuery || selectedCategoryFilter || selectedTypeFilter || selectedPriorityFilter || selectedStatusFilter !== 'All'
  )

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategoryFilter('')
    setSelectedTypeFilter('')
    setSelectedPriorityFilter('')
    setSelectedStatusFilter('All')
  }

  // Filtered subcategories for selected category in modal
  const availableSubCategories = category 
    ? subCategories.filter(s => s.parent_category === category) 
    : []

  return (
    <div className="flex flex-col gap-5 w-full pb-10 animate-in fade-in duration-300">
      
      {/* ── TOP HEADER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Support Tickets</h1>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {totalTickets} total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Request technical assistance, submit feedback, and monitor complaint resolution.</p>
        </div>

        <button
          onClick={() => {
            setCategory(parentCategories[0] || '')
            setSubCategory('')
            setPriority('Low')
            setTicketType('Complaint')
            setIssueBrief('')
            setAttachedFiles('')
            setCreateModalOpen(true)
          }}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs hover:shadow-sm flex items-center justify-center gap-2 transition-all text-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Ticket</span>
        </button>
      </div>

      {/* ── QUICK METRIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Active */}
        <div 
          onClick={() => setSelectedStatusFilter('Active')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-800 shadow-2xs hover:shadow-xs ${
            selectedStatusFilter === 'Active' ? 'ring-2 ring-teal-500 border-teal-300' : 'border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>In Progress / Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
            {activeCount}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Awaiting resolution</p>
        </div>

        {/* Resolved */}
        <div 
          onClick={() => setSelectedStatusFilter('Resolved')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-800 shadow-2xs hover:shadow-xs ${
            selectedStatusFilter === 'Resolved' ? 'ring-2 ring-blue-500 border-blue-300' : 'border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
            {resolvedCount}
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Completed tickets</p>
        </div>

        {/* Complaints */}
        <div 
          onClick={() => setSelectedTypeFilter(selectedTypeFilter === 'Complaint' ? '' : 'Complaint')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-800 shadow-2xs hover:shadow-xs ${
            selectedTypeFilter === 'Complaint' ? 'ring-2 ring-rose-500 border-rose-300' : 'border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Complaints</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
            {complaintsCount}
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">Issues & errors</p>
        </div>

        {/* Feedback */}
        <div 
          onClick={() => setSelectedTypeFilter(selectedTypeFilter === 'Feedback' ? '' : 'Feedback')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-800 shadow-2xs hover:shadow-xs ${
            selectedTypeFilter === 'Feedback' ? 'ring-2 ring-indigo-500 border-indigo-300' : 'border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Feedback</span>
            <MessageSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
            {feedbackCount}
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">User suggestions</p>
        </div>
      </div>

      {/* ── UNIFIED FILTER & SEARCH BAR ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
        
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by ID, Category, Subject..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold text-slate-800 dark:text-slate-200 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Tabs */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            {['All', 'Active', 'Resolved'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedStatusFilter === st
                    ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none font-bold text-xs focus:border-teal-500 transition-colors"
          >
            <option value="">All Categories</option>
            {parentCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Type Dropdown */}
          <select
            value={selectedTypeFilter}
            onChange={e => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none font-bold text-xs focus:border-teal-500 transition-colors"
          >
            <option value="">All Types</option>
            <option value="Complaint">Complaint</option>
            <option value="Feedback">Feedback</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriorityFilter}
            onChange={e => setSelectedPriorityFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none font-bold text-xs focus:border-teal-500 transition-colors"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
              title="Clear all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── TICKETS TABLE ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto text-xs font-semibold text-slate-700 dark:text-slate-300">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-xs">
              <tr>
                <th className="px-4 py-3.5 w-14 text-center">S. No.</th>
                <th className="px-4 py-3.5 w-28">Ticket ID</th>
                <th className="px-4 py-3.5 w-28">Priority</th>
                <th className="px-4 py-3.5 w-28">Type</th>
                <th className="px-4 py-3.5">Category / Subcategory</th>
                <th className="px-4 py-3.5">Issue Summary</th>
                <th className="px-4 py-3.5 w-28 text-center">Status</th>
                <th className="px-4 py-3.5 w-32">Date</th>
                <th className="px-4 py-3.5 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold">
              {filtered.map((item, idx) => {
                const priorityStyles = item.priority === 'High'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                  : item.priority === 'Medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'

                const typeStyles = item.type === 'Complaint'
                  ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900'
                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900'

                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}.</td>
                    
                    {/* Ticket ID */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                        #{item.ticketId}
                      </span>
                    </td>

                    {/* Priority Badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black border ${priorityStyles}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.priority === 'High' ? 'bg-rose-500' : item.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {item.priority}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${typeStyles}`}>
                        {item.type === 'Complaint' ? <AlertTriangle className="w-3 h-3 shrink-0" /> : <MessageSquare className="w-3 h-3 shrink-0" />}
                        {item.type}
                      </span>
                    </td>

                    {/* Category & Subcategory */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 max-w-[200px]">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                          {item.category || 'General'}
                        </span>
                        {item.subCategory && (
                          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold truncate flex items-center gap-1">
                            <span className="text-slate-300">↳</span> {item.subCategory}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Issue Summary */}
                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="truncate font-bold text-slate-800 dark:text-slate-100 text-xs">
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                          {item.description}
                        </div>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border transition-all cursor-pointer ${
                          item.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        {item.status}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-500 text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.createdAt.split(' ')[0]}</span>
                      </div>
                      {item.createdAt.split(' ')[1] && (
                        <div className="text-[10px] text-slate-400 pl-4">
                          {item.createdAt.split(' ').slice(1).join(' ')}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(item)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-300 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 transition-colors cursor-pointer"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                        <Ticket className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">No Tickets Found</h3>
                      <p className="text-xs text-slate-400 text-center">
                        {hasActiveFilters 
                          ? 'No support tickets match your current filters. Try resetting the filters.'
                          : 'No support tickets submitted yet. Create one to get started.'}
                      </p>
                      {hasActiveFilters ? (
                        <button
                          onClick={handleClearFilters}
                          className="mt-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-teal-600 hover:bg-slate-50 transition-colors"
                        >
                          Reset Filters
                        </button>
                      ) : (
                        <button
                          onClick={() => setCreateModalOpen(true)}
                          className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          + Create First Ticket
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          CREATE TICKET MODAL
      ════════════════════════════════════════════════════════════════ */}
      {createModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150" 
          onClick={() => setCreateModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-xs font-semibold text-slate-700 dark:text-slate-200 max-h-[92vh] flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-850 dark:text-white">Create Support Ticket</h3>
                  <p className="text-[11px] text-slate-400">File a complaint or submit feedback to the administration.</p>
                </div>
              </div>
              <button 
                onClick={() => setCreateModalOpen(false)} 
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 overflow-y-auto pr-1">
              
              {/* Row 1: Category & Sub Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Category <span className="text-red-500">*</span>
                    </label>
                    {loadingCategories && <Loader2 className="w-3 h-3 animate-spin text-teal-600" />}
                  </div>
                  <select
                    value={category}
                    onChange={e => {
                      setCategory(e.target.value)
                      setSubCategory('')
                    }}
                    required
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none font-bold text-xs focus:border-teal-500 transition-colors"
                  >
                    <option value="">Select Category</option>
                    {parentCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Sub Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Sub Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subCategory}
                    onChange={e => handleSubCategoryChange(e.target.value)}
                    disabled={!category}
                    required
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none font-bold text-xs focus:border-teal-500 transition-colors disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-400"
                  >
                    <option value="">{category ? 'Select Sub Category' : 'Select Category First'}</option>
                    {availableSubCategories.map(s => (
                      <option key={s.id || s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                    {category && availableSubCategories.length === 0 && (
                      <option value="General" disabled>No subcategories under {category}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Row 2: Type (Complaint vs Feedback) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Ticket Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border-2 flex items-center gap-2.5 cursor-pointer transition-all ${
                    ticketType === 'Complaint' 
                      ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/30' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="ticketType"
                      checked={ticketType === 'Complaint'}
                      onChange={() => setTicketType('Complaint')}
                      className="accent-orange-600 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-orange-600" /> Complaint
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Report bugs, delays, or issues</p>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border-2 flex items-center gap-2.5 cursor-pointer transition-all ${
                    ticketType === 'Feedback' 
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="ticketType"
                      checked={ticketType === 'Feedback'}
                      onChange={() => setTicketType('Feedback')}
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Feedback
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Suggestions and improvements</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Row 3: Priority & Resolution Timelines */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  {subCategory && (
                    <span className="text-[10.5px] text-teal-600 dark:text-teal-400 font-bold">
                      Admin SLA for: <strong className="underline">{subCategory}</strong>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {(['Low', 'Medium', 'High'] as const).map(p => {
                    const rawVal = p === 'Low' 
                      ? activeSubItem?.low_timeline 
                      : p === 'Medium' 
                        ? activeSubItem?.medium_timeline 
                        : activeSubItem?.high_timeline
                    const formattedTime = formatTimeline(rawVal)
                    const isSelected = priority === p

                    return (
                      <label
                        key={p}
                        className={`flex flex-col gap-1 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? (p === 'Low' 
                                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20' 
                                : p === 'Medium' 
                                  ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20' 
                                  : 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20')
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name="priority"
                              value={p}
                              checked={isSelected}
                              onChange={() => setPriority(p)}
                              className="accent-teal-600 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{p}</span>
                          </div>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 pl-5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{formattedTime || (p === 'Low' ? '24 hours' : p === 'Medium' ? '12 hours' : '4 hours')}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>

                {/* SLA Notice */}
                <div className="flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900/50 text-[11px] font-semibold mt-0.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>
                    Your problem will be addressed within <strong className="font-black text-rose-900 dark:text-rose-100 underline decoration-rose-300 underline-offset-2">{activeTimeline}</strong>.
                  </span>
                </div>
              </div>

              {/* Row 4: Issue Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Issue Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Describe your issue or feedback in detail..."
                  value={issueBrief}
                  onChange={e => setIssueBrief(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold outline-none h-24 resize-none bg-white dark:bg-slate-900 text-xs focus:border-teal-500 transition-colors"
                  required
                />
              </div>

              {/* Row 5: Attachments */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Attachments
                  </label>
                  <span className="text-[10px] text-slate-400">Max size 50MB (PDF, PNG, JPG)</span>
                </div>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden focus-within:border-teal-500 transition-colors">
                  <input
                    type="text"
                    placeholder="Attach screenshot or file..."
                    value={attachedFiles}
                    onChange={e => setAttachedFiles(e.target.value)}
                    className="flex-1 px-3.5 py-2 outline-none bg-transparent font-semibold text-xs text-slate-800 dark:text-slate-200"
                  />
                  <button 
                    type="button"
                    className="px-3 py-2 border-l border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-teal-600 hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold" 
                    onClick={() => setAttachedFiles('error_screenshot.png')}
                    title="Mock file attachment"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs hover:shadow-sm text-xs transition-colors cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          TICKET DETAILS MODAL
      ════════════════════════════════════════════════════════════════ */}
      {selectedTicket && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150" 
          onClick={() => setSelectedTicket(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 duration-150 text-xs font-semibold text-slate-700 dark:text-slate-200" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                  #{selectedTicket.ticketId}
                </span>
                <h3 className="text-sm font-black text-slate-850 dark:text-white">Ticket Overview</h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Type</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedTicket.type}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Priority</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedTicket.priority}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Category</span>
                <span className="font-bold text-teal-600">{selectedTicket.category || 'General'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Sub Category</span>
                <span className="font-bold text-teal-600">{selectedTicket.subCategory || '—'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Status</span>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedTicket.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border transition-all mt-0.5 cursor-pointer ${
                    selectedTicket.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                  title="Click to toggle"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedTicket.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  {selectedTicket.status} (Click to toggle)
                </button>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Created At</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedTicket.createdAt}</span>
              </div>
            </div>

            {/* Description Card */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Issue Details</span>
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                {selectedTicket.description || 'No detailed description provided.'}
              </div>
            </div>

            {selectedTicket.attachedFiles && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Attachment</span>
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>{selectedTicket.attachedFiles}</span>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  handleDelete(selectedTicket.id)
                  setSelectedTicket(null)
                }}
                className="px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

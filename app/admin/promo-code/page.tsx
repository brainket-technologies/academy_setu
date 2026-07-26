'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Edit3, Trash2, Filter, Loader2, ChevronLeft, ChevronRight, Plus, X, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

const DISCOUNT_TYPES = ['Percentage', 'Fixed']
const APPLICABLE_BY_OPTIONS = ['Website Purchase', 'Only Admin', 'BDM', 'Manager']

interface PromoCode {
  id: string
  code: string
  description: string
  segment: string
  applicable_by: string
  applicable_one: boolean
  discount_name: string
  discount_type: string
  discount_value: string
  max_uses: number
  current_uses: number
  start_date: string | null
  has_expiry: boolean
  expiry_date: string | null
  status: string
  created_at: string
}

interface Segment {
  id: string
  name: string
}

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    return { date, time }
  } catch {
    return { date: dateStr, time: '' }
  }
}

const formatDateOnly = (dateStr: string | null) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function AllPromoCodePage() {
  const [items, setItems] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [segments, setSegments] = useState<Segment[]>([])

  // Pagination
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Search & Filter states (accordion)
  const [searchText, setSearchText] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterSegment, setFilterSegment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    segment: '', status: '', startDate: '', endDate: ''
  })

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form states
  const [formSegment, setFormSegment] = useState('')
  const [applicableBy, setApplicableBy] = useState('')
  const [applicableOne, setApplicableOne] = useState(false)
  const [discountName, setDiscountName] = useState('')
  const [code, setCode] = useState('')
  const [discountValue, setDiscountValue] = useState('')
  const [discountAmount, setDiscountAmount] = useState('Percentage')
  const [startDate, setStartDate] = useState('')
  const [hasExpiry, setHasExpiry] = useState(false)
  const [expiryDate, setExpiryDate] = useState('')

  // Delete modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchItems = useCallback(async (page = 1, search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) params.append('search', search)
      if (appliedFilters.segment) params.append('segment', appliedFilters.segment)
      if (appliedFilters.status) params.append('status', appliedFilters.status)
      if (appliedFilters.startDate) params.append('start_date', appliedFilters.startDate)
      if (appliedFilters.endDate) params.append('end_date', appliedFilters.endDate)
      const res = await fetch(`/api/admin/promo-code?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setItems(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
      } else {
        toast.error('Failed to load promo codes')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [appliedFilters])

  const fetchSegments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/segment')
      const data = await res.json()
      if (data.success) {
        setSegments(data.data)
      }
    } catch {
      // segments not critical
    }
  }, [])

  useEffect(() => {
    fetchItems(1, searchText)
  }, [appliedFilters])

  useEffect(() => {
    fetchSegments()
  }, [fetchSegments])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchItems(1, searchText)
  }

  const handleApplyFilters = () => {
    setAppliedFilters({ segment: filterSegment, status: filterStatus, startDate: filterStartDate, endDate: filterEndDate })
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilterSegment('')
    setFilterStatus('')
    setFilterStartDate('')
    setFilterEndDate('')
    setAppliedFilters({ segment: '', status: '', startDate: '', endDate: '' })
    setSearchText('')
    setCurrentPage(1)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormSegment('')
    setApplicableBy('')
    setApplicableOne(false)
    setDiscountName('')
    setCode('')
    setDiscountValue('')
    setDiscountAmount('Percentage')
    setStartDate('')
    setHasExpiry(false)
    setExpiryDate('')
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/promo-code/${deleteTargetId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Promo code deleted successfully')
        fetchItems(currentPage, searchText)
      } else {
        toast.error(data.error || 'Failed to delete promo code')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setDeleteLoading(false)
      setDeleteTargetId(null)
    }
  }

  const handleStartEdit = (item: PromoCode) => {
    setEditingId(item.id)
    setCode(item.code || '')
    setFormSegment(item.segment || '')
    setApplicableBy(item.applicable_by || '')
    setApplicableOne(!!item.applicable_one)
    setDiscountName(item.discount_name || '')
    setDiscountAmount(item.discount_type || 'Percentage')
    setDiscountValue(item.discount_value !== undefined && item.discount_value !== null ? String(item.discount_value) : '')
    setStartDate(item.start_date ? item.start_date.substring(0, 10) : '')
    setHasExpiry(!!item.has_expiry)
    setExpiryDate(item.expiry_date ? item.expiry_date.substring(0, 10) : '')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) { toast.error('Promo code is required'); return }
    if (!discountValue) { toast.error('Discount value is required'); return }

    setSubmitting(true)
    try {
      const url = editingId ? `/api/admin/promo-code/${editingId}` : '/api/admin/promo-code'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          description: '',
          segment: formSegment,
          applicable_by: applicableBy,
          applicable_one: applicableOne,
          discount_name: discountName,
          discount_type: discountAmount,
          discount_value: parseFloat(discountValue),
          max_uses: 0,
          start_date: startDate || null,
          has_expiry: hasExpiry,
          expiry_date: hasExpiry ? (expiryDate || null) : null,
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingId ? 'Promo code updated successfully!' : 'Promo code created successfully!')
        resetForm()
        fetchItems(currentPage, searchText)
      } else {
        toast.error(data.error || `Failed to ${editingId ? 'update' : 'create'} promo code`)
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const hasActiveFilters = appliedFilters.segment || appliedFilters.status || appliedFilters.startDate || appliedFilters.endDate
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endEntry = Math.min(currentPage * pageSize, totalCount)

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    <>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">

        {/* Title Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">All Promo Code</h1>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">

          {/* Top bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <form onSubmit={handleSearch} className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Code, Segment..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
              </form>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                  showFilters || hasActiveFilters
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                title="Filter"
              >
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create Promo Code
            </button>
          </div>

          {/* Filter Accordion */}
          {showFilters && (
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Segment</label>
                  <select value={filterSegment} onChange={(e) => setFilterSegment(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200">
                    <option value="">All Segments</option>
                    {segments.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200">
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Start Date</label>
                  <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">End Date</label>
                  <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200" />
                </div>
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <button onClick={handleApplyFilters} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer">Filter</button>
                <button onClick={handleClearFilters} className="px-6 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl font-bold text-sm transition-all cursor-pointer">Clear</button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Code</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Discount</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Segment</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Applicable By</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Uses</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Validity</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Status</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        Loading promo codes...
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No promo codes found.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const sNo = (currentPage - 1) * pageSize + idx + 1
                    const discountLabel = item.discount_type === 'Percentage'
                      ? `${item.discount_value}%`
                      : `₹${item.discount_value}`
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg text-xs uppercase tracking-wider">
                            {item.code}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">{discountLabel}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-sm">{item.segment || '—'}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-sm">{item.applicable_by || '—'}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-sm">
                          {item.current_uses}/{item.max_uses || '∞'}
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                          {item.start_date ? <>From: {formatDateOnly(item.start_date)}<br /></> : null}
                          {item.has_expiry && item.expiry_date ? <>Till: {formatDateOnly(item.expiry_date)}</> : item.has_expiry && !item.expiry_date ? 'Expiry set' : 'No expiry'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === 'Active'
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="w-7 h-7 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-7 h-7 flex items-center justify-center bg-red-100 dark:bg-red-900/40 hover:bg-red-200 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing {startEntry}-{endEntry} of {totalCount} Entries
              </p>
              <div className="flex items-center gap-1.5">
                <button disabled={currentPage === 1} onClick={() => fetchItems(1, searchText)} className="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 rounded-lg text-xs font-semibold bg-white">&lt;&lt;</button>
                <button disabled={currentPage === 1} onClick={() => fetchItems(currentPage - 1, searchText)} className="p-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 rounded-lg bg-white transition-colors cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((pg) => (
                  <button
                    key={pg}
                    onClick={() => fetchItems(pg, searchText)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      pg === currentPage
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                        : 'border border-slate-200 text-slate-600 hover:text-indigo-600 bg-white'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => fetchItems(currentPage + 1, searchText)} className="p-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 rounded-lg bg-white transition-colors cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button disabled={currentPage === totalPages} onClick={() => fetchItems(totalPages, searchText)} className="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 rounded-lg text-xs font-semibold bg-white">&gt;&gt;</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button onClick={resetForm} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-50 transition-all cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{editingId ? 'Edit Promo Code' : 'Create Promo Code'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Promo Code <span className="text-red-500">*</span></label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value)} required placeholder="E.g. SAVE20" className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase font-mono tracking-wider" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Discount Name</label>
                  <input type="text" value={discountName} onChange={e => setDiscountName(e.target.value)} placeholder="E.g. Summer Sale" className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Segment</label>
                  <select value={formSegment} onChange={e => setFormSegment(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    <option value="">Select Segment</option>
                    {segments.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Applicable By</label>
                  <select value={applicableBy} onChange={e => setApplicableBy(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    <option value="">Select Option</option>
                    {APPLICABLE_BY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Discount Type</label>
                  <select value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    {DISCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Discount Value <span className="text-red-500">*</span></label>
                  <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} required min="0" step="0.01" placeholder={discountAmount === 'Percentage' ? '20' : '500'} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    Has Expiry
                    <input type="checkbox" checked={hasExpiry} onChange={e => setHasExpiry(e.target.checked)} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                  </label>
                  {hasExpiry && (
                    <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <input type="checkbox" id="applicableOne" checked={applicableOne} onChange={e => setApplicableOne(e.target.checked)} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                <label htmlFor="applicableOne" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Applicable only once per user</label>
              </div>
              <button type="submit" disabled={submitting} className="mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Promo Code' : 'Create Promo Code'}
              </button>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Promo Code"
        description="Are you sure you want to delete this promo code? This action cannot be undone."
      />
    </>
  )
}

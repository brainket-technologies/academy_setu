'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Search, Edit3, Trash2, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [searchText, setSearchText] = useState('')
  const [filterSegment, setFilterSegment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [segments, setSegments] = useState<Segment[]>([])

  const [submitting, setSubmitting] = useState(false)
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
  const [editingId, setEditingId] = useState<string | null>(null)

  // Delete modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchItems = useCallback(async (page = 1, search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) params.append('search', search)
      if (filterSegment) params.append('segment', filterSegment)
      if (filterStatus) params.append('status', filterStatus)
      if (filterStartDate) params.append('start_date', filterStartDate)
      if (filterEndDate) params.append('end_date', filterEndDate)
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
  }, [filterSegment, filterStatus, filterStartDate, filterEndDate])

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
    fetchItems(1, '')
    fetchSegments()
  }, [fetchItems, fetchSegments])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchItems(1, searchText)
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">

        {/* Title Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">All Promo Code</h1>
        </div>

        {/* Create Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-7">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {editingId ? 'Edit Promo Code' : 'Create Promo Code'}
            </h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Segment</label>
                  <select
                    value={formSegment}
                    onChange={e => setFormSegment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Select Segment</option>
                    {segments.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Applicable By</label>
                  <select
                    value={applicableBy}
                    onChange={e => setApplicableBy(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Select</option>
                    {APPLICABLE_BY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Applicable One</label>
                  <label className="flex items-center gap-3 mt-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!applicableOne}
                      onChange={e => setApplicableOne(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">One time use only</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Discount Name</label>
                  <input
                    type="text"
                    value={discountName}
                    onChange={e => setDiscountName(e.target.value)}
                    placeholder="e.g. Welcome Discount"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Promo Code<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Discount Amount<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="flex items-center gap-6 mt-2.5">
                    {DISCOUNT_TYPES.map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
                        <input
                          type="radio"
                          name="discount_amount"
                          value={opt}
                          checked={discountAmount === opt}
                          onChange={() => setDiscountAmount(opt)}
                          className="text-teal-600 focus:ring-teal-500 w-4 h-4"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Discount Value<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    placeholder={discountAmount === 'Percentage' ? 'e.g. 10' : 'e.g. 500'}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Expiry</label>
                  <div className="flex items-center gap-3 mt-2.5">
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={!!hasExpiry}
                        onChange={e => setHasExpiry(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      Has Expiry
                    </label>
                    {hasExpiry && (
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={e => setExpiryDate(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
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
                  }}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-600/10 cursor-pointer flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
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
                  placeholder="Search by Code"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </form>
              <button
                onClick={() => {
                  setFilterSegment('')
                  setFilterStatus('')
                  setFilterStartDate('')
                  setFilterEndDate('')
                }}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 border border-slate-200 dark:border-slate-600 rounded-xl transition-colors cursor-pointer"
                title="Clear Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filterSegment}
              onChange={(e) => setFilterSegment(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
            >
              <option value="">All Segments</option>
              {segments.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
            />

            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
            />
          </div>

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
                        <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
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
                    const { date, time } = formatDate(item.created_at)
                    const discountLabel = item.discount_type === 'Percentage'
                      ? `${item.discount_value}%`
                      : `₹${item.discount_value}`
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-lg text-xs uppercase tracking-wider">
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
                              className="w-7 h-7 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-7 h-7 flex items-center justify-center bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
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
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchItems(1, searchText)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'<<'}
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchItems(currentPage - 1, searchText)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((pg) => (
                  <button
                    key={pg}
                    onClick={() => fetchItems(pg, searchText)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      pg === currentPage
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25'
                        : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => fetchItems(currentPage + 1, searchText)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => fetchItems(totalPages, searchText)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'>>'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Promo Code"
        description="Are you sure you want to delete this promo code? This action cannot be undone."
      />
    </AdminLayout>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Loader2, Edit3, Trash2, RotateCcw, Calendar, Clock, 
  ChevronLeft, ChevronRight, CheckSquare, Square, Search, X, Filter, ChevronUp, Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface TicketCategory {
  id: string
  name: string
  parent_category: string
  segment: string
  low_timeline: string
  medium_timeline: string
  high_timeline: string
  is_deleted: boolean
  created_at: string
}

interface MetaCounts {
  active: number
  deleted: number
}

const PARENT_OPTIONS = ['Students', 'Teacher', 'Employee', 'Billing', 'Technical', 'Account', 'Other']

export default function TicketCategoryPage() {
  const [categories, setCategories] = useState<TicketCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'deleted'>('all')
  const [counts, setCounts] = useState<MetaCounts>({ active: 0, deleted: 0 })
  const [segments, setSegments] = useState<{ id: string; name: string }[]>([])

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Form states
  const [parentCategory, setParentCategory] = useState('')
  const [name, setName] = useState('')
  const [segment, setSegment] = useState('')
  const [lowTimeline, setLowTimeline] = useState('')
  const [mediumTimeline, setMediumTimeline] = useState('')
  const [highTimeline, setHighTimeline] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Delete modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [permanentDelete, setPermanentDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Search & Filter states
  const [searchText, setSearchText] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')

  const fetchCategories = useCallback(async (tabStatus = activeTab) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('tab', tabStatus === 'deleted' ? 'deleted' : 'all')
      if (searchText) queryParams.append('search', searchText)
      if (appliedStartDate) queryParams.append('start_date', appliedStartDate)
      if (appliedEndDate) queryParams.append('end_date', appliedEndDate)

      const res = await fetch(`/api/admin/ticket-category?${queryParams.toString()}`)
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
        if (data.meta && data.meta.counts) {
          setCounts(data.meta.counts)
        }
      } else {
        toast.error('Failed to load categories')
      }
    } catch {
      toast.error('Something went wrong loading categories')
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchText, appliedStartDate, appliedEndDate])

  useEffect(() => {
    fetchCategories(activeTab)
  }, [fetchCategories, activeTab])

  // Fetch real segments from DB on mount
  useEffect(() => {
    fetch('/api/admin/segment')
      .then(r => r.json())
      .then(data => { if (data.success) setSegments(data.data) })
      .catch(() => {})
  }, [])

  const handleApplyFilters = () => {
    setAppliedStartDate(filterStartDate)
    setAppliedEndDate(filterEndDate)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilterStartDate('')
    setFilterEndDate('')
    setAppliedStartDate('')
    setAppliedEndDate('')
    setSearchText('')
    setCurrentPage(1)
  }

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setParentCategory('')
    setSegment('')
    setLowTimeline('')
    setMediumTimeline('')
    setHighTimeline('')
    setIsCreateModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        name, parent_category: parentCategory, segment,
        low_timeline: lowTimeline, medium_timeline: mediumTimeline, high_timeline: highTimeline
      }

      const url = editingId ? `/api/admin/ticket-category/${editingId}` : '/api/admin/ticket-category'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingId ? 'Category updated' : 'Category created')
        resetForm()
        fetchCategories(activeTab)
      } else {
        toast.error(data.error || 'Failed to save')
      }
    } catch {
      toast.error('Something went wrong saving category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartEdit = (cat: TicketCategory) => {
    setEditingId(cat.id)
    setName(cat.name)
    setParentCategory(cat.parent_category || '')
    setSegment(cat.segment || '')
    setLowTimeline(cat.low_timeline || '')
    setMediumTimeline(cat.medium_timeline || '')
    setHighTimeline(cat.high_timeline || '')
    setIsCreateModalOpen(true)
  }

  const handleDeleteClick = (id: string, isSoftDeleted: boolean) => {
    setDeleteTargetId(id)
    setPermanentDelete(isSoftDeleted)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/ticket-category/${deleteTargetId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(permanentDelete ? 'Category permanently deleted' : 'Category moved to trash')
        fetchCategories(activeTab)
      } else {
        toast.error(data.error || 'Failed to delete category')
      }
    } catch {
      toast.error('Error occurred deleting category')
    } finally {
      setDeleteLoading(false)
      setDeleteTargetId(null)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ticket-category/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_deleted: false, name: 'dummy' }) 
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Category restored successfully!')
        fetchCategories(activeTab)
      } else {
        toast.error(data.error || 'Failed to restore category')
      }
    } catch {
      toast.error('Error occurred restoring category')
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCategories(activeTab)
  }

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      return { date, time }
    } catch {
      return { date: dateStr, time: '' }
    }
  }

  const totalCount = categories.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endEntry = Math.min(currentPage * pageSize, totalCount)
  const paginatedCategories = categories.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getPageNumbers = () => {
    const pages: number[] = []
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  return (
    <>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Title Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">Ticket Category</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure support categories, timelines, and trash recovery</p>
        </div>

        {/* Tab Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-700 pb-4">
            <button
              onClick={() => { setActiveTab('all'); setCurrentPage(1) }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'all' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              All Categories
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300'}`}>
                {counts.active}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab('deleted'); setCurrentPage(1) }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'deleted' 
                  ? 'bg-rose-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Trash List
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'deleted' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300'}`}>
                {counts.deleted}
              </span>
            </button>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                />
              </form>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                  showFilters || appliedStartDate || appliedEndDate
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                title="Filter"
              >
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
              </button>
            </div>
            
            {activeTab === 'all' && (
              <button
                onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Create Subcategory
              </button>
            )}
          </div>

          {/* Filter Accordion */}
          {showFilters && (
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer"
                  >
                    Filter
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl font-bold text-sm transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table Area */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl mt-2">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Parent Category</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Category Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Segment</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Timelines (L/M/H)</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Created At</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        Loading categories...
                      </div>
                    </td>
                  </tr>
                ) : paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((cat, index) => {
                    const sNo = startEntry + index
                    const { date, time } = formatDateTime(cat.created_at)
                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-500">{sNo}.</td>
                        <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">{cat.parent_category || '-'}</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-200">{cat.name}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-md font-medium">
                            {cat.segment || '-'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex justify-center gap-1.5 text-xs font-bold font-mono">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">{cat.low_timeline || '-'}</span>
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">{cat.medium_timeline || '-'}</span>
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded">{cat.high_timeline || '-'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-xs font-semibold leading-relaxed whitespace-nowrap">
                          <div className="flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5"/> {date}</div>
                          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {time}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {!cat.is_deleted ? (
                              <>
                                <button onClick={() => handleStartEdit(cat)} className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200" title="Edit">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteClick(cat.id, false)} className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Move to Trash">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleRestore(cat.id)} className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200" title="Restore">
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteClick(cat.id, true)} className="w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300" title="Permanently Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
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
              <p className="text-xs font-medium text-slate-500">
                Showing {startEntry} to {endEntry} of {totalCount} Entries
              </p>
              <div className="flex items-center gap-1.5">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 rounded-lg text-xs font-semibold bg-white">&lt;&lt;</button>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 rounded-lg text-xs font-semibold bg-white">&lt;</button>
                {getPageNumbers().map((pg) => (
                  <button key={pg} onClick={() => setCurrentPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${pg === currentPage ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:text-indigo-600 bg-white'}`}>
                    {pg}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 rounded-lg text-xs font-semibold bg-white">&gt;</button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 rounded-lg text-xs font-semibold bg-white">&gt;&gt;</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal Popup */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button onClick={resetForm} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-50 transition-all cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{editingId ? 'Edit Subcategory' : 'Create Subcategory'}</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Parent Category <span className="text-red-500">*</span></label>
                  <select value={parentCategory} onChange={(e) => setParentCategory(e.target.value)} required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    <option value="">Select an Option</option>
                    {PARENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Segment <span className="text-red-500">*</span></label>
                  <select value={segment} onChange={(e) => setSegment(e.target.value)} required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    <option value="">Select an Option</option>
                    {segments.map(seg => <option key={seg.id} value={seg.name}>{seg.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                <h4 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">Timeline Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Low Timeline</label>
                    <input type="text" value={lowTimeline} onChange={(e) => setLowTimeline(e.target.value)} placeholder="Ex: 24 hrs" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Medium Timeline</label>
                    <input type="text" value={mediumTimeline} onChange={(e) => setMediumTimeline(e.target.value)} placeholder="Ex: 12 hrs" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">High Timeline</label>
                    <input type="text" value={highTimeline} onChange={(e) => setHighTimeline(e.target.value)} placeholder="Ex: 4 hrs" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Subcategory' : 'Create Subcategory'}
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
        title={permanentDelete ? "Permanent Delete Category" : "Move to Trash"}
        description={permanentDelete ? "Are you sure you want to permanently delete this category? This action cannot be undone." : "Are you sure you want to move this category to the trash? It can be restored later."}
      />
    </>
  )
}

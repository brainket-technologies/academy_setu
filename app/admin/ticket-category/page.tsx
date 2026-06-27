'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Loader2, Edit3, Trash2, RotateCcw, Calendar, Clock, 
  ChevronLeft, ChevronRight, CheckSquare, Square
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
const SEGMENT_OPTIONS = ['School', 'College', 'Coaching', '10/01/2026', 'Other']

export default function TicketCategoryPage() {
  const [categories, setCategories] = useState<TicketCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'deleted'>('all')
  const [counts, setCounts] = useState<MetaCounts>({ active: 0, deleted: 0 })

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

  const fetchCategories = useCallback(async (tabStatus = activeTab) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/ticket-category?tab=${tabStatus === 'deleted' ? 'deleted' : 'all'}`)
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
  }, [activeTab])

  useEffect(() => {
    fetchCategories(activeTab)
  }, [fetchCategories, activeTab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!parentCategory) {
      toast.error('Parent Category is required')
      return
    }
    if (!segment) {
      toast.error('Segment is required')
      return
    }

    setSubmitting(true)
    try {
      const url = editingId ? `/api/admin/ticket-category/${editingId}` : '/api/admin/ticket-category'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          parent_category: parentCategory,
          segment,
          low_timeline: lowTimeline.trim(),
          medium_timeline: mediumTimeline.trim(),
          high_timeline: highTimeline.trim()
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingId ? 'Category updated successfully!' : 'Category created successfully!')
        // Reset form
        setName('')
        setParentCategory('')
        setSegment('')
        setLowTimeline('')
        setMediumTimeline('')
        setHighTimeline('')
        setEditingId(null)
        fetchCategories(activeTab)
      } else {
        toast.error(data.error || 'Failed to save category')
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setName('')
    setParentCategory('')
    setSegment('')
    setLowTimeline('')
    setMediumTimeline('')
    setHighTimeline('')
  }

  const handleDeleteClick = (id: string, isSoftDeleted: boolean) => {
    setDeleteTargetId(id)
    setPermanentDelete(isSoftDeleted)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/ticket-category/${deleteTargetId}`, {
        method: 'DELETE'
      })
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
        body: JSON.stringify({ is_deleted: false, name: 'dummy' }) // name dummy is handled by backend dynamic updates
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

  // Format Date & Time for created_at column
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

  // Pagination helpers
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
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Title Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">Ticket Category</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure support categories, timelines, and trash recovery</p>
        </div>

        {/* Top Panel Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Primary Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Parent Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  Parent Category<span className="text-red-500">*</span>
                </label>
                <select
                  value={parentCategory}
                  onChange={(e) => setParentCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="">Select an Option</option>
                  {PARENT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-550/20 focus:border-teal-550 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Segment */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  Segment<span className="text-red-500">*</span>
                </label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="">Select Segment</option>
                  {SEGMENT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SLA Priority Section Divider */}
            <div className="flex items-center gap-4 my-1">
              <span className="text-xs font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wider shrink-0">Priority</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Timelines Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Low Timeline */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  Low Timeline<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Low Timeline"
                  value={lowTimeline}
                  onChange={(e) => setLowTimeline(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Medium Timeline */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  Medium Timeline<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Medium Timeline"
                  value={mediumTimeline}
                  onChange={(e) => setMediumTimeline(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  required
                />
              </div>

              {/* High Timeline */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  High Timeline<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter High Timeline"
                  value={highTimeline}
                  onChange={(e) => setHighTimeline(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Actions Submit / Cancel */}
            <div className="flex justify-center md:justify-end gap-3 mt-1">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-10 py-2.5 bg-[#0F9E8F] hover:bg-[#0D8E80] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-500/10 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Card: Table & Navigation */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
          
          {/* Custom Toggle tabs matching screenshot */}
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-3">
            {/* All Category Tab */}
            <button
              onClick={() => {
                setActiveTab('all')
                setCurrentPage(1)
              }}
              className={`px-5 py-2.5 rounded-xl border flex items-center gap-3 text-xs font-black transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#0B9688] border-[#0B9688] text-white shadow-md shadow-teal-500/10'
                  : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
              }`}
            >
              {activeTab === 'all' ? (
                <CheckSquare className="w-4 h-4 text-white font-black" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 font-black" />
              )}
              All Category
              <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${
                activeTab === 'all' 
                  ? 'bg-white text-[#0B9688]' 
                  : 'bg-[#0B9688] text-white'
              }`}>
                {String(counts.active).padStart(2, '0')}
              </span>
            </button>

            {/* Deleted Category Tab */}
            <button
              onClick={() => {
                setActiveTab('deleted')
                setCurrentPage(1)
              }}
              className={`px-5 py-2.5 rounded-xl border flex items-center gap-3 text-xs font-black transition-all cursor-pointer ${
                activeTab === 'deleted'
                  ? 'bg-[#0B9688] border-[#0B9688] text-white shadow-md shadow-teal-500/10'
                  : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
              }`}
            >
              {activeTab === 'deleted' ? (
                <CheckSquare className="w-4 h-4 text-white font-black" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 font-black" />
              )}
              Deleted Category
              <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${
                activeTab === 'deleted' 
                  ? 'bg-white text-[#0B9688]' 
                  : 'bg-[#0B9688] text-white'
              }`}>
                {String(counts.deleted).padStart(2, '0')}
              </span>
            </button>
          </div>

          {/* Categories Log Table */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-16">S. No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Parent Category</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Segment</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Timeline</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Created At</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#0B9688]" />
                        Loading categories...
                      </div>
                    </td>
                  </tr>
                ) : paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No categories found in this tab.
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((cat, idx) => {
                    const sNo = (currentPage - 1) * pageSize + idx + 1
                    const { date, time } = formatDateTime(cat.created_at)
                    return (
                      <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-550 dark:text-slate-400">{sNo}.</td>
                        <td className="px-5 py-4 text-slate-800 dark:text-slate-100 font-semibold">{cat.name}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-sm">{cat.parent_category || '—'}</td>
                        <td className="px-5 py-4 text-slate-650 dark:text-slate-400 text-sm font-semibold">{cat.segment || '—'}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold">
                          {cat.low_timeline ? `${cat.low_timeline}` : '—'}
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            {date}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            {time}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {cat.is_deleted ? (
                              <>
                                {/* Restore Button */}
                                <button
                                  onClick={() => handleRestore(cat.id)}
                                  className="w-7 h-7 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                                  title="Restore Category"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                                {/* Permanent Delete Button */}
                                <button
                                  onClick={() => handleDeleteClick(cat.id, true)}
                                  className="w-7 h-7 flex items-center justify-center bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-500 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Permanently"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                {/* Edit Button */}
                                <button
                                  onClick={() => handleStartEdit(cat)}
                                  className="w-7 h-7 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Category"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {/* Soft Delete Button */}
                                <button
                                  onClick={() => handleDeleteClick(cat.id, false)}
                                  className="w-7 h-7 flex items-center justify-center bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-500 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                                  title="Move to Trash"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

          {/* Pagination Footer */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
              <p className="text-xs font-semibold text-slate-550 dark:text-slate-400">
                Showing {startEntry}-{endEntry} of {totalCount} Entries
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-550 dark:text-slate-405 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'<<'}
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-555 dark:text-slate-405 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      pg === currentPage
                        ? 'bg-[#0B9688] text-white shadow-sm'
                        : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-555 dark:text-slate-405 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-555 dark:text-slate-405 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
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
        title={permanentDelete ? "Permanently Delete Category" : "Move Category to Trash"}
        description={
          permanentDelete 
            ? "Are you sure you want to permanently delete this category? This action cannot be undone."
            : "Are you sure you want to delete this category? It will be moved to the Deleted Category tab where you can restore it later."
        }
      />
    </AdminLayout>
  )
}

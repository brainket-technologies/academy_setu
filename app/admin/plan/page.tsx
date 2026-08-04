'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Plus, Edit3, Trash2, Filter, Loader2, ChevronLeft, ChevronRight, ChevronUp, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'
import { CopyPlanModal } from '@/components/CopyPlanModal'

interface Plan {
  id: string
  plan_name: string
  segment: string
  applied_by: string
  plan_for: string
  status: string
  created_at: string
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

export default function AllPlanPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('')
  const [segments, setSegments] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Delete modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Copy modal states
  const [copyTargetId, setCopyTargetId] = useState<string | null>(null)
  const [copyTargetName, setCopyTargetName] = useState('')
  const [copyLoading, setCopyLoading] = useState(false)

  const [showFilters, setShowFilters] = useState(false)
  const [filterSegment, setFilterSegment] = useState('')

  const fetchPlans = async (page: number, search: string, segment: string) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('pageSize', pageSize.toString())
      if (search) queryParams.append('search', search)
      if (segment) queryParams.append('segment', segment)

      const response = await fetch(`/api/admin/plan?${queryParams.toString()}`)
      const resData = await response.json()
      if (resData.success) {
        setPlans(resData.data)
        setTotalCount(resData.meta.totalCount)
        setTotalPages(resData.meta.totalPages)
        setCurrentPage(page)
      } else {
        toast.error('Failed to load plans')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Something went wrong loading plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans(1, '', '')
  }, [])

  // Fetch distinct segments on mount
  useEffect(() => {
    fetch('/api/admin/plan?segments=true')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSegments(data.data)
      })
      .catch(() => {})
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPlans(1, searchText, segmentFilter)
  }

  const handleApplyFilters = () => {
    setSegmentFilter(filterSegment)
    setCurrentPage(1)
    fetchPlans(1, searchText, filterSegment)
  }

  const handleClearFilters = () => {
    setFilterSegment('')
    setSegmentFilter('')
    setSearchText('')
    setCurrentPage(1)
    fetchPlans(1, '', '')
  }

  const handleDelete = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/plan/${deleteTargetId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Plan deleted successfully')
        fetchPlans(currentPage, searchText, segmentFilter)
      } else {
        toast.error(data.error || 'Failed to delete plan')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setDeleteLoading(false)
      setDeleteTargetId(null)
    }
  }

  const handleConfirmCopy = async (newName: string) => {
    if (!copyTargetId) return
    setCopyLoading(true)
    try {
      const res = await fetch(`/api/admin/plan/${copyTargetId}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_plan_name: newName })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Plan copied successfully')
        fetchPlans(currentPage, searchText, segmentFilter)
      } else {
        toast.error(data.error || 'Failed to copy plan')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCopyLoading(false)
      setCopyTargetId(null)
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
    <>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">

        {/* Title Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">All Plan</h1>
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
                  placeholder="Search by Segment, Plan Name..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </form>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                  showFilters || segmentFilter
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                title="Filter"
              >
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
              </button>
            </div>
            <Link
              href="/admin/plan/create"
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create Plan
            </Link>
          </div>

          {/* Filter Accordion */}
          {showFilters && (
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Segment</label>
                  <select
                    value={filterSegment}
                    onChange={(e) => setFilterSegment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                  >
                    <option value="">All Segments</option>
                    {segments.map((seg) => (
                      <option key={seg} value={seg}>{seg}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2 md:col-start-3">
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

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Plan Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Segment Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Created At</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        Loading plans...
                      </div>
                    </td>
                  </tr>
                ) : plans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No plans found.
                    </td>
                  </tr>
                ) : (
                  plans.map((plan, idx) => {
                    const sNo = (currentPage - 1) * pageSize + idx + 1
                    const { date, time } = formatDate(plan.created_at)
                    return (
                      <tr key={plan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                        <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">{plan.plan_name}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{plan.segment}</td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                          📅 {date}<br />🕒 {time}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setCopyTargetId(plan.id)
                                setCopyTargetName(plan.plan_name)
                              }}
                              className="w-7 h-7 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                              title="Copy Plan"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/admin/plan/${plan.id}/edit`}
                              className="w-7 h-7 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(plan.id)}
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
                  onClick={() => fetchPlans(1, searchText, segmentFilter)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'<<'}
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchPlans(currentPage - 1, searchText, segmentFilter)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((pg) => (
                  <button
                    key={pg}
                    onClick={() => fetchPlans(pg, searchText, segmentFilter)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      pg === currentPage
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                        : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => fetchPlans(currentPage + 1, searchText, segmentFilter)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => fetchPlans(totalPages, searchText, segmentFilter)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
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
        title="Delete Plan"
        description="Are you sure you want to delete this plan? This action cannot be undone."
      />

      <CopyPlanModal
        isOpen={copyTargetId !== null}
        onClose={() => setCopyTargetId(null)}
        onConfirm={handleConfirmCopy}
        originalPlanName={copyTargetName}
        loading={copyLoading}
      />
    </>
  )
}

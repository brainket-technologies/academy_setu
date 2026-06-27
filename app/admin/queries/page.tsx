'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Search, Loader2, Edit3, Trash2, X,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface Query {
  id: string
  name: string
  mobile_no: string
  email: string
  query_for: string
  message: string
  response_message: string
  status: string
  created_at: string
}

export default function AllQueriesPage() {
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)

  // Search
  const [searchText, setSearchText] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Response modal
  const [responseModal, setResponseModal] = useState<Query | null>(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [submittingResponse, setSubmittingResponse] = useState(false)

  // Delete modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchQueries = useCallback(async (page = 1, search = '', status = '', startDate = '', endDate = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      })
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const res = await fetch(`/api/admin/queries?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setQueries(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
      } else {
        toast.error('Failed to load queries')
      }
    } catch {
      toast.error('Error loading queries')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQueries(currentPage, searchText, statusFilter, startDate, endDate)
  }, [currentPage, searchText, statusFilter, startDate, endDate, fetchQueries])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchText(searchInput)
    setCurrentPage(1)
  }

  const handleOpenResponse = (query: Query) => {
    setResponseModal(query)
    setResponseMessage(query.response_message || '')
  }

  const handleCloseResponse = () => {
    setResponseModal(null)
    setResponseMessage('')
  }

  const handleClearResponse = () => {
    setResponseMessage('')
  }

  const handleSubmitResponse = async () => {
    if (!responseModal) return
    if (!responseMessage.trim()) {
      toast.error('Response Message is required')
      return
    }

    setSubmittingResponse(true)
    try {
      const res = await fetch(`/api/admin/queries/${responseModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_message: responseMessage.trim() })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Response submitted successfully!')
        handleCloseResponse()
        fetchQueries(currentPage, searchText, statusFilter, startDate, endDate)
      } else {
        toast.error(data.error || 'Failed to submit response')
      }
    } catch {
      toast.error('Something went wrong submitting response')
    } finally {
      setSubmittingResponse(false)
    }
  }

  const handleDeleteClick = (id: string) => setDeleteTargetId(id)

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/queries/${deleteTargetId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Query deleted successfully')
        fetchQueries(currentPage, searchText, statusFilter, startDate, endDate)
      } else {
        toast.error(data.error || 'Failed to delete query')
      }
    } catch {
      toast.error('Error deleting query')
    } finally {
      setDeleteLoading(false)
      setDeleteTargetId(null)
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
        {/* Title Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">All Queries</h1>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
          
          {/* Search bar - right aligned matching mockup */}
          <div className="flex justify-end">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search By Name, Mb. no., Email"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm w-72 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
            </form>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                className="px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Responded">Responded</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1) }}
                className="px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
              />
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1) }}
                className="px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-16">S. No.</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Name</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Mobile No.</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Email</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Query For</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 max-w-xs">Message</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-32">Status</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2 font-medium">
                        <Loader2 className="w-5 h-5 animate-spin text-[#0E9485]" />
                        Loading queries...
                      </div>
                    </td>
                  </tr>
                ) : queries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No queries found.
                    </td>
                  </tr>
                ) : (
                  queries.map((query, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1
                    const isResponded = query.status === 'Responded'
                    return (
                      <tr key={query.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-550 dark:text-slate-450">{rowNum}.</td>
                        <td className="px-5 py-4 text-slate-800 dark:text-slate-100 font-semibold">{query.name}</td>
                        <td className="px-5 py-4 text-slate-650 dark:text-slate-300 font-medium text-sm">{query.mobile_no}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-sm">{query.email}</td>
                        <td className="px-5 py-4 text-slate-650 dark:text-slate-300 text-sm font-semibold">{query.query_for}</td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs">
                          <span className="line-clamp-2">{query.message}</span>
                        </td>
                        <td className="px-5 py-4">
                          {isResponded ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                              Responded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {!isResponded && (
                              <button
                                onClick={() => handleOpenResponse(query)}
                                title="Respond"
                                className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClick(query.id)}
                              title="Delete"
                              className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
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

          {/* Pagination Controls */}
          {!loading && queries.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4 flex-wrap gap-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Showing {startEntry}-{endEntry} of {totalCount} Entries
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === num
                        ? 'bg-[#0F9E8F] text-white shadow-md shadow-teal-500/10'
                        : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {responseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseResponse() }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col gap-5 p-7 relative">
            {/* Close button */}
            <button
              onClick={handleCloseResponse}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Query For + Message row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Query For */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Query For</label>
                <input
                  type="text"
                  value={responseModal.query_for}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-not-allowed focus:outline-none"
                />
              </div>
              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Message</label>
                <input
                  type="text"
                  value={responseModal.message}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none truncate"
                  title={responseModal.message}
                />
              </div>
            </div>

            {/* Response Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Response Message</label>
              <textarea
                rows={5}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Type your response here..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={handleClearResponse}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSubmitResponse}
                disabled={submittingResponse}
                className="px-8 py-2.5 bg-[#0F9E8F] hover:bg-[#0D8E80] disabled:bg-slate-300 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-500/10 flex items-center gap-2 cursor-pointer"
              >
                {submittingResponse && <Loader2 className="w-4 h-4 animate-spin" />}
                Response
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Query"
        description="Are you sure you want to delete this query? This action cannot be undone."
      />
    </AdminLayout>
  )
}

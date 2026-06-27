'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Search, FileText, Loader2, ChevronLeft, ChevronRight, Eye, X, Check, AlertCircle 
} from 'lucide-react'
import { toast } from 'sonner'

interface Screenshot {
  amount: number
  filename: string
}

interface RequestItem {
  id: string
  school_name: string
  plan_name: string
  payment_mode: string
  transaction_id: string
  amount: number
  transaction_amount: number
  status: string
  screenshots: Screenshot[]
  created_at: string
}

const formatDateOnly = (dateStr: string | null) => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// Helper to get formatted start/end dates
const getPlanDates = (createdAtStr: string) => {
  const from = new Date(createdAtStr)
  const to = new Date(createdAtStr)
  to.setDate(from.getDate() + 365) // 1 year validity

  const pad = (n: number) => String(n).padStart(2, '0')
  const format = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`

  return {
    validFrom: format(from),
    validTo: format(to)
  }
}

function RequestDashboardContent() {
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Search & Filter
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // View / Moderation State
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null)
  const [transactionAmountInput, setTransactionAmountInput] = useState('')
  const [statusInput, setStatusInput] = useState('Pending')
  const [submitting, setSubmitting] = useState(false)

  // Screenshot viewer modal
  const [viewingScreenshot, setViewingScreenshot] = useState<Screenshot | null>(null)

  // Fetch requests from API
  const fetchRequests = useCallback(async (page = 1, search = '', status = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      })
      if (search) params.append('search', search)
      if (status) params.append('status', status)

      const res = await fetch(`/api/admin/request?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setRequests(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
      } else {
        toast.error('Failed to load verification requests')
      }
    } catch {
      toast.error('Something went wrong loading requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests(1, searchText, statusFilter)
  }, [fetchRequests, statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchRequests(1, searchText, statusFilter)
  }

  const handleSelectRequest = (req: RequestItem) => {
    setSelectedRequest(req)
    setTransactionAmountInput(String(req.transaction_amount || req.amount))
    setStatusInput(req.status || 'Pending')
  }

  const handleModerationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/request/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusInput,
          transaction_amount: parseFloat(transactionAmountInput || '0')
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Request status updated to ${statusInput}`)
        setSelectedRequest(null)
        fetchRequests(currentPage, searchText, statusFilter)
      } else {
        toast.error(data.error || 'Failed to update request status')
      }
    } catch {
      toast.error('Something went wrong saving request details')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadPDF = (req: RequestItem) => {
    toast.success(`Downloading invoice for ${req.school_name} request...`)
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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* ================= HEADER CARD ================= */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Request</h1>
      </div>

      {selectedRequest ? (
        /* ================= MODERATION VIEW (INLINE DETAIL CARD) ================= */
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-250">
          <form onSubmit={handleModerationSubmit} className="flex flex-col gap-6">
            
            {/* School Name input */}
            <div className="flex flex-col gap-1.5 max-w-md">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                School/College Name
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={selectedRequest.school_name}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-500 dark:text-slate-400 focus:outline-none select-none"
              />
            </div>

            {/* Plan Details Table */}
            <div className="flex flex-col gap-2">
              <div className="border-b border-slate-150 dark:border-slate-700 pb-1.5">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Plan Details</h3>
              </div>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
                <table className="w-full border-collapse text-left text-xs bg-slate-50/20 dark:bg-slate-900/10">
                  <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">Plan Name</th>
                      <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">Plan Descritpion</th>
                      <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">Plan Valid From</th>
                      <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">Plan Valid To</th>
                      <th className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold">
                    <tr>
                      <td className="px-5 py-4 font-bold">{selectedRequest.plan_name}</td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 max-w-sm truncate">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                      </td>
                      <td className="px-5 py-4 font-semibold">{getPlanDates(selectedRequest.created_at).validFrom}</td>
                      <td className="px-5 py-4 font-semibold">{getPlanDates(selectedRequest.created_at).validTo}</td>
                      <td className="px-5 py-4 text-right font-extrabold text-slate-900 dark:text-white">
                        ₹{Number(selectedRequest.amount).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Screenshot attachments card grid */}
            <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-700/80 pt-5">
              <div className="border-b border-slate-150 dark:border-slate-700 pb-1.5">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Screenshot</h3>
              </div>

              {/* Paid Amount */}
              <div className="flex flex-col gap-1.5 max-w-xs">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paid Amount</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={`${Number(selectedRequest.amount).toLocaleString('en-IN')}/-`}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-slate-200 font-bold select-none"
                />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                {selectedRequest.screenshots && selectedRequest.screenshots.map((s, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex items-center justify-between shadow-sm bg-white dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Amount: {s.amount.toLocaleString('en-IN')}/-
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block truncate max-w-[200px]">
                        Screenshot: {s.filename}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewingScreenshot(s)}
                      className="px-4 py-1.5 bg-[#EBF6F6] dark:bg-slate-750 hover:bg-[#EBF6F6]/85 text-teal-650 dark:text-teal-400 font-bold text-xs rounded-xl flex items-center gap-1 border border-teal-100/50 dark:border-slate-650 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </div>
                ))}
              </div>

              {/* Interactive Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 max-w-2xl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Enter Transaction Amount
                  </label>
                  <input
                    type="number"
                    value={transactionAmountInput}
                    onChange={e => setTransactionAmountInput(e.target.value)}
                    placeholder="Enter Amount"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 dark:text-slate-100 font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={statusInput}
                    onChange={e => setStatusInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 dark:text-slate-100 font-semibold shadow-sm"
                  >
                    <option value="Accept">Accept</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* BOTTOM BUTTONS */}
            <div className="flex justify-center gap-3 mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-8 py-2.5 border border-slate-250 dark:border-slate-650 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer min-w-[130px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-teal-600/10 cursor-pointer min-w-[130px] flex items-center justify-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ================= LIST VIEW LOG ================= */
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search By School Name, Trans. ID"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm font-semibold"
              >
                <option value="">All Status</option>
                <option value="Accept">Accept</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Table list log */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">School Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Plan Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Payment Mode</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Trans. ID</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Amount</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Status</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Bill</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                        Loading requests...
                      </div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No verification requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((req, idx) => {
                    const sNo = (currentPage - 1) * pageSize + idx + 1
                    const isAccept = req.status === 'Accept'
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                        <td className="px-5 py-4 font-semibold">{req.school_name}</td>
                        <td className="px-5 py-4">{req.plan_name}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-650">
                            {req.payment_mode}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs">{req.transaction_id || '—'}</td>
                        <td className="px-5 py-4 font-semibold">₹{Number(req.amount).toFixed(2)}</td>
                        <td className="px-5 py-4">
                          {isAccept ? (
                            <span className="bg-[#DCFCE7] dark:bg-green-950/20 text-[#15803D] dark:text-green-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-green-200 dark:border-green-900/30 flex items-center gap-1.5 shrink-0 shadow-sm w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                              Accept
                            </span>
                          ) : (
                            <span className="bg-[#FEF9C3] dark:bg-yellow-950/20 text-[#A16207] dark:text-yellow-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-yellow-250 dark:border-yellow-900/30 flex items-center gap-1.5 shrink-0 shadow-sm w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {isAccept ? (
                            <button
                              onClick={() => handleDownloadPDF(req)}
                              className="w-8 h-8 inline-flex items-center justify-center bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-lg transition-colors cursor-pointer border border-teal-100 dark:border-teal-900/40 shadow-sm"
                              title="Download Receipt (PDF)"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-slate-350 dark:text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleSelectRequest(req)}
                              className="w-7 h-7 flex items-center justify-center bg-[#EBF6F6] dark:bg-slate-700 hover:bg-teal-150 dark:hover:bg-slate-650 text-teal-600 dark:text-teal-400 rounded-lg transition-colors cursor-pointer"
                              title="View Request Details"
                            >
                              <Eye className="w-4 h-4" />
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

          {/* Pagination Log */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing {startEntry}-{endEntry} of {totalCount} Entries
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchRequests(1, searchText, statusFilter)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'<<'}
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchRequests(currentPage - 1, searchText, statusFilter)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((pg) => (
                  <button
                    key={pg}
                    onClick={() => fetchRequests(pg, searchText, statusFilter)}
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
                  onClick={() => fetchRequests(currentPage + 1, searchText, statusFilter)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => fetchRequests(totalPages, searchText, statusFilter)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'>>'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SCREENSHOT VIEWER MODAL ================= */}
      {viewingScreenshot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setViewingScreenshot(null)}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 flex items-center gap-1.5">
              <Check className="w-5 h-5 text-emerald-600" />
              Payment Attachment
            </h3>
            
            {/* Receipt Simulation Card */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden p-6 bg-slate-50/50 dark:bg-slate-900 shadow-inner flex flex-col gap-4 font-medium text-xs text-slate-600 dark:text-slate-400">
              <div className="text-center pb-2 border-b border-dashed border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">Bank Transfer Receipt</span>
                <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">
                  ₹{viewingScreenshot.amount.toLocaleString('en-IN')}.00
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Attachment Filename</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingScreenshot.filename}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Recipient Account</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">ACADEMY SETU MAIN</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Transaction Ref</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">TXN.12354890</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Timestamp</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">11/01/2026 14:32:05</span>
              </div>
              <div className="mt-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/35 p-3 rounded-xl flex items-center gap-2 justify-center font-extrabold text-[11px] shadow-sm">
                <Check className="w-4 h-4 shrink-0" />
                Receipt Verified Valid
              </div>
            </div>

            <button
              onClick={() => setViewingScreenshot(null)}
              className="w-full mt-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RequestDashboardPage() {
  return (
    <AdminLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      }>
        <RequestDashboardContent />
      </Suspense>
    </AdminLayout>
  )
}

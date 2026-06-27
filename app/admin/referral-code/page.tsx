'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Search, Loader2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { toast } from 'sonner'

interface Referral {
  id: string
  referral_by: string
  referral_to: string
  name: string
  address: string
  mobile_no: string
  status: string
  created_at: string
}

export default function ReferralCodePage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [searchText, setSearchText] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Conversion loading states per row ID
  const [convertingId, setConvertingId] = useState<string | null>(null)

  const fetchReferrals = useCallback(async (page = 1, status = '', search = '', sDate = '', eDate = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize)
      })
      if (status) {
        params.append('status', status)
      }
      if (search) {
        params.append('search', search)
      }
      if (sDate) {
        params.append('start_date', sDate)
      }
      if (eDate) {
        params.append('end_date', eDate)
      }

      const res = await fetch(`/api/admin/referral-code?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setReferrals(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
      } else {
        toast.error('Failed to load referrals')
      }
    } catch {
      toast.error('Error occurred loading referrals')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReferrals(currentPage, filterStatus, searchText, startDate, endDate)
  }, [currentPage, filterStatus, searchText, startDate, endDate, fetchReferrals])

  const handleConvertLead = async (id: string) => {
    setConvertingId(id)
    try {
      const res = await fetch(`/api/admin/referral-code/${id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Successfully converted referral to CRM Lead!')
        fetchReferrals(currentPage, filterStatus, searchText, startDate, endDate)
      } else {
        toast.error(data.error || 'Failed to convert referral')
      }
    } catch {
      toast.error('Something went wrong during conversion')
    } finally {
      setConvertingId(null)
    }
  }

  // Pagination buttons logic
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
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Title Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">Referral Code</h1>
        </div>

        {/* Filter and Table Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
          {/* Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSearchText(searchInput)
              setCurrentPage(1)
            }}
            className="relative max-w-xs"
          >
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, mobile, address..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </form>

          {/* Filters Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Filter Dropdown */}
            <div className="flex flex-col gap-1.5 shrink-0 w-44">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 cursor-pointer font-semibold shadow-sm"
              >
                <option value="">All</option>
                <option value="Onboarded">Onboarded</option>
              </select>
            </div>

            {/* From Date */}
            <div className="flex flex-col gap-1.5 shrink-0 w-44">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1.5 shrink-0 w-44">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3.5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-20">S. No.</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Referral By</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Referral To</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Name</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Address</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Mobile No.</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-44">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2 font-medium">
                        <Loader2 className="w-5 h-5 animate-spin text-[#0E9485]" />
                        Loading referrals...
                      </div>
                    </td>
                  </tr>
                ) : referrals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No referral entries found.
                    </td>
                  </tr>
                ) : (
                  referrals.map((ref, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1
                    return (
                      <tr key={ref.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-550 dark:text-slate-450">{rowNum}.</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">{ref.referral_by}</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">{ref.referral_to}</td>
                        <td className="px-5 py-4 text-slate-800 dark:text-slate-100 font-semibold">{ref.name}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-sm font-medium">{ref.address}</td>
                        <td className="px-5 py-4 text-slate-650 dark:text-slate-305 text-sm font-semibold">{ref.mobile_no}</td>
                        <td className="px-5 py-4">
                          {ref.status === 'Pending' ? (
                            <button
                              onClick={() => handleConvertLead(ref.id)}
                              disabled={convertingId !== null}
                              className="px-4 py-1.5 bg-[#0F9E8F] hover:bg-[#0D8E80] disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {convertingId === ref.id && <Loader2 className="w-3 h-3 animate-spin" />}
                              Convert to Lead
                            </button>
                          ) : ref.status === 'Onboarded' ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4EA] text-[#10B981] shadow-sm">
                              Onboarded
                            </span>
                          ) : ref.status === 'Converted' ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF6F6] text-[#0F9E8F] shadow-sm">
                              Lead Converted
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-650">
                              {ref.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && referrals.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4 flex-wrap gap-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Showing {startEntry}-{endEntry} of {totalCount} Entries
              </span>
              
              <div className="flex items-center gap-1.5">
                {/* ChevronsLeft */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-55 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                {/* ChevronLeft */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-55 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* Page numbers */}
                {getPageNumbers().map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === num
                        ? 'bg-[#0F9E8F] text-white shadow-md shadow-teal-500/10'
                        : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-55 dark:hover:bg-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                {/* ChevronRight */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-55 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* ChevronsRight */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-55 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

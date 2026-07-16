'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Loader2, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Institute {
  id: string
  name: string
  code: string
  contact_person: string
  mobile_no: string
  email_id: string
  state: string
  district: string
  status: string
  created_at: string
  assigned_user_name?: string | null
}

export default function InstitutePage() {
  const [institutes, setInstitutes] = useState<Institute[]>([])
  const [loading, setLoading] = useState(true)

  // Counts
  const [metaCounts, setMetaCounts] = useState({ totalCount: 0 })

  // Search & Filtering
  const [searchText, setSearchText] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterState, setFilterState] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const fetchInstitutes = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (searchText) queryParams.append('search', searchText)
      if (filterState) queryParams.append('state', filterState)
      if (filterDistrict) queryParams.append('district', filterDistrict)

      const response = await fetch(`/api/admin/institute?${queryParams.toString()}`)
      const resData = await response.json()
      if (resData.success) {
        setInstitutes(resData.data)
        if (resData.meta) {
          setMetaCounts({ totalCount: resData.meta.totalCount })
        }
      } else {
        toast.error('Failed to load institutes')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Something went wrong loading institutes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstitutes()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchInstitutes()
    }, 500)
    return () => clearTimeout(timer)
  }, [filterState, filterDistrict, searchText])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchInstitutes()
  }

  const handleResetFilters = () => {
    setFilterState('')
    setFilterDistrict('')
    setSearchText('')
    setCurrentPage(1)
  }

  // Pagination calculation
  const totalEntries = metaCounts.totalCount
  const totalPages = Math.ceil(totalEntries / pageSize) || 1
  const paginatedInstitutes = institutes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        {/* Title and Top Search/Create Row */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Institutes</h1>
          
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Name, Contact, Email"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </form>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm cursor-pointer transition-colors shrink-0 ${
                showFilters
                  ? 'bg-indigo-600 text-white shadow-indigo-600/10'
                  : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
              title="Toggle Filters"
            >
              {showFilters ? <ChevronUp className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
            </button>
            <Link 
              href="/admin/institute/create"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/10 cursor-pointer transition-colors shrink-0 font-semibold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Institute
            </Link>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  placeholder="Enter State"
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">District</label>
                <input
                  type="text"
                  placeholder="Enter District"
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Table Container Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col relative">
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Institute Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Code</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Contact Person</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Email</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Location</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Created At</th>
                  <th className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        Loading institutes...
                      </div>
                    </td>
                  </tr>
                ) : paginatedInstitutes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      No institutes found.
                    </td>
                  </tr>
                ) : (
                  paginatedInstitutes.map((inst, index) => {
                    const sNo = (currentPage - 1) * pageSize + index + 1
                    return (
                      <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-200 font-bold">{inst.name}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-semibold">{inst.code || '-'}</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{inst.contact_person}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs">{inst.email_id || '-'}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-semibold">{inst.district}, {inst.state}</td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                          {formatDate(inst.created_at)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Link href={`/admin/institute/${inst.id}`} className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer text-xs font-bold px-3 py-1 bg-indigo-50 rounded-lg inline-block">
                            Manage
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalEntries > 0 && (
            <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalEntries)} to {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} Entries
              </p>
              
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 disabled:opacity-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  &lt;&lt;
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 disabled:opacity-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  &lt;
                </button>
                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg">{currentPage}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 disabled:opacity-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  &gt;
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 disabled:opacity-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}


'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Search, Plus, Trash2, Loader2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface Distributor {
  id: string
  dist_id: string
  name: string
  mobile_no: string
  email: string
  gender: string
  state: string
  district: string
  commission_in: string
  commission_value: number
  commission_type: string
  assign_area: string
  status: string
  created_at: string
}

export default function AllDistributorsPage() {
  const router = useRouter()
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchDistributors = useCallback(async (page = 1, search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) params.append('search', search)
      const res = await fetch(`/api/admin/distributors?${params}`)
      const data = await res.json()
      if (data.success) {
        setDistributors(data.data)
        setTotalCount(data.meta.totalCount)
        setTotalPages(data.meta.totalPages)
        setCurrentPage(data.meta.page)
      } else {
        toast.error('Failed to load distributors')
      }
    } catch {
      toast.error('Error loading distributors')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDistributors(currentPage, searchText)
  }, [currentPage, searchText, fetchDistributors])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchText(searchInput)
    setCurrentPage(1)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/distributors/${deleteTargetId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Distributor deleted successfully')
        fetchDistributors(currentPage, searchText)
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Error deleting distributor')
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
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">All Distributers</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage distributor network and commission configurations</p>
          </div>
          <button
            onClick={() => router.push('/admin/distributors/create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0F9E8F] hover:bg-[#0D8E80] text-white rounded-xl font-bold text-sm shadow-md shadow-teal-500/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Distributor
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
          {/* Search */}
          <div className="flex justify-end">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Name, ID, Mobile..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm w-72 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 text-slate-800 dark:text-slate-200"
              />
            </form>
          </div>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-16">S. No.</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">ID No.</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Name</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Mobile No.</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Location</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Commission</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Assign Area</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-28">Status</th>
                  <th className="px-5 py-4 font-bold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2 font-medium">
                        <Loader2 className="w-5 h-5 animate-spin text-[#0E9485]" />
                        Loading distributors...
                      </div>
                    </td>
                  </tr>
                ) : distributors.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-slate-400 font-medium">No distributors found.</td>
                  </tr>
                ) : (
                  distributors.map((dist, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1
                    return (
                      <tr key={dist.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-550">{rowNum}.</td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-bold text-xs">{dist.dist_id}</td>
                        <td className="px-5 py-4 text-slate-800 dark:text-slate-100 font-semibold">{dist.name}</td>
                        <td className="px-5 py-4 text-slate-650 dark:text-slate-300 text-sm font-medium">{dist.mobile_no}</td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-sm">
                          {dist.district ? `${dist.district}, ` : ''}{dist.state}
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400 text-xs font-bold">
                          {dist.commission_value}{dist.commission_in === 'Percentage' ? '%' : ' ₹'} ({dist.commission_type})
                        </td>
                        <td className="px-5 py-4 text-slate-550 dark:text-slate-400 text-xs">{dist.assign_area || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            dist.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}>
                            {dist.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setDeleteTargetId(dist.id)}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && distributors.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4 flex-wrap gap-4">
              <span className="text-xs font-bold text-slate-500">Showing {startEntry}-{endEntry} of {totalCount} Entries</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer text-slate-500">
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer text-slate-500">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map(num => (
                  <button key={num} onClick={() => setCurrentPage(num)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === num ? 'bg-[#0F9E8F] text-white shadow-md' : 'border border-slate-200 dark:border-slate-600 text-slate-600 hover:bg-slate-50'}`}>
                    {num}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer text-slate-500">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer text-slate-500">
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Distributor"
        description="Are you sure you want to delete this distributor? All related data will be removed."
      />
    </AdminLayout>
  )
}

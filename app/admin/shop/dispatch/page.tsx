'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Search, Loader2, Calendar, Plus, Edit3, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'
import { DispatchModal } from '@/components/DispatchModal'

interface DispatchRecord {
  id: string
  school_name: string
  address: string
  name: string
  mobile_no: string
  product_name: string
  product_description?: string
  quantity: number
  size?: string
  product_as?: string
  dispatch_date: string
  status: string
  price?: string | number
  tax_percent?: string | number
  total_amount?: string | number
  courier_name?: string
  courier_id?: string
}

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchRecord | null>(null)

  // Filters
  const [schoolFilter, setSchoolFilter] = useState('Select an Option')
  const [statusFilter, setStatusFilter] = useState('Select an Option')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Unique filter lists
  const [schoolsList, setSchoolsList] = useState<string[]>([])
  const statusList = ['Payment Pending', 'Order Generated', 'Working', 'Order Dispatched']

  // Pagination mock
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 10
  const mockTotalEntries = 456

  // Delete status
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchDispatches = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (schoolFilter && schoolFilter !== 'Select an Option' && schoolFilter !== 'All') {
        params.append('school', schoolFilter)
      }
      if (statusFilter && statusFilter !== 'Select an Option' && statusFilter !== 'All') {
        params.append('status', statusFilter)
      }
      if (fromDate) params.append('fromDate', fromDate)
      if (toDate) params.append('toDate', toDate)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/admin/shop/dispatches?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setDispatches(data.data)

        if (schoolsList.length === 0) {
          const uniqueSchools: string[] = Array.from(
            new Set((data.data as DispatchRecord[]).map(e => e.school_name))
          )
          setSchoolsList(uniqueSchools)
        }
      } else {
        toast.error('Failed to load dispatch records')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error fetching dispatch records')
    } finally {
      setLoading(false)
    }
  }, [schoolFilter, statusFilter, fromDate, toDate, searchTerm, schoolsList.length])

  useEffect(() => {
    fetchDispatches()
  }, [fetchDispatches])

  const handleClearFilters = () => {
    setSchoolFilter('Select an Option')
    setStatusFilter('Select an Option')
    setFromDate('')
    setToDate('')
    setSearchTerm('')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/shop/dispatches/${deleteId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Dispatch record deleted')
        setDispatches(prev => prev.filter(d => d.id !== deleteId))
        setDeleteId(null)
      } else {
        toast.error(data.error || 'Failed to delete dispatch record')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error deleting dispatch record')
    } finally {
      setDeleteLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Payment Pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-500 border border-rose-200 uppercase tracking-wider">
            ● Payment Pending
          </span>
        )
      case 'Order Generated':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-fuchsia-50 text-fuchsia-500 border border-fuchsia-200 uppercase tracking-wider">
            ● Order Generated
          </span>
        )
      case 'Working':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wider">
            ● Working
          </span>
        )
      case 'Order Dispatched':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-500 border border-emerald-200 uppercase tracking-wider">
            ● Order Dispatched
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200 uppercase tracking-wider">
            {status}
          </span>
        )
    }
  }

  const formatDateString = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return dateStr
    }
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100 font-bold">Dispatch</h1>
        </div>
        <button
          onClick={() => {
            setSelectedDispatch(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Instant Dispatch
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 mb-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          {/* School Name */}
          <div>
            <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-2">School Name</label>
            <select
              value={schoolFilter}
              onChange={e => setSchoolFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-350 cursor-pointer"
            >
              <option value="Select an Option">Select an Option</option>
              <option value="All">All Schools</option>
              {schoolsList.map(school => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-350 cursor-pointer"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-350 cursor-pointer"
            />
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-350 cursor-pointer"
            >
              <option value="Select an Option">Select an Option</option>
              <option value="All">All Statuses</option>
              {statusList.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Search/Clear inputs */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-350"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {(schoolFilter !== 'Select an Option' || statusFilter !== 'Select an Option' || fromDate || toDate || searchTerm) && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table panel */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6 text-center">S.No.</th>
                <th className="py-4 px-6">School Name</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Mobile No.</th>
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6 text-center">Quantity</th>
                <th className="py-4 px-6">Updated At</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-sm text-slate-750 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                  </td>
                </tr>
              ) : dispatches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No dispatch records found.
                  </td>
                </tr>
              ) : (
                dispatches.map((disp, idx) => (
                  <tr key={disp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                    <td className="py-4 px-6 text-center text-slate-400 font-semibold">
                      {idx + 1}.
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-850 dark:text-slate-200">
                      {disp.school_name}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                      {disp.address}
                    </td>
                    <td className="py-4 px-6 font-medium">
                      {disp.name}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                      {disp.mobile_no}
                    </td>
                    <td className="py-4 px-6 text-slate-655 dark:text-slate-350">
                      {disp.product_name}
                    </td>
                    <td className="py-4 px-6 text-center font-bold">
                      {disp.quantity}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDateString(disp.dispatch_date)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(disp.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedDispatch(disp)
                            setIsModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition-colors cursor-pointer"
                          title="Edit Dispatch"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(disp.id)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer/Pagination */}
        <div className="bg-slate-50/40 dark:bg-slate-900/20 px-6 py-4 border-t border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Showing 1-10 of {mockTotalEntries} Entries</span>
          
          <div className="flex gap-1.5 items-center">
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer disabled:opacity-50" disabled>
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold cursor-pointer">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer">
              2
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <DispatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDispatches}
        dispatch={selectedDispatch}
      />

      <DeleteConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Dispatch Record"
        description="Are you sure you want to delete this dispatch record? This action cannot be undone."
        loading={deleteLoading}
      />
    </AdminLayout>
  )
}

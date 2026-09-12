'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  Loader2,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Tag,
  ShoppingBag
} from 'lucide-react'
import { toast } from 'sonner'
import { EnquiryModal, EnquiryRecord } from '@/components/EnquiryModal'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

const STATUS_LIST = ['Enquired', 'Order Generated', 'Closed']

export default function ProductEnquiryPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null)

  // Delete modal states
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Quick status updating row id
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)

  // Filters
  const [schoolFilter, setSchoolFilter] = useState('Select an Option')
  const [statusFilter, setStatusFilter] = useState('Select an Option')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Unique school names list (for filter dropdown)
  const [schoolsList, setSchoolsList] = useState<string[]>([])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 10

  const fetchEnquiries = useCallback(async () => {
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

      const res = await fetch(`/api/admin/shop/enquiries?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setEnquiries(data.data)
      } else {
        toast.error('Failed to load enquiries')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error fetching enquiries')
    } finally {
      setLoading(false)
    }
  }, [schoolFilter, statusFilter, fromDate, toDate, searchTerm])

  useEffect(() => {
    fetchEnquiries()
  }, [fetchEnquiries])

  // Fetch all registered institutes for the filter dropdown
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const res = await fetch('/api/admin/institute?simple=true')
        const data = await res.json()
        if (data.success) {
          const names: string[] = data.data.map((i: any) => i.name)
          setSchoolsList(names)
        }
      } catch (err) {
        console.error('Failed to fetch institutes for dropdown', err)
      }
    }
    fetchInstitutes()
  }, [])

  // Quick Inline Status Update
  const handleQuickStatusChange = async (enquiryId: string, newStatus: string) => {
    setUpdatingStatusId(enquiryId)
    try {
      const res = await fetch(`/api/admin/shop/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Status updated to "${newStatus}"`)
        setEnquiries((prev) =>
          prev.map((item) => (item.id === enquiryId ? { ...item, status: newStatus } : item))
        )
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (err) {
      console.error('Failed to update status', err)
      toast.error('Error updating status')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/shop/enquiries/${deleteId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Enquiry deleted successfully')
        setDeleteId(null)
        fetchEnquiries()
      } else {
        toast.error(data.error || 'Failed to delete enquiry')
      }
    } catch (err) {
      console.error('Delete enquiry error:', err)
      toast.error('Error deleting enquiry')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Clear filters handler
  const handleClearFilters = () => {
    setSchoolFilter('Select an Option')
    setStatusFilter('Select an Option')
    setFromDate('')
    setToDate('')
    setSearchTerm('')
    setCurrentPage(1)
  }

  // Format Date to DD/MM/YYYY
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

  // Status Badge Component
  const getStatusBadge = (status: string = 'Enquired') => {
    const norm = status || 'Enquired'
    switch (norm) {
      case 'Order Generated':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Order Generated
          </span>
        )
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-750 dark:text-slate-300 dark:border-slate-700">
            <XCircle className="w-3.5 h-3.5" />
            Closed
          </span>
        )
      case 'Enquired':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            Enquired
          </span>
        )
    }
  }

  // Pagination calculation
  const totalEntries = enquiries.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage))
  const paginatedEnquiries = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage
    return enquiries.slice(start, start + entriesPerPage)
  }, [enquiries, currentPage, entriesPerPage])

  return (
    <>
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">Product Enquiry</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage school product enquiries, update statuses, and generate orders
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedEnquiry(null)
            setIsModalOpen(true)
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Enquiry
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 mb-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          {/* School Name */}
          <div>
            <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-2">School Name</label>
            <select
              value={schoolFilter}
              onChange={(e) => {
                setSchoolFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-slate-350 cursor-pointer font-medium"
            >
              <option value="Select an Option">Select School</option>
              <option value="All">All Schools</option>
              {schoolsList.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-slate-350 cursor-pointer font-medium"
            >
              <option value="Select an Option">Select Status</option>
              <option value="All">All Statuses</option>
              {STATUS_LIST.map((status) => (
                <option key={status} value={status}>
                  {status}
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
              onChange={(e) => {
                setFromDate(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-slate-350 cursor-pointer"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-slate-350 cursor-pointer"
            />
          </div>

          {/* Search/Clear controls */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-slate-350"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {(schoolFilter !== 'Select an Option' ||
              statusFilter !== 'Select an Option' ||
              fromDate ||
              toDate ||
              searchTerm) && (
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-750 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-16">S.No.</th>
                <th className="py-4 px-6 min-w-[160px]">School Name</th>
                <th className="py-4 px-6 min-w-[120px]">Address</th>
                <th className="py-4 px-6 min-w-[140px]">Contact Person</th>
                <th className="py-4 px-6 min-w-[130px]">Mobile No.</th>
                <th className="py-4 px-6 min-w-[150px]">Product Name</th>
                <th className="py-4 px-6 text-center">Quantity</th>
                <th className="py-4 px-6 min-w-[130px]">Enquiry Date</th>
                <th className="py-4 px-6 min-w-[170px]">Status</th>
                <th className="py-4 px-6 text-center min-w-[110px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-sm text-slate-750 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                    <span className="text-xs text-slate-400 mt-2 block">Loading enquiries...</span>
                  </td>
                </tr>
              ) : paginatedEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-sm">No enquiries found</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters or record a new enquiry</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEnquiries.map((enq, idx) => {
                  const sNo = (currentPage - 1) * entriesPerPage + idx + 1
                  const isUpdatingThis = updatingStatusId === enq.id

                  return (
                    <tr key={enq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                      <td className="py-4 px-6 text-center text-slate-400 font-semibold text-xs">
                        {sNo}.
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-850 dark:text-slate-100">
                        {enq.school_name}
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs">
                        {enq.address || '—'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-200 text-xs">
                        {enq.name}
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {enq.mobile_no}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-200 text-xs">
                        {enq.product_name}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-800 dark:text-slate-100">
                        {enq.quantity}
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDateString(enq.enquiry_date)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {isUpdatingThis ? (
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                          ) : (
                            <select
                              value={enq.status || 'Enquired'}
                              onChange={(e) => handleQuickStatusChange(enq.id, e.target.value)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none ${
                                (enq.status || 'Enquired') === 'Order Generated'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                  : (enq.status || 'Enquired') === 'Closed'
                                  ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-750 dark:text-slate-300 dark:border-slate-700'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                              }`}
                            >
                              <option value="Enquired">Enquired</option>
                              <option value="Order Generated">Order Generated</option>
                              <option value="Closed">Closed</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedEnquiry(enq)
                              setIsModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                            title="Edit Enquiry"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(enq.id)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
                            title="Delete Enquiry"
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

        {/* Table Footer / Pagination */}
        {totalEntries > 0 && (
          <div className="bg-slate-50/40 dark:bg-slate-900/20 px-6 py-4 border-t border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>
              Showing {(currentPage - 1) * entriesPerPage + 1} to{' '}
              {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} Entries
            </span>

            {/* Pagination buttons */}
            <div className="flex gap-1.5 items-center">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enquiry Edit / Create Modal */}
      <EnquiryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEnquiry(null)
        }}
        onSuccess={fetchEnquiries}
        enquiry={selectedEnquiry}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Enquiry"
        description="Are you sure you want to delete this product enquiry? This action cannot be undone."
        loading={deleteLoading}
      />
    </>
  )
}

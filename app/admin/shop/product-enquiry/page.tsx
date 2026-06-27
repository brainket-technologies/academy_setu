'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Search, Loader2, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { toast } from 'sonner'

interface Enquiry {
  id: string
  school_name: string
  address: string
  name: string
  mobile_no: string
  product_name: string
  quantity: number
  enquiry_date: string
}

export default function ProductEnquiryPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [schoolFilter, setSchoolFilter] = useState('Select an Option')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Unique school names list (for filter dropdown)
  const [schoolsList, setSchoolsList] = useState<string[]>([])

  // Pagination (mocked values to match the "Showing 1-10 of 458 Entries" in screenshot)
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 10
  const mockTotalEntries = 458

  const fetchEnquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (schoolFilter && schoolFilter !== 'Select an Option' && schoolFilter !== 'All') {
        params.append('school', schoolFilter)
      }
      if (fromDate) params.append('fromDate', fromDate)
      if (toDate) params.append('toDate', toDate)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/admin/shop/enquiries?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setEnquiries(data.data)
        
        // Populate school dropdown list if it's the first time
        if (schoolsList.length === 0) {
          const uniqueSchools: string[] = Array.from(
            new Set((data.data as Enquiry[]).map(e => e.school_name))
          )
          setSchoolsList(uniqueSchools)
        }
      } else {
        toast.error('Failed to load enquiries')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error fetching enquiries')
    } finally {
      setLoading(false)
    }
  }, [schoolFilter, fromDate, toDate, searchTerm, schoolsList.length])

  useEffect(() => {
    fetchEnquiries()
  }, [fetchEnquiries])

  // Clear filters handler
  const handleClearFilters = () => {
    setSchoolFilter('Select an Option')
    setFromDate('')
    setToDate('')
    setSearchTerm('')
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

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">Product Enquiry</h1>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 mb-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
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
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-350 cursor-pointer"
              />
            </div>
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-2">To Date</label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-slate-350 cursor-pointer"
              />
            </div>
          </div>

          {/* Search/Clear controls */}
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
            
            {(schoolFilter !== 'Select an Option' || fromDate || toDate || searchTerm) && (
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

      {/* Main Table view */}
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
                <th className="py-4 px-6">Enquiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-sm text-slate-750 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq, idx) => (
                  <tr key={enq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors">
                    <td className="py-4 px-6 text-center text-slate-400 font-semibold">
                      {idx + 1}.
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-850 dark:text-slate-200">
                      {enq.school_name}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                      {enq.address}
                    </td>
                    <td className="py-4 px-6 font-medium">
                      {enq.name}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                      {enq.mobile_no}
                    </td>
                    <td className="py-4 px-6 text-slate-655 dark:text-slate-350">
                      {enq.product_name}
                    </td>
                    <td className="py-4 px-6 text-center font-bold">
                      {enq.quantity}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateString(enq.enquiry_date)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="bg-slate-50/40 dark:bg-slate-900/20 px-6 py-4 border-t border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Showing 1-10 of {mockTotalEntries} Entries</span>
          
          {/* Pagination buttons matching Image 1 */}
          <div className="flex gap-1.5 items-center">
            <button
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-50 cursor-pointer"
              disabled
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-50 cursor-pointer"
              disabled
            >
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
    </AdminLayout>
  )
}

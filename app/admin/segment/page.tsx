'use client'

import React, { useState, useEffect, useRef } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Search, Filter, X, Edit, Trash2, ChevronDown, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Segment {
  id: string
  name: string
  services: string[]
  description: string
  created_at: string
}

const AVAILABLE_SERVICES = [
  'Student Service',
  'Teacher Service',
  'Employee Service',
  'Certificate Service',
  'ID Card Service',
  'Admit Card Service',
  'Worksheet Service',
  'Gate Pass Service',
  'Transport Service',
  'Other Service'
]

export default function SegmentPage() {
  // Database segments state
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Listing filter & search states
  const [searchText, setSearchText] = useState('')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filterSegmentName, setFilterSegmentName] = useState('')
  const [filterService, setFilterService] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({ name: '', service: '' })

  // Form states
  const [segmentName, setSegmentName] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const serviceDropdownRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  // Fetch segments on mount and when applied filters change
  const fetchSegments = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (searchText) {
        queryParams.append('search', searchText)
      }
      if (appliedFilters.name) {
        queryParams.append('search', appliedFilters.name)
      }
      if (appliedFilters.service) {
        queryParams.append('service', appliedFilters.service)
      }

      const response = await fetch(`/api/admin/segment?${queryParams.toString()}`)
      const resData = await response.json()
      if (resData.success) {
        setSegments(resData.data)
      } else {
        toast.error('Failed to load segments')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Something went wrong loading segments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSegments()
  }, [appliedFilters])

  // Handle local text search with short delay or trigger immediately on enter/submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSegments()
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setIsServiceDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Create or Update Segment Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!segmentName.trim()) {
      toast.error('Segment name is required')
      return
    }
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service')
      return
    }

    setSubmitting(true)
    try {
      const url = editingId ? `/api/admin/segment/${editingId}` : '/api/admin/segment'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: segmentName.trim(),
          services: selectedServices,
          description: description.trim()
        })
      })

      const resData = await response.json()
      if (resData.success) {
        toast.success(editingId ? 'Segment updated successfully' : 'Segment created successfully')
        // Reset form
        setSegmentName('')
        setSelectedServices([])
        setDescription('')
        setEditingId(null)
        // Refresh list
        fetchSegments()
      } else {
        toast.error(resData.error || 'Failed to save segment')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Something went wrong saving segment')
    } finally {
      setSubmitting(false)
    }
  }

  // Populate form for editing
  const handleEdit = (segment: Segment) => {
    setEditingId(segment.id)
    setSegmentName(segment.name)
    setSelectedServices(segment.services)
    setDescription(segment.description || '')
    
    // Scroll form into view
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Delete Segment Action
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) return

    try {
      const response = await fetch(`/api/admin/segment/${id}`, {
        method: 'DELETE'
      })
      const resData = await response.json()
      if (resData.success) {
        toast.success('Segment deleted successfully')
        fetchSegments()
      } else {
        toast.error(resData.error || 'Failed to delete segment')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Something went wrong deleting segment')
    }
  }

  // Service Multi-select handling
  const toggleServiceSelection = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service))
    } else {
      setSelectedServices([...selectedServices, service])
    }
  }

  // Filter Modal triggers
  const handleApplyFilters = () => {
    setAppliedFilters({
      name: filterSegmentName,
      service: filterService
    })
    setIsFilterModalOpen(false)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilterSegmentName('')
    setFilterService('')
    setAppliedFilters({ name: '', service: '' })
    setIsFilterModalOpen(false)
    setCurrentPage(1)
  }

  // Pagination logic
  const totalEntries = segments.length
  const totalPages = Math.ceil(totalEntries / pageSize)
  const paginatedSegments = segments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

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

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Title Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Segment</h1>
        </div>

        {/* Create Segment Form Card */}
        <div ref={formRef} className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
            {editingId ? 'Edit Segment' : 'Create Segment'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Segment Name Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Segment Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Segment Name"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  required
                />
              </div>

              {/* Service Select Multi-Dropdown */}
              <div className="flex flex-col gap-2 relative" ref={serviceDropdownRef}>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Service <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">(Select Multiple Services)</span>
                </label>
                
                {/* Visual dropdown input */}
                <div 
                  onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                  className="min-h-[46px] w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm cursor-pointer shadow-sm flex items-center justify-between gap-2 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {selectedServices.length === 0 ? (
                      <span className="text-slate-400 dark:text-slate-500 pl-1 py-1">Select Services</span>
                    ) : (
                      selectedServices.map(service => (
                        <span 
                          key={service} 
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleServiceSelection(service)
                          }}
                          className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800 text-xs font-medium px-2 py-0.5 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
                        >
                          {service}
                          <X className="w-3 h-3 hover:text-teal-900" />
                        </span>
                      ))
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
                </div>

                {/* Dropdown Options Box */}
                {isServiceDropdownOpen && (
                  <div className="absolute top-[80px] left-0 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    {AVAILABLE_SERVICES.map(service => {
                      const isSelected = selectedServices.includes(service)
                      return (
                        <div
                          key={service}
                          onClick={() => toggleServiceSelection(service)}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-600 text-sm text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                        >
                          <span>{service}</span>
                          {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Description Area */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                placeholder="Enter Description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Buttons Panel */}
            <div className="flex justify-center gap-3 mt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setSegmentName('')
                    setSelectedServices([])
                    setDescription('')
                  }}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-teal-600/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>

        {/* All Segment Table Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">All Segment</h2>
            
            {/* Search and Filters buttons row */}
            <div className="flex items-center gap-3 flex-wrap">
              <form onSubmit={handleSearchSubmit} className="relative w-72">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Segment, Service Name"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </form>
              <button 
                onClick={() => setIsFilterModalOpen(true)}
                className={`p-2.5 rounded-xl border transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                  appliedFilters.name || appliedFilters.service 
                    ? 'bg-teal-50 dark:bg-teal-900/40 border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400' 
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Segment Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Service Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Created At</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                        Loading segments...
                      </div>
                    </td>
                  </tr>
                ) : paginatedSegments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                      No segments found.
                    </td>
                  </tr>
                ) : (
                  paginatedSegments.map((segment, index) => {
                    const sNo = (currentPage - 1) * pageSize + index + 1
                    const { date, time } = formatDate(segment.created_at)
                    return (
                      <tr key={segment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">{sNo}.</td>
                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{segment.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {segment.services.map(srv => (
                              <span 
                                key={srv} 
                                className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-medium"
                              >
                                {srv}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                          📅 {date}<br/>🕒 {time}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleEdit(segment)}
                              className="p-1.5 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-800 transition-colors cursor-pointer"
                              title="Edit Segment"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(segment.id)}
                              className="p-1.5 bg-rose-50 dark:bg-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-100 dark:border-rose-800 transition-colors cursor-pointer"
                              title="Delete Segment"
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

          {/* Pagination and Entries display */}
          {totalEntries > 0 && (
            <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalEntries)} to {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} Entries
              </p>
              
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:text-slate-300 dark:disabled:hover:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  &lt;&lt;
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:text-slate-300 dark:disabled:hover:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  &lt;
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pgNum = idx + 1
                  const isCurrent = pgNum === currentPage
                  return (
                    <button
                      key={pgNum}
                      onClick={() => setCurrentPage(pgNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isCurrent 
                          ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/25' 
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-slate-700'
                      }`}
                    >
                      {pgNum}
                    </button>
                  )
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:text-slate-300 dark:disabled:hover:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  &gt;
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:text-slate-300 dark:disabled:hover:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal Overlay (Image 5) */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-100 dark:border-slate-700 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close trigger */}
            <button 
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">Filter Segments</h3>

            <div className="flex flex-col gap-4 mb-6">
              {/* Filter name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Segment Name</label>
                <input
                  type="text"
                  placeholder="Enter Name"
                  value={filterSegmentName}
                  onChange={(e) => setFilterSegmentName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Filter service */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Service</label>
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                >
                  <option value="">Select Service</option>
                  {AVAILABLE_SERVICES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-600/10 cursor-pointer text-center"
              >
                Filter
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 py-2.5 bg-white dark:bg-slate-700 border border-teal-600 dark:border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-xl font-bold text-sm transition-all cursor-pointer text-center"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

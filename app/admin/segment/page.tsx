'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Filter, X, Edit, Trash2, ChevronDown, Check, Loader2, ChevronUp, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface Segment {
  id: string
  name: string
  menus: string[]
  description: string
  created_at: string
}



const AVAILABLE_MENUS = [
  "Leads / Enquiry", "Students", "Teachers", "Employee", "Parents / Siblings", 
  "Fees Setup", "Fees Collection", "ID Card", "Certificate", "Exam & Marksheets", "Admit Cards", 
  "Transfer Certificate", "Transportation", "Attendance", "Leave", "Payroll", 
  "Expenses", "Income", "Homework", "Time Table", 
  "Mobile App User", "Notification", "Text SMS", "Notice on App", "Message Service", 
  "Academic Calendar", "Gate Pass", "Lesson Plans", "Study Material", "Online Quiz / Test", 
  "Offline / Weekly Test", "Events Gallery", "Support Tickets", "House / Blocks"
]

export default function SegmentPage() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  
  // Listing filter & search states
  const [searchText, setSearchText] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterSegmentName, setFilterSegmentName] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({ name: '' })

  // Form (Modal) states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [segmentName, setSegmentName] = useState('')
  const [selectedMenus, setSelectedMenus] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Delete modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const menuDropdownRef = useRef<HTMLDivElement>(null)

  const fetchSegments = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (searchText) queryParams.append('search', searchText)
      if (appliedFilters.name) queryParams.append('search', appliedFilters.name)

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSegments()
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target as Node)) {
        setIsMenuDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleMenuSelection = (menu: string) => {
    setSelectedMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    )
  }

  const handleApplyFilters = () => {
    setAppliedFilters({ name: filterSegmentName })
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilterSegmentName('')
    setAppliedFilters({ name: '' })
    setSearchText('')
    setCurrentPage(1)
  }

  const resetForm = () => {
    setSegmentName('')
    setSelectedMenus([])
    setDescription('')
    setEditingId(null)
    setIsCreateModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!segmentName.trim()) {
      toast.error('Segment name is required')
      return
    }
    setSubmitting(true)
    try {
      const url = editingId ? `/api/admin/segment/${editingId}` : '/api/admin/segment'
      const method = editingId ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: segmentName.trim(), menus: selectedMenus, description: description.trim() })
      })
      const resData = await response.json()
      if (resData.success) {
        toast.success(editingId ? 'Segment updated successfully' : 'Segment created successfully')
        resetForm()
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

  const handleEdit = (segment: Segment) => {
    setEditingId(segment.id)
    setSegmentName(segment.name)
    setSelectedMenus(segment.menus || [])
    setDescription(segment.description || '')
    setIsCreateModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/admin/segment/${deleteTargetId}`, { method: 'DELETE' })
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
    } finally {
      setDeleteLoading(false)
      setDeleteTargetId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  }

  const totalEntries = segments.length
  const totalPages = Math.ceil(totalEntries / pageSize)
  const paginatedSegments = segments.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">All Segment</h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search segments..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
              </form>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                  showFilters || appliedFilters.name
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                title="Filter"
              >
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create Segment
            </button>
          </div>

          {showFilters && (
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Segment Name</label>
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={filterSegmentName}
                    onChange={(e) => setFilterSegmentName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="flex items-end gap-2">
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

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">S.No.</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Segment Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Created At</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td>
                  </tr>
                ) : paginatedSegments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">No segments found.</td>
                  </tr>
                ) : (
                  paginatedSegments.map((segment, index) => {
                    const sNo = (currentPage - 1) * pageSize + index + 1
                    const { date, time } = formatDate(segment.created_at)
                    return (
                      <tr key={segment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500">{sNo}.</td>
                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{segment.name}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs leading-relaxed">📅 {date}<br/>🕒 {time}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-2">
                            <button onClick={() => handleEdit(segment)} className="p-1.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rounded-lg border border-emerald-100"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => { setDeleteTargetId(segment.id) }} className="p-1.5 bg-rose-50 dark:bg-rose-900/40 text-rose-600 rounded-lg border border-rose-100"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination controls */}
          {totalEntries > 0 && (
            <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
              <p className="text-xs font-medium text-slate-500">Showing {Math.min((currentPage - 1) * pageSize + 1, totalEntries)} to {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} Entries</p>
              <div className="flex items-center gap-1.5">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 rounded-lg text-xs font-semibold bg-white">&lt;&lt;</button>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 rounded-lg text-xs font-semibold bg-white">&lt;</button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pgNum = idx + 1
                  return (
                    <button key={pgNum} onClick={() => setCurrentPage(pgNum)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${pgNum === currentPage ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:text-indigo-600 bg-white'}`}>{pgNum}</button>
                  )
                })}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 rounded-lg text-xs font-semibold bg-white">&gt;</button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:text-slate-300 rounded-lg text-xs font-semibold bg-white">&gt;&gt;</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-xl p-8 border border-slate-100 dark:border-slate-700 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button onClick={resetForm} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-50 transition-all cursor-pointer"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">{editingId ? 'Edit Segment' : 'Create Segment'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Segment Name <span className="text-red-500">*</span></label>
                <input type="text" value={segmentName} onChange={(e) => setSegmentName(e.target.value)} required className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>

              
              <div className="flex flex-col gap-2 relative" ref={menuDropdownRef}>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Menus <span className="text-slate-400 font-normal text-xs">(Select Multiple)</span></label>
                <div onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)} className="min-h-[46px] w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm cursor-pointer flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMenus.length === 0 ? <span className="text-slate-400 pl-1 py-1">Select Menus</span> : selectedMenus.map(menu => (
                      <span key={menu} onClick={(e) => { e.stopPropagation(); toggleMenuSelection(menu) }} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-medium px-2 py-0.5 rounded-full">
                        {menu} <X className="w-3 h-3 hover:text-emerald-900" />
                      </span>
                    ))}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                {isMenuDropdownOpen && (
                  <div className="absolute top-[80px] left-0 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto py-1">
                    {AVAILABLE_MENUS.map(menu => (
                      <div key={menu} onClick={() => toggleMenuSelection(menu)} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-slate-700 dark:text-slate-200">
                        <span>{menu}</span>
                        {selectedMenus.includes(menu) && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none" />
              </div>
              <button type="submit" disabled={submitting} className="mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex justify-center items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Segment' : 'Create Segment'}
              </button>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal isOpen={deleteTargetId !== null} onClose={() => setDeleteTargetId(null)} onConfirm={handleConfirmDelete} loading={deleteLoading} title="Delete Segment" description="Are you sure you want to delete this segment?" />
    </>
  )
}

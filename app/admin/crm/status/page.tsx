'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Search, Loader2, Edit3, Trash2, Calendar, Clock, 
  ChevronLeft, ChevronRight, Plus, X, ArrowUp, ArrowDown, ArrowUpDown
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface LeadStatus {
  id: string
  name: string
  text_color: string
  bg_color: string
  show_on_bdm: boolean
  order_index?: number
  created_at: string
}

export default function LeadStatusPage() {
  const [statuses, setStatuses] = useState<LeadStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState(false)

  // Search
  const [searchText, setSearchText] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusName, setStatusName] = useState('')
  const [orderIndex, setOrderIndex] = useState<number | string>('')
  const [color, setColor] = useState('#10B981')
  const [textColor, setTextColor] = useState('#10B981')
  const [bgColor, setBgColor] = useState('#10B9811F')
  const [showOnBdm, setShowOnBdm] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Delete modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  const fetchStatuses = useCallback(async (search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      const res = await fetch(`/api/admin/crm/status${params.toString() ? '?' + params.toString() : ''}`)
      const data = await res.json()
      if (data.success) {
        setStatuses(data.data)
        setTotalCount(data.meta.totalCount)
      } else {
        toast.error('Failed to load statuses')
      }
    } catch {
      toast.error('Something went wrong loading statuses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatuses(searchText)
  }, [searchText, fetchStatuses])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchText(searchInput)
    setCurrentPage(1)
  }

  // Handle move up / move down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= statuses.length) return

    const newStatuses = [...statuses]
    const temp = newStatuses[index]
    newStatuses[index] = newStatuses[targetIndex]
    newStatuses[targetIndex] = temp

    // Re-assign order_index in state for display
    const updatedWithOrder = newStatuses.map((st, i) => ({
      ...st,
      order_index: i + 1
    }))

    setStatuses(updatedWithOrder)

    try {
      setReordering(true)
      const res = await fetch('/api/admin/crm/status/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: updatedWithOrder.map(s => s.id) })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Status order updated!')
        if (data.data) {
          setStatuses(data.data)
        }
      } else {
        toast.error(data.error || 'Failed to update order')
        fetchStatuses(searchText)
      }
    } catch {
      toast.error('Error updating status order')
      fetchStatuses(searchText)
    } finally {
      setReordering(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!statusName.trim()) {
      toast.error('Status Name is required')
      return
    }

    setSubmitting(true)
    try {
      const url = editingId ? `/api/admin/crm/status/${editingId}` : '/api/admin/crm/status'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: statusName.trim(),
          text_color: textColor,
          bg_color: bgColor,
          show_on_bdm: showOnBdm,
          order_index: orderIndex !== '' ? Number(orderIndex) : undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingId ? 'Status updated successfully!' : 'Status created successfully!')
        handleCancelEdit()
        fetchStatuses(searchText)
      } else {
        toast.error(data.error || 'Failed to save status')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartEdit = (status: LeadStatus) => {
    setEditingId(status.id)
    setStatusName(status.name)
    setOrderIndex(status.order_index ?? '')
    const baseColor = status.text_color || '#10B981'
    setColor(baseColor)
    setTextColor(baseColor)
    setBgColor(status.bg_color || (baseColor.length === 7 ? baseColor + '1F' : baseColor))
    setShowOnBdm(!!status.show_on_bdm)
    setIsModalOpen(true)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setStatusName('')
    setOrderIndex('')
    setColor('#10B981')
    setTextColor('#10B981')
    setBgColor('#10B9811F')
    setShowOnBdm(true)
    setIsModalOpen(false)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/crm/status/${deleteTargetId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Status deleted successfully')
        fetchStatuses(searchText)
      } else {
        toast.error(data.error || 'Failed to delete status')
      }
    } catch {
      toast.error('Something went wrong deleting status')
    } finally {
      setDeleteLoading(false)
      setDeleteTargetId(null)
    }
  }

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      return { date, time }
    } catch {
      return { date: dateStr, time: '' }
    }
  }

  // Pagination helpers
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endEntry = Math.min(currentPage * pageSize, totalCount)
  const paginatedStatuses = statuses.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getPageNumbers = () => {
    const pages: number[] = []
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  return (
    <>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Title Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">Lead Status</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure status colors, visibility, and display order across all CRM dropdowns and filters.
            </p>
          </div>
          <button
            onClick={() => { handleCancelEdit(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Status
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
          {/* Controls Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 shadow-sm"
              />
            </form>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
              Use <span className="text-blue-600 dark:text-blue-400 font-bold">↑ / ↓</span> to reorder status sequence
            </div>
          </div>

          {/* Statuses Log Table */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-32 text-center">
                    Order
                  </th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">Created At</th>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#0E9485]" />
                        Loading statuses...
                      </div>
                    </td>
                  </tr>
                ) : paginatedStatuses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                      No lead statuses configured.
                    </td>
                  </tr>
                ) : (
                  paginatedStatuses.map((st, idx) => {
                    const globalIndex = (currentPage - 1) * pageSize + idx
                    const { date, time } = formatDateTime(st.created_at)
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                              {st.order_index ?? (globalIndex + 1)}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={globalIndex === 0 || reordering}
                                onClick={() => handleMove(globalIndex, 'up')}
                                title="Move Up"
                                className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={globalIndex === statuses.length - 1 || reordering}
                                onClick={() => handleMove(globalIndex, 'down')}
                                title="Move Down"
                                className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span 
                            className="inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                            style={{ color: st.text_color, backgroundColor: st.bg_color }}
                          >
                            {st.name}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            {date}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            {time}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStartEdit(st)}
                              className="w-7 h-7 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                              title="Edit Status"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(st.id)}
                              className="w-7 h-7 flex items-center justify-center bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-550 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete Status"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* Pagination Footer */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
              <p className="text-xs font-semibold text-slate-550 dark:text-slate-400">
                Showing {startEntry}-{endEntry} of {totalCount} Entries
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'<<'}
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      pg === currentPage
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'>>'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg p-7 sm:p-8 border border-slate-100 dark:border-slate-700 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={handleCancelEdit} 
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              {editingId ? 'Edit Status' : 'Create Status'}
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Status Name & Order Index */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Status Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter Status Name" 
                    value={statusName} 
                    onChange={(e) => setStatusName(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 shadow-sm" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Order Index
                  </label>
                  <input 
                    type="number" 
                    placeholder="Auto" 
                    value={orderIndex} 
                    onChange={(e) => setOrderIndex(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 shadow-sm" 
                  />
                </div>
              </div>

              {/* Single Color Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Status Color
                </label>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={color} 
                    onChange={(e) => {
                      const val = e.target.value
                      setColor(val)
                      setTextColor(val)
                      setBgColor(val.length === 7 && val.startsWith('#') ? val + '1F' : val)
                    }} 
                    className="w-full pl-4 pr-11 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 shadow-sm" 
                  />
                  <div 
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
                    style={{ backgroundColor: color }}
                  >
                    <input 
                      type="color" 
                      value={color.length === 7 && color.startsWith('#') ? color : '#10B981'} 
                      onChange={(e) => {
                        const val = e.target.value
                        setColor(val)
                        setTextColor(val)
                        setBgColor(val + '1F')
                      }} 
                      className="opacity-0 cursor-pointer w-full h-full absolute inset-0" 
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Live Preview</span>
                <span 
                  className="px-3.5 py-1 rounded-full text-xs font-bold shadow-sm transition-all"
                  style={{ color: textColor, backgroundColor: bgColor }}
                >
                  {statusName || 'Status Preview'}
                </span>
              </div>

              {/* Show on BDM Follow Up Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider cursor-pointer">
                  Show on BDM Follow Up
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowOnBdm(!showOnBdm)} 
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${showOnBdm ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showOnBdm ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Action Button */}
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-600/10 cursor-pointer flex justify-center items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Status' : 'Create Status'}
              </button>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Lead Status"
        description="Are you sure you want to delete this status? Leads currently holding this status will still reference its text name, but the status option will no longer be available in select lists."
      />
    </>
  )
}

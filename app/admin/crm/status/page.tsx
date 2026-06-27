'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Loader2, Edit3, Trash2, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface LeadStatus {
  id: string
  name: string
  text_color: string
  bg_color: string
  show_on_bdm: boolean
  created_at: string
}

export default function LeadStatusPage() {
  const [statuses, setStatuses] = useState<LeadStatus[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [statusName, setStatusName] = useState('')
  const [textColor, setTextColor] = useState('#10B981')
  const [bgColor, setBgColor] = useState('#E6F4EA')
  const [showOnBdm, setShowOnBdm] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Delete modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const fetchStatuses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/crm/status')
      const data = await res.json()
      if (data.success) {
        setStatuses(data.data)
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
    fetchStatuses()
  }, [fetchStatuses])

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
          show_on_bdm: showOnBdm
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingId ? 'Status updated successfully!' : 'Status created successfully!')
        setStatusName('')
        setTextColor('#10B981')
        setBgColor('#E6F4EA')
        setShowOnBdm(true)
        setEditingId(null)
        fetchStatuses()
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
    setTextColor(status.text_color || '#10B981')
    setBgColor(status.bg_color || '#E6F4EA')
    setShowOnBdm(!!status.show_on_bdm)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setStatusName('')
    setTextColor('#10B981')
    setBgColor('#E6F4EA')
    setShowOnBdm(true)
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
        fetchStatuses()
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
  const totalCount = statuses.length
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
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Title Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-8 py-5 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
          <h1 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight">Lead Status</h1>
        </div>

        {/* Create Status Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-3">
            {editingId ? 'Edit Status' : 'Create Status'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Status Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Status Name</label>
                <input
                  type="text"
                  placeholder="Enter Status Name"
                  value={statusName}
                  onChange={(e) => setStatusName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Text Color HEX & Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Text Color</label>
                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    placeholder="Choose a Color"
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                  <div className="w-11 h-11 rounded-xl border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="w-6 h-6 rounded-md shadow-sm" style={{ backgroundColor: textColor }} />
                  </div>
                </div>
              </div>

              {/* Background Color HEX & Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider">Background Color</label>
                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder="Choose Background Color"
                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                  <div className="w-11 h-11 rounded-xl border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="w-6 h-6 rounded-md shadow-sm" style={{ backgroundColor: bgColor }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Visibility */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-750 dark:text-slate-300 font-bold">Status show on BDM Follow up</label>
              <button
                type="button"
                onClick={() => setShowOnBdm(!showOnBdm)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showOnBdm ? 'bg-[#0E9485]' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showOnBdm ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Actions Submit / Cancel */}
            <div className="flex justify-end gap-3 mt-1">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-755 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-[#0F9E8F] hover:bg-[#0D8E80] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-500/10 cursor-pointer flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Card: Table & Navigation */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">All Status</h3>

          {/* Statuses Log Table */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-2xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#EBF6F6]/50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-750 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 w-16">S. No.</th>
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
                    const sNo = (currentPage - 1) * pageSize + idx + 1
                    const { date, time } = formatDateTime(st.created_at)
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-550 dark:text-slate-400">{sNo}.</td>
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
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'<<'}
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      pg === currentPage
                        ? 'bg-[#0E9485] text-white shadow-sm'
                        : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 disabled:text-slate-300 dark:disabled:text-slate-600 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 transition-colors cursor-pointer"
                >
                  {'>>'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Lead Status"
        description="Are you sure you want to delete this status? Leads currently holding this status will still reference its text name, but the status option will no longer be available in select lists."
      />
    </AdminLayout>
  )
}

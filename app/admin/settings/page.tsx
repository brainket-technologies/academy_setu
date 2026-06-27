'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Search, Loader2, Trash2, X, Plus, Filter, Download,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, FileText,
  Eye, Edit3, MapPin, Building2, Globe
} from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

interface StateRecord {
  id: string
  state_name: string
  districts: string[]
  created_at: string
}

export default function SettingsPage() {
  const [states, setStates] = useState<StateRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Form input states (Creation)
  const [newStateName, setNewStateName] = useState('')
  const [newDistrictInput, setNewDistrictInput] = useState('')
  const [newDistrictsList, setNewDistrictsList] = useState<string[]>([])
  const [submittingCreate, setSubmittingCreate] = useState(false)

  // Filter dropdown state
  const [filterStateId, setFilterStateId] = useState('All')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Modal States (View / Edit)
  const [viewStateId, setViewStateId] = useState<string | null>(null)
  const [editStateId, setEditStateId] = useState<string | null>(null)
  const [modalStateName, setModalStateName] = useState('')
  const [modalDistrictInput, setModalDistrictInput] = useState('')
  const [modalDistrictsList, setModalDistrictsList] = useState<string[]>([])
  const [submittingModal, setSubmittingModal] = useState(false)

  // Delete states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch all states from API
  const fetchStates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings/state-city')
      const data = await res.json()
      if (data.success) {
        setStates(data.data)
      } else {
        toast.error('Failed to load settings data')
      }
    } catch {
      toast.error('Error fetching settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStates()
  }, [fetchStates])

  // Creation: Add/Remove district pill
  const handleAddNewDistrict = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newDistrictInput.trim()
    if (!trimmed) return
    if (newDistrictsList.map(d => d.toLowerCase()).includes(trimmed.toLowerCase())) {
      toast.warning('District name already added')
      return
    }
    setNewDistrictsList(prev => [...prev, trimmed])
    setNewDistrictInput('')
  }

  const handleRemoveNewDistrict = (idx: number) => {
    setNewDistrictsList(prev => prev.filter((_, i) => i !== idx))
  }

  // Creation: Submit form
  const handleCreateState = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedState = newStateName.trim()
    if (!trimmedState) {
      toast.error('State Name is required')
      return
    }
    if (newDistrictsList.length === 0) {
      toast.error('Please add at least one district')
      return
    }

    setSubmittingCreate(true)
    try {
      const res = await fetch('/api/admin/settings/state-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state_name: trimmedState,
          districts: newDistrictsList
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('State and districts created successfully!')
        setNewStateName('')
        setNewDistrictsList([])
        fetchStates()
      } else {
        toast.error(data.error || 'Failed to create record')
      }
    } catch {
      toast.error('Connection error creating record')
    } finally {
      setSubmittingCreate(false)
    }
  }

  // Modal: Add/Remove district pill
  const handleAddModalDistrict = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = modalDistrictInput.trim()
    if (!trimmed) return
    if (modalDistrictsList.map(d => d.toLowerCase()).includes(trimmed.toLowerCase())) {
      toast.warning('District name already added')
      return
    }
    setModalDistrictsList(prev => [...prev, trimmed])
    setModalDistrictInput('')
  }

  const handleRemoveModalDistrict = (idx: number) => {
    setModalDistrictsList(prev => prev.filter((_, i) => i !== idx))
  }

  // Edit Modal: Open & Load
  const handleOpenEdit = (record: StateRecord) => {
    setEditStateId(record.id)
    setModalStateName(record.state_name)
    setModalDistrictsList(record.districts || [])
    setModalDistrictInput('')
  }

  // Edit Modal: Submit Update
  const handleUpdateState = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalStateName.trim()) {
      toast.error('State Name is required')
      return
    }
    if (modalDistrictsList.length === 0) {
      toast.error('Please add at least one district')
      return
    }

    setSubmittingModal(true)
    try {
      const res = await fetch(`/api/admin/settings/state-city/${editStateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state_name: modalStateName.trim(),
          districts: modalDistrictsList
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Record updated successfully!')
        setEditStateId(null)
        fetchStates()
      } else {
        toast.error(data.error || 'Failed to update record')
      }
    } catch {
      toast.error('Connection error updating record')
    } finally {
      setSubmittingModal(false)
    }
  }

  // View Details Modal: Open
  const handleOpenView = (record: StateRecord) => {
    setViewStateId(record.id)
    setModalStateName(record.state_name)
    setModalDistrictsList(record.districts || [])
  }

  // Delete Action: Confirm Submit
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/settings/state-city/${deleteTargetId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Record deleted successfully!')
        setDeleteTargetId(null)
        fetchStates()
      } else {
        toast.error(data.error || 'Failed to delete record')
      }
    } catch {
      toast.error('Connection error deleting record')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Filter & Search Logic
  const filteredStates = states.filter(row => {
    if (filterStateId !== 'All' && row.id !== filterStateId) return false
    return true
  })

  // Pagination Logic
  const totalCount = filteredStates.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const paginatedData = filteredStates.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
        {/* Header Titles */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure and manage administrative location hierarchies, state listings, and cities/districts.</p>
        </div>

        {/* SECTION 1: STATE & CITY CARD - Matches mockup 1 */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">State & City</h3>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
          </div>

          <form onSubmit={handleCreateState} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* State Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">State Name</label>
                <input
                  type="text"
                  placeholder="Enter State Name Ex : Uttarpradesh"
                  value={newStateName}
                  onChange={e => setNewStateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-semibold"
                />
              </div>

              {/* Districts Multi select pills */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">District</label>
                <div className="flex flex-wrap gap-2 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                  {newDistrictsList.map((dist, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50 rounded-full text-xs font-bold shadow-sm"
                    >
                      {dist}
                      <button
                        type="button"
                        onClick={() => handleRemoveNewDistrict(idx)}
                        className="text-teal-400 hover:text-teal-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  
                  {/* Inline input field to type a district and hit enter */}
                  <input
                    type="text"
                    placeholder="Type name + press Enter"
                    value={newDistrictInput}
                    onChange={e => setNewDistrictInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddNewDistrict(e)
                      }
                    }}
                    className="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none text-slate-700 dark:text-slate-200 py-0.5"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Press Enter to register district capsule.</p>
              </div>
            </div>

            {/* Create button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submittingCreate}
                className="px-12 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-600/10 transition-colors cursor-pointer flex items-center gap-2"
              >
                {submittingCreate && <Loader2 className="w-4 h-4 animate-spin" />}
                Create
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: ALL DATA TABLE - Matches mockup 1 */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-850 dark:text-slate-200 text-sm">All Data</h3>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
          </div>

          {/* Filter Dropdown */}
          <div className="w-72">
            <label className="block text-xs font-bold text-slate-655 dark:text-slate-450 mb-1.5">State Name</label>
            <select
              value={filterStateId}
              onChange={e => {
                setFilterStateId(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer font-semibold"
            >
              <option value="All">Select an Option</option>
              {states.map(st => (
                <option key={st.id} value={st.id}>{st.state_name}</option>
              ))}
            </select>
          </div>

          {/* Listing Table */}
          <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-3.5 px-6 w-20">S. No.</th>
                  <th className="py-3.5 px-6 w-56">State Name</th>
                  <th className="py-3.5 px-6">District Name</th>
                  <th className="py-3.5 px-6 text-center w-36">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-600 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                        <span className="text-xs font-semibold text-slate-400">Loading configurations...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-semibold italic">
                      No state configurations found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-400">{rowNum}.</td>
                        <td className="py-4 px-6 font-bold text-slate-750 dark:text-slate-200">{row.state_name}</td>
                        <td className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[320px]">
                          {row.districts && row.districts.length > 0
                            ? row.districts.join(', ')
                            : '-'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenView(row)}
                              className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors cursor-pointer"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(row)}
                              className="p-1.5 bg-green-50 dark:bg-green-950/40 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-xl transition-colors cursor-pointer"
                              title="Edit record"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(row.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors cursor-pointer"
                              title="Delete record"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} Entries
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage(1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 border border-slate-200 dark:border-slate-755 bg-white dark:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-teal-600 text-white border border-teal-600 rounded-lg text-xs font-bold">
                  {currentPage}
                </span>
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 border border-slate-200 dark:border-slate-755 bg-white dark:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1.5 border border-slate-200 dark:border-slate-755 bg-white dark:bg-slate-800 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODAL - Matches mockup 3 */}
      {viewStateId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0 cursor-default" onClick={() => setViewStateId(null)} />
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl p-6 w-full max-w-lg relative flex flex-col animate-in zoom-in-95 duration-200 z-10">
            <button
              type="button"
              onClick={() => setViewStateId(null)}
              className="absolute top-4 right-4 p-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 mb-6 flex items-center gap-2">
              View Info
            </h3>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-500 mb-1.5">State Name</label>
                <input
                  type="text"
                  disabled
                  value={modalStateName}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-slate-500 mb-1.5">Districts</label>
                <div className="flex flex-wrap gap-2 border border-slate-100 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-900 min-h-[44px]">
                  {modalDistrictsList.map((dist, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 bg-teal-50/50 dark:bg-teal-950/20 text-teal-500 dark:text-teal-400 border border-teal-100/50 dark:border-teal-900/30 rounded-full text-xs font-bold"
                    >
                      {dist}
                    </span>
                  ))}
                  {modalDistrictsList.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No districts assigned</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewStateId(null)}
                className="px-6 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL - Matches mockup 2 */}
      {editStateId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0 cursor-default" onClick={() => setEditStateId(null)} />
          <form
            onSubmit={handleUpdateState}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl p-6 w-full max-w-lg relative flex flex-col animate-in zoom-in-95 duration-200 z-10"
          >
            <button
              type="button"
              onClick={() => setEditStateId(null)}
              className="absolute top-4 right-4 p-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">
              Edit State & District
            </h3>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">State Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter state name"
                  value={modalStateName}
                  onChange={e => setModalStateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-450 mb-1.5">District / Cities *</label>
                <div className="flex flex-wrap gap-2 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                  {modalDistrictsList.map((dist, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50 rounded-full text-xs font-bold shadow-sm animate-in scale-in-95 duration-100"
                    >
                      {dist}
                      <button
                        type="button"
                        onClick={() => handleRemoveModalDistrict(idx)}
                        className="text-teal-400 hover:text-teal-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  
                  <input
                    type="text"
                    placeholder="Type name + Enter"
                    value={modalDistrictInput}
                    onChange={e => setModalDistrictInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddModalDistrict(e)
                      }
                    }}
                    className="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none text-slate-700 dark:text-slate-200 py-0.5"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setEditStateId(null)}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingModal}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingModal && <Loader2 className="w-4 h-4 animate-spin" />}
                Update
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete State Configuration"
        description="Are you sure you want to delete this state and city configuration? This action cannot be undone."
      />
    </AdminLayout>
  )
}

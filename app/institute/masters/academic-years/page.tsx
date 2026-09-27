'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, CheckCircle2, X, Search, Star, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface AcademicYearRecord {
  id: number
  yearName: string
  startDate: string
  endDate: string
  isCurrent: boolean
  status: 'Active' | 'Inactive' | 'Closed'
  description?: string
  lastUpdate: string
  deleted: boolean
}

const INITIAL_YEARS: AcademicYearRecord[] = [
  {
    id: 1,
    yearName: '2025-2026',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    isCurrent: true,
    status: 'Active',
    description: 'Current Academic Session 2025-2026',
    lastUpdate: '2026-01-01',
    deleted: false
  },
  {
    id: 2,
    yearName: '2026-2027',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    isCurrent: false,
    status: 'Active',
    description: 'Upcoming Academic Session 2026-2027',
    lastUpdate: '2026-01-01',
    deleted: false
  },
  {
    id: 3,
    yearName: '2024-2025',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    isCurrent: false,
    status: 'Closed',
    description: 'Previous Academic Session 2024-2025',
    lastUpdate: '2025-04-01',
    deleted: false
  }
]

export default function AcademicYearsPage() {
  const [years, setYears] = useState<AcademicYearRecord[]>(INITIAL_YEARS)
  const [activeTab, setActiveTab] = useState<'All' | 'Deleted'>('All')

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<AcademicYearRecord | null>(null)

  // Form State
  const [yearNameInput, setYearNameInput] = useState('')
  const [startDateInput, setStartDateInput] = useState('')
  const [endDateInput, setEndDateInput] = useState('')
  const [statusInput, setStatusInput] = useState<'Active' | 'Inactive' | 'Closed'>('Active')
  const [isCurrentInput, setIsCurrentInput] = useState(false)
  const [descriptionInput, setDescriptionInput] = useState('')
  const [formError, setFormError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('school_masters_academic_years')
    if (saved) {
      try {
        setYears(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_masters_academic_years', JSON.stringify(INITIAL_YEARS))
    }
  }, [])

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (type === 'success') {
      toast.success(msg)
    } else if (type === 'error') {
      toast.error(msg)
    } else {
      toast.info(msg)
    }
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2500)
  }

  const handleOpenAdd = () => {
    setYearNameInput('')
    setStartDateInput('')
    setEndDateInput('')
    setStatusInput('Active')
    setIsCurrentInput(false)
    setDescriptionInput('')
    setFormError('')
    setAddModalOpen(true)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const trimmedName = yearNameInput.trim()

    if (!trimmedName) {
      setFormError('Please enter an Academic Year (e.g. 2026-2027).')
      return
    }

    const todayStr = new Date().toISOString().split('T')[0]

    let updatedYears = [...years]
    if (isCurrentInput) {
      // Unset isCurrent from all others
      updatedYears = updatedYears.map(y => ({ ...y, isCurrent: false }))
    }

    const newRecord: AcademicYearRecord = {
      id: Date.now(),
      yearName: trimmedName,
      startDate: startDateInput || `${trimmedName.split('-')[0] || '2026'}-04-01`,
      endDate: endDateInput || `${trimmedName.split('-')[1] || '2027'}-03-31`,
      isCurrent: isCurrentInput,
      status: statusInput,
      description: descriptionInput.trim(),
      lastUpdate: todayStr,
      deleted: false
    }

    const finalYears = [newRecord, ...updatedYears]
    setYears(finalYears)
    localStorage.setItem('school_masters_academic_years', JSON.stringify(finalYears))

    setAddModalOpen(false)
    showToast(`Academic Year "${trimmedName}" created successfully!`)
  }

  const handleOpenEdit = (record: AcademicYearRecord) => {
    setSelectedYear(record)
    setYearNameInput(record.yearName)
    setStartDateInput(record.startDate)
    setEndDateInput(record.endDate)
    setStatusInput(record.status)
    setIsCurrentInput(record.isCurrent)
    setDescriptionInput(record.description || '')
    setFormError('')
    setEditModalOpen(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedYear) return
    setFormError('')

    const trimmedName = yearNameInput.trim()
    if (!trimmedName) {
      setFormError('Please enter Academic Year.')
      return
    }

    const todayStr = new Date().toISOString().split('T')[0]

    let updatedYears = years.map(y => {
      if (isCurrentInput && y.id !== selectedYear.id) {
        return { ...y, isCurrent: false }
      }
      if (y.id === selectedYear.id) {
        return {
          ...y,
          yearName: trimmedName,
          startDate: startDateInput,
          endDate: endDateInput,
          status: statusInput,
          isCurrent: isCurrentInput,
          description: descriptionInput.trim(),
          lastUpdate: todayStr
        }
      }
      return y
    })

    setYears(updatedYears)
    localStorage.setItem('school_masters_academic_years', JSON.stringify(updatedYears))

    setEditModalOpen(false)
    setSelectedYear(null)
    showToast(`Academic Year "${trimmedName}" updated successfully!`)
  }

  const handleSetCurrent = (id: number) => {
    const updated = years.map(y => ({
      ...y,
      isCurrent: y.id === id
    }))
    setYears(updated)
    localStorage.setItem('school_masters_academic_years', JSON.stringify(updated))
    const target = years.find(y => y.id === id)
    showToast(`Set "${target?.yearName}" as Current Academic Session!`)
  }

  const handleSoftDelete = (id: number) => {
    const target = years.find(y => y.id === id)
    if (!target) return
    if (confirm(`Are you sure you want to delete Academic Year "${target.yearName}"?`)) {
      const updated = years.map(y => y.id === id ? { ...y, deleted: true, isCurrent: false } : y)
      setYears(updated)
      localStorage.setItem('school_masters_academic_years', JSON.stringify(updated))
      showToast(`Academic Year "${target.yearName}" moved to deleted list.`, 'info')
    }
  }

  const handleRestore = (id: number) => {
    const target = years.find(y => y.id === id)
    if (!target) return
    const updated = years.map(y => y.id === id ? { ...y, deleted: false } : y)
    setYears(updated)
    localStorage.setItem('school_masters_academic_years', JSON.stringify(updated))
    showToast(`Academic Year "${target.yearName}" restored successfully!`)
  }

  const activeYears = years.filter(y => !y.deleted)
  const deletedYears = years.filter(y => y.deleted)

  const displayedList = (activeTab === 'All' ? activeYears : deletedYears).filter(y =>
    y.yearName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (y.description && y.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Academic Years</h1>
          <p className="text-xs text-slate-400">Configure academic sessions and set current active school year</p>
        </div>
      </div>

      {/* Control Actions & Search Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search academic year..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>

        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Academic Year
        </button>
      </div>

      {/* Active vs Deleted tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('All')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-black text-xs uppercase tracking-wider ${
            activeTab === 'All' 
              ? 'border-teal-600 bg-teal-50/15 text-teal-600 shadow-sm'
              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span>All Session</span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
            activeTab === 'All' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-650'
          }`}>
            {activeYears.length < 10 ? `0${activeYears.length}` : activeYears.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('Deleted')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-black text-xs uppercase tracking-wider ${
            activeTab === 'Deleted' 
              ? 'border-teal-600 bg-teal-50/15 text-teal-600 shadow-sm'
              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span>Deleted Session</span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
            activeTab === 'Deleted' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-650'
          }`}>
            {deletedYears.length < 10 ? `0${deletedYears.length}` : deletedYears.length}
          </span>
        </button>
      </div>

      {/* Table Listing */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Academic Year</th>
                <th className="px-4 py-4">Start Date</th>
                <th className="px-4 py-4">End Date</th>
                <th className="px-4 py-4">Current Session</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-left">Description</th>
                <th className="px-4 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedList.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-850 dark:text-slate-200 text-sm">
                    {item.yearName}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400">{item.startDate}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400">{item.endDate}</td>
                  <td className="px-4 py-3.5">
                    {item.isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-extrabold text-[10px]">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Current Session
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCurrent(item.id)}
                        className="text-[10px] font-bold text-slate-400 hover:text-teal-600 border border-slate-200 hover:border-teal-500 px-2.5 py-1 rounded-lg transition-all"
                      >
                        Set Current
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      item.status === 'Closed' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      'bg-red-50 text-red-500 border border-red-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-left text-slate-500 max-w-xs truncate">{item.description || '-'}</td>
                  <td className="px-4 py-3.5">
                    {activeTab === 'All' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 flex items-center justify-center transition-colors"
                          title="Edit Academic Year"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleSoftDelete(item.id)}
                          className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 flex items-center justify-center transition-colors"
                          title="Delete Academic Year"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleRestore(item.id)}
                          className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 flex items-center justify-center transition-colors"
                          title="Restore Academic Year"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {displayedList.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">No academic years found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black text-[#1b3a60] dark:text-slate-350 uppercase tracking-wider">
                Add Academic Year
              </span>
              <button 
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Academic Year Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 2026-2027"
                  value={yearNameInput}
                  onChange={e => setYearNameInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                  <input 
                    type="date"
                    value={startDateInput}
                    onChange={e => setStartDateInput(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">End Date</label>
                  <input 
                    type="date"
                    value={endDateInput}
                    onChange={e => setEndDateInput(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={statusInput}
                    onChange={e => setStatusInput(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-semibold outline-none focus:border-teal-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input 
                      type="checkbox"
                      checked={isCurrentInput}
                      onChange={e => setIsCurrentInput(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Set as Current Session</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <input 
                  type="text"
                  placeholder="e.g. Session notes"
                  value={descriptionInput}
                  onChange={e => setDescriptionInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                Save Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleUpdate}
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black text-[#1b3a60] dark:text-slate-350 uppercase tracking-wider">
                Edit Academic Year
              </span>
              <button 
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Academic Year Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 2026-2027"
                  value={yearNameInput}
                  onChange={e => setYearNameInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                  <input 
                    type="date"
                    value={startDateInput}
                    onChange={e => setStartDateInput(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">End Date</label>
                  <input 
                    type="date"
                    value={endDateInput}
                    onChange={e => setEndDateInput(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={statusInput}
                    onChange={e => setStatusInput(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-semibold outline-none focus:border-teal-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input 
                      type="checkbox"
                      checked={isCurrentInput}
                      onChange={e => setIsCurrentInput(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Set as Current Session</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <input 
                  type="text"
                  placeholder="e.g. Session notes"
                  value={descriptionInput}
                  onChange={e => setDescriptionInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                Update Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOAST ALERT */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

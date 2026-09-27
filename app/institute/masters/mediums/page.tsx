'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, X, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'

interface MediumRecord {
  id: number
  mediumName: string
  noOfStudents: number
  createdAt: string
  deleted: boolean
}

const INITIAL_MEDIUMS: MediumRecord[] = [
  {
    id: 1,
    mediumName: 'English',
    noOfStudents: 0,
    createdAt: '27/09/2026\n12:00 PM',
    deleted: false
  },
  {
    id: 2,
    mediumName: 'Hindi',
    noOfStudents: 0,
    createdAt: '27/09/2026\n12:00 PM',
    deleted: false
  }
]

export default function MediumsPage() {
  const [mediums, setMediums] = useState<MediumRecord[]>(INITIAL_MEDIUMS)
  const [activeTab, setActiveTab] = useState<'All' | 'Deleted'>('All')

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedMedium, setSelectedMedium] = useState<MediumRecord | null>(null)

  // Form state
  const [mediumNameInput, setMediumNameInput] = useState('')
  const [formError, setFormError] = useState('')

  // Filter Toggle state
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('school_masters_mediums')
    if (saved) {
      try {
        setMediums(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_masters_mediums', JSON.stringify(INITIAL_MEDIUMS))
    }
  }, [])

  const handleOpenAdd = () => {
    setMediumNameInput('')
    setFormError('')
    setAddModalOpen(true)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const trimmedName = mediumNameInput.trim().replace(/\s+/g, ' ')
    if (!trimmedName) {
      setFormError('Please enter a Medium Name.')
      return
    }

    // Check duplicate medium name (case-insensitive among active non-deleted mediums)
    const isDuplicate = mediums.some(
      m => !m.deleted && m.mediumName.trim().replace(/\s+/g, ' ').toLowerCase() === trimmedName.toLowerCase()
    )
    if (isDuplicate) {
      setFormError(`Medium name "${trimmedName}" already exists!`)
      return
    }

    const newMedium: MediumRecord = {
      id: Date.now(),
      mediumName: trimmedName,
      noOfStudents: 0,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      deleted: false
    }

    const updated = [newMedium, ...mediums]
    setMediums(updated)
    localStorage.setItem('school_masters_mediums', JSON.stringify(updated))

    setMediumNameInput('')
    setFormError('')
    setAddModalOpen(false)
    toast.success('Medium created successfully!')
  }

  const handleOpenEdit = (item: MediumRecord) => {
    setSelectedMedium(item)
    setMediumNameInput(item.mediumName)
    setFormError('')
    setEditModalOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMedium) return
    setFormError('')

    const trimmedName = mediumNameInput.trim().replace(/\s+/g, ' ')
    if (!trimmedName) {
      setFormError('Please enter a Medium Name.')
      return
    }

    // Check duplicate medium name (case-insensitive among other active mediums)
    const isDuplicate = mediums.some(
      m => !m.deleted && m.id !== selectedMedium.id && m.mediumName.trim().replace(/\s+/g, ' ').toLowerCase() === trimmedName.toLowerCase()
    )
    if (isDuplicate) {
      setFormError(`Medium name "${trimmedName}" already exists!`)
      return
    }

    const updated = mediums.map(m => {
      if (m.id === selectedMedium.id) {
        return {
          ...m,
          mediumName: trimmedName
        }
      }
      return m
    })

    setMediums(updated)
    localStorage.setItem('school_masters_mediums', JSON.stringify(updated))
    setEditModalOpen(false)
    setSelectedMedium(null)
    setMediumNameInput('')
    setFormError('')
    toast.success('Medium updated successfully!')
  }

  const handleDelete = (id: number) => {
    const updated = mediums.map(m => m.id === id ? { ...m, deleted: true } : m)
    setMediums(updated)
    localStorage.setItem('school_masters_mediums', JSON.stringify(updated))
    toast.info('Medium moved to deleted list!')
  }

  const handleRestore = (id: number) => {
    const updated = mediums.map(m => m.id === id ? { ...m, deleted: false } : m)
    setMediums(updated)
    localStorage.setItem('school_masters_mediums', JSON.stringify(updated))
    toast.success('Medium restored successfully!')
  }

  const tabCountAll = mediums.filter(m => !m.deleted).length
  const tabCountDeleted = mediums.filter(m => m.deleted).length

  // Filter logic
  const filtered = mediums.filter(m => {
    const matchesTab = activeTab === 'All' ? !m.deleted : m.deleted
    const matchesSearch = searchQuery ? m.mediumName.toLowerCase().includes(searchQuery.toLowerCase()) : true
    return matchesTab && matchesSearch
  })

  return (
    <div className="w-full pb-10 animate-in fade-in duration-300">
      
      {/* Single Unified Card */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-6">

        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h1 className="text-xl font-black text-slate-800">Mediums</h1>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medium</span>
          </button>
        </div>

        {/* Tabs and Filter Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('All')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'All' ? 'bg-teal-600 text-white border-teal-500 font-black' : 'bg-white border text-slate-650 hover:bg-slate-50'}`}
            >
              All <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === 'All' ? 'bg-teal-750 text-white' : 'bg-slate-100 text-slate-600'}`}>{String(tabCountAll).padStart(2, '0')}</span>
            </button>
            <button
              onClick={() => setActiveTab('Deleted')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'Deleted' ? 'bg-teal-600 text-white border-teal-500 font-black' : 'bg-white border text-slate-655 hover:bg-slate-50'}`}
            >
              Deleted <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === 'Deleted' ? 'bg-teal-750 text-white' : 'bg-slate-100 text-slate-600'}`}>{String(tabCountDeleted).padStart(2, '0')}</span>
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-colors ${showFilters ? 'bg-slate-100 text-slate-800' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {/* Toggleable Filters Panel */}
        {showFilters && (
          <div className="bg-slate-50 border rounded-2xl p-5 text-xs font-semibold text-slate-700 animate-in slide-in-from-top-3 duration-200">
            <div className="flex flex-col gap-1.5 max-w-md">
              <label className="text-slate-500 font-bold">Search Medium</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search medium name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg bg-white outline-none font-bold text-slate-700 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs text-slate-700">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4 text-left">Medium Name</th>
                <th className="px-3 py-4">No. of Students</th>
                <th className="px-3 py-4 w-36">Create At</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-800">{item.mediumName}</td>
                  <td className="px-3 py-3.5 text-slate-600 font-bold">{String(item.noOfStudents).padStart(2, '0')}</td>
                  <td className="px-3 py-3.5 text-slate-500 text-[10px] whitespace-pre-line leading-tight">{item.createdAt}</td>
                  <td className="px-3 py-3.5">
                    {activeTab === 'All' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(item.id)}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 mx-auto"
                        title="Restore"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                    No mediums found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medium Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-md p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 mb-4">Create Medium</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {formError && (
                <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-150">
                  <span>{formError}</span>
                  <button type="button" onClick={() => setFormError('')} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Medium Name</label>
                <input
                  type="text"
                  placeholder="e.g. English"
                  value={mediumNameInput}
                  onChange={e => {
                    setMediumNameInput(e.target.value)
                    if (formError) setFormError('')
                  }}
                  className="w-full px-4 py-2 border rounded-lg outline-none font-bold focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Medium Modal */}
      {editModalOpen && selectedMedium && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-md p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 mb-4">Edit Medium</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-150">
                  <span>{formError}</span>
                  <button type="button" onClick={() => setFormError('')} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Medium Name</label>
                <input
                  type="text"
                  placeholder="e.g. English"
                  value={mediumNameInput}
                  onChange={e => {
                    setMediumNameInput(e.target.value)
                    if (formError) setFormError('')
                  }}
                  className="w-full px-4 py-2 border rounded-lg outline-none font-bold focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

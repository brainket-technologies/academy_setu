'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, CheckCircle2, X, Search, Filter } from 'lucide-react'

interface SubjectGroupRecord {
  id: number
  groupName: string
  noOfSubjects: number
  createdAt: string
  deleted: boolean
}

const INITIAL_GROUPS: SubjectGroupRecord[] = [
  { id: 1, groupName: 'PCM', noOfSubjects: 3, createdAt: '15/09/2025\n11:00 AM', deleted: false },
  { id: 2, groupName: 'ZBC', noOfSubjects: 4, createdAt: '15/09/2025\n11:00 AM', deleted: false },
  { id: 3, groupName: 'Accounts', noOfSubjects: 2, createdAt: '15/09/2025\n11:00 AM', deleted: false },
  { id: 4, groupName: 'Arts', noOfSubjects: 5, createdAt: '15/09/2025\n11:00 AM', deleted: true },
]

export default function SubjectGroupsPage() {
  const [groups, setGroups] = useState<SubjectGroupRecord[]>(INITIAL_GROUPS)
  const [activeTab, setActiveTab] = useState<'All' | 'Deleted'>('All')

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<SubjectGroupRecord | null>(null)

  // Form State
  const [groupNameInput, setGroupNameInput] = useState('')

  // Filter Toggle state
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_masters_subject_groups')
    if (saved) {
      try {
        setGroups(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_masters_subject_groups', JSON.stringify(INITIAL_GROUPS))
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2500)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupNameInput.trim()) {
      alert('Please enter a Group Name.')
      return
    }

    const newGroup: SubjectGroupRecord = {
      id: Date.now(),
      groupName: groupNameInput.trim(),
      noOfSubjects: 0,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      deleted: false
    }

    const updated = [newGroup, ...groups]
    setGroups(updated)
    localStorage.setItem('school_masters_subject_groups', JSON.stringify(updated))

    setGroupNameInput('')
    setAddModalOpen(false)
    showToast('Subject Group created successfully!')
  }

  const handleOpenEdit = (item: SubjectGroupRecord) => {
    setSelectedGroup(item)
    setGroupNameInput(item.groupName)
    setEditModalOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroup || !groupNameInput.trim()) return

    const updated = groups.map(g => {
      if (g.id === selectedGroup.id) {
        return {
          ...g,
          groupName: groupNameInput.trim()
        }
      }
      return g
    })

    setGroups(updated)
    localStorage.setItem('school_masters_subject_groups', JSON.stringify(updated))
    setEditModalOpen(false)
    setSelectedGroup(null)
    setGroupNameInput('')
    showToast('Subject Group updated successfully!')
  }

  const handleDelete = (id: number) => {
    const updated = groups.map(g => g.id === id ? { ...g, deleted: true } : g)
    setGroups(updated)
    localStorage.setItem('school_masters_subject_groups', JSON.stringify(updated))
    showToast('Subject Group moved to deleted list!')
  }

  const handleRestore = (id: number) => {
    const updated = groups.map(g => g.id === id ? { ...g, deleted: false } : g)
    setGroups(updated)
    localStorage.setItem('school_masters_subject_groups', JSON.stringify(updated))
    showToast('Subject Group restored successfully!')
  }

  const tabCountAll = groups.filter(g => !g.deleted).length
  const tabCountDeleted = groups.filter(g => g.deleted).length

  // Filter logic
  const filtered = groups.filter(g => {
    const matchesTab = activeTab === 'All' ? !g.deleted : g.deleted
    const matchesSearch = searchQuery ? g.groupName.toLowerCase().includes(searchQuery.toLowerCase()) : true
    return matchesTab && matchesSearch
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header bar */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">Subject Groups</h1>
        <button
          onClick={() => {
            setGroupNameInput('')
            setAddModalOpen(true)
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject Group</span>
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
        <div className="bg-white border rounded-2xl p-5 shadow-sm text-xs font-semibold text-slate-700 animate-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col gap-1.5 max-w-md">
            <label className="text-slate-500 font-bold">Search Subject Group</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search subject group..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs text-slate-700">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4 text-left">Subject Group Name</th>
                <th className="px-3 py-4">No. of Subject</th>
                <th className="px-3 py-4 w-36">Create At</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-800">{item.groupName}</td>
                  <td className="px-3 py-3.5 text-slate-600 font-bold">{String(item.noOfSubjects).padStart(2, '0')}</td>
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
                    No subject groups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subject Group Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-md p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 mb-4">Create Subject Group</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Subject Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. PCM"
                  value={groupNameInput}
                  onChange={e => setGroupNameInput(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none font-bold bg-white"
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

      {/* Edit Subject Group Modal */}
      {editModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-md p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 mb-4">Edit Subject Group</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Subject Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. PCM"
                  value={groupNameInput}
                  onChange={e => setGroupNameInput(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none font-bold bg-white"
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

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

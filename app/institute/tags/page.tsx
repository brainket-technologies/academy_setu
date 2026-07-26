'use client'

import React, { useState, useEffect } from 'react'
import { Search, Pencil, Trash2, CheckCircle2, Plus, X, Filter } from 'lucide-react'

interface TagRecord {
  id: number
  name: string
  totalUser: number
  createdAt: string
}

const INITIAL_TAGS: TagRecord[] = [
  { id: 1, name: 'Children Caretaker', totalUser: 2, createdAt: '15/09/2025\n11:00 AM' },
  { id: 2, name: 'Security', totalUser: 2, createdAt: '15/09/2025\n11:00 AM' },
  { id: 3, name: 'Receptionist', totalUser: 2, createdAt: '15/09/2025\n11:00 AM' },
  { id: 4, name: 'Accountant', totalUser: 2, createdAt: '15/09/2025\n11:00 AM' },
  { id: 5, name: 'Assistant Manager', totalUser: 2, createdAt: '15/09/2025\n11:00 AM' },
  { id: 6, name: 'Peon', totalUser: 2, createdAt: '15/09/2025\n11:00 AM' },
  { id: 7, name: 'Counsellor', totalUser: 2, createdAt: '15/09/2025\n11:00 AM' },
]

export default function TagsPage() {
  const [tags, setTags] = useState<TagRecord[]>(INITIAL_TAGS)

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagRecord | null>(null)

  // Form State
  const [tagNameInput, setTagNameInput] = useState('')

  // Filter Toggle state
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_tags')
    if (saved) {
      try {
        setTags(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_tags', JSON.stringify(INITIAL_TAGS))
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2500)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagNameInput.trim()) return

    const newTag: TagRecord = {
      id: Date.now(),
      name: tagNameInput.trim(),
      totalUser: 0,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    const updated = [newTag, ...tags]
    setTags(updated)
    localStorage.setItem('school_tags', JSON.stringify(updated))
    setTagNameInput('')
    setAddModalOpen(false)
    showToast('Tag created successfully!')
  }

  const handleOpenEdit = (tag: TagRecord) => {
    setSelectedTag(tag)
    setTagNameInput(tag.name)
    setEditModalOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTag || !tagNameInput.trim()) return

    const updated = tags.map(t => t.id === selectedTag.id ? { ...t, name: tagNameInput.trim() } : t)
    setTags(updated)
    localStorage.setItem('school_tags', JSON.stringify(updated))
    setEditModalOpen(false)
    setSelectedTag(null)
    setTagNameInput('')
    showToast('Tag updated successfully!')
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      const updated = tags.filter(t => t.id !== id)
      setTags(updated)
      localStorage.setItem('school_tags', JSON.stringify(updated))
      showToast('Tag deleted successfully!')
    }
  }

  // Filter based on search field
  const filtered = tags.filter(t => {
    return t.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">Tags</h1>
        <button
          onClick={() => {
            setTagNameInput('')
            setAddModalOpen(true)
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tag</span>
        </button>
      </div>

      {/* Filter Action Row */}
      <div className="flex items-center justify-end">
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
            <label className="text-slate-500 font-bold">Search Tag Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tag by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg outline-none font-bold text-slate-700 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs text-slate-700">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4 text-left">Name</th>
                <th className="px-3 py-4">Total User</th>
                <th className="px-3 py-4 w-36">Created At</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-800">{item.name}</td>
                  <td className="px-3 py-3.5 text-slate-600 font-bold">{String(item.totalUser).padStart(2, '0')}</td>
                  <td className="px-3 py-3.5 text-slate-500 text-[10px] whitespace-pre-line leading-tight">{item.createdAt}</td>
                  <td className="px-3 py-3.5">
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
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                    No tags found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-slate-450 font-semibold">
          <p>Showing 1-{filtered.length} of {filtered.length} Entries</p>
        </div>
      </div>

      {/* Add Tag Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-md p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 mb-4">Create Tag</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Tag Name</label>
                <input
                  type="text"
                  placeholder="e.g. Children Caretaker"
                  value={tagNameInput}
                  onChange={e => setTagNameInput(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none font-bold"
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

      {/* Edit Tag Modal */}
      {editModalOpen && selectedTag && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-3xl shadow-2xl w-full max-w-md p-6 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black text-[#1b3a60] border-b pb-2 mb-4">Edit Tag</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Tag Name</label>
                <input
                  type="text"
                  placeholder="e.g. Children Caretaker"
                  value={tagNameInput}
                  onChange={e => setTagNameInput(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none font-bold"
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

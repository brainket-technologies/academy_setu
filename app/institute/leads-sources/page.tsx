'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, CheckCircle2, X, Search, Filter, Layers, Users, Globe, Tag } from 'lucide-react'
import { fetchLeadSources, saveLeadSource, deleteLeadSource } from './actions'

interface LeadSourceRecord {
  id: string | number
  category_name: string
  is_user_role: boolean
  user_role: string | null
  options: string[]
  created_at: string
  deleted?: boolean
}

const INITIAL_LEAD_SOURCES: LeadSourceRecord[] = [
  {
    id: 'src-1',
    category_name: 'Social Media',
    is_user_role: false,
    user_role: null,
    options: ['Facebook', 'Instagram', 'YouTube', 'LinkedIn'],
    created_at: '2026-09-27T12:00:00.000Z',
    deleted: false
  },
  {
    id: 'src-2',
    category_name: 'Teacher / Staff Referral',
    is_user_role: true,
    user_role: 'Teacher',
    options: [],
    created_at: '2026-09-28T10:30:00.000Z',
    deleted: false
  },
  {
    id: 'src-3',
    category_name: 'Walk-in / Direct Visit',
    is_user_role: false,
    user_role: null,
    options: ['Campus Enquiry', 'Front Desk'],
    created_at: '2026-09-29T14:15:00.000Z',
    deleted: false
  },
  {
    id: 'src-4',
    category_name: 'Newspaper & Print Media',
    is_user_role: false,
    user_role: null,
    options: ['Times of India', 'Dainik Jagran', 'Pamphlet / Flyer'],
    created_at: '2026-09-30T09:00:00.000Z',
    deleted: false
  },
  {
    id: 'src-5',
    category_name: 'Website / Google Search',
    is_user_role: false,
    user_role: null,
    options: ['Organic Search', 'Google Ads', 'Website Form'],
    created_at: '2026-10-01T16:45:00.000Z',
    deleted: false
  },
  {
    id: 'src-6',
    category_name: 'Existing Student / Alumni',
    is_user_role: true,
    user_role: 'Student',
    options: [],
    created_at: '2026-10-02T11:20:00.000Z',
    deleted: false
  }
]

export default function LeadsSourcesPage() {
  const [sources, setSources] = useState<LeadSourceRecord[]>(INITIAL_LEAD_SOURCES)
  const [activeTab, setActiveTab] = useState<'All' | 'Deleted'>('All')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<LeadSourceRecord | null>(null)

  // Form State
  const [categoryName, setCategoryName] = useState('')
  const [isUserRole, setIsUserRole] = useState(false)
  const [userRole, setUserRole] = useState('Teacher')
  const [options, setOptions] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Filter Toggle state
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Toast State
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2500)
  }

  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    setLoading(true)
    try {
      const res = await fetchLeadSources()
      if (res.success && res.data && res.data.length > 0) {
        const formatted: LeadSourceRecord[] = res.data.map((item: any) => ({
          id: item.id,
          category_name: item.category_name,
          is_user_role: Boolean(item.is_user_role),
          user_role: item.user_role || null,
          options: Array.isArray(item.options)
            ? item.options
            : typeof item.options === 'string'
            ? (() => {
                try {
                  return JSON.parse(item.options)
                } catch {
                  return []
                }
              })()
            : [],
          created_at: item.created_at || new Date().toISOString(),
          deleted: false
        }))
        setSources(formatted)
        localStorage.setItem('school_masters_lead_sources', JSON.stringify(formatted))
      } else {
        const saved = localStorage.getItem('school_masters_lead_sources')
        if (saved) {
          try {
            setSources(JSON.parse(saved))
          } catch {
            setSources(INITIAL_LEAD_SOURCES)
          }
        } else {
          setSources(INITIAL_LEAD_SOURCES)
          localStorage.setItem('school_masters_lead_sources', JSON.stringify(INITIAL_LEAD_SOURCES))
        }
      }
    } catch (e) {
      console.error(e)
      const saved = localStorage.getItem('school_masters_lead_sources')
      if (saved) {
        try {
          setSources(JSON.parse(saved))
        } catch {
          setSources(INITIAL_LEAD_SOURCES)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setCategoryName('')
    setIsUserRole(false)
    setUserRole('Teacher')
    setOptions([])
    setTagInput('')
    setAddModalOpen(true)
  }

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return
    e.preventDefault()
    const trimmed = tagInput.trim()
    if (trimmed && !options.includes(trimmed)) {
      setOptions([...options, trimmed])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setOptions(options.filter(t => t !== tagToRemove))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) {
      alert('Please enter a Category / Source Name.')
      return
    }

    setSubmitting(true)
    const newRecord: LeadSourceRecord = {
      id: `src-${Date.now()}`,
      category_name: categoryName.trim(),
      is_user_role: isUserRole,
      user_role: isUserRole ? userRole : null,
      options: isUserRole ? [] : options,
      created_at: new Date().toISOString(),
      deleted: false
    }

    try {
      const res = await saveLeadSource({
        categoryName: categoryName.trim(),
        isUserRole,
        userRole: isUserRole ? userRole : null,
        options: isUserRole ? [] : options
      })
      if (res.success && res.id) {
        newRecord.id = res.id
      }
    } catch (err) {
      console.error('Database save failed, using local master storage', err)
    }

    const updated = [newRecord, ...sources]
    setSources(updated)
    localStorage.setItem('school_masters_lead_sources', JSON.stringify(updated))

    setAddModalOpen(false)
    setSubmitting(false)
    showToast('Lead Source created successfully!')
  }

  const handleOpenEdit = (item: LeadSourceRecord) => {
    setSelectedSource(item)
    setCategoryName(item.category_name)
    setIsUserRole(Boolean(item.is_user_role))
    setUserRole(item.user_role || 'Teacher')
    setOptions(item.options || [])
    setTagInput('')
    setEditModalOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSource || !categoryName.trim()) return

    const updated = sources.map(s => {
      if (s.id === selectedSource.id) {
        return {
          ...s,
          category_name: categoryName.trim(),
          is_user_role: isUserRole,
          user_role: isUserRole ? userRole : null,
          options: isUserRole ? [] : options
        }
      }
      return s
    })

    setSources(updated)
    localStorage.setItem('school_masters_lead_sources', JSON.stringify(updated))
    setEditModalOpen(false)
    setSelectedSource(null)
    showToast('Lead Source updated successfully!')
  }

  const handleDelete = async (id: string | number) => {
    try {
      await deleteLeadSource(String(id))
    } catch (e) {
      console.error(e)
    }

    const updated = sources.map(s => (s.id === id ? { ...s, deleted: true } : s))
    setSources(updated)
    localStorage.setItem('school_masters_lead_sources', JSON.stringify(updated))
    showToast('Lead Source moved to deleted list!')
  }

  const handleRestore = (id: string | number) => {
    const updated = sources.map(s => (s.id === id ? { ...s, deleted: false } : s))
    setSources(updated)
    localStorage.setItem('school_masters_lead_sources', JSON.stringify(updated))
    showToast('Lead Source restored successfully!')
  }

  const tabCountAll = sources.filter(s => !s.deleted).length
  const tabCountDeleted = sources.filter(s => s.deleted).length

  // Filter Logic
  const filtered = sources.filter(s => {
    const matchesTab = activeTab === 'All' ? !s.deleted : s.deleted
    const matchesSearch = searchQuery
      ? s.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.user_role && s.user_role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.options?.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()))
      : true

    const matchesType =
      typeFilter === 'role'
        ? s.is_user_role
        : typeFilter === 'direct'
        ? !s.is_user_role
        : true

    return matchesTab && matchesSearch && matchesType
  })

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-teal-400" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">Lead Sources</h1>
            <p className="text-xs text-slate-500 font-medium">Manage student admission inquiry and CRM lead channels</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-all text-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Lead Source
        </button>
      </div>

      {/* Navigation and Actions */}
      <div className="flex items-center justify-between gap-4">
        {/* Tab Badges */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('All')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm ${
              activeTab === 'All'
                ? 'bg-slate-900 text-white shadow-slate-200'
                : 'bg-white border text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'All' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tabCountAll < 10 ? `0${tabCountAll}` : tabCountAll}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('Deleted')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm ${
              activeTab === 'Deleted'
                ? 'bg-rose-600 text-white shadow-rose-200'
                : 'bg-white border text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Deleted</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'Deleted' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tabCountDeleted < 10 ? `0${tabCountDeleted}` : tabCountDeleted}
            </span>
          </button>
        </div>

        {/* Filter Drawer Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${
            showFilters || searchQuery || typeFilter
              ? 'bg-teal-50 border-teal-300 text-teal-700'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          {(searchQuery || typeFilter) && (
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
          )}
        </button>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-teal-600" />
              Filter Lead Sources
            </span>
            {(searchQuery || typeFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setTypeFilter('')
                }}
                className="text-[11px] font-bold text-rose-500 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500">Search by Source Name / Keyword</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search lead source, role or sub-option..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500">Source Type</label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              >
                <option value="">All Source Types</option>
                <option value="direct">Direct / General Sources</option>
                <option value="role">User Role Based (Staff / Teacher / Student)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col gap-4">
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-4 text-center w-16">S. No.</th>
                  <th className="py-4 px-6">Source / Category Name</th>
                  <th className="py-4 px-6 text-center">Source Type</th>
                  <th className="py-4 px-6">Associated Details / Sub-Channels</th>
                  <th className="py-4 px-6 text-center">Created At</th>
                  <th className="py-4 px-4 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-teal-600 border-t-transparent mb-2"></div>
                      <p className="text-xs font-semibold">Loading Lead Sources...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Layers className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold">
                        {activeTab === 'Deleted' ? 'No deleted lead sources found' : 'No lead sources found'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => {
                    const createdDate = new Date(item.created_at)
                    const dateStr = isNaN(createdDate.getTime())
                      ? item.created_at
                      : createdDate.toLocaleDateString('en-GB')
                    const timeStr = isNaN(createdDate.getTime())
                      ? ''
                      : createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 text-center text-slate-500 font-semibold">
                          {index + 1 < 10 ? `0${index + 1}` : index + 1}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800 text-[13px]">{item.category_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {item.is_user_role ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                              <Users className="w-3 h-3" />
                              User Role Based
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100">
                              <Globe className="w-3 h-3" />
                              Direct / General
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {item.is_user_role ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700">
                              Role: <span className="text-purple-700">{item.user_role || 'Staff'}</span>
                            </span>
                          ) : item.options && item.options.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-sm">
                              {item.options.map((opt, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200"
                                >
                                  <Tag className="w-2.5 h-2.5 text-teal-600" />
                                  {opt}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic font-normal">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] font-bold text-slate-700">{dateStr}</span>
                            {timeStr && <span className="text-[10px] font-medium text-slate-400">{timeStr}</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {activeTab === 'All' ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors shadow-sm"
                                title="Edit Lead Source"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors shadow-sm"
                                title="Delete Lead Source"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleRestore(item.id)}
                                className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-colors shadow-sm"
                                title="Restore Lead Source"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-2 pt-2">
          <span>
            Showing {filtered.length > 0 ? 1 : 0}-{filtered.length} of {filtered.length} Entries
          </span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400 text-xs">
              «
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400 text-xs">
              ‹
            </button>
            <button className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
              1
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-teal-600 text-xs font-bold">
              ›
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-teal-600 text-xs font-bold">
              »
            </button>
          </div>
        </div>
      </div>

      {/* ===== ADD LEAD SOURCE MODAL ===== */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-800">Add Lead Source</h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600 font-bold">
                  Category / Source Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Social Media, Teacher Referral, Walk-in, Google"
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  className="px-3.5 py-2.5 border rounded-xl outline-none font-bold bg-white focus:ring-2 focus:ring-teal-500 border-slate-200"
                  required
                />
              </div>

              {/* Source Type Selection */}
              <div className="flex flex-col gap-2 pt-1">
                <label className="text-slate-600 font-bold">Lead Source Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setIsUserRole(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      !isUserRole
                        ? 'border-teal-500 bg-teal-50/40 text-teal-800 font-black'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-bold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sourceType"
                      checked={!isUserRole}
                      onChange={() => setIsUserRole(false)}
                      className="accent-teal-600"
                    />
                    <span>Direct / Sub-Channels</span>
                  </label>

                  <label
                    onClick={() => setIsUserRole(true)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      isUserRole
                        ? 'border-purple-500 bg-purple-50/40 text-purple-800 font-black'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-bold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sourceType"
                      checked={isUserRole}
                      onChange={() => setIsUserRole(true)}
                      className="accent-purple-600"
                    />
                    <span>User Role Based</span>
                  </label>
                </div>
              </div>

              {/* Role Dropdown if isUserRole */}
              {isUserRole ? (
                <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
                  <label className="text-slate-600 font-bold">Associated User Role</label>
                  <select
                    value={userRole}
                    onChange={e => setUserRole(e.target.value)}
                    className="px-3 py-2.5 border rounded-xl bg-white outline-none font-bold text-slate-700 border-slate-200 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Staff">Staff / Employee</option>
                    <option value="Student">Student / Alumni</option>
                    <option value="Parent">Parent</option>
                    <option value="Driver">Driver / Transport</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              ) : (
                /* Sub-options tags */
                <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
                  <label className="text-slate-600 font-bold">
                    Sub-Channels / Options <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a sub-channel (e.g. Instagram, Facebook) and press Add"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="flex-1 px-3.5 py-2 border rounded-xl outline-none font-bold bg-white focus:ring-2 focus:ring-teal-500 border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      Add
                    </button>
                  </div>
                  {options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {options.map((opt, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200"
                        >
                          {opt}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(opt)}
                            className="hover:text-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
                >
                  {submitting ? 'Creating...' : 'Create Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT LEAD SOURCE MODAL ===== */}
      {editModalOpen && selectedSource && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-800">Edit Lead Source</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-600 font-bold">
                  Category / Source Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Social Media, Teacher Referral, Walk-in, Google"
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  className="px-3.5 py-2.5 border rounded-xl outline-none font-bold bg-white focus:ring-2 focus:ring-teal-500 border-slate-200"
                  required
                />
              </div>

              {/* Source Type Selection */}
              <div className="flex flex-col gap-2 pt-1">
                <label className="text-slate-600 font-bold">Lead Source Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setIsUserRole(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      !isUserRole
                        ? 'border-teal-500 bg-teal-50/40 text-teal-800 font-black'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-bold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="editSourceType"
                      checked={!isUserRole}
                      onChange={() => setIsUserRole(false)}
                      className="accent-teal-600"
                    />
                    <span>Direct / Sub-Channels</span>
                  </label>

                  <label
                    onClick={() => setIsUserRole(true)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      isUserRole
                        ? 'border-purple-500 bg-purple-50/40 text-purple-800 font-black'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-bold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="editSourceType"
                      checked={isUserRole}
                      onChange={() => setIsUserRole(true)}
                      className="accent-purple-600"
                    />
                    <span>User Role Based</span>
                  </label>
                </div>
              </div>

              {/* Role Dropdown if isUserRole */}
              {isUserRole ? (
                <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
                  <label className="text-slate-600 font-bold">Associated User Role</label>
                  <select
                    value={userRole}
                    onChange={e => setUserRole(e.target.value)}
                    className="px-3 py-2.5 border rounded-xl bg-white outline-none font-bold text-slate-700 border-slate-200 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Staff">Staff / Employee</option>
                    <option value="Student">Student / Alumni</option>
                    <option value="Parent">Parent</option>
                    <option value="Driver">Driver / Transport</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              ) : (
                /* Sub-options tags */
                <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
                  <label className="text-slate-600 font-bold">
                    Sub-Channels / Options <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a sub-channel (e.g. Instagram, Facebook) and press Add"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="flex-1 px-3.5 py-2 border rounded-xl outline-none font-bold bg-white focus:ring-2 focus:ring-teal-500 border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      Add
                    </button>
                  </div>
                  {options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {options.map((opt, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200"
                        >
                          {opt}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(opt)}
                            className="hover:text-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
                >
                  Update Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

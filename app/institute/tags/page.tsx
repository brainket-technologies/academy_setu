'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Tag as TagIcon, Search, Plus, Pencil, Trash2, CheckCircle2,
  X, Filter, Users, UserCheck, GraduationCap, Briefcase,
  Calendar, Check, Sparkles, Layers, Shield
} from 'lucide-react'

interface TagRecord {
  id: number
  name: string
  color: string
  scope: 'All' | 'Staff' | 'Student' | 'General'
  description?: string
  totalUser: number
  createdAt: string
}

const PRESET_COLORS = [
  { name: 'Teal', hex: '#0D9488', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  { name: 'Blue', hex: '#2563EB', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Emerald', hex: '#059669', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Amber', hex: '#D97706', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Purple', hex: '#7C3AED', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Rose', hex: '#E11D48', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  { name: 'Orange', hex: '#EA580C', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Pink', hex: '#DB2777', bg: 'bg-pink-50 text-pink-700 border-pink-200' }
]

const INITIAL_TAGS: TagRecord[] = [
  {
    id: 1,
    name: 'Bus Incharge',
    color: '#D97706',
    scope: 'Staff',
    description: 'Faculty in charge of daily student transport routes and bus safety.',
    totalUser: 8,
    createdAt: '15/10/2026 09:30 AM'
  },
  {
    id: 2,
    name: 'Exam Invigilator',
    color: '#2563EB',
    scope: 'Staff',
    description: 'Assigned teachers for term exams, unit tests, and board evaluations.',
    totalUser: 18,
    createdAt: '18/10/2026 11:15 AM'
  },
  {
    id: 3,
    name: 'Science Club Head',
    color: '#0D9488',
    scope: 'Student',
    description: 'Senior students leading STEM robotics, science fair, and laboratory activities.',
    totalUser: 14,
    createdAt: '20/10/2026 02:40 PM'
  },
  {
    id: 4,
    name: 'Hostel Prefect',
    color: '#7C3AED',
    scope: 'Student',
    description: 'Residential leaders managing dormitory floor check-ins and discipline.',
    totalUser: 6,
    createdAt: '22/10/2026 04:20 PM'
  },
  {
    id: 5,
    name: 'First Aid Responder',
    color: '#E11D48',
    scope: 'Staff',
    description: 'Certified teachers and assistants for immediate medical response and wellness room.',
    totalUser: 5,
    createdAt: '25/10/2026 10:00 AM'
  },
  {
    id: 6,
    name: 'Cultural Committee',
    color: '#059669',
    scope: 'General',
    description: 'Combined committee of students and mentors organizing annual events and festivals.',
    totalUser: 22,
    createdAt: '28/10/2026 01:15 PM'
  }
]

export default function TagsPage() {
  const [tags, setTags] = useState<TagRecord[]>(INITIAL_TAGS)

  // Modals state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTagId, setEditingTagId] = useState<number | null>(null)

  // Form State
  const [tagName, setTagName] = useState('')
  const [tagColor, setTagColor] = useState('#0D9488')
  const [tagScope, setTagScope] = useState<'All' | 'Staff' | 'Student' | 'General'>('Staff')
  const [tagDescription, setTagDescription] = useState('')

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [scopeFilter, setScopeFilter] = useState<'All' | 'Staff' | 'Student' | 'General'>('All')
  const [sortBy, setSortBy] = useState<'newest' | 'users' | 'alpha'>('newest')

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('school_tags')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTags(parsed)
        } else {
          setTags(INITIAL_TAGS)
          localStorage.setItem('school_tags', JSON.stringify(INITIAL_TAGS))
        }
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

  const resetForm = () => {
    setEditingTagId(null)
    setTagName('')
    setTagColor('#0D9488')
    setTagScope('Staff')
    setTagDescription('')
  }

  const handleOpenAdd = () => {
    resetForm()
    setModalOpen(true)
  }

  const handleOpenEdit = (tag: TagRecord) => {
    setEditingTagId(tag.id)
    setTagName(tag.name)
    setTagColor(tag.color || '#0D9488')
    setTagScope(tag.scope || 'Staff')
    setTagDescription(tag.description || '')
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagName.trim()) {
      alert('Please enter a tag name.')
      return
    }

    if (editingTagId) {
      const updated = tags.map(t => {
        if (t.id === editingTagId) {
          return {
            ...t,
            name: tagName.trim(),
            color: tagColor,
            scope: tagScope,
            description: tagDescription.trim()
          }
        }
        return t
      })
      setTags(updated)
      localStorage.setItem('school_tags', JSON.stringify(updated))
      showToast('Tag updated successfully!')
    } else {
      const newTag: TagRecord = {
        id: Date.now(),
        name: tagName.trim(),
        color: tagColor,
        scope: tagScope,
        description: tagDescription.trim(),
        totalUser: 0,
        createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
      const updated = [newTag, ...tags]
      setTags(updated)
      localStorage.setItem('school_tags', JSON.stringify(updated))
      showToast('Tag created successfully!')
    }

    setModalOpen(false)
    resetForm()
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      const updated = tags.filter(t => t.id !== id)
      setTags(updated)
      localStorage.setItem('school_tags', JSON.stringify(updated))
      showToast('Tag deleted successfully!')
    }
  }

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalTags = tags.length
    const totalUsers = tags.reduce((acc, t) => acc + (t.totalUser || 0), 0)
    const staffTags = tags.filter(t => t.scope === 'Staff').length
    const studentTags = tags.filter(t => t.scope === 'Student').length
    return { totalTags, totalUsers, staffTags, studentTags }
  }, [tags])

  // Filtered and Sorted list
  const filteredTags = useMemo(() => {
    let result = tags.filter(t => {
      if (scopeFilter !== 'All' && t.scope !== scopeFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchName = t.name.toLowerCase().includes(q)
        const matchDesc = t.description && t.description.toLowerCase().includes(q)
        return matchName || matchDesc
      }
      return true
    })

    if (sortBy === 'users') {
      result.sort((a, b) => (b.totalUser || 0) - (a.totalUser || 0))
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      result.sort((a, b) => b.id - a.id)
    }

    return result
  }, [tags, scopeFilter, searchQuery, sortBy])

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* ════════════════════════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Tag Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {tags.length} tags
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create and organize colored category tags for students, teachers, and staff members.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs flex items-center justify-center gap-2 transition-colors text-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Tag</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          OVERVIEW METRICS
      ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Tags</span>
            <TagIcon className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.totalTags}</p>
          <span className="text-[11px] text-teal-600 font-semibold">Configured labels</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Tagged Users</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.totalUsers}</p>
          <span className="text-[11px] text-blue-600 font-semibold">Active assignments</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Staff Tags</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.staffTags}</p>
          <span className="text-[11px] text-purple-600 font-semibold">Teachers & employees</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Student Tags</span>
            <GraduationCap className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.studentTags}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Clubs & responsibilities</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          INTEGRATED TOOLBAR & FILTERS
      ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search tag name or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 outline-none focus:border-teal-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scope Dropdown */}
          <select
            value={scopeFilter}
            onChange={e => setScopeFilter(e.target.value as any)}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500 cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Scopes</option>
            <option value="Staff">Staff Only</option>
            <option value="Student">Student Only</option>
            <option value="General">General / Both</option>
          </select>
        </div>

        {/* Sort Controls & Scope Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
            {(['All', 'Staff', 'Student', 'General'] as const).map(sc => (
              <button
                key={sc}
                type="button"
                onClick={() => setScopeFilter(sc)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  scopeFilter === sc
                    ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="users">Most Users</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TAGS TABLE
      ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700 font-semibold text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-14 text-center">#</th>
                <th className="px-4 py-3.5">Tag Name</th>
                <th className="px-4 py-3.5">Scope</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5 text-center">Assigned Users</th>
                <th className="px-4 py-3.5">Created At</th>
                <th className="px-4 py-3.5 text-right w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredTags.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3.5 text-center text-slate-400 font-mono">
                    {String(idx + 1).padStart(2, '0')}.
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-xs border"
                         style={{
                           backgroundColor: `${item.color}15`,
                           color: item.color,
                           borderColor: `${item.color}35`
                         }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <TagIcon className="w-3.5 h-3.5" />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                      item.scope === 'Staff'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                        : item.scope === 'Student'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                    }`}>
                      {item.scope === 'Staff' && <Briefcase className="w-3 h-3" />}
                      {item.scope === 'Student' && <GraduationCap className="w-3 h-3" />}
                      {item.scope === 'General' && <Layers className="w-3 h-3" />}
                      <span>{item.scope}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 max-w-xs text-slate-500 dark:text-slate-400 text-[11px] truncate">
                    {item.description || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs">
                      <Users className="w-3 h-3 text-slate-400" />
                      {String(item.totalUser).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
                      <Calendar className="w-3 h-3 text-teal-600" />
                      <span>{item.createdAt}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit Tag"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete Tag"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTags.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                    <TagIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-sm">No Tags Found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria or create a new tag.</p>
                    <button
                      type="button"
                      onClick={handleOpenAdd}
                      className="mt-3 px-4 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      + Add New Tag
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-slate-400 font-semibold">
          <p>Showing 1-{filteredTags.length} of {tags.length} Entries</p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          CREATE / EDIT TAG MODAL POPUP
      ════════════════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150 text-xs font-semibold text-slate-700 dark:text-slate-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-teal-600" />
                  {editingTagId ? 'Edit Tag' : 'Create New Tag'}
                </h3>
                <p className="text-[11px] text-slate-400">Configure tag name, color, and target scope.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Tag Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bus Incharge, Robotics Club, Invigilator"
                  value={tagName}
                  onChange={e => setTagName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500"
                  required
                />
              </div>

              {/* Tag Scope Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Target Scope
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'Staff', label: 'Staff / Teachers', icon: Briefcase },
                    { value: 'Student', label: 'Students', icon: GraduationCap },
                    { value: 'General', label: 'Both / General', icon: Layers }
                  ].map(sc => {
                    const isSelected = tagScope === sc.value
                    const Icon = sc.icon
                    return (
                      <button
                        key={sc.value}
                        type="button"
                        onClick={() => setTagScope(sc.value as any)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-700 dark:text-teal-300 font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{sc.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Choose Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Choose Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => {
                    const isSelected = tagColor.toLowerCase() === c.hex.toLowerCase()
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setTagColor(c.hex)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isSelected ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-xs' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    )
                  })}
                  <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                    <input
                      type="color"
                      value={tagColor}
                      onChange={e => setTagColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{tagColor}</span>
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Live Tag Preview</span>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-xs border"
                     style={{
                       backgroundColor: `${tagColor}15`,
                       color: tagColor,
                       borderColor: `${tagColor}35`
                     }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tagColor }} />
                  <TagIcon className="w-3.5 h-3.5" />
                  <span>{tagName.trim() || 'Sample Tag Name'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Description / Purpose (Optional)
                </label>
                <textarea
                  placeholder="Explain when and to whom this tag should be assigned..."
                  value={tagDescription}
                  onChange={e => setTagDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold outline-none h-16 resize-none bg-white dark:bg-slate-900 text-xs focus:border-teal-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs text-xs transition-colors cursor-pointer"
                >
                  {editingTagId ? 'Save Changes' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

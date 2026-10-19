'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ArrowLeft, CheckCircle2, Layers, RefreshCw, Search, Sparkles, FolderPlus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { fetchExamGroups, saveExamGroup, updateExamGroup, deleteExamGroup } from '../setup/actions'

interface ExamGroup {
  id: number | string
  groupName: string
  description?: string
  date?: string
  time?: string
}

const DEFAULT_INITIAL_GROUPS: ExamGroup[] = [
  { id: 1, groupName: 'Quarterly', description: 'Quarterly examination assessment scheme', date: '19/10/2026', time: '10:00 AM' },
  { id: 2, groupName: 'Half Yearly', description: 'Half Yearly examination assessment scheme', date: '19/10/2026', time: '10:00 AM' },
  { id: 3, groupName: 'Yearly', description: 'Yearly comprehensive examination scheme', date: '19/10/2026', time: '10:00 AM' },
  { id: 4, groupName: 'Annually', description: 'Annual final examination scheme', date: '19/10/2026', time: '10:00 AM' },
]

export default function CreateExamGroupPage() {
  const [groups, setGroups] = useState<ExamGroup[]>(DEFAULT_INITIAL_GROUPS)
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [editingGroup, setEditingGroup] = useState<ExamGroup | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Load from database (with fallback to localStorage & defaults)
  const loadGroups = async () => {
    try {
      const res = await fetchExamGroups()
      if (res.success && res.data && res.data.length > 0) {
        setGroups(res.data)
        localStorage.setItem('exam_groups', JSON.stringify(res.data))
      } else {
        const saved = localStorage.getItem('exam_groups')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setGroups(parsed)
          } else {
            setGroups(DEFAULT_INITIAL_GROUPS)
            localStorage.setItem('exam_groups', JSON.stringify(DEFAULT_INITIAL_GROUPS))
          }
        } else {
          setGroups(DEFAULT_INITIAL_GROUPS)
          localStorage.setItem('exam_groups', JSON.stringify(DEFAULT_INITIAL_GROUPS))
        }
      }
    } catch (e) {
      console.error('Error fetching exam groups:', e)
      const saved = localStorage.getItem('exam_groups')
      if (saved) {
        setGroups(JSON.parse(saved))
      } else {
        setGroups(DEFAULT_INITIAL_GROUPS)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroups()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) {
      toast.error('Please enter a Group Name.')
      return
    }

    setIsSubmitting(true)

    try {
      if (editingGroup) {
        // Edit mode
        const res = await updateExamGroup(editingGroup.id, groupName.trim(), description.trim())
        if (res.success && res.data) {
          setGroups(prev => prev.map(item => item.id === editingGroup.id ? res.data : item))
          toast.success(`Exam group "${groupName.trim()}" updated successfully!`)
        } else {
          // Fallback local update
          const today = new Date()
          const updated = groups.map(item => 
            item.id === editingGroup.id 
              ? { 
                  ...item, 
                  groupName: groupName.trim(), 
                  description: description.trim(),
                  date: today.toLocaleDateString('en-GB'),
                  time: today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }
              : item
          )
          setGroups(updated)
          localStorage.setItem('exam_groups', JSON.stringify(updated))
          toast.success('Exam group updated successfully!')
        }
      } else {
        // Create mode
        const res = await saveExamGroup(groupName.trim(), description.trim())
        if (res.success && res.data) {
          setGroups(prev => [res.data, ...prev])
          toast.success(`Exam group "${groupName.trim()}" created successfully!`)
        } else {
          // Fallback local create
          const today = new Date()
          const newGroup: ExamGroup = {
            id: Date.now(),
            groupName: groupName.trim(),
            description: description.trim(),
            date: today.toLocaleDateString('en-GB'),
            time: today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          }
          const updated = [newGroup, ...groups]
          setGroups(updated)
          localStorage.setItem('exam_groups', JSON.stringify(updated))
          toast.success('Exam group created successfully!')
        }
      }

      setGroupName('')
      setDescription('')
      setEditingGroup(null)
    } catch (err: any) {
      toast.error('Error saving exam group: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (group: ExamGroup) => {
    setEditingGroup(group)
    setGroupName(group.groupName)
    setDescription(group.description || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (group: ExamGroup) => {
    if (!confirm(`Are you sure you want to delete exam group "${group.groupName}"?`)) {
      return
    }

    try {
      const res = await deleteExamGroup(group.id)
      if (res.success) {
        const updated = groups.filter(item => item.id !== group.id)
        setGroups(updated)
        localStorage.setItem('exam_groups', JSON.stringify(updated))
        toast.success(`Exam group "${group.groupName}" deleted successfully!`)
      } else {
        const updated = groups.filter(item => item.id !== group.id)
        setGroups(updated)
        localStorage.setItem('exam_groups', JSON.stringify(updated))
        toast.success('Exam group removed from list.')
      }
    } catch (err: any) {
      toast.error('Error deleting group: ' + err.message)
    }
  }

  const handleCancelEdit = () => {
    setEditingGroup(null)
    setGroupName('')
    setDescription('')
  }

  const filteredGroups = groups.filter(g => 
    g.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link 
            href="/institute/exam-marksheet/setup"
            className="w-9 h-9 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            title="Back to Exam & Marksheet Setup"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-800 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-800 dark:text-slate-100">
                Exam Group Management
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                PostgreSQL Synced
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create and manage examination group schemes used in marksheet configurations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/institute/exam-marksheet/setup/create"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Setup (Wizard)</span>
          </Link>

          <button
            type="button"
            onClick={loadGroups}
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Groups"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Form on Left/Top + List on Right/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-teal-600" />
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {editingGroup ? 'Modify Exam Group' : 'Create Exam Group'}
              </h2>
            </div>
            {editingGroup && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Edit Mode
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                Group Scheme Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                autoFocus
                placeholder="e.g. Unit Test Scheme, Term 1 Scheme, Annual Exam"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400">
                This name will appear in dropdowns when creating exam marksheets & admit cards.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                Description <span className="text-[10px] font-medium text-slate-400">(Optional)</span>
              </label>
              <textarea 
                rows={3}
                placeholder="e.g. Summative assessments for secondary and higher classes"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {editingGroup && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingGroup ? 'Update Scheme' : 'Create Exam Group'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* List Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                All Exam Groups
              </h2>
              <p className="text-[11px] text-slate-400">
                Total {groups.length} configured {groups.length === 1 ? 'group' : 'groups'}
              </p>
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
              <span className="text-xs font-semibold">Loading exam groups from database...</span>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {searchQuery ? 'No matching groups found' : 'No exam groups created yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                {searchQuery ? 'Try adjusting your search query.' : 'Use the form on the left to add your first examination group scheme.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-850 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">Group Scheme Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredGroups.map((group, idx) => (
                    <tr 
                      key={group.id} 
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-center text-slate-400 font-bold">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {group.groupName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {group.description || <span className="text-slate-300 dark:text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {group.date || '—'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {group.time || ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            type="button"
                            onClick={() => handleEdit(group)}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                            title="Edit Exam Group"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDelete(group)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 border border-red-200 dark:border-red-800 transition-colors cursor-pointer"
                            title="Delete Exam Group"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick Footer Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span>Showing {filteredGroups.length} of {groups.length} schemes</span>
            <Link 
              href="/institute/exam-marksheet/setup"
              className="inline-flex items-center gap-1 font-bold text-teal-600 hover:text-teal-700 transition-colors"
            >
              <span>Go to Exam & Marksheet Setup</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface ExamGroup {
  id: number
  groupName: string
  description: string
  date: string
  time: string
}

const INITIAL_GROUPS: ExamGroup[] = [
  { id: 1, groupName: 'Exam', description: 'Standard term written examinations', date: '15/09/2025', time: '11:00 AM' },
  { id: 2, groupName: 'Theory Exam', description: 'Theory paper assessments', date: '15/09/2025', time: '11:00 AM' },
  { id: 3, groupName: 'Practical Exam', description: 'Practical and laboratory tests', date: '15/09/2025', time: '11:00 AM' },
]

export default function CreateGroupPage() {
  const [groups, setGroups] = useState<ExamGroup[]>(INITIAL_GROUPS)
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [editingGroup, setEditingGroup] = useState<ExamGroup | null>(null)
  const [successToast, setSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('exam_groups')
    if (saved) {
      try {
        setGroups(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('exam_groups', JSON.stringify(INITIAL_GROUPS))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName) {
      alert('Please fill in Group Name.')
      return
    }

    const today = new Date()
    const formattedDate = today.toLocaleDateString('en-GB')
    const formattedTime = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    let updated: ExamGroup[] = []
    if (editingGroup) {
      // Edit mode
      updated = groups.map(item => 
        item.id === editingGroup.id 
          ? { ...item, groupName, description }
          : item
      )
      setToastMessage('Group updated successfully!')
    } else {
      // Add mode
      const newGroup: ExamGroup = {
        id: Date.now(),
        groupName,
        description,
        date: formattedDate,
        time: formattedTime
      }
      updated = [newGroup, ...groups]
      setToastMessage('Group created successfully!')
    }

    setGroups(updated)
    localStorage.setItem('exam_groups', JSON.stringify(updated))
    
    // Clear inputs
    setGroupName('')
    setDescription('')
    setEditingGroup(null)
    setSuccessToast(true)
    setTimeout(() => setSuccessToast(false), 3000)
  }

  const handleEdit = (group: ExamGroup) => {
    setEditingGroup(group)
    setGroupName(group.groupName)
    setDescription(group.description)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this group?')) {
      const updated = groups.filter(item => item.id !== id)
      setGroups(updated)
      localStorage.setItem('exam_groups', JSON.stringify(updated))
      setToastMessage('Group deleted successfully!')
      setSuccessToast(true)
      setTimeout(() => setSuccessToast(false), 3000)
    }
  }

  const handleCancelEdit = () => {
    setEditingGroup(null)
    setGroupName('')
    setDescription('')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/institute/exam-marksheet/setup/create"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Create Group</h1>
            <p className="text-xs text-slate-400">Configure exam groups for marksheet setups</p>
          </div>
        </div>
      </div>

      {/* Create Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-4">
          {editingGroup ? 'Modify Group' : 'Create Group'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Group Name *</label>
              <input 
                type="text" 
                required
                placeholder="Enter Group Name"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Description</label>
              <input 
                type="text" 
                placeholder="Enter Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {editingGroup && (
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              {editingGroup ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      {/* List Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-4">
          All Groups
        </h2>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Group Name</th>
                <th className="px-4 py-4 text-left">Description</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, idx) => (
                <tr key={group.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left text-slate-800 dark:text-slate-200 font-bold">{group.groupName}</td>
                  <td className="px-4 py-3.5 text-left text-slate-550 dark:text-slate-400 font-semibold">{group.description || '—'}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-400">🗓 {group.date}</span>
                      <span>🕒 {group.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleEdit(group)}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDelete(group.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-{groups.length} of 456 Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-teal-600 text-teal-600">2</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">»</button>
          </div>
        </div>
      </div>

      {/* Success notification toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div className="text-xs font-bold">{toastMessage}</div>
        </div>
      )}

    </div>
  )
}

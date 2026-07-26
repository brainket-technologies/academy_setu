'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, CheckCircle2, Award } from 'lucide-react'

interface ActivityRecord {
  id: number
  activityName: string
  category: 'Sports' | 'Cultural' | 'Academic Club' | 'Arts & Crafts' | 'Social Service'
  instructor: string
  weeklySchedule: string
  deleted: boolean
}

const INITIAL_ACTIVITIES: ActivityRecord[] = [
]

export default function ActivitiesSettingsPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>(INITIAL_ACTIVITIES)
  const [activeTab, setActiveTab] = useState<'All' | 'Deleted'>('All')

  // Form State
  const [activityName, setActivityName] = useState('')
  const [category, setCategory] = useState<'Sports' | 'Cultural' | 'Academic Club' | 'Arts & Crafts' | 'Social Service'>('Sports')
  const [instructor, setInstructor] = useState('')
  const [weeklySchedule, setWeeklySchedule] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_settings_activities')
    if (saved) {
      try {
        setActivities(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_settings_activities', JSON.stringify(INITIAL_ACTIVITIES))
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activityName) {
      alert('Please enter an Activity Name.')
      return
    }

    const newAct: ActivityRecord = {
      id: Date.now(),
      activityName: activityName.trim(),
      category,
      instructor: instructor.trim() || 'Not Assigned',
      weeklySchedule: weeklySchedule.trim() || 'TBD',
      deleted: false
    }

    const updated = [newAct, ...activities]
    setActivities(updated)
    localStorage.setItem('school_settings_activities', JSON.stringify(updated))

    setActivityName('')
    setInstructor('')
    setWeeklySchedule('')
    showToast('Activity added successfully!')
  }

  const handleDelete = (id: number) => {
    const updated = activities.map(a => a.id === id ? { ...a, deleted: true } : a)
    setActivities(updated)
    localStorage.setItem('school_settings_activities', JSON.stringify(updated))
    showToast('Activity moved to deleted list!')
  }

  const handleRestore = (id: number) => {
    const updated = activities.map(a => a.id === id ? { ...a, deleted: false } : a)
    setActivities(updated)
    localStorage.setItem('school_settings_activities', JSON.stringify(updated))
    showToast('Activity restored successfully!')
  }

  const tabCountAll = activities.filter(a => !a.deleted).length
  const tabCountDeleted = activities.filter(a => a.deleted).length

  const filtered = activities.filter(a => activeTab === 'All' ? !a.deleted : a.deleted)

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Activities</h1>
      </div>

      {/* Add Activity Section */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm text-xs font-semibold text-slate-700">
        <h2 className="text-sm font-black text-[#1b3a60] mb-4">Add Activity Settings</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Activity Name</label>
            <input
              type="text"
              placeholder="Enter Activity Name"
              value={activityName}
              onChange={e => setActivityName(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-bold"
            >
              <option value="Sports">Sports</option>
              <option value="Cultural">Cultural</option>
              <option value="Academic Club">Academic Club</option>
              <option value="Arts & Crafts">Arts & Crafts</option>
              <option value="Social Service">Social Service</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Instructor / Coach</label>
            <input
              type="text"
              placeholder="Instructor Name"
              value={instructor}
              onChange={e => setInstructor(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-slate-500 font-bold">Weekly Schedule</label>
              <input
                type="text"
                placeholder="Mon, Wed 3:00 PM"
                value={weeklySchedule}
                onChange={e => setWeeklySchedule(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('All')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${activeTab === 'All' ? 'bg-teal-600 text-white border-teal-500 font-black' : 'bg-white border text-slate-655 hover:bg-slate-50'}`}
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

      {/* Table */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs text-slate-700">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4 text-left">Activity Name</th>
                <th className="px-3 py-4 text-left">Category</th>
                <th className="px-3 py-4 text-left">Instructor</th>
                <th className="px-3 py-4">Weekly Schedule</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-800">{item.activityName}</td>
                  <td className="px-3 py-3.5 text-left">
                    <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded text-[10px] font-black border">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-600">{item.instructor}</td>
                  <td className="px-3 py-3.5 text-slate-500 font-bold">{item.weeklySchedule}</td>
                  <td className="px-3 py-3.5">
                    {activeTab === 'All' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100">
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
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                    No activities found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

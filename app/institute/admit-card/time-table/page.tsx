'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface TimeTableEntry {
  id: number
  title: string
  classGrade: string
  session: string
  subjects: {
    subjectName: string
    date: string
    fromTime: string
    toTime: string
  }[]
  dateCreated: string
  timeCreated: string
}

const INITIAL_TIMETABLES: TimeTableEntry[] = [
  { 
    id: 1, 
    title: 'Half Yearly Exam', 
    classGrade: 'Class V',
    session: '2024-25', 
    subjects: [
      { subjectName: 'English', date: '2025-03-21', fromTime: '10:00', toTime: '13:00' },
      { subjectName: 'Mathematics', date: '2025-03-22', fromTime: '10:00', toTime: '13:00' }
    ],
    dateCreated: '15/09/2025', 
    timeCreated: '11:00 AM' 
  },
  { 
    id: 2, 
    title: 'Annual Exam', 
    classGrade: 'Class V',
    session: '2024-25', 
    subjects: [
      { subjectName: 'Science', date: '2025-05-10', fromTime: '09:00', toTime: '12:00' }
    ],
    dateCreated: '15/09/2025', 
    timeCreated: '11:00 AM' 
  },
  { 
    id: 3, 
    title: 'Half Yearly Exam', 
    classGrade: 'Class VI',
    session: '2025-26', 
    subjects: [
      { subjectName: 'Hindi', date: '2025-09-25', fromTime: '10:30', toTime: '13:30' }
    ],
    dateCreated: '15/09/2025', 
    timeCreated: '11:00 AM' 
  },
]

export default function ExamTimeTablePage() {
  const [timetables, setTimetables] = useState<TimeTableEntry[]>(INITIAL_TIMETABLES)
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('exam_timetables')
    if (saved) {
      try {
        setTimetables(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('exam_timetables', JSON.stringify(INITIAL_TIMETABLES))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this Exam Time Table?')) {
      const updated = timetables.filter(t => t.id !== id)
      setTimetables(updated)
      localStorage.setItem('exam_timetables', JSON.stringify(updated))
      setToastMsg('Time Table deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const filtered = timetables.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Exam Time Table</h1>
          <p className="text-xs text-slate-400">Configure and view exam subject schedules</p>
        </div>
      </div>

      {/* Control / Actions Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by Title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Link 
            href="/institute/admit-card/time-table/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Exam Time Table
          </Link>
        </div>

      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Title</th>
                <th className="px-4 py-4 text-left">Class</th>
                <th className="px-4 py-4">Session</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left text-slate-800 dark:text-slate-200 font-bold">{item.title}</td>
                  <td className="px-4 py-3.5 text-left text-slate-600 dark:text-slate-400 font-semibold">{item.classGrade}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300">{item.session}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-400">🗓 {item.dateCreated}</span>
                      <span>🕒 {item.timeCreated}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link 
                        href={`/institute/admit-card/time-table/create?editId=${item.id}`}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">No Time Tables found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-{filtered.length} of 456 Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-teal-655">2</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">»</button>
          </div>
        </div>

      </div>

      {/* SUCCESS TOAST */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

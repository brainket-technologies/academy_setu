'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, Pencil, Trash2, Eye, X, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface LessonPlanRecord {
  id: number
  className: string
  section: string
  title: string
  subject: string
  methodology: string
  date: string
  totalMilestones: number
  createdAt: string
}

const INITIAL_PLANS: LessonPlanRecord[] = [
]

export default function LessonPlansPage() {
  const [plans, setPlans] = useState<LessonPlanRecord[]>(INITIAL_PLANS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  // Filter state
  const [filterFromDate, setFilterFromDate] = useState('')
  const [filterToDate, setFilterToDate] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterSubject, setFilterSubject] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_lesson_plans')
    if (saved) {
      try { setPlans(JSON.parse(saved)) } catch (e) { console.error(e) }
    } else {
      localStorage.setItem('school_lesson_plans', JSON.stringify(INITIAL_PLANS))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Delete this lesson plan?')) {
      const updated = plans.filter(p => p.id !== id)
      setPlans(updated)
      localStorage.setItem('school_lesson_plans', JSON.stringify(updated))
      setToastMsg('Lesson plan deleted!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const handleClearFilter = () => {
    setFilterFromDate('')
    setFilterToDate('')
    setFilterClass('')
    setFilterSection('')
    setFilterSubject('')
  }

  const filtered = plans.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subject.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(p => !filterClass || p.className === filterClass)
    .filter(p => !filterSection || p.section === filterSection)
    .filter(p => !filterSubject || p.subject === filterSubject)

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">Lesson Plan</h1>
          <p className="text-xs text-slate-400">Manage and track teaching lesson plans</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-56 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input type="text" placeholder="Search by Name, Mobile no..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold" />
          </div>
          <button onClick={() => setFilterOpen(true)} className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-sm"><Filter className="w-4 h-4" /></button>
          <Link href="/institute/lesson-plans/add" className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-sm"><Plus className="w-4 h-4" /></Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 font-black text-slate-655 border-b">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-3 py-4">Class</th>
                <th className="px-3 py-4">Section</th>
                <th className="px-3 py-4 text-left">Title</th>
                <th className="px-3 py-4">Subject</th>
                <th className="px-3 py-4">Methodology</th>
                <th className="px-3 py-4">Date</th>
                <th className="px-3 py-4">Total Milestones</th>
                <th className="px-3 py-4 w-36">Created At</th>
                <th className="px-3 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-3 py-3.5 text-slate-500">{idx + 1}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.className}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.section}</td>
                  <td className="px-3 py-3.5 text-left font-bold text-slate-800 max-w-[160px] truncate">{item.title}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.subject}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.methodology}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.date}</td>
                  <td className="px-3 py-3.5 text-slate-600">{item.totalMilestones}</td>
                  <td className="px-3 py-3.5 text-slate-450 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1"><span>📅</span><span>{item.createdAt}</span></div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100"><Eye className="w-3 h-3" /></button>
                      <button className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => handleDelete(item.id)} className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="py-8 text-center text-slate-400 font-bold">No lesson plans found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-slate-400 font-semibold">
          <p>Showing 1-{filtered.length} of {filtered.length} Entries</p>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">«</button>
            <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">‹</button>
            <button className="w-7 h-7 rounded bg-teal-600 text-white flex items-center justify-center font-bold">1</button>
            <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-500 hover:bg-slate-50">2</button>
            <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">›</button>
            <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">»</button>
          </div>
        </div>
      </div>

      {/* ===== FILTER MODAL ===== */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setFilterOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800">Filter Lesson Plans</h3>
              <button onClick={() => setFilterOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">From Date</label>
                <input type="date" value={filterFromDate} onChange={e => setFilterFromDate(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg font-bold outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">To Date</label>
                <input type="date" value={filterToDate} onChange={e => setFilterToDate(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg font-bold outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Class</label>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg font-bold outline-none bg-white">
                  <option value="">Select class</option>
                  {['Class I','Class II','Class III','Class IV','Class V','Class VI','Class VII','Class VIII','Class IX','Class X'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Section</label>
                <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg font-bold outline-none bg-white">
                  <option value="">Select section</option>
                  {['Section A','Section B','Section C','Section D'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Subject</label>
                <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg font-bold outline-none bg-white">
                  <option value="">Select an option</option>
                  <option value="Lorem Ipsum">Lorem Ipsum</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button onClick={() => setFilterOpen(false)} className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md text-xs">Filter</button>
              <button onClick={handleClearFilter} className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors text-xs">Clear</button>
            </div>
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

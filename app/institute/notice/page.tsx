'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Download, Plus, Trash2, FileText, X, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface NoticeRecord {
  id: number
  subjectTitle: string
  sentToUser: number
  message: string
  scheduleAt: string
  files: boolean
  createdAt: string
}

const INITIAL_NOTICES: NoticeRecord[] = [
]

export default function NoticeOnAppPage() {
  const [notices, setNotices] = useState<NoticeRecord[]>(INITIAL_NOTICES)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter modal
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_notices_app')
    if (saved) {
      try { setNotices(JSON.parse(saved)) } catch (e) { console.error(e) }
    } else {
      localStorage.setItem('school_notices_app', JSON.stringify(INITIAL_NOTICES))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      const updated = notices.filter(n => n.id !== id)
      setNotices(updated)
      localStorage.setItem('school_notices_app', JSON.stringify(updated))
      setToastMsg('Notice deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const handleClearFilters = () => {
    setFilterStartDate('')
    setFilterEndDate('')
    setFilterOpen(false)
  }

  const filtered = notices.filter(n =>
    n.subjectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Notice on App</h1>
          <p className="text-xs text-slate-400">Broadcast notices to students, teachers, and parents</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search by Name, Mobile no..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
            />
          </div>

          <button
            onClick={() => setFilterOpen(true)}
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-teal-600 hover:bg-slate-50 bg-white shadow-sm"
            title="Filter by Date"
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert('Exporting notices...')}
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 bg-white shadow-sm"
          >
            <Download className="w-4 h-4" />
          </button>
          <Link
            href="/institute/notice/create"
            className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Notice table (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Subject & Title</th>
                <th className="px-4 py-4 w-28">Sent to User</th>
                <th className="px-4 py-4 text-left">Message</th>
                <th className="px-4 py-4 w-40">Schedule At</th>
                <th className="px-4 py-4 w-16">Files</th>
                <th className="px-4 py-4 w-40">Created At</th>
                <th className="px-4 py-4 w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold align-top">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-800">{item.subjectTitle}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-600">{item.sentToUser}</td>
                  <td className="px-4 py-3.5 text-left text-slate-500 leading-relaxed max-w-xs">{item.message}</td>
                  <td className="px-4 py-3.5 text-slate-450 font-semibold whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1"><span>📅</span><span>{item.scheduleAt}</span></div>
                  </td>
                  <td className="px-4 py-3.5">
                    {item.files && (
                      <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500 border border-slate-200 bg-white mx-auto block" title="View Attachment">
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-450 font-semibold whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1"><span>📅</span><span>{item.createdAt}</span></div>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors mx-auto"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">No notices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Filter Modal (Screenshot 2) ===== */}
      {filterOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 relative p-8 space-y-6">
            <button onClick={() => setFilterOpen(false)} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-6 text-xs font-semibold text-slate-700">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Start Date</label>
                <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">End Date</label>
                <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold" />
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button onClick={() => setFilterOpen(false)} className="px-8 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors">Filter</button>
              <button onClick={handleClearFilters} className="px-8 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors bg-white">Clear</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

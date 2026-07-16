'use client'

import React, { useState } from 'react'
import { Search, Upload, Filter, Plus, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

const ID_CARD_DATA = [
  { id: 1, title: 'Id Card', session: '2024-25', for: 'Student', date: '15/09/2025', time: '11:00 AM' },
  { id: 2, title: 'Id Card', session: '2025-26', for: 'Teacher', date: '15/09/2025', time: '11:00 AM' },
  { id: 3, title: 'Id Card', session: '2024-25', for: 'Employee', date: '15/09/2025', time: '11:00 AM' },
]

export default function IdCardSetupPage() {
  const [activeTab, setActiveTab] = useState('All')

  // Filter data based on active tab
  const filteredData = ID_CARD_DATA.filter(item => {
    if (activeTab === 'All') return true
    return item.for === activeTab
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Id Card</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Name, Mobile no." 
              className="pl-9 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
          </button>
          <Link href="/institute/id-card/setup/generate" className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-4">
        {['All', 'Student', 'Teacher', 'Employee'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`px-8 py-2.5 rounded-lg text-sm font-bold border transition-colors shadow-sm ${
              activeTab === tab 
                ? 'bg-teal-600 text-white border-teal-600' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4">S. No.</th>
                <th className="px-4 py-4">Title</th>
                <th className="px-4 py-4">Session</th>
                <th className="px-4 py-4">ID Card For</th>
                <th className="px-4 py-4">ID Card Design</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, i) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 text-slate-500 font-medium">{i + 1}.</td>
                  <td className="px-4 py-4 text-slate-600 font-semibold">{item.title}</td>
                  <td className="px-4 py-4 text-slate-600">{item.session}</td>
                  <td className="px-4 py-4 text-slate-700 font-bold">{item.for}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      {/* Placeholder for the small ID card thumbnail */}
                      <div className="w-6 h-8 bg-slate-200 rounded-sm border border-slate-300 relative overflow-hidden flex flex-col items-center">
                        <div className="w-full h-2 bg-blue-500 mb-1"></div>
                        <div className="w-3 h-3 bg-white rounded-full mt-1 border border-slate-300"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700">🗓 {item.date}</span>
                      <span>🕒 {item.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-7 h-7 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
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
          <span>Showing 1-10 of 456 Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-teal-600">2</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">»</button>
          </div>
        </div>
      </div>
      
    </div>
  )
}

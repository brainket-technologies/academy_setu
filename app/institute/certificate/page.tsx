'use client'

import React, { useState } from 'react'
import { Search, Filter, Eye, Pencil, Trash2, X, Calendar } from 'lucide-react'

const ALL_CERTIFICATES = [
  { id: 1, title: 'Certificate Title 1', exam: 'Half Yearly Exam', student: 'Sourabh', class: 'Class V', section: 'Section A', date: '15/09/2025', time: '11:00 AM' },
  { id: 2, title: 'Certificate Title 2', exam: 'Half Yearly Exam', student: 'Anil', class: 'Class II', section: 'Section D', date: '15/09/2025', time: '11:00 AM' },
  { id: 3, title: 'Certificate Title 3', exam: 'Annual Exam', student: 'Sohan', class: 'Class V', section: 'Section C', date: '15/09/2025', time: '11:00 AM' },
]

export default function AllCertificatePage() {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Certificate</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Name, Mobile no." 
              className="pl-9 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-xs font-bold text-slate-700">Exam</label>
          <select className="w-48 px-4 py-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-600 shadow-sm hover:border-slate-300 outline-none focus:border-teal-500">
            <option>Select Exam</option>
          </select>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4">S. No.</th>
                <th className="px-4 py-4">Certificate Title</th>
                <th className="px-4 py-4">Certificate Design</th>
                <th className="px-4 py-4">Exam</th>
                <th className="px-4 py-4">Student Name</th>
                <th className="px-4 py-4">Class</th>
                <th className="px-4 py-4">Section</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {ALL_CERTIFICATES.map((item, i) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 text-slate-500 font-medium">{i + 1}.</td>
                  <td className="px-4 py-4 text-slate-600 font-semibold">{item.title}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <div className="w-10 h-7 bg-amber-50 rounded-sm border border-amber-200 flex items-center justify-center relative overflow-hidden">
                         <div className="w-6 h-4 border border-amber-300"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600 font-semibold">{item.exam}</td>
                  <td className="px-4 py-4 text-slate-600 font-semibold">{item.student}</td>
                  <td className="px-4 py-4 text-slate-600 font-medium">{item.class}</td>
                  <td className="px-4 py-4 text-slate-600 font-medium">{item.section}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700">🗓 {item.date}</span>
                      <span>🕒 {item.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="w-6 h-6 rounded bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 border border-blue-100 transition-colors">
                        <Eye className="w-3 h-3" />
                      </button>
                      <button className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors">
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

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-end pt-4 pr-4">
              <button onClick={() => setIsFilterModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="px-10 pb-12 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">From</label>
                  <div className="relative">
                    <input type="text" placeholder="DD-MM-YYYY" className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600" />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">To</label>
                  <div className="relative">
                    <input type="text" placeholder="DD-MM-YYYY" className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600" />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">Class</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600">
                    <option>Select an option</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">Section</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600">
                    <option>Select an option</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center items-center gap-4">
                <button className="px-10 py-2.5 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-sm">
                  Filter
                </button>
                <button className="px-10 py-2.5 rounded-lg border border-teal-600 text-teal-600 font-bold hover:bg-teal-50 transition-colors shadow-sm">
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}

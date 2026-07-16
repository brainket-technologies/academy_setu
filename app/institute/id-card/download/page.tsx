'use client'

import React, { useState } from 'react'
import { Search, Filter, Download, Pencil, Trash2 } from 'lucide-react'

const DOWNLOAD_DATA = [
  { id: 1, name: 'Ajay', class: 'Class V', section: 'Section A', session: '2024-25', date: '15/09/2025', time: '11:00 AM' },
  { id: 2, name: 'Ravi', class: 'Class VI', section: 'Section B', session: '2025-26', date: '15/09/2025', time: '11:00 AM' },
  { id: 3, name: 'Shruti', class: 'Class VIII', section: 'Section A', session: '2024-25', date: '15/09/2025', time: '11:00 AM' },
]

export default function IdCardDownloadPage() {
  const [roleFilter, setRoleFilter] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        
        {/* Custom Dropdown for Role (matching screenshot 1) */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-48 px-4 py-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-600 flex items-center justify-between shadow-sm hover:border-slate-300 outline-none focus:border-teal-500"
          >
            {roleFilter || 'Select an Option'}
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
              {['Student', 'Teacher', 'Employee'].map((role) => (
                <button
                  key={role}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setRoleFilter(role)
                    setIsDropdownOpen(false)
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        <select className="w-32 px-4 py-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-600 shadow-sm hover:border-slate-300 outline-none focus:border-teal-500">
          <option>Class</option>
        </select>
        
        <select className="w-32 px-4 py-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-600 shadow-sm hover:border-slate-300 outline-none focus:border-teal-500">
          <option>Section</option>
        </select>

      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4">S. No.</th>
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4">Class</th>
                <th className="px-4 py-4">Section</th>
                <th className="px-4 py-4">Session</th>
                <th className="px-4 py-4">ID Card Design</th>
                <th className="px-4 py-4">Generated At</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {DOWNLOAD_DATA.map((item, i) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 text-slate-500 font-medium">{i + 1}.</td>
                  <td className="px-4 py-4 text-slate-700 font-bold">{item.name}</td>
                  <td className="px-4 py-4 text-slate-600 font-semibold">{item.class}</td>
                  <td className="px-4 py-4 text-slate-600 font-medium">{item.section}</td>
                  <td className="px-4 py-4 text-slate-600">{item.session}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
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

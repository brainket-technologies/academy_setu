'use client'

import React from 'react'
import { Pencil, Trash2, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const HOSTEL_TYPES = [
  { id: 1, type: 'AC Hostel', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', date: '15/09/2025', time: '11:00 AM' },
  { id: 2, type: 'Non AC Hostel', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', date: '15/09/2025', time: '11:00 AM' },
  { id: 3, type: 'South Wing Hostel', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', date: '15/09/2025', time: '11:00 AM' },
]

export default function CreateHostelTypePage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <Link href="/institute/fees-setup/hostel-fee" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Create Hostel Type</h1>
      </div>

      {/* Form Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-200">Create Hostel Type</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-700">Hostel Type</label>
            <input type="text" placeholder="Ex: AC, Non AC, Hostel Name Etc." className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-700">Description</label>
            <input type="text" placeholder="Enter Description" className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div className="flex justify-center">
          <button className="px-10 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">
            Create
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">All Hostel Type</h2>
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-[11px] text-center">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left w-16">S. No.</th>
                <th className="px-4 py-3">Hostel Type</th>
                <th className="px-4 py-3 w-1/2">Description</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {HOSTEL_TYPES.map((item, i) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 text-slate-500 font-medium text-left">{i + 1}.</td>
                  <td className="px-4 py-4 text-slate-700 font-bold">{item.type}</td>
                  <td className="px-4 py-4 text-slate-600 leading-relaxed max-w-sm mx-auto">{item.description}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-600">
                      <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3 text-slate-400" /> {item.date}</span>
                      <span className="text-slate-400">@ {item.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-[11px] font-medium text-slate-500">
          <span>Showing 1-10 of 456 Entries</span>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400">&laquo;</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400">&lsaquo;</button>
            <button className="w-7 h-7 rounded flex items-center justify-center bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-teal-600">2</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400">&rsaquo;</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400">&raquo;</button>
          </div>
        </div>
      </div>

    </div>
  )
}

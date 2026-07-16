'use client'

import React from 'react'
import { Search, Check, Calendar, Clock, RotateCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import Link from 'next/link'

const DELETED_PARENTS = [
  { id: 1, username: 'Par123', name: 'Sudhir Rawat', contact: '9999999999', studentCount: 1, fees: '241000/-', deletedAtDate: 'Sep 15, 2025', deletedAtTime: '11:00 AM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir', followUpText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', followUpDate: '20/09/2025', followUpTime: '11:00 AM' },
  { id: 2, username: 'Par124', name: 'Sudhir Rawat', contact: '9999999999', studentCount: 1, fees: '241000/-', deletedAtDate: 'Sep 15, 2025', deletedAtTime: '11:00 AM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir', followUpText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', followUpDate: '20/09/2025', followUpTime: '11:00 AM' },
  { id: 3, username: 'Par125', name: 'Sudhir Rawat', contact: '9999999999', studentCount: 2, fees: '241000/-', deletedAtDate: 'Sep 15, 2025', deletedAtTime: '11:00 AM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir', followUpText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', followUpDate: '20/09/2025', followUpTime: '11:00 AM' },
  { id: 4, username: 'Par126', name: 'Sudhir Rawat', contact: '9999999999', studentCount: 2, fees: '241000/-', deletedAtDate: 'Sep 15, 2025', deletedAtTime: '11:00 AM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir', followUpText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', followUpDate: '20/09/2025', followUpTime: '11:00 AM' },
  { id: 5, username: 'Par127', name: 'Sudhir Rawat', contact: '9999999999', studentCount: 1, fees: '241000/-', deletedAtDate: 'Sep 15, 2025', deletedAtTime: '11:00 AM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir', followUpText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', followUpDate: '20/09/2025', followUpTime: '11:00 AM' },
  { id: 6, username: 'Par128', name: 'Sudhir Rawat', contact: '9999999999', studentCount: 2, fees: '241000/-', deletedAtDate: 'Sep 15, 2025', deletedAtTime: '11:00 AM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir', followUpText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', followUpDate: '20/09/2025', followUpTime: '11:00 AM' },
  { id: 7, username: 'Par129', name: 'Sudhir Rawat', contact: '9999999999', studentCount: 1, fees: '241000/-', deletedAtDate: 'Sep 15, 2025', deletedAtTime: '11:00 AM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir', followUpText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', followUpDate: '20/09/2025', followUpTime: '11:00 AM' },
  { id: 8, username: 'Par130', name: 'Sudhir Rawat', contact: '9999999999', studentCount: 3, fees: '241000/-', deletedAtDate: 'Sep 15, 2025', deletedAtTime: '11:00 AM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir', followUpText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', followUpDate: '20/09/2025', followUpTime: '11:00 AM' },
  { id: 9, username: 'Par131', name: 'Sudhir Rawat', contact: '9999999999', studentCount: 1, fees: '241000/-', deletedAtDate: 'Sep 15, 2025', deletedAtTime: '11:00 AM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir', followUpText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', followUpDate: '20/09/2025', followUpTime: '11:00 AM' },
  { id: 10, username: 'Par132', name: 'Sudhir Rawat', contact: '9999999999', studentCount: 1, fees: '241000/-', deletedAtDate: 'Sep 15, 2025', deletedAtTime: '11:00 AM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir', followUpText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', followUpDate: '20/09/2025', followUpTime: '11:00 AM' },
]

export default function DeletedParentsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Deleted Parents</h1>
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Name, mobile no." 
            className="pl-9 pr-4 py-2 w-full sm:w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          <Link href="/institute/parents" className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors">
            Total Parents <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs">04</span>
          </Link>
          <Link href="/institute/parents/deleted" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold shadow-sm">
            <Check className="w-4 h-4" /> Deleted Parents <span className="bg-white text-teal-600 px-1.5 py-0.5 rounded text-xs">01</span>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">S. No.</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Parent Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-center">Student</th>
                <th className="px-4 py-3">Fees</th>
                <th className="px-4 py-3">Follow UP</th>
                <th className="px-4 py-3">Deleted At</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {DELETED_PARENTS.map((parent, i) => (
                <tr key={parent.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-medium">{i + 1}.</td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{parent.username}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={parent.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 opacity-70 grayscale" />
                      <span className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{parent.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{parent.contact}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-200">{parent.studentCount}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{parent.fees}</td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="flex flex-col gap-1 text-[11px] opacity-70">
                      <p className="text-slate-600 leading-tight">{parent.followUpText}</p>
                      <div className="flex items-center gap-3 text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {parent.followUpDate}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {parent.followUpTime}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col text-[11px] font-semibold text-slate-500">
                      <span>{parent.deletedAtDate}</span>
                      <span>{parent.deletedAtTime}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <button 
                        className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors shadow-sm"
                        title="Restore"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
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
          <span>Showing 1-10 of 12 Entries</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronsLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 rounded flex items-center justify-center bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-100 text-teal-600">2</button>
            <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronRight className="w-4 h-4" /></button>
            <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronsRight className="w-4 h-4" /></button>
          </div>
        </div>

      </div>

    </div>
  )
}

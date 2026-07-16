'use client'

import React, { useState } from 'react'
import { Search, Filter, Calendar, Undo2 } from 'lucide-react'
import Image from 'next/image'

export default function DeletedStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Dummy data matching the screenshot
  const deletedStudents = [
    {
      id: 1,
      admissionNo: '0423',
      name: 'Sohan Singh',
      avatar: 'https://i.pravatar.cc/150?u=1',
      fee: '7500',
      remark: 'Lorem Ipsum',
      deletedDate: '15/09/2025',
      deletedTime: '11:00 AM'
    },
    {
      id: 2,
      admissionNo: '0423',
      name: 'Sohan Singh',
      avatar: 'https://i.pravatar.cc/150?u=2',
      fee: '7500',
      remark: 'Lorem Ipsum',
      deletedDate: '15/09/2026',
      deletedTime: '11:00 AM'
    },
    {
      id: 3,
      admissionNo: '0423',
      name: 'Sohan Singh',
      avatar: 'https://i.pravatar.cc/150?u=3',
      fee: '7500',
      remark: 'Lorem Ipsum',
      deletedDate: '15/09/2025',
      deletedTime: '11:00 AM'
    }
  ]

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Deleted Students</h1>
          <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-1.5 bg-slate-50 dark:bg-slate-700/50">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Total Deleted Students</span>
            <span className="text-sm font-black text-sky-500">05</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Name, Mobile no." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:font-medium placeholder:text-slate-400"
            />
          </div>
          <button className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-teal-600 text-white rounded-xl shadow-sm hover:bg-teal-700 transition-colors">
             <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden p-6">
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-center border-collapse whitespace-nowrap min-w-[900px]">
              <thead>
                <tr className="bg-sky-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">S. No.</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Admission No.</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-left">Student</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Fee</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Remark</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Deleted At</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {deletedStudents.map((student, index) => (
                  <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {index + 1}.
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {student.admissionNo}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 justify-start">
                        <img 
                           src={student.avatar} 
                           alt={student.name} 
                           className="w-8 h-8 rounded-full object-cover shadow-sm"
                        />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {student.fee}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {student.remark}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold text-xs">
                          <Calendar className="w-3.5 h-3.5" /> {student.deletedDate}
                        </div>
                        <div className="text-slate-500 text-[11px] font-semibold">
                          @ {student.deletedTime}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm border border-emerald-100">
                          <Undo2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  )
}

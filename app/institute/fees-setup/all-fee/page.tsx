'use client'

import React, { useState } from 'react'
import { Search, Upload, Filter, Receipt, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const ALL_FEE_DATA = [
  { id: 1, class: 'Class VIII', section: 'Section A', name: 'Rajesh', reg: '3000/-', adm: '6000/-', classFee: '12000/-', lib: '3000/-', exam: '6000/-', hostel: '12000/-', trans: '12000/-', extra: '12000/-', fine: '12000/-', pending: '-', total: '66000/-', status: 'Paid' },
  { id: 2, class: 'Class VIII', section: 'Section B', name: 'Suresh', reg: '8000/-', adm: '12000/-', classFee: '24000/-', lib: '6000/-', exam: '12000/-', hostel: '24000/-', trans: '24000/-', extra: '24000/-', fine: '24000/-', pending: '24000/-', total: '66000/-', status: 'Unpaid' },
  { id: 3, class: 'Class IX', section: 'Section C', name: 'Aditya', reg: '4500/-', adm: '90000/-', classFee: '18000/-', lib: '4500/-', exam: '90000/-', hostel: '18000/-', trans: '18000/-', extra: '18000/-', fine: '18000/-', pending: '-', total: '66000/-', status: 'Paid' },
]

export default function AllFeePage() {
  const [showFilter, setShowFilter] = useState(false)

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">All Fee</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Name, Class, Student Type" 
              className="pl-9 pr-4 py-2 w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
          </button>
          <button onClick={() => setShowFilter(true)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-[11px] text-center whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-4">S. No.</th>
                <th className="px-3 py-4">Class</th>
                <th className="px-3 py-4">Section</th>
                <th className="px-3 py-4 text-left">Student Name</th>
                <th className="px-3 py-4">Registration Fee</th>
                <th className="px-3 py-4">Admission Fee</th>
                <th className="px-3 py-4">Class Fee</th>
                <th className="px-3 py-4">Library Fee</th>
                <th className="px-3 py-4">Exam Fee</th>
                <th className="px-3 py-4">Hostel Fee</th>
                <th className="px-3 py-4">Transportation Fee</th>
                <th className="px-3 py-4">Extra Curricular Fee</th>
                <th className="px-3 py-4">Total Fine</th>
                <th className="px-3 py-4">Pending Fee</th>
                <th className="px-3 py-4 text-emerald-600">Total Fee</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4">Fee Receipt</th>
                <th className="px-3 py-4">Payment</th>
                <th className="px-3 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {ALL_FEE_DATA.map((student, i) => (
                <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-4 text-slate-500 font-medium">{i + 1}.</td>
                  <td className="px-3 py-4 text-slate-600">{student.class}</td>
                  <td className="px-3 py-4 text-slate-600">{student.section}</td>
                  <td className="px-3 py-4 text-slate-700 font-bold text-left">{student.name}</td>
                  <td className="px-3 py-4 text-slate-600">{student.reg}</td>
                  <td className="px-3 py-4 text-slate-600">{student.adm}</td>
                  <td className="px-3 py-4 text-slate-600">{student.classFee}</td>
                  <td className="px-3 py-4 text-slate-600">{student.lib}</td>
                  <td className="px-3 py-4 text-slate-600">{student.exam}</td>
                  <td className="px-3 py-4 text-slate-600">{student.hostel}</td>
                  <td className="px-3 py-4 text-slate-600">{student.trans}</td>
                  <td className="px-3 py-4 text-slate-600">{student.extra}</td>
                  <td className="px-3 py-4 text-slate-600">{student.fine}</td>
                  <td className="px-3 py-4 text-slate-600">{student.pending}</td>
                  <td className="px-3 py-4 text-slate-700 font-bold">{student.total}</td>
                  <td className="px-3 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      student.status === 'Paid' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-red-500 bg-red-50 border border-red-100'
                    }`}>
                      ● {student.status}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex justify-center">
                      <Receipt className="w-4 h-4 text-teal-500 cursor-pointer hover:text-teal-600 transition-colors" />
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex justify-center min-w-[70px]">
                      {student.status === 'Unpaid' && (
                        <button className="px-3 py-1 rounded-md bg-teal-600 text-white text-[10px] font-bold hover:bg-teal-700 transition-colors shadow-sm">
                          Pay Now
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center justify-center gap-1.5">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-[11px] font-medium text-slate-500">
          <span>Showing 1-10 of 456 Entries</span>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronsLeft className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded flex items-center justify-center bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-teal-600">2</button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronRight className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronsRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
      
    </div>
  )
}

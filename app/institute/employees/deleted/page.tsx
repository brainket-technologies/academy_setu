'use client'

import React, { useState } from 'react'
import { Download, Upload, Plus, Search, MoreVertical, Eye, ShieldCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw } from 'lucide-react'
import Link from 'next/link'

const DELETED_EMPLOYEES = [
  { id: 11, username: 'Emp001', name: 'Amit Kumar', role: 'Driver', contact: '9898989898', email: 'amit@gmail.com', status: 'Inactive', joinDate: '01/01/2025', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit' },
]

export default function DeletedEmployeesPage() {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Deleted Employee</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Name, Mobile no." 
              className="pl-9 pr-4 py-2 w-full sm:w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          <Link href="/institute/employees" className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors">
            Total Employee <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs">04</span>
          </Link>
          <Link href="/institute/employees/deleted" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold shadow-sm">
            <RotateCcw className="w-4 h-4" /> Deleted Employee <span className="bg-white text-teal-600 px-1.5 py-0.5 rounded text-xs">01</span>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">S. No.</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joining Date</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {DELETED_EMPLOYEES.map((emp, i) => (
                <tr key={emp.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-medium">{i + 1}.</td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{emp.username}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                      <span className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{emp.role}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{emp.contact}</td>
                  <td className="px-4 py-3 text-slate-500">{emp.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap text-red-500 bg-red-50 border border-red-100">
                      ● Deleted
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{emp.joinDate}</td>
                  <td className="px-4 py-3 text-center relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === emp.id ? null : emp.id)}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors mx-auto">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {/* Action Dropdown */}
                    {activeDropdown === emp.id && (
                      <div className="absolute right-8 top-10 z-10 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 animate-in zoom-in-95 duration-100">
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <RotateCcw className="w-4 h-4" /> Restore
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {DELETED_EMPLOYEES.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 font-medium">
                    No deleted employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-1 of 1 Entries</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded flex items-center justify-center bg-teal-600 text-white font-bold shadow-sm">1</button>
          </div>
        </div>

      </div>
    </div>
  )
}

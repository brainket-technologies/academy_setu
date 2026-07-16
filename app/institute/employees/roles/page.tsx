'use client'

import React from 'react'
import { Search, Edit, Trash2, ShieldCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const MOCK_ROLES = [
  { id: 1, name: 'Children Caretaker', totalEmployees: 2, createdAt: '11/08/2025 11:00 AM' },
  { id: 2, name: 'Security', totalEmployees: 2, createdAt: '11/08/2025 11:00 AM' },
  { id: 3, name: 'Receptionist', totalEmployees: 2, createdAt: '11/08/2025 11:00 AM' },
  { id: 4, name: 'Accountant', totalEmployees: 2, createdAt: '11/08/2025 11:00 AM' },
  { id: 5, name: 'Assistant Manager', totalEmployees: 2, createdAt: '11/08/2025 11:00 AM' },
  { id: 6, name: 'Peon', totalEmployees: 2, createdAt: '11/08/2025 11:00 AM' },
  { id: 7, name: 'Counsellor', totalEmployees: 2, createdAt: '11/08/2025 11:00 AM' },
  { id: 8, name: 'Team Manager', totalEmployees: 2, createdAt: '11/08/2025 11:00 AM' },
  { id: 9, name: 'Principal', totalEmployees: 2, createdAt: '11/08/2025 11:00 AM' },
  { id: 10, name: 'Vice Principal', totalEmployees: 2, createdAt: '11/08/2025 11:00 AM' },
]

export default function EmployeeRolesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Employee Role</h1>
      </div>

      {/* Create Role */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Create Role</h2>
        <div className="flex flex-col sm:flex-row items-end gap-4 max-w-lg">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-slate-700">Role</label>
            <input 
              type="text" 
              placeholder="Enter Role" 
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-full" 
            />
          </div>
          <button className="px-8 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm whitespace-nowrap">
            Create
          </button>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">All Sources</h2>
          <div className="relative w-full md:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Name, Mobile no." 
              className="pl-9 pr-4 py-2 w-full md:w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">S. No.</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-center">Total Employee</th>
                <th className="px-4 py-3 text-center">Created At</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ROLES.map((role, i) => (
                <tr key={role.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-medium">{i + 1}.</td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{role.name}</td>
                  <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">02</td>
                  <td className="px-4 py-3 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <span className="flex items-center gap-1"><span className="text-[10px]">📅</span> {role.createdAt.split(' ')[0]}</span>
                      <span className="flex items-center gap-1 text-[10px]"><span className="text-[10px]">⌚</span> {role.createdAt.split(' ')[1]} {role.createdAt.split(' ')[2]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100" title="Edit">
                        <Edit className="w-3 h-3" />
                      </button>
                      <button className="w-6 h-6 rounded bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100" title="Delete">
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100" title="Assign Permission">
                        <ShieldCheck className="w-3 h-3" />
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
            <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-100 text-slate-600">2</button>
            <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronRight className="w-4 h-4" /></button>
            <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-100 text-slate-400"><ChevronsRight className="w-4 h-4" /></button>
          </div>
        </div>

      </div>

    </div>
  )
}

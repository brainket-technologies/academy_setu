'use client'

import React, { useState } from 'react'
import { Download, Upload, Plus, Search, MoreVertical, Eye, Pencil, Trash2, ShieldCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Check } from 'lucide-react'
import Link from 'next/link'

const EMPLOYEES = [
  { id: 1, username: 'Emp123', name: 'Sudhir Rawat', role: 'Receptionist', contact: '9999999999', email: 'sudhirrawat123@gmail.com', status: 'Inactive', joinDate: '01/01/2026', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir' },
  { id: 2, username: 'Emp124', name: 'Sudhir Rawat', role: 'Team Manager', contact: '9999999999', email: 'sudhirrawat123@gmail.com', status: 'Active', joinDate: '01/01/2026', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir' },
  { id: 3, username: 'Emp125', name: 'Sudhir Rawat', role: 'Accountant', contact: '9999999999', email: 'sudhirrawat123@gmail.com', status: 'Active', joinDate: '01/01/2026', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir' },
  { id: 4, username: 'Emp126', name: 'Sudhir Rawat', role: 'HOD Math', contact: '9999999999', email: 'sudhirrawat123@gmail.com', status: 'Active', joinDate: '01/01/2026', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir' },
  { id: 5, username: 'Emp127', name: 'Sudhir Rawat', role: 'Manager', contact: '9999999999', email: 'sudhirrawat123@gmail.com', status: 'Active', joinDate: '01/01/2026', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir' },
  { id: 6, username: 'Emp128', name: 'Sudhir Rawat', role: 'Counsellor', contact: '9999999999', email: 'sudhirrawat123@gmail.com', status: 'Inactive', joinDate: '01/01/2026', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir' },
  { id: 7, username: 'Emp129', name: 'Sudhir Rawat', role: 'Peon', contact: '9999999999', email: 'sudhirrawat123@gmail.com', status: 'Active', joinDate: '01/01/2026', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir' },
  { id: 8, username: 'Emp130', name: 'Sudhir Rawat', role: 'Driver', contact: '9999999999', email: 'sudhirrawat123@gmail.com', status: 'Active', joinDate: '01/01/2026', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir' },
  { id: 9, username: 'Emp131', name: 'Sudhir Rawat', role: 'Assistant Manager', contact: '9999999999', email: 'sudhirrawat123@gmail.com', status: 'Inactive', joinDate: '01/01/2026', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir' },
  { id: 10, username: 'Emp132', name: 'Sudhir Rawat', role: 'Vice Principal', contact: '9999999999', email: 'sudhirrawat123@gmail.com', status: 'Active', joinDate: '01/01/2026', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sudhir' },
]

export default function AllEmployeesPage() {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">All Employee</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Name, Mobile no." 
              className="pl-9 pr-4 py-2 w-full sm:w-64 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition-colors shadow">
              <Download className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition-colors shadow">
              <Upload className="w-4 h-4" />
            </button>
            <Link href="/institute/employees/add" className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition-colors shadow">
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          <Link href="/institute/employees" className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold shadow-sm">
            <Check className="w-4 h-4" /> Total Employee <span className="bg-white text-teal-600 px-1.5 py-0.5 rounded text-xs">04</span>
          </Link>
          <Link href="/institute/employees/deleted" className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors">
            Deleted Employee <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs">01</span>
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
              {EMPLOYEES.map((emp, i) => (
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
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                      emp.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-red-500 bg-red-50 border border-red-100'
                    }`}>
                      ● {emp.status}
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
                        <Link href={`/institute/employees/${emp.id}`} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <Eye className="w-4 h-4" /> View
                        </Link>
                        <Link href={`/institute/employees/${emp.id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <Pencil className="w-4 h-4" /> Edit
                        </Link>
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                        <Link href={`/institute/employees/${emp.id}/assign-permission`} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <ShieldCheck className="w-4 h-4" /> Assign Permission
                        </Link>
                      </div>
                    )}
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
            <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50"><ChevronsLeft className="w-4 h-4"/></button>
            <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50"><ChevronLeft className="w-4 h-4"/></button>
            <button className="w-8 h-8 rounded flex items-center justify-center bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-teal-600 font-bold">2</button>
            <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50"><ChevronRight className="w-4 h-4"/></button>
            <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50"><ChevronsRight className="w-4 h-4"/></button>
          </div>
        </div>

      </div>
    </div>
  )
}

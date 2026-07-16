'use client'

import React, { useState } from 'react'
import { Search, Undo2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const DELETED_TEACHERS = [
  { id: 5, username: 'Teach127', name: 'Raj Kumar', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj', contact: '9990990055', email: 'raj.kumar@gmail.com', assignedClasses: ['Class I'], joiningDate: '01/01/2025', deletedAt: '10/06/2026' },
  { id: 6, username: 'Teach128', name: 'Meena Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meena', contact: '9990990044', email: 'meena.patel@gmail.com', assignedClasses: ['Class II', 'Class III'], joiningDate: '15/02/2025', deletedAt: '20/06/2026' },
]

const TOTAL_TEACHERS = 4

export default function DeletedTeachersPage() {
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')
  const [teachers, setTeachers] = useState(DELETED_TEACHERS)

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.contact.includes(searchTerm) ||
    t.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRestore = (id: number) => {
    if (confirm('Restore this teacher?')) {
      setTeachers(prev => prev.filter(t => t.id !== id))
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Deleted Teachers</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Mobile no."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400 w-64"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <Link href="/institute/teachers"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${pathname === '/institute/teachers' ? 'bg-teal-600 text-white border-teal-600 shadow' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:text-teal-600'}`}>
          Total Teacher
          <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${pathname === '/institute/teachers' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'}`}>
            {String(TOTAL_TEACHERS).padStart(2, '0')}
          </span>
        </Link>
        <Link href="/institute/teachers/deleted"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${pathname === '/institute/teachers/deleted' ? 'bg-red-500 text-white border-red-500 shadow' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-500'}`}>
          Deleted Teacher
          <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${pathname === '/institute/teachers/deleted' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'}`}>
            {String(teachers.length).padStart(2, '0')}
          </span>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse" style={{ minWidth: '800px' }}>
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-700">
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide text-left">S. No.</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide text-left">Username</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide text-left">Name</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">Contact</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">Email</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">Joining Date</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">Deleted At</th>
                <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wide">Restore</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((teacher, index) => (
                <tr key={teacher.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                  <td className="py-4 px-4 text-left">
                    <span className="text-xs font-bold text-slate-500">{index + 1}.</span>
                  </td>
                  <td className="py-4 px-4 text-left">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{teacher.username}</span>
                  </td>
                  <td className="py-4 px-4 text-left">
                    <div className="flex items-center gap-3">
                      <img src={teacher.avatar} alt={teacher.name}
                        className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover bg-slate-100 flex-shrink-0 grayscale opacity-70" />
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{teacher.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-500 font-medium">{teacher.contact}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-500 font-medium">{teacher.email}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-500 font-medium">{teacher.joiningDate}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-xs font-black">
                      {teacher.deletedAt}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleRestore(teacher.id)}
                      title="Restore Teacher"
                      className="mx-auto flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-medium text-sm">
                    No deleted teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <span className="text-xs font-bold text-slate-500">Showing 1–{filtered.length} of {filtered.length} Entries</span>
          <div className="flex items-center gap-1">
            {['«', '‹', '1', '›', '»'].map((label, i) => (
              <button key={i}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${label === '1' ? 'bg-teal-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

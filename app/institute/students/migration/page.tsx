'use client'

import React, { useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MigrationPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const migrations = [
    {
      id: 1,
      fromSession: '2024-25',
      toSession: '2025-26',
      fromClass: 'Class II',
      toClass: 'Class III',
      fromSection: 'Section A',
      toSection: 'Section A',
      totalStudents: 60,
      migrationDate: '15/03/2024',
      migratedBy: 'Kamal'
    },
    {
      id: 2,
      fromSession: '2022-23',
      toSession: '2023-24',
      fromClass: 'Class V',
      toClass: 'Class VI',
      fromSection: 'Section A',
      toSection: 'Section C',
      totalStudents: 45,
      migrationDate: '15/03/2024',
      migratedBy: 'Priya'
    },
    {
      id: 3,
      fromSession: '2023-24',
      toSession: '2025-26',
      fromClass: 'Class VII',
      toClass: 'Class VIII',
      fromSection: 'Section C',
      toSection: 'Section A',
      totalStudents: 26,
      migrationDate: '15/03/2024',
      migratedBy: 'Shyam'
    }
  ]

  const filtered = migrations.filter(m =>
    m.fromClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.toClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.migratedBy.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Migrations</h1>
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
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden p-6">
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-center border-collapse whitespace-nowrap min-w-[1100px]">
              <thead>
                <tr className="bg-sky-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">S. No.</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">From Session</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">To Session</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">From Class</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">To Class</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">From Section</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">To Section</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Total Student</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Migration Date</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Migrated By</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, index) => (
                  <tr key={row.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{index + 1}.</td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{row.fromSession}</td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{row.toSession}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-200">{row.fromClass}</td>
                    <td className="py-4 px-4 font-semibold text-teal-600 dark:text-teal-400">{row.toClass}</td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{row.fromSection}</td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{row.toSection}</td>
                    <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-200">{row.totalStudents}</td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{row.migrationDate}</td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{row.migratedBy}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => router.push(`/institute/students/migration/${row.id}`)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors shadow-sm border border-sky-100 mx-auto"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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

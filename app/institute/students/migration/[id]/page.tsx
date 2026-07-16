'use client'

import React, { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Dummy data keyed by migration ID
const migrationData: Record<string, any> = {
  '1': {
    fromSession: '2024-25',
    toSession: '2025-26',
    fromClass: 'Class II',
    toClass: 'Class III',
    totalMigrated: 60,
    migratedBy: 'Kamal',
    migrationDate: '25-03-2024, 03:50 PM',
    students: [
      { id: 1, admissionNo: '02456', name: 'Sohan Singh', avatar: 'https://i.pravatar.cc/150?u=1', contact: '9999999999', fromSection: 'Section A', toSection: 'Section A', feeAmount: 20000.00, dueAmount: 0, status: 'Paid' },
      { id: 2, admissionNo: '02456', name: 'Sohan Singh', avatar: 'https://i.pravatar.cc/150?u=2', contact: '9999999999', fromSection: 'Section A', toSection: 'Section C', feeAmount: 20000.00, dueAmount: 3500.80, status: 'Unpaid' },
      { id: 3, admissionNo: '02456', name: 'Sohan Singh', avatar: 'https://i.pravatar.cc/150?u=3', contact: '9999999999', fromSection: 'Section C', toSection: 'Section A', feeAmount: 20000.00, dueAmount: 1100.00, status: 'Unpaid' },
    ]
  },
  '2': {
    fromSession: '2022-23',
    toSession: '2023-24',
    fromClass: 'Class V',
    toClass: 'Class VI',
    totalMigrated: 45,
    migratedBy: 'Priya',
    migrationDate: '15-03-2024, 10:00 AM',
    students: [
      { id: 1, admissionNo: '03100', name: 'Rohit Sharma', avatar: 'https://i.pravatar.cc/150?u=5', contact: '9988776655', fromSection: 'Section A', toSection: 'Section C', feeAmount: 18000.00, dueAmount: 0, status: 'Paid' },
      { id: 2, admissionNo: '03101', name: 'Anjali Gupta', avatar: 'https://i.pravatar.cc/150?u=6', contact: '9988776644', fromSection: 'Section B', toSection: 'Section A', feeAmount: 18000.00, dueAmount: 2000.00, status: 'Unpaid' },
    ]
  },
  '3': {
    fromSession: '2023-24',
    toSession: '2025-26',
    fromClass: 'Class VII',
    toClass: 'Class VIII',
    totalMigrated: 26,
    migratedBy: 'Shyam',
    migrationDate: '01-04-2024, 09:30 AM',
    students: [
      { id: 1, admissionNo: '04200', name: 'Priya Patel', avatar: 'https://i.pravatar.cc/150?u=9', contact: '9876543210', fromSection: 'Section C', toSection: 'Section A', feeAmount: 22000.00, dueAmount: 0, status: 'Paid' },
    ]
  }
}

export default function MigrationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const data = migrationData[params.id]

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 font-semibold">Migration record not found.</p>
      </div>
    )
  }

  const filtered = data.students.filter((s: any) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admissionNo.includes(searchTerm)
  )

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Migration Details</h1>
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

      {/* Session & Class Details Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
          Session &amp; Class Details
        </h2>

        {/* Session/Class Row */}
        <div className="border border-slate-200 dark:border-slate-600 rounded-xl p-5 mb-4 grid grid-cols-2 gap-y-3">
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-slate-500 w-28">From Session</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{data.fromSession}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-slate-500 w-28">To Session</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{data.toSession}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-slate-500 w-28">From Class</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{data.fromClass}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-slate-500 w-28">To Class</span>
            <span className="text-sm font-black text-teal-600 dark:text-teal-400">{data.toClass}</span>
          </div>
        </div>

        {/* Summary Row */}
        <div className="border border-slate-200 dark:border-slate-600 rounded-xl p-5 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">Total Migrated Student</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{data.totalMigrated}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">Migrated By</p>
            <p className="text-lg font-black text-slate-800 dark:text-slate-100">{data.migratedBy}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">Migration Date</p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{data.migrationDate}</p>
          </div>
        </div>
      </div>

      {/* Migrated Student Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm p-6">
        <h2 className="text-base font-black text-slate-800 dark:text-slate-100 mb-5">Migrated Student</h2>
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-center border-collapse whitespace-nowrap min-w-[900px]">
              <thead>
                <tr className="bg-sky-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">S. No.</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Admission No.</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300 text-left">Student</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Contact No.</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">From Section</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">To Section</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Fee Amount</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Due Amount</th>
                  <th className="py-4 px-4 font-bold text-slate-600 dark:text-slate-300">Fee Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student: any, index: number) => (
                  <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{index + 1}.</td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{student.admissionNo}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 justify-start">
                        <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{student.contact}</td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{student.fromSection}</td>
                    <td className="py-4 px-4 font-semibold text-teal-600 dark:text-teal-400">{student.toSection}</td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">{student.feeAmount.toFixed(2)}</td>
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {student.dueAmount > 0 ? student.dueAmount.toFixed(2) : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        student.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-red-100 text-red-600 border border-red-200'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-5">
          <span className="text-xs font-bold text-slate-500">Showing 1-{filtered.length} of {data.students.length} Entries</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"><ChevronsLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-teal-600 text-white font-bold text-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors font-semibold text-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"><ChevronsRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

    </div>
  )
}

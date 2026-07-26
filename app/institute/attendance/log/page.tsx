'use client'

import React, { useState } from 'react'
import { Search, UploadCloud, CheckCircle2 } from 'lucide-react'

interface StudentAttendanceRecord {
  rollNo: string
  name: string
  avatar: string
  days: string[]
}

const INITIAL_LOGS: StudentAttendanceRecord[] = [
  { rollNo: '45', name: 'Suraj', avatar: '👦', days: ['P', 'P', 'H', 'H', 'P', 'P', 'P', 'P', 'P', 'A', 'F', 'L', 'P', 'P', 'A', 'A', 'P', 'P', 'P', 'P', 'P', 'P', 'H', 'P', 'P'] },
  { rollNo: '32', name: 'Ravi', avatar: '👦', days: ['P', 'P', 'H', 'H', 'P', 'P', 'P', 'P', 'P', 'A', 'F', 'L', 'P', 'P', 'A', 'A', 'P', 'P', 'P', 'P', 'P', 'P', 'H', 'P', 'P'] },
  { rollNo: '12', name: 'Kirti', avatar: '👧', days: ['P', 'P', 'H', 'H', 'P', 'P', 'P', 'P', 'P', 'A', 'F', 'L', 'P', 'P', 'A', 'A', 'P', 'P', 'P', 'P', 'P', 'P', 'H', 'P', 'P'] },
]

export default function AttendanceLogPage() {
  const [logType, setLogType] = useState<'QR' | 'Manual' | 'Biometric'>('Biometric')
  const [session, setSession] = useState('2025-2026')
  const [className, setClassName] = useState('Class V')
  const [section, setSection] = useState('Section B')

  const getCellColor = (char: string) => {
    switch (char) {
      case 'P': return 'text-emerald-500 font-bold'
      case 'A': return 'text-red-500 font-bold'
      case 'H': return 'text-purple-500 font-bold'
      case 'L': return 'text-amber-500 font-bold'
      case 'F': return 'text-indigo-500 font-bold'
      default: return 'text-slate-400'
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Attendance Log</h1>
        <p className="text-xs text-slate-400">View logged attendance reports by source channels</p>
      </div>

      {/* Log channel tabs (Screenshot 2) */}
      <div className="flex bg-white dark:bg-slate-800 border p-2 rounded-2xl gap-3 max-w-sm shadow-sm select-none">
        {(['QR', 'Manual', 'Biometric'] as const).map(type => (
          <button 
            key={type}
            type="button" 
            onClick={() => setLogType(type)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              logType === type 
                ? 'bg-teal-600 text-white font-black shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Query filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-6">
        
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex flex-col gap-1.5 shrink-0">
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Select Session</label>
            <select value={session} onChange={e => setSession(e.target.value)} className="border rounded-lg p-1.5 text-xs outline-none bg-white font-bold w-36">
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Class</label>
            <select value={className} onChange={e => setClassName(e.target.value)} className="border rounded-lg p-1.5 text-xs outline-none bg-white font-bold w-36">
              <option value="Class V">Class V</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Section</label>
            <select value={section} onChange={e => setSection(e.target.value)} className="border rounded-lg p-1.5 text-xs outline-none bg-white font-bold w-36">
              <option value="Section B">Section B</option>
            </select>
          </div>

          <div className="flex-1 flex justify-end pt-4">
            <button 
              type="button" 
              onClick={() => alert('Exporting log logs...')}
              className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors bg-white shadow-sm animate-in fade-in"
            >
              <UploadCloud className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Attendance log day sheet grid */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-center text-xs border-collapse">
            <thead className="bg-slate-50 font-black border-b text-slate-655">
              <tr className="border-b">
                <th className="py-3 px-4 w-20 text-left">Roll No.</th>
                <th className="px-4 text-left">Name</th>
                {Array.from({ length: 25 }, (_, i) => (
                  <th key={i} className="px-1.5 py-3 w-7">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INITIAL_LOGS.map(student => (
                <tr key={student.rollNo} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="py-3.5 px-4 text-left font-black text-slate-500">{student.rollNo}</td>
                  <td className="px-4 text-left font-extrabold text-slate-800 flex items-center gap-2 py-3.5">
                    <span>{student.avatar}</span>
                    <span>{student.name}</span>
                  </td>
                  {student.days.map((char, idx) => (
                    <td key={idx} className={`px-1.5 py-3.5 ${getCellColor(char)}`}>{char}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}

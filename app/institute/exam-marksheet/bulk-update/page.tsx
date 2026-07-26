'use client'

import React, { useState, useEffect } from 'react'
import { Search, ArrowUpFromLine, CheckCircle2 } from 'lucide-react'

interface StudentMarksRow {
  id: number
  studentName: string
  hindi: string
  hindiPrac: string
  english: string
  math: string
  totalMarks: number
  obtMarks: number
  percentage: string
  rank: number
  saving?: boolean
  saved?: boolean
}

const INITIAL_ROWS: StudentMarksRow[] = [
]

export default function BulkMarksUpdatePage() {
  const [session, setSession] = useState('2025-2026')
  const [classVal, setClassVal] = useState('Class V')
  const [section, setSection] = useState('Section B')
  const [exam, setExam] = useState('Half Yearly Exam')
  const [searchQuery, setSearchQuery] = useState('')
  const [rows, setRows] = useState<StudentMarksRow[]>(INITIAL_ROWS)
  const [successToast, setSuccessToast] = useState(false)

  // Compute obtained marks, percentage, and ranks reactively when marks change
  useEffect(() => {
    setRows(prev => {
      // 1. Calculate obtained marks and percentage for each row
      const updated = prev.map(row => {
        const h = Number(row.hindi) || 0
        const hp = Number(row.hindiPrac) || 0
        const e = Number(row.english) || 0
        const m = Number(row.math) || 0
        const obt = h + hp + e + m
        const pct = ((obt / row.totalMarks) * 100).toFixed(1) + '%'
        return { ...row, obtMarks: obt, percentage: pct }
      })

      // 2. Rank them based on obtained marks desc
      const sorted = [...updated].sort((a, b) => b.obtMarks - a.obtMarks)
      return updated.map(row => {
        const rankIndex = sorted.findIndex(s => s.id === row.id)
        // Ensure simple rank calculation (handle ties if needed, but index+1 is standard)
        return { ...row, rank: rankIndex + 1 }
      })
    })
  }, [
    // Depend on the specific marks values of rows
    JSON.stringify(rows.map(r => `${r.hindi}-${r.hindiPrac}-${r.english}-${r.math}`))
  ])

  const handleInputChange = (id: number, field: 'hindi' | 'hindiPrac' | 'english' | 'math', value: string) => {
    // Basic numbers-only constraint
    if (value !== '' && isNaN(Number(value))) return

    setRows(prev => prev.map(row => {
      if (row.id === id) {
        // Simple upper bound check (let's say 100 for subjects, 50 for practicals)
        const limit = field === 'hindiPrac' ? 50 : 100
        if (Number(value) > limit) return row
        return { ...row, [field]: value }
      }
      return row
    }))
  }

  const handleUpdateRow = (id: number) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, saving: true, saved: false } : row))
    
    // Simulate API update
    setTimeout(() => {
      setRows(prev => prev.map(row => row.id === id ? { ...row, saving: false, saved: true } : row))
      setSuccessToast(true)
      setTimeout(() => setSuccessToast(false), 3000)
    }, 800)
  }

  // Filter rows based on search query
  const filteredRows = rows.filter(row => 
    row.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header & Search */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Bulk Marks Update</h1>
        
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Name, Class, Student Type" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-72 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-700 dark:text-slate-300"
          />
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        
        {/* Filters and Upload Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Session</label>
              <select 
                value={session}
                onChange={e => setSession(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none focus:border-teal-500"
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class</label>
              <select 
                value={classVal}
                onChange={e => setClassVal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none focus:border-teal-500"
              >
                <option value="Class V">Class V</option>
                <option value="Class II">Class II</option>
                <option value="Class III">Class III</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Section</label>
              <select 
                value={section}
                onChange={e => setSection(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none focus:border-teal-500"
              >
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam</label>
              <select 
                value={exam}
                onChange={e => setExam(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none focus:border-teal-500"
              >
                <option value="Half Yearly Exam">Half Yearly Exam</option>
                <option value="Final Exam">Final Exam</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          <button 
            onClick={() => alert('Exporting marks register...')}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm self-end"
            title="Export spreadsheet template"
          >
            <ArrowUpFromLine className="w-4 h-4" />
          </button>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-4 w-14">S. No.</th>
                <th className="px-4 py-4 text-left">Student</th>
                <th className="px-3 py-4 w-24">Hindi</th>
                <th className="px-3 py-4 w-24">Hindi Practical</th>
                <th className="px-3 py-4 w-24">English</th>
                <th className="px-3 py-4 w-24">Math</th>
                <th className="px-3 py-4 w-24">Obt. Marks</th>
                <th className="px-3 py-4 w-24">Total Marks</th>
                <th className="px-3 py-4 w-24">Percentage</th>
                <th className="px-3 py-4 w-16">Rank</th>
                <th className="px-4 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr key={row.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-4 text-slate-500 font-medium">{i + 1}.</td>
                  <td className="px-4 py-4 text-left text-slate-800 dark:text-slate-200 font-bold">{row.studentName}</td>
                  
                  {/* Subjects Input Fields */}
                  <td className="px-3 py-4">
                    <input 
                      type="text" 
                      value={row.hindi} 
                      onChange={e => handleInputChange(row.id, 'hindi', e.target.value)}
                      className="w-16 px-2 py-1 text-center border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded font-semibold focus:border-teal-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-4">
                    <input 
                      type="text" 
                      value={row.hindiPrac} 
                      onChange={e => handleInputChange(row.id, 'hindiPrac', e.target.value)}
                      className="w-16 px-2 py-1 text-center border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded font-semibold focus:border-teal-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-4">
                    <input 
                      type="text" 
                      value={row.english} 
                      onChange={e => handleInputChange(row.id, 'english', e.target.value)}
                      className="w-16 px-2 py-1 text-center border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded font-semibold focus:border-teal-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-4">
                    <input 
                      type="text" 
                      value={row.math} 
                      onChange={e => handleInputChange(row.id, 'math', e.target.value)}
                      className="w-16 px-2 py-1 text-center border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded font-semibold focus:border-teal-500 focus:outline-none"
                    />
                  </td>

                  {/* Calculated metrics */}
                  <td className="px-3 py-4 text-slate-700 dark:text-slate-300 font-bold">{row.obtMarks}</td>
                  <td className="px-3 py-4">
                    <div className="w-16 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded font-bold text-slate-500 text-center mx-auto">
                      {row.totalMarks}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="w-16 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded font-bold text-slate-500 text-center mx-auto">
                      {row.percentage}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="w-10 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded font-extrabold text-[#1b3a60] text-center mx-auto">
                      {row.rank}
                    </div>
                  </td>

                  {/* Action Button */}
                  <td className="px-4 py-4">
                    <button 
                      onClick={() => handleUpdateRow(row.id)}
                      disabled={row.saving}
                      className={`w-full py-1.5 rounded text-[10px] font-bold tracking-wide uppercase transition-all shadow-sm text-white ${
                        row.saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-teal-600 hover:bg-teal-700'
                      }`}
                    >
                      {row.saving ? 'Saving...' : row.saved ? 'Saved ✓' : 'Update'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-10 of 456 Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-teal-600">2</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">»</button>
          </div>
        </div>
      </div>

      {/* Success notification toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div className="text-xs font-bold">Marksheet successfully updated!</div>
        </div>
      )}

    </div>
  )
}

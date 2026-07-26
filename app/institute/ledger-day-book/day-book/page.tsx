'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Search, Download } from 'lucide-react'

interface DayBookRecord {
  id: number
  date: string
  totalCR: string
  totalDR: string
  netCash: string
  transactionsCount: number
}

const INITIAL_DAYBOOKS: DayBookRecord[] = [
]

export default function DayBookPage() {
  const [daybooks, setDaybooks] = useState<DayBookRecord[]>(INITIAL_DAYBOOKS)
  const [selectedDate, setSelectedDate] = useState('')

  // Load from local storage dynamically
  useEffect(() => {
    const saved = localStorage.getItem('school_ledgers')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Group by Date to populate daily book aggregates
        const grouped: Record<string, { cr: number; dr: number; count: number }> = {}
        parsed.forEach((l: any) => {
          const rawDate = l.date.split(' ')[0] // e.g. "15/09/2025"
          if (!grouped[rawDate]) {
            grouped[rawDate] = { cr: 0, dr: 0, count: 0 }
          }
          const val = parseInt(l.amount.replace(/[^\d]/g, '')) || 0
          if (l.txnType === 'CR') {
            grouped[rawDate].cr += val
          } else {
            grouped[rawDate].dr += val
          }
          grouped[rawDate].count += 1
        })

        const mappedList: DayBookRecord[] = Object.keys(grouped).map((dateKey, index) => {
          const crVal = grouped[dateKey].cr
          const drVal = grouped[dateKey].dr
          const net = crVal - drVal
          return {
            id: index + 100,
            date: dateKey,
            totalCR: `${crVal.toLocaleString()}/-`,
            totalDR: `${drVal.toLocaleString()}/-`,
            netCash: `${net >= 0 ? '' : '-'}${Math.abs(net).toLocaleString()}/-`,
            transactionsCount: grouped[dateKey].count
          }
        })

        if (mappedList.length > 0) {
          setDaybooks(mappedList)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }, [])

  const filtered = daybooks.filter(d => {
    if (!selectedDate) return true
    const parsedQuery = new Date(selectedDate).toLocaleDateString('en-GB')
    return d.date === parsedQuery
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 font-extrabold">Day Book</h1>
          <p className="text-xs text-slate-400">Track daily audit reports, aggregate credit receipts, and cash flows</p>
        </div>
      </div>

      {/* Date filter (Screenshot style) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search date */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 w-full sm:w-auto">
          <label className="text-slate-400">Select Date:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-xl outline-none font-bold bg-white"
          />
        </div>

        <button 
          onClick={() => alert('Downloading daily Day Book audit file...')}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>

      </div>

      {/* Day Book list */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Statement Date</th>
                <th className="px-4 py-4">Total Credit (CR)</th>
                <th className="px-4 py-4">Total Debit (DR)</th>
                <th className="px-4 py-4">Net Daily Flow</th>
                <th className="px-4 py-4">Total Transactions</th>
                <th className="px-4 py-4 w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-800">{item.date}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600">{item.totalCR}</td>
                  <td className="px-4 py-3.5 font-bold text-rose-500">{item.totalDR}</td>
                  <td className={`px-4 py-3.5 font-black ${
                    item.netCash.startsWith('-') ? 'text-rose-550' : 'text-slate-900'
                  }`}>{item.netCash}</td>
                  <td className="px-4 py-3.5 text-slate-500">{item.transactionsCount} entries</td>
                  <td className="px-4 py-3.5">
                    <button 
                      onClick={() => alert(`Opening daily Day Book details for ${item.date}...`)}
                      className="px-3 py-1.5 rounded bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200 font-bold transition-all text-[10px] uppercase"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">No daily book logs registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}

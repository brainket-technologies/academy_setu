'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, UploadCloud, CheckCircle2, Filter } from 'lucide-react'
import Link from 'next/link'

interface FeeChartRecord {
  id: number
  from: string
  location: string
  km: number
  amount: number
  createdAt: string
}

const INITIAL_FEES: FeeChartRecord[] = [
]

export default function TransportationFeePage() {
  const [feeCharts, setFeeCharts] = useState<FeeChartRecord[]>(INITIAL_FEES)
  const [searchQuery, setSearchQuery] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('transportation_fees')
    if (saved) {
      try {
        setFeeCharts(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('transportation_fees', JSON.stringify(INITIAL_FEES))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this stoppage fee configuration?')) {
      const updated = feeCharts.filter(f => f.id !== id)
      setFeeCharts(updated)
      localStorage.setItem('transportation_fees', JSON.stringify(updated))
      setToastMsg('Fee configuration deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const filtered = feeCharts.filter(f => 
    f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.from.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Tranportation Fee</h1>
          <p className="text-xs text-slate-400">Configure pickup location distances and student monthly charge rates</p>
        </div>
        
        <Link 
          href="/institute/transport/route/create"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1b3a60] hover:bg-[#1b3a60]/95 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Setup New Route & Fee
        </Link>
      </div>

      {/* Control Actions / Search and Export Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        <div className="w-full sm:w-auto">
          <h2 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider">All Transportation Fee</h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search by Destination..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold w-56"
            />
          </div>

          <button 
            type="button"
            onClick={() => alert('Exporting transport fee charts...')}
            className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 bg-white"
            title="Export List"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
          
          <button 
            type="button"
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-teal-650 hover:bg-slate-50 bg-white"
            title="Filters"
          >
            <Filter className="w-4 h-4 text-teal-600" />
          </button>
        </div>

      </div>

      {/* Metric Badges row (Screenshot 1) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-700 block">Transportation Fee Chart</span>
            <span className="text-xl font-black text-purple-600 mt-1 block">03</span>
          </div>
          <span className="text-2xl">📊</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Applicable Student</span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">456</span>
          </div>
          <span className="text-2xl">👥</span>
        </div>

        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-sky-700 block">Paid Student</span>
            <span className="text-xl font-black text-sky-600 mt-1 block">250</span>
          </div>
          <span className="text-2xl">💳</span>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-red-700 block">Pending Student</span>
            <span className="text-xl font-black text-red-500 mt-1 block">120</span>
          </div>
          <span className="text-2xl">⚠️</span>
        </div>
      </div>

      {/* Table grid listing (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">From</th>
                <th className="px-4 py-4 text-left">Enter Pickup/Stoppage Location</th>
                <th className="px-4 py-4">KM</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-semibold text-slate-500">{item.from}</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-850 dark:text-slate-200">{item.location}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">{item.km}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">{item.amount}/-</td>
                  <td className="px-4 py-3.5 text-slate-500 font-semibold">{item.createdAt}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link 
                        href={`/institute/transport/route/create?editId=${item.id}`}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                        title="Edit Details"
                      >
                        <Pencil className="w-3 h-3" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        title="Delete Fee Option"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">No transportation stoppage rates defined.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-{filtered.length} of 456 Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-teal-655">2</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">»</button>
          </div>
        </div>

      </div>

      {/* TOAST ALERT */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

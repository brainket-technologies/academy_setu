'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, UploadCloud, Plus, Pencil, Trash2, X, Download, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface TransferRecord {
  id: number
  txnId: string
  amount: string
  txnType: 'CR' | 'DR'
  mode: string
  date: string
}

const INITIAL_TRANSFERS: TransferRecord[] = [
]

export default function BankTransfersPage() {
  const [transfers, setTransfers] = useState<TransferRecord[]>(INITIAL_TRANSFERS)
  const [searchQuery, setSearchQuery] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('bank_transfers')
    if (saved) {
      try {
        setTransfers(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('bank_transfers', JSON.stringify(INITIAL_TRANSFERS))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this bank transfer log?')) {
      const updated = transfers.filter(t => t.id !== id)
      setTransfers(updated)
      localStorage.setItem('bank_transfers', JSON.stringify(updated))
      setToastMsg('Transfer log deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const filtered = transfers.filter(t => 
    t.txnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.mode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 font-extrabold">Bank Transfers</h1>
          <p className="text-xs text-slate-400">View direct ledger accounts bank clearings and deposits</p>
        </div>
      </div>

      {/* Control Actions (Screenshot 3) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search by transaction, mobile no..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            type="button" 
            onClick={() => alert('Exporting bank transfers statement...')}
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 bg-white shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
          <Link 
            href="/institute/ledger-day-book/ledger/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-650 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Grid listing table (Screenshot 3) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
          
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">TXN ID</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">TXN Type</th>
                <th className="px-4 py-4">Mode</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Receipt</th>
                <th className="px-4 py-4 w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-mono text-slate-550">{item.txnId}</td>
                  <td className="px-4 py-3.5 font-black text-slate-900">{item.amount}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                      item.txnType === 'CR' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-550'
                    }`}>
                      {item.txnType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-650">{item.mode}</td>
                  <td className="px-4 py-3.5 text-slate-450 font-semibold">{item.date}</td>
                  <td className="px-4 py-3.5">
                    <button 
                      onClick={() => alert('Downloading transfer transaction receipt...')}
                      className="p-1.5 rounded hover:bg-slate-100 text-teal-600 transition-colors border border-slate-200 bg-white"
                      title="Download Receipt"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => alert('Editing bank transfer details...')}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                        title="Edit Details"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        title="Delete Log"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">No bank transfers logged.</td>
                </tr>
              )}
            </tbody>
          </table>

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

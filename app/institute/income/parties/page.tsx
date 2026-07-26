'use client'

import React, { useState, useEffect } from 'react'
import { Search, UploadCloud, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface PartyRecord {
  id: number
  partyName: string
  contactPerson: string
  amount: string
  mobileNo: string
  email: string
  gstNo: string
  createdAt: string
}

const INITIAL_PARTIES: PartyRecord[] = [
]

export default function IncomePartiesPage() {
  const [parties, setParties] = useState<PartyRecord[]>(INITIAL_PARTIES)
  const [searchQuery, setSearchQuery] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('income_parties')
    if (saved) {
      try {
        setParties(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('income_parties', JSON.stringify(INITIAL_PARTIES))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this income party record?')) {
      const updated = parties.filter(p => p.id !== id)
      setParties(updated)
      localStorage.setItem('income_parties', JSON.stringify(updated))
      setToastMsg('Income party record deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const filtered = parties.filter(p => 
    p.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.gstNo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 font-extrabold">Incomes Parties</h1>
          <p className="text-xs text-slate-400">Manage payee and client accounts for invoicing logs</p>
        </div>
      </div>

      {/* Control Actions (Screenshot 4) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search by Name, Mobile no..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            type="button" 
            onClick={() => alert('Exporting income party dataset...')}
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 bg-white shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
          <Link 
            href="/institute/income/parties/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Party log table list */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Income Party Name</th>
                <th className="px-4 py-4 text-left">Contact Person</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Mobile No.</th>
                <th className="px-4 py-4 text-left">Email</th>
                <th className="px-4 py-4">GST No.</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4 w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-850">{item.partyName}</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-700">{item.contactPerson}</td>
                  <td className="px-4 py-3.5 font-black text-slate-900">{item.amount}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.mobileNo}</td>
                  <td className="px-4 py-3.5 text-left text-slate-500 font-medium">{item.email}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{item.gstNo}</td>
                  <td className="px-4 py-3.5 text-slate-450 font-semibold">{item.createdAt}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-colors"
                        title="Delete Party Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">No income parties registered.</td>
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

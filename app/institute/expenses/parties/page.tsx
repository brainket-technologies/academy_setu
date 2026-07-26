'use client'

import React, { useState, useEffect } from 'react'
import { Search, Pencil, Trash2, CheckCircle2 } from 'lucide-react'

interface PartyRecord {
  id: number
  partyName: string
  createdAt: string
}

const INITIAL_PARTIES: PartyRecord[] = [
  { id: 1, partyName: 'budget', createdAt: '15/09/2025 11:00 AM' },
  { id: 2, partyName: 'Ranjeet', createdAt: '15/09/2025 11:00 AM' },
  { id: 3, partyName: 'Komal', createdAt: '15/09/2025 11:00 AM' },
  { id: 4, partyName: 'Sohan', createdAt: '15/09/2025 11:00 AM' },
  { id: 5, partyName: 'Vehicle', createdAt: '15/09/2025 11:00 AM' },
]

export default function ExpensesPartiesPage() {
  const [parties, setParties] = useState<PartyRecord[]>(INITIAL_PARTIES)
  const [searchQuery, setSearchQuery] = useState('')

  // Form inputs
  const [partyName, setPartyName] = useState('')
  const [editId, setEditId] = useState<number | null>(null)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('expense_parties')
    if (saved) {
      try {
        setParties(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('expense_parties', JSON.stringify(INITIAL_PARTIES))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!partyName.trim()) {
      alert('Please fill in Expense Party Name.')
      return
    }

    const payload: PartyRecord = {
      id: editId || Date.now(),
      partyName,
      createdAt: editId 
        ? parties.find(p => p.id === editId)?.createdAt || '15/09/2025 11:00 AM'
        : new Date().toLocaleDateString('en-GB') + ' 11:00 AM'
    }

    let updated: PartyRecord[] = []
    if (editId) {
      updated = parties.map(p => p.id === editId ? payload : p)
      setToastMsg('Expense party updated successfully!')
      setEditId(null)
    } else {
      updated = [...parties, payload]
      setToastMsg('Expense party created successfully!')
    }

    setParties(updated)
    localStorage.setItem('expense_parties', JSON.stringify(updated))
    setPartyName('')

    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleEdit = (p: PartyRecord) => {
    setEditId(p.id)
    setPartyName(p.partyName)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this expense party?')) {
      const updated = parties.filter(p => p.id !== id)
      setParties(updated)
      localStorage.setItem('expense_parties', JSON.stringify(updated))
      setToastMsg('Expense party deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const filtered = parties.filter(p => 
    p.partyName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Expenses Parties</h1>
        <p className="text-xs text-slate-400">Establish and manage supplier/merchant ledger tags</p>
      </div>

      {/* Add Parties Form (Screenshot 3) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
        <h3 className="text-xs font-black text-slate-800 border-b pb-2 uppercase tracking-wider text-[#1b3a60] mb-4">Add Parties</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="flex flex-col gap-1.5 max-w-md">
            <label className="font-bold text-slate-700">Expense Party Name *</label>
            <input 
              type="text" 
              placeholder="Enter Expense Party Name" 
              value={partyName} 
              onChange={e => setPartyName(e.target.value)} 
              className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold" 
              required 
            />
          </div>

          <div className="flex justify-start pt-2">
            <button 
              type="submit"
              className="px-8 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
            >
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      {/* All Sources list table (Screenshot 3) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider text-[#1b3a60]">All Sources</h3>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold w-full bg-white shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Expense Party Name</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-850">{item.partyName}</td>
                  <td className="px-4 py-3.5 text-slate-450 font-semibold">{item.createdAt}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                        title="Edit Details"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        title="Delete Party"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-bold">No parties registered.</td>
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

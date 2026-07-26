'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, UploadCloud, Plus, Eye, Pencil, Trash2, X, Download, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface LedgerRecord {
  id: number
  referenceId: string
  txnId: string
  amount: string
  txnType: 'CR' | 'DR'
  entryType: 'Fee' | 'Expenses' | 'Income'
  paymentMode: string
  date: string
  bankName: string
  totalBankAmount: string
}

const INITIAL_LEDGERS: LedgerRecord[] = [
]

export default function LedgerDashboardPage() {
  const [ledgers, setLedgers] = useState<LedgerRecord[]>(INITIAL_LEDGERS)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal Dialogs
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedLedger, setSelectedLedger] = useState<LedgerRecord | null>(null)

  // Filter fields (Screenshot 4)
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [filterTxnType, setFilterTxnType] = useState('')
  const [filterEntryType, setFilterEntryType] = useState('')
  const [filterSession, setFilterSession] = useState('')
  const [filterTxnId, setFilterTxnId] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('school_ledgers')
    if (saved) {
      try {
        setLedgers(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_ledgers', JSON.stringify(INITIAL_LEDGERS))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this ledger entry?')) {
      const updated = ledgers.filter(l => l.id !== id)
      setLedgers(updated)
      localStorage.setItem('school_ledgers', JSON.stringify(updated))
      setToastMsg('Ledger entry deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const handleClearFilters = () => {
    setFilterFrom('')
    setFilterTo('')
    setFilterTxnType('')
    setFilterEntryType('')
    setFilterSession('')
    setFilterTxnId('')
    setFilterModalOpen(false)
  }

  const filtered = ledgers.filter(l => {
    const matchesSearch = l.entryType.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.paymentMode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.txnId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTxnType = !filterTxnType || l.txnType === filterTxnType
    const matchesEntryType = !filterEntryType || l.entryType === filterEntryType
    const matchesTxnId = !filterTxnId || l.txnId.toLowerCase().includes(filterTxnId.toLowerCase())

    return matchesSearch && matchesTxnType && matchesEntryType && matchesTxnId
  })

  // Calculate Metrics from Ledgers
  const totalFeeReceived = ledgers
    .filter(l => l.entryType === 'Fee' && l.txnType === 'CR')
    .reduce((acc, curr) => acc + (parseInt(curr.amount.replace(/[^\d]/g, '')) || 0), 0)

  const totalIncome = ledgers
    .filter(l => l.entryType === 'Income' && l.txnType === 'CR')
    .reduce((acc, curr) => acc + (parseInt(curr.amount.replace(/[^\d]/g, '')) || 0), 0)

  const totalExpense = ledgers
    .filter(l => l.txnType === 'DR')
    .reduce((acc, curr) => acc + (parseInt(curr.amount.replace(/[^\d]/g, '')) || 0), 0)

  const grossIncome = totalFeeReceived + totalIncome
  const netIncome = grossIncome - totalExpense

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Ledger</h1>
        <p className="text-xs text-slate-400">Review double-entry transaction books and operating income audits</p>
      </div>

      {/* Metrics Summary cards (Screenshot 1) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Fee Received</p>
            <h3 className="text-lg font-black text-emerald-600">{(totalFeeReceived / 1000).toFixed(0)}K</h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">₹</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Income</p>
            <h3 className="text-lg font-black text-rose-500">{(totalIncome / 1000).toFixed(0)}K</h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-xs">₹</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Gross Income</p>
            <h3 className="text-lg font-black text-blue-600">{(grossIncome / 1000).toFixed(0)}K</h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">₹</div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Expense</p>
            <h3 className="text-lg font-black text-teal-650">{(totalExpense / 1000).toFixed(0)}K</h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">₹</div>
        </div>

        {/* Card 5 */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Net Income</p>
            <h3 className="text-lg font-black text-purple-600">{(netIncome / 1000).toFixed(0)}K</h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">₹</div>
        </div>

      </div>

      {/* Control Actions */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search by txn details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            type="button" 
            onClick={() => setFilterModalOpen(true)}
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-teal-650 hover:bg-slate-50 bg-white shadow-sm"
            title="Advanced Filters"
          >
            <Filter className="w-4 h-4 text-teal-600" />
          </button>
          <button 
            type="button" 
            onClick={() => alert('Exporting ledger log sheet...')}
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 bg-white shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
          <Link 
            href="/institute/ledger-day-book/ledger/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Grid listing table (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
          
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4">ID</th>
                <th className="px-4 py-4 text-left">TXN ID</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">TXN Type</th>
                <th className="px-4 py-4">Entry Type</th>
                <th className="px-4 py-4">Payment Mode</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4 text-left">Bank Name</th>
                <th className="px-4 py-4">Total Bank Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-slate-500 font-bold">{item.referenceId}</td>
                  <td className="px-4 py-3.5 text-left font-mono text-slate-550">{item.txnId}</td>
                  <td className="px-4 py-3.5 font-black text-slate-900">{item.amount}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                      item.txnType === 'CR' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-550'
                    }`}>
                      {item.txnType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-bold">{item.entryType}</td>
                  <td className="px-4 py-3.5 text-slate-650">{item.paymentMode}</td>
                  <td className="px-4 py-3.5 text-slate-450 font-semibold">{item.date}</td>
                  <td className="px-4 py-3.5 text-left text-slate-600">{item.bankName}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-700">{item.totalBankAmount}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-bold">No ledger logs saved.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

      </div>

      {/* ================================== ADVANCED FILTER DIALOG OVERLAY (Screenshot 4) ================================== */}
      {filterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
          <div 
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 relative p-6 space-y-6"
          >
            <button 
              onClick={() => setFilterModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700 font-semibold pt-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">From</label>
                <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">To</label>
                <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">TXN Type</label>
                <select value={filterTxnType} onChange={e => setFilterTxnType(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select an option</option>
                  <option value="CR">CR</option>
                  <option value="DR">DR</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">Entry Type</label>
                <select value={filterEntryType} onChange={e => setFilterEntryType(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select an option</option>
                  <option value="Fee">Fee</option>
                  <option value="Expenses">Expenses</option>
                  <option value="Income">Income</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">Session</label>
                <select value={filterSession} onChange={e => setFilterSession(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select Session</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">TXN ID</label>
                <input 
                  type="text" 
                  placeholder="Enter TXN ID" 
                  value={filterTxnId} 
                  onChange={e => setFilterTxnId(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-lg font-bold outline-none" 
                />
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4 border-t">
              <button 
                onClick={() => setFilterModalOpen(false)}
                className="px-8 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
              >
                Filter
              </button>
              <button 
                onClick={handleClearFilters}
                className="px-8 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors bg-white"
              >
                Clear
              </button>
            </div>

          </div>
        </div>
      )}

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

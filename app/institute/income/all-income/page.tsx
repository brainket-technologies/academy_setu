'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, UploadCloud, Plus, Eye, Pencil, Trash2, X, Download, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface IncomeRecord {
  id: number
  transId: string
  incomeType: string
  amount: string
  paymentMode: 'Cash' | 'UPI' | 'RTGS'
  receivedDate: string
  receivedFrom: string
  status: 'Paid' | 'Unpaid'
}

const INITIAL_INCOMES: IncomeRecord[] = [
]

export default function AllIncomePage() {
  const [incomes, setIncomes] = useState<IncomeRecord[]>(INITIAL_INCOMES)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal Dialogs
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedIncome, setSelectedIncome] = useState<IncomeRecord | null>(null)

  // Filter fields (Screenshot 5)
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [filterPaymentMode, setFilterPaymentMode] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSession, setFilterSession] = useState('')
  const [filterParties, setFilterParties] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('school_incomes')
    if (saved) {
      try {
        setIncomes(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_incomes', JSON.stringify(INITIAL_INCOMES))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this income record?')) {
      const updated = incomes.filter(i => i.id !== id)
      setIncomes(updated)
      localStorage.setItem('school_incomes', JSON.stringify(updated))
      setToastMsg('Income record deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const handleClearFilters = () => {
    setFilterFrom('')
    setFilterTo('')
    setFilterPaymentMode('')
    setFilterCategory('')
    setFilterSession('')
    setFilterParties('')
    setFilterModalOpen(false)
  }

  const filtered = incomes.filter(i => {
    const matchesSearch = i.incomeType.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          i.receivedFrom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.transId.includes(searchQuery)

    const matchesMode = !filterPaymentMode || i.paymentMode === filterPaymentMode
    const matchesFrom = !filterParties || i.receivedFrom.toLowerCase().includes(filterParties.toLowerCase())
    const matchesCategory = !filterCategory || i.incomeType.toLowerCase().includes(filterCategory.toLowerCase())

    return matchesSearch && matchesMode && matchesFrom && matchesCategory
  })

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">All Income</h1>
        <p className="text-xs text-slate-400">Track and review miscellaneous school operational earnings</p>
      </div>

      {/* Control Actions (Screenshot 2) */}
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
            onClick={() => setFilterModalOpen(true)}
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-teal-650 hover:bg-slate-50 bg-white shadow-sm"
            title="Advanced Filters"
          >
            <Filter className="w-4 h-4 text-teal-600" />
          </button>
          <button 
            type="button" 
            onClick={() => alert('Exporting income statement logs...')}
            className="w-9 h-9 border border-slate-250 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 bg-white shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
          <Link 
            href="/institute/income/all-income/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Grid listing table (Screenshot 2) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
          
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4">Trans. ID</th>
                <th className="px-4 py-4 text-left">Income Type</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Payment Mode</th>
                <th className="px-4 py-4">Received Date</th>
                <th className="px-4 py-4">Received From</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Invoice</th>
                <th className="px-4 py-4 w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-slate-500 font-bold">{item.transId}</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-850 dark:text-slate-200">{item.incomeType}</td>
                  <td className="px-4 py-3.5 font-black text-slate-900 dark:text-white">{item.amount}</td>
                  <td className="px-4 py-3.5 text-slate-600 font-bold">{item.paymentMode}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-semibold">{item.receivedDate}</td>
                  <td className="px-4 py-3.5 text-slate-750 font-bold">{item.receivedFrom}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                      ● {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button 
                      onClick={() => alert(`Downloading payment receipt for ${item.incomeType}...`)}
                      className="p-1.5 rounded hover:bg-slate-100 text-teal-600 transition-colors border border-slate-200 bg-white"
                      title="Download Receipt"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => {
                          setSelectedIncome(item)
                          setDetailsModalOpen(true)
                        }}
                        className="w-6 h-6 rounded bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-100 border border-sky-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => alert('Editing existing income voucher...')}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                        title="Edit Details"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-bold">No operational earnings logged.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

      </div>

      {/* ================================== ADVANCED FILTER DIALOG OVERLAY (Screenshot 5) ================================== */}
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
                <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-bold" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">To</label>
                <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-bold" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">Payment Mode</label>
                <select value={filterPaymentMode} onChange={e => setFilterPaymentMode(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select an option</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="RTGS">RTGS</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">Income Category</label>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select an option</option>
                  <option value="Budget">Budget</option>
                  <option value="Refreshment">Refreshment</option>
                  <option value="School Bus">School Bus</option>
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
                <label className="text-slate-500">Income Parties</label>
                <select value={filterParties} onChange={e => setFilterParties(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select Income Parties</option>
                  <option value="Neeraj">Neeraj</option>
                  <option value="Sourabh">Sourabh</option>
                  <option value="Kamlesh">Kamlesh</option>
                </select>
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

      {/* ================================== VIEW DETAILS OVERLAY DIALOG ================================== */}
      {detailsModalOpen && selectedIncome && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black text-[#1b3a60] dark:text-slate-350 uppercase tracking-wider">Income Voucher details</span>
              <button 
                onClick={() => setDetailsModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-3 border-b pb-3">
                <span className="text-2xl">📈</span>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{selectedIncome.incomeType} Details</h4>
                  <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5">Trans. ID: {selectedIncome.transId}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[9px]">Receipt Amount</span><span className="font-extrabold">{selectedIncome.amount}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[9px]">Date Logged</span><span className="font-extrabold">{selectedIncome.receivedDate}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[9px]">Payment Mode</span><span className="font-extrabold">{selectedIncome.paymentMode}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[9px]">Received From Party</span><span className="font-extrabold">{selectedIncome.receivedFrom}</span></div>
                <div className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[9px]">Status Code</span>
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                    selectedIncome.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                  }`}>{selectedIncome.status}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setDetailsModalOpen(false)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST ALERT */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

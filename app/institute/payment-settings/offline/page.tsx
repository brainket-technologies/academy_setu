'use client'

import React, { useState, useEffect } from 'react'
import { Search, Pencil, Trash2, CheckCircle2, X, Landmark } from 'lucide-react'

interface OfflineRecord {
  id: number
  accountType: string
  receiverRole: string
  receiverName: string
  walletBalance: string
  receiveDate: string
}

const INITIAL_RECORDS: OfflineRecord[] = [
]

export default function OfflinePaymentSetupPage() {
  const [records, setRecords] = useState<OfflineRecord[]>(INITIAL_RECORDS)
  const [searchQuery, setSearchQuery] = useState('')

  // Toggle & select options
  const [acceptCash, setAcceptCash] = useState(true)
  const [receiverRole, setReceiverRole] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [feeType, setFeeType] = useState('')

  // Modal Dialogs
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<OfflineRecord | null>(null)

  // Withdraw fields
  const [withdrawDate, setWithdrawDate] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawDescription, setWithdrawDescription] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('offline_payments')
    if (saved) {
      try {
        setRecords(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('offline_payments', JSON.stringify(INITIAL_RECORDS))
    }
  }, [])

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault()

    if (!receiverRole || !receiverName || !feeType) {
      alert('Please fill in Receiver Role, Receiver, and Fee Type.')
      return
    }

    const newRecord: OfflineRecord = {
      id: Date.now(),
      accountType: receiverName === 'School Bank Account' ? 'School Bank Account' : 'Other Bank Account',
      receiverRole,
      receiverName,
      walletBalance: '0/-',
      receiveDate: new Date().toLocaleDateString('en-GB') + ' 11:00 AM'
    }

    const updated = [...records, newRecord]
    setRecords(updated)
    localStorage.setItem('offline_payments', JSON.stringify(updated))
    setToastMsg('Offline receiver configuration added!')
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)

    // Reset fields
    setReceiverRole('')
    setReceiverName('')
    setFeeType('')
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this receiver configuration?')) {
      const updated = records.filter(r => r.id !== id)
      setRecords(updated)
      localStorage.setItem('offline_payments', JSON.stringify(updated))
      setToastMsg('Configuration deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!withdrawDate || !withdrawAmount) {
      alert('Please fill in Date and Amount.')
      return
    }

    if (selectedRecord) {
      const currentBal = parseInt(selectedRecord.walletBalance.replace(/[^\d]/g, '')) || 0
      const subVal = parseInt(withdrawAmount) || 0
      if (subVal > currentBal) {
        alert('Insufficient wallet balance to withdraw.')
        return
      }

      const updated = records.map(r => {
        if (r.id === selectedRecord.id) {
          return {
            ...r,
            walletBalance: `${(currentBal - subVal).toLocaleString()}/-`
          }
        }
        return r
      })

      setRecords(updated)
      localStorage.setItem('offline_payments', JSON.stringify(updated))
      setToastMsg(`Successfully withdrew ${subVal.toLocaleString()}/-!`)
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }

    setWithdrawModalOpen(false)
    setWithdrawDate('')
    setWithdrawAmount('')
    setWithdrawDescription('')
  }

  const filtered = records.filter(r => 
    r.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.receiverRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.accountType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 font-extrabold">Offline Payment Setup</h1>
        <p className="text-xs text-slate-400">Configure desk collections and counter cash verifiers</p>
      </div>

      {/* Configuration Card Form (Screenshot 3) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Toggle Cash Switch */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 border rounded-2xl">
          <button 
            type="button" 
            onClick={() => setAcceptCash(!acceptCash)}
            className={`w-9 h-5 rounded-full relative transition-colors ${acceptCash ? 'bg-teal-600' : 'bg-slate-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${acceptCash ? 'left-4.5' : 'left-0.5'}`}></div>
          </button>
          <span className="text-xs font-black text-[#1b3a60]">Are You Accept Offline Cash Payment?</span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold text-slate-700">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Select Receiver Role *</label>
            <select value={receiverRole} onChange={e => setReceiverRole(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none">
              <option value="">Select an option</option>
              <option value="Employee">Employee</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Select Receiver *</label>
            <select value={receiverName} onChange={e => setReceiverName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none">
              <option value="">Select an option</option>
              <option value="School Bank Account">School Bank Account</option>
              <option value="Receiver 1">Receiver 1</option>
              <option value="Receiver 2">Receiver 2</option>
              <option value="Receiver 3">Receiver 3</option>
              <option value="Abhay Singh">Abhay Singh</option>
              <option value="Ashok Singh">Ashok Singh</option>
              <option value="Priya Kumari">Priya Kumari</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Select Fee Type *</label>
            <select value={feeType} onChange={e => setFeeType(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none">
              <option value="">Select an option</option>
              <option value="All Fee">All Fee</option>
              <option value="Class Fee">Class Fee</option>
              <option value="Library Fee">Library Fee</option>
            </select>
          </div>
        </div>

        {/* Form buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <button 
            type="button" 
            onClick={handleAddNew}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            + Add New
          </button>
          <button 
            type="button"
            onClick={() => alert('Offline collection parameters saved successfully!')}
            className="px-8 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
          >
            Confirm
          </button>
        </div>

      </div>

      {/* Offline Payment Ledger (Screenshot 3) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider text-[#1b3a60]">Offline Payment Data</h3>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Search by role name..."
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
                <th className="px-4 py-4 text-left">Account Type</th>
                <th className="px-4 py-4">Receiver Role</th>
                <th className="px-4 py-4 text-left">Receiver Name</th>
                <th className="px-4 py-4">Wallet Balance</th>
                <th className="px-4 py-4">Receive Date</th>
                <th className="px-4 py-4 w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-700">{item.accountType}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.receiverRole}</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-800">{item.receiverName}</td>
                  <td className="px-4 py-3.5 font-black text-teal-650">{item.walletBalance}</td>
                  <td className="px-4 py-3.5 text-slate-450 font-semibold">{item.receiveDate}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => alert('Editing receiver parameters...')}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                        title="Edit Log"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        title="Delete Configuration"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedRecord(item)
                          setWithdrawModalOpen(true)
                        }}
                        className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 border border-blue-100 transition-colors"
                        title="Withdraw Wallet Balance"
                      >
                        <Landmark className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">No offline collection configurations recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================== WITHDRAW DIALOG MODAL (Screenshot 5 Style) ================================== */}
      {withdrawModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 relative p-6 space-y-6">
            <button 
              onClick={() => setWithdrawModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-black text-[#1b3a60] border-b pb-2 uppercase tracking-wider">
              Withdraw — {selectedRecord.receiverName}
            </h3>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Date *</label>
                <input 
                  type="date" 
                  value={withdrawDate} 
                  onChange={e => setWithdrawDate(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-lg font-bold outline-none" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Amount *</label>
                <input 
                  type="number" 
                  placeholder="Enter Amount" 
                  value={withdrawAmount} 
                  onChange={e => setWithdrawAmount(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-lg font-bold outline-none" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Description</label>
                <textarea 
                  placeholder="Enter Description" 
                  value={withdrawDescription} 
                  onChange={e => setWithdrawDescription(e.target.value)} 
                  className="w-full px-4 py-2 border rounded-lg font-bold outline-none h-20 resize-none" 
                />
              </div>

              <div className="flex justify-center pt-2">
                <button 
                  type="submit"
                  className="px-8 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
                >
                  Amount Withdraw
                </button>
              </div>

            </form>
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

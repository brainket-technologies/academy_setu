'use client'

import React, { useState } from 'react'
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateLedgerEntryPage() {
  const router = useRouter()

  // Form states (Screenshot 2)
  const [amount, setAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState('')
  const [paymentAccount, setPaymentAccount] = useState('')
  const [creditBy, setCreditBy] = useState('')
  const [txnDate, setTxnDate] = useState('')
  const [txnId, setTxnId] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !paymentMode || !paymentAccount || !creditBy || !txnDate || !txnId) {
      alert('Please fill in all mandatory fields.')
      return
    }

    const payload = {
      id: Date.now(),
      referenceId: '123456',
      txnId,
      amount: `${parseInt(amount).toLocaleString()}/-`,
      txnType: creditBy === 'Expenses' ? 'DR' : 'CR',
      entryType: creditBy,
      paymentMode,
      date: new Date(txnDate).toLocaleDateString('en-GB') + ' 11:00 AM',
      bankName: paymentAccount === 'School Bank Account' ? 'abcd bank' : 'Other Bank',
      totalBankAmount: '300,000/-'
    }

    const saved = localStorage.getItem('school_ledgers')
    let currentLogs = []
    if (saved) {
      try {
        currentLogs = JSON.parse(saved)
      } catch (err) {
        console.error(err)
      }
    }
    const updated = [...currentLogs, payload]
    localStorage.setItem('school_ledgers', JSON.stringify(updated))

    // Also update bank transfers if payment mode is Bank Deposit/Bank Transfer
    if (paymentMode.toLowerCase().includes('bank')) {
      const savedTransfers = localStorage.getItem('bank_transfers')
      let currentTransfers = []
      if (savedTransfers) {
        try {
          currentTransfers = JSON.parse(savedTransfers)
        } catch (err) {
          console.error(err)
        }
      }
      const newTransfer = {
        id: Date.now(),
        txnId,
        amount: `${parseInt(amount).toLocaleString()}/-`,
        txnType: creditBy === 'Expenses' ? 'DR' : 'CR',
        mode: paymentMode,
        date: new Date(txnDate).toLocaleDateString('en-GB') + ' 11:00 AM'
      }
      localStorage.setItem('bank_transfers', JSON.stringify([...currentTransfers, newTransfer]))
    }

    setToastMsg('Ledger entry added successfully!')
    setToastOpen(true)
    setTimeout(() => {
      setToastOpen(false)
      router.push('/institute/ledger-day-book/ledger')
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/institute/ledger-day-book/ledger"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors bg-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 font-extrabold">Add Entry</h1>
            <p className="text-xs text-slate-400 font-medium font-bold">Log a double-entry transaction record</p>
          </div>
        </div>
      </div>

      {/* Main Card Form (Screenshot 2) */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 text-xs font-semibold text-slate-700">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Amount *</label>
            <input 
              type="number" 
              placeholder="Enter Amount" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" 
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Payment Mode *</label>
            <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
              <option value="">Select Mode</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="RTGS">RTGS</option>
              <option value="Bank Deposit">Bank Deposit</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Payment Account *</label>
            <select value={paymentAccount} onChange={e => setPaymentAccount(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
              <option value="">Select Account</option>
              <option value="School Bank Account">School Bank Account</option>
              <option value="Other Bank Account">Other Bank Account</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Credit By *</label>
            <select value={creditBy} onChange={e => setCreditBy(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
              <option value="">Select an Option</option>
              <option value="Fee">Fee</option>
              <option value="Expenses">Expenses</option>
              <option value="Income">Income</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Transaction Date *</label>
            <input 
              type="date" 
              value={txnDate} 
              onChange={e => setTxnDate(e.target.value)} 
              className="w-full px-4 py-2 border rounded-lg font-bold outline-none animate-none" 
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Transaction ID *</label>
            <input 
              type="text" 
              placeholder="Enter Transaction ID" 
              value={txnId} 
              onChange={e => setTxnId(e.target.value)} 
              className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none animate-none" 
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Image</label>
            <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden">
              <input type="text" placeholder="Attach a Photo" readOnly className="flex-1 px-4 py-2.5 outline-none font-semibold text-slate-400 bg-transparent text-xs" />
              <button type="button" className="p-2.5 border-l bg-slate-100 text-slate-500 hover:bg-slate-200"><Upload className="w-4 h-4" /></button>
            </div>
          </div>

        </div>

        <div className="flex justify-center pt-4">
          <button 
            type="submit" 
            className="px-10 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md"
          >
            Save
          </button>
        </div>

      </form>

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

'use client'

import React, { useState } from 'react'
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateIncomePage() {
  const router = useRouter()

  // Income details form states (Screenshot 1)
  const [incomeCategory, setIncomeCategory] = useState('')
  const [referenceNo, setReferenceNo] = useState('')
  const [receivedDate, setReceivedDate] = useState('')

  const [paymentMode, setPaymentMode] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [bankRefId, setBankRefId] = useState('')

  const [paymentAccount, setPaymentAccount] = useState('')
  const [receivedFrom, setReceivedFrom] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!incomeCategory || !referenceNo || !receivedDate || !paymentMode || !totalAmount || !paymentAccount || !receivedFrom) {
      alert('Please fill in all mandatory fields.')
      return
    }

    // Save record to local storage
    const newRecord = {
      id: Date.now(),
      transId: referenceNo,
      incomeType: incomeCategory,
      amount: `${parseInt(totalAmount).toLocaleString()}/-`,
      paymentMode,
      receivedDate: new Date(receivedDate).toLocaleDateString('en-GB'),
      receivedFrom,
      status: 'Paid'
    }

    const saved = localStorage.getItem('school_incomes')
    let currentLogs = []
    if (saved) {
      try {
        currentLogs = JSON.parse(saved)
      } catch (err) {
        console.error(err)
      }
    }
    const updated = [...currentLogs, newRecord]
    localStorage.setItem('school_incomes', JSON.stringify(updated))

    setToastMsg('Income record logged successfully!')
    setToastOpen(true)
    setTimeout(() => {
      setToastOpen(false)
      router.push('/institute/income/all-income')
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/institute/income/all-income"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors bg-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Add Income</h1>
            <p className="text-xs text-slate-400">Log a new school operational income voucher</p>
          </div>
        </div>
      </div>

      {/* Main Form container (Screenshot 1) */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-8 text-xs font-semibold text-slate-700">
        
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-800 border-b pb-2 uppercase tracking-wider text-[#1b3a60]">Income Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Row 1 (Screenshot 1) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Income Category *</label>
              <select value={incomeCategory} onChange={e => setIncomeCategory(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
                <option value="">Select a Type</option>
                <option value="Utilities">Utilities</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Transportation">Transportation</option>
                <option value="Sports">Sports</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Refreshment">Refreshment</option>
                <option value="School Bus">School Bus</option>
                <option value="Budget">Budget</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Transaction ID * (Reference No.)</label>
              <input type="text" placeholder="Enter Reference No." value={referenceNo} onChange={e => setReferenceNo(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Received Date *</label>
              <input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-bold outline-none" required />
            </div>

            {/* Row 2 (Screenshot 1) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Payment Mode *</label>
              <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
                <option value="">Select an Option</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="RTGS">RTGS</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Total Amount *</label>
              <input type="number" placeholder="Enter Amount" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Transaction ID</label>
              <input type="text" placeholder="Enter Transaction ID" value={bankRefId} onChange={e => setBankRefId(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>

            {/* Row 3 (Screenshot 1) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Payment Account *</label>
              <select value={paymentAccount} onChange={e => setPaymentAccount(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
                <option value="">Select an Option</option>
                <option value="Main Operating Account">Main Operating Account</option>
                <option value="Petty Cash Ledger">Petty Cash Ledger</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Received From</label>
              <select value={receivedFrom} onChange={e => setReceivedFrom(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
                <option value="">Select an Option</option>
                <option value="Neeraj">Neeraj</option>
                <option value="Sourabh">Sourabh</option>
                <option value="Kamlesh">Kamlesh</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Photo</label>
              <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden">
                <input type="text" placeholder="Upload a photo" readOnly className="flex-1 px-4 py-2.5 outline-none font-semibold text-slate-400 bg-transparent text-xs" />
                <button type="button" className="p-2.5 border-l bg-slate-100 text-slate-500 hover:bg-slate-200"><Upload className="w-4 h-4" /></button>
              </div>
            </div>

          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-center gap-4 pt-6 border-t">
          <Link 
            href="/institute/income/all-income"
            className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors text-center"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md"
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

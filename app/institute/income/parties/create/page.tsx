'use client'

import React, { useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateIncomePartyPage() {
  const router = useRouter()

  // Add Party Form states
  const [partyName, setPartyName] = useState('')
  const [mobileNo, setMobileNo] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [gstNo, setGstNo] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!partyName.trim() || !mobileNo.trim() || !contactPerson.trim()) {
      alert('Please fill in Party Name, Mobile No, and Contact Person.')
      return
    }

    const payload = {
      id: Date.now(),
      partyName,
      contactPerson,
      amount: '0/-',
      mobileNo,
      email: email || '-',
      gstNo: gstNo || '-',
      createdAt: new Date().toLocaleDateString('en-GB') + ' 11:00 AM'
    }

    const saved = localStorage.getItem('income_parties')
    let current = []
    if (saved) {
      try {
        current = JSON.parse(saved)
      } catch (err) {
        console.error(err)
      }
    }
    const updated = [...current, payload]
    localStorage.setItem('income_parties', JSON.stringify(updated))

    setToastMsg('Income party merchant added successfully!')
    setToastOpen(true)
    setTimeout(() => {
      setToastOpen(false)
      router.push('/institute/income/parties')
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/institute/income/parties"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors bg-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 font-extrabold">Add Party</h1>
            <p className="text-xs text-slate-400">Register a new client or payee account</p>
          </div>
        </div>
      </div>

      {/* Form Details Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 text-xs font-semibold text-slate-700">
        <h3 className="text-xs font-black text-slate-850 border-b pb-2 uppercase tracking-wider text-[#1b3a60]">Party Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Party Name *</label>
            <input 
              type="text" 
              placeholder="Enter a Name" 
              value={partyName} 
              onChange={e => setPartyName(e.target.value)} 
              className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" 
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Party Mobile No. *</label>
            <input 
              type="number" 
              placeholder="Enter Mobile No." 
              value={mobileNo} 
              onChange={e => setMobileNo(e.target.value)} 
              className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" 
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Contact Person Name *</label>
            <input 
              type="text" 
              placeholder="Enter a name" 
              value={contactPerson} 
              onChange={e => setContactPerson(e.target.value)} 
              className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" 
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Party Email</label>
            <input 
              type="email" 
              placeholder="Enter Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Address</label>
            <input 
              type="text" 
              placeholder="Enter Address" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">GST No.</label>
            <input 
              type="text" 
              placeholder="Enter GST No." 
              value={gstNo} 
              onChange={e => setGstNo(e.target.value)} 
              className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" 
            />
          </div>

        </div>

        <div className="flex justify-center pt-4">
          <button 
            type="submit" 
            className="px-10 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md"
          >
            Create
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

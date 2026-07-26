'use client'

import React, { useState } from 'react'
import { ArrowLeft, ShoppingCart, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewTemplatePage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [smsTemplate, setSmsTemplate] = useState('')
  const [check1, setCheck1] = useState(false)
  const [check2, setCheck2] = useState(false)
  const [check3, setCheck3] = useState(false)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !mobile || !email) {
      alert('Please fill in all mandatory fields.')
      return
    }

    setToastMsg('SMS template submitted for approval!')
    setToastOpen(true)
    setTimeout(() => {
      setToastOpen(false)
      router.push('/institute/sms')
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/institute/sms"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors bg-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">New Template</h1>
            <p className="text-xs text-slate-400">Register a new SMS template for approval</p>
          </div>
        </div>

        <button
          onClick={() => alert('Redirecting to SMS purchase portal...')}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Buy SMS
        </button>
      </div>

      {/* SMS Registration Form (Screenshot 1) */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 text-xs font-semibold text-slate-700">

        <h3 className="text-sm font-black text-[#1b3a60] border-b pb-3">SMS Registration Form</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Enter Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Mobile No. <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Enter Mobile No." value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Email ID <span className="text-red-500">*</span></label>
            <input type="email" placeholder="Enter Email Id" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" required />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-500 font-bold">School Name</label>
          <input type="text" placeholder="Enter School Name" value={schoolName} onChange={e => setSchoolName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-slate-500 font-bold">SMS Template</label>
          <textarea placeholder="Enter Details" value={smsTemplate} onChange={e => setSmsTemplate(e.target.value)} className="w-full px-4 py-3 border rounded-lg font-bold outline-none h-28 resize-none" />
        </div>

        <div className="space-y-2.5 text-xs text-slate-600">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={check1} onChange={e => setCheck1(e.target.checked)} className="accent-teal-600 w-4 h-4 rounded" />
            <span>I have read all rules and regulations from the given links.</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={check2} onChange={e => setCheck2(e.target.checked)} className="accent-teal-600 w-4 h-4 rounded" />
            <span>This template has maximum three dynamic values</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={check3} onChange={e => setCheck3(e.target.checked)} className="accent-teal-600 w-4 h-4 rounded" />
            <span>I agree if this template doesn't follow the rules, Ignore this template.</span>
          </label>
        </div>

        <div className="flex justify-center pt-4">
          <button type="submit" className="px-10 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md">
            Submit
          </button>
        </div>

      </form>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

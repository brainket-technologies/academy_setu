'use client'

import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function EmailSetupPage() {
  // Receiver Mail Configuration
  const [receiverName, setReceiverName] = useState('')
  const [receiverEmail, setReceiverEmail] = useState('')
  const [receiverCC, setReceiverCC] = useState('')
  const [receiverSubject, setReceiverSubject] = useState('')
  const [emailSignature, setEmailSignature] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur, sed do in culpa qui officia deseruat mollit.'
  )

  // Auto Reply Mail Configuration
  const [replyToEmail, setReplyToEmail] = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [replyCC, setReplyCC] = useState('')
  const [replyReceiverSubject, setReplyReceiverSubject] = useState('')
  const [replyBody, setReplyBody] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur, sed do in culpa qui officia deseruat mollit.'
  )

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setToastMsg('Email configuration saved successfully!')
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Simple toolbar for the rich text area
  const Toolbar = () => (
    <div className="flex items-center gap-0.5 border-b border-slate-200 px-3 py-1.5 bg-slate-50 rounded-t-lg overflow-x-auto">
      {['Normal', 'Font', 'Size'].map(btn => (
        <select key={btn} className="text-[10px] font-bold px-1.5 py-1 border rounded bg-white text-slate-600 outline-none cursor-pointer">
          <option>{btn}</option>
        </select>
      ))}
      {['B', 'I', 'U', 'S', '🔗', '📋', '≡', '⊞'].map((btn, i) => (
        <button key={i} type="button" className="w-6 h-6 flex items-center justify-center text-[10px] font-black text-slate-500 hover:bg-slate-200 rounded transition-colors">{btn}</button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Email</h1>
        <p className="text-xs text-slate-400">Configure email sender, receiver, and auto-reply settings</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-8 text-xs font-semibold text-slate-700">

        {/* Receiver Mail Configuration */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Receiver Mail Configuration</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Receiver Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter Receiver Name" value={receiverName} onChange={e => setReceiverName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Receiver Email <span className="text-red-500">*</span></label>
              <input type="email" placeholder="Enter Receiver Email" value={receiverEmail} onChange={e => setReceiverEmail(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Receiver Email CC</label>
              <input type="text" placeholder="Enter Receiver Email CC" value={receiverCC} onChange={e => setReceiverCC(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Receiver Email Subject</label>
              <input type="text" placeholder="Enter Receiver Email Subject" value={receiverSubject} onChange={e => setReceiverSubject(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Email Signature <span className="text-slate-400 text-[10px] font-normal">(This will be added in the bottom of email body)</span></label>
            <div className="border rounded-lg overflow-hidden">
              <Toolbar />
              <textarea
                value={emailSignature}
                onChange={e => setEmailSignature(e.target.value)}
                className="w-full px-4 py-3 font-semibold outline-none h-24 resize-none text-slate-600 leading-relaxed"
              />
            </div>
          </div>
        </fieldset>

        {/* Auto Reply Mail Configuration */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Auto Reply Mail Configuration</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Reply To Email <span className="text-slate-400 text-[10px] font-normal">(If you want to use alternative email for reply)</span></label>
              <input type="email" placeholder="Enter Reply Email" value={replyToEmail} onChange={e => setReplyToEmail(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Reply Email Subject</label>
              <input type="text" placeholder="Enter Reply Email Subject" value={replySubject} onChange={e => setReplySubject(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Receiver Email CC</label>
              <input type="text" placeholder="Enter Receiver Email CC" value={replyCC} onChange={e => setReplyCC(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Receiver Email Subject</label>
              <input type="text" placeholder="Enter Receiver Email Subject" value={replyReceiverSubject} onChange={e => setReplyReceiverSubject(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Reply Email Body <span className="text-slate-400 text-[10px] font-normal">(Email body which automatically send to Customer)</span></label>
            <div className="border rounded-lg overflow-hidden">
              <Toolbar />
              <textarea
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
                className="w-full px-4 py-3 font-semibold outline-none h-24 resize-none text-slate-600 leading-relaxed"
              />
            </div>
          </div>
        </fieldset>

        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <button type="submit" className="px-10 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md">
            Save
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

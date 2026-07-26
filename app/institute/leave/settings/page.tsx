'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LeaveSettingsPage() {
  const [session, setSession] = useState('Select Session')

  // Leave Approval
  const [autoApproval, setAutoApproval] = useState(false)
  const [zeroBalance, setZeroBalance] = useState(false)

  // Past date selection
  const [pastDate, setPastDate] = useState(false)

  // Delete Leave
  const [deleteApproved, setDeleteApproved] = useState(false)
  const [deleteRejected, setDeleteRejected] = useState(false)

  // Send App Notifications
  const [appNotifications, setAppNotifications] = useState(false)

  // Send SMS Notifications
  const [smsApproval, setSmsApproval] = useState(false)
  const [smsRejection, setSmsRejection] = useState(false)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setToastMsg('Leave configurations saved successfully!')
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/institute/leave/request"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Leave Settings</h1>
            <p className="text-xs text-slate-400">Configure global parameters and moderator alerts</p>
          </div>
        </div>

        <select 
          value={session} 
          onChange={e => setSession(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-xs outline-none bg-white font-bold w-48 shadow-sm"
        >
          <option>Select Session</option>
          <option value="2025-2026">2025-2026</option>
        </select>
      </div>

      {/* Main Settings Card (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm max-w-4xl">
        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs text-slate-700 font-semibold select-none">
          
          {/* Section 1: Leave Approval */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Leave Approval</h3>
            <div className="flex flex-col gap-2.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-655">
                <input type="checkbox" checked={autoApproval} onChange={e => setAutoApproval(e.target.checked)} className="w-4 h-4 rounded text-teal-600" />
                Enable Automatic Leave Approval?
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-655">
                <input type="checkbox" checked={zeroBalance} onChange={e => setZeroBalance(e.target.checked)} className="w-4 h-4 rounded text-teal-600" />
                Allow Leave Requests with Zero Leave Balance?
              </label>
            </div>
          </div>

          {/* Section 2: Past date selection */}
          <div className="space-y-3 pt-3">
            <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Past date selection</h3>
            <div className="flex flex-col gap-2.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-655">
                <input type="checkbox" checked={pastDate} onChange={e => setPastDate(e.target.checked)} className="w-4 h-4 rounded text-teal-600" />
                Allow Past Date Selection for Leave Applications?
              </label>
            </div>
          </div>

          {/* Section 3: Delete Leave */}
          <div className="space-y-3 pt-3">
            <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Delete Leave</h3>
            <div className="flex flex-col gap-2.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-655">
                <input type="checkbox" checked={deleteApproved} onChange={e => setDeleteApproved(e.target.checked)} className="w-4 h-4 rounded text-teal-600" />
                Allow Leave Deletion After Approval?
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-655">
                <input type="checkbox" checked={deleteRejected} onChange={e => setDeleteRejected(e.target.checked)} className="w-4 h-4 rounded text-teal-600" />
                Allow Leave Deletion After Rejection?
              </label>
            </div>
          </div>

          {/* Section 4: Send App Notifications */}
          <div className="space-y-3 pt-3">
            <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Send App Notifications</h3>
            <div className="flex flex-col gap-2.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-655">
                <input type="checkbox" checked={appNotifications} onChange={e => setAppNotifications(e.target.checked)} className="w-4 h-4 rounded text-teal-600" />
                Send Leave Approval/Rejection Notifications via Mobile App?
              </label>
            </div>
          </div>

          {/* Section 5: Send SMS Notifications */}
          <div className="space-y-3 pt-3">
            <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2">Send SMS Notifications</h3>
            <div className="flex flex-col gap-2.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-655">
                <input type="checkbox" checked={smsApproval} onChange={e => setSmsApproval(e.target.checked)} className="w-4 h-4 rounded text-teal-600" />
                Send Leave Approval SMS to Mobile?
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-655">
                <input type="checkbox" checked={smsRejection} onChange={e => setSmsRejection(e.target.checked)} className="w-4 h-4 rounded text-teal-600" />
                Send Leave Rejection SMS to Mobile?
              </label>
            </div>
          </div>

          <div className="flex justify-center pt-6 border-t border-slate-100">
            <button 
              type="submit"
              className="px-10 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-md transition-colors"
            >
              Save
            </button>
          </div>

        </form>
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

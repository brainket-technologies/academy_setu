'use client'

import React, { useState } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'

export default function ExpensesSettingsPage() {
  const [pettyCashLimit, setPettyCashLimit] = useState('5000')
  const [requireAttachment, setRequireAttachment] = useState(true)
  const [notifyAdmins, setNotifyAdmins] = useState(false)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setToastMsg('Expenses configurations saved successfully!')
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Expenses Settings</h1>
        <p className="text-xs text-slate-400">Configure global parameters and moderator alerts</p>
      </div>

      {/* Settings Form */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm max-w-xl">
        <form onSubmit={handleSave} className="space-y-6 text-xs font-semibold text-slate-700">
          
          <div>
            <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2 mb-4">Petty Cash Settings</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Max Petty Cash Limit (Per Voucher)</label>
              <input 
                type="number" 
                value={pettyCashLimit} 
                onChange={e => setPettyCashLimit(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider border-b pb-2 mb-4">Verification Policies</h3>
            
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-2xl mb-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-800">Require Attachment</span>
                <span className="text-[10px] text-slate-400">Mandate receipt uploads for expenses above 1,000/-.</span>
              </div>
              <button 
                type="button" 
                onClick={() => setRequireAttachment(!requireAttachment)}
                className={`w-9 h-5 rounded-full relative transition-colors ${requireAttachment ? 'bg-teal-650' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${requireAttachment ? 'left-4.5' : 'left-0.5'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-2xl">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-800">Notify Administrators</span>
                <span className="text-[10px] text-slate-400">Receive system-wide alerts for new capital expenditures.</span>
              </div>
              <button 
                type="button" 
                onClick={() => setNotifyAdmins(!notifyAdmins)}
                className={`w-9 h-5 rounded-full relative transition-colors ${notifyAdmins ? 'bg-teal-655' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${notifyAdmins ? 'left-4.5' : 'left-0.5'}`}></div>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button 
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Settings
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

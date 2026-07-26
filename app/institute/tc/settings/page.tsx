'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, ArrowLeft, CheckCircle2, Save } from 'lucide-react'
import Link from 'next/link'

interface TCStatus {
  id: number
  name: string
  isEnabled: boolean
}

const DEFAULT_STATUSES: TCStatus[] = [
  { id: 1, name: 'Passed Out', isEnabled: true },
  { id: 2, name: 'Suspended', isEnabled: true },
  { id: 3, name: 'Dropped Out', isEnabled: true },
]

export default function TCSettingsPage() {
  const [statuses, setStatuses] = useState<TCStatus[]>(DEFAULT_STATUSES)
  const [newStatus, setNewStatus] = useState('')
  const [schoolAffiliation, setSchoolAffiliation] = useState('Central Board of Secondary Education')
  const [schoolCode, setSchoolCode] = useState('0012')
  
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('tc_statuses')
    if (saved) {
      try {
        setStatuses(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStatus.trim()) return

    const payload: TCStatus = {
      id: Date.now(),
      name: newStatus.trim(),
      isEnabled: true
    }

    const updated = [...statuses, payload]
    setStatuses(updated)
    localStorage.setItem('tc_statuses', JSON.stringify(updated))
    setNewStatus('')
    
    setToastMsg('Status category added successfully!')
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleToggleStatus = (id: number) => {
    const updated = statuses.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s)
    setStatuses(updated)
    localStorage.setItem('tc_statuses', JSON.stringify(updated))
  }

  const handleDeleteStatus = (id: number) => {
    if (confirm('Are you sure you want to delete this status setting?')) {
      const updated = statuses.filter(s => s.id !== id)
      setStatuses(updated)
      localStorage.setItem('tc_statuses', JSON.stringify(updated))
      setToastMsg('Status category deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const handleSaveSettings = () => {
    setToastMsg('TC settings saved successfully!')
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/institute/tc"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">TC Settings</h1>
            <p className="text-xs text-slate-400">Configure Transfer Certificate categories and print parameters</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status manager (Screenshot 4) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">TC Status Trigger Options</h2>
            <p className="text-xs text-slate-400">Configure student exit statuses that support Transfer Certificates</p>
          </div>

          {/* Form */}
          <form onSubmit={handleAddStatus} className="flex gap-3">
            <input 
              type="text" 
              placeholder="e.g. Completed Course"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              Add Option
            </button>
          </form>

          {/* List */}
          <div className="space-y-3 pt-2">
            {statuses.map(item => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => handleToggleStatus(item.id)}
                    className={`w-9 h-5 rounded-full relative transition-colors ${item.isEnabled ? 'bg-teal-600' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${item.isEnabled ? 'left-4.5' : 'left-0.5'}`}></div>
                  </button>
                  <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{item.name}</span>
                </div>

                <button 
                  type="button"
                  onClick={() => handleDeleteStatus(item.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Certificate parameters info */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">Template Affiliation Details</h2>
            <p className="text-xs text-slate-400">Specify school accreditation properties printed on leaving slips</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Board Affiliation Text</label>
              <input 
                type="text" 
                value={schoolAffiliation}
                onChange={e => setSchoolAffiliation(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">School Code</label>
              <input 
                type="text" 
                value={schoolCode}
                onChange={e => setSchoolCode(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={handleSaveSettings}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>

        </div>

      </div>

      {/* TOAST */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

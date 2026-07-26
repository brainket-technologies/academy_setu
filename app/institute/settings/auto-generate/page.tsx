'use client'

import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface AutoGenField {
  enabled: boolean
  prefix: string
  startFrom: string
}

export default function AutoGenerateSettingsPage() {
  const [regNo, setRegNo] = useState<AutoGenField>({ enabled: true, prefix: 'REG-2026/', startFrom: '0001' })
  const [admNo, setAdmNo] = useState<AutoGenField>({ enabled: true, prefix: 'ADM-2026/', startFrom: '0001' })
  const [certNo, setCertNo] = useState<AutoGenField>({ enabled: true, prefix: 'CERT-2026/', startFrom: '0001' })
  const [marksheetNo, setMarksheetNo] = useState<AutoGenField>({ enabled: true, prefix: 'MARK-2026/', startFrom: '0001' })
  const [srNo, setSrNo] = useState<AutoGenField>({ enabled: false, prefix: 'SR-2026/', startFrom: '0001' })

  const [toastOpen, setToastOpen] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2000)
  }

  const renderSection = (title: string, state: AutoGenField, setState: React.Dispatch<React.SetStateAction<AutoGenField>>) => {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-black text-slate-800">{title}</span>
          <button
            type="button"
            onClick={() => setState({ ...state, enabled: !state.enabled })}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${state.enabled ? 'bg-teal-505 bg-teal-600' : 'bg-slate-250 bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${state.enabled ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        {state.enabled && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold text-[10px]">Prefix (Example 2024/)</label>
              <input
                type="text"
                value={state.prefix}
                onChange={e => setState({ ...state, prefix: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white outline-none font-bold text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold text-[10px]">Start From (Example 01)</label>
              <input
                type="text"
                value={state.startFrom}
                onChange={e => setState({ ...state, startFrom: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white outline-none font-bold text-xs"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Auto Generate</h1>
      </div>

      <div className="bg-white border rounded-3xl p-8 shadow-sm text-xs font-semibold text-slate-700">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSection('Auto-Generate Registration No.', regNo, setRegNo)}
            {renderSection('Auto-Generate Admission No.', admNo, setAdmNo)}
            {renderSection('Auto-Generate Certificate No.', certNo, setCertNo)}
            {renderSection('Auto-Generate Marksheet No.', marksheetNo, setMarksheetNo)}
            {renderSection('Auto-Generate SR No.', srNo, setSrNo)}
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">Auto Generate settings updated successfully!</span>
        </div>
      )}
    </div>
  )
}

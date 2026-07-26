'use client'

import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface ToggleRowProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-teal-500' : 'bg-slate-300'}`}
      >
        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200" style={{ left: checked ? '22px' : '2px' }} />
      </button>
    </div>
  )
}

export default function GatePassSettingsPage() {
  const [copyFrom, setCopyFrom] = useState('')
  const [numCopies, setNumCopies] = useState(1)

  // Signature toggles
  const [showAuthorityStudent, setShowAuthorityStudent] = useState(true)
  const [showAuthorityVisitor, setShowAuthorityVisitor] = useState(true)
  const [showVisitorSign, setShowVisitorSign] = useState(true)

  // Gatepass Header toggles
  const [showLogo, setShowLogo] = useState(true)
  const [showName, setShowName] = useState(true)
  const [showTagline, setShowTagline] = useState(true)
  const [showAddress, setShowAddress] = useState(true)
  const [showAffiliationCode, setShowAffiliationCode] = useState(true)
  const [showAffiliatedTo, setShowAffiliatedTo] = useState(true)
  const [showSchoolCode, setShowSchoolCode] = useState(true)
  const [showWatermark, setShowWatermark] = useState(true)
  const [showPhone, setShowPhone] = useState(true)
  const [showEmail, setShowEmail] = useState(true)
  const [showUDISE, setShowUDISE] = useState(true)

  // Labels
  const [studentSignLabel, setStudentSignLabel] = useState('')
  const [visitorSignLabel, setVisitorSignLabel] = useState('')
  const [authoritySignLabel, setAuthoritySignLabel] = useState('')
  const [noteInstruction, setNoteInstruction] = useState('')

  const [toastOpen, setToastOpen] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Gate Pass Settings</h1>
        <p className="text-xs text-slate-400">Configure gate pass print layout and display options</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-8 text-xs font-semibold text-slate-700">

        {/* Copy Settings + Number of Copies */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Copy settings from:</label>
            <p className="text-[10px] text-slate-400">(Once you have copied the setting and do it again, it will overwrite.)</p>
            <select value={copyFrom} onChange={e => setCopyFrom(e.target.value)} className="px-4 py-2.5 border rounded-lg font-bold outline-none bg-white min-w-[200px]">
              <option value="">Select Session</option>
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <label className="text-slate-500 font-bold">No. of copies you want to generate</label>
            <input type="number" min={1} max={10} value={numCopies} onChange={e => setNumCopies(parseInt(e.target.value) || 1)} className="w-16 px-3 py-2.5 border rounded-lg font-bold outline-none text-center" />
          </div>
        </div>

        {/* Signature */}
        <fieldset className="border border-slate-200 rounded-2xl p-6">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Signature</legend>
          <ToggleRow label="Do you want to show authority/principal sign on student gatepass?" checked={showAuthorityStudent} onChange={setShowAuthorityStudent} />
          <ToggleRow label="Do you want to show Authority/principal sign on visitor gatepass?" checked={showAuthorityVisitor} onChange={setShowAuthorityVisitor} />
          <ToggleRow label="Do you want to show Visitor's sign on visitor gatepass?" checked={showVisitorSign} onChange={setShowVisitorSign} />
        </fieldset>

        {/* Gatepass Header */}
        <fieldset className="border border-slate-200 rounded-2xl p-6">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Gatepass Header</legend>
          <ToggleRow label="Do you want to show school Logo?" checked={showLogo} onChange={setShowLogo} />
          <ToggleRow label="Do you want to show school Name?" checked={showName} onChange={setShowName} />
          <ToggleRow label="Do you want to show school Tagline?" checked={showTagline} onChange={setShowTagline} />
          <ToggleRow label="Do you want to show school Address?" checked={showAddress} onChange={setShowAddress} />
          <ToggleRow label="Do you want to show school Affiliation Code?" checked={showAffiliationCode} onChange={setShowAffiliationCode} />
          <ToggleRow label="Do you want to show school Affiliated To?" checked={showAffiliatedTo} onChange={setShowAffiliatedTo} />
          <ToggleRow label="Do you want to show school Code?" checked={showSchoolCode} onChange={setShowSchoolCode} />
          <ToggleRow label="Do you want to show school Watermark?" checked={showWatermark} onChange={setShowWatermark} />
          <ToggleRow label="Do you want to show school Phone No.?" checked={showPhone} onChange={setShowPhone} />
          <ToggleRow label="Do you want to show school Email?" checked={showEmail} onChange={setShowEmail} />
          <ToggleRow label="Do you want to show school UDISE Code?" checked={showUDISE} onChange={setShowUDISE} />
        </fieldset>

        {/* For Students */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">For Students</legend>
          <div className="flex flex-col gap-1.5 max-w-xs">
            <label className="text-slate-500 font-bold">Authority/Principal Sign Label</label>
            <input type="text" placeholder="Enter Label Name" value={studentSignLabel} onChange={e => setStudentSignLabel(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
          </div>
        </fieldset>

        {/* For Visitors */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">For Visitors</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Visitors Sign Label</label>
              <input type="text" placeholder="Enter Label Name" value={visitorSignLabel} onChange={e => setVisitorSignLabel(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Authority Sign Label <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter Label Name" value={authoritySignLabel} onChange={e => setAuthoritySignLabel(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
          </div>
        </fieldset>

        {/* Note & Instruction */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Note & Instruction</legend>
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Write a note/instruction to show in the bottom of gatepass.</label>
            <textarea placeholder="Enter Note/Instruction" value={noteInstruction} onChange={e => setNoteInstruction(e.target.value)} className="w-full px-4 py-3 border rounded-lg font-bold outline-none h-28 resize-none" />
          </div>
        </fieldset>

        {/* Footer */}
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/institute/gate-pass" className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors text-center">Cancel</Link>
          <button type="submit" className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md">Save</button>
        </div>

      </form>

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">Gate pass settings saved!</span>
        </div>
      )}

    </div>
  )
}

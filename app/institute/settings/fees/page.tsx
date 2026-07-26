'use client'

import React, { useState } from 'react'
import { CheckCircle2, Upload, X } from 'lucide-react'

export default function FeesSettingsPage() {
  const [months, setMonths] = useState<string[]>(['Jan', 'Feb', 'Mar', 'Apr'])
  const [receiptLabel, setReceiptLabel] = useState('EC Fee Receipt 2025')
  const [receiptPrefix, setReceiptPrefix] = useState('EC SCH/')
  const [startNo, setStartNo] = useState('10013')

  // Late fees
  const [applyLateFees, setApplyLateFees] = useState(true)
  const [applyFineOnDay, setApplyFineOnDay] = useState(true)

  // Selected receipt fields (Chips)
  const [receiptFields, setReceiptFields] = useState<string[]>([
    'Session', 'Receipt No.', 'Payment Mode', 'Name', 'Class', 'Section'
  ])

  // QR Code
  const [uploadedQr, setUploadedQr] = useState<string>('payment_qr.png')
  const [printQrOnDemand, setPrintQrOnDemand] = useState(true)
  const [printQrOnReceipt, setPrintQrOnReceipt] = useState(true)

  // Migration
  const [migrateDueFees, setMigrateDueFees] = useState(true)
  const [lowFeesNotice, setLowFeesNotice] = useState(true)
  const [noticePercentage, setNoticePercentage] = useState('75')

  const [toastOpen, setToastOpen] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2000)
  }

  const allAvailableMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const handleToggleMonth = (m: string) => {
    if (months.includes(m)) {
      setMonths(months.filter(x => x !== m))
    } else {
      setMonths([...months, m])
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        <h1 className="text-xl font-black text-slate-800">Fees</h1>
      </div>

      <div className="bg-white border rounded-3xl p-8 shadow-sm text-xs font-semibold text-slate-700">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Months selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-500 font-bold">Months <span className="text-slate-400 font-normal">(Select Multiple Months)</span></label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-500">
                <input
                  type="checkbox"
                  checked={months.length === allAvailableMonths.length}
                  onChange={() => setMonths(months.length === allAvailableMonths.length ? [] : allAvailableMonths)}
                  className="accent-teal-600 w-3.5 h-3.5"
                />
                <span>Select All</span>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2 border p-3 rounded-lg bg-slate-50">
              {allAvailableMonths.map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => handleToggleMonth(m)}
                  className={`px-3 py-1.5 rounded-lg border font-bold transition-all text-[10px] ${months.includes(m) ? 'bg-teal-50 text-teal-600 border-teal-200' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Fees Receipt Label</label>
              <input
                type="text"
                value={receiptLabel}
                onChange={e => setReceiptLabel(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Fees Receipt Prefix</label>
              <input
                type="text"
                value={receiptPrefix}
                onChange={e => setReceiptPrefix(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Start Receipt No. From</label>
              <input
                type="text"
                value={startNo}
                onChange={e => setStartNo(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg outline-none font-bold"
              />
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">Last updated on 15 Jan, 2026 12:59:16pm</span>
            </div>
          </div>

          {/* Late Fees Fine Section */}
          <fieldset className="border-t border-slate-200 pt-4 space-y-4">
            <legend className="text-xs font-black text-[#1b3a60] pr-3">Late Fees Fine</legend>
            <div className="flex items-center justify-between py-1.5">
              <span>Do you want to show & apply Late Fees Fine in fees modules?</span>
              <button
                type="button"
                onClick={() => setApplyLateFees(!applyLateFees)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${applyLateFees ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${applyLateFees ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span>Do you want to apply fine on the Fees Submission Day also?</span>
              <button
                type="button"
                onClick={() => setApplyFineOnDay(!applyFineOnDay)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${applyFineOnDay ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${applyFineOnDay ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          </fieldset>

          {/* Fee Receipt Details Field Section */}
          <fieldset className="border-t border-slate-200 pt-4 space-y-3">
            <legend className="text-xs font-black text-[#1b3a60] pr-3">Fee Receipt Details Field</legend>
            <label className="text-slate-500 font-bold">Select Receipt Fields <span className="text-slate-400 font-normal">(Select fields to show on fee receipt. Move it blank to show everything on fee receipt Default.)</span></label>
            <div className="flex flex-wrap items-center gap-2 border p-3 rounded-lg bg-slate-50 min-h-12">
              {['Session', 'Receipt No.', 'Payment Mode', 'Name', 'Class', 'Section'].map(field => (
                <span
                  key={field}
                  onClick={() => setReceiptFields(receiptFields.includes(field) ? receiptFields.filter(f => f !== field) : [...receiptFields, field])}
                  className={`px-3 py-1 rounded-full border text-[10px] font-black cursor-pointer transition-all ${receiptFields.includes(field) ? 'bg-teal-50 text-teal-600 border-teal-200' : 'bg-white text-slate-400 border-slate-200'}`}
                >
                  {field}
                </span>
              ))}
            </div>
          </fieldset>

          {/* Payment QR Code Section */}
          <fieldset className="border-t border-slate-200 pt-4 space-y-4">
            <legend className="text-xs font-black text-[#1b3a60] pr-3">Payment QR Code</legend>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-505 font-bold">Upload QR Code</label>
              <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 text-center flex flex-col items-center justify-center gap-2 max-w-sm relative">
                {uploadedQr ? (
                  <div className="space-y-2">
                    <div className="w-20 h-20 bg-slate-200 border rounded mx-auto flex items-center justify-center text-[10px]">QR Code</div>
                    <p className="text-[10px] font-bold text-slate-700">{uploadedQr}</p>
                    <button type="button" onClick={() => setUploadedQr('')} className="absolute top-2 right-2 text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400" />
                    <span className="text-[10px]">Click to Upload or Drag & Drop</span>
                    <span className="text-[9px] text-slate-400 font-normal">(Max size: 180 x 180 px)</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span>Do you want to Print QR on Demand Bill?</span>
              <button
                type="button"
                onClick={() => setPrintQrOnDemand(!printQrOnDemand)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${printQrOnDemand ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${printQrOnDemand ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span>Do you want to Print QR on Fees Receipt?</span>
              <button
                type="button"
                onClick={() => setPrintQrOnReceipt(!printQrOnReceipt)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${printQrOnReceipt ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${printQrOnReceipt ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          </fieldset>

          {/* Migrated Fees Update/Collect Section */}
          <fieldset className="border-t border-slate-200 pt-4 space-y-4">
            <legend className="text-xs font-black text-[#1b3a60] pr-3">Migrated Fees Update/Collect</legend>
            <div className="flex items-start justify-between gap-6 py-1.5">
              <span className="leading-relaxed text-[11px]">If you Migrate/Promote the student to a New Session, you can move Due Fees along with migration. Enable this option so that the due fees could be collected from migrated session only and no one could make any change to collected fees or fees structure of old session.</span>
              <button
                type="button"
                onClick={() => setMigrateDueFees(!migrateDueFees)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${migrateDueFees ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${migrateDueFees ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span>Enable low fees payment notice on dashboard</span>
              <button
                type="button"
                onClick={() => setLowFeesNotice(!lowFeesNotice)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${lowFeesNotice ? 'bg-teal-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${lowFeesNotice ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>

            {lowFeesNotice && (
              <div className="flex flex-col gap-1.5 max-w-sm animate-in fade-in duration-200">
                <label className="text-slate-500 font-bold">Below this percentage, notice will be shown on dashboard</label>
                <input
                  type="text"
                  value={noticePercentage}
                  onChange={e => setNoticePercentage(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none font-bold"
                />
              </div>
            )}
          </fieldset>

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
          <span className="text-xs font-bold">Fees Settings updated successfully!</span>
        </div>
      )}
    </div>
  )
}

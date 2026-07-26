'use client'

import React, { useState } from 'react'
import { ArrowLeft, Camera, Upload, X, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PermanentRegistrationPage() {
  const router = useRouter()

  // Create For
  const [selectUser] = useState('Student Relative')

  // Student Details
  const [studentName, setStudentName] = useState('')
  const [studentClass] = useState('Class VII')
  const [rollNo] = useState('045')

  // Receiver Details
  const [parentMobile, setParentMobile] = useState('9999999999')
  const [otp, setOtp] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [receiverMobile, setReceiverMobile] = useState('')
  const [relation, setRelation] = useState('')
  const [aadharNo, setAadharNo] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!receiverName || !relation || !aadharNo) {
      alert('Please fill in all mandatory fields.')
      return
    }
    setToastMsg('Permanent registration saved successfully!')
    setToastOpen(true)
    setTimeout(() => {
      setToastOpen(false)
      router.push('/institute/gate-pass')
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/institute/gate-pass" className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 bg-white shadow-sm"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl font-black text-slate-800">Permanent Registration</h1>
            <p className="text-xs text-slate-400">Register a permanent visitor for gate pass access</p>
          </div>
        </div>
        <button onClick={() => router.push('/institute/gate-pass')} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-8 text-xs font-semibold text-slate-700">

        {/* Create For */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Create For</legend>
          <div className="flex flex-col gap-1.5 max-w-xs">
            <label className="text-slate-500 font-bold">Select User</label>
            <div className="px-4 py-2.5 bg-teal-600 text-white rounded-lg font-bold">{selectUser}</div>
          </div>
        </fieldset>

        {/* Student Details */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Student Details</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Student Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Search student by name, ID" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Class</label>
              <div className="px-4 py-2.5 bg-slate-100 rounded-lg font-bold text-slate-500">{studentClass}</div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Roll No.</label>
              <div className="px-4 py-2.5 bg-slate-100 rounded-lg font-bold text-slate-500">{rollNo}</div>
            </div>
          </div>
        </fieldset>

        {/* Receiver Details */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Receiver Details</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Parent&apos;s Mobile No.</label>
              <div className="flex items-center gap-2">
                <input type="text" value={parentMobile} onChange={e => setParentMobile(e.target.value)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg font-bold outline-none" />
                <button type="button" className="px-3 py-2.5 bg-teal-600 text-white rounded-lg font-bold text-[10px] hover:bg-teal-700">Send OTP</button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">OTP <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} className="flex-1 px-4 py-2.5 border rounded-lg font-bold outline-none" />
                <button type="button" className="px-3 py-2.5 bg-teal-600 text-white rounded-lg font-bold text-[10px] hover:bg-teal-700">Verify</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Receiver Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter Name" value={receiverName} onChange={e => setReceiverName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Receiver Mobile No. <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter Receiver Mob. No." value={receiverMobile} onChange={e => setReceiverMobile(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Relation with Receiver <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter Relation" value={relation} onChange={e => setRelation(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Aadhar Card No. <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter Aadhar Card No." value={aadharNo} onChange={e => setAadharNo(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-36 h-36 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-teal-500" />
              </div>
              <button type="button" className="px-6 py-2 border border-teal-500 text-teal-600 rounded-xl font-bold hover:bg-teal-50 transition-colors text-xs">Upload Photo</button>
            </div>
          </div>

          {/* Aadhar Card Photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Aadhar Card Front Photo</label>
              <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden">
                <input type="text" placeholder="Upload Aadhar Card Photo" readOnly className="flex-1 px-4 py-2.5 outline-none font-semibold text-slate-400 bg-transparent text-xs" />
                <div className="p-2.5 border-l bg-slate-100 text-teal-500 cursor-pointer"><Upload className="w-4 h-4" /></div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Aadhar Card Back Photo</label>
              <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden">
                <input type="text" placeholder="Upload Aadhar Card Photo" readOnly className="flex-1 px-4 py-2.5 outline-none font-semibold text-slate-400 bg-transparent text-xs" />
                <div className="p-2.5 border-l bg-slate-100 text-teal-500 cursor-pointer"><Upload className="w-4 h-4" /></div>
              </div>
            </div>
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
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

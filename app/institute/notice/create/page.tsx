'use client'

import React, { useState } from 'react'
import { ArrowLeft, Upload, Clock, CheckCircle2, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateNoticePage() {
  const router = useRouter()

  // Notice Information
  const [subjectTitle, setSubjectTitle] = useState('')
  const [message, setMessage] = useState('')

  // Schedule the Notice
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  // Send Notice To checkboxes
  const [everyone, setEveryone] = useState(false)
  const [allStudents, setAllStudents] = useState(false)
  const [allTeachers, setAllTeachers] = useState(false)
  const [allParents, setAllParents] = useState(false)
  const [selectedClasses, setSelectedClasses] = useState(false)
  const [selectedTeachers, setSelectedTeachers] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState(false)
  const [selectedParents, setSelectedParents] = useState(false)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectTitle || !message) {
      alert('Please fill in Subject/Title and Message.')
      return
    }

    // Count recipients
    let recipientCount = 0
    if (everyone) recipientCount = 204
    else {
      if (allStudents) recipientCount += 100
      if (allTeachers) recipientCount += 50
      if (allParents) recipientCount += 54
    }

    const payload = {
      id: Date.now(),
      subjectTitle,
      sentToUser: recipientCount || 204,
      message,
      scheduleAt: scheduleDate
        ? `${new Date(scheduleDate).toLocaleDateString('en-GB')} ${scheduleTime || '11:00 AM'}`
        : new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      files: false,
      createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }

    const saved = localStorage.getItem('school_notices_app')
    let current = []
    if (saved) {
      try { current = JSON.parse(saved) } catch (err) { console.error(err) }
    }
    localStorage.setItem('school_notices_app', JSON.stringify([...current, payload]))

    setToastMsg('Notice sent successfully!')
    setToastOpen(true)
    setTimeout(() => {
      setToastOpen(false)
      router.push('/institute/notice')
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/institute/notice" className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors bg-white shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Send Notice</h1>
            <p className="text-xs text-slate-400">Compose and broadcast a notice to the mobile app</p>
          </div>
        </div>
        <button onClick={() => router.push('/institute/notice')} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Send Notice Form (Screenshot 3) */}
      <form onSubmit={handleSend} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-8 text-xs font-semibold text-slate-700">

        {/* Notice Information fieldset */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Notice Information</legend>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Subject/Title <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Enter Subject" value={subjectTitle} onChange={e => setSubjectTitle(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Message <span className="text-red-500">*</span></label>
            <textarea placeholder="Enter Message" value={message} onChange={e => setMessage(e.target.value)} className="w-full px-4 py-3 border rounded-lg font-bold outline-none h-28 resize-none" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 font-bold text-[10px]">Attachment (You can upload PDF, JPEG, PNG, JPG & WEBP, max 10MB)</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden flex-1">
                <input type="text" placeholder="Upload File" readOnly className="flex-1 px-4 py-2.5 outline-none font-semibold text-slate-400 bg-transparent text-xs" />
                <div className="p-2.5 border-l bg-slate-100 text-slate-500"><Upload className="w-4 h-4" /></div>
              </div>
              <button type="button" className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-colors">Attach</button>
            </div>
          </div>
        </fieldset>

        {/* Schedule the Notice fieldset */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Schedule the Notice</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Select Date</label>
              <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Select Time</label>
              <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
          </div>
        </fieldset>

        {/* Send Notice To fieldset */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Send Notice To</legend>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-700">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={everyone} onChange={e => setEveryone(e.target.checked)} className="accent-teal-600 w-4 h-4 rounded" />
              <span className="font-bold">Everyone</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={allStudents} onChange={e => setAllStudents(e.target.checked)} className="accent-teal-600 w-4 h-4 rounded" />
              <span className="font-bold">All Students</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={allTeachers} onChange={e => setAllTeachers(e.target.checked)} className="accent-teal-600 w-4 h-4 rounded" />
              <span className="font-bold">All Teachers</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={allParents} onChange={e => setAllParents(e.target.checked)} className="accent-teal-600 w-4 h-4 rounded" />
              <span className="font-bold">All Parents</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={selectedClasses} onChange={e => setSelectedClasses(e.target.checked)} className="accent-teal-600 w-4 h-4 rounded" />
              <span className="font-bold">Selected Classes</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={selectedTeachers} onChange={e => setSelectedTeachers(e.target.checked)} className="accent-teal-600 w-4 h-4 rounded" />
              <span className="font-bold">Selected Teachers</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={selectedStudents} onChange={e => setSelectedStudents(e.target.checked)} className="accent-teal-600 w-4 h-4 rounded" />
              <span className="font-bold">Selected Students</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={selectedParents} onChange={e => setSelectedParents(e.target.checked)} className="accent-teal-600 w-4 h-4 rounded" />
              <span className="font-bold">Selected Parents</span>
            </label>
          </div>
        </fieldset>

        {/* Footer Actions */}
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/institute/notice" className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors text-center">
            Cancel
          </Link>
          <button type="submit" className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md">
            Send
          </button>
        </div>

      </form>

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

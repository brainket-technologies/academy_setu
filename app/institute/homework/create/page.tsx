'use client'

import React, { useState } from 'react'
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateHomeworkPage() {
  const router = useRouter()

  // Form states
  const [title, setTitle] = useState('')
  const [classes, setClasses] = useState('')
  const [section, setSection] = useState('')
  const [subject, setSubject] = useState('')
  const [status, setStatus] = useState('Active')
  const [scheduleDate, setScheduleDate] = useState('')
  const [submissionDate, setSubmissionDate] = useState('')
  const [description, setDescription] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !classes || !section || !subject || !scheduleDate || !submissionDate) {
      alert('Please fill in all mandatory fields.')
      return
    }

    const payload = {
      id: Date.now(),
      title,
      classes,
      section,
      subject,
      status: status as 'Active' | 'Inactive',
      submissionDate: new Date(submissionDate).toLocaleDateString('en-GB'),
      scheduleDate: new Date(scheduleDate).toLocaleDateString('en-GB') + ' 11:00 AM',
      description
    }

    const saved = localStorage.getItem('school_homeworks')
    let current = []
    if (saved) {
      try {
        current = JSON.parse(saved)
      } catch (err) {
        console.error(err)
      }
    }
    const updated = [...current, payload]
    localStorage.setItem('school_homeworks', JSON.stringify(updated))

    setToastMsg('Homework assigned successfully!')
    setToastOpen(true)
    setTimeout(() => {
      setToastOpen(false)
      router.push('/institute/homework')
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/institute/homework"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors bg-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 font-extrabold">Assign Homework</h1>
            <p className="text-xs text-slate-400 font-medium font-bold">Launch a new homework sheet for classrooms</p>
          </div>
        </div>
      </div>

      {/* Main Card Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 text-xs font-semibold text-slate-700">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          <div className="flex flex-col gap-1.5 col-span-1 md:col-span-3">
            <label className="text-slate-500 font-bold">Homework Title *</label>
            <input 
              type="text" 
              placeholder="Enter Homework Title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" 
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Select Class *</label>
            <select value={classes} onChange={e => setClasses(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
              <option value="">Select a Class</option>
              <option value="Class V">Class V</option>
              <option value="Class VII">Class VII</option>
              <option value="Class VIII">Class VIII</option>
              <option value="Class XII">Class XII</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Select Section *</label>
            <select value={section} onChange={e => setSection(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
              <option value="">Select a Section</option>
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
              <option value="Section D">Section D</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Subject *</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
              <option value="">Select Subject</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="Social Studies">Social Studies</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Status *</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg bg-white outline-none font-semibold">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Schedule Date *</label>
            <input 
              type="date" 
              value={scheduleDate} 
              onChange={e => setScheduleDate(e.target.value)} 
              className="w-full px-4 py-2 border rounded-lg font-bold outline-none" 
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Submission Date *</label>
            <input 
              type="date" 
              value={submissionDate} 
              onChange={e => setSubmissionDate(e.target.value)} 
              className="w-full px-4 py-2 border rounded-lg font-bold outline-none" 
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-1 md:col-span-3">
            <label className="text-slate-500 font-bold">Instructions / Description</label>
            <textarea 
              placeholder="Enter instructions for students..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full px-4 py-2 border rounded-lg font-bold outline-none h-24 resize-none" 
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
            <label className="text-slate-500 font-bold">Image / Attachment</label>
            <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden">
              <input type="text" placeholder="Attach a photo or document" readOnly className="flex-1 px-4 py-2.5 outline-none font-semibold text-slate-400 bg-transparent text-xs" />
              <button type="button" className="p-2.5 border-l bg-slate-100 text-slate-500 hover:bg-slate-200"><Upload className="w-4 h-4" /></button>
            </div>
          </div>

        </div>

        <div className="flex justify-center gap-4 pt-6 border-t">
          <Link 
            href="/institute/homework"
            className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors text-center"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md"
          >
            Save
          </button>
        </div>

      </form>

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

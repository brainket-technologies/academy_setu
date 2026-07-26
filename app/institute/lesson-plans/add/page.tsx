'use client'

import React, { useState } from 'react'
import { ArrowLeft, X, Plus, Upload, Trash2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Milestone {
  id: number
  topic: string
  startDate: string
  endDate: string
}

export default function AddLessonPlanPage() {
  const router = useRouter()

  // Class Information
  const [className, setClassName] = useState('')
  const [section, setSection] = useState('')
  const [subject, setSubject] = useState('')

  // Lesson Information
  const [lessonTitle, setLessonTitle] = useState('')
  const [methodology, setMethodology] = useState('')
  const [description, setDescription] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  )

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 1, topic: '', startDate: '', endDate: '' }
  ])

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const addMilestone = () => {
    setMilestones([...milestones, { id: Date.now(), topic: '', startDate: '', endDate: '' }])
  }

  const removeMilestone = (id: number) => {
    if (milestones.length <= 1) return
    setMilestones(milestones.filter(m => m.id !== id))
  }

  const updateMilestone = (id: number, field: keyof Milestone, value: string) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!className || !section || !subject || !lessonTitle || !methodology) {
      alert('Please fill in all mandatory fields.')
      return
    }

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('school_lesson_plans') || '[]')
    const newPlan = {
      id: Date.now(),
      className,
      section,
      title: lessonTitle,
      subject,
      methodology,
      date: new Date().toLocaleDateString('en-GB'),
      totalMilestones: milestones.filter(m => m.topic.trim()).length || milestones.length,
      createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
    localStorage.setItem('school_lesson_plans', JSON.stringify([...existing, newPlan]))

    setToastMsg('Lesson plan created successfully!')
    setToastOpen(true)
    setTimeout(() => { setToastOpen(false); router.push('/institute/lesson-plans') }, 1500)
  }

  // Toolbar for rich text
  const Toolbar = () => (
    <div className="flex items-center gap-0.5 border-b border-slate-200 px-3 py-1.5 bg-slate-50 rounded-t-lg overflow-x-auto">
      <select className="text-[10px] font-bold px-1.5 py-1 border rounded bg-white text-slate-600 outline-none cursor-pointer">
        <option>Paragraph</option>
        <option>Heading 1</option>
        <option>Heading 2</option>
      </select>
      <select className="text-[10px] font-bold px-1.5 py-1 border rounded bg-white text-slate-600 outline-none cursor-pointer">
        <option>12 px</option>
        <option>14 px</option>
        <option>16 px</option>
      </select>
      {['B', 'I', '≡', '⊟', '≡', '⊞', '🔗', '📷', '■', '■'].map((btn, i) => (
        <button key={i} type="button" className="w-6 h-6 flex items-center justify-center text-[10px] font-black text-slate-500 hover:bg-slate-200 rounded transition-colors">{btn}</button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/institute/lesson-plans" className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 bg-white shadow-sm"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-xl font-black text-slate-800">Add Lesson Plan</h1>
            <p className="text-xs text-slate-400">Create a new lesson plan with milestones</p>
          </div>
        </div>
        <button onClick={() => router.push('/institute/lesson-plans')} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400"><X className="w-4 h-4" /></button>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-8 text-xs font-semibold text-slate-700">

        {/* Class Information */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Class Information</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Class <span className="text-red-500">*</span></label>
              <select value={className} onChange={e => setClassName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white">
                <option value="">Select Class</option>
                {['Class I','Class II','Class III','Class IV','Class V','Class VI','Class VII','Class VIII','Class IX','Class X'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Section <span className="text-red-500">*</span></label>
              <select value={section} onChange={e => setSection(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white">
                <option value="">Select Section</option>
                {['Section A','Section B','Section C','Section D'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Subject <span className="text-red-500">*</span></label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white">
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Social Studies">Social Studies</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Lesson Information */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Lesson Information</legend>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Lesson Title <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter Lesson Title" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Methodology <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Enter Methodology" value={methodology} onChange={e => setMethodology(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 font-bold">Add Attachment</label>
              <div className="flex items-center border rounded-lg bg-slate-50 overflow-hidden">
                <input type="text" placeholder="Upload a file" readOnly className="flex-1 px-4 py-2.5 outline-none font-semibold text-slate-400 bg-transparent text-xs" />
                <div className="p-2.5 border-l bg-slate-100 text-teal-500 cursor-pointer"><Upload className="w-4 h-4" /></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-500 font-bold">Write a description about the chapter/topic</label>
            <div className="border rounded-lg overflow-hidden">
              <Toolbar />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 font-semibold outline-none h-28 resize-none text-slate-600 leading-relaxed"
              />
            </div>
          </div>
        </fieldset>

        {/* Milestones */}
        <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
          <legend className="px-3 text-sm font-black text-[#1b3a60]">Milestones</legend>

          {milestones.map((milestone, idx) => (
            <div key={milestone.id} className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Enter Topic Details <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter Topic Details" value={milestone.topic} onChange={e => updateMilestone(milestone.id, 'topic', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Start Date <span className="text-red-500">*</span></label>
                  <input type="date" value={milestone.startDate} onChange={e => updateMilestone(milestone.id, 'startDate', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">End Date <span className="text-red-500">*</span></label>
                  <input type="date" value={milestone.endDate} onChange={e => updateMilestone(milestone.id, 'endDate', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none" />
                </div>
              </div>
              {milestones.length > 1 && (
                <button type="button" onClick={() => removeMilestone(milestone.id)} className="absolute -right-2 -top-2 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200"><Trash2 className="w-3 h-3" /></button>
              )}
            </div>
          ))}

          <div className="flex justify-center">
            <button type="button" onClick={addMilestone} className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </fieldset>

        {/* Footer */}
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/institute/lesson-plans" className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors text-center">Cancel</Link>
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

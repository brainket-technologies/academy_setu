'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, X, Calendar, Clock, ArrowLeft, Link as LinkIcon, Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchMarksheetSetups, ExamMarksheetSetupRecord } from '@/app/institute/exam-marksheet/setup/actions'
import { getInstituteAddedClasses, MasterClassWithSections } from '@/lib/institute-classes'

interface SubjectRow {
  id: number
  subjectName: string
  date: string
  fromTime: string
  toTime: string
}

function CreateTimeTableForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('editId')

  const [title, setTitle] = useState('')
  const [classGrade, setClassGrade] = useState('')
  const [session, setSession] = useState('2025-26')
  const [subjects, setSubjects] = useState<SubjectRow[]>([
    { id: 1, subjectName: '', date: '', fromTime: '', toTime: '' }
  ])

  // Marksheet Setups from PostgreSQL & Master Classes
  const [marksheetSetups, setMarksheetSetups] = useState<ExamMarksheetSetupRecord[]>([])
  const [masterClasses, setMasterClasses] = useState<MasterClassWithSections[]>([])
  const [selectedSetupId, setSelectedSetupId] = useState('')

  // Load setups and classes
  useEffect(() => {
    // 1. Load added classes
    const addedClasses = getInstituteAddedClasses()
    setMasterClasses(addedClasses)

    // 2. Load marksheet setups
    const loadSetups = async () => {
      try {
        const res = await fetchMarksheetSetups()
        if (res.success && res.data) {
          setMarksheetSetups(res.data)
        }
      } catch (err) {
        console.error('Failed to load marksheet setups for timetable:', err)
      }
    }
    loadSetups()
  }, [])

  // Load for edit mode
  useEffect(() => {
    if (editId) {
      const saved = localStorage.getItem('exam_timetables')
      if (saved) {
        try {
          const list = JSON.parse(saved)
          const found = list.find((t: any) => t.id === Number(editId))
          if (found) {
            setTitle(found.title)
            setClassGrade(found.classGrade)
            setSession(found.session || '2025-26')
            if (found.subjects && found.subjects.length > 0) {
              setSubjects(found.subjects.map((s: any, idx: number) => ({
                id: idx + 1,
                subjectName: s.subjectName,
                date: s.date,
                fromTime: s.fromTime,
                toTime: s.toTime
              })))
            }
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [editId])

  const handleSelectExamSetup = (setupId: string) => {
    setSelectedSetupId(setupId)
    if (!setupId) return

    const matched = marksheetSetups.find(s => s.id === setupId)
    if (matched) {
      if (matched.exam) setTitle(matched.exam)
      if (matched.classGrade) {
        const baseClass = matched.classGrade.split('(')[0].trim()
        setClassGrade(baseClass)
      }
      if (matched.session) setSession(matched.session)

      // Auto populate subjects from the setup config with their scheduled dates!
      if (matched.config?.subjects && matched.config.subjects.length > 0) {
        const mappedSubjects: SubjectRow[] = matched.config.subjects.map((sub: any, idx: number) => ({
          id: Date.now() + idx,
          subjectName: sub.subjectName || `Subject ${idx + 1}`,
          date: sub.examDate || matched.examDate || '',
          fromTime: '10:00',
          toTime: '13:00'
        }))
        setSubjects(mappedSubjects)
      }
    }
  }

  const handleAddSubject = () => {
    setSubjects(prev => [
      ...prev,
      { id: Date.now(), subjectName: '', date: '', fromTime: '', toTime: '' }
    ])
  }

  const handleRemoveSubject = (id: number) => {
    if (subjects.length > 1) {
      setSubjects(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleSubjectChange = (id: number, field: keyof SubjectRow, value: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !classGrade) {
      alert('Please fill in Exam Title and Class.')
      return
    }

    const today = new Date()
    const dateStr = today.toLocaleDateString('en-GB')
    const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const saved = localStorage.getItem('exam_timetables')
    let current: any[] = []
    if (saved) {
      try {
        current = JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }

    if (editId) {
      // Edit
      const updated = current.map(item => 
        item.id === Number(editId)
          ? { ...item, title, classGrade, session, subjects }
          : item
      )
      localStorage.setItem('exam_timetables', JSON.stringify(updated))
    } else {
      // Create new
      const payload = {
        id: Date.now(),
        title,
        classGrade,
        session,
        subjects,
        dateCreated: dateStr,
        timeCreated: timeStr
      }
      localStorage.setItem('exam_timetables', JSON.stringify([payload, ...current]))
    }

    router.push('/institute/admit-card/time-table')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.push('/institute/admit-card/time-table')}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {editId ? 'Edit Exam Time Table' : 'Create Exam Time Table'}
            </h1>
            <p className="text-xs text-slate-400">Configure dates and time schedules for exam papers</p>
          </div>
        </div>
        
        <button 
          onClick={() => router.push('/institute/admit-card/time-table')}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6">
        
        {/* Link with Exam Marksheet Setup */}
        <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                  Link with Exam Marksheet Setup
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                  Auto-Populate
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Select an exam marksheet setup to automatically fill exam title, class, session, and subjects with their dates.
              </p>
            </div>
          </div>

          <div className="w-full md:w-80 shrink-0">
            <select
              value={selectedSetupId}
              onChange={e => handleSelectExamSetup(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
            >
              <option value="">-- Choose Exam Marksheet Setup --</option>
              {marksheetSetups.map(s => (
                <option key={s.id} value={s.id}>
                  {s.exam} ({s.classGrade}) {s.session ? `[${s.session}]` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              required
              placeholder="Ex: Half Yearly Exam"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            />
          </div>

          {/* Class */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Class <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                Masters
              </span>
            </div>
            <select
              required
              value={classGrade}
              onChange={e => setClassGrade(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            >
              <option value="">Select Class</option>
              {masterClasses.map(m => (
                <option key={m.className} value={m.className}>
                  {m.className}
                </option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Session <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={session}
              onChange={e => setSession(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            >
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
              <option value="2026-27">2026-27</option>
            </select>
          </div>

        </div>

        {/* Subjects List Header */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-black text-[#1b3a60] uppercase tracking-wider mb-4">
            Subjects & Schedules
          </h3>
          
          <div className="space-y-4">
            {subjects.map((sub, idx) => (
              <div 
                key={sub.id} 
                className="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6"
              >
                {/* Remove button */}
                {subjects.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveSubject(sub.id)}
                    className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  {/* Program / Subject name */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Program/ Subject Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      required
                      placeholder="Enter Program / Subject Name"
                      value={sub.subjectName}
                      onChange={e => handleSubjectChange(sub.id, 'subjectName', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold bg-white"
                    />
                  </div>

                  {/* Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Date <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      <input 
                        type="date"
                        required
                        value={sub.date}
                        onChange={e => handleSubjectChange(sub.id, 'date', e.target.value)}
                        className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold bg-white"
                      />
                    </div>
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">From Time <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Clock className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                        <input 
                          type="time"
                          required
                          value={sub.fromTime}
                          onChange={e => handleSubjectChange(sub.id, 'fromTime', e.target.value)}
                          className="w-full pl-2 pr-6 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">To Time <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Clock className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                        <input 
                          type="time"
                          required
                          value={sub.toTime}
                          onChange={e => handleSubjectChange(sub.id, 'toTime', e.target.value)}
                          className="w-full pl-2 pr-6 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold bg-white"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          <button 
            type="button"
            onClick={handleAddSubject}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors mt-4"
          >
            <Plus className="w-4 h-4 text-teal-600" /> Add New Subject
          </button>
        </div>

        {/* Action footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button 
            type="button" 
            onClick={() => router.push('/institute/admit-card/time-table')}
            className="px-5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Save
          </button>
        </div>

      </form>
    </div>
  )
}

export default function CreateExamTimeTablePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-xs text-slate-400">Loading...</div>}>
      <CreateTimeTableForm />
    </Suspense>
  )
}

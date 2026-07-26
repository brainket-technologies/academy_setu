'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, X, Calendar, Clock, ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Title <span className="text-red-500">*</span></label>
            <input 
              type="text"
              required
              placeholder="Ex: Half Yearly Exam"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            />
          </div>

          {/* Class */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Class <span className="text-red-500">*</span></label>
            <select
              required
              value={classGrade}
              onChange={e => setClassGrade(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            >
              <option value="">Select Class</option>
              <option value="Class I">Class I</option>
              <option value="Class II">Class II</option>
              <option value="Class III">Class III</option>
              <option value="Class IV">Class IV</option>
              <option value="Class V">Class V</option>
              <option value="Class VI">Class VI</option>
              <option value="Class VII">Class VII</option>
              <option value="Class VIII">Class VIII</option>
            </select>
          </div>

          {/* Session */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Session <span className="text-red-500">*</span></label>
            <select
              required
              value={session}
              onChange={e => setSession(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
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

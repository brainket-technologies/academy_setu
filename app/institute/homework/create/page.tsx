'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  ArrowLeft, Calendar, Clock, BookOpen, User, Users,
  Upload, Paperclip, X, Check, Loader2, Sparkles,
  FileText, CheckCircle2, ChevronRight, Signal, Wifi,
  Battery, GraduationCap, AlertCircle, Plus, Send
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'
import { fetchStudents } from '@/app/institute/students/actions'
import { fetchTeachers } from '@/app/institute/teachers/actions'
import { createHomeworkTask } from '@/app/institute/homework/assign/actions'

export default function MobileAssignHomeworkPage() {
  const router = useRouter()

  // Masters Data
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  // DB Data
  const [studentsList, setStudentsList] = useState<any[]>([])
  const [teachersList, setTeachersList] = useState<any[]>([])

  // Live Clock for Mobile Status Bar
  const [currentTime, setCurrentTime] = useState('')
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    updateTime()
    const timer = setInterval(updateTime, 30000)
    return () => clearInterval(timer)
  }, [])

  // Load students & teachers
  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const [stdRes, tchRes] = await Promise.all([
          fetchStudents(),
          fetchTeachers()
        ])
        if (isMounted) {
          if (stdRes?.success && Array.isArray(stdRes.data)) setStudentsList(stdRes.data)
          if (tchRes?.success && Array.isArray(tchRes.data)) setTeachersList(tchRes.data)
        }
      } catch (e) {
        console.error(e)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  // Form State
  const [title, setTitle] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [assignDate, setAssignDate] = useState(() => new Date().toISOString().split('T')[0])
  
  // Default due date: +3 days from today
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  })

  const [description, setDescription] = useState('')
  const [assignTarget, setAssignTarget] = useState<'entire' | 'specific'>('entire')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  // Attachment
  const [attachmentName, setAttachmentName] = useState('')
  const [attachmentSize, setAttachmentSize] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Status & Toast
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({
    open: false,
    msg: '',
    type: 'success'
  })

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ open: true, msg, type })
    setTimeout(() => setToast(p => ({ ...p, open: false })), 3500)
  }

  // Available sections based on selected class
  const availableSections = useMemo(() => {
    if (!selectedClass) return []
    const targetNorm = selectedClass.trim().toLowerCase()
    const set = new Set<string>()

    if (Array.isArray(sectionsData)) {
      sectionsData.forEach((s: any) => {
        if (!s.deleted && s.className && s.className.trim().toLowerCase() === targetNorm) {
          const name = s.sectionName || s.name
          if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
        }
      })
    }

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('school_masters_sections')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            parsed.forEach((s: any) => {
              if (!s.deleted && s.className && s.className.trim().toLowerCase() === targetNorm) {
                const name = s.sectionName || s.name
                if (name && typeof name === 'string' && name.trim()) set.add(name.trim())
              }
            })
          }
        }
      } catch (e) {}
    }

    if (set.size > 0) return Array.from(set)
    return ['A', 'B', 'C']
  }, [selectedClass, sectionsData])

  // Subjects list
  const availableSubjects = useMemo(() => {
    const set = new Set<string>()
    if (Array.isArray(subjectsData)) {
      subjectsData.forEach((s: any) => {
        if (!s.deleted && s.subjectName) set.add(s.subjectName.trim())
      })
    }
    if (set.size === 0) {
      ;['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science'].forEach(s => set.add(s))
    }
    return Array.from(set)
  }, [subjectsData])

  // Default subject selection
  useEffect(() => {
    if (availableSubjects.length > 0 && !selectedSubject) {
      setSelectedSubject(availableSubjects[0])
    }
  }, [availableSubjects, selectedSubject])

  // Students in selected class and section
  const classStudents = useMemo(() => {
    if (!selectedClass || !selectedSection) return []
    const targetClass = selectedClass.trim().toLowerCase()
    const targetSec = selectedSection.trim().toLowerCase()

    return studentsList.filter((s: any) => {
      const sc = String(s.className || s.class_name || s.class || '').trim().toLowerCase()
      const ss = String(s.sectionName || s.section_name || s.section || '').trim().toLowerCase()
      return sc === targetClass && ss === targetSec
    })
  }, [studentsList, selectedClass, selectedSection])

  // Quick preset for Due Date
  const handleSetDuePreset = (daysFromToday: number) => {
    const d = new Date()
    d.setDate(d.getDate() + daysFromToday)
    setDueDate(d.toISOString().split('T')[0])
  }

  // Handle File change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachmentName(file.name)
      const kb = Math.round(file.size / 1024)
      setAttachmentSize(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`)
    }
  }

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalSubject = selectedSubject === '__custom__' ? customSubject.trim() : selectedSubject

    if (!title.trim()) {
      showToast('Please enter a homework title.', 'error')
      return
    }
    if (!selectedClass) {
      showToast('Please select a target class.', 'error')
      return
    }
    if (!selectedSection) {
      showToast('Please select a section.', 'error')
      return
    }
    if (!finalSubject) {
      showToast('Please specify a subject.', 'error')
      return
    }

    setSubmitting(true)

    const newId = `task-${Date.now()}`
    const payload = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      classes: selectedClass,
      section: selectedSection,
      subject: finalSubject,
      assignedBy: selectedTeacher || (teachersList[0]?.name ? `${teachersList[0].name}` : 'Faculty'),
      assignDate,
      submissionDate: dueDate,
      hasAttachment: !!attachmentName,
      attachmentName: attachmentName || undefined,
      status: 'Active' as const
    }

    try {
      // 1. Create in DB
      const res = await createHomeworkTask(payload)

      // 2. Also cache in localStorage for instant offline/portal sync
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('school_homework_tasks')
          const existing = raw ? JSON.parse(raw) : []
          localStorage.setItem('school_homework_tasks', JSON.stringify([payload, ...existing]))

          const rawHw = localStorage.getItem('school_homeworks')
          const existingHw = rawHw ? JSON.parse(rawHw) : []
          localStorage.setItem('school_homeworks', JSON.stringify([payload, ...existingHw]))
        } catch (e) {}
      }

      showToast('Homework published successfully!', 'success')
      setTimeout(() => {
        router.push('/institute/homework/assign')
      }, 1200)
    } catch (err: any) {
      showToast(err.message || 'Failed to publish homework.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-4 md:py-8 flex justify-center items-start bg-slate-100/70 dark:bg-slate-950/80 px-2 sm:px-4 animate-in fade-in duration-200">

      {/* ══════════════════════════════════════════════════════
          MOBILE PHONE CONTAINER FRAME (Look & Feel)
      ══════════════════════════════════════════════════════ */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-slate-800 dark:border-slate-700 overflow-hidden flex flex-col relative min-h-[750px]">
        
        {/* ── TOP MOBILE STATUS BAR ── */}
        <div className="bg-[#1b3a60] text-white px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold select-none shrink-0">
          <span>{currentTime || '9:41 AM'}</span>

          {/* Dynamic Island / Camera Notch */}
          <div className="w-24 h-4 bg-slate-950/80 rounded-full flex items-center justify-center gap-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-slate-800"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70"></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* ── MOBILE APP HEADER ── */}
        <div className="bg-[#1b3a60] text-white px-5 pb-4 pt-1 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/institute/homework/assign"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all"
              title="Back to Assigned List"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-black tracking-tight leading-tight">
                Assign Homework
              </h1>
              <p className="text-[10px] text-teal-200 font-medium">
                Teacher Curriculum Portal
              </p>
            </div>
          </div>

          <Link
            href="/institute/homework/assign"
            className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-teal-500/20 text-teal-200 hover:bg-teal-500/30 transition-colors border border-teal-400/20"
          >
            All Tasks
          </Link>
        </div>

        {/* ── SCROLLABLE MOBILE CONTENT BODY ── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          
          {/* Institute Teacher Banner Card */}
          <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">
                  New Assignment Sheet
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Publish syllabus task for classroom
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
              Session 2026-27
            </span>
          </div>

          {/* 1. Target Class & Section Card */}
          <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                Target Classroom
              </span>
              <span className="text-[10px] text-red-500 font-bold">* Mandatory</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Class */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Class</label>
                <select
                  required
                  value={selectedClass}
                  onChange={e => {
                    setSelectedClass(e.target.value)
                    setSelectedSection('')
                    setSelectedStudentIds([])
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 cursor-pointer shadow-2xs"
                >
                  <option value="">Select Class</option>
                  {classesData.map((c: any) => (
                    <option key={c.className} value={c.className}>{c.className}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Section</label>
                <select
                  required
                  disabled={!selectedClass}
                  value={selectedSection}
                  onChange={e => {
                    setSelectedSection(e.target.value)
                    setSelectedStudentIds([])
                  }}
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 cursor-pointer shadow-2xs ${
                    !selectedClass ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">{selectedClass ? 'Select Section' : 'Choose Class First'}</option>
                  {availableSections.map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Audience: Entire Class vs Specific Students */}
            {selectedClass && selectedSection && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Assign To:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignTarget('entire')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                      assignTarget === 'entire'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Entire Class
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignTarget('specific')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                      assignTarget === 'specific'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Specific Students ({selectedStudentIds.length})
                  </button>
                </div>

                {/* Specific Students Checklist */}
                {assignTarget === 'specific' && (
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 max-h-36 overflow-y-auto space-y-1.5 mt-2 animate-in fade-in">
                    {classStudents.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center py-2">No students enrolled in this section.</p>
                    ) : (
                      classStudents.map((st: any) => {
                        const sId = String(st.id || st.admission_no)
                        const isChecked = selectedStudentIds.includes(sId)
                        const name = `${st.first_name || ''} ${st.last_name || ''}`.trim() || st.name
                        return (
                          <label key={sId} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                if (e.target.checked) setSelectedStudentIds(p => [...p, sId])
                                else setSelectedStudentIds(p => p.filter(id => id !== sId))
                              }}
                              className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                              {name}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-auto shrink-0">
                              Roll: {st.roll_no || st.rollNo || '—'}
                            </span>
                          </label>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Subject & Teacher Details Card */}
          <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Subject &amp; Instructor
            </span>

            <div className="space-y-2.5">
              {/* Subject */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 cursor-pointer shadow-2xs"
                >
                  {availableSubjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="__custom__">+ Custom Subject...</option>
                </select>

                {selectedSubject === '__custom__' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter subject name..."
                    value={customSubject}
                    onChange={e => setCustomSubject(e.target.value)}
                    className="w-full px-3 py-2 mt-1.5 bg-white dark:bg-slate-900 border border-teal-400 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-teal-500"
                  />
                )}
              </div>

              {/* Assigned Teacher */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Assigned Teacher
                </label>
                <select
                  value={selectedTeacher}
                  onChange={e => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 cursor-pointer shadow-2xs"
                >
                  <option value="">Select Faculty (or Default)</option>
                  {teachersList.map((t: any) => (
                    <option key={t.id || t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Title & Instructions Card */}
          <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              Task Content
            </span>

            {/* Homework Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Homework Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chapter 4: Linear Equations Exercise 4.2"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs"
              />

              {/* Quick Title Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
                {['Exercise 1.1', 'Chapter Reading', 'Lab Activity', 'Grammar Sheet'].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setTitle(chip)}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Description / Guidelines */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Instructions / Description
              </label>
              <textarea
                rows={3}
                placeholder="Explain requirements, questions to solve, or guidelines for students..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 resize-none shadow-2xs"
              />
            </div>
          </div>

          {/* 4. Dates & Deadlines Card */}
          <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
              Schedule &amp; Deadlines
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Assign Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Assign Date</label>
                <input
                  type="date"
                  required
                  value={assignDate}
                  onChange={e => setAssignDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Due Date</label>
                <input
                  type="date"
                  required
                  min={assignDate}
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Quick Due Date Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400">Due in:</span>
              <button
                type="button"
                onClick={() => handleSetDuePreset(1)}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleSetDuePreset(3)}
                className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[10px] font-bold text-teal-700 dark:text-teal-300"
              >
                3 Days
              </button>
              <button
                type="button"
                onClick={() => handleSetDuePreset(7)}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                1 Week
              </button>
            </div>
          </div>

          {/* 5. Attachment Card */}
          <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                Worksheet / File
              </span>
              <span className="text-[10px] text-slate-400">Optional</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
              onChange={handleFileChange}
              className="hidden"
            />

            {attachmentName ? (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-teal-300 dark:border-teal-800 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 dark:text-white truncate text-xs">{attachmentName}</p>
                    <p className="text-[10px] text-teal-600">{attachmentSize || 'Attached'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachmentName('')
                    setAttachmentSize('')
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 bg-white dark:bg-slate-900 p-4 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 group"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  Tap to upload worksheet or PDF
                </p>
                <p className="text-[10px] text-slate-400">PDF, DOCX, worksheets or images up to 10MB</p>
              </div>
            )}
          </div>

          <div className="h-20"></div> {/* Spacer for fixed mobile bottom button */}
        </form>

        {/* ── STICKY BOTTOM MOBILE ACTION BAR ── */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3.5 z-20 shadow-lg">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Homework...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publish Homework</span>
              </>
            )}
          </button>

          {/* iPhone Home Indicator Line */}
          <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 mb-0.5"></div>
        </div>

      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {toast.open && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Calendar, CheckCircle2, Clock, Filter, Eye, Award, 
  MessageSquare, ArrowLeft, Download, FileText, Check, X,
  User, BookOpen, ChevronRight, Sparkles, AlertCircle, Send, Search
} from 'lucide-react'
import Link from 'next/link'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'

interface PendingRemarkItem {
  id: string
  homeworkId: number
  homeworkTitle: string
  studentName: string
  rollNo: string
  classes: string
  section: string
  subject: string
  submittedAt: string
  attachmentName: string
  grade: string
  remarks: string
  status: 'Pending' | 'Evaluated'
}

const INITIAL_PENDING_REMARKS: PendingRemarkItem[] = [
  {
    id: 'pr-1',
    homeworkId: 101,
    homeworkTitle: 'Quadratic Equations Exercise 4.2',
    studentName: 'Ananya Sharma',
    rollNo: '102',
    classes: 'Class 1',
    section: 'A',
    subject: 'Maths',
    submittedAt: '22/10/2026 05:15 PM',
    attachmentName: 'ananya_hw.pdf',
    grade: '',
    remarks: '',
    status: 'Pending'
  },
  {
    id: 'pr-2',
    homeworkId: 102,
    homeworkTitle: 'Tenses and Reported Speech Practice',
    studentName: 'Rohan Gupta',
    rollNo: '105',
    classes: 'Class 1',
    section: 'B',
    subject: 'English',
    submittedAt: '21/10/2026 06:00 PM',
    attachmentName: 'rohan_english.pdf',
    grade: '',
    remarks: '',
    status: 'Pending'
  },
  {
    id: 'pr-3',
    homeworkId: 103,
    homeworkTitle: 'Laws of Motion Numerical Problems',
    studentName: 'Kabir Singh',
    rollNo: '112',
    classes: 'Class 1',
    section: 'A',
    subject: 'Physics',
    submittedAt: '20/10/2026 08:10 PM',
    attachmentName: 'kabir_physics_assignment.pdf',
    grade: '',
    remarks: '',
    status: 'Pending'
  },
  {
    id: 'pr-4',
    homeworkId: 104,
    homeworkTitle: 'Water Cycle and Atmospheric Pressure',
    studentName: 'Sanya Mirza',
    rollNo: '118',
    classes: 'Class 2',
    section: 'A',
    subject: 'Science',
    submittedAt: '22/10/2026 03:40 PM',
    attachmentName: 'sanya_science_diagram.jpg',
    grade: '',
    remarks: '',
    status: 'Pending'
  },
  {
    id: 'pr-5',
    homeworkId: 105,
    homeworkTitle: 'Plant Cell vs Animal Cell Diagram',
    studentName: 'Devansh Roy',
    rollNo: '124',
    classes: 'Class 2',
    section: 'B',
    subject: 'Biology',
    submittedAt: '22/10/2026 04:10 PM',
    attachmentName: 'devansh_cells.pdf',
    grade: '',
    remarks: '',
    status: 'Pending'
  }
]

const QUICK_REMARKS = [
  'Outstanding work, very well presented!',
  'Good effort! All solutions are correct.',
  'Well answered, neat handwriting.',
  'Please review question 3 calculation.',
  'Good attempt, keep practicing.',
  'Need more detail in explanation.'
]

const GRADE_PRESETS = ['A+', 'A', 'B+', 'B', 'C', 'D', 'Needs Improvement']

export default function PendingRemarkHomeworkPage() {
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  const [submissions, setSubmissions] = useState<PendingRemarkItem[]>(INITIAL_PENDING_REMARKS)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Remark Modal State
  const [activeItem, setActiveItem] = useState<PendingRemarkItem | null>(null)
  const [modalGrade, setModalGrade] = useState('')
  const [modalRemarks, setModalRemarks] = useState('')

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('school_homework_submissions')
      if (saved) {
        const parsed: PendingRemarkItem[] = JSON.parse(saved)
        // Keep pending ones or merge
        const pendingOnes = parsed.filter(p => p.status === 'Pending')
        if (pendingOnes.length > 0) {
          setSubmissions(pendingOnes)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Options
  const classOptions = useMemo(() => {
    if (classesData && classesData.length > 0) {
      return classesData.map((c: any) => c.className || c.name || String(c))
    }
    return ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6']
  }, [classesData])

  const sectionOptions = useMemo(() => {
    if (sectionsData && sectionsData.length > 0) {
      return sectionsData.map((s: any) => s.sectionName || s.name || String(s))
    }
    return ['A', 'B', 'C']
  }, [sectionsData])

  const subjectOptions = useMemo(() => {
    if (subjectsData && subjectsData.length > 0) {
      return subjectsData.map((s: any) => s.subjectName || s.name || String(s))
    }
    return ['Maths', 'English', 'Physics', 'Science', 'Biology', 'Social Studies']
  }, [subjectsData])

  // Filtered
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(item => {
      if (selectedClass && item.classes !== selectedClass) return false
      if (selectedSection && item.section !== selectedSection) return false
      if (selectedSubject && !item.subject.toLowerCase().includes(selectedSubject.toLowerCase())) return false
      if (selectedDate && !item.submittedAt.includes(selectedDate)) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchStudent = item.studentName.toLowerCase().includes(q)
        const matchTitle = item.homeworkTitle.toLowerCase().includes(q)
        const matchRoll = item.rollNo.includes(q)
        if (!matchStudent && !matchTitle && !matchRoll) return false
      }
      return true
    })
  }, [submissions, selectedClass, selectedSection, selectedSubject, selectedDate, searchQuery])

  const handleOpenRemark = (item: PendingRemarkItem) => {
    setActiveItem(item)
    setModalGrade(item.grade || 'A')
    setModalRemarks(item.remarks || 'Good effort! All solutions are correct.')
  }

  const handleSaveRemark = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeItem) return

    if (!modalGrade) {
      alert('Please select a grade.')
      return
    }

    // Remove from pending list (since it's now evaluated)
    const updated = submissions.filter(s => s.id !== activeItem.id)
    setSubmissions(updated)

    // Update global submissions in localStorage
    try {
      const existing = localStorage.getItem('school_homework_submissions')
      let list = existing ? JSON.parse(existing) : []
      let found = false
      list = list.map((item: any) => {
        if (item.id === activeItem.id) {
          found = true
          return {
            ...item,
            grade: modalGrade,
            remarks: modalRemarks,
            status: 'Evaluated'
          }
        }
        return item
      })
      if (!found) {
        list.push({
          ...activeItem,
          grade: modalGrade,
          remarks: modalRemarks,
          status: 'Evaluated'
        })
      }
      localStorage.setItem('school_homework_submissions', JSON.stringify(list))
    } catch (err) {
      console.error(err)
    }

    showToast(`Remark and Grade "${modalGrade}" saved for ${activeItem.studentName}!`)
    setActiveItem(null)
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-8 space-y-6">
      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl transition-all animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link href="/institute/homework" className="hover:text-emerald-700 transition-colors">
              Homework
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-emerald-700 font-semibold">Pending Remark Homework</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-200/60">
              <MessageSquare className="w-6 h-6" />
            </span>
            Pending Remark Homework
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Select date, class, and subject to review and remark pending tasks from students.
          </p>
        </div>

        {/* Quick Nav Dropdown Pill Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/institute/homework/assign"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Assign Homework
          </Link>
          <Link
            href="/institute/homework/remark"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Remark Homework
          </Link>
          <Link
            href="/institute/homework/pending-assign"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Pending Assign
          </Link>
          <Link
            href="/institute/homework/pending-remark"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm"
          >
            Pending Remark
          </Link>
          <Link
            href="/institute/homework/report"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Homework Report
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-orange-200/80 shadow-sm flex items-center gap-4 bg-gradient-to-br from-orange-50/50 to-transparent">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-orange-700 uppercase tracking-wider">Pending Remarks</p>
            <h3 className="text-2xl font-bold text-orange-900">{submissions.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Quick Action</p>
            <h3 className="text-sm font-bold text-slate-800">One-Click Grade & Remarks</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-sm flex items-center gap-4 bg-gradient-to-br from-blue-50/40 to-transparent">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">Avg Response Time</p>
            <h3 className="text-2xl font-bold text-blue-900">4.2 Hrs</h3>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
            <Filter className="w-4 h-4 text-emerald-600" />
            Filter Submissions for Pending Evaluation
          </div>
          <button 
            type="button"
            onClick={() => {
              setSelectedClass('')
              setSelectedSection('')
              setSelectedSubject('')
              setSelectedDate('')
              setSearchQuery('')
            }}
            className="text-xs text-slate-500 hover:text-emerald-600 font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
            >
              <option value="">All Classes</option>
              {classOptions.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
            >
              <option value="">All Sections</option>
              {sectionOptions.map((s: string) => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
            >
              <option value="">All Subjects</option>
              {subjectOptions.map((sub: string) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Search Student / Task
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Student name or roll..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-sm">
              Pending Submissions Queue
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
              {filteredSubmissions.length} Pending
            </span>
          </div>

          <Link
            href="/institute/homework/remark"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View Evaluated Archive
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Zero Pending Remarks!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              All submitted assignments have been evaluated and reviewed. Great job!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Class & Subject</th>
                  <th className="py-3 px-4">Homework Title</th>
                  <th className="py-3 px-4">Submitted On</th>
                  <th className="py-3 px-4">Attachment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{item.studentName}</p>
                          <span className="text-[11px] text-slate-500">Roll No: {item.rollNo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <div className="space-y-0.5">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                          {item.subject}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          {item.classes} - Sec {item.section}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                      {item.homeworkTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.submittedAt}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => alert(`Opening student submission attachment: ${item.attachmentName}`)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate max-w-[120px]">{item.attachmentName}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenRemark(item)}
                        className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-1.5 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Remark Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remark Evaluation Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-orange-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-200" />
                  Evaluate & Remark Submission
                </h3>
                <p className="text-xs text-orange-100 mt-0.5">
                  {activeItem.studentName} (Roll {activeItem.rollNo}) • {activeItem.subject}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="w-8 h-8 rounded-lg bg-orange-700 hover:bg-orange-800 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRemark} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-700">{activeItem.homeworkTitle}</p>
                  <span className="text-[11px] text-slate-500">Submitted: {activeItem.submittedAt}</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Opening student submission: ${activeItem.attachmentName}`)}
                  className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  View Work
                </button>
              </div>

              {/* Grade Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assign Grade *
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRADE_PRESETS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setModalGrade(g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        modalGrade === g
                          ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Feedback Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Quick Feedback Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REMARKS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setModalRemarks(preset)}
                      className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 transition-colors border border-slate-200/60"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teacher Remarks Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teacher Remarks / Comments
                </label>
                <textarea
                  rows={3}
                  required
                  value={modalRemarks}
                  onChange={e => setModalRemarks(e.target.value)}
                  placeholder="Enter remarks for the student..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save & Complete Remark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

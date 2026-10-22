'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, CheckCircle2, Clock, Filter, Eye, Award, 
  MessageSquare, ArrowLeft, Download, FileText, Check, X,
  User, BookOpen, Calendar, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'

interface SubmissionItem {
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
  status: 'Evaluated' | 'Pending'
}

const INITIAL_SUBMISSIONS: SubmissionItem[] = [
  {
    id: 'sub-1',
    homeworkId: 101,
    homeworkTitle: 'Quadratic Equations Exercise 4.2',
    studentName: 'Aarav Patel',
    rollNo: '101',
    classes: 'Class 1',
    section: 'A',
    subject: 'Maths',
    submittedAt: '22/10/2026 04:30 PM',
    attachmentName: 'aarav_maths_hw.pdf',
    grade: 'A+',
    remarks: 'Excellent step-by-step working and correct solutions!',
    status: 'Evaluated'
  },
  {
    id: 'sub-2',
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
    id: 'sub-3',
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
    id: 'sub-4',
    homeworkId: 102,
    homeworkTitle: 'Tenses and Reported Speech Practice',
    studentName: 'Priya Verma',
    rollNo: '108',
    classes: 'Class 1',
    section: 'B',
    subject: 'English',
    submittedAt: '21/10/2026 07:20 PM',
    attachmentName: 'priya_english_v2.pdf',
    grade: 'A',
    remarks: 'Good grammar application throughout the essay.',
    status: 'Evaluated'
  },
  {
    id: 'sub-5',
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
  }
]

const GRADE_OPTIONS = ['A+', 'A', 'B+', 'B', 'C', 'D', 'Needs Improvement']

export default function RemarkHomeworkPage() {
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  const [submissions, setSubmissions] = useState<SubmissionItem[]>(INITIAL_SUBMISSIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Evaluated' | 'Pending'>('All')

  // Evaluation Modal
  const [activeModalItem, setActiveModalItem] = useState<SubmissionItem | null>(null)
  const [modalGrade, setModalGrade] = useState('')
  const [modalRemarks, setModalRemarks] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load submissions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('school_homework_submissions')
      if (saved) {
        setSubmissions(JSON.parse(saved))
      } else {
        localStorage.setItem('school_homework_submissions', JSON.stringify(INITIAL_SUBMISSIONS))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const saveSubmissions = (updated: SubmissionItem[]) => {
    setSubmissions(updated)
    try {
      localStorage.setItem('school_homework_submissions', JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }
  }

  const handleOpenEvaluate = (item: SubmissionItem) => {
    setActiveModalItem(item)
    setModalGrade(item.grade || '')
    setModalRemarks(item.remarks || '')
  }

  const handleSaveRemark = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeModalItem) return

    if (!modalGrade.trim()) {
      alert('Please assign a grade before saving.')
      return
    }

    const updated = submissions.map(sub => {
      if (sub.id === activeModalItem.id) {
        return {
          ...sub,
          grade: modalGrade.trim(),
          remarks: modalRemarks.trim(),
          status: 'Evaluated' as const
        }
      }
      return sub
    })

    saveSubmissions(updated)
    setActiveModalItem(null)
    setToastMsg(`Remark submitted for ${activeModalItem.studentName}!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2500)
  }

  // Filtered List
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(item => {
      if (selectedClass && item.classes !== selectedClass) return false
      if (selectedSection && item.section !== selectedSection) return false
      if (selectedSubject && item.subject !== selectedSubject) return false
      if (statusFilter !== 'All' && item.status !== statusFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          item.studentName.toLowerCase().includes(q) ||
          item.rollNo.includes(q) ||
          item.homeworkTitle.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [submissions, selectedClass, selectedSection, selectedSubject, statusFilter, searchQuery])

  // Stats
  const totalCount = submissions.length
  const evaluatedCount = submissions.filter(s => s.status === 'Evaluated').length
  const pendingCount = submissions.filter(s => s.status === 'Pending').length
  const rate = totalCount > 0 ? Math.round((evaluatedCount / totalCount) * 100) : 0

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/institute/homework"
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Remark Homework</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                Teacher Review Hub
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Review, evaluate, and provide feedback on submitted assignments.
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl">
          {(['All', 'Pending', 'Evaluated'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                statusFilter === tab
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Total Submissions</p>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Pending Remark</p>
            <h3 className="text-lg font-black text-amber-600">{pendingCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Evaluated Tasks</p>
            <h3 className="text-lg font-black text-emerald-600">{evaluatedCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Evaluation Rate</p>
            <h3 className="text-lg font-black text-teal-600">{rate}%</h3>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search by student, roll no, homework title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:border-teal-500 font-semibold bg-slate-50/50 dark:bg-slate-900"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold bg-white dark:bg-slate-900 outline-none"
          >
            <option value="">All Classes</option>
            {classesData.map((c: any) => (
              <option key={c.className} value={c.className}>{c.className}</option>
            ))}
          </select>

          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold bg-white dark:bg-slate-900 outline-none"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold bg-white dark:bg-slate-900 outline-none"
          >
            <option value="">All Subjects</option>
            {subjectsData.map((s: any) => {
              const name = typeof s === 'string' ? s : (s.subjectName || s.name)
              return <option key={name} value={name}>{name}</option>
            })}
          </select>
        </div>

        {(selectedClass || selectedSection || selectedSubject || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedClass('')
              setSelectedSection('')
              setSelectedSubject('')
              setSearchQuery('')
            }}
            className="text-xs text-red-500 hover:underline font-bold px-2 py-1"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xs">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="px-4 py-3.5 w-14">#</th>
                <th className="px-4 py-3.5 text-left">Student Details</th>
                <th className="px-4 py-3.5 text-left">Homework Assignment</th>
                <th className="px-4 py-3.5">Submission Time</th>
                <th className="px-4 py-3.5">Attachment</th>
                <th className="px-4 py-3.5">Grade</th>
                <th className="px-4 py-3.5 text-left">Teacher Remark</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
              {filteredSubmissions.map((sub, idx) => (
                <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 font-bold">{idx + 1}.</td>
                  <td className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-black text-xs">
                        {sub.studentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                          {sub.studentName}
                        </h4>
                        <p className="text-[10px] text-slate-400">Roll No: {sub.rollNo} • {sub.classes} ({sub.section})</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-left max-w-xs">
                    <h5 className="font-bold text-slate-700 dark:text-slate-200 truncate">{sub.homeworkTitle}</h5>
                    <span className="text-[10px] text-teal-600 font-semibold uppercase">{sub.subject}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">{sub.submittedAt}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => alert(`Opening ${sub.attachmentName}...`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-bold transition-colors"
                      title="Download Student Work"
                    >
                      <Download className="w-3 h-3" />
                      <span className="max-w-[80px] truncate">{sub.attachmentName}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {sub.grade ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-black text-xs border border-emerald-200 dark:border-emerald-800">
                        {sub.grade}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-left max-w-xs">
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate font-medium">
                      {sub.remarks || <span className="text-slate-300 italic">No feedback added yet</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                      sub.status === 'Evaluated'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}>
                      ● {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleOpenEvaluate(sub)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1 mx-auto"
                    >
                      <Award className="w-3 h-3" />
                      <span>{sub.status === 'Evaluated' ? 'Edit Remark' : 'Remark'}</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-bold">
                    No submitted assignments found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── REMARK / EVALUATION MODAL ─── */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Evaluate &amp; Remark
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeModalItem.studentName} ({activeModalItem.classes} {activeModalItem.section})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task Info Pill */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-black uppercase text-teal-600">{activeModalItem.subject}</span>
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">{activeModalItem.homeworkTitle}</h4>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 pt-1">
                <Download className="w-3 h-3 text-blue-500" />
                <span>Attachment: {activeModalItem.attachmentName}</span>
              </p>
            </div>

            <form onSubmit={handleSaveRemark} className="space-y-4">
              
              {/* Grade Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                  Select Grade *
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRADE_OPTIONS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setModalGrade(g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        modalGrade === g
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback / Remarks */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                  Teacher Feedback &amp; Remarks
                </label>
                <textarea
                  rows={4}
                  value={modalRemarks}
                  onChange={e => setModalRemarks(e.target.value)}
                  placeholder="e.g. Well done! Correct approach used in problem 3. Improve handwriting in conclusion."
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs outline-none focus:border-teal-500 font-medium"
                />
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Excellent Work! 🌟', 'Well explained', 'Good effort, check Q4', 'Incomplete work, resubmit'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setModalRemarks(prev => (prev ? `${prev} • ${s}` : s))}
                      className="text-[10.5px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Remark</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}

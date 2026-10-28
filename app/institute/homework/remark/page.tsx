'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { 
  CheckCircle2, Search, Calendar, FileText, Paperclip, Users, 
  ArrowLeft, Check, Clock, User, Filter, BookOpen, AlertCircle,
  GraduationCap, Download, ChevronRight, MessageSquare, Award,
  CheckSquare, Square, RefreshCw, Send, Sparkles, ChevronDown, Eye
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'
import { fetchStudents } from '@/app/institute/students/actions'
import { 
  fetchHomeworkTasks, 
  fetchTaskSubmissions, 
  updateStudentRemark, 
  updateStudentTaskSubmission,
  bulkUpdateStudentTaskSubmissions 
} from '@/app/institute/homework/assign/actions'

interface HomeworkTask {
  id: string
  title: string
  description: string
  subject: string
  classes: string
  section: string
  assignedBy: string
  assignDate: string
  submissionDate: string
  hasAttachment: boolean
  attachmentName?: string
  status: 'Active' | 'Closed'
}

interface StudentSubmissionItem {
  studentId: string
  name: string
  rollNo: string
  admissionNo: string
  avatar: string
  status: 'Submitted' | 'Pending'
  submittedAt?: string
  remark: string
  grade?: string
  isSaved?: boolean
}

// Fallback initial assignments
const DEFAULT_TASKS: HomeworkTask[] = [
  {
    id: 'hw-101',
    title: 'Chapter 4: Linear Equations Exercise 4.2',
    description: 'Solve questions 1 through 10 in notebook. Show all steps clearly.',
    subject: 'Mathematics',
    classes: 'Class 1',
    section: 'A',
    assignedBy: 'Ashok Kumar',
    assignDate: '22/10/2026',
    submissionDate: '25/10/2026',
    hasAttachment: true,
    attachmentName: 'Linear_Equations_WS4.pdf',
    status: 'Active'
  },
  {
    id: 'hw-102',
    title: 'Unit 2: Plant Cell Structure & Photosynthesis',
    description: 'Draw labeled diagram of plant cell and summarize light reactions.',
    subject: 'Science',
    classes: 'Class 1',
    section: 'A',
    assignedBy: 'Sunita Sharma',
    assignDate: '20/10/2026',
    submissionDate: '24/10/2026',
    hasAttachment: false,
    status: 'Active'
  }
]

export default function RemarkHomeworkPage() {
  const searchParams = useSearchParams()
  const initialTaskId = searchParams.get('taskId')

  // Registered students from DB
  const [allStudents, setAllStudents] = useState<any[]>([])

  // Homework Tasks
  const [tasks, setTasks] = useState<HomeworkTask[]>(DEFAULT_TASKS)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [loadingTasks, setLoadingTasks] = useState(true)

  // Submissions State for the currently selected task
  const [submissions, setSubmissions] = useState<Record<string, { status: 'Submitted' | 'Pending'; remark: string; submittedAt?: string }>>({})
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'Pending'>('All')
  const [searchStudent, setSearchStudent] = useState<string>('')

  // Multi-select for Bulk Remarks
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [bulkRemarkText, setBulkRemarkText] = useState('')
  const [bulkStatus, setBulkStatus] = useState<'Submitted' | 'Pending'>('Submitted')
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

  // Local editing states (studentId -> draft remark)
  const [draftRemarks, setDraftRemarks] = useState<Record<string, string>>({})
  const [savedFlags, setSavedFlags] = useState<Record<string, boolean>>({})

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Load registered students
  useEffect(() => {
    let isMounted = true
    const loadStudents = async () => {
      try {
        const res = await fetchStudents()
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setAllStudents(res.data)
        }
      } catch (e) {
        console.error('Failed to load students:', e)
      }
    }
    loadStudents()
    return () => { isMounted = false }
  }, [])

  // Load Tasks from DB
  useEffect(() => {
    let isMounted = true
    const loadTasks = async () => {
      setLoadingTasks(true)
      try {
        const res = await fetchHomeworkTasks()
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const list: HomeworkTask[] = res.data.map((t: any) => ({
            id: String(t.id),
            title: t.title,
            description: t.description || '',
            subject: t.subject,
            classes: t.classes,
            section: t.section,
            assignedBy: t.assignedBy || 'Faculty',
            assignDate: t.assignDate || '',
            submissionDate: t.submissionDate || '',
            hasAttachment: !!t.hasAttachment,
            attachmentName: t.attachmentName || undefined,
            status: (t.status === 'Closed' ? 'Closed' : 'Active') as 'Active' | 'Closed'
          }))
          if (isMounted) {
            setTasks(list)
            if (initialTaskId && list.some(t => t.id === initialTaskId)) {
              setSelectedTaskId(initialTaskId)
            } else if (!selectedTaskId && list.length > 0) {
              setSelectedTaskId(list[0].id)
            }
          }
        } else {
          // Check cached local tasks
          const cached = localStorage.getItem('school_homework_tasks')
          if (cached) {
            try {
              const parsed = JSON.parse(cached)
              if (Array.isArray(parsed) && parsed.length > 0) {
                if (isMounted) {
                  setTasks(parsed)
                  if (initialTaskId && parsed.some((t: any) => t.id === initialTaskId)) {
                    setSelectedTaskId(initialTaskId)
                  } else if (!selectedTaskId) {
                    setSelectedTaskId(parsed[0].id)
                  }
                  setLoadingTasks(false)
                  return
                }
              }
            } catch {}
          }
          if (isMounted) {
            setTasks(DEFAULT_TASKS)
            setSelectedTaskId(initialTaskId || DEFAULT_TASKS[0].id)
          }
        }
      } catch (err) {
        console.error('Error loading tasks:', err)
        if (isMounted) {
          setTasks(DEFAULT_TASKS)
          setSelectedTaskId(DEFAULT_TASKS[0].id)
        }
      } finally {
        if (isMounted) setLoadingTasks(false)
      }
    }
    loadTasks()
    return () => { isMounted = false }
  }, [initialTaskId])

  // Current active task
  const activeTask = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId) || tasks[0] || null
  }, [tasks, selectedTaskId])

  // Load Submissions for the selected task
  useEffect(() => {
    let isMounted = true
    if (!selectedTaskId) return

    const loadSubs = async () => {
      setLoadingSubmissions(true)
      try {
        const res = await fetchTaskSubmissions(selectedTaskId)
        if (isMounted && res && res.success && Array.isArray(res.data)) {
          const map: Record<string, { status: 'Submitted' | 'Pending'; remark: string; submittedAt?: string }> = {}
          const drafts: Record<string, string> = {}
          res.data.forEach((row: any) => {
            const sid = String(row.studentId)
            map[sid] = {
              status: row.status === 'Submitted' ? 'Submitted' : 'Pending',
              remark: row.remark || '',
              submittedAt: row.submittedAt || undefined
            }
            if (row.remark) drafts[sid] = row.remark
          })
          setSubmissions(map)
          setDraftRemarks(drafts)
        }
      } catch (e) {
        console.error('Failed to load submissions:', e)
      } finally {
        if (isMounted) setLoadingSubmissions(false)
      }
    }
    loadSubs()
    return () => { isMounted = false }
  }, [selectedTaskId])

  // Filter students for the active task's class & section
  const relevantStudents = useMemo<StudentSubmissionItem[]>(() => {
    if (!activeTask) return []

    // Match students by class & section
    const matching = allStudents.filter(st => {
      const clsMatch = !activeTask.classes || st.class?.toLowerCase() === activeTask.classes.toLowerCase() ||
        st.className?.toLowerCase() === activeTask.classes.toLowerCase()
      const secMatch = !activeTask.section || st.section?.toLowerCase() === activeTask.section.toLowerCase()
      return clsMatch && secMatch
    })

    // If no matching students in DB, provide fallback so teacher can still evaluate
    const baseList = matching.length > 0 ? matching : [
      { id: '101', name: 'Aarav Patel', rollNo: '01', admissionNo: 'ADM-2026-001', gender: 'Male' },
      { id: '102', name: 'Diya Sharma', rollNo: '02', admissionNo: 'ADM-2026-002', gender: 'Female' },
      { id: '103', name: 'Kabir Verma', rollNo: '03', admissionNo: 'ADM-2026-003', gender: 'Male' },
      { id: '104', name: 'Ananya Gupta', rollNo: '04', admissionNo: 'ADM-2026-004', gender: 'Female' }
    ]

    return baseList.map(st => {
      const sid = String(st.id || st.studentId)
      const sub = submissions[sid]
      const status: 'Submitted' | 'Pending' = sub ? sub.status : 'Pending'
      const remark = draftRemarks[sid] !== undefined ? draftRemarks[sid] : (sub?.remark || '')
      const avatar = st.avatar || (st.gender?.toLowerCase() === 'female' 
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces' 
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces')

      return {
        studentId: sid,
        name: st.name || st.studentName || 'Student',
        rollNo: st.rollNo || st.roll_no || '—',
        admissionNo: st.admissionNo || st.admission_no || '—',
        avatar,
        status,
        submittedAt: sub?.submittedAt,
        remark,
        isSaved: !!savedFlags[sid]
      }
    })
  }, [activeTask, allStudents, submissions, draftRemarks, savedFlags])

  // Search and Status filtered students
  const filteredStudents = useMemo(() => {
    return relevantStudents.filter(st => {
      if (statusFilter !== 'All' && st.status !== statusFilter) return false
      if (searchStudent.trim()) {
        const q = searchStudent.toLowerCase()
        const matchName = st.name.toLowerCase().includes(q)
        const matchRoll = st.rollNo.toLowerCase().includes(q)
        const matchAdm = st.admissionNo.toLowerCase().includes(q)
        if (!matchName && !matchRoll && !matchAdm) return false
      }
      return true
    })
  }, [relevantStudents, statusFilter, searchStudent])

  // Stats Counters
  const evaluationStats = useMemo(() => {
    const total = relevantStudents.length
    const submitted = relevantStudents.filter(s => s.status === 'Submitted').length
    const pending = total - submitted
    const withRemarks = relevantStudents.filter(s => s.remark.trim().length > 0).length
    const pct = total > 0 ? Math.round((submitted / total) * 100) : 0
    return { total, submitted, pending, withRemarks, pct }
  }, [relevantStudents])

  // Toggle single student status (Submitted <-> Pending)
  const handleToggleStatus = async (student: StudentSubmissionItem) => {
    if (!activeTask) return
    const newStatus: 'Submitted' | 'Pending' = student.status === 'Submitted' ? 'Pending' : 'Submitted'
    const sid = student.studentId

    // Optimistic UI update
    setSubmissions(prev => ({
      ...prev,
      [sid]: {
        ...prev[sid],
        status: newStatus,
        remark: student.remark
      }
    }))

    try {
      await updateStudentTaskSubmission(activeTask.id, sid, newStatus, {
        studentName: student.name,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo,
        remark: student.remark
      })
      showToast(`${student.name} marked as ${newStatus}`)
    } catch (e) {
      console.error('Failed to update status:', e)
    }
  }

  // Save single student remark
  const handleSaveRemark = async (student: StudentSubmissionItem) => {
    if (!activeTask) return
    const sid = student.studentId
    const currentText = draftRemarks[sid] || student.remark || ''

    try {
      await updateStudentRemark(activeTask.id, sid, currentText, student.status, {
        studentName: student.name,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo
      })

      setSubmissions(prev => ({
        ...prev,
        [sid]: {
          ...prev[sid],
          status: student.status,
          remark: currentText
        }
      }))

      // Flash saved indicator
      setSavedFlags(prev => ({ ...prev, [sid]: true }))
      setTimeout(() => {
        setSavedFlags(prev => ({ ...prev, [sid]: false }))
      }, 2000)

      showToast(`Remark saved for ${student.name}!`)
    } catch (err) {
      console.error('Failed to save remark:', err)
      alert('Failed to save remark.')
    }
  }

  // Quick chip remark filler
  const handleApplyQuickRemark = (studentId: string, chipText: string) => {
    setDraftRemarks(prev => ({
      ...prev,
      [studentId]: chipText
    }))
  }

  // Multi-select toggle
  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.studentId))
    }
  }

  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Handle Bulk Remark submission
  const handleBulkSubmit = async () => {
    if (!activeTask || selectedStudentIds.length === 0) return

    setIsBulkSubmitting(true)
    const selectedStudentsData = relevantStudents
      .filter(s => selectedStudentIds.includes(s.studentId))
      .map(s => ({
        studentId: s.studentId,
        studentName: s.name,
        admissionNo: s.admissionNo,
        rollNo: s.rollNo,
        remark: bulkRemarkText.trim() || undefined
      }))

    try {
      await bulkUpdateStudentTaskSubmissions(
        activeTask.id,
        selectedStudentsData,
        bulkStatus,
        bulkRemarkText.trim() || undefined
      )

      // Update state locally
      setSubmissions(prev => {
        const next = { ...prev }
        selectedStudentIds.forEach(sid => {
          next[sid] = {
            ...next[sid],
            status: bulkStatus,
            remark: bulkRemarkText.trim() || next[sid]?.remark || ''
          }
        })
        return next
      })

      if (bulkRemarkText.trim()) {
        setDraftRemarks(prev => {
          const next = { ...prev }
          selectedStudentIds.forEach(sid => {
            next[sid] = bulkRemarkText.trim()
          })
          return next
        })
      }

      showToast(`Updated ${selectedStudentIds.length} students successfully!`)
      setBulkModalOpen(false)
      setSelectedStudentIds([])
      setBulkRemarkText('')
    } catch (err) {
      console.error('Bulk update error:', err)
      alert('Failed to apply bulk remarks.')
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">

      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-xl transition-all animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb & Hub Quick Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/institute/homework" className="hover:text-teal-600 transition-colors">
              Homework
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-teal-700 font-bold">Remark Homework</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-200/60">
              <CheckCircle2 className="w-6 h-6" />
            </span>
            Remark Homework &amp; Evaluation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review student submissions, mark tasks as completed, and record evaluation remarks
          </p>
        </div>

        {/* Quick Nav Dropdown Pill Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/institute/homework/assign"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-teal-700 transition-colors"
          >
            Assign Homework
          </Link>
          <Link
            href="/institute/homework/remark"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-600 text-white shadow-sm"
          >
            Remark Homework
          </Link>
          <Link
            href="/institute/homework/pending-assign"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-teal-700 transition-colors"
          >
            Pending Assign
          </Link>
          <Link
            href="/institute/homework/pending-remark"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-teal-700 transition-colors"
          >
            Pending Remark
          </Link>
          <Link
            href="/institute/homework/report"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-teal-700 transition-colors"
          >
            Homework Report
          </Link>
        </div>
      </div>

      {/* Assignment Selection & Overview Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Assignment Dropdown Selector */}
          <div className="flex-1 min-w-[280px]">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Select Homework Assignment to Remark:</span>
              <span className="text-[11px] font-semibold text-teal-700">
                {tasks.length} {tasks.length === 1 ? 'assignment' : 'assignments'} found
              </span>
            </label>
            <div className="relative">
              <select
                value={selectedTaskId}
                onChange={e => setSelectedTaskId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer shadow-2xs"
              >
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title} • {t.classes} (Sec {t.section}) — {t.subject}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick link to Switch or Create Homework */}
          <div className="flex items-end gap-2 self-start lg:self-end">
            <Link
              href="/institute/homework/assign"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              Manage All Tasks
            </Link>
          </div>
        </div>

        {/* Selected Task Details Strip */}
        {activeTask && (
          <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                  {activeTask.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800">
                  {activeTask.classes} - Section {activeTask.section}
                </span>
                {activeTask.assignedBy && (
                  <span className="text-xs text-slate-500">
                    By: <strong className="text-slate-700">{activeTask.assignedBy}</strong>
                  </span>
                )}
              </div>
              {activeTask.description && (
                <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                  {activeTask.description}
                </p>
              )}
            </div>

            {/* Submission Progress Pill */}
            <div className="flex items-center gap-4 shrink-0 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Submissions</p>
                <p className="text-sm font-extrabold text-teal-700">
                  {evaluationStats.submitted} / {evaluationStats.total} ({evaluationStats.pct}%)
                </p>
              </div>
              <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-teal-600 h-full transition-all duration-300"
                  style={{ width: `${evaluationStats.pct}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bulk Action Floating Bar (When students are selected) */}
      {selectedStudentIds.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-extrabold text-xs border border-teal-500/30">
              {selectedStudentIds.length}
            </span>
            <div>
              <p className="text-xs font-bold text-white">
                {selectedStudentIds.length} Students Selected
              </p>
              <p className="text-[11px] text-slate-400">
                Apply remarks and evaluation status to all selected students at once
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setBulkStatus('Submitted')
                setBulkModalOpen(true)
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Bulk Mark Submitted &amp; Remark
            </button>
            <button
              type="button"
              onClick={() => {
                setBulkStatus('Pending')
                setBulkModalOpen(true)
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              Mark as Pending
            </button>
            <button
              type="button"
              onClick={() => setSelectedStudentIds([])}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Students Evaluation Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left: Select All & Search */}
          <div className="flex items-center gap-3 flex-1">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shrink-0 ${
                selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0
                  ? 'bg-teal-50 text-teal-800 border-teal-300'
                  : selectedStudentIds.length > 0
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Select all displayed students"
            >
              {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-teal-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({filteredStudents.length})</span>
            </button>

            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search student name, roll number..."
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Right: Status Tab Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'All'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({evaluationStats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Submitted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                statusFilter === 'Submitted'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-teal-700'
              }`}
            >
              <Check className="w-3 h-3 text-teal-600" />
              Submitted ({evaluationStats.submitted})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                statusFilter === 'Pending'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-500" />
              Pending ({evaluationStats.pending})
            </button>
          </div>
        </div>

        {/* Evaluation Table */}
        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">No students match filter criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing search or status filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-10 text-center"></th>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4 text-center">Submission Status</th>
                  <th className="py-3.5 px-4">Teacher Remark &amp; Feedback</th>
                  <th className="py-3.5 px-4 text-right w-28">Save Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.map((st, idx) => {
                  const isChecked = selectedStudentIds.includes(st.studentId)
                  const isSubmitted = st.status === 'Submitted'

                  return (
                    <tr 
                      key={st.studentId}
                      className={`hover:bg-slate-50/60 transition-colors ${isChecked ? 'bg-teal-50/20' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectStudent(st.studentId)}
                          className="p-1 rounded text-slate-300 hover:text-teal-600 transition-colors cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Index */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Student Profile Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">{st.name}</p>
                            <p className="text-[11px] text-slate-400">
                              Roll: <strong className="text-slate-600">{st.rollNo}</strong> • Adm: {st.admissionNo}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Toggleable Submission Status Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(st)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer ${
                            isSubmitted
                              ? 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                          title={`Click to mark as ${isSubmitted ? 'Pending' : 'Submitted'}`}
                        >
                          {isSubmitted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                              <span>Submitted</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Remark Input & Quick Chips */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Enter teacher feedback or remark..."
                            value={draftRemarks[st.studentId] !== undefined ? draftRemarks[st.studentId] : st.remark}
                            onChange={e => setDraftRemarks({ ...draftRemarks, [st.studentId]: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                handleSaveRemark(st)
                              }
                            }}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          />

                          {/* Quick Chips for rapid feedback */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-bold">Quick:</span>
                            {['Excellent! ⭐', 'Good Work 👍', 'Need Revision', 'Completed'].map(chip => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => handleApplyQuickRemark(st.studentId, chip)}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors cursor-pointer"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Save Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSaveRemark(st)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            st.isSaved
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-2xs'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{st.isSaved ? 'Saved!' : 'Save'}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: BULK EVALUATE & REMARK
          ========================================================================= */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4.5 bg-teal-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">Bulk Evaluate ({selectedStudentIds.length} Students)</h3>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Update Submission Status To:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBulkStatus('Submitted')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      bulkStatus === 'Submitted'
                        ? 'bg-teal-50 border-teal-500 text-teal-700 ring-2 ring-teal-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Submitted
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkStatus('Pending')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      bulkStatus === 'Pending'
                        ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    Pending
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Remark / Feedback for Selected Students:
                </label>
                <textarea
                  rows={3}
                  value={bulkRemarkText}
                  onChange={e => setBulkRemarkText(e.target.value)}
                  placeholder="e.g. Good performance on homework exercises. Checked and approved."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />

                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {['Well Done! ⭐', 'Checked & Approved', 'Complete Pending Tasks'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBulkRemarkText(t)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isBulkSubmitting}
                  onClick={handleBulkSubmit}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isBulkSubmitting ? 'Updating...' : 'Apply to Selected'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

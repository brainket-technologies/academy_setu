'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  ArrowLeft, ChevronLeft, ChevronRight, GraduationCap, Users, User,
  BookOpen, FileText, Paperclip, Calendar, Clock, Check, Plus,
  Search, Upload, X, Loader2, Sparkles, Send, AlertCircle,
  CheckCircle2, ChevronDown, Download, Trash2, Eye, RefreshCw,
  Filter, Layers, CheckSquare, Square, CalendarClock, Star,
  Award, MessageSquare, XCircle, CheckCircle, Edit3
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'
import { fetchStudents } from '@/app/institute/students/actions'
import { fetchTeachers } from '@/app/institute/teachers/actions'
import {
  fetchHomeworkTasks,
  fetchTaskSubmissions,
  updateStudentTaskSubmission,
  updateStudentRemark,
  bulkUpdateStudentTaskSubmissions,
  fetchRescheduledSubmissions,
  rescheduleHomeworkTask,
  deleteHomeworkTask
} from '@/app/institute/homework/assign/actions'

// ── 4 PAGES STEP SCREEN TYPES (Exact Match to User's 4 Screenshots) ──
// Page 1: 'dates'       -> Select Date (Grid of Missed Date cards with orange numbers & Month dropdown) [Screenshot 1]
// Page 2: 'classes'     -> Pending Remark Homework (Selected Date banner + Class/Section dropdowns + Class cards) [Screenshot 2]
// Page 3: 'tasks'       -> Select Task to Remark (Subject banner with Class & Year + Assigned Tasks list) [Screenshot 3]
// Page 4: 'evaluation'  -> Remark Homework (Class & Task banner + Search + Student cards with Quick actions & Ratings) [Screenshot 4]
type StepScreen = 'dates' | 'classes' | 'tasks' | 'evaluation'

interface PendingRemarkDateCard {
  id: string
  dayNumber: string // '08'
  dayName: string // 'Mon'
  monthName: string // 'July'
  monthShort: string // 'Jul'
  year: string // '2026'
  fullDate: string // '2026-07-08'
  displayBanner: string // '02 June 2026 (Mon)'
  assignFormat: string // '08 Jul 2026'
  hasRescheduled?: boolean
  rescheduledCount?: number
  pendingCount?: number
}

interface ClassCardItem {
  id: string
  className: string
  section: string
  classTeacher: string
  studentsCount: number
}

interface SubjectItem {
  id: string
  subjectName: string
  teacherName: string
  bgColor: string
  borderColor: string
  textColor: string
  badgeColor: string
}

interface HomeworkTaskItem {
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
  studentsCount?: number
}

interface StudentSubmissionItem {
  studentId: string
  name: string
  rollNo: string
  admissionNo: string
  avatar: string
  gender: 'Male' | 'Female'
  status: 'Completed' | 'Pending' | 'Rescheduled'
  submittedAt?: string
  remark: string
  rating: number // 1 to 5
  rescheduledDate?: string
  attachmentName?: string
}

// Pastel style rotation for subjects
const PASTEL_PALETTES = [
  { bgColor: 'bg-[#f0f9ff]', borderColor: 'border-sky-200/90', textColor: 'text-sky-950', badgeColor: 'bg-sky-100 text-sky-800' },
  { bgColor: 'bg-[#f0fdf4]', borderColor: 'border-emerald-200/90', textColor: 'text-emerald-950', badgeColor: 'bg-emerald-100 text-teal-800' },
  { bgColor: 'bg-[#fff1f2]', borderColor: 'border-rose-200/90', textColor: 'text-rose-950', badgeColor: 'bg-rose-100 text-rose-800' },
  { bgColor: 'bg-[#fefce8]', borderColor: 'border-amber-200/90', textColor: 'text-amber-950', badgeColor: 'bg-amber-100 text-amber-800' },
  { bgColor: 'bg-[#faf5ff]', borderColor: 'border-purple-200/90', textColor: 'text-purple-950', badgeColor: 'bg-purple-100 text-purple-800' },
  { bgColor: 'bg-[#fff7ed]', borderColor: 'border-orange-200/90', textColor: 'text-orange-950', badgeColor: 'bg-orange-100 text-orange-800' },
]

const DEFAULT_SUBJECTS = [
  { id: 'sub-1', subjectName: 'Mathematics', teacherName: 'Ashok Kumar' },
  { id: 'sub-2', subjectName: 'Science', teacherName: 'Sunita Sharma' },
  { id: 'sub-3', subjectName: 'English', teacherName: 'Priya Verma' },
  { id: 'sub-4', subjectName: 'Hindi', teacherName: 'Ramesh Chandra' },
  { id: 'sub-5', subjectName: 'Social Studies', teacherName: 'Vikas Gupta' },
  { id: 'sub-6', subjectName: 'Computer Science', teacherName: 'Neha Singh' },
]

const QUICK_REMARK_CHIPS = [
  { text: 'Completed assignment on time with neat presentation.', rating: 5 },
  { text: 'Good work, all problems solved correctly.', rating: 4 },
  { text: 'Submitted on time, minor corrections needed in questions.', rating: 3 },
  { text: 'Needs improvement in handwriting and calculation steps.', rating: 2 },
  { text: 'Incomplete assignment, please finish and resubmit.', rating: 1 }
]

// ── ROBUST DATE NORMALIZATION ──
function normalizeDateStr(dStr: string | undefined | null): string | null {
  if (!dStr) return null
  const trimmed = String(dStr).trim()
  if (!trimmed) return null

  // 1. YYYY-MM-DD
  const ymd = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (ymd) {
    const y = ymd[1]
    const m = ymd[2].padStart(2, '0')
    const d = ymd[3].padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // 2. DD-MM-YYYY or DD/MM/YYYY
  const dmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (dmy) {
    const d = dmy[1].padStart(2, '0')
    const m = dmy[2].padStart(2, '0')
    const y = dmy[3]
    return `${y}-${m}-${d}`
  }

  // 3. DD Mon YYYY (e.g. 31 Oct 2026 or 31-Oct-2026)
  const dMonY = trimmed.match(/^(\d{1,2})[\s-]+([A-Za-z]{3,9})[\s-]+(\d{4})$/)
  if (dMonY) {
    const d = dMonY[1].padStart(2, '0')
    const monStr = dMonY[2].toLowerCase()
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const mIdx = months.findIndex(m => monStr.startsWith(m))
    if (mIdx !== -1) {
      const m = String(mIdx + 1).padStart(2, '0')
      const y = dMonY[3]
      return `${y}-${m}-${d}`
    }
  }

  // 4. Date.parse
  const parsed = Date.parse(trimmed)
  if (!isNaN(parsed)) {
    const dt = new Date(parsed)
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const d = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  return null
}

// ── STUDENT & CLASS MATCHING ──
function parseStudentClassAndSection(student: any): { className: string; section: string } {
  if (!student) return { className: '', section: 'A' }

  let rawClass = String(student.class || student.className || student.current_class || '').trim()
  let rawSection = String(student.section || student.sectionName || student.section_name || student.current_section || '').trim()

  const rawCombined = String(student.class_name || student.classNameCombined || '').trim()
  if (rawCombined) {
    const parenMatch = rawCombined.match(/^([^(]+?)\s*\(([^)]+)\)$/)
    if (parenMatch) {
      if (!rawClass) rawClass = parenMatch[1].trim()
      if (!rawSection) rawSection = parenMatch[2].trim()
    } else {
      const dashMatch = rawCombined.match(/^(.+?)\s*[-–—]\s*(?:section\s+)?([a-z0-9]+)$/i)
      if (dashMatch) {
        if (!rawClass) rawClass = dashMatch[1].trim()
        if (!rawSection) rawSection = dashMatch[2].trim()
      } else if (!rawClass) {
        rawClass = rawCombined
      }
    }
  }

  if (rawClass) {
    const parenInClass = rawClass.match(/^([^(]+?)\s*\(([^)]+)\)$/)
    if (parenInClass) {
      rawClass = parenInClass[1].trim()
      if (!rawSection) rawSection = parenInClass[2].trim()
    }
    const dashInClass = rawClass.match(/^(.+?)\s*[-–—]\s*(?:section\s+)?([a-z0-9]+)$/i)
    if (dashInClass) {
      rawClass = dashInClass[1].trim()
      if (!rawSection) rawSection = dashInClass[2].trim()
    }
  }

  const cleanSection = rawSection
    .replace(/^section\s+/i, '')
    .replace(/^sec\s+/i, '')
    .replace(/[-_]/g, '')
    .trim()

  return {
    className: rawClass,
    section: cleanSection || 'A'
  }
}

function normalizeClassKey(raw: string): string {
  if (!raw) return ''
  let s = String(raw).toLowerCase().trim()
  s = s.replace(/\s*\([^)]*\)/g, '')
  s = s.replace(/[-–—]\s*(?:section\s+)?[a-z0-9]+$/i, '')
  s = s.replace(/^class\s+/i, '')
  s = s.replace(/^grade\s+/i, '')
  s = s.replace(/^std\s+/i, '')
  s = s.replace(/(st|nd|rd|th)$/i, '')
  s = s.replace(/\s+/g, ' ').trim()

  const romanMap: Record<string, string> = {
    'i': '1', 'ii': '2', 'iii': '3', 'iv': '4', 'v': '5',
    'vi': '6', 'vii': '7', 'viii': '8', 'ix': '9', 'x': '10',
    'xi': '11', 'xii': '12'
  }
  if (romanMap[s]) return romanMap[s]
  return s
}

function matchesClassAndSection(student: any, cardClassName: string, cardSection: string): boolean {
  if (!student) return false
  if (student.deleted || student.status === 'Deleted' || student.status === 'Dropped' || student.status === 'Passed') {
    return false
  }

  const { className: sClass, section: sSec } = parseStudentClassAndSection(student)
  const normCardClass = normalizeClassKey(cardClassName)
  const normStudentClass = normalizeClassKey(sClass)

  const classMatches =
    cardClassName.trim().toLowerCase() === sClass.trim().toLowerCase() ||
    (normCardClass !== '' && normStudentClass !== '' && normCardClass === normStudentClass)

  if (!classMatches) return false

  const normSec = (sec: string) =>
    String(sec || '')
      .toLowerCase()
      .replace(/^section\s+/i, '')
      .replace(/^sec\s+/i, '')
      .replace(/[-_\s]/g, '')
      .trim()

  const cardSecNorm = normSec(cardSection)
  const studentSecNorm = normSec(sSec)

  if (!cardSecNorm || cardSecNorm === 'all') return true
  if (studentSecNorm) return studentSecNorm === cardSecNorm
  return cardSecNorm === 'a' || cardSecNorm === ''
}

export default function PendingRemarkHomeworkPage() {
  const router = useRouter()

  // ── 4-PAGE ACTIVE SCREEN FLOW ──
  const [currentScreen, setCurrentScreen] = useState<StepScreen>('dates')

  // Selected State
  const [selectedDateItem, setSelectedDateItem] = useState<PendingRemarkDateCard | null>(null)
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [activeTask, setActiveTask] = useState<HomeworkTaskItem | null>(null)

  // Masters Data
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  // Real Database & Local Data
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [allTeachers, setAllTeachers] = useState<any[]>([])
  const [tasks, setTasks] = useState<HomeworkTaskItem[]>([])
  const [rescheduledSubmissions, setRescheduledSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Screen 1: Month Filter (e.g. 'Jul 2026', 'All Missed')
  const [monthFilter, setMonthFilter] = useState<string>('All')

  // Screen 2: Class & Section Filters
  const [filterClass, setFilterClass] = useState<string>('All')
  const [filterSection, setFilterSection] = useState<string>('All')

  // Screen 4: Student Evaluation State
  const [studentSearch, setStudentSearch] = useState('')
  const [studentStatusFilter, setStudentStatusFilter] = useState<'All' | 'Completed' | 'Not Completed' | 'Rescheduled'>('All')
  const [submissions, setSubmissions] = useState<Record<string, StudentSubmissionItem>>({})

  // Modal 1: Complete Modal (Screenshot 3)
  const [completeModalStudent, setCompleteModalStudent] = useState<StudentSubmissionItem | null>(null)
  const [completeRating, setCompleteRating] = useState<number>(5)
  const [completeReview, setCompleteReview] = useState<string>('')
  const [completeFileName, setCompleteFileName] = useState<string>('')
  const completeFileInputRef = useRef<HTMLInputElement | null>(null)

  // Modal 2: Not Complete Modal (Screenshot 4)
  const [notCompleteModalStudent, setNotCompleteModalStudent] = useState<StudentSubmissionItem | null>(null)
  const [notCompleteRemark, setNotCompleteRemark] = useState<string>('')
  const [notCompleteFileName, setNotCompleteFileName] = useState<string>('')
  const notCompleteFileInputRef = useRef<HTMLInputElement | null>(null)

  // Modal 3: Reschedule Modal (Screenshot 2)
  const [rescheduleModalStudent, setRescheduleModalStudent] = useState<StudentSubmissionItem | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState<string>('')
  const [rescheduleDescription, setRescheduleDescription] = useState<string>('')

  // Modal 4: Bulk Action Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [bulkSelectedStudentIds, setBulkSelectedStudentIds] = useState<string[]>([])
  const [bulkActionMode, setBulkActionMode] = useState<'Complete' | 'Not Complete' | 'Reschedule'>('Complete')
  const [bulkRating, setBulkRating] = useState<number>(5)
  const [bulkReview, setBulkReview] = useState<string>('')
  const [bulkRemark, setBulkRemark] = useState<string>('')
  const [bulkRescheduleDate, setBulkRescheduleDate] = useState<string>('')
  const [bulkRescheduleDescription, setBulkRescheduleDescription] = useState<string>('')
  const [bulkFileName, setBulkFileName] = useState<string>('')
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null)
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)
  const [isSavingModal, setIsSavingModal] = useState(false)

  // Toast State
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({
    open: false,
    msg: '',
    type: 'success'
  })
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ open: true, msg, type })
    setTimeout(() => setToast(p => ({ ...p, open: false })), 3500)
  }

  // ── JUMP TO ANY CUSTOM PENDING REMARK DATE (Screen 1) ──
  // ── DYNAMIC DATE SWITCHER (Prev/Next/Picker/Today accessible on Screens 2, 3, and 4) ──
  const handleSwitchDate = (newDateVal: string | Date) => {
    let dt: Date
    if (typeof newDateVal === 'string') {
      const parts = newDateVal.split('-').map(Number)
      if (parts.length === 3) {
        dt = new Date(parts[0], parts[1] - 1, parts[2])
      } else {
        dt = new Date(newDateVal)
      }
    } else {
      dt = newDateVal
    }
    if (isNaN(dt.getTime())) return

    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    const isoStr = `${yyyy}-${mm}-${dd}`
    const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' })
    const monthName = dt.toLocaleDateString('en-US', { month: 'long' })
    const monthShort = dt.toLocaleDateString('en-US', { month: 'short' })

    const now = new Date()
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    if (isoStr >= todayIso) {
      showToast('Today and future dates cannot be selected in Pending Remark. Please select a past pending date.', 'error')
      return
    }

    const existingCard = pendingRemarkDates.find(d => d.fullDate === isoStr)
    const newCard: PendingRemarkDateCard = existingCard || {
      id: `pending-remark-${isoStr}`,
      dayNumber: dd,
      dayName,
      monthName,
      monthShort,
      year: String(yyyy),
      fullDate: isoStr,
      displayBanner: `${dd} ${monthName} ${yyyy} (${dayName})`,
      assignFormat: `${dd} ${monthShort} ${yyyy}`,
      pendingCount: 0,
      rescheduledCount: 0
    }
    setSelectedDateItem(newCard)

    // If currently on evaluation screen, sync active task or return to tasks screen
    if (currentScreen === 'evaluation' && activeTask) {
      const matchOnNewDate = tasks.find(t =>
        matchesClassAndSection({ class: t.classes, section: t.section }, selectedClass, selectedSection) &&
        (t.subject || '').trim().toLowerCase() === (selectedSubject || '').trim().toLowerCase() &&
        normalizeDateStr(t.submissionDate) === isoStr
      )
      if (matchOnNewDate) {
        setActiveTask(matchOnNewDate)
        loadTaskSubmissions(matchOnNewDate)
      } else {
        setCurrentScreen('tasks')
      }
    }
  }

  const handlePickCustomDate = (dateIsoStr: string) => {
    if (!dateIsoStr) return
    const now = new Date()
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    if (dateIsoStr >= todayIso) {
      showToast('Today and future dates cannot be selected in Pending Remark. Please select a past pending date.', 'error')
      return
    }
    handleSwitchDate(dateIsoStr)
    setCurrentScreen('classes')
  }

  // ── RESCHEDULE TASK STATE & HANDLERS (Screen 3) ──
  const [rescheduleTaskModal, setRescheduleTaskModal] = useState<HomeworkTaskItem | null>(null)
  const [newTaskAssignDate, setNewTaskAssignDate] = useState<string>('')
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('')
  const [taskRescheduleReason, setTaskRescheduleReason] = useState<string>('')
  const [isReschedulingTask, setIsReschedulingTask] = useState<boolean>(false)

  const handleOpenRescheduleTaskModal = (task: HomeworkTaskItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setRescheduleTaskModal(task)
    const taskIso = normalizeDateStr(task.assignDate) || new Date().toISOString().split('T')[0]
    const dueIso = normalizeDateStr(task.submissionDate) || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
    setNewTaskAssignDate(taskIso)
    setNewTaskDueDate(dueIso)
    setTaskRescheduleReason('')
  }

  const handleSaveRescheduleTask = async () => {
    if (!rescheduleTaskModal) return
    if (!newTaskAssignDate || !newTaskDueDate) {
      showToast('Please select valid assign and due dates', 'error')
      return
    }

    setIsReschedulingTask(true)
    try {
      const [ay, am, ad] = newTaskAssignDate.split('-').map(Number)
      const assignDt = new Date(ay, am - 1, ad)
      const formattedAssign = assignDt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

      const [dy, dm, dd] = newTaskDueDate.split('-').map(Number)
      const dueDt = new Date(dy, dm - 1, dd)
      const formattedDue = dueDt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

      const res = await rescheduleHomeworkTask(
        rescheduleTaskModal.id,
        formattedAssign,
        formattedDue,
        taskRescheduleReason.trim()
      )
      if (res && res.success === false) {
        showToast(res.error || 'Failed to reschedule task', 'error')
        return
      }

      const updated = tasks.map(t => {
        if (t.id === rescheduleTaskModal.id) {
          return {
            ...t,
            assignDate: formattedAssign,
            submissionDate: formattedDue,
            description: taskRescheduleReason.trim()
              ? `${t.description} (Rescheduled: ${taskRescheduleReason.trim()})`
              : t.description
          }
        }
        return t
      })
      setTasks(updated)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
        } catch (e) {}
      }

      showToast(`Task rescheduled to ${formattedDue} successfully!`, 'success')
      setRescheduleTaskModal(null)
    } catch (err: any) {
      showToast(err.message || 'Failed to reschedule task', 'error')
    } finally {
      setIsReschedulingTask(false)
    }
  }

  const handleDeleteTask = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm('Are you sure you want to delete this homework task?')) return

    try {
      await deleteHomeworkTask(id)
      const updated = tasks.filter(t => t.id !== id)
      setTasks(updated)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
        } catch (e) {}
      }
      showToast('Homework task deleted successfully', 'success')
      if (activeTask?.id === id) setActiveTask(null)
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error')
    }
  }

  // ── LOAD REAL STUDENTS, TEACHERS, & HOMEWORK TASKS ──
  const loadData = async () => {
    setLoading(true)
    try {
      const parseLocal = (k: string) => {
        if (typeof window === 'undefined') return []
        try {
          const raw = localStorage.getItem(k)
          return raw ? JSON.parse(raw) : []
        } catch { return [] }
      }

      // Read real students from recognized localStorage registries (excluding drafts & fee records)
      const l1 = parseLocal('school_students')
      const l2 = parseLocal('school_institute_students')
      const l3 = parseLocal('students')
      const localCombined = [...l1, ...l2, ...l3].filter((s: any) =>
        s &&
        s.status !== 'draft' &&
        !String(s.id || '').toUpperCase().startsWith('DRAFT') &&
        !String(s.admission_no || s.admissionNo || '').toUpperCase().startsWith('DRAFT') &&
        !s.feeReceiptNo
      )

      const uniqueLocalMap = new Map<string, any>()
      localCombined.forEach((item: any, idx: number) => {
        if (!item) return
        const key = String(item.id || item.admission_no || item.admissionNo || item.roll_no || `stu-local-${idx}`)
        if (!uniqueLocalMap.has(key)) {
          uniqueLocalMap.set(key, item)
        } else {
          const existing = uniqueLocalMap.get(key)
          uniqueLocalMap.set(key, { ...item, ...existing })
        }
      })
      const deduplicatedLocal = Array.from(uniqueLocalMap.values())

      const normalizeStudent = (s: any, idx: number) => {
        const { className: parsedClass, section: parsedSection } = parseStudentClassAndSection(s)
        const firstName = s.first_name || s.firstName || ''
        const lastName = s.last_name || s.lastName || ''
        const fullName = `${firstName} ${lastName}`.trim() || s.name || `Student ${idx + 1}`
        const rollNo = String(s.roll_no || s.rollNo || s.roll || idx + 1)
        const admissionNo = String(s.admission_no || s.admissionNo || s.admissionNumber || `ADM-${1000 + idx}`)
        const photo = s.avatar || s.photo || s.image || ''
        const id = String(s.id || admissionNo || `stu-${idx}`)
        const gender: 'Male' | 'Female' = (s.gender && s.gender.toLowerCase().startsWith('f')) ? 'Female' : 'Male'

        return {
          ...s,
          id,
          name: fullName,
          rollNo,
          admissionNo,
          photo,
          gender,
          className: parsedClass,
          section: parsedSection
        }
      }

      let combinedStuds: any[] = []
      const [stdRes, tchRes, taskRes, reschedRes] = await Promise.all([
        fetchStudents(),
        fetchTeachers(),
        fetchHomeworkTasks(),
        fetchRescheduledSubmissions()
      ])

      if (stdRes?.success && Array.isArray(stdRes.data) && stdRes.data.length > 0) {
        const dbStuds = stdRes.data.map((s: any, idx: number) => {
          const loc = uniqueLocalMap.get(String(s.id)) ||
                      uniqueLocalMap.get(String(s.admission_no)) ||
                      uniqueLocalMap.get(String(s.roll_no)) || {}
          return normalizeStudent({
            ...loc,
            ...s,
            class_name: loc.class_name || loc.className || loc.class || s.class_name || '',
            section_name: loc.section_name || loc.section || s.section_name || ''
          }, idx)
        })
        const dbIds = new Set(dbStuds.map(s => String(s.id)))
        const dbAdm = new Set(dbStuds.map(s => String(s.admissionNo)))
        const remainingLocal = deduplicatedLocal
          .filter((s: any) =>
            !dbIds.has(String(s.id)) &&
            !dbAdm.has(String(s.admission_no || s.admissionNo)) &&
            s.status !== 'draft' &&
            !String(s.id || '').toUpperCase().startsWith('DRAFT') &&
            !String(s.admission_no || s.admissionNo || '').toUpperCase().startsWith('DRAFT') &&
            !s.feeReceiptNo
          )
          .map((s: any, idx: number) => normalizeStudent(s, dbStuds.length + idx))
        combinedStuds = [...dbStuds, ...remainingLocal]
      } else if (deduplicatedLocal.length > 0) {
        combinedStuds = deduplicatedLocal.map((s: any, idx: number) => normalizeStudent(s, idx))
      }
      setAllStudents(combinedStuds)

      // Real Teachers
      const localTeachers = parseLocal('school_teachers')
      let combinedTeachers: any[] = []
      if (tchRes?.success && Array.isArray(tchRes.data) && tchRes.data.length > 0) {
        combinedTeachers = tchRes.data
      } else if (localTeachers.length > 0) {
        combinedTeachers = localTeachers
      }
      setAllTeachers(combinedTeachers)

      // Real Homework Tasks
      let loadedTasks: HomeworkTaskItem[] = []
      if (taskRes?.success && Array.isArray(taskRes.data) && taskRes.data.length > 0) {
        loadedTasks = taskRes.data.map((t: any) => ({
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
          status: (t.status === 'Closed' ? 'Closed' : 'Active') as 'Active' | 'Closed',
          studentsCount: combinedStuds.filter(s => matchesClassAndSection(s, t.classes, t.section)).length
        }))
      } else {
        const rawTasks = parseLocal('school_homework_tasks')
        if (Array.isArray(rawTasks) && rawTasks.length > 0) {
          loadedTasks = rawTasks.map((t: any) => ({
            ...t,
            studentsCount: combinedStuds.filter(s => matchesClassAndSection(s, t.classes, t.section)).length
          }))
        }
      }
      // Discard dummy fallback tasks
      loadedTasks = loadedTasks.filter(t => !String(t.id).startsWith('task-default-'))
      setTasks(loadedTasks)

      // Load Rescheduled Submissions from DB and localStorage
      let localResched: any[] = []
      try {
        const raw = localStorage.getItem('school_rescheduled_remarks')
        if (raw) localResched = JSON.parse(raw)
      } catch {}

      let combinedResched: any[] = []
      if (reschedRes?.success && Array.isArray(reschedRes.data)) {
        combinedResched = [...reschedRes.data]
      }
      localResched.forEach(lr => {
        if (!combinedResched.some(cr => cr.taskId === lr.taskId && cr.studentId === lr.studentId)) {
          combinedResched.push(lr)
        }
      })

      // Also scan all localStorage keys for school_task_subs_* to catch any rescheduled students
      if (typeof window !== 'undefined') {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('school_task_subs_')) {
              const taskId = key.replace('school_task_subs_', '')
              if (taskId.startsWith('task-default-')) continue
              const val = localStorage.getItem(key)
              if (val) {
                const arr = JSON.parse(val)
                if (Array.isArray(arr)) {
                  const tObj = loadedTasks.find(t => t.id === taskId)
                  arr.forEach((item: any) => {
                    if (item.status === 'Rescheduled' && item.rescheduledDate) {
                      const stId = String(item.studentId || item.id)
                      if (!combinedResched.some(cr => cr.taskId === taskId && cr.studentId === stId)) {
                        combinedResched.push({
                          id: `resched-${taskId}-${stId}`,
                          taskId,
                          taskTitle: tObj?.title || 'Homework',
                          taskDescription: tObj?.description || '',
                          subject: tObj?.subject || item.subject || 'Subject',
                          classes: tObj?.classes || item.className || 'Class 1',
                          section: tObj?.section || item.section || 'A',
                          assignDate: tObj?.assignDate || '',
                          submissionDate: tObj?.submissionDate || '',
                          studentId: stId,
                          studentName: item.name || 'Student',
                          admissionNo: item.admissionNo || '',
                          rollNo: item.rollNo || '01',
                          rescheduledDate: item.rescheduledDate,
                          description: item.remark || 'Rescheduled homework evaluation.',
                          status: 'Rescheduled'
                        })
                      }
                    }
                  })
                }
              }
            }
          }
        } catch (e) {}
      }

      // STRICT VALIDATION: Filter out phantom, deleted, or dummy entries
      const validStudentIds = new Set(combinedStuds.map(s => String(s.id)))
      const validStudentAdms = new Set(combinedStuds.map(s => String(s.admissionNo || '').toLowerCase()))
      
      const sanitizedResched = combinedResched.filter(sub => {
        const tid = String(sub.taskId || '')
        if (tid.startsWith('task-default-')) return false
        const rDate = sub.rescheduledDate || sub.rescheduled_date
        if (!rDate) return false
        if (sub.status === 'Completed' || sub.status === 'Submitted') return false
        if (combinedStuds.length > 0) {
          const sid = String(sub.studentId || '')
          const adm = String(sub.admissionNo || '').toLowerCase()
          const exists = validStudentIds.has(sid) || (adm && validStudentAdms.has(adm))
          if (!exists) return false
        }
        return true
      })

      // Deduplicate by taskId + studentId
      const uniqueReschedMap = new Map<string, any>()
      sanitizedResched.forEach(sub => {
        const key = `${sub.taskId}-${sub.studentId}`
        uniqueReschedMap.set(key, sub)
      })

      const finalResched = Array.from(uniqueReschedMap.values())
      setRescheduledSubmissions(finalResched)

      // Clean up local cache
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_rescheduled_remarks', JSON.stringify(finalResched))
        } catch {}
      }

    } catch (err) {
      console.error('Error loading homework data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ── BUILD REAL CLASS CARDS ──
  const classCards = useMemo<ClassCardItem[]>(() => {
    const list: ClassCardItem[] = []
    const parseLocal = (k: string) => {
      if (typeof window === 'undefined') return []
      try {
        const raw = localStorage.getItem(k)
        return raw ? JSON.parse(raw) : []
      } catch { return [] }
    }

    const rawClasses = parseLocal('school_masters_classes')
    const mergedClasses = Array.isArray(classesData) && classesData.length > 0 ? classesData : rawClasses

    if (Array.isArray(mergedClasses) && mergedClasses.length > 0) {
      mergedClasses.forEach((c: any) => {
        if (c.deleted) return
        const cName = c.className || c.name || ''
        if (!cName) return
        const sections = Array.isArray(c.sections) && c.sections.length > 0
          ? c.sections.map((s: any) => (typeof s === 'string' ? s : s?.sectionName || 'A'))
          : ['A']

        sections.forEach((sec: string) => {
          const matchedStudents = allStudents.filter(s => matchesClassAndSection(s, cName, sec))
          const matchedCount = matchedStudents.length
          const masterCount = Number(c.totalStudents ?? c.studentsCount ?? c.total_students ?? 0)
          const studentCount = matchedCount > 0 ? matchedCount : masterCount

          const teacher = c.classTeacher || c.class_teacher || allTeachers.find((t: any) => {
            const tClass = String(t.class_teacher || t.className || t.class || '').toLowerCase()
            return tClass.includes(cName.toLowerCase())
          })?.name || 'Not Assigned'

          list.push({
            id: `${cName}-${sec}`,
            className: cName,
            section: sec,
            classTeacher: teacher,
            studentsCount: studentCount
          })
        })
      })
    }

    if (list.length === 0 && allStudents.length > 0) {
      const classSecMap = new Map<string, { className: string; section: string; count: number }>()
      allStudents.forEach(st => {
        const { className: cn, section: sn } = parseStudentClassAndSection(st)
        const effectiveClass = cn || 'Class 1'
        const effectiveSec = sn || 'A'
        const key = `${effectiveClass}-${effectiveSec}`
        if (!classSecMap.has(key)) {
          classSecMap.set(key, { className: effectiveClass, section: effectiveSec, count: 0 })
        }
        classSecMap.get(key)!.count++
      })

      classSecMap.forEach(item => {
        list.push({
          id: `${item.className}-${item.section}`,
          className: item.className,
          section: item.section,
          classTeacher: 'Not Assigned',
          studentsCount: item.count
        })
      })
    }

    return list
  }, [classesData, allStudents, allTeachers])

  // ── GENERATE PENDING REMARK DATES (ORANGE NUMBERS AS IN SCREENSHOT 1 - TODAY STRICTLY EXCLUDED) ──
  // Scan dates with assigned homework tasks where remarks/evaluations are pending
  const pendingRemarkDates = useMemo<PendingRemarkDateCard[]>(() => {
    const dateMap = new Map<string, PendingRemarkDateCard>()
    const today = new Date()
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    // 1. Gather all dates from actual assigned homework tasks (STRICTLY EXCLUDE TODAY AND FUTURE DATES)
    tasks.forEach(task => {
      const norm = normalizeDateStr(task.submissionDate) || normalizeDateStr(task.assignDate)
      if (!norm || norm >= todayIso) return

      if (!dateMap.has(norm)) {
        const parts = norm.split('-')
        const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        const dd = String(dt.getDate()).padStart(2, '0')
        const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' })
        const monthName = dt.toLocaleDateString('en-US', { month: 'long' })
        const monthShort = dt.toLocaleDateString('en-US', { month: 'short' })
        const year = String(dt.getFullYear())

        dateMap.set(norm, {
          id: `pending-remark-${norm}`,
          dayNumber: dd,
          dayName,
          monthName,
          monthShort,
          year,
          fullDate: norm,
          displayBanner: `${dd} ${monthName} ${year} (${dayName})`,
          assignFormat: `${dd} ${monthShort} ${year}`
        })
      }
    })

    // 2. Gather all rescheduled dates from sanitized rescheduledSubmissions (STRICTLY EXCLUDE TODAY AND FUTURE DATES)
    rescheduledSubmissions.forEach(sub => {
      if (sub.status === 'Completed' || sub.status === 'Submitted') return
      const rawDate = sub.rescheduledDate || sub.rescheduled_date
      const norm = normalizeDateStr(rawDate)
      if (!norm || norm >= todayIso) return

      if (!dateMap.has(norm)) {
        const parts = norm.split('-')
        const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        const dd = String(dt.getDate()).padStart(2, '0')
        const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' })
        const monthName = dt.toLocaleDateString('en-US', { month: 'long' })
        const monthShort = dt.toLocaleDateString('en-US', { month: 'short' })
        const year = String(dt.getFullYear())

        dateMap.set(norm, {
          id: `pending-remark-${norm}`,
          dayNumber: dd,
          dayName,
          monthName,
          monthShort,
          year,
          fullDate: norm,
          displayBanner: `${dd} ${monthName} ${year} (${dayName})`,
          assignFormat: `${dd} ${monthShort} ${year}`
        })
      }
    })

    // 3. Populate past working academic dates (skipping Sundays and strictly starting from yesterday i = 1)
    for (let i = 1; i <= 60; i++) {
      const d = new Date(today.getTime() - i * 86400000)
      if (d.getDay() === 0) continue

      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const isoStr = `${yyyy}-${mm}-${dd}`
      if (isoStr >= todayIso) continue

      if (!dateMap.has(isoStr)) {
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
        const monthName = d.toLocaleDateString('en-US', { month: 'long' })
        const monthShort = d.toLocaleDateString('en-US', { month: 'short' })

        dateMap.set(isoStr, {
          id: `pending-remark-${isoStr}`,
          dayNumber: dd,
          dayName,
          monthName,
          monthShort,
          year: String(yyyy),
          fullDate: isoStr,
          displayBanner: `${dd} ${monthName} ${yyyy} (${dayName})`,
          assignFormat: `${dd} ${monthShort} ${yyyy}`
        })
      }
    }

    // 4. ACCURATELY COMPUTE COUNTS PER DATE (UNIQUE REAL STUDENTS ONLY)
    dateMap.forEach((card, dateKey) => {
      // Set of unique real student IDs rescheduled to this date
      const reschedStudents = new Set<string>()
      rescheduledSubmissions.forEach(sub => {
        if (sub.status === 'Completed' || sub.status === 'Submitted') return
        const rNorm = normalizeDateStr(sub.rescheduledDate || sub.rescheduled_date)
        if (rNorm === dateKey) {
          const sid = String(sub.studentId || '')
          if (sid) reschedStudents.add(sid)
        }
      })

      // Set of unique real student IDs with regular pending tasks due on this date
      const regularPendingStudents = new Set<string>()
      tasks.forEach(t => {
        const dueNorm = normalizeDateStr(t.submissionDate)
        if (dueNorm === dateKey) {
          const enrolled = allStudents.filter(s => matchesClassAndSection(s, t.classes, t.section))
          enrolled.forEach(st => {
            const sid = String(st.id)
            // 1. If student was rescheduled to another date for this task, do not count on original date
            const isRescheduledAway = rescheduledSubmissions.some(sub =>
              sub.taskId === t.id &&
              String(sub.studentId) === sid &&
              sub.status !== 'Completed'
            )
            if (isRescheduledAway) return

            // 2. If student is already rescheduled to this date, tracked in reschedStudents
            if (reschedStudents.has(sid)) return

            // 3. If student already completed this task evaluation, do not count
            try {
              if (typeof window !== 'undefined') {
                const cachedSubs = localStorage.getItem(`school_task_subs_${t.id}`)
                if (cachedSubs) {
                  const arr = JSON.parse(cachedSubs)
                  const mySub = arr.find((item: any) => String(item.studentId || item.id) === sid)
                  if (mySub && (mySub.status === 'Completed' || mySub.status === 'Submitted')) {
                    return
                  }
                }
              }
            } catch {}

            regularPendingStudents.add(sid)
          })
        }
      })

      if (reschedStudents.size > 0) {
        card.hasRescheduled = true
        card.rescheduledCount = reschedStudents.size
      } else {
        card.hasRescheduled = false
        card.rescheduledCount = 0
      }

      card.pendingCount = regularPendingStudents.size
    })

    return Array.from(dateMap.values()).sort((a, b) => {
      const aHas = (a.rescheduledCount || 0) > 0 || (a.pendingCount || 0) > 0
      const bHas = (b.rescheduledCount || 0) > 0 || (b.pendingCount || 0) > 0
      if (aHas && !bHas) return -1
      if (!aHas && bHas) return 1
      return b.fullDate.localeCompare(a.fullDate)
    })
  }, [tasks, rescheduledSubmissions, allStudents])

  // Available Month-Year tags for Screenshot 1 Month dropdown
  const availableMonthYears = useMemo(() => {
    const s = new Set<string>()
    pendingRemarkDates.forEach(d => s.add(`${d.monthShort} ${d.year}`))
    return Array.from(s)
  }, [pendingRemarkDates])

  const filteredDates = useMemo(() => {
    if (monthFilter === 'All') return pendingRemarkDates
    return pendingRemarkDates.filter(d => `${d.monthShort} ${d.year}`.toLowerCase() === monthFilter.toLowerCase())
  }, [pendingRemarkDates, monthFilter])

  // ── FILTERED CLASSES FOR SCREEN 2 ──
  const filteredClasses = useMemo(() => {
    return classCards.filter(cls => {
      if (filterClass !== 'All' && cls.className.toLowerCase() !== filterClass.toLowerCase()) return false
      if (filterSection !== 'All' && cls.section.toLowerCase() !== filterSection.toLowerCase()) return false
      return true
    })
  }, [classCards, filterClass, filterSection])

  const uniqueClassNames = useMemo(() => {
    const s = new Set<string>()
    classCards.forEach(c => s.add(c.className))
    return Array.from(s)
  }, [classCards])

  const uniqueSectionNames = useMemo(() => {
    const s = new Set<string>()
    classCards.forEach(c => s.add(c.section))
    return Array.from(s).sort()
  }, [classCards])

  // ── SUBJECTS & TASKS FOR SELECTED CLASS (Screen 3) ──
  // Get active subjects for the selected class
  const classSubjects = useMemo<string[]>(() => {
    if (!selectedClass) return ['Mathematics']
    const parseLocal = (k: string) => {
      if (typeof window === 'undefined') return []
      try {
        const raw = localStorage.getItem(k)
        return raw ? JSON.parse(raw) : []
      } catch { return [] }
    }
    const rawSubs = parseLocal('school_masters_subjects')
    const merged = Array.isArray(subjectsData) && subjectsData.length > 0 ? subjectsData : rawSubs
    const list = merged
      .filter((s: any) => !s.deleted && (
        !s.className ||
        s.className.toLowerCase() === selectedClass.toLowerCase() ||
        normalizeClassKey(s.className) === normalizeClassKey(selectedClass)
      ))
      .map((s: any) => s.subjectName || s.name || 'Subject')

    // Add any subject from rescheduled submissions for this class
    rescheduledSubmissions.forEach(sub => {
      if (normalizeClassKey(sub.classes) === normalizeClassKey(selectedClass)) {
        if (sub.subject && !list.includes(sub.subject)) list.push(sub.subject)
      }
    })

    return list.length > 0 ? Array.from(new Set(list)) : ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science']
  }, [selectedClass, subjectsData, rescheduledSubmissions])

  // Set default subject when entering Screen 3:
  // If selectedDateItem has rescheduled submissions, prefer the subject of those rescheduled submissions!
  useEffect(() => {
    if (!selectedClass) return
    const reschedForDate = rescheduledSubmissions.find(sub => {
      const dateMatch = !selectedDateItem?.fullDate || normalizeDateStr(sub.rescheduledDate || sub.rescheduled_date) === selectedDateItem.fullDate
      const classMatch = normalizeClassKey(sub.classes || '') === normalizeClassKey(selectedClass)
      return dateMatch && classMatch && sub.status !== 'Completed' && sub.subject
    })

    if (reschedForDate?.subject) {
      setSelectedSubject(reschedForDate.subject)
    } else if (classSubjects.length > 0 && (!selectedSubject || !classSubjects.includes(selectedSubject))) {
      setSelectedSubject(classSubjects[0])
    }
  }, [classSubjects, selectedSubject, selectedDateItem, selectedClass, rescheduledSubmissions])

  // Tasks for the selected class, section & subject
  const currentSubjectTasks = useMemo<HomeworkTaskItem[]>(() => {
    if (!selectedClass) return []
    const normC = normalizeClassKey(selectedClass)
    const normS = String(selectedSection || '').toLowerCase().replace(/[-_\s]/g, '')
    const normSub = (selectedSubject || '').trim().toLowerCase()

    const matching: HomeworkTaskItem[] = []

    tasks.forEach(t => {
      const tClassNorm = normalizeClassKey(t.classes)
      const tSecNorm = String(t.section || '').toLowerCase().replace(/[-_\s]/g, '')
      const tSubNorm = (t.subject || '').trim().toLowerCase()

      const classMatch =
        matchesClassAndSection({ class: t.classes, section: t.section }, selectedClass, selectedSection) ||
        tClassNorm === normC ||
        t.classes.toLowerCase().trim() === selectedClass.toLowerCase().trim()
      const secMatch = (tSecNorm === normS || !tSecNorm || normS === 'all')
      const subMatch = (tSubNorm === normSub || tSubNorm.includes(normSub) || normSub.includes(tSubNorm))

      if (classMatch && secMatch && subMatch) {
        const isDueOnDate = selectedDateItem?.fullDate ? normalizeDateStr(t.submissionDate) === selectedDateItem.fullDate : true
        const hasReschedOnDate = rescheduledSubmissions.some(sub =>
          sub.taskId === t.id &&
          (!selectedDateItem?.fullDate || normalizeDateStr(sub.rescheduledDate || sub.rescheduled_date) === selectedDateItem.fullDate) &&
          sub.status !== 'Completed'
        )

        if (isDueOnDate || hasReschedOnDate || !selectedDateItem) {
          const reschedItem = rescheduledSubmissions.find(sub =>
            sub.taskId === t.id &&
            (!selectedDateItem?.fullDate || normalizeDateStr(sub.rescheduledDate || sub.rescheduled_date) === selectedDateItem.fullDate) &&
            sub.status !== 'Completed'
          )
          matching.push({
            ...t,
            submissionDate: reschedItem?.rescheduledDate || t.submissionDate
          })
        }
      }
    })

    // Also include any tasks with rescheduled remarks matching this date, class, and subject
    rescheduledSubmissions.forEach(sub => {
      const subNormDate = normalizeDateStr(sub.rescheduledDate || sub.rescheduled_date)
      if (selectedDateItem?.fullDate && subNormDate && subNormDate !== selectedDateItem.fullDate) {
        return
      }
      if (sub.status === 'Completed') return

      const subClass = normalizeClassKey(sub.classes || '')
      const subSec = String(sub.section || '').toLowerCase().replace(/[-_\s]/g, '')
      const subSub = (sub.subject || '').trim().toLowerCase()

      if (
        (subClass === normC || sub.classes?.toLowerCase().trim() === selectedClass.toLowerCase().trim()) &&
        (subSec === normS || !subSec || normS === 'all') &&
        (subSub === normSub || subSub.includes(normSub) || normSub.includes(subSub))
      ) {
        if (!matching.some(m => m.id === sub.taskId)) {
          matching.push({
            id: sub.taskId,
            title: sub.taskTitle || `${selectedSubject} Homework (Rescheduled)`,
            description: sub.taskDescription || sub.description || '',
            subject: sub.subject || selectedSubject,
            classes: sub.classes || selectedClass,
            section: sub.section || selectedSection,
            assignedBy: 'Faculty',
            assignDate: sub.assignDate || '',
            submissionDate: sub.rescheduledDate || (selectedDateItem?.assignFormat || ''),
            hasAttachment: false,
            status: 'Active',
            studentsCount: allStudents.filter(s => matchesClassAndSection(s, selectedClass, selectedSection)).length
          })
        }
      }
    })

    return matching
  }, [tasks, selectedClass, selectedSection, selectedSubject, selectedTeacherName, selectedDateItem, allStudents, rescheduledSubmissions])

  // ── STUDENTS ENROLLED IN SELECTED CLASS (Screen 4) ──
  const classStudents = useMemo(() => {
    if (!selectedClass) return []
    return allStudents.filter(s => matchesClassAndSection(s, selectedClass, selectedSection))
  }, [allStudents, selectedClass, selectedSection])

  // Fetch or initialize student submissions
  const loadTaskSubmissions = async (task: HomeworkTaskItem) => {
    const studentList = allStudents.filter(s => matchesClassAndSection(s, task.classes, task.section))
    const validStudentIds = new Set(studentList.map(s => String(s.id)))
    const validStudentAdms = new Set(studentList.map(s => String(s.admissionNo || '').toLowerCase()))
    const subMap: Record<string, StudentSubmissionItem> = {}

    // 1. Load from localStorage cache (only for valid enrolled students)
    try {
      const cached = localStorage.getItem(`school_task_subs_${task.id}`) || localStorage.getItem(`hw_sub_${task.id}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          parsed.forEach((s: any) => {
            const id = String(s.studentId || s.id)
            const adm = String(s.admissionNo || '').toLowerCase()
            if (!validStudentIds.has(id) && (!adm || !validStudentAdms.has(adm))) return
            subMap[id] = {
              studentId: id,
              name: s.name || 'Student',
              rollNo: s.rollNo || '01',
              admissionNo: s.admissionNo || 'ADM-01',
              avatar: s.avatar || '',
              gender: s.gender || 'Male',
              status: s.status === 'Completed' || s.status === 'Submitted' ? 'Completed' : (s.status === 'Rescheduled' ? 'Rescheduled' : 'Pending'),
              remark: s.remark || 'No evaluation remark added yet.',
              rating: typeof s.rating === 'number' ? s.rating : 5,
              rescheduledDate: s.rescheduledDate || s.rescheduled_date,
              attachmentName: s.attachmentName || s.attachment_name,
              submittedAt: s.submittedAt
            }
          })
        }
      }
    } catch {}

    // 2. Fetch from Neon DB (only for valid enrolled students)
    try {
      const res = await fetchTaskSubmissions(task.id)
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        res.data.forEach((s: any) => {
          const id = String(s.studentId || s.student_id)
          const adm = String(s.admissionNo || s.admission_no || '').toLowerCase()
          if (!validStudentIds.has(id) && (!adm || !validStudentAdms.has(adm))) return
          subMap[id] = {
            studentId: id,
            name: s.name || s.student_name || 'Student',
            rollNo: s.rollNo || s.roll_no || '01',
            admissionNo: s.admissionNo || s.admission_no || 'ADM-01',
            avatar: s.avatar || '',
            gender: (s.gender && s.gender.toLowerCase().startsWith('f')) ? 'Female' : 'Male',
            status: s.status === 'Completed' || s.status === 'Submitted' ? 'Completed' : (s.status === 'Rescheduled' ? 'Rescheduled' : 'Pending'),
            remark: s.remark || 'No evaluation remark added yet.',
            rating: typeof s.rating === 'number' && s.rating >= 1 && s.rating <= 5 ? s.rating : 5,
            rescheduledDate: s.rescheduledDate || s.rescheduled_date,
            attachmentName: s.attachmentName || s.attachment_name,
            submittedAt: s.submittedAt || s.submitted_at
          }
        })
      }
    } catch {}

    // 3. Inject any rescheduled items for this task from sanitized rescheduledSubmissions
    rescheduledSubmissions.forEach(sub => {
      if (sub.taskId === task.id) {
        const id = String(sub.studentId)
        if (!validStudentIds.has(id)) return
        subMap[id] = {
          studentId: id,
          name: sub.studentName || sub.name || 'Student',
          rollNo: sub.rollNo || '01',
          admissionNo: sub.admissionNo || 'ADM-01',
          avatar: sub.avatar || '',
          gender: (sub.gender && sub.gender.toLowerCase().startsWith('f')) ? 'Female' : 'Male',
          status: sub.status === 'Completed' ? 'Completed' : 'Rescheduled',
          remark: sub.description || sub.remark || 'Rescheduled homework evaluation.',
          rating: typeof sub.rating === 'number' ? sub.rating : 5,
          rescheduledDate: sub.rescheduledDate || sub.rescheduled_date,
          attachmentName: sub.attachmentName || sub.attachment_name,
          submittedAt: sub.submittedAt
        }
      }
    })

    // 4. Fill defaults for any remaining enrolled students
    studentList.forEach(st => {
      if (!subMap[st.id]) {
        subMap[st.id] = {
          studentId: st.id,
          name: st.name,
          rollNo: st.rollNo,
          admissionNo: st.admissionNo,
          avatar: st.photo || '',
          gender: st.gender || 'Male',
          status: 'Pending',
          remark: 'No evaluation remark added yet.',
          rating: 5,
          submittedAt: undefined
        }
      }
    })

    setSubmissions(subMap)
  }

  // Categorized student lists for Screen 4 (Completed -> Not Completed -> Rescheduled)
  const allEvaluationStudents = useMemo(() => {
    const validIds = new Set(classStudents.map(s => String(s.id)))
    const list = Object.values(submissions).filter(s => validIds.has(String(s.studentId)))
    const baseList = list.length > 0 ? list : classStudents.map(st => ({
      studentId: st.id,
      name: st.name,
      rollNo: st.rollNo,
      admissionNo: st.admissionNo,
      avatar: st.photo || '',
      gender: st.gender || 'Male',
      status: 'Pending',
      remark: 'No evaluation remark added yet.',
      rating: 5
    } as StudentSubmissionItem))

    if (!studentSearch.trim()) return baseList
    const q = studentSearch.toLowerCase().trim()
    return baseList.filter(s => {
      const matchName = s.name.toLowerCase().includes(q)
      const matchRoll = s.rollNo.includes(q)
      const matchAdm = s.admissionNo.toLowerCase().includes(q)
      return matchName || matchRoll || matchAdm
    })
  }, [classStudents, submissions, studentSearch])

  const completedEvaluationStudents = useMemo(() => {
    return allEvaluationStudents.filter(s => s.status === 'Completed' || s.status === 'Submitted')
  }, [allEvaluationStudents])

  const notCompletedEvaluationStudents = useMemo(() => {
    return allEvaluationStudents.filter(s => s.status !== 'Completed' && s.status !== 'Submitted' && s.status !== 'Rescheduled')
  }, [allEvaluationStudents])

  const rescheduledEvaluationStudents = useMemo(() => {
    return allEvaluationStudents.filter(s => s.status === 'Rescheduled')
  }, [allEvaluationStudents])

  const evaluationStudents = useMemo(() => {
    if (studentStatusFilter === 'Completed') return completedEvaluationStudents
    if (studentStatusFilter === 'Not Completed') return notCompletedEvaluationStudents
    if (studentStatusFilter === 'Rescheduled') return rescheduledEvaluationStudents
    return allEvaluationStudents
  }, [studentStatusFilter, completedEvaluationStudents, notCompletedEvaluationStudents, rescheduledEvaluationStudents, allEvaluationStudents])

  // Handlers for Modals
  const handleSaveCompleteModal = async () => {
    if (!activeTask || !completeModalStudent) return
    setIsSavingModal(true)
    const stId = completeModalStudent.studentId
    const reviewText = completeReview.trim() || 'Excellent work, all questions answered with clear steps.'

    try {
      await updateStudentRemark(
        activeTask.id,
        stId,
        reviewText,
        'Submitted',
        completeRating,
        {
          studentName: completeModalStudent.name,
          admissionNo: completeModalStudent.admissionNo,
          rollNo: completeModalStudent.rollNo,
          attachmentName: completeFileName || undefined
        }
      )

      const updatedItem: StudentSubmissionItem = {
        ...completeModalStudent,
        status: 'Completed',
        remark: reviewText,
        rating: completeRating,
        attachmentName: completeFileName || undefined,
        submittedAt: 'Just now'
      }

      setSubmissions(prev => {
        const next = { ...prev, [stId]: updatedItem }
        try {
          localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(Object.values(next)))
        } catch {}
        return next
      })

      // Clean up rescheduled record in localStorage & state
      try {
        const rawResched = localStorage.getItem('school_rescheduled_remarks')
        if (rawResched) {
          const parsedResched = JSON.parse(rawResched)
          const filtered = parsedResched.filter((r: any) => !(r.taskId === activeTask.id && r.studentId === stId))
          localStorage.setItem('school_rescheduled_remarks', JSON.stringify(filtered))
        }
      } catch {}

      setRescheduledSubmissions(prev => prev.filter(r => !(r.taskId === activeTask.id && r.studentId === stId)))

      showToast(`Completed evaluation saved for ${completeModalStudent.name}!`, 'success')
      setCompleteModalStudent(null)
      setCompleteFileName('')
    } catch (err: any) {
      console.error('Failed to save complete modal:', err)
      showToast(err.message || 'Failed to save', 'error')
    } finally {
      setIsSavingModal(false)
    }
  }

  const handleSaveNotCompleteModal = async () => {
    if (!activeTask || !notCompleteModalStudent) return
    setIsSavingModal(true)
    const stId = notCompleteModalStudent.studentId
    const remarkText = notCompleteRemark.trim() || 'Incomplete assignment, please finish and resubmit.'

    try {
      await updateStudentRemark(
        activeTask.id,
        stId,
        remarkText,
        'Pending',
        notCompleteModalStudent.rating || 5,
        {
          studentName: notCompleteModalStudent.name,
          admissionNo: notCompleteModalStudent.admissionNo,
          rollNo: notCompleteModalStudent.rollNo,
          attachmentName: notCompleteFileName || undefined
        }
      )

      const updatedItem: StudentSubmissionItem = {
        ...notCompleteModalStudent,
        status: 'Pending',
        remark: remarkText,
        attachmentName: notCompleteFileName || undefined
      }

      setSubmissions(prev => {
        const next = { ...prev, [stId]: updatedItem }
        try {
          localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(Object.values(next)))
        } catch {}
        return next
      })

      showToast(`Not Complete remark saved for ${notCompleteModalStudent.name}!`, 'success')
      setNotCompleteModalStudent(null)
      setNotCompleteFileName('')
    } catch (err: any) {
      console.error('Failed to save not complete modal:', err)
      showToast(err.message || 'Failed to save', 'error')
    } finally {
      setIsSavingModal(false)
    }
  }

  const handleSaveRescheduleModal = async () => {
    if (!activeTask || !rescheduleModalStudent) return
    setIsSavingModal(true)
    const stId = rescheduleModalStudent.studentId
    const formattedReschedDate = rescheduleDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const desc = rescheduleDescription.trim() || 'Excellent work, all questions answered with clear steps.'

    try {
      await updateStudentTaskSubmission(activeTask.id, stId, 'Rescheduled', {
        studentName: rescheduleModalStudent.name,
        admissionNo: rescheduleModalStudent.admissionNo,
        rollNo: rescheduleModalStudent.rollNo,
        remark: desc,
        rating: 5,
        rescheduledDate: formattedReschedDate
      })

      const updatedItem: StudentSubmissionItem = {
        ...rescheduleModalStudent,
        status: 'Rescheduled',
        remark: desc,
        rating: 5,
        rescheduledDate: formattedReschedDate
      }

      setSubmissions(prev => {
        const next = { ...prev, [stId]: updatedItem }
        try {
          localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(Object.values(next)))
        } catch {}
        return next
      })

      // Store in school_rescheduled_remarks
      try {
        const raw = localStorage.getItem('school_rescheduled_remarks')
        let arr: any[] = raw ? JSON.parse(raw) : []
        const existingIdx = arr.findIndex((x: any) => x.taskId === activeTask.id && x.studentId === stId)
        const record = {
          id: `resched-${activeTask.id}-${stId}`,
          taskId: activeTask.id,
          taskTitle: activeTask.title,
          taskDescription: activeTask.description,
          subject: activeTask.subject,
          classes: activeTask.classes,
          section: activeTask.section,
          assignDate: activeTask.assignDate,
          submissionDate: activeTask.submissionDate,
          studentId: stId,
          studentName: rescheduleModalStudent.name,
          admissionNo: rescheduleModalStudent.admissionNo,
          rollNo: rescheduleModalStudent.rollNo,
          avatar: rescheduleModalStudent.avatar,
          gender: rescheduleModalStudent.gender,
          rescheduledDate: formattedReschedDate,
          description: desc,
          status: 'Rescheduled',
          updatedAt: new Date().toISOString()
        }
        if (existingIdx >= 0) arr[existingIdx] = record
        else arr.push(record)
        localStorage.setItem('school_rescheduled_remarks', JSON.stringify(arr))
      } catch {}

      showToast(`${rescheduleModalStudent.name} rescheduled to ${formattedReschedDate}!`, 'success')
      setRescheduleModalStudent(null)
    } catch (err: any) {
      console.error('Failed to reschedule:', err)
      showToast(err.message || 'Failed to reschedule', 'error')
    } finally {
      setIsSavingModal(false)
    }
  }

  const toggleStudentSelect = (id: string) => {
    setBulkSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (bulkSelectedStudentIds.length === evaluationStudents.length) {
      setBulkSelectedStudentIds([])
    } else {
      setBulkSelectedStudentIds(evaluationStudents.map(s => s.studentId))
    }
  }

  const handleOpenBulkModal = () => {
    if (bulkSelectedStudentIds.length === 0) {
      setBulkSelectedStudentIds(evaluationStudents.map(s => s.studentId))
    }
    setBulkActionMode('Complete')
    setBulkRating(5)
    setBulkReview('Excellent work, all questions answered with clear steps.')
    setBulkRemark('Incomplete assignment, please finish and resubmit.')
    setBulkRescheduleDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])
    setBulkRescheduleDescription('Excellent work, all questions answered with clear steps.')
    setBulkFileName('')
    setBulkModalOpen(true)
  }

  const handleExecuteBulkAction = async () => {
    if (!activeTask || bulkSelectedStudentIds.length === 0) {
      showToast('Please select students for bulk action.', 'error')
      return
    }

    setIsBulkSubmitting(true)
    try {
      const selectedStudents = evaluationStudents.filter(s =>
        bulkSelectedStudentIds.includes(s.studentId)
      )

      if (bulkActionMode === 'Complete') {
        const text = bulkReview.trim() || 'Excellent work, all questions answered with clear steps.'
        await bulkUpdateStudentTaskSubmissions(
          activeTask.id,
          selectedStudents.map(s => ({
            studentId: s.studentId,
            studentName: s.name,
            admissionNo: s.admissionNo,
            rollNo: s.rollNo,
            remark: text,
            rating: bulkRating,
            attachmentName: bulkFileName || undefined
          })),
          'Submitted',
          text,
          bulkRating,
          { attachmentName: bulkFileName || undefined }
        )

        setSubmissions(prev => {
          const next = { ...prev }
          selectedStudents.forEach(st => {
            next[st.studentId] = {
              ...st,
              status: 'Completed',
              remark: text,
              rating: bulkRating,
              attachmentName: bulkFileName || undefined,
              submittedAt: 'Just now'
            }
          })
          try {
            localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(Object.values(next)))
          } catch {}
          return next
        })

        showToast(`Marked ${selectedStudents.length} students as Completed!`, 'success')
      } else if (bulkActionMode === 'Not Complete') {
        const text = bulkRemark.trim() || 'Incomplete assignment, please finish and resubmit.'
        await bulkUpdateStudentTaskSubmissions(
          activeTask.id,
          selectedStudents.map(s => ({
            studentId: s.studentId,
            studentName: s.name,
            admissionNo: s.admissionNo,
            rollNo: s.rollNo,
            remark: text,
            rating: 5,
            attachmentName: bulkFileName || undefined
          })),
          'Pending',
          text,
          5,
          { attachmentName: bulkFileName || undefined }
        )

        setSubmissions(prev => {
          const next = { ...prev }
          selectedStudents.forEach(st => {
            next[st.studentId] = {
              ...st,
              status: 'Pending',
              remark: text,
              rating: 5,
              attachmentName: bulkFileName || undefined
            }
          })
          try {
            localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(Object.values(next)))
          } catch {}
          return next
        })

        showToast(`Marked ${selectedStudents.length} students as Not Complete!`, 'success')
      } else if (bulkActionMode === 'Reschedule') {
        const formattedReschedDate = bulkRescheduleDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
        const desc = bulkRescheduleDescription.trim() || 'Excellent work, all questions answered with clear steps.'

        await bulkUpdateStudentTaskSubmissions(
          activeTask.id,
          selectedStudents.map(s => ({
            studentId: s.studentId,
            studentName: s.name,
            admissionNo: s.admissionNo,
            rollNo: s.rollNo,
            remark: desc,
            rating: 5,
            rescheduledDate: formattedReschedDate
          })),
          'Rescheduled',
          desc,
          5,
          { rescheduledDate: formattedReschedDate }
        )

        setSubmissions(prev => {
          const next = { ...prev }
          selectedStudents.forEach(st => {
            next[st.studentId] = {
              ...st,
              status: 'Rescheduled',
              remark: desc,
              rating: 5,
              rescheduledDate: formattedReschedDate
            }
          })
          try {
            localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(Object.values(next)))
          } catch {}
          return next
        })

        showToast(`Rescheduled ${selectedStudents.length} students to ${formattedReschedDate}!`, 'success')
      }

      setBulkModalOpen(false)
      setBulkSelectedStudentIds([])
    } catch (err: any) {
      console.error('Bulk update error:', err)
      showToast(err.message || 'Failed to apply bulk remarks', 'error')
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-5 pb-16 animate-in fade-in duration-200">

      {/* ── TOAST NOTIFICATION ── */}
      {toast.open && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl transition-all animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-[#0f766e] text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-teal-200" /> : <AlertCircle className="w-5 h-5 text-red-200" />}
          <span className="text-xs md:text-sm font-bold">{toast.msg}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 1: SELECT DATE (Exact Layout of Screenshot 1 - Orange Numbers)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'dates' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">

          {/* Top Curved Teal Header matching Screenshot 1 */}
          <div className="bg-[#0f766e] text-white px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => router.push('/institute/homework')}
              className="w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex-1 text-center pr-11">
              Pending Remark Homework
            </h1>
          </div>

          {/* Title & Month Dropdown Row matching Screenshot 1 */}
          <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
            <div>
              <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                Select Date
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Pick a pending date to remark submissions
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap justify-end">
              {/* Direct Jump to Any Date Input */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xs">
                <Calendar className="w-4 h-4 text-orange-600" />
                <label htmlFor="pending-remark-direct-date" className="text-xs font-bold text-slate-500 hidden sm:inline">
                  Jump to Date:
                </label>
                <input
                  id="pending-remark-direct-date"
                  type="date"
                  max={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
                  onChange={e => {
                    if (e.target.value) handlePickCustomDate(e.target.value)
                  }}
                  className="bg-transparent text-xs font-black text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                />
              </div>

              {/* Month Dropdown (like 'Jul 2026' in Screenshot 1) */}
              <div className="relative">
              <select
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-9 pr-8 py-2.5 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
              >
                <option value="All">All Missed ({pendingRemarkDates.length})</option>
                {availableMonthYears.map(my => {
                  const count = pendingRemarkDates.filter(d => `${d.monthShort} ${d.year}` === my).length
                  return (
                    <option key={my} value={my}>{my} ({count})</option>
                  )
                })}
              </select>
              <Calendar className="w-4 h-4 text-orange-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          </div>

          {/* ── GRID OF PENDING REMARK DATE CARDS (Orange Numbers as in Screenshot 1) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full pb-6">
            {filteredDates.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedDateItem(item)
                  setCurrentScreen('classes')
                }}
                className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 hover:border-orange-500 hover:shadow-md transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer active:scale-95 group"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {item.monthName}
                </span>
                <span className="text-3xl md:text-4xl font-black text-orange-600 group-hover:scale-105 transition-transform tracking-tight">
                  {item.dayNumber}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {item.dayName}
                </span>
                {item.hasRescheduled && item.rescheduledCount && item.rescheduledCount > 0 ? (
                  <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-200 shadow-2xs">
                    {item.rescheduledCount} Rescheduled
                  </span>
                ) : (item.pendingCount && item.pendingCount > 0 ? (
                  <span className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
                    {item.pendingCount} Pending
                  </span>
                ) : null)}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 2: SELECT CLASS TO REMARK (Exact Layout of Screenshot 2)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'classes' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">

          {/* Top Curved Teal Header matching Screenshot 2 */}
          <div className="bg-[#0f766e] text-white px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setCurrentScreen('dates')}
              className="w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer"
              title="Back to Dates"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex-1 text-center pr-11">
              Pending Remark Homework
            </h1>
          </div>

          {/* Selected Date Banner Card with Date Switcher */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs border border-orange-200/80 dark:border-orange-950/60 flex items-center justify-between flex-wrap gap-3.5 w-full">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-bold">
                  Pending Remark Date
                </p>
                <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                  {selectedDateItem?.displayBanner || 'Selected Date'}
                </h2>
              </div>
            </div>

            {/* Interactive Date Switcher (Prev / Picker / Next / Yesterday) */}
            <div className="flex items-center gap-1.5 bg-orange-50/70 dark:bg-orange-950/30 p-1.5 rounded-2xl border border-orange-200/70 dark:border-orange-900/60">
              <button
                type="button"
                onClick={() => {
                  const cur = selectedDateItem?.fullDate || new Date(Date.now() - 86400000).toISOString().split('T')[0]
                  const parts = cur.split('-').map(Number)
                  const d = new Date(parts[0], parts[1] - 1, parts[2] - 1)
                  handleSwitchDate(d)
                }}
                className="w-8 h-8 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-orange-200/80 dark:border-orange-900/80 shadow-2xs cursor-pointer hover:border-orange-400">
                <Calendar className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                  {selectedDateItem?.assignFormat || 'Pick Date'}
                </span>
                <input
                  type="date"
                  max={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
                  value={selectedDateItem?.fullDate || ''}
                  onChange={e => {
                    if (e.target.value) handleSwitchDate(e.target.value)
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Click to pick any date"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const cur = selectedDateItem?.fullDate || new Date(Date.now() - 86400000).toISOString().split('T')[0]
                  const parts = cur.split('-').map(Number)
                  const d = new Date(parts[0], parts[1] - 1, parts[2] + 1)
                  handleSwitchDate(d)
                }}
                className="w-8 h-8 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleSwitchDate(new Date(Date.now() - 86400000))}
                className="px-2.5 py-1 text-[11px] font-bold rounded-xl text-orange-700 dark:text-orange-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Yesterday
              </button>
            </div>
          </div>

          {/* Class & Section Dropdowns matching Screenshot 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Class</label>
              <div className="relative">
                <select
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs cursor-pointer"
                >
                  <option value="All">All Classes</option>
                  {uniqueClassNames.map(cn => (
                    <option key={cn} value={cn}>{cn}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section</label>
              <div className="relative">
                <select
                  value={filterSection}
                  onChange={e => setFilterSection(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs cursor-pointer"
                >
                  <option value="All">All Sections</option>
                  {uniqueSectionNames.map(sn => (
                    <option key={sn} value={sn}>Section {sn}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Section Heading matching Screenshot 2 */}
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
              Select Class to Remark
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {filteredClasses.length} Classes Available
            </span>
          </div>

          {/* ── CLASS CARDS LIST (Exact Layout of Screenshot 2) ── */}
          <div className="space-y-4 w-full pb-6">
            {filteredClasses.map(cls => {
              const reschedForClass = (() => {
                const normC = normalizeClassKey(cls.className)
                const normS = String(cls.section || '').toLowerCase().replace(/[-_\s]/g, '')
                const studentIdSet = new Set<string>()

                rescheduledSubmissions.forEach(sub => {
                  const subC = normalizeClassKey(sub.classes || '')
                  const subS = String(sub.section || '').toLowerCase().replace(/[-_\s]/g, '')
                  const dateMatch = !selectedDateItem?.fullDate || normalizeDateStr(sub.rescheduledDate || sub.rescheduled_date) === selectedDateItem.fullDate
                  if (dateMatch && normC === subC && (normS === subS || !subS || normS === 'a') && sub.status !== 'Completed') {
                    studentIdSet.add(String(sub.studentId))
                  }
                })
                return studentIdSet.size
              })()

              return (
              <div
                key={cls.id}
                className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-4 w-full hover:border-teal-500 transition-colors"
              >
                {/* Class Title & Student Count Badge matching Screenshot 2 */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                        {cls.className} - Section {cls.section}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Class Teacher:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{cls.classTeacher}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {reschedForClass > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1.5 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-orange-600" />
                        {reschedForClass} Rescheduled
                      </span>
                    )}
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60 flex items-center gap-1.5 shrink-0">
                      <Users className="w-3.5 h-3.5" />
                      {cls.studentsCount} Students
                    </span>
                  </div>
                </div>

                {/* Remark Homework Action Button matching Screenshot 2 */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClass(cls.className)
                      setSelectedSection(cls.section)
                      setSelectedTeacherName(cls.classTeacher)
                      setCurrentScreen('tasks')
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs md:text-sm font-black shadow-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Remark Homework</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 3: SELECT TASK TO REMARK (Exact Layout of Screenshot 3)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'tasks' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">

          {/* Top Curved Teal Header matching Screenshot 3 */}
          <div className="bg-[#0f766e] text-white px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setCurrentScreen('classes')}
              className="w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer"
              title="Back to Classes"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex-1 text-center pr-11">
              Select Task to Remark
            </h1>
          </div>

          {/* Subject Filter Tabs Bar (with task count badges) */}
          {classSubjects.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {classSubjects.map(subName => {
                const normS = (subName || '').trim().toLowerCase()
                const countForSub = tasks.filter(t => {
                  const classMatch = matchesClassAndSection({ class: t.classes, section: t.section }, selectedClass, selectedSection)
                  const subMatch = (t.subject || '').trim().toLowerCase() === normS || (t.subject || '').trim().toLowerCase().includes(normS) || normS.includes((t.subject || '').trim().toLowerCase())
                  const isDue = selectedDateItem?.fullDate ? normalizeDateStr(t.submissionDate) === selectedDateItem.fullDate : true
                  const hasResched = rescheduledSubmissions.some(sub =>
                    sub.taskId === t.id &&
                    (!selectedDateItem?.fullDate || normalizeDateStr(sub.rescheduledDate || sub.rescheduled_date) === selectedDateItem.fullDate) &&
                    sub.status !== 'Completed'
                  )
                  return classMatch && subMatch && (isDue || hasResched)
                }).length

                return (
                  <button
                    key={subName}
                    type="button"
                    onClick={() => setSelectedSubject(subName)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                      selectedSubject === subName
                        ? 'bg-[#0f766e] text-white shadow-xs font-black'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{subName}</span>
                    {countForSub > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        selectedSubject === subName ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}>
                        {countForSub}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Subject Banner Card with Date Switcher */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between flex-wrap gap-3 sm:gap-4 w-full">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#0f766e] text-white flex items-center justify-center shadow-xs shrink-0">
                <FileText className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {selectedSubject}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg sm:rounded-xl">
                    {selectedClass} - Sec {selectedSection}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg sm:rounded-xl">
                    Academic Year 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Date Switcher on Screen 3 */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-600">
              <button
                type="button"
                onClick={() => {
                  const cur = selectedDateItem?.fullDate || new Date(Date.now() - 86400000).toISOString().split('T')[0]
                  const parts = cur.split('-').map(Number)
                  const d = new Date(parts[0], parts[1] - 1, parts[2] - 1)
                  handleSwitchDate(d)
                }}
                className="w-8 h-8 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-teal-200/80 dark:border-teal-800 shadow-2xs cursor-pointer hover:border-teal-400">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-xs font-black text-teal-800 dark:text-teal-200">
                  Due: {selectedDateItem?.assignFormat || 'Pick Date'}
                </span>
                <input
                  type="date"
                  max={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
                  value={selectedDateItem?.fullDate || ''}
                  onChange={e => {
                    if (e.target.value) handleSwitchDate(e.target.value)
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Click to pick date"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const cur = selectedDateItem?.fullDate || new Date(Date.now() - 86400000).toISOString().split('T')[0]
                  const parts = cur.split('-').map(Number)
                  const d = new Date(parts[0], parts[1] - 1, parts[2] + 1)
                  handleSwitchDate(d)
                }}
                className="w-8 h-8 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleSwitchDate(new Date(Date.now() - 86400000))}
                className="px-2.5 py-1 text-[11px] font-bold rounded-xl text-teal-700 dark:text-teal-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Yesterday
              </button>
            </div>
          </div>

          {/* Section Heading matching Screenshot 3 */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
              Assigned Tasks
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60">
              {currentSubjectTasks.length} total
            </span>
          </div>

          {/* ── ASSIGNED TASKS LIST matching Screenshot 3 ── */}
          {currentSubjectTasks.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 w-full">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No homework tasks found for {selectedSubject} on {selectedDateItem?.displayBanner || 'this date'}.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('classes')}
                  className="px-5 py-2.5 rounded-2xl bg-[#0f766e] text-white font-bold text-xs shadow-xs active:scale-95 transition-transform cursor-pointer"
                >
                  &larr; Back to Classes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 w-full pb-6">
              {currentSubjectTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-3.5 w-full"
                >
                  {/* Status Pills Row matching Screenshot 3 */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black inline-flex items-center gap-1.5 ${
                      task.status === 'Active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${task.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {task.status}
                    </span>

                    {task.hasAttachment && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5" />
                        Attachment
                      </span>
                    )}
                  </div>

                  {/* Title & Description matching Screenshot 3 */}
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Assigned By */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Assigned by:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{task.assignedBy}</span>
                  </p>

                  {/* Attachment file pill */}
                  {task.attachmentName && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span className="truncate max-w-[280px]">{task.attachmentName}</span>
                    </div>
                  )}

                  {/* Dates Row matching Screenshot 3 */}
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs md:text-sm">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Assign: <strong className="text-slate-700 dark:text-slate-300">{task.assignDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>Submission: <strong className="text-orange-700 dark:text-orange-300">{task.submissionDate}</strong></span>
                    </div>
                  </div>

                  {/* Bottom Row matching Screenshot 3 with Reschedule, Delete, and Remark Students */}
                  <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                    <span className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      {task.studentsCount ?? classStudents.length} Students
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={e => handleOpenRescheduleTaskModal(task, e)}
                        className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
                        title="Reschedule this task"
                      >
                        <CalendarClock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={e => handleDeleteTask(task.id, e)}
                        className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Delete</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTask(task)
                          loadTaskSubmissions(task)
                          setCurrentScreen('evaluation')
                        }}
                        className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-[11px] sm:text-xs md:text-sm font-bold shadow-xs flex items-center gap-1 sm:gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Remark Students &gt;</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 4: REMARK HOMEWORK EVALUATION (Exact Layout of Screenshot 4)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'evaluation' && activeTask && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">

          {/* Top Curved Teal Header matching Screenshot 4 */}
          <div className="bg-[#0f766e] text-white px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setCurrentScreen('tasks')}
              className="w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer"
              title="Back to Tasks"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex-1 text-center pr-11">
              Remark Homework
            </h1>
          </div>

          {/* Selected Class & Task Header Banner matching Screenshot 4 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-3.5 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center shadow-xs shrink-0">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">
                    {selectedClass}
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Subject: {selectedSubject}
                  </p>
                </div>
              </div>

              <span className="px-4 py-2 rounded-2xl bg-[#0f766e] text-white text-xs md:text-sm font-black shadow-xs">
                Section {selectedSection || 'A'}
              </span>
            </div>

            {/* Task Info Pill Row with Change Date Switcher */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 truncate">
                <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="truncate">{activeTask.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-400 font-semibold">
                  Due: <strong className="text-slate-700 dark:text-slate-300">{activeTask.submissionDate}</strong>
                </span>
                <div className="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-teal-200/80 dark:border-teal-800 text-[11px] font-bold text-teal-700 dark:text-teal-300 cursor-pointer hover:border-teal-400 shadow-2xs">
                  <Calendar className="w-3 h-3 text-teal-600" />
                  <span>Change Date</span>
                  <input
                    type="date"
                    max={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
                    value={selectedDateItem?.fullDate || ''}
                    onChange={e => {
                      if (e.target.value) handleSwitchDate(e.target.value)
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Change Date"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar & Status Filter Buttons Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Search By Name, Roll No."
                className="w-full pl-11 pr-11 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs placeholder:text-slate-400"
              />
              <Filter className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Pills: All / Completed / Not Completed / Rescheduled */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setStudentStatusFilter('All')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  studentStatusFilter === 'All' ? 'bg-[#0f766e] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                All ({allEvaluationStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setStudentStatusFilter('Completed')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  studentStatusFilter === 'Completed' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                Completed ({completedEvaluationStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setStudentStatusFilter('Not Completed')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  studentStatusFilter === 'Not Completed' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                Not Completed ({notCompletedEvaluationStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setStudentStatusFilter('Rescheduled')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  studentStatusFilter === 'Rescheduled' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                Rescheduled ({rescheduledEvaluationStudents.length})
              </button>
            </div>
          </div>

          {/* Students Heading, Select All & Bulk Action Button matching Screenshot 4 */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <h3 className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-300">
                Students ({evaluationStudents.length})
              </h3>
              {evaluationStudents.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors cursor-pointer"
                >
                  {bulkSelectedStudentIds.length === evaluationStudents.length ? (
                    <CheckSquare className="w-4 h-4 text-teal-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Select All</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenBulkModal}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-[#0f766e] text-[#0f766e] dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-700 text-xs md:text-sm font-bold shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Bulk Action {bulkSelectedStudentIds.length > 0 ? `(${bulkSelectedStudentIds.length})` : ''}</span>
            </button>
          </div>

          {/* ── REAL STUDENT EVALUATION CARDS CATEGORIZED (Completed -> Not Completed -> Rescheduled) ── */}
          {allEvaluationStudents.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2 w-full">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No students found matching your criteria.
              </p>
              <p className="text-xs text-slate-400">
                Check your search keyword or enroll students in this class.
              </p>
            </div>
          ) : (
            <div className="space-y-6 w-full pb-8">
              {/* Category 1: Completed (Comes First) */}
              {(studentStatusFilter === 'All' || studentStatusFilter === 'Completed') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pt-1 pb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <h4 className="text-xs md:text-sm font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                      <span>Completed</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                        {completedEvaluationStudents.length}
                      </span>
                    </h4>
                    <div className="h-px bg-emerald-200/60 dark:bg-emerald-800/40 flex-1"></div>
                  </div>

                  {completedEvaluationStudents.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-dashed border-emerald-200/80 dark:border-emerald-800/40 text-center text-xs text-emerald-700/80 dark:text-emerald-300/80 font-medium">
                      No students marked as Completed yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {completedEvaluationStudents.map(student => {
                        const isSelected = bulkSelectedStudentIds.includes(student.studentId)
                        const isCompleted = true
                        const isRescheduled = false

                        return (
                          <div
                            key={student.studentId}
                            className={`bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 shadow-xs border transition-all space-y-3.5 w-full hover:border-teal-400 ${
                              isSelected ? 'border-teal-500 ring-1 ring-teal-500/30' : 'border-slate-200/80 dark:border-slate-700/80'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => toggleStudentSelect(student.studentId)}
                                  className="cursor-pointer text-slate-400 hover:text-teal-600 transition-colors"
                                  title="Select for bulk action"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-5 h-5 text-teal-600" />
                                  ) : (
                                    <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                  )}
                                </button>

                                {student.avatar ? (
                                  <img
                                    src={student.avatar}
                                    alt={student.name}
                                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] font-black text-sm flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60">
                                    {student.name.charAt(0)}
                                  </div>
                                )}

                                <div>
                                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                    {student.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                      {student.gender}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                      Completed
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <span className="px-3 py-1 rounded-xl text-xs font-black bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shrink-0">
                                <Award className="w-3.5 h-3.5 text-teal-600" />
                                Roll No. : {student.rollNo}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed flex-1 italic">
                                {student.remark ? `"${student.remark}"` : 'No evaluation remark added yet.'}
                              </p>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCompleteModalStudent(student)
                                    setCompleteRating(student.rating || 5)
                                    setCompleteReview(student.remark || '')
                                    setCompleteFileName(student.attachmentName || '')
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Remark"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex justify-end items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setCompleteModalStudent(student)
                                  setCompleteRating(student.rating || 5)
                                  setCompleteReview(student.remark || 'Excellent work, all questions answered with clear steps.')
                                  setCompleteFileName(student.attachmentName || '')
                                }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                title="Edit Completed Details"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Category 2: Not Completed (Comes Second) */}
              {(studentStatusFilter === 'All' || studentStatusFilter === 'Not Completed') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pt-2 pb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                    <h4 className="text-xs md:text-sm font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <span>Not Completed</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                        {notCompletedEvaluationStudents.length}
                      </span>
                    </h4>
                    <div className="h-px bg-amber-200/60 dark:bg-amber-800/40 flex-1"></div>
                  </div>

                  {notCompletedEvaluationStudents.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-dashed border-amber-200/80 dark:border-amber-800/40 text-center text-xs text-amber-700/80 dark:text-amber-300/80 font-medium">
                      No students pending evaluation in Not Completed.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notCompletedEvaluationStudents.map(student => {
                        const isSelected = bulkSelectedStudentIds.includes(student.studentId)

                        return (
                          <div
                            key={student.studentId}
                            className={`bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 shadow-xs border transition-all space-y-3.5 w-full hover:border-teal-400 ${
                              isSelected ? 'border-teal-500 ring-1 ring-teal-500/30' : 'border-slate-200/80 dark:border-slate-700/80'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => toggleStudentSelect(student.studentId)}
                                  className="cursor-pointer text-slate-400 hover:text-teal-600 transition-colors"
                                  title="Select for bulk action"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-5 h-5 text-teal-600" />
                                  ) : (
                                    <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                  )}
                                </button>

                                {student.avatar ? (
                                  <img
                                    src={student.avatar}
                                    alt={student.name}
                                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] font-black text-sm flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60">
                                    {student.name.charAt(0)}
                                  </div>
                                )}

                                <div>
                                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                    {student.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                      {student.gender}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200">
                                      <AlertCircle className="w-3 h-3" />
                                      Not Completed
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <span className="px-3 py-1 rounded-xl text-xs font-black bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shrink-0">
                                <Award className="w-3.5 h-3.5 text-teal-600" />
                                Roll No. : {student.rollNo}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed flex-1 italic">
                                {student.remark ? `"${student.remark}"` : 'No evaluation remark added yet.'}
                              </p>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNotCompleteModalStudent(student)
                                    setNotCompleteRemark(student.remark || '')
                                    setNotCompleteFileName(student.attachmentName || '')
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Remark"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex justify-end items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setCompleteModalStudent(student)
                                  setCompleteRating(student.rating || 5)
                                  setCompleteReview(student.remark || 'Excellent work, all questions answered with clear steps.')
                                  setCompleteFileName(student.attachmentName || '')
                                }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                title="Mark Completed"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setNotCompleteModalStudent(student)
                                  setNotCompleteRemark(student.remark || 'Incomplete assignment, please finish and resubmit.')
                                  setNotCompleteFileName(student.attachmentName || '')
                                }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                                title="Mark Incomplete"
                              >
                                <X className="w-4 h-4 stroke-[3]" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setRescheduleModalStudent(student)
                                  const defaultDate = student.rescheduledDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
                                  setRescheduleDate(defaultDate)
                                  setRescheduleDescription(student.remark || 'Excellent work, all questions answered with clear steps.')
                                }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                                title="Reschedule Homework"
                              >
                                <CalendarClock className="w-4 h-4 text-purple-600" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Category 3: Rescheduled (Comes Third) */}
              {(studentStatusFilter === 'All' || studentStatusFilter === 'Rescheduled') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pt-2 pb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                    <h4 className="text-xs md:text-sm font-black text-purple-800 dark:text-purple-300 uppercase tracking-wider flex items-center gap-2">
                      <span>Rescheduled</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold">
                        {rescheduledEvaluationStudents.length}
                      </span>
                    </h4>
                    <div className="h-px bg-purple-200/60 dark:bg-purple-800/40 flex-1"></div>
                  </div>

                  {rescheduledEvaluationStudents.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-dashed border-purple-200/80 dark:border-purple-800/40 text-center text-xs text-purple-700/80 dark:text-purple-300/80 font-medium">
                      No students rescheduled for this task.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rescheduledEvaluationStudents.map(student => {
                        const isSelected = bulkSelectedStudentIds.includes(student.studentId)

                        return (
                          <div
                            key={student.studentId}
                            className={`bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 shadow-xs border transition-all space-y-3.5 w-full hover:border-teal-400 ${
                              isSelected ? 'border-teal-500 ring-1 ring-teal-500/30' : 'border-slate-200/80 dark:border-slate-700/80'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => toggleStudentSelect(student.studentId)}
                                  className="cursor-pointer text-slate-400 hover:text-teal-600 transition-colors"
                                  title="Select for bulk action"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-5 h-5 text-teal-600" />
                                  ) : (
                                    <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                                  )}
                                </button>

                                {student.avatar ? (
                                  <img
                                    src={student.avatar}
                                    alt={student.name}
                                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] font-black text-sm flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60">
                                    {student.name.charAt(0)}
                                  </div>
                                )}

                                <div>
                                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                    {student.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                      {student.gender}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200">
                                      <Clock className="w-3 h-3" />
                                      Rescheduled
                                    </span>
                                    {student.rescheduledDate && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                        Scheduled: {student.rescheduledDate}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span className="px-3 py-1 rounded-xl text-xs font-black bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shrink-0">
                                <Award className="w-3.5 h-3.5 text-teal-600" />
                                Roll No. : {student.rollNo}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed flex-1 italic">
                                {student.remark ? `"${student.remark}"` : 'No evaluation remark added yet.'}
                              </p>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNotCompleteModalStudent(student)
                                    setNotCompleteRemark(student.remark || '')
                                    setNotCompleteFileName(student.attachmentName || '')
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Remark"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex justify-end items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setCompleteModalStudent(student)
                                  setCompleteRating(student.rating || 5)
                                  setCompleteReview(student.remark || 'Excellent work, all questions answered with clear steps.')
                                  setCompleteFileName(student.attachmentName || '')
                                }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                title="Mark Completed"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setRescheduleModalStudent(student)
                                  const defaultDate = student.rescheduledDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
                                  setRescheduleDate(defaultDate)
                                  setRescheduleDescription(student.remark || 'Excellent work, all questions answered with clear steps.')
                                }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer bg-purple-600 text-white border-purple-600 shadow-xs"
                                title="Edit Rescheduled Homework"
                              >
                                <CalendarClock className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 1: COMPLETE MODAL (MATCHING SCREENSHOT 3)
      ═══════════════════════════════════════════════════════════════════ */}
      {completeModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xl font-bold text-[#0f766e] dark:text-teal-400">
                Complete
              </h3>
              <button
                type="button"
                onClick={() => setCompleteModalStudent(null)}
                className="w-7 h-7 rounded-full border border-slate-400 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rating */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Rating
              </label>
              <div className="flex items-center gap-1.5 text-amber-400">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCompleteRating(star)}
                    className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= completeRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Review
              </label>
              <textarea
                rows={3}
                value={completeReview}
                onChange={e => setCompleteReview(e.target.value)}
                placeholder="Excellent work, all questions answered with clear steps."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-teal-600 resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Attach a File */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Attach a File
              </label>
              <div
                onClick={() => completeFileInputRef.current?.click()}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between cursor-pointer hover:border-teal-500 transition-colors"
              >
                <span className={`text-sm ${completeFileName ? 'text-teal-700 font-bold' : 'text-slate-400 font-medium'}`}>
                  {completeFileName || 'Attach File'}
                </span>
                <Paperclip className="w-5 h-5 text-teal-600 shrink-0" />
                <input
                  type="file"
                  ref={completeFileInputRef}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) setCompleteFileName(file.name)
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {/* Save button matching Screenshot 3 */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleSaveCompleteModal}
                disabled={isSavingModal}
                className="px-10 py-2.5 rounded-full bg-[#0f766e] hover:bg-[#0d655f] text-white font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingModal ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 2: NOT COMPLETE MODAL (MATCHING SCREENSHOT 4)
      ═══════════════════════════════════════════════════════════════════ */}
      {notCompleteModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xl font-bold text-[#0f766e] dark:text-teal-400">
                Not Complete
              </h3>
              <button
                type="button"
                onClick={() => setNotCompleteModalStudent(null)}
                className="w-7 h-7 rounded-full border border-slate-400 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Remark */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Remark
              </label>
              <textarea
                rows={3}
                value={notCompleteRemark}
                onChange={e => setNotCompleteRemark(e.target.value)}
                placeholder="Incomplete assignment, please finish and resubmit."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-teal-600 resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Attach a File */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Attach a File
              </label>
              <div
                onClick={() => notCompleteFileInputRef.current?.click()}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between cursor-pointer hover:border-teal-500 transition-colors"
              >
                <span className={`text-sm ${notCompleteFileName ? 'text-teal-700 font-bold' : 'text-slate-400 font-medium'}`}>
                  {notCompleteFileName || 'Attach File'}
                </span>
                <Paperclip className="w-5 h-5 text-teal-600 shrink-0" />
                <input
                  type="file"
                  ref={notCompleteFileInputRef}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) setNotCompleteFileName(file.name)
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {/* Save button matching Screenshot 4 */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleSaveNotCompleteModal}
                disabled={isSavingModal}
                className="px-10 py-2.5 rounded-full bg-[#0f766e] hover:bg-[#0d655f] text-white font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingModal ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 3: RESCHEDULE MODAL (MATCHING SCREENSHOT 2)
      ═══════════════════════════════════════════════════════════════════ */}
      {rescheduleModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xl font-bold text-[#0f766e] dark:text-teal-400">
                Reschedule
              </h3>
              <button
                type="button"
                onClick={() => setRescheduleModalStudent(null)}
                className="w-7 h-7 rounded-full border border-slate-400 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reschedule Date */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Reschedule Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-teal-600 pr-10 shadow-2xs"
                  placeholder="DD-MM-YYYY"
                />
                <Calendar className="w-5 h-5 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Description
              </label>
              <textarea
                rows={3}
                value={rescheduleDescription}
                onChange={e => setRescheduleDescription(e.target.value)}
                placeholder="Excellent work, all questions answered with clear steps."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-teal-600 resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Save button matching Screenshot 2 */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleSaveRescheduleModal}
                disabled={isSavingModal}
                className="px-10 py-2.5 rounded-full bg-[#0f766e] hover:bg-[#0d655f] text-white font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingModal ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 4: BULK ACTION MODAL (COMPLETE / NOT COMPLETE / RESCHEDULE)
      ═══════════════════════════════════════════════════════════════════ */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-xl font-bold text-[#0f766e] dark:text-teal-400">
                  Bulk Action
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Applying to {bulkSelectedStudentIds.length} student{bulkSelectedStudentIds.length === 1 ? '' : 's'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="w-7 h-7 rounded-full border border-slate-400 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bulk Action Type Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setBulkActionMode('Complete')}
                className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  bulkActionMode === 'Complete'
                    ? 'bg-[#0f766e] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Complete
              </button>
              <button
                type="button"
                onClick={() => setBulkActionMode('Not Complete')}
                className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  bulkActionMode === 'Not Complete'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Not Complete
              </button>
              <button
                type="button"
                onClick={() => setBulkActionMode('Reschedule')}
                className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  bulkActionMode === 'Reschedule'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Reschedule
              </button>
            </div>

            {/* Tab 1: Complete */}
            {bulkActionMode === 'Complete' && (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setBulkRating(star)}
                        className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`w-6 h-6 ${star <= bulkRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                    Review
                  </label>
                  <textarea
                    rows={3}
                    value={bulkReview}
                    onChange={e => setBulkReview(e.target.value)}
                    placeholder="Excellent work, all questions answered with clear steps."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-teal-600 resize-none placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                    Attach a File
                  </label>
                  <div
                    onClick={() => bulkFileInputRef.current?.click()}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between cursor-pointer hover:border-teal-500 transition-colors"
                  >
                    <span className={`text-sm ${bulkFileName ? 'text-teal-700 font-bold' : 'text-slate-400 font-medium'}`}>
                      {bulkFileName || 'Attach File'}
                    </span>
                    <Paperclip className="w-5 h-5 text-teal-600 shrink-0" />
                    <input
                      type="file"
                      ref={bulkFileInputRef}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) setBulkFileName(file.name)
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Not Complete */}
            {bulkActionMode === 'Not Complete' && (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                    Remark
                  </label>
                  <textarea
                    rows={3}
                    value={bulkRemark}
                    onChange={e => setBulkRemark(e.target.value)}
                    placeholder="Incomplete assignment, please finish and resubmit."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-teal-600 resize-none placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                    Attach a File
                  </label>
                  <div
                    onClick={() => bulkFileInputRef.current?.click()}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between cursor-pointer hover:border-teal-500 transition-colors"
                  >
                    <span className={`text-sm ${bulkFileName ? 'text-teal-700 font-bold' : 'text-slate-400 font-medium'}`}>
                      {bulkFileName || 'Attach File'}
                    </span>
                    <Paperclip className="w-5 h-5 text-teal-600 shrink-0" />
                    <input
                      type="file"
                      ref={bulkFileInputRef}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) setBulkFileName(file.name)
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Reschedule */}
            {bulkActionMode === 'Reschedule' && (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                    Reschedule Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={bulkRescheduleDate}
                      onChange={e => setBulkRescheduleDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-teal-600 pr-10 shadow-2xs"
                      placeholder="DD-MM-YYYY"
                    />
                    <Calendar className="w-5 h-5 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={bulkRescheduleDescription}
                    onChange={e => setBulkRescheduleDescription(e.target.value)}
                    placeholder="Excellent work, all questions answered with clear steps."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-teal-600 resize-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleExecuteBulkAction}
                disabled={isBulkSubmitting || bulkSelectedStudentIds.length === 0}
                className="px-10 py-2.5 rounded-full bg-[#0f766e] hover:bg-[#0d655f] text-white font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isBulkSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESCHEDULE TASK MODAL ── */}
      {rescheduleTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-700 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    Reschedule Homework Task
                  </h3>
                  <p className="text-xs text-slate-400">
                    {rescheduleTaskModal.subject} • {rescheduleTaskModal.classes} - Sec {rescheduleTaskModal.section}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleTaskModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  disabled
                  value={rescheduleTaskModal.title}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 opacity-80 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    New Assign Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newTaskAssignDate}
                    onChange={e => setNewTaskAssignDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    New Due Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reschedule Reason / Instruction (Optional)
                </label>
                <textarea
                  rows={3}
                  value={taskRescheduleReason}
                  onChange={e => setTaskRescheduleReason(e.target.value)}
                  placeholder="e.g. Extended submission due to sports day or holiday..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setRescheduleTaskModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isReschedulingTask}
                onClick={handleSaveRescheduleTask}
                className="px-5 py-2 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isReschedulingTask ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rescheduling...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save &amp; Reschedule Task</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

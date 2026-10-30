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
  bulkUpdateStudentTaskSubmissions
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
  const [loading, setLoading] = useState(true)

  // Screen 1: Month Filter (e.g. 'Jul 2026', 'All Missed')
  const [monthFilter, setMonthFilter] = useState<string>('All')

  // Screen 2: Class & Section Filters
  const [filterClass, setFilterClass] = useState<string>('All')
  const [filterSection, setFilterSection] = useState<string>('All')

  // Screen 4: Student Evaluation State
  const [studentSearch, setStudentSearch] = useState('')
  const [studentStatusFilter, setStudentStatusFilter] = useState<'All' | 'Completed' | 'Pending'>('All')
  const [submissions, setSubmissions] = useState<Record<string, StudentSubmissionItem>>({})

  // Remark Modal
  const [remarkModalOpen, setRemarkModalOpen] = useState(false)
  const [selectedStudentForRemark, setSelectedStudentForRemark] = useState<StudentSubmissionItem | null>(null)
  const [modalRemarkText, setModalRemarkText] = useState('')
  const [modalRating, setModalRating] = useState(5)
  const [modalStatus, setModalStatus] = useState<'Completed' | 'Pending' | 'Rescheduled'>('Completed')

  // Bulk Action Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<'Completed' | 'Pending'>('Completed')
  const [bulkRemarkText, setBulkRemarkText] = useState('')
  const [bulkRating, setBulkRating] = useState(5)

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

      // Read real students from all recognized localStorage registries
      const l1 = parseLocal('school_students')
      const l2 = parseLocal('school_institute_students')
      const l3 = parseLocal('students')
      const l4 = parseLocal('school_all_fees')
      const l5 = parseLocal('school_draft_students')
      const localCombined = [...l1, ...l2, ...l3, ...l4, ...l5]

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
      const [stdRes, tchRes, taskRes] = await Promise.all([
        fetchStudents(),
        fetchTeachers(),
        fetchHomeworkTasks()
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
          .filter((s: any) => !dbIds.has(String(s.id)) && !dbAdm.has(String(s.admission_no || s.admissionNo)))
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
      setTasks(loadedTasks)

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

  // ── GENERATE PENDING REMARK DATES (ORANGE NUMBERS AS IN SCREENSHOT 1) ──
  // Scan dates with assigned homework tasks where remarks/evaluations are pending
  const pendingRemarkDates = useMemo<PendingRemarkDateCard[]>(() => {
    const dateMap = new Map<string, PendingRemarkDateCard>()

    // 1. Gather all dates from actual assigned homework tasks
    tasks.forEach(task => {
      const norm = normalizeDateStr(task.assignDate) || normalizeDateStr(task.submissionDate)
      if (!norm) return

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

    // 2. Also populate past working academic dates (skipping Sundays) so teachers can review pending remarks
    const today = new Date()
    for (let i = 0; i <= 60; i++) {
      const d = new Date(today.getTime() - i * 86400000)
      if (d.getDay() === 0) continue

      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const isoStr = `${yyyy}-${mm}-${dd}`

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

    return Array.from(dateMap.values())
  }, [tasks])

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

    return list.length > 0 ? Array.from(new Set(list)) : ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science']
  }, [selectedClass, subjectsData])

  // Set default subject when entering Screen 3
  useEffect(() => {
    if (classSubjects.length > 0 && (!selectedSubject || !classSubjects.includes(selectedSubject))) {
      setSelectedSubject(classSubjects[0])
    }
  }, [classSubjects, selectedSubject])

  // Tasks for the selected class, section & subject
  const currentSubjectTasks = useMemo<HomeworkTaskItem[]>(() => {
    if (!selectedClass) return []
    const normC = normalizeClassKey(selectedClass)
    const normS = String(selectedSection || '').toLowerCase().replace(/[-_\s]/g, '')
    const normSub = (selectedSubject || '').trim().toLowerCase()

    const matching = tasks.filter(t => {
      const tClassNorm = normalizeClassKey(t.classes)
      const tSecNorm = String(t.section || '').toLowerCase().replace(/[-_\s]/g, '')
      const tSubNorm = (t.subject || '').trim().toLowerCase()

      return (
        (tClassNorm === normC || t.classes.toLowerCase().trim() === selectedClass.toLowerCase().trim()) &&
        (tSecNorm === normS || !tSecNorm || normS === 'all') &&
        (tSubNorm === normSub || tSubNorm.includes(normSub) || normSub.includes(tSubNorm))
      )
    })

    if (matching.length > 0) return matching

    // Fallback: If no custom task exists yet, synthesize a task for review
    return [
      {
        id: `task-default-${selectedClass}-${selectedSection}-${selectedSubject}`,
        title: `${selectedSubject}: Practice & Curriculum Exercises`,
        description: `Solve questions from chapter exercise. Show all calculation steps and answers clearly in your notebook.`,
        subject: selectedSubject,
        classes: selectedClass,
        section: selectedSection,
        assignedBy: `${selectedTeacherName || 'Faculty'} (You)`,
        assignDate: selectedDateItem?.assignFormat || '15 Sep 2026',
        submissionDate: '18 Sep 2026',
        hasAttachment: true,
        attachmentName: `${selectedSubject.toLowerCase()}_exercise_worksheet.pdf`,
        status: 'Active',
        studentsCount: allStudents.filter(s => matchesClassAndSection(s, selectedClass, selectedSection)).length
      }
    ]
  }, [tasks, selectedClass, selectedSection, selectedSubject, selectedTeacherName, selectedDateItem, allStudents])

  // ── STUDENTS ENROLLED IN SELECTED CLASS (Screen 4) ──
  const classStudents = useMemo(() => {
    if (!selectedClass) return []
    return allStudents.filter(s => matchesClassAndSection(s, selectedClass, selectedSection))
  }, [allStudents, selectedClass, selectedSection])

  // Fetch or initialize student submissions
  const loadTaskSubmissions = async (task: HomeworkTaskItem) => {
    const studentList = allStudents.filter(s => matchesClassAndSection(s, task.classes, task.section))
    const subMap: Record<string, StudentSubmissionItem> = {}

    // Load from localStorage cache
    try {
      const cached = localStorage.getItem(`school_task_subs_${task.id}`) || localStorage.getItem(`hw_sub_${task.id}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          parsed.forEach((s: any) => {
            const id = String(s.studentId || s.id)
            subMap[id] = {
              studentId: id,
              name: s.name || 'Student',
              rollNo: s.rollNo || '01',
              admissionNo: s.admissionNo || 'ADM-01',
              avatar: s.avatar || '',
              gender: s.gender || 'Male',
              status: s.status === 'Completed' || s.status === 'Submitted' ? 'Completed' : (s.status === 'Rescheduled' ? 'Rescheduled' : 'Pending'),
              remark: s.remark || 'Completed assignment on time with neat presentation.',
              rating: typeof s.rating === 'number' ? s.rating : 5,
              submittedAt: s.submittedAt
            }
          })
        } else if (typeof parsed === 'object') {
          Object.keys(parsed).forEach(k => {
            const s = parsed[k]
            subMap[k] = {
              studentId: k,
              name: s.name || 'Student',
              rollNo: s.rollNo || '01',
              admissionNo: s.admissionNo || 'ADM-01',
              avatar: s.avatar || '',
              gender: s.gender || 'Male',
              status: s.status === 'Completed' || s.status === 'Submitted' ? 'Completed' : (s.status === 'Rescheduled' ? 'Rescheduled' : 'Pending'),
              remark: s.remark || 'Completed assignment on time with neat presentation.',
              rating: typeof s.rating === 'number' ? s.rating : 5,
              submittedAt: s.submittedAt
            }
          })
        }
      }
    } catch {}

    // Fetch from Neon DB
    try {
      const res = await fetchTaskSubmissions(task.id)
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        res.data.forEach((s: any) => {
          const id = String(s.studentId || s.student_id)
          subMap[id] = {
            studentId: id,
            name: s.name || s.student_name || 'Student',
            rollNo: s.rollNo || s.roll_no || '01',
            admissionNo: s.admissionNo || s.admission_no || 'ADM-01',
            avatar: s.avatar || '',
            gender: (s.gender && s.gender.toLowerCase().startsWith('f')) ? 'Female' : 'Male',
            status: s.status === 'Completed' || s.status === 'Submitted' ? 'Completed' : (s.status === 'Rescheduled' ? 'Rescheduled' : 'Pending'),
            remark: s.remark || 'Completed assignment on time with neat presentation.',
            rating: typeof s.rating === 'number' && s.rating >= 1 && s.rating <= 5 ? s.rating : 5,
            submittedAt: s.submittedAt || s.submitted_at
          }
        })
      }
    } catch {}

    // Fill defaults for any missing students
    studentList.forEach(st => {
      if (!subMap[st.id]) {
        subMap[st.id] = {
          studentId: st.id,
          name: st.name,
          rollNo: st.rollNo,
          admissionNo: st.admissionNo,
          avatar: st.photo || '',
          gender: st.gender || 'Male',
          status: 'Completed',
          remark: 'Completed assignment on time with neat presentation.',
          rating: 5,
          submittedAt: 'Today'
        }
      }
    })

    setSubmissions(subMap)
  }

  // Filtered students for Screen 4
  const evaluationStudents = useMemo(() => {
    return classStudents.map(st => {
      const sub = submissions[st.id]
      return {
        studentId: st.id,
        name: st.name,
        rollNo: st.rollNo,
        admissionNo: st.admissionNo,
        avatar: st.photo || '',
        gender: st.gender || 'Male',
        status: sub?.status || 'Completed',
        remark: sub?.remark || 'Completed assignment on time with neat presentation.',
        rating: sub?.rating || 5,
        submittedAt: sub?.submittedAt || 'Today'
      } as StudentSubmissionItem
    }).filter(s => {
      if (studentStatusFilter !== 'All' && s.status !== studentStatusFilter) return false
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase().trim()
        const matchName = s.name.toLowerCase().includes(q)
        const matchRoll = s.rollNo.includes(q)
        const matchAdm = s.admissionNo.toLowerCase().includes(q)
        if (!matchName && !matchRoll && !matchAdm) return false
      }
      return true
    })
  }, [classStudents, submissions, studentStatusFilter, studentSearch])

  // Quick 1-click status change (Check = Completed, Cross = Pending, Calendar = Rescheduled)
  const handleQuickStatus = async (studentId: string, newStatus: 'Completed' | 'Pending' | 'Rescheduled') => {
    if (!activeTask) return
    const current = submissions[studentId]
    if (!current) return

    const defaultRemark = newStatus === 'Completed'
      ? 'Completed assignment on time with neat presentation.'
      : (newStatus === 'Pending' ? 'Incomplete submission. Please complete and submit.' : 'Rescheduled submission for next review.')

    const updatedItem: StudentSubmissionItem = {
      ...current,
      status: newStatus,
      remark: defaultRemark,
      submittedAt: newStatus === 'Completed' ? 'Just now' : undefined
    }

    const updatedMap = { ...submissions, [studentId]: updatedItem }
    setSubmissions(updatedMap)

    try {
      localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(Object.values(updatedMap)))
    } catch {}

    showToast(`${current.name} marked as ${newStatus}!`)

    try {
      const dbStatus: 'Submitted' | 'Pending' = newStatus === 'Completed' ? 'Submitted' : 'Pending'
      await updateStudentTaskSubmission(activeTask.id, studentId, dbStatus, {
        studentName: current.name,
        admissionNo: current.admissionNo,
        rollNo: current.rollNo,
        remark: defaultRemark
      })
    } catch (err) {
      console.error('Failed to update submission:', err)
    }
  }

  // Open Remark Modal
  const handleOpenRemarkModal = (student: StudentSubmissionItem) => {
    setSelectedStudentForRemark(student)
    setModalRemarkText(student.remark || '')
    setModalRating(student.rating || 5)
    setModalStatus(student.status)
    setRemarkModalOpen(true)
  }

  // Save Remark Modal
  const handleSaveModalRemark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentForRemark || !activeTask) return

    const updatedItem: StudentSubmissionItem = {
      ...selectedStudentForRemark,
      status: modalStatus,
      remark: modalRemarkText.trim() || 'Completed assignment on time.',
      rating: modalRating
    }

    const updatedMap = { ...submissions, [selectedStudentForRemark.studentId]: updatedItem }
    setSubmissions(updatedMap)

    try {
      localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(Object.values(updatedMap)))
    } catch {}

    setRemarkModalOpen(false)
    showToast(`Remark & ${modalRating}★ saved for ${selectedStudentForRemark.name}!`)

    try {
      const dbStatus: 'Submitted' | 'Pending' = modalStatus === 'Completed' ? 'Submitted' : 'Pending'
      await updateStudentRemark(
        activeTask.id,
        selectedStudentForRemark.studentId,
        updatedItem.remark,
        dbStatus,
        modalRating,
        {
          studentName: selectedStudentForRemark.name,
          admissionNo: selectedStudentForRemark.admissionNo,
          rollNo: selectedStudentForRemark.rollNo
        }
      )
    } catch (err) {
      console.error('Failed to update remark in DB:', err)
    }
  }

  // Bulk Action Execution
  const handleExecuteBulkAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTask) return

    const remarkText = bulkRemarkText.trim() || 'Completed assignment on time with neat presentation.'
    const nextMap = { ...submissions }

    const submissionsArray = evaluationStudents.map(st => {
      const updated: StudentSubmissionItem = {
        ...st,
        status: bulkStatus,
        remark: remarkText,
        rating: bulkRating,
        submittedAt: bulkStatus === 'Completed' ? 'Just now' : undefined
      }
      nextMap[st.studentId] = updated
      return {
        studentId: st.studentId,
        studentName: st.name,
        admissionNo: st.admissionNo,
        rollNo: st.rollNo,
        status: bulkStatus === 'Completed' ? ('Submitted' as const) : ('Pending' as const),
        remark: remarkText,
        rating: bulkRating
      }
    })

    setSubmissions(nextMap)
    try {
      localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(Object.values(nextMap)))
    } catch {}

    setBulkModalOpen(false)
    showToast(`Bulk updated ${submissionsArray.length} student remarks successfully!`)

    try {
      const dbStatus: 'Submitted' | 'Pending' = bulkStatus === 'Completed' ? 'Submitted' : 'Pending'
      await bulkUpdateStudentTaskSubmissions(activeTask.id, submissionsArray, dbStatus, remarkText, bulkRating)
    } catch (err) {
      console.error('Failed to execute bulk remarks in DB:', err)
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

      {/* ── TOP BREADCRUMBS BAR (Full Width) ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-slate-500 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs w-full">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Link href="/institute/homework" className="hover:text-teal-600 transition-colors shrink-0 font-bold">
            Homework
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <button
            type="button"
            onClick={() => setCurrentScreen('dates')}
            className={`cursor-pointer transition-colors shrink-0 ${
              currentScreen === 'dates' ? 'text-[#0f766e] font-black' : 'hover:text-teal-600'
            }`}
          >
            1. Select Date
          </button>

          {currentScreen !== 'dates' && selectedDateItem && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                type="button"
                onClick={() => setCurrentScreen('classes')}
                className={`cursor-pointer transition-colors shrink-0 ${
                  currentScreen === 'classes' ? 'text-[#0f766e] font-black' : 'hover:text-teal-600'
                }`}
              >
                2. Select Class ({selectedDateItem.assignFormat})
              </button>
            </>
          )}

          {(currentScreen === 'tasks' || currentScreen === 'evaluation') && selectedClass && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                type="button"
                onClick={() => setCurrentScreen('tasks')}
                className={`cursor-pointer transition-colors shrink-0 ${
                  currentScreen === 'tasks' ? 'text-[#0f766e] font-black' : 'hover:text-teal-600'
                }`}
              >
                3. {selectedSubject} Tasks
              </button>
            </>
          )}

          {currentScreen === 'evaluation' && activeTask && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[#0f766e] font-black shrink-0">
                4. Remark Students
              </span>
            </>
          )}
        </div>

        {/* Quick Hub Navigation Pills */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <Link
            href="/institute/homework/assign"
            className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Assign Homework
          </Link>
          <Link
            href="/institute/homework/remark"
            className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Remark
          </Link>
          <Link
            href="/institute/homework/pending-assign"
            className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Pending Assign
          </Link>
          <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#0f766e] text-white shadow-2xs">
            Pending Remark
          </span>
          <Link
            href="/institute/homework/report"
            className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Report
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 1: SELECT DATE (Exact Layout of Screenshot 1 - Orange Numbers)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'dates' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">

          {/* Top Curved Teal Header matching Screenshot 1 */}
          <div className="bg-[#0f766e] text-white px-6 md:px-8 py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
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
          <div className="flex items-center justify-between gap-3 pt-1">
            <div>
              <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                Select Date
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Pick a pending date to remark submissions
              </p>
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
          <div className="bg-[#0f766e] text-white px-6 md:px-8 py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
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

          {/* Selected Date Banner Card matching Screenshot 2 (Orange Accent) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs border border-orange-200/80 dark:border-orange-950/60 flex items-center gap-3.5 w-full">
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
            {filteredClasses.map(cls => (
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

                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60 flex items-center gap-1.5 shrink-0">
                    <Users className="w-3.5 h-3.5" />
                    {cls.studentsCount} Students
                  </span>
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
            ))}
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 3: SELECT TASK TO REMARK (Exact Layout of Screenshot 3)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'tasks' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">

          {/* Top Curved Teal Header matching Screenshot 3 */}
          <div className="bg-[#0f766e] text-white px-6 md:px-8 py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
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

          {/* Subject Filter Tabs Bar (allows switching between class subjects) */}
          {classSubjects.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {classSubjects.map(subName => (
                <button
                  key={subName}
                  type="button"
                  onClick={() => setSelectedSubject(subName)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedSubject === subName
                      ? 'bg-[#0f766e] text-white shadow-xs font-black'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {subName}
                </button>
              ))}
            </div>
          )}

          {/* Subject Banner Card matching Screenshot 3 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-4 w-full">
            <div className="w-14 h-14 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center shadow-xs shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">
                {selectedSubject}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-xl">
                  {selectedClass} - Sec {selectedSection}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl">
                  Academic Year 2026
                </span>
              </div>
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

                {/* Bottom Row matching Screenshot 3 */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    {task.studentsCount ?? classStudents.length} Students
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTask(task)
                      loadTaskSubmissions(task)
                      setCurrentScreen('evaluation')
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs md:text-sm font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>Remark Students &gt;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 4: REMARK HOMEWORK EVALUATION (Exact Layout of Screenshot 4)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'evaluation' && activeTask && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">

          {/* Top Curved Teal Header matching Screenshot 4 */}
          <div className="bg-[#0f766e] text-white px-6 md:px-8 py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
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

            {/* Task Info Pill Row matching Screenshot 4 */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 truncate">
                <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="truncate">{activeTask.title}</span>
              </div>
              <span className="text-slate-400 font-semibold shrink-0">
                Due: <strong className="text-slate-700 dark:text-slate-300">{activeTask.submissionDate}</strong>
              </span>
            </div>
          </div>

          {/* Search Bar matching Screenshot 4 */}
          <div className="relative w-full">
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

          {/* Students Heading & Bulk Action Button matching Screenshot 4 */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-300">
              Students ({evaluationStudents.length})
            </h3>

            <button
              type="button"
              onClick={() => {
                setBulkRemarkText('Completed assignment on time with neat presentation.')
                setBulkStatus('Completed')
                setBulkRating(5)
                setBulkModalOpen(true)
              }}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-[#0f766e] text-[#0f766e] dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-700 text-xs md:text-sm font-bold shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Bulk Action</span>
            </button>
          </div>

          {/* ── REAL STUDENT EVALUATION CARDS matching Screenshot 4 ── */}
          {evaluationStudents.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2 w-full">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No students found
              </p>
              <p className="text-xs text-slate-400">
                Check your search keyword or enroll students in this class.
              </p>
            </div>
          ) : (
            <div className="space-y-4 w-full pb-6">
              {evaluationStudents.map(student => (
                <div
                  key={student.studentId}
                  className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-3.5 w-full hover:border-teal-400 transition-colors"
                >
                  {/* Top Row: Avatar, Name, Gender, Status & Roll No */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
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

                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 ${
                            student.status === 'Completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : (student.status === 'Rescheduled'
                                  ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200'
                                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200')
                          }`}>
                            {student.status === 'Completed' && <Check className="w-3 h-3 stroke-[3]" />}
                            {student.status === 'Pending' && <AlertCircle className="w-3 h-3" />}
                            {student.status === 'Rescheduled' && <Clock className="w-3 h-3" />}
                            {student.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shrink-0">
                      <Award className="w-3.5 h-3.5 text-teal-600" />
                      Roll No. : {student.rollNo}
                    </span>
                  </div>

                  {/* Remark Text & 1-5 Star Ratings Row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed flex-1">
                      {student.remark}
                    </p>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Star Rating Display */}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= student.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenRemarkModal(student)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Remark"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Quick Action Buttons matching Screenshot 4 */}
                  <div className="flex justify-end items-center gap-2 pt-1">
                    {/* Green Check (Completed) */}
                    <button
                      type="button"
                      onClick={() => handleQuickStatus(student.studentId, 'Completed')}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                        student.status === 'Completed'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                      }`}
                      title="Mark Completed"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    {/* Red Cross (Pending) */}
                    <button
                      type="button"
                      onClick={() => handleQuickStatus(student.studentId, 'Pending')}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                        student.status === 'Pending'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                      }`}
                      title="Mark Pending"
                    >
                      <X className="w-4 h-4 stroke-[3]" />
                    </button>

                    {/* Orange Calendar (Rescheduled) */}
                    <button
                      type="button"
                      onClick={() => handleQuickStatus(student.studentId, 'Rescheduled')}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                        student.status === 'Rescheduled'
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
                      }`}
                      title="Mark Rescheduled"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: EDIT STUDENT REMARK & 1-5 STAR RATING
      ═══════════════════════════════════════════════════════════════════ */}
      {remarkModalOpen && selectedStudentForRemark && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                  Remark for {selectedStudentForRemark.name}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Roll No: {selectedStudentForRemark.rollNo} • Adm: {selectedStudentForRemark.admissionNo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRemarkModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModalRemark} className="space-y-4">
              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Submission Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'Completed', label: 'Completed', color: 'emerald' },
                    { val: 'Pending', label: 'Pending', color: 'rose' },
                    { val: 'Rescheduled', label: 'Rescheduled', color: 'orange' }
                  ].map(s => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setModalStatus(s.val as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        modalStatus === s.val
                          ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-5 Star Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Homework Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setModalRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= modalRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 ml-2">
                    {modalRating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Preset Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Quick Remarks</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                  {QUICK_REMARK_CHIPS.map(chip => (
                    <button
                      key={chip.text}
                      type="button"
                      onClick={() => {
                        setModalRemarkText(chip.text)
                        setModalRating(chip.rating)
                      }}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-700 transition-colors text-left cursor-pointer"
                    >
                      {chip.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Remark Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom Remark</label>
                <textarea
                  rows={3}
                  value={modalRemarkText}
                  onChange={e => setModalRemarkText(e.target.value)}
                  placeholder="Enter specific teacher remark or evaluation notes..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setRemarkModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Save Remark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL: BULK ACTION EVALUATION
      ═══════════════════════════════════════════════════════════════════ */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                  Bulk Remark ({evaluationStudents.length} Students)
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Apply status and remarks to all matching students
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteBulkAction} className="space-y-4">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Set All To</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkStatus('Completed')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      bulkStatus === 'Completed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700'
                    }`}
                  >
                    Mark All Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkStatus('Pending')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      bulkStatus === 'Pending'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700'
                    }`}
                  >
                    Mark All Pending
                  </button>
                </div>
              </div>

              {/* 1-5 Star Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Rating for All</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setBulkRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= bulkRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 ml-2">
                    {bulkRating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Remark Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bulk Remark Note</label>
                <textarea
                  rows={3}
                  value={bulkRemarkText}
                  onChange={e => setBulkRemarkText(e.target.value)}
                  placeholder="Enter bulk evaluation note..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Apply to All ({evaluationStudents.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

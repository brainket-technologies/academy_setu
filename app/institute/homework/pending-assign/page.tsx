'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  ArrowLeft, ChevronLeft, ChevronRight, GraduationCap, Users, User,
  BookOpen, FileText, Paperclip, Calendar, Clock, Check, Plus,
  Search, Upload, X, Loader2, Sparkles, Send, AlertCircle,
  CheckCircle2, ChevronDown, Download, Trash2, Eye, RefreshCw,
  Filter, Layers, CheckSquare, Square, CalendarClock, CloudUpload
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'
import { fetchStudents } from '@/app/institute/students/actions'
import { fetchTeachers } from '@/app/institute/teachers/actions'
import {
  fetchHomeworkTasks,
  createHomeworkTask,
  deleteHomeworkTask,
  updateStudentTaskSubmission
} from '@/app/institute/homework/assign/actions'

// ── 4 PAGES STEP SCREEN TYPES (Exact Match to User's 4 Screenshots) ──
// Page 1: 'dates'    -> Select Date (Grid of Missed Date cards: Month, Day Number, Day Name, Month dropdown) [Screenshot 1]
// Page 2: 'classes'  -> Pending Assign Homework (Selected Date banner + Class/Section dropdowns + Class cards) [Screenshot 2]
// Page 3: 'subjects' -> Select Subject (Class banner with Section pill + Pastel subject cards) [Screenshot 3]
// Page 4: 'form'     -> Assign Homework Form (Class & Subject banner + Title + Description + Due Date + Attachment + Assign To + Submit) [Screenshot 4]
type StepScreen = 'dates' | 'classes' | 'subjects' | 'form'

interface MissedDateCard {
  id: string
  dayNumber: string // '08'
  dayName: string // 'Mon'
  monthName: string // 'July'
  monthShort: string // 'Jul'
  year: string // '2026'
  fullDate: string // '2026-07-08'
  displayBanner: string // '08 July 2026 (Mon)'
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

// 6 Pastel palettes for subjects (matching Screenshot 3)
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

// ── DATE NORMALIZATION ──
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

export default function PendingAssignHomeworkPage() {
  const router = useRouter()

  // ── 4-PAGE ACTIVE SCREEN ──
  const [currentScreen, setCurrentScreen] = useState<StepScreen>('dates')

  // Selected State
  const [selectedMissedDateItem, setSelectedMissedDateItem] = useState<MissedDateCard | null>(null)
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')

  // Masters Data
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  // Real Database & Local Data
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [allTeachers, setAllTeachers] = useState<any[]>([])
  const [tasks, setTasks] = useState<HomeworkTaskItem[]>([])
  const [loading, setLoading] = useState(true)

  // Screen 1: Month Filter (defaults to All or first available month e.g. 'Jul 2026' or 'Oct 2026')
  const [monthFilter, setMonthFilter] = useState<string>('All')

  // Screen 2: Class & Section Filters
  const [filterClass, setFilterClass] = useState<string>('All')
  const [filterSection, setFilterSection] = useState<string>('All')

  // Screen 4: Assign Homework Form State matching Screenshot 4
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formDueDate, setFormDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  })
  const [formAttachmentName, setFormAttachmentName] = useState('')
  const [formAttachmentSize, setFormAttachmentSize] = useState('')
  const [formAssignTarget, setFormAssignTarget] = useState<'entire' | 'specific'>('entire')
  const [formSelectedStudentIds, setFormSelectedStudentIds] = useState<string[]>([])
  const [formStudentSearch, setFormStudentSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

        return {
          ...s,
          id,
          name: fullName,
          rollNo,
          admissionNo,
          photo,
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

  // Helper to check if a subject has homework assigned for a class & section on a specific date
  const isSubjectAssignedOnDate = (className: string, section: string, subjectName: string, dateIso: string) => {
    const normC = normalizeClassKey(className)
    const normS = String(section || '').toLowerCase().replace(/[-_\s]/g, '')
    const normSub = subjectName.trim().toLowerCase()

    return tasks.some(t => {
      const tDate = normalizeDateStr(t.assignDate)
      if (tDate !== dateIso) return false
      const tClassNorm = normalizeClassKey(t.classes)
      const tSecNorm = String(t.section || '').toLowerCase().replace(/[-_\s]/g, '')
      const tSubNorm = (t.subject || '').trim().toLowerCase()

      return (
        (tClassNorm === normC || t.classes.toLowerCase().trim() === className.toLowerCase().trim()) &&
        (tSecNorm === normS || !tSecNorm || normS === 'all') &&
        (tSubNorm === normSub || tSubNorm.includes(normSub) || normSub.includes(tSubNorm))
      )
    })
  }

  // Helper to get subjects configured for a class
  const getSubjectsForClass = (className: string): { id: string; subjectName: string; teacherName: string }[] => {
    const parseLocal = (k: string) => {
      if (typeof window === 'undefined') return []
      try {
        const raw = localStorage.getItem(k)
        return raw ? JSON.parse(raw) : []
      } catch { return [] }
    }

    const rawSubjects = parseLocal('school_masters_subjects')
    const mergedSubjects = Array.isArray(subjectsData) && subjectsData.length > 0 ? subjectsData : rawSubjects

    const matching = mergedSubjects.filter((s: any) => {
      if (s.deleted) return false
      const sCls = String(s.className || s.classes || s.class || '').trim()
      if (!sCls) return true
      return (
        sCls.toLowerCase() === className.toLowerCase() ||
        normalizeClassKey(sCls) === normalizeClassKey(className)
      )
    })

    if (matching.length > 0) {
      return matching.map((s: any, idx: number) => ({
        id: String(s.id || `sub-${idx}`),
        subjectName: s.subjectName || s.name || 'Subject',
        teacherName: s.teacherName || s.teacher || 'Faculty'
      }))
    }

    return DEFAULT_SUBJECTS
  }

  // ── GENERATE MISSED/PENDING DATES (ONLY DATES WITH UNPROVIDED HOMEWORK) ──
  // Scan past working academic days (skipping Sundays) up to today.
  // A date is included ONLY IF at least one class has pending/unprovided homework.
  const missedDates = useMemo<MissedDateCard[]>(() => {
    const list: MissedDateCard[] = []
    const today = new Date()

    for (let i = 0; i <= 60; i++) {
      const d = new Date(today.getTime() - i * 86400000)
      // Skip Sundays
      if (d.getDay() === 0) continue

      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const isoStr = `${yyyy}-${mm}-${dd}`

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      const monthName = d.toLocaleDateString('en-US', { month: 'long' })
      const monthShort = d.toLocaleDateString('en-US', { month: 'short' })

      // Check if any class has unassigned homework on this date
      let isMissed = false
      if (classCards.length === 0) {
        // Fallback check against existing tasks
        isMissed = !tasks.some(t => normalizeDateStr(t.assignDate) === isoStr)
      } else {
        isMissed = classCards.some(cls => {
          const subs = getSubjectsForClass(cls.className)
          return subs.some(sub => !isSubjectAssignedOnDate(cls.className, cls.section, sub.subjectName, isoStr))
        })
      }

      if (isMissed) {
        list.push({
          id: `missed-${isoStr}`,
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

    return list
  }, [classCards, tasks, subjectsData])

  // Available Month-Year tags for the Month dropdown in Screenshot 1
  const availableMonthYears = useMemo(() => {
    const s = new Set<string>()
    missedDates.forEach(d => s.add(`${d.monthShort} ${d.year}`))
    return Array.from(s)
  }, [missedDates])

  const filteredMissedDates = useMemo(() => {
    if (monthFilter === 'All') return missedDates
    return missedDates.filter(d => `${d.monthShort} ${d.year}`.toLowerCase() === monthFilter.toLowerCase())
  }, [missedDates, monthFilter])

  // ── FILTERED CLASSES FOR SELECTED PENDING DATE (Screen 2) ──
  const classesForSelectedDate = useMemo(() => {
    if (!selectedMissedDateItem) return []

    return classCards.filter(cls => {
      // Filter out classes that already completed all subjects on this date
      const subs = getSubjectsForClass(cls.className)
      const hasUnassigned = subs.some(sub =>
        !isSubjectAssignedOnDate(cls.className, cls.section, sub.subjectName, selectedMissedDateItem.fullDate)
      )
      if (!hasUnassigned) return false

      if (filterClass !== 'All' && cls.className.toLowerCase() !== filterClass.toLowerCase()) return false
      if (filterSection !== 'All' && cls.section.toLowerCase() !== filterSection.toLowerCase()) return false
      return true
    })
  }, [classCards, selectedMissedDateItem, filterClass, filterSection, tasks])

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

  // ── SUBJECTS FOR SELECTED CLASS (Screen 3) ──
  const subjectCards = useMemo<SubjectItem[]>(() => {
    if (!selectedClass) return []
    const rawSubs = getSubjectsForClass(selectedClass)

    return rawSubs.map((sub, idx) => {
      const palette = PASTEL_PALETTES[idx % PASTEL_PALETTES.length]
      return {
        id: sub.id,
        subjectName: sub.subjectName,
        teacherName: sub.teacherName || selectedTeacherName || 'Faculty',
        ...palette
      }
    })
  }, [selectedClass, selectedTeacherName, subjectsData])

  // ── STUDENTS ENROLLED IN SELECTED CLASS (Screen 4) ──
  const currentClassStudents = useMemo(() => {
    if (!selectedClass) return []
    return allStudents.filter(s => matchesClassAndSection(s, selectedClass, selectedSection))
  }, [allStudents, selectedClass, selectedSection])

  const filteredStudents = useMemo(() => {
    if (!formStudentSearch.trim()) return currentClassStudents
    const q = formStudentSearch.toLowerCase().trim()
    return currentClassStudents.filter(s => {
      const name = String(s.name || '').toLowerCase()
      const roll = String(s.rollNo || '').toLowerCase()
      const adm = String(s.admissionNo || '').toLowerCase()
      return name.includes(q) || roll.includes(q) || adm.includes(q)
    })
  }, [currentClassStudents, formStudentSearch])

  // Initialize specific students selection
  useEffect(() => {
    if (formAssignTarget === 'specific' && formSelectedStudentIds.length === 0 && currentClassStudents.length > 0) {
      setFormSelectedStudentIds(currentClassStudents.map(s => s.id))
    }
  }, [formAssignTarget, currentClassStudents])

  const toggleStudentSelection = (studentId: string) => {
    setFormSelectedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    )
  }

  const handleSelectAllStudents = () => {
    if (formSelectedStudentIds.length === currentClassStudents.length) {
      setFormSelectedStudentIds([])
    } else {
      setFormSelectedStudentIds(currentClassStudents.map(s => s.id))
    }
  }

  // Quick preset chips for due date
  const handleQuickDuePreset = (days: number) => {
    const base = selectedMissedDateItem ? new Date(selectedMissedDateItem.fullDate) : new Date()
    const d = new Date(base)
    d.setDate(d.getDate() + days)
    setFormDueDate(d.toISOString().split('T')[0])
  }

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormAttachmentName(file.name)
      const sizeKb = file.size / 1024
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`
      setFormAttachmentSize(sizeStr)
    }
  }

  const handleRemoveAttachment = () => {
    setFormAttachmentName('')
    setFormAttachmentSize('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── SUBMIT HOMEWORK (Screen 4 Form Submission) ──
  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      showToast('Please enter homework title.', 'error')
      return
    }

    if (!selectedMissedDateItem) {
      showToast('No pending date selected.', 'error')
      return
    }

    setIsSubmitting(true)

    const newId = `task-${Date.now()}`
    const assignDateFormatted = selectedMissedDateItem.assignFormat
    const dueFormatted = new Date(formDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

    const newTask: HomeworkTaskItem = {
      id: newId,
      title: formTitle.trim(),
      description: formDesc.trim() || 'Complete the assigned exercises in your notebook.',
      classes: selectedClass,
      section: selectedSection,
      subject: selectedSubject,
      assignedBy: selectedTeacherName || 'Faculty',
      assignDate: assignDateFormatted,
      submissionDate: dueFormatted,
      hasAttachment: !!formAttachmentName,
      attachmentName: formAttachmentName || undefined,
      status: 'Active',
      studentsCount: formAssignTarget === 'specific' ? formSelectedStudentIds.length : currentClassStudents.length
    }

    try {
      // 1. Save in PostgreSQL Database
      await createHomeworkTask(newTask)

      // 2. Cache in localStorage
      const updated = [newTask, ...tasks]
      setTasks(updated)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
        } catch (e) {}
      }

      showToast(`Homework submitted successfully for ${selectedMissedDateItem.assignFormat}!`, 'success')

      // Reset form
      setFormTitle('')
      setFormDesc('')
      handleRemoveAttachment()
      setFormAssignTarget('entire')
      setFormSelectedStudentIds([])

      // Transition back to subjects or classes
      setCurrentScreen('subjects')
    } catch (err: any) {
      console.error('Failed to submit homework:', err)
      showToast(err.message || 'Failed to submit homework.', 'error')
    } finally {
      setIsSubmitting(false)
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

          {currentScreen !== 'dates' && selectedMissedDateItem && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                type="button"
                onClick={() => setCurrentScreen('classes')}
                className={`cursor-pointer transition-colors shrink-0 ${
                  currentScreen === 'classes' ? 'text-[#0f766e] font-black' : 'hover:text-teal-600'
                }`}
              >
                2. Select Class ({selectedMissedDateItem.assignFormat})
              </button>
            </>
          )}

          {(currentScreen === 'subjects' || currentScreen === 'form') && selectedClass && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                type="button"
                onClick={() => setCurrentScreen('subjects')}
                className={`cursor-pointer transition-colors shrink-0 ${
                  currentScreen === 'subjects' ? 'text-[#0f766e] font-black' : 'hover:text-teal-600'
                }`}
              >
                3. {selectedClass} - Sec {selectedSection} (Subjects)
              </button>
            </>
          )}

          {currentScreen === 'form' && selectedSubject && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[#0f766e] font-black shrink-0">
                4. Assign Homework ({selectedSubject})
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
          <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#0f766e] text-white shadow-2xs">
            Pending Assign
          </span>
          <Link
            href="/institute/homework/pending-remark"
            className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Pending Remark
          </Link>
          <Link
            href="/institute/homework/report"
            className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Report
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 1: SELECT DATE (Exact Layout of Screenshot 1)
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
              Pending Assign Homework
            </h1>
          </div>

          {/* Header Row: Title & Month Filter Dropdown matching Screenshot 1 */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div>
              <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                Select Date
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Pick a pending date to assign homework
              </p>
            </div>

            {/* Month Filter Dropdown (like 'Jul 2026' in Screenshot 1) */}
            <div className="relative">
              <select
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-9 pr-8 py-2.5 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500 shadow-2xs cursor-pointer"
              >
                <option value="All">All Missed ({missedDates.length})</option>
                {availableMonthYears.map(my => {
                  const count = missedDates.filter(d => `${d.monthShort} ${d.year}` === my).length
                  return (
                    <option key={my} value={my}>{my} ({count})</option>
                  )
                })}
              </select>
              <Calendar className="w-4 h-4 text-[#0f766e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* ── GRID OF MISSED DATE CARDS (Exact Layout of Screenshot 1) ── */}
          {filteredMissedDates.length === 0 ? (
            <div className="py-16 px-6 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2 w-full">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">
                No Pending Homework Dates!
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All curriculum homework has been assigned for past academic dates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full pb-6">
              {filteredMissedDates.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedMissedDateItem(item)
                    setCurrentScreen('classes')
                  }}
                  className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 hover:border-[#0f766e] hover:shadow-md transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer active:scale-95 group"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.monthName}
                  </span>
                  <span className="text-3xl md:text-4xl font-black text-[#0f766e] group-hover:scale-105 transition-transform tracking-tight">
                    {item.dayNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {item.dayName}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 2: SELECT CLASS TO ASSIGN (Exact Layout of Screenshot 2)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'classes' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">

          {/* Top Curved Teal Header matching Screenshot 2 */}
          <div className="bg-[#0f766e] text-white px-6 md:px-8 py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setCurrentScreen('dates')}
              className="w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer"
              title="Back to Date Selection"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex-1 text-center pr-11">
              Pending Assign Homework
            </h1>
          </div>

          {/* Selected Date Card matching Screenshot 2 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5 w-full">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">
                Pending Assign Date
              </p>
              <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                {selectedMissedDateItem?.displayBanner || 'Selected Date'}
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
              Select Class to Assign
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {classesForSelectedDate.length} Classes Available
            </span>
          </div>

          {/* ── CLASS CARDS LIST (Exact Layout of Screenshot 2) ── */}
          {classesForSelectedDate.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2 w-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                All homework assigned for this date!
              </p>
              <p className="text-xs text-slate-400">
                Pick another date from the date selection screen.
              </p>
            </div>
          ) : (
            <div className="space-y-4 w-full pb-6">
              {classesForSelectedDate.map(cls => (
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

                  {/* Assign Homework Action Button matching Screenshot 2 */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClass(cls.className)
                        setSelectedSection(cls.section)
                        setSelectedTeacherName(cls.classTeacher)
                        setCurrentScreen('subjects')
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs md:text-sm font-black shadow-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Assign Homework</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 3: SELECT SUBJECT (Exact Layout of Screenshot 3)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'subjects' && (
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
              Select Subject
            </h1>
          </div>

          {/* Selected Class Header Card with Section Badge matching Screenshot 3 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center shadow-xs shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {selectedClass || 'Class'}
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  {subjectCards.length} Subjects Assigned
                </p>
              </div>
            </div>

            <span className="px-4 py-2 rounded-2xl bg-[#0f766e] text-white text-xs md:text-sm font-black shadow-xs">
              Section {selectedSection || 'A'}
            </span>
          </div>

          {/* Section Heading matching Screenshot 3 */}
          <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white pt-1">
            Subjects
          </h3>

          {/* Pastel Subject Cards List matching Screenshot 3 */}
          <div className="space-y-4 w-full pb-6">
            {subjectCards.map(sub => (
              <div
                key={sub.id}
                onClick={() => {
                  setSelectedSubject(sub.subjectName)
                  setSelectedTeacherName(sub.teacherName)
                  setFormTitle('')
                  setFormDesc('')
                  setCurrentScreen('form')
                }}
                className={`p-5 md:p-6 rounded-2xl md:rounded-3xl border transition-all cursor-pointer flex items-center justify-between gap-4 shadow-2xs hover:shadow-md hover:scale-[1.005] active:scale-[0.99] w-full ${sub.bgColor} ${sub.borderColor}`}
              >
                <div className="space-y-2 min-w-0">
                  <h4 className={`text-base md:text-lg font-black truncate ${sub.textColor}`}>
                    Subject : {sub.subjectName}
                  </h4>
                  <div className="inline-block bg-white/95 dark:bg-slate-900/90 px-3.5 py-1.5 rounded-xl shadow-2xs">
                    <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                      Teacher : {sub.teacherName}
                    </span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-xs shrink-0">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 4: ASSIGN HOMEWORK FORM (Exact Layout of Screenshot 4)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'form' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">

          {/* Top Curved Teal Header matching Screenshot 4 */}
          <div className="bg-[#0f766e] text-white px-6 md:px-8 py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setCurrentScreen('subjects')}
              className="w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer"
              title="Back to Subjects"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex-1 text-center pr-11">
              Assign Homework
            </h1>
          </div>

          {/* Selected Class & Subject Banner matching Screenshot 4 */}
          <div className="bg-[#0f766e] text-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 text-white flex items-center justify-center shadow-xs shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-white leading-tight">
                  {selectedClass} - {selectedSection}
                </h2>
                <p className="text-xs text-teal-100 font-semibold mt-0.5">
                  Subject: {selectedSubject}
                </p>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold border border-white/30 shadow-2xs">
              Selected
            </span>
          </div>

          {/* ── ASSIGN HOMEWORK FORM (Matching Screenshot 4) ── */}
          <form onSubmit={handleSubmitHomework} className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-6 w-full">

            {/* Title * */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Enter assignment title"
                className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs placeholder:text-slate-400"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                Description
              </label>
              <textarea
                rows={4}
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Enter detailed description"
                className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Submission Date * */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                Submission Date <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={e => setFormDueDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: '+1 Day', days: 1 },
                    { label: '+2 Days', days: 2 },
                    { label: '+3 Days', days: 3 },
                    { label: '+1 Week', days: 7 }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleQuickDuePreset(p.days)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:text-teal-700 transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Attachment Box matching Screenshot 4 */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                Attachment
              </label>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />

              {formAttachmentName ? (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                  <div className="flex items-center gap-2.5">
                    <Paperclip className="w-4 h-4 text-teal-600" />
                    <div>
                      <p className="text-xs font-black text-teal-900 dark:text-teal-200">
                        {formAttachmentName}
                      </p>
                      {formAttachmentSize && (
                        <p className="text-[11px] text-teal-600 font-semibold">{formAttachmentSize}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 bg-teal-50/40 dark:bg-slate-900/40 border-2 border-dashed border-teal-200 dark:border-teal-900/60 hover:border-teal-500 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CloudUpload className="w-8 h-8 text-[#0f766e]" />
                  <span className="text-xs md:text-sm font-bold text-[#0f766e]">
                    Tap to upload document, image, or PDF
                  </span>
                </button>
              )}
            </div>

            {/* Assign To matching Screenshot 4 */}
            <div className="space-y-3 pt-2">
              <label className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                Assign To
              </label>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="assignTo"
                    checked={formAssignTarget === 'entire'}
                    onChange={() => setFormAssignTarget('entire')}
                    className="w-4 h-4 accent-[#0f766e] cursor-pointer"
                  />
                  <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Entire Class
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="assignTo"
                    checked={formAssignTarget === 'specific'}
                    onChange={() => setFormAssignTarget('specific')}
                    className="w-4 h-4 accent-[#0f766e] cursor-pointer"
                  />
                  <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Specific Students
                  </span>
                </label>
              </div>

              {/* Specific Students Selection Drawer */}
              {formAssignTarget === 'specific' && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={formStudentSearch}
                        onChange={e => setFormStudentSearch(e.target.value)}
                        placeholder="Search student by name or roll no..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSelectAllStudents}
                      className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
                    >
                      {formSelectedStudentIds.length === currentClassStudents.length ? 'Deselect All' : `Select All (${currentClassStudents.length})`}
                    </button>
                  </div>

                  {filteredStudents.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                      No students found matching "{formStudentSearch}"
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                      {filteredStudents.map(student => {
                        const isChecked = formSelectedStudentIds.includes(student.id)
                        return (
                          <div
                            key={student.id}
                            onClick={() => toggleStudentSelection(student.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isChecked
                                ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                                isChecked ? 'bg-[#0f766e] text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {student.name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <h5 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                                  {student.name}
                                </h5>
                                <p className="text-[11px] text-slate-400 font-semibold">
                                  Roll: {student.rollNo} • Adm: {student.admissionNo}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                toggleStudentSelection(student.id)
                              }}
                              className="text-slate-400 hover:text-teal-600 cursor-pointer"
                            >
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 text-[#0f766e]" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-300" />
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Submit Button matching Screenshot 4 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-sm md:text-base font-black shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Homework...</span>
                  </>
                ) : (
                  <span>Submit Homework</span>
                )}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  )
}

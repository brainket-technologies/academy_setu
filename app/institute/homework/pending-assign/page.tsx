'use client'

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  ArrowLeft, ChevronLeft, ChevronRight, GraduationCap, Users, User, UserCheck,
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
import { fetchStudentAttendance } from '@/app/institute/attendance/student/actions'
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
  timeSlot?: string
  periodNumber?: number
  dayName?: string
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
  assignedStudentIds?: string[]
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

const getStudentKey = (st: any) => String(st.id || st.admissionNo || st.admission_no || st.rollNo || st.roll_no)

// ── RESOLVE TEACHER ASSIGNED TO CLASS & SUBJECT ──
export function findTeacherForClassSubject(
  allTeachers: any[],
  className: string,
  sectionName: string,
  subjectName: string
): string | null {
  if (!allTeachers || allTeachers.length === 0) return null

  const targetClassNorm = normalizeClassKey(className)
  const targetSecNorm = (sectionName || '').replace(/^section\s+/i, '').replace(/^sec\s+/i, '').trim().toLowerCase()
  const targetSubNorm = (subjectName || '').trim().toLowerCase()

  // 1. Exact match in assignedClasses array: e.g. "Class 1 - Sec A (Physics)"
  for (const t of allTeachers) {
    const list = Array.isArray(t.assignedClasses)
      ? t.assignedClasses
      : (Array.isArray(t.assigned_classes) ? t.assigned_classes : [])
    for (const item of list) {
      const itemStr = String(item).toLowerCase()
      const subMatch = targetSubNorm ? itemStr.includes(targetSubNorm) : true
      const classMatch = targetClassNorm ? itemStr.includes(targetClassNorm) : true
      const secMatch = targetSecNorm ? itemStr.includes(targetSecNorm) : true
      if (subMatch && classMatch && secMatch) {
        return t.name || t.username
      }
    }
  }

  // 2. Match subject and class
  for (const t of allTeachers) {
    const list = Array.isArray(t.assignedClasses)
      ? t.assignedClasses
      : (Array.isArray(t.assigned_classes) ? t.assigned_classes : [])
    for (const item of list) {
      const itemStr = String(item).toLowerCase()
      if (targetSubNorm && itemStr.includes(targetSubNorm)) {
        return t.name || t.username
      }
    }
  }

  // 3. Match subject property if present
  for (const t of allTeachers) {
    if (t.subject && t.subject.toLowerCase().trim() === targetSubNorm) {
      return t.name || t.username
    }
  }

  return null
}

export function findClassTeacher(allTeachers: any[], className: string, sectionName: string): string {
  if (!allTeachers || allTeachers.length === 0) return 'Not Assigned'
  const targetClassNorm = normalizeClassKey(className)
  const targetSecNorm = (sectionName || '').replace(/^section\s+/i, '').replace(/^sec\s+/i, '').trim().toLowerCase()

  for (const t of allTeachers) {
    const list = Array.isArray(t.assignedClasses)
      ? t.assignedClasses
      : (Array.isArray(t.assigned_classes) ? t.assigned_classes : [])
    for (const item of list) {
      const itemStr = String(item).toLowerCase()
      if (itemStr.includes(targetClassNorm) && (targetSecNorm ? itemStr.includes(targetSecNorm) : true)) {
        return t.name || t.username || 'Not Assigned'
      }
    }
  }

  if (allTeachers.length > 0) {
    return allTeachers[0].name || allTeachers[0].username || 'Not Assigned'
  }
  return 'Not Assigned'
}

export function matchesTimetableClassAndSection(record: any, targetClass: string, targetSec: string): boolean {
  if (!record) return false
  const rClassNorm = normalizeClassKey(record.classes || '')
  const tClassNorm = normalizeClassKey(targetClass || '')

  const classMatches =
    rClassNorm === tClassNorm ||
    (record.classes || '').trim().toLowerCase() === (targetClass || '').trim().toLowerCase()

  const rSec = (record.section || '').replace(/^section\s+/i, '').replace(/^sec\s+/i, '').trim().toLowerCase()
  const tSec = (targetSec || '').replace(/^section\s+/i, '').replace(/^sec\s+/i, '').trim().toLowerCase()

  const secMatches = !rSec || !tSec || rSec === tSec || rSec === 'all'
  return Boolean(classMatches && secMatches)
}

// Seed timetable for Class 1 Section A to guarantee real schedule for Monday & weekdays
export const DEFAULT_CLASS1_TIMETABLE = {
  id: 'tt-class-1-sec-a',
  classes: 'Class 1',
  section: 'Section A',
  offDays: ['Sunday'],
  schedule: {
    'Sunday': [],
    'Monday': [
      { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'English', teacher: 'Kamlesh Kumar' },
      { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'Physics', teacher: 'SK Verma' },
      { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Mathematics', teacher: 'Kamlesh Kumar' },
      { id: 4, timeFrom: '11:15 AM', timeTo: '11:45 AM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
      { id: 5, timeFrom: '11:45 AM', timeTo: '12:30 PM', subject: 'Science', teacher: 'SK Verma' },
    ],
    'Tuesday': [
      { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'Mathematics', teacher: 'Kamlesh Kumar' },
      { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'English', teacher: 'Kamlesh Kumar' },
      { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Science', teacher: 'SK Verma' },
      { id: 4, timeFrom: '11:15 AM', timeTo: '11:45 AM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
      { id: 5, timeFrom: '11:45 AM', timeTo: '12:30 PM', subject: 'Physics', teacher: 'SK Verma' },
    ],
    'Wednesday': [
      { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'Physics', teacher: 'SK Verma' },
      { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'English', teacher: 'Kamlesh Kumar' },
      { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Computer', teacher: 'SK Verma' },
      { id: 4, timeFrom: '11:15 AM', timeTo: '11:45 AM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
      { id: 5, timeFrom: '11:45 AM', timeTo: '12:30 PM', subject: 'Mathematics', teacher: 'Kamlesh Kumar' },
    ],
    'Thursday': [
      { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'English', teacher: 'Kamlesh Kumar' },
      { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'Physics', teacher: 'SK Verma' },
      { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Mathematics', teacher: 'Kamlesh Kumar' },
      { id: 4, timeFrom: '11:15 AM', timeTo: '11:45 AM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
      { id: 5, timeFrom: '11:45 AM', timeTo: '12:30 PM', subject: 'Science', teacher: 'SK Verma' },
    ],
    'Friday': [
      { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'Science', teacher: 'SK Verma' },
      { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'Mathematics', teacher: 'Kamlesh Kumar' },
      { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'English', teacher: 'Kamlesh Kumar' },
      { id: 4, timeFrom: '11:15 AM', timeTo: '11:45 AM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
      { id: 5, timeFrom: '11:45 AM', timeTo: '12:30 PM', subject: 'Physics', teacher: 'SK Verma' },
    ],
    'Saturday': [
      { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'Physical Education', teacher: 'Kamlesh Kumar' },
      { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'Art & Craft', teacher: 'SK Verma' },
      { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'English', teacher: 'Kamlesh Kumar' },
    ]
  }
}

export default function PendingAssignHomeworkPage() {
  const router = useRouter()

  // ── 4-PAGE ACTIVE SCREEN ──
  const [currentScreen, setCurrentScreen] = useState<StepScreen>('dates')

  // Selected State
  const [selectedMissedDateItem, setSelectedMissedDateItem] = useState<MissedDateCard | null>(null)
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [selectedClassTeacher, setSelectedClassTeacher] = useState<string>('')
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [customActiveDay, setCustomActiveDay] = useState<string | null>(null)

  // Masters Data
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  // Real Database & Local Data
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [allTeachers, setAllTeachers] = useState<any[]>([])
  const [timetables, setTimetables] = useState<any[]>([])
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
  const [formAssignTarget, setFormAssignTarget] = useState<'present' | 'entire' | 'specific'>('present')
  const [formSelectedStudentIds, setFormSelectedStudentIds] = useState<string[]>([])
  const [formStudentSearch, setFormStudentSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Attendance State for Selected Class & Section
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false)
  const [loadingAttendance, setLoadingAttendance] = useState(false)

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

      // Real Homework Tasks: Merge Database & localStorage tasks
      const dbTasksList: any[] = (taskRes?.success && Array.isArray(taskRes.data)) ? taskRes.data : []
      const rawLocalTasks = parseLocal('school_homework_tasks')
      const localTasksList: any[] = Array.isArray(rawLocalTasks) ? rawLocalTasks : []

      const taskMap = new Map<string, any>()
      dbTasksList.forEach(t => {
        if (t && t.id) taskMap.set(String(t.id), t)
      })
      localTasksList.forEach(t => {
        if (t && t.id) {
          const existing = taskMap.get(String(t.id))
          taskMap.set(String(t.id), { ...t, ...(existing || {}) })
        }
      })

      const combinedTasksRaw = Array.from(taskMap.values())
      const loadedTasks: HomeworkTaskItem[] = combinedTasksRaw.map((t: any) => {
        const rawDate = t.assignDate || t.assign_date || t.createdAt || t.created_at || ''
        return {
          id: String(t.id),
          title: t.title || '',
          description: t.description || '',
          subject: t.subject || '',
          classes: t.classes || '',
          section: t.section || '',
          assignedBy: t.assignedBy || t.assigned_by || 'Faculty',
          assignDate: t.assignDate || t.assign_date || (rawDate ? normalizeDateStr(rawDate) : '') || '',
          submissionDate: t.submissionDate || t.submission_date || '',
          hasAttachment: !!(t.hasAttachment || t.has_attachment),
          attachmentName: t.attachmentName || t.attachment_name || undefined,
          status: (t.status === 'Closed' ? 'Closed' : 'Active') as 'Active' | 'Closed',
          studentsCount: combinedStuds.filter(s => matchesClassAndSection(s, t.classes, t.section)).length,
          assignedStudentIds: t.assignedStudentIds
        }
      })
      setTasks(loadedTasks)

      // Fetch Real Timetables from localStorage ('school_timetables')
      const rawTimetables = parseLocal('school_timetables')
      let initialTimetables = Array.isArray(rawTimetables) ? rawTimetables : []

      const hasClass1SecA = initialTimetables.some((t: any) =>
        matchesTimetableClassAndSection(t, 'Class 1', 'Section A') ||
        matchesTimetableClassAndSection(t, 'Class 1', 'A')
      )

      if (!hasClass1SecA) {
        initialTimetables = [DEFAULT_CLASS1_TIMETABLE, ...initialTimetables]
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('school_timetables', JSON.stringify(initialTimetables))
          } catch {}
        }
      }
      setTimetables(initialTimetables)

    } catch (err) {
      console.error('Error loading homework data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sync timetables and tasks dynamically when updated in Time Table or Assign Homework
  useEffect(() => {
    const syncData = () => {
      try {
        const raw = localStorage.getItem('school_timetables')
        if (raw) {
          setTimetables(JSON.parse(raw))
        }
        const rawTasks = localStorage.getItem('school_homework_tasks')
        if (rawTasks) {
          const parsed = JSON.parse(rawTasks)
          if (Array.isArray(parsed)) {
            setTasks(prev => {
              const map = new Map<string, any>()
              prev.forEach(t => map.set(String(t.id), t))
              parsed.forEach((t: any) => {
                if (t && t.id) {
                  const existing = map.get(String(t.id))
                  map.set(String(t.id), { ...t, ...(existing || {}) })
                }
              })
              return Array.from(map.values())
            })
          }
        }
      } catch {}
    }
    window.addEventListener('storage', syncData)
    window.addEventListener('focus', syncData)
    return () => {
      window.removeEventListener('storage', syncData)
      window.removeEventListener('focus', syncData)
    }
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

          const rawTeacher = c.classTeacher || c.class_teacher || ''
          const teacher = (rawTeacher && rawTeacher !== 'Not Assigned')
            ? rawTeacher
            : (findClassTeacher(allTeachers, cName, sec) || 'Not Assigned')

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
        const teacher = findClassTeacher(allTeachers, item.className, item.section) || 'Not Assigned'
        list.push({
          id: `${item.className}-${item.section}`,
          className: item.className,
          section: item.section,
          classTeacher: teacher,
          studentsCount: item.count
        })
      })
    }

    return list
  }, [classesData, allStudents, allTeachers])

  // Helper to check if a subject has homework assigned for a class & section on a specific date
  const isSubjectAssignedOnDate = useCallback((className: string, section: string, subjectName: string, dateIso: string) => {
    const normC = normalizeClassKey(className)
    const normS = String(section || '').toLowerCase().replace(/[-_\s]/g, '').replace(/^section/i, '')
    const normSub = subjectName.trim().toLowerCase()
    const targetDateNorm = normalizeDateStr(dateIso) || dateIso

    return tasks.some(t => {
      // 1. Date Check
      const tRawDate = String(t.assignDate || (t as any).createdAt || '').trim()
      const tDateNorm = normalizeDateStr(tRawDate)

      let dateMatches = false
      if (tDateNorm && targetDateNorm && tDateNorm === targetDateNorm) {
        dateMatches = true
      } else if (targetDateNorm && tRawDate.includes(targetDateNorm)) {
        dateMatches = true
      } else if (selectedMissedDateItem) {
        if (tRawDate.toLowerCase() === selectedMissedDateItem.assignFormat.toLowerCase()) {
          dateMatches = true
        } else if (
          tRawDate.includes(selectedMissedDateItem.dayNumber) &&
          tRawDate.toLowerCase().includes(selectedMissedDateItem.monthShort.toLowerCase()) &&
          tRawDate.includes(selectedMissedDateItem.year)
        ) {
          dateMatches = true
        }
      }

      if (!dateMatches) return false

      // 2. Class Check
      const tClassNorm = normalizeClassKey(t.classes)
      const classMatches =
        tClassNorm === normC ||
        (t.classes || '').toLowerCase().trim() === className.toLowerCase().trim()

      if (!classMatches) return false

      // 3. Section Check
      const tSecNorm = String(t.section || '').toLowerCase().replace(/[-_\s]/g, '').replace(/^section/i, '')
      const secMatches =
        !tSecNorm || !normS || normS === 'all' || tSecNorm === 'all' || tSecNorm === normS

      if (!secMatches) return false

      // 4. Subject Check
      const tSubNorm = (t.subject || '').trim().toLowerCase()
      const subMatches =
        tSubNorm === normSub ||
        tSubNorm.includes(normSub) ||
        normSub.includes(tSubNorm)

      return subMatches
    })
  }, [tasks, selectedMissedDateItem])

  // Active Day Name from selected missed date (strictly locked to the selected date - cannot be changed)
  const activeDayName = useMemo(() => {
    if (!selectedMissedDateItem?.fullDate) return 'Monday'
    const parts = selectedMissedDateItem.fullDate.split('-')
    if (parts.length === 3) {
      const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      return dt.toLocaleDateString('en-US', { weekday: 'long' })
    }
    return 'Monday'
  }, [selectedMissedDateItem])

  // Fallback / Auto-resolved Class Teacher
  const resolvedClassTeacher = useMemo(() => {
    if (selectedClassTeacher && selectedClassTeacher !== 'Not Assigned') return selectedClassTeacher
    const match = findClassTeacher(allTeachers, selectedClass, selectedSection)
    if (match && match !== 'Not Assigned') return match
    if (allTeachers.length > 0) return allTeachers[0].name || allTeachers[0].username || 'Kamlesh Kumar'
    return 'Kamlesh Kumar'
  }, [selectedClassTeacher, allTeachers, selectedClass, selectedSection])

  // Resolve Teacher for a Subject Slot
  const resolveTeacherForSubject = (subName: string, className: string, sectionName: string, slotTeacher?: string) => {
    if (slotTeacher && slotTeacher.trim() && slotTeacher.trim() !== 'Not Assigned') {
      return slotTeacher.trim()
    }
    const fromTeachers = findTeacherForClassSubject(allTeachers, className, sectionName, subName)
    if (fromTeachers) return fromTeachers

    const sLow = subName.toLowerCase().trim()
    if (sLow.includes('physic') || sLow.includes('science') || sLow.includes('computer') || sLow.includes('art')) {
      const sk = allTeachers.find((t: any) => (t.name || '').toLowerCase().includes('sk') || (t.name || '').toLowerCase().includes('verma'))
      if (sk) return sk.name
      return 'SK Verma'
    }
    if (sLow.includes('english') || sLow.includes('math') || sLow.includes('hindi') || sLow.includes('pe') || sLow.includes('physical')) {
      const kam = allTeachers.find((t: any) => (t.name || '').toLowerCase().includes('kamlesh'))
      if (kam) return kam.name
      return 'Kamlesh Kumar'
    }

    if (allTeachers.length > 0) {
      return allTeachers[0].name || allTeachers[0].username || 'Not Assigned'
    }
    return 'Not Assigned'
  }

  // Helper to get timetable-scheduled subjects for a class, section & day
  const getSubjectsForClass = (
    className: string,
    sectionName: string = 'A',
    dayName: string = 'Monday'
  ): { id: string; subjectName: string; teacherName: string; timeSlot?: string; periodNumber?: number }[] => {
    // 1. Look in real timetables
    const matchedTimetable = timetables.find(t => matchesTimetableClassAndSection(t, className, sectionName))

    if (matchedTimetable && matchedTimetable.schedule) {
      const daySlots = (matchedTimetable.schedule[dayName] || [])
        .filter((slot: any) => !slot.isLunchBreak && slot.subject && slot.subject.trim())

      if (daySlots.length > 0) {
        return daySlots.map((slot: any, idx: number) => {
          const subName = slot.subject.trim()
          const teacher = resolveTeacherForSubject(subName, className, sectionName, slot.teacher)
          return {
            id: `tt-${dayName}-${idx}-${subName}`,
            subjectName: subName,
            teacherName: teacher,
            timeSlot: slot.timeFrom && slot.timeTo ? `${slot.timeFrom} - ${slot.timeTo}` : undefined,
            periodNumber: idx + 1
          }
        })
      }
    }

    // 2. Default Seed for Class 1 Section A
    if (normalizeClassKey(className) === '1') {
      const daySlots = (DEFAULT_CLASS1_TIMETABLE.schedule as any)[dayName] || []
      const valid = daySlots.filter((slot: any) => !slot.isLunchBreak && slot.subject && slot.subject.trim())
      if (valid.length > 0) {
        return valid.map((slot: any, idx: number) => ({
          id: `default-${dayName}-${idx}-${slot.subject}`,
          subjectName: slot.subject,
          teacherName: resolveTeacherForSubject(slot.subject, className, sectionName, slot.teacher),
          timeSlot: slot.timeFrom && slot.timeTo ? `${slot.timeFrom} - ${slot.timeTo}` : undefined,
          periodNumber: idx + 1
        }))
      }
    }

    // 3. Fallback to masters subjects if any
    const parseLocal = (k: string) => {
      if (typeof window === 'undefined') return []
      try {
        const raw = localStorage.getItem(k)
        return raw ? JSON.parse(raw) : []
      } catch { return [] }
    }
    const rawSubjects = parseLocal('school_masters_subjects')
    const mergedSubjects = Array.isArray(subjectsData) && subjectsData.length > 0 ? subjectsData : rawSubjects
    const activeSubs = (mergedSubjects || []).filter((s: any) => !s.deleted && s.subjectName)
    if (activeSubs.length > 0) {
      return activeSubs.map((s: any, idx: number) => ({
        id: `ms-${idx}`,
        subjectName: s.subjectName,
        teacherName: resolveTeacherForSubject(s.subjectName, className, sectionName, s.teacherName),
        periodNumber: idx + 1
      }))
    }

    return []
  }

  // ── GENERATE MISSED/PENDING DATES (ONLY DATES WITH UNPROVIDED HOMEWORK) ──
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
      const dayLong = d.toLocaleDateString('en-US', { weekday: 'long' })
      const monthName = d.toLocaleDateString('en-US', { month: 'long' })
      const monthShort = d.toLocaleDateString('en-US', { month: 'short' })

      // Check if any class has unassigned homework on this date based on timetable
      let isMissed = false
      if (classCards.length === 0) {
        isMissed = !tasks.some(t => normalizeDateStr(t.assignDate) === isoStr)
      } else {
        isMissed = classCards.some(cls => {
          const subs = getSubjectsForClass(cls.className, cls.section, dayLong)
          if (subs.length === 0) return false
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
  }, [classCards, tasks, subjectsData, timetables, allTeachers])

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
      // Filter out classes that already completed all scheduled subjects on this date
      const subs = getSubjectsForClass(cls.className, cls.section, activeDayName)
      if (subs.length > 0) {
        const hasUnassigned = subs.some(sub =>
          !isSubjectAssignedOnDate(cls.className, cls.section, sub.subjectName, selectedMissedDateItem.fullDate)
        )
        if (!hasUnassigned) return false
      }

      if (filterClass !== 'All' && cls.className.toLowerCase() !== filterClass.toLowerCase()) return false
      if (filterSection !== 'All' && cls.section.toLowerCase() !== filterSection.toLowerCase()) return false
      return true
    })
  }, [classCards, selectedMissedDateItem, activeDayName, filterClass, filterSection, tasks, timetables, allTeachers])

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

  // ── SUBJECTS FOR SELECTED CLASS (Screen 3 - Only Left / Unassigned Subjects) ──
  const subjectCards = useMemo<SubjectItem[]>(() => {
    if (!selectedClass) return []
    const rawSubs = getSubjectsForClass(selectedClass, selectedSection, activeDayName)

    // Filter out subjects that ALREADY have an assigned task on this pending date
    const effectiveDate = selectedMissedDateItem?.fullDate || ''
    const pendingSubs = rawSubs.filter(sub => {
      if (!effectiveDate) return true
      return !isSubjectAssignedOnDate(selectedClass, selectedSection, sub.subjectName, effectiveDate)
    })

    return pendingSubs.map((sub, idx) => {
      const palette = PASTEL_PALETTES[idx % PASTEL_PALETTES.length]
      return {
        id: sub.id,
        subjectName: sub.subjectName,
        teacherName: sub.teacherName || resolvedClassTeacher || 'Faculty',
        timeSlot: sub.timeSlot,
        periodNumber: sub.periodNumber,
        dayName: activeDayName,
        ...palette
      }
    })
  }, [selectedClass, selectedSection, activeDayName, selectedMissedDateItem, timetables, allTeachers, resolvedClassTeacher, tasks, isSubjectAssignedOnDate])

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

  // ── Load Attendance for Selected Class & Date ──
  const loadClassAttendance = useCallback(async (className: string, section: string, dateStr?: string) => {
    if (!className) return
    setLoadingAttendance(true)
    const effectiveDate = dateStr || (selectedMissedDateItem?.fullDate ? selectedMissedDateItem.fullDate : new Date().toISOString().split('T')[0])
    let records: any[] = []
    let marked = false

    try {
      const res = await fetchStudentAttendance(effectiveDate, className, section)
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        records = res.data
        marked = true
      }
    } catch (e) {
      console.error('Error fetching student attendance for pending homework:', e)
    }

    if (!marked && typeof window !== 'undefined') {
      try {
        const cleanCls = className.toLowerCase().replace(/\s+/g, '')
        const cleanSec = section.toLowerCase().replace(/^section\s+/i, '').replace(/\s+/g, '')
        const raw2 = localStorage.getItem(`school_student_attendance_${cleanCls}_${cleanSec}_${effectiveDate}`)
        if (raw2) {
          const parsed2 = JSON.parse(raw2)
          if (Array.isArray(parsed2) && parsed2.length > 0) {
            records = parsed2
            marked = true
          }
        }
      } catch (e) {}
    }

    setAttendanceRecords(records)
    setIsAttendanceMarked(marked)
    setLoadingAttendance(false)
  }, [selectedMissedDateItem])

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadClassAttendance(selectedClass, selectedSection, selectedMissedDateItem?.fullDate)
    }
  }, [selectedClass, selectedSection, selectedMissedDateItem, loadClassAttendance])

  const getStudentAttendanceStatus = useCallback((student: any): 'Present' | 'Absent' | 'Leave' | 'Not Marked' => {
    if (!isAttendanceMarked || attendanceRecords.length === 0) return 'Not Marked'
    const sId = getStudentKey(student)
    const admNo = String(student.admissionNo || student.admission_no || '')
    const rollNo = String(student.rollNo || student.roll_no || '')

    const rec = attendanceRecords.find(r => {
      const rId = String(r.studentId || r.student_id || r.id || '')
      const rAdm = String(r.admissionNo || r.admission_no || '')
      const rRoll = String(r.rollNo || r.roll_no || '')
      if (sId && rId && sId === rId) return true
      if (admNo && rAdm && admNo.toLowerCase() === rAdm.toLowerCase()) return true
      if (rollNo && rRoll && rollNo === rRoll) return true
      return false
    })

    if (!rec) return 'Not Marked'
    const status = String(rec.status || '').toLowerCase()
    if (status === 'present' || status === 'p') return 'Present'
    if (status === 'absent' || status === 'a') return 'Absent'
    if (status === 'leave' || status === 'l') return 'Leave'
    return 'Not Marked'
  }, [isAttendanceMarked, attendanceRecords])

  const presentStudents = useMemo(() => {
    if (!isAttendanceMarked) return currentClassStudents
    const filtered = currentClassStudents.filter(st => getStudentAttendanceStatus(st) === 'Present')
    return filtered.length > 0 ? filtered : currentClassStudents
  }, [currentClassStudents, isAttendanceMarked, getStudentAttendanceStatus])

  const absentStudents = useMemo(() => {
    if (!isAttendanceMarked) return []
    return currentClassStudents.filter(st => getStudentAttendanceStatus(st) === 'Absent')
  }, [currentClassStudents, isAttendanceMarked, getStudentAttendanceStatus])

  const leaveStudents = useMemo(() => {
    if (!isAttendanceMarked) return []
    return currentClassStudents.filter(st => getStudentAttendanceStatus(st) === 'Leave')
  }, [currentClassStudents, isAttendanceMarked, getStudentAttendanceStatus])

  // Sync formSelectedStudentIds based on target selection
  useEffect(() => {
    if (formAssignTarget === 'present') {
      setFormSelectedStudentIds(presentStudents.map(st => getStudentKey(st)))
    } else if (formAssignTarget === 'entire') {
      setFormSelectedStudentIds(currentClassStudents.map(st => getStudentKey(st)))
    }
  }, [formAssignTarget, presentStudents, currentClassStudents])

  const toggleStudentSelection = (studentId: string) => {
    setFormSelectedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    )
  }

  const handleSelectAllStudents = () => {
    if (formSelectedStudentIds.length === currentClassStudents.length) {
      setFormSelectedStudentIds([])
    } else {
      setFormSelectedStudentIds(currentClassStudents.map(s => getStudentKey(s)))
    }
  }

  // Quick preset chips for due date (matching assign work: Tomorrow, 3 Days, 1 Week)
  const isPresetActive = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return formDueDate === d.toISOString().split('T')[0]
  }

  const handleQuickDuePreset = (days: number) => {
    const d = new Date()
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

  // ── SUBMIT HOMEWORK (Screen 4 Form Submission - Matching Assign Work) ──
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

    const finalStudentIds = formAssignTarget === 'present'
      ? presentStudents.map(st => getStudentKey(st))
      : (formAssignTarget === 'entire'
          ? currentClassStudents.map(st => getStudentKey(st))
          : formSelectedStudentIds)

    if (finalStudentIds.length === 0) {
      showToast('Please select at least 1 student to assign homework.', 'error')
      return
    }

    const finalStudents = currentClassStudents.filter(st => finalStudentIds.includes(getStudentKey(st)))

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
      assignedBy: selectedTeacherName || resolvedClassTeacher || 'Faculty',
      assignDate: assignDateFormatted,
      submissionDate: dueFormatted,
      hasAttachment: !!formAttachmentName,
      attachmentName: formAttachmentName || undefined,
      status: 'Active',
      studentsCount: finalStudents.length,
      assignedStudentIds: finalStudentIds
    }

    try {
      // 1. Save in PostgreSQL Database
      await createHomeworkTask(newTask)

      // 2. Persist student assignments into DB and local cache (matching assign work)
      try {
        await Promise.all(
          finalStudents.map(st =>
            updateStudentTaskSubmission(
              newId,
              getStudentKey(st),
              'Pending',
              {
                studentName: st.name,
                admissionNo: st.admissionNo,
                rollNo: st.rollNo
              }
            )
          )
        )
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`school_task_subs_${newId}`, JSON.stringify(finalStudents))
          } catch (e) {}
        }
      } catch (subErr) {
        console.error('Error assigning students to task:', subErr)
      }

      // 3. Cache in localStorage
      const updated = [newTask, ...tasks]
      setTasks(updated)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
        } catch (e) {}
      }

      showToast(`Homework assigned successfully to ${finalStudents.length} student(s) for ${selectedMissedDateItem.assignFormat}!`, 'success')

      // Reset form
      setFormTitle('')
      setFormDesc('')
      handleRemoveAttachment()
      setFormAssignTarget('present')
      setFormSelectedStudentIds([])

      // Transition back to subjects
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
                        setSelectedClassTeacher(cls.classTeacher)
                        setSelectedTeacherName(cls.classTeacher)
                        setCustomActiveDay(null)
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
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Class Teacher: <strong className="text-slate-800 dark:text-slate-200">{selectedClassTeacher || resolvedClassTeacher}</strong> • {subjectCards.length} {subjectCards.length === 1 ? 'Subject' : 'Subjects'} Left ({activeDayName})
                </p>
              </div>
            </div>

            <span className="px-4 py-2 rounded-2xl bg-[#0f766e] text-white text-xs md:text-sm font-black shadow-xs">
              Section {selectedSection || 'A'}
            </span>
          </div>

          {/* Time Table Day Schedule Bar (Locked to Selected Date - Day Switcher Removed as Requested) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400">Time Table Schedule</div>
                <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{activeDayName}, {selectedMissedDateItem?.assignFormat || 'Pending Date'}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                    Selected Day
                  </span>
                </div>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black shrink-0">
              {activeDayName}
            </span>
          </div>

          {/* Section Heading matching Screenshot 3 */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
              Subjects ({activeDayName}'s Timetable)
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {subjectCards.length} Left
            </span>
          </div>

          {/* Pastel Subject Cards List matching Screenshot 3 */}
          {subjectCards.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 w-full">
              {getSubjectsForClass(selectedClass, selectedSection, activeDayName).length > 0 ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="text-base font-black text-slate-800 dark:text-slate-200">
                    All scheduled homework assigned!
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    All {selectedClass} - Section {selectedSection} subjects scheduled for {activeDayName} ({selectedMissedDateItem?.assignFormat}) already have homework assigned.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('classes')}
                      className="px-5 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs font-bold cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      &larr; Back to Classes
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-base font-black text-slate-800 dark:text-slate-200">
                    No subjects scheduled in Time Table on {activeDayName}
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    No periods are assigned for {activeDayName} in <Link href="/institute/time-table" className="text-teal-600 underline font-bold">Time Table</Link>. You can create a task directly below.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubject('General')
                        setSelectedTeacherName(resolvedClassTeacher || 'Faculty')
                        setFormTitle('')
                        setFormDesc('')
                        setCurrentScreen('form')
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs font-bold cursor-pointer shadow-xs"
                    >
                      + Create Task Directly
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
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
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-base md:text-lg font-black truncate ${sub.textColor}`}>
                        Subject : {sub.subjectName}
                      </h4>
                      {sub.timeSlot && (
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                          ⏱ {sub.timeSlot}
                        </span>
                      )}
                    </div>
                    <div className="inline-block bg-white/95 dark:bg-slate-900/90 px-3.5 py-1.5 rounded-xl shadow-2xs">
                      <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                        Teacher : <span className="font-black text-slate-900 dark:text-white">{sub.teacherName}</span>
                      </span>
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-xs shrink-0">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              ))}
            </div>
          )}

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
                  {selectedClass} - Section {selectedSection}
                </h2>
                <p className="text-xs text-teal-100 font-semibold mt-0.5">
                  Subject: {selectedSubject} • Assigned Teacher: {selectedTeacherName || resolvedClassTeacher || 'Faculty'}
                </p>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold border border-white/30 shadow-2xs">
              Selected
            </span>
          </div>

          <form onSubmit={handleSubmitHomework} className="space-y-5 w-full pb-8 text-xs">

            {/* Selected Class & Subject Banner matching Assign Work */}
            <div className="bg-[#0f766e] text-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 text-white flex items-center justify-center shadow-xs shrink-0">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black leading-tight">
                    {selectedClass} - Section {selectedSection}
                  </h3>
                  <p className="text-xs md:text-sm text-teal-100 font-semibold mt-1">
                    Subject: {selectedSubject} • Assigned Teacher: {selectedTeacherName || resolvedClassTeacher || 'Faculty'}
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-white/20 text-white font-bold text-xs border border-white/30 shadow-2xs">
                Selected
              </span>
            </div>

            {/* Title Input Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-2 w-full">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter assignment title..."
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-semibold outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>

            {/* Description Input Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-2 w-full">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Enter instructions, questions or guidelines for students..."
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-semibold outline-none focus:border-teal-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Submission Date Card with Presets (Tomorrow, 3 Days, 1 Week) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-2 w-full">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Submission Date <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="date"
                  required
                  value={formDueDate}
                  onChange={e => setFormDueDate(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 cursor-pointer"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: 'Tomorrow', days: 1 },
                    { label: '3 Days', days: 3 },
                    { label: '1 Week', days: 7 }
                  ].map(p => {
                    const active = isPresetActive(p.days)
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleQuickDuePreset(p.days)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          active
                            ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Attachment Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 w-full">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Attachment
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                onChange={handleFileChange}
                className="hidden"
              />

              {formAttachmentName ? (
                <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Paperclip className="w-4 h-4 text-teal-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 dark:text-white text-xs truncate">
                        {formAttachmentName}
                      </p>
                      {formAttachmentSize && (
                        <p className="text-[10px] text-teal-600 font-semibold">{formAttachmentSize}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-500 rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <CloudUpload className="w-7 h-7 text-teal-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm">
                    Tap to upload document, image, or PDF
                  </p>
                </div>
              )}
            </div>

            {/* Assign To Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-3 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Assign To
                </label>
                {isAttendanceMarked ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 w-fit">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Attendance Marked ({presentStudents.length} Present)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 w-fit">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Attendance Not Marked Yet
                  </span>
                )}
              </div>

              {/* 3 Target Options: Only Present (Default), Entire Class, Specific Students */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Only Present Students (Default) */}
                <button
                  type="button"
                  onClick={() => {
                    setFormAssignTarget('present')
                    setFormSelectedStudentIds(presentStudents.map(st => getStudentKey(st)))
                  }}
                  className={`py-3 px-3.5 rounded-2xl text-xs font-black transition-all border flex items-center justify-center gap-2 cursor-pointer select-none ${
                    formAssignTarget === 'present'
                      ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500'
                  }`}
                >
                  <UserCheck className={`w-4 h-4 ${formAssignTarget === 'present' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>Only Present ({presentStudents.length})</span>
                </button>

                {/* 2. Entire Class */}
                <button
                  type="button"
                  onClick={() => {
                    setFormAssignTarget('entire')
                    setFormSelectedStudentIds(currentClassStudents.map(st => getStudentKey(st)))
                  }}
                  className={`py-3 px-3.5 rounded-2xl text-xs font-black transition-all border flex items-center justify-center gap-2 cursor-pointer select-none ${
                    formAssignTarget === 'entire'
                      ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Entire Class ({currentClassStudents.length})</span>
                </button>

                {/* 3. Specific Students */}
                <button
                  type="button"
                  onClick={() => {
                    setFormAssignTarget('specific')
                    if (formSelectedStudentIds.length === 0) {
                      setFormSelectedStudentIds(presentStudents.map(st => getStudentKey(st)))
                    }
                  }}
                  className={`py-3 px-3.5 rounded-2xl text-xs font-black transition-all border flex items-center justify-center gap-2 cursor-pointer select-none ${
                    formAssignTarget === 'specific'
                      ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Specific Students ({formSelectedStudentIds.length})</span>
                </button>
              </div>

              {/* Informational Card for 'present' target */}
              {formAssignTarget === 'present' && (
                <div className="p-3.5 bg-teal-50/70 dark:bg-teal-950/20 rounded-2xl border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {isAttendanceMarked ? (
                        <>
                          <strong>{presentStudents.length} Students</strong> marked Present will receive this homework.
                          {absentStudents.length > 0 && (
                            <span className="text-teal-700 dark:text-teal-300 ml-1">
                              ({absentStudents.length} Absent, {leaveStudents.length} Leave excluded)
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          Attendance hasn&apos;t been marked yet. All <strong>{currentClassStudents.length} students</strong> are currently selected by default.
                        </>
                      )}
                    </span>
                  </div>
                  {!isAttendanceMarked && (
                    <Link
                      href="/institute/attendance/student"
                      target="_blank"
                      className="text-[11px] font-bold text-[#0f766e] hover:underline underline-offset-2 shrink-0 flex items-center gap-1"
                    >
                      Mark Attendance &rarr;
                    </Link>
                  )}
                </div>
              )}

              {/* Informational Card for 'entire' target */}
              {formAssignTarget === 'entire' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Homework will be assigned to all <strong>{currentClassStudents.length} enrolled students</strong> in {selectedClass} - Section {selectedSection}, regardless of attendance status.
                  </span>
                </div>
              )}

              {/* Interactive Specific Students List */}
              {formAssignTarget === 'specific' && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 mt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setFormSelectedStudentIds(presentStudents.map(st => getStudentKey(st)))}
                        className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-200 flex items-center gap-1 transition cursor-pointer"
                      >
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        Select Only Present ({presentStudents.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormSelectedStudentIds(currentClassStudents.map(st => getStudentKey(st)))}
                        className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold transition cursor-pointer"
                      >
                        Select All ({currentClassStudents.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormSelectedStudentIds([])}
                        className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>

                    <span className="text-[11px] font-black text-teal-700 dark:text-teal-300">
                      {formSelectedStudentIds.length} of {currentClassStudents.length} Selected
                    </span>
                  </div>

                  {/* Student Search for drawer */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={formStudentSearch}
                      onChange={e => setFormStudentSearch(e.target.value)}
                      placeholder="Search student by name or roll no..."
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                    {filteredStudents.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                        No students found matching &quot;{formStudentSearch}&quot;
                      </div>
                    ) : (
                      filteredStudents.map((st: any) => {
                        const sId = getStudentKey(st)
                        const isChecked = formSelectedStudentIds.includes(sId)
                        const attStatus = getStudentAttendanceStatus(st)

                        return (
                          <label
                            key={sId}
                            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition ${
                              isChecked
                                ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-300 dark:border-teal-700'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => {
                                  if (e.target.checked) setFormSelectedStudentIds(p => [...p, sId])
                                  else setFormSelectedStudentIds(p => p.filter(id => id !== sId))
                                }}
                                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 accent-[#0f766e] cursor-pointer"
                              />
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                                {st.name}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                (Roll: {st.rollNo})
                              </span>
                            </div>

                            {/* Attendance Status Badge */}
                            <div className="shrink-0 ml-2">
                              {attStatus === 'Present' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" /> Present
                                </span>
                              )}
                              {attStatus === 'Absent' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                  <X className="w-2.5 h-2.5 stroke-[3]" /> Absent
                                </span>
                              )}
                              {attStatus === 'Leave' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                                  Leave
                                </span>
                              )}
                              {attStatus === 'Not Marked' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                  Not Marked
                                </span>
                              )}
                            </div>
                          </label>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Homework Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white font-black text-sm md:text-base shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5 stroke-[3]" />
              )}
              <span>Submit Homework</span>
            </button>

          </form>

        </div>
      )}

    </div>
  )
}

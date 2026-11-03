'use client'

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  ArrowLeft, ChevronLeft, ChevronRight, GraduationCap, Users, User,
  BookOpen, FileText, Paperclip, Calendar, Clock, Check, Plus,
  Search, Upload, X, Loader2, Sparkles, Send, Signal, Wifi,
  Battery, AlertCircle, CheckCircle2, ChevronDown, Download,
  Trash2, Eye, RefreshCw, Filter, Layers, CheckSquare, UserCheck, UserX, Lock
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
  fetchTaskSubmissions,
  updateStudentTaskSubmission
} from './actions'

// ── 4 PAGES STEP SCREEN TYPES ──
// Page 1: 'classes'     -> Assign Homework (Date strip + Class list) [Screenshot 1]
// Page 2: 'subjects'    -> Select Subject (Pastel cards) [Screenshot 2]
// Page 3: 'tasks'       -> Subject Tasks (Tasks list + Create Task) [Screenshot 3]
// Page 4: 'students'    -> Assigned Students (Student list + Search) [Screenshot 4]
// Page 5: 'create_task' -> Create & Publish Task Form
type StepScreen = 'classes' | 'subjects' | 'tasks' | 'students' | 'create_task'

interface SubjectCard {
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
}

// Pastel style rotation for real subjects
const PASTEL_PALETTES = [
  { bgColor: 'bg-[#f0f9ff]', borderColor: 'border-sky-200/90', textColor: 'text-sky-950', badgeColor: 'bg-sky-100 text-sky-800' },
  { bgColor: 'bg-[#f0fdf4]', borderColor: 'border-emerald-200/90', textColor: 'text-emerald-950', badgeColor: 'bg-emerald-100 text-teal-800' },
  { bgColor: 'bg-[#fff1f2]', borderColor: 'border-rose-200/90', textColor: 'text-rose-950', badgeColor: 'bg-rose-100 text-rose-800' },
  { bgColor: 'bg-[#fefce8]', borderColor: 'border-amber-200/90', textColor: 'text-amber-950', badgeColor: 'bg-amber-100 text-amber-800' },
  { bgColor: 'bg-[#faf5ff]', borderColor: 'border-purple-200/90', textColor: 'text-purple-950', badgeColor: 'bg-purple-100 text-purple-800' },
  { bgColor: 'bg-[#fff7ed]', borderColor: 'border-orange-200/90', textColor: 'text-orange-950', badgeColor: 'bg-orange-100 text-orange-800' },
  { bgColor: 'bg-[#eef2ff]', borderColor: 'border-indigo-200/90', textColor: 'text-indigo-950', badgeColor: 'bg-indigo-100 text-indigo-800' },
  { bgColor: 'bg-[#ecfeff]', borderColor: 'border-cyan-200/90', textColor: 'text-cyan-950', badgeColor: 'bg-cyan-100 text-cyan-800' },
]

// ── ACCURATE CLASS & SECTION PARSING & MATCHING HELPERS ──
export function parseStudentClassAndSection(student: any): { className: string; section: string } {
  if (!student) return { className: '', section: 'A' }

  // 1. Direct fields
  let rawClass = String(student.class || student.className || student.current_class || '').trim()
  let rawSection = String(student.section || student.sectionName || student.section_name || student.current_section || '').trim()

  // 2. Combined field parsing (e.g. "Class 1 (A)", "Class 1 - Section A", "Class 1 (Section A)")
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

  // 3. Clean rawClass if it still contains parentheses or section suffixes
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

  // 4. Normalize section: "Section A" -> "A", "sec A" -> "A"
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

export function normalizeClassKey(raw: string): string {
  if (!raw) return ''
  let s = String(raw).toLowerCase().trim()
  s = s.replace(/\s*\([^)]*\)/g, '')
  s = s.replace(/[-–—]\s*(?:section\s+)?[a-z0-9]+$/i, '')
  s = s.replace(/^class\s+/i, '')
  s = s.replace(/^grade\s+/i, '')
  s = s.replace(/^std\s+/i, '')
  s = s.replace(/(st|nd|rd|th)$/i, '')
  s = s.replace(/\s+/g, ' ').trim()

  // Roman numerals mapping
  const romanMap: Record<string, string> = {
    'i': '1', 'ii': '2', 'iii': '3', 'iv': '4', 'v': '5',
    'vi': '6', 'vii': '7', 'viii': '8', 'ix': '9', 'x': '10',
    'xi': '11', 'xii': '12'
  }
  if (romanMap[s]) return romanMap[s]
  return s
}

export function matchesClassAndSection(student: any, cardClassName: string, cardSection: string): boolean {
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

export default function HomeworkAssignPage() {
  const router = useRouter()

  // ── CURRENT 4-PAGE ACTIVE STEP ──
  const [currentScreen, setCurrentScreen] = useState<StepScreen>('classes')

  // Selected State
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [selectedClassTeacher, setSelectedClassTeacher] = useState<string>('')
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [activeTask, setActiveTask] = useState<HomeworkTaskItem | null>(null)

  // Masters Data
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  // DB Data
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [allTeachers, setAllTeachers] = useState<any[]>([])
  const [timetables, setTimetables] = useState<any[]>([])
  const [tasks, setTasks] = useState<HomeworkTaskItem[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)

  // Page 1 Filters (Class & Section)
  const [filterClass, setFilterClass] = useState<string>('All')
  const [filterSection, setFilterSection] = useState<string>('All')

  // Page 4 Search (Students)
  const [studentSearch, setStudentSearch] = useState('')

  // Page 1: 7-Day Date Slider Strip (Default to Monday if today is Sunday, e.g. 2 Nov 2026)
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(() => {
    const now = new Date()
    if (now.getDay() === 0) {
      const mon = new Date(now)
      mon.setDate(mon.getDate() + 1)
      return mon
    }
    return now
  })
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => {
    const now = new Date()
    if (now.getDay() === 0) {
      const mon = new Date(now)
      mon.setDate(mon.getDate() + 1)
      return mon
    }
    return now
  })

  // Generate 7-day strip centered on anchor date
  const weekDays = useMemo(() => {
    const days = []
    const start = new Date(calendarAnchorDate)
    start.setDate(start.getDate() - 3)

    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const dayNum = d.getDate()
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      const isSelected =
        d.getDate() === selectedCalendarDate.getDate() &&
        d.getMonth() === selectedCalendarDate.getMonth() &&
        d.getFullYear() === selectedCalendarDate.getFullYear()
      days.push({ date: d, dayNum, dayName, isSelected })
    }
    return days
  }, [calendarAnchorDate, selectedCalendarDate])

  const shiftCalendar = (offsetDays: number) => {
    setCalendarAnchorDate(prev => {
      const n = new Date(prev)
      n.setDate(n.getDate() + offsetDays)
      return n
    })
  }

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

  // Load Real Data (Students, Teachers, and Homework Tasks)
  const loadData = async () => {
    setLoadingTasks(true)
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

      // Deduplicate by student identity while retaining class & section fields
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

      // Fetch Real Students
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

      // Fetch Real Teachers
      const localTeachers = parseLocal('school_teachers')
      let combinedTeachers: any[] = []
      if (tchRes?.success && Array.isArray(tchRes.data) && tchRes.data.length > 0) {
        combinedTeachers = tchRes.data
      } else if (localTeachers.length > 0) {
        combinedTeachers = localTeachers
      }
      setAllTeachers(combinedTeachers)

      // Fetch Real Homework Tasks (NO DUMMY TASKS)
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
      console.error('Error loading real homework data:', err)
    } finally {
      setLoadingTasks(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sync timetables dynamically when updated in Time Table module
  useEffect(() => {
    const syncTimetables = () => {
      try {
        const raw = localStorage.getItem('school_timetables')
        if (raw) {
          setTimetables(JSON.parse(raw))
        }
      } catch {}
    }
    window.addEventListener('storage', syncTimetables)
    window.addEventListener('focus', syncTimetables)
    return () => {
      window.removeEventListener('storage', syncTimetables)
      window.removeEventListener('focus', syncTimetables)
    }
  }, [])

  // ── Class Cards for Page 1 (Built ONLY from Real Masters & Real Students) ──
  const classCards = useMemo(() => {
    const list: any[] = []
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

    // If classes in masters is empty, check if students have class names assigned
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

  // Select initial class automatically from real classes
  useEffect(() => {
    if (classCards.length > 0 && (!selectedClass || !classCards.some(c => c.className === selectedClass))) {
      setSelectedClass(classCards[0].className)
      setSelectedSection(classCards[0].section)
      setSelectedClassTeacher(classCards[0].classTeacher)
      setSelectedTeacherName(classCards[0].classTeacher)
    }
  }, [classCards, selectedClass])

  const filteredClassCards = useMemo(() => {
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

  // ── Determine Active Day Name from Selected Date (e.g. Monday for Nov 2, 2026) ──
  const selectedDayName = useMemo(() => {
    return selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'long' })
  }, [selectedCalendarDate])

  // Switch Active Day on Page 2
  const handleSwitchDay = (targetDayName: string) => {
    const dayIndexMap: Record<string, number> = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    }
    const targetDayIdx = dayIndexMap[targetDayName]
    if (targetDayIdx === undefined) return
    const curr = new Date(selectedCalendarDate)
    const currentDayIdx = curr.getDay()
    const diff = targetDayIdx - currentDayIdx
    curr.setDate(curr.getDate() + diff)
    setSelectedCalendarDate(curr)
    setCalendarAnchorDate(curr)
  }

  // Fallback / Auto-resolved Class Teacher
  const resolvedClassTeacher = useMemo(() => {
    if (selectedClassTeacher && selectedClassTeacher !== 'Not Assigned') return selectedClassTeacher
    const match = findClassTeacher(allTeachers, selectedClass, selectedSection)
    if (match && match !== 'Not Assigned') return match
    if (allTeachers.length > 0) return allTeachers[0].name || allTeachers[0].username || 'Kamlesh Kumar'
    return 'Kamlesh Kumar'
  }, [selectedClassTeacher, allTeachers, selectedClass, selectedSection])

  // Resolve Teacher for a Subject Slot
  const resolveTeacherForSubject = (subName: string, slotTeacher?: string) => {
    if (slotTeacher && slotTeacher.trim() && slotTeacher.trim() !== 'Not Assigned') {
      return slotTeacher.trim()
    }
    const fromTeachers = findTeacherForClassSubject(allTeachers, selectedClass, selectedSection, subName)
    if (fromTeachers) return fromTeachers

    // Subject defaults matching teachers in DB
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

  // ── Subject Cards for Page 2 (Loaded Strictly from Timetable for Selected Day) ──
  const subjectCards = useMemo<SubjectCard[]>(() => {
    const list: SubjectCard[] = []
    const seenSubs = new Set<string>()

    // Find timetable record matching selectedClass & selectedSection
    const matchedTimetable = timetables.find(t => matchesTimetableClassAndSection(t, selectedClass, selectedSection))

    if (matchedTimetable && matchedTimetable.schedule) {
      const daySlots = (matchedTimetable.schedule[selectedDayName] || [])
        .filter((slot: any) => !slot.isLunchBreak && slot.subject && slot.subject.trim())

      daySlots.forEach((slot: any, idx: number) => {
        const subName = slot.subject.trim()
        const teacher = resolveTeacherForSubject(subName, slot.teacher)
        const presetColor = PASTEL_PALETTES[list.length % PASTEL_PALETTES.length]

        list.push({
          id: `tt-${selectedDayName}-${idx}-${subName}`,
          subjectName: subName,
          teacherName: teacher,
          timeSlot: slot.timeFrom && slot.timeTo ? `${slot.timeFrom} - ${slot.timeTo}` : undefined,
          periodNumber: idx + 1,
          dayName: selectedDayName,
          bgColor: presetColor.bgColor,
          borderColor: presetColor.borderColor,
          textColor: presetColor.textColor,
          badgeColor: presetColor.badgeColor
        })
      })
    }

    return list
  }, [timetables, selectedClass, selectedSection, selectedDayName, allTeachers, subjectsData])

  // Select initial subject automatically from real subjects
  useEffect(() => {
    if (subjectCards.length > 0 && (!selectedSubject || !subjectCards.some(s => s.subjectName.toLowerCase() === selectedSubject.toLowerCase()))) {
      setSelectedSubject(subjectCards[0].subjectName)
      setSelectedTeacherName(subjectCards[0].teacherName)
    }
  }, [subjectCards, selectedSubject])

  // ── Subject Tasks for Page 3 (Matching Real Subject & Class) ──
  const activeSubjectTasks = useMemo(() => {
    return tasks.filter(t => {
      const cMatch = t.classes.toLowerCase().trim() === selectedClass.toLowerCase().trim()
      const sMatch = t.section.toLowerCase().trim() === selectedSection.toLowerCase().trim()
      const subMatch = t.subject.toLowerCase().trim() === selectedSubject.toLowerCase().trim()
      return cMatch && sMatch && subMatch
    })
  }, [tasks, selectedClass, selectedSection, selectedSubject])

  // ── Students for Page 4 (ONLY Real Students Enrolled in Selected Class & Section) ──
  const currentClassStudents = useMemo(() => {
    if (!selectedClass) return []
    const targetC = selectedClass.trim()
    const targetS = selectedSection.trim()

    // Strict real match: only students belonging to this class & section
    const matched = allStudents.filter(s => matchesClassAndSection(s, targetC, targetS))

    if (!studentSearch.trim()) return matched
    const q = studentSearch.toLowerCase().trim()
    return matched.filter(st => {
      const n = (st.name || '').toLowerCase()
      const r = String(st.rollNo || '').toLowerCase()
      const a = String(st.admissionNo || '').toLowerCase()
      return n.includes(q) || r.includes(q) || a.includes(q)
    })
  }, [allStudents, selectedClass, selectedSection, studentSearch])

  // ── Attendance State for Selected Class & Section ──
  const [todayAttendanceRecords, setTodayAttendanceRecords] = useState<any[]>([])
  const [isAttendanceMarkedToday, setIsAttendanceMarkedToday] = useState(false)
  const [loadingAttendance, setLoadingAttendance] = useState(false)

  const loadClassAttendance = useCallback(async (className: string, section: string) => {
    if (!className) return
    setLoadingAttendance(true)
    const todayStr = new Date().toISOString().split('T')[0]
    let records: any[] = []
    let marked = false

    // 1. Try DB attendance
    try {
      const res = await fetchStudentAttendance(todayStr, className, section)
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        records = res.data
        marked = true
      }
    } catch (e) {
      console.error('Error fetching student attendance for homework:', e)
    }

    // 2. Fallback to localStorage if no DB records found
    if (!marked && typeof window !== 'undefined') {
      try {
        const savedKey = `att_record_${todayStr}_${className}_${section}`
        const raw = localStorage.getItem(savedKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          const entries = Object.entries(parsed)
          if (entries.length > 0) {
            records = entries.map(([stId, val]: [string, any]) => ({
              id: stId,
              student_id: stId,
              status: val.status || 'Present',
              source_mode: val.sourceMode || 'Manual',
              marked_by: val.markedBy || 'Staff'
            }))
            marked = true
          }
        }
      } catch (e) {}

      if (!marked) {
        try {
          const cleanCls = className.toLowerCase().replace(/\s+/g, '')
          const cleanSec = section.toLowerCase().replace(/^section\s+/i, '').replace(/\s+/g, '')
          const raw2 = localStorage.getItem(`school_student_attendance_${cleanCls}_${cleanSec}_${todayStr}`)
          if (raw2) {
            const parsed2 = JSON.parse(raw2)
            if (Array.isArray(parsed2) && parsed2.length > 0) {
              records = parsed2
              marked = true
            }
          }
        } catch (e) {}
      }
    }

    setTodayAttendanceRecords(records)
    setIsAttendanceMarkedToday(marked)
    setLoadingAttendance(false)
  }, [])

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadClassAttendance(selectedClass, selectedSection)
    }
  }, [selectedClass, selectedSection, loadClassAttendance])

  // Helper to get attendance status of a student
  const getStudentAttendanceStatus = useCallback((st: any): 'Present' | 'Absent' | 'Leave' | 'Not Marked' => {
    if (!isAttendanceMarkedToday || todayAttendanceRecords.length === 0) {
      return 'Not Marked'
    }

    const sId = String(st.id || '')
    const sAdm = String(st.admissionNo || '').toLowerCase()
    const sRoll = String(st.rollNo || '')
    const sName = String(st.name || '').toLowerCase().trim()

    const match = todayAttendanceRecords.find((r: any) => {
      if (r.student_id && String(r.student_id) === sId) return true
      if (r.id && String(r.id) === sId) return true
      if (r.admission_no && String(r.admission_no).toLowerCase() === sAdm) return true
      if (r.roll_no && String(r.roll_no) === sRoll) return true
      if (r.student_name && String(r.student_name).toLowerCase().trim() === sName) return true
      return false
    })

    if (match) {
      const stStatus = String(match.status || '').toLowerCase()
      if (stStatus.includes('present') || stStatus === 'p') return 'Present'
      if (stStatus.includes('absent') || stStatus === 'a') return 'Absent'
      if (stStatus.includes('leave') || stStatus === 'l') return 'Leave'
    }

    return 'Not Marked'
  }, [isAttendanceMarkedToday, todayAttendanceRecords])

  const presentStudents = useMemo(() => {
    if (!isAttendanceMarkedToday) {
      // If attendance is not marked today, default to all enrolled students
      return currentClassStudents
    }
    return currentClassStudents.filter(st => getStudentAttendanceStatus(st) === 'Present')
  }, [currentClassStudents, isAttendanceMarkedToday, getStudentAttendanceStatus])

  const absentStudents = useMemo(() => {
    if (!isAttendanceMarkedToday) return []
    return currentClassStudents.filter(st => getStudentAttendanceStatus(st) === 'Absent')
  }, [currentClassStudents, isAttendanceMarkedToday, getStudentAttendanceStatus])

  const leaveStudents = useMemo(() => {
    if (!isAttendanceMarkedToday) return []
    return currentClassStudents.filter(st => getStudentAttendanceStatus(st) === 'Leave')
  }, [currentClassStudents, isAttendanceMarkedToday, getStudentAttendanceStatus])

  // ── Page 4 Assignment State (Checkboxes & Select All) ──
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([])
  const [isAssigningStudents, setIsAssigningStudents] = useState<boolean>(false)
  const initializedTaskIdRef = useRef<string | null>(null)

  // Canonical helper to get student's unique identifier
  const getStudentKey = (st: any) => String(st.id || st.admissionNo || st.rollNo)

  // Auto-initialize assignedStudentIds only once per task entry
  useEffect(() => {
    if (currentScreen === 'students' && activeTask && initializedTaskIdRef.current !== activeTask.id) {
      initializedTaskIdRef.current = activeTask.id
      const classStudents = allStudents.filter(s => matchesClassAndSection(s, activeTask.classes, activeTask.section))
      const allIds = classStudents.map(s => getStudentKey(s))

      try {
        const rawLocalSub = localStorage.getItem(`school_task_subs_${activeTask.id}`)
        if (rawLocalSub) {
          const parsed = JSON.parse(rawLocalSub)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAssignedStudentIds(parsed.map((s: any) => getStudentKey(s)))
            return
          }
        }
      } catch (e) {}

      setAssignedStudentIds(allIds)
    }
    if (currentScreen !== 'students') {
      initializedTaskIdRef.current = null
    }
  }, [currentScreen, activeTask, allStudents])

  // ── Page 4: Assigned Students Read-Only List ──
  const assignedStudentsList = useMemo(() => {
    if (!activeTask) return []
    const classStudents = allStudents.filter(s => matchesClassAndSection(s, activeTask.classes, activeTask.section))

    // Filter only students who were assigned to this task
    let matched = classStudents.filter(st => {
      const sKey = getStudentKey(st)
      const sId = String(st.id || '')
      const sAdm = String(st.admissionNo || '')
      const sRoll = String(st.rollNo || '')
      return (
        assignedStudentIds.includes(sKey) ||
        (sId && assignedStudentIds.includes(sId)) ||
        (sAdm && assignedStudentIds.includes(sAdm)) ||
        (sRoll && assignedStudentIds.includes(sRoll))
      )
    })

    // Fallback if assignedStudentIds not yet loaded or if assigned to whole class
    if (matched.length === 0 && assignedStudentIds.length === 0 && classStudents.length > 0) {
      matched = classStudents
    }

    if (!studentSearch.trim()) return matched
    const q = studentSearch.toLowerCase().trim()
    return matched.filter(st => {
      const n = (st.name || '').toLowerCase()
      const r = String(st.rollNo || '').toLowerCase()
      const a = String(st.admissionNo || '').toLowerCase()
      return n.includes(q) || r.includes(q) || a.includes(q)
    })
  }, [allStudents, activeTask, assignedStudentIds, studentSearch])

  const openTaskAssignedStudents = async (task: HomeworkTaskItem) => {
    setActiveTask(task)
    setStudentSearch('')
    initializedTaskIdRef.current = task.id
    setCurrentScreen('students')

    const classStudents = allStudents.filter(s => matchesClassAndSection(s, task.classes, task.section))
    const allIds = classStudents.map(s => getStudentKey(s))

    try {
      const res = await fetchTaskSubmissions(task.id)
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const subIds = res.data.map((sub: any) => getStudentKey(sub))
        setAssignedStudentIds(subIds)
        return
      }
    } catch (e) {}

    try {
      const rawLocalSub = localStorage.getItem(`school_task_subs_${task.id}`)
      if (rawLocalSub) {
        const parsed = JSON.parse(rawLocalSub)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAssignedStudentIds(parsed.map((s: any) => getStudentKey(s)))
          return
        }
      }
    } catch (e) {}

    setAssignedStudentIds(allIds)
  }

  const handleSaveStudentAssignment = async () => {
    if (!activeTask) return
    if (assignedStudentIds.length === 0) {
      showToast('Please select at least one student to assign.', 'error')
      return
    }

    setIsAssigningStudents(true)
    try {
      const selectedStudentsList = currentClassStudents.filter(st =>
        assignedStudentIds.includes(getStudentKey(st))
      )

      // 1. Persist to DB submissions
      await Promise.all(
        selectedStudentsList.map(st =>
          updateStudentTaskSubmission(
            activeTask.id,
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

      // 2. Cache locally
      try {
        localStorage.setItem(
          `school_task_subs_${activeTask.id}`,
          JSON.stringify(selectedStudentsList)
        )
      } catch (e) {}

      // 3. Update task studentsCount in state & localStorage
      const updatedTasks = tasks.map(t => {
        if (t.id === activeTask.id) {
          return { ...t, studentsCount: assignedStudentIds.length }
        }
        return t
      })
      setTasks(updatedTasks)
      setActiveTask(prev => prev ? { ...prev, studentsCount: assignedStudentIds.length } : null)

      try {
        localStorage.setItem('school_homework_tasks', JSON.stringify(updatedTasks))
      } catch (e) {}

      showToast(`Homework assigned to ${assignedStudentIds.length} student(s) successfully!`, 'success')
    } catch (err: any) {
      console.error('Failed to update student assignment:', err)
      showToast(err.message || 'Failed to assign homework.', 'error')
    } finally {
      setIsAssigningStudents(false)
    }
  }

  // ── Form State for Page 5 (Create Task) ──
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formDueDate, setFormDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  })
  const [formAssignTarget, setFormAssignTarget] = useState<'present' | 'entire' | 'specific'>('present')
  const [formSelectedStudentIds, setFormSelectedStudentIds] = useState<string[]>([])
  const [formAttachmentName, setFormAttachmentName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-sync present students as default selection for create_task
  useEffect(() => {
    if (currentScreen === 'create_task') {
      const pIds = presentStudents.map(st => getStudentKey(st))
      setFormSelectedStudentIds(pIds)
    }
  }, [currentScreen, presentStudents])

  const handleQuickDuePreset = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    setFormDueDate(d.toISOString().split('T')[0])
  }

  // Handle Create Task Form Submit
  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      showToast('Please enter homework title.', 'error')
      return
    }

    setIsSubmitting(true)
    const newId = `task-${Date.now()}`
    const todayFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const dueFormatted = new Date(formDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

    // Resolve assigned students based on target
    let finalStudents: any[] = []
    if (formAssignTarget === 'present') {
      finalStudents = presentStudents.length > 0 ? presentStudents : currentClassStudents
    } else if (formAssignTarget === 'specific') {
      finalStudents = currentClassStudents.filter(st => formSelectedStudentIds.includes(getStudentKey(st)))
    } else {
      finalStudents = currentClassStudents
    }

    if (finalStudents.length === 0 && formAssignTarget === 'specific') {
      showToast('Please select at least 1 student or choose Only Present / Entire Class.', 'error')
      setIsSubmitting(false)
      return
    }

    const newTask: HomeworkTaskItem = {
      id: newId,
      title: formTitle.trim(),
      description: formDesc.trim(),
      classes: selectedClass,
      section: selectedSection,
      subject: selectedSubject,
      assignedBy: selectedTeacherName || 'Faculty',
      assignDate: todayFormatted,
      submissionDate: dueFormatted,
      hasAttachment: !!formAttachmentName,
      attachmentName: formAttachmentName || undefined,
      status: 'Active',
      studentsCount: finalStudents.length
    }

    try {
      await createHomeworkTask(newTask)

      // Also persist student assignments into DB and local cache
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

      const updated = [newTask, ...tasks]
      setTasks(updated)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
        } catch (e) {}
      }

      showToast(`Task created and assigned to ${finalStudents.length} student(s) successfully!`, 'success')
      setFormTitle('')
      setFormDesc('')
      setFormAttachmentName('')
      setFormAssignTarget('present')
      setFormSelectedStudentIds(presentStudents.map(st => getStudentKey(st)))
      setCurrentScreen('tasks')
    } catch (err: any) {
      showToast(err.message || 'Failed to save task.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this homework assignment?')) return

    try {
      await deleteHomeworkTask(id)
      const updated = tasks.filter(t => t.id !== id)
      setTasks(updated)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
        } catch (e) {}
      }
      showToast('Homework assignment removed.', 'success')
      if (activeTask?.id === id) setActiveTask(null)
    } catch (err: any) {
      showToast(err.message || 'Failed to delete homework.', 'error')
    }
  }

  return (
    <div className="w-full flex flex-col gap-5 pb-16 animate-in fade-in duration-200">
      
      {/* ═══════════════════════════════════════════════════════════════════
          PAGE 1: ASSIGN HOMEWORK - FULL WIDTH (Exact Layout of Screenshot 1)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'classes' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          
          {/* Top Curved Teal Header matching Screenshot 1 (Full Width) */}
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
              Assign Homework
            </h1>
          </div>

          {/* Calendar 7-Day Slider Strip matching Screenshot 1 (Full Width) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 w-full">
            <button
              type="button"
              onClick={() => shiftCalendar(-7)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-around flex-1 gap-2 overflow-x-auto no-scrollbar">
              {weekDays.map(item => (
                <button
                  key={item.date.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedCalendarDate(item.date)
                    setCalendarAnchorDate(item.date)
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 sm:px-5 md:px-8 rounded-2xl transition-all cursor-pointer min-w-[50px] sm:min-w-[70px] ${
                    item.isSelected
                      ? 'bg-[#0f766e] text-white shadow-md shadow-teal-700/30 font-black scale-105'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-sm md:text-base font-black">{item.dayNum}</span>
                  <span className={`text-[11px] mt-0.5 ${item.isSelected ? 'text-teal-100 font-bold' : 'text-slate-400 font-medium'}`}>
                    {item.dayName}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => shiftCalendar(7)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Class & Section Dropdowns matching Screenshot 1 (Full Width) */}
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

          {/* Section Title matching Screenshot 1 */}
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
              Select Class to Assign
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {filteredClassCards.length} Classes Available
            </span>
          </div>

          {/* Class Cards List matching Screenshot 1 (Full Width Stack) */}
          {filteredClassCards.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2 w-full">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No classes found in Masters</p>
              <p className="text-xs text-slate-400">Create classes in Masters &gt; Classes or enroll students with a class to begin.</p>
            </div>
          ) : (
            <div className="space-y-4 w-full pb-6">
              {filteredClassCards.map(cls => (
                <div
                  key={cls.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-4 w-full hover:border-teal-500 transition-colors"
                >
                  {/* Class Title & Real Student Count Badge */}
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

                  {/* Bottom Action Button matching Screenshot 1 */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClass(cls.className)
                        setSelectedSection(cls.section)
                        setSelectedClassTeacher(cls.classTeacher)
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
          PAGE 2: SELECT SUBJECT - FULL WIDTH (Exact Layout of Screenshot 2)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'subjects' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          
          {/* Top Curved Teal Header matching Screenshot 2 */}
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

          {/* Selected Class Header Card matching Screenshot 2 */}
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
                  Class Teacher: <strong className="text-slate-800 dark:text-slate-200">{selectedClassTeacher || resolvedClassTeacher}</strong> • {subjectCards.length} Subjects Scheduled ({selectedDayName})
                </p>
              </div>
            </div>

            <span className="px-4 py-2 rounded-2xl bg-[#0f766e] text-white text-xs md:text-sm font-black shadow-xs">
              Section {selectedSection || 'A'}
            </span>
          </div>

          {/* Time Table Day Schedule Bar with Day Switcher Pills */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400">Time Table Schedule</div>
                <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedDayName}, {selectedCalendarDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                    Active Day
                  </span>
                </div>
              </div>
            </div>

            {/* Day quick switcher pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                const isActive = selectedDayName.toLowerCase() === day.toLowerCase()
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSwitchDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0f766e] text-white shadow-xs scale-105'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section Heading matching Screenshot 2 */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
              Subjects ({selectedDayName}'s Timetable)
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {subjectCards.length} Subjects
            </span>
          </div>

          {/* Real Pastel Subject Cards matching Screenshot 2 (Full Width Stack) */}
          {subjectCards.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 w-full">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-black text-slate-800 dark:text-slate-200">
                No subjects scheduled in Time Table on {selectedDayName}
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Select another weekday above (such as Monday) or configure periods in <Link href="/institute/time-table" className="text-teal-600 underline font-bold">Time Table</Link>.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSwitchDay('Monday')}
                  className="px-4 py-2 rounded-xl bg-[#0f766e] text-white text-xs font-bold hover:bg-[#0d655f] cursor-pointer shadow-xs"
                >
                  View Monday's Schedule
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubject('General')
                    setSelectedTeacherName(resolvedClassTeacher || 'Faculty')
                    setCurrentScreen('create_task')
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  + Create Task Directly
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 w-full pb-6">
              {subjectCards.map(sub => (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubject(sub.subjectName)
                    setSelectedTeacherName(sub.teacherName)
                    setCurrentScreen('tasks')
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
          PAGE 3: SUBJECT TASKS LIST - FULL WIDTH (Exact Layout of Screenshot 3)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'tasks' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200 relative pb-16">
          
          {/* Top Curved Teal Header matching Screenshot 3 */}
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
              {selectedSubject} Tasks
            </h1>
          </div>

          {/* Subject Info Card matching Screenshot 3 */}
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
            <span className="px-3.5 py-1 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60">
              {activeSubjectTasks.length} total
            </span>
          </div>

          {/* Real Task Cards List matching Screenshot 3 (NO DUMMY TASKS) */}
          {activeSubjectTasks.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2 w-full">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No tasks assigned for {selectedSubject} yet</p>
              <p className="text-xs text-slate-400">Tap "+ Create Task" below to publish the first task.</p>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {activeSubjectTasks.map(task => (
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

                    <div className="flex items-center gap-2">
                      {task.hasAttachment && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5" />
                          Attachment
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={e => handleDeleteTask(task.id, e)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

                  {/* Attachment file link if any */}
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
                      {task.studentsCount ?? currentClassStudents.length} Students
                    </span>

                    <button
                      type="button"
                      onClick={() => openTaskAssignedStudents(task)}
                      className="px-5 py-2.5 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs md:text-sm font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>Assigned Students &gt;</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floating Action Button "+ Create Task" matching Screenshot 3 */}
          <div className="fixed bottom-6 right-6 md:right-10 z-30">
            <button
              type="button"
              onClick={() => {
                setFormTitle('')
                setFormDesc('')
                setCurrentScreen('create_task')
              }}
              className="px-6 py-3.5 rounded-full bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs md:text-sm font-black shadow-xl shadow-teal-950/30 flex items-center gap-2 active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Create Task</span>
            </button>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          PAGE 4: ASSIGNED STUDENTS - FULL WIDTH (Exact Layout of Screenshot 4)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'students' && activeTask && (
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
              Assigned Students
            </h1>
          </div>

          {/* Task Summary Header Card matching Screenshot 4 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-3 w-full">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {activeTask.title}
                </h2>
                <p className="text-xs md:text-sm text-teal-700 dark:text-teal-300 font-bold mt-1">
                  {activeTask.classes} - Section {activeTask.section} • {activeTask.subject}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 text-xs md:text-sm">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Assign: <strong className="text-slate-700 dark:text-slate-200">{activeTask.assignDate}</strong>
              </span>
              <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-500" />
                Due: <strong className="text-orange-700 dark:text-orange-300">{activeTask.submissionDate}</strong>
              </span>
            </div>
          </div>

          {/* Search Bar matching Screenshot 4 */}
          <div className="relative w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or roll no..."
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-semibold outline-none focus:border-teal-500 shadow-2xs"
            />
          </div>

          {/* Assigned Student List Section Heading (Read-Only) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                Assigned Student List
              </h3>
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {assignedStudentsList.length} {assignedStudentsList.length === 1 ? 'Student' : 'Students'} Assigned
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-bold w-fit">
              <Lock className="w-3.5 h-3.5 text-[#0f766e]" />
              <span>Published &bull; View-Only</span>
            </div>
          </div>

          {/* Assigned Students Read-Only Roster */}
          {assignedStudentsList.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2 w-full">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {studentSearch ? 'No assigned students match your search.' : 'No students were assigned to this task.'}
              </p>
              <p className="text-xs text-slate-400">
                {studentSearch ? 'Try adjusting your search criteria.' : 'Create a new task with assigned students.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 w-full pb-8">
              {assignedStudentsList.map((st: any, idx: number) => {
                const sId = getStudentKey(st)
                const sName = st.name || 'Student'
                const sRoll = st.rollNo || '001'
                const sAdm = st.admissionNo || 'ADM-001'
                const attStatus = getStudentAttendanceStatus(st)

                return (
                  <div
                    key={sId}
                    className="rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs border bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 transition-all flex items-center justify-between gap-3.5 w-full"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      {st.photo ? (
                        <img
                          src={st.photo}
                          alt={sName}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#0f766e] text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {sName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                          {sName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                            Roll No: {sRoll}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                            {sAdm}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {attStatus === 'Present' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Check className="w-2.5 h-2.5 stroke-[3]" /> Present
                        </span>
                      )}
                      {attStatus === 'Absent' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                          <X className="w-2.5 h-2.5 stroke-[3]" /> Absent
                        </span>
                      )}
                      {attStatus === 'Leave' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                          Leave
                        </span>
                      )}

                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0f766e]" />
                        <span>Assigned</span>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          PAGE 5: CREATE TASK FORM - FULL WIDTH (Triggered by "+ Create Task")
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'create_task' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          
          {/* Top Curved Teal Header */}
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
              Assign Homework
            </h1>
          </div>

          <form onSubmit={handleCreateTaskSubmit} className="space-y-5 w-full pb-8 text-xs">
            
            {/* Class & Subject Banner */}
            <div className="bg-[#0f766e] text-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm flex items-center justify-between w-full">
              <div>
                <h3 className="text-base md:text-lg font-black leading-tight">
                  {selectedClass} - Section {selectedSection}
                </h3>
                <p className="text-xs md:text-sm text-teal-100 font-semibold mt-1">
                  Subject: {selectedSubject} • Assigned Teacher: {selectedTeacherName}
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-white/20 text-white font-bold text-xs border border-white/30">
                Active Class
              </span>
            </div>

            {/* Title Input */}
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
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-semibold outline-none focus:border-teal-500"
              />
            </div>

            {/* Description Input */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-2 w-full">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Enter instructions, questions or guidelines for students..."
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-semibold outline-none focus:border-teal-500 resize-none"
              />
            </div>

            {/* Submission Date with Presets */}
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDuePreset(1)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDuePreset(3)}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 text-xs font-bold cursor-pointer"
                  >
                    3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDuePreset(7)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    1 Week
                  </button>
                </div>
              </div>
            </div>

            {/* Attachment */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 w-full">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Attachment
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) setFormAttachmentName(f.name)
                }}
                className="hidden"
              />

              {formAttachmentName ? (
                <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-white truncate">{formAttachmentName}</span>
                  <button
                    type="button"
                    onClick={() => setFormAttachmentName('')}
                    className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-500 rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-6 h-6 text-teal-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">Tap to upload document, image, or PDF</p>
                </div>
              )}
            </div>

            {/* Assign To */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-3 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Assign To
                </label>
                {isAttendanceMarkedToday ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 w-fit">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Today's Attendance Marked ({presentStudents.length} Present)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 w-fit">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Today's Attendance Not Marked Yet
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
                      {isAttendanceMarkedToday ? (
                        <>
                          <strong>{presentStudents.length} Students</strong> marked Present today will receive this homework.
                          {absentStudents.length > 0 && (
                            <span className="text-teal-700 dark:text-teal-300 ml-1">
                              ({absentStudents.length} Absent, {leaveStudents.length} Leave excluded)
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          Today&apos;s attendance hasn&apos;t been marked yet. All <strong>{currentClassStudents.length} students</strong> are currently selected by default.
                        </>
                      )}
                    </span>
                  </div>
                  {!isAttendanceMarkedToday && (
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

                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {currentClassStudents.map((st: any) => {
                      const sId = getStudentKey(st)
                      const isChecked = formSelectedStudentIds.includes(sId)
                      const attStatus = getStudentAttendanceStatus(st)

                      return (
                        <label
                          key={sId}
                          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer select-none transition ${
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
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white font-black text-sm md:text-base shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 stroke-[3]" />}
              <span>Submit Homework</span>
            </button>

          </form>
        </div>
      )}

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

'use client'

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import {
  ArrowLeft, ChevronLeft, ChevronRight, GraduationCap, Users, User,
  BookOpen, FileText, Paperclip, Calendar, Clock, Check, Plus,
  Search, Upload, X, Loader2, Sparkles, Send, Signal, Wifi,
  Battery, AlertCircle, CheckCircle, CheckCircle2, ChevronDown, Download,
  Trash2, Eye, RefreshCw, Filter, Layers, CheckSquare, Square, Star,
  Award, MessageSquare, XCircle, CalendarClock, AlertTriangle, SlidersHorizontal, Folder
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'
import { fetchStudents } from '@/app/institute/students/actions'
import { fetchTeachers } from '@/app/institute/teachers/actions'
import {
  fetchHomeworkTasks,
  fetchTaskSubmissions,
  updateStudentRemark,
  updateStudentTaskSubmission,
  bulkUpdateStudentTaskSubmissions,
  rescheduleHomeworkTask,
  deleteHomeworkTask
} from '@/app/institute/homework/assign/actions'

// ── 4 PAGES STEP SCREEN TYPES ──
// Page 1: 'classes'     -> Remark Homework (Date strip + Class list with Total/Completed/Pending) [Screenshot 1]
// Page 2: 'subjects'    -> Select Subject (Class/Section banner + Pastel cards) [Screenshot 2]
// Page 3: 'tasks'       -> Select Task to Remark (Subject/Class banner + Assigned Tasks) [Screenshot 3]
// Page 4: 'evaluation'  -> Remark Homework (Real student evaluation cards + ratings + quick remarks) [Screenshot 4]
type StepScreen = 'classes' | 'subjects' | 'tasks' | 'evaluation'

interface SubjectCard {
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
  status: 'Active' | 'Completed' | 'Closed'
  studentsCount?: number
  assignedStudentIds?: string[]
  submissions?: any[]
  rescheduledCount?: number
  submittedCount?: number
  rescheduledDate?: string
}

interface StudentSubmissionItem {
  studentId: string
  name: string
  rollNo: string
  admissionNo: string
  avatar: string
  gender?: string
  status: 'Submitted' | 'Pending' | 'Rescheduled'
  submittedAt?: string
  remark: string
  rating: number // 1 to 5
  rescheduledDate?: string
  attachmentName?: string
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

// Quick Remark Presets
const QUICK_REMARK_CHIPS = [
  { text: 'Completed assignment on time with neat presentation.', rating: 5 },
  { text: 'Good work, all problems solved correctly.', rating: 4 },
  { text: 'Submitted on time, minor corrections needed in questions.', rating: 3 },
  { text: 'Needs improvement in handwriting and calculation steps.', rating: 2 },
  { text: 'Incomplete assignment, please finish and resubmit.', rating: 1 }
]

// ── ACCURATE CLASS & SECTION PARSING & MATCHING HELPERS ──
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

// ── DATE NORMALIZATION & HELPERS ──
function normalizeDateStr(dStr: string | undefined | null): string | null {
  if (!dStr) return null
  const trimmed = String(dStr).trim()
  if (!trimmed) return null

  // 1. YYYY-MM-DD (e.g. 2026-10-31 or 2026-10-31T...)
  const ymd = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (ymd) {
    const y = ymd[1]
    const m = ymd[2].padStart(2, '0')
    const d = ymd[3].padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // 2. DD-MM-YYYY or DD/MM/YYYY (e.g. 31-10-2026)
  const dmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (dmy) {
    const d = dmy[1].padStart(2, '0')
    const m = dmy[2].padStart(2, '0')
    const y = dmy[3]
    return `${y}-${m}-${d}`
  }

  // 3. DD Mon YYYY (e.g. 31 Oct 2026 or 31-Oct-2026)
  const dMonY = trimmed.match(/^(\d{1,2})[\s-]+([A-Za-z]{3,9})[\s-]+(\d{4})/)
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

  // 4. Date.parse fallback
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

function toDateIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseIsoToLocalDate(isoStr: string): Date {
  const parts = isoStr.split('-').map(Number)
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0)
  }
  return new Date()
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// ── ROBUST TASK DUE DATE MATCHING ──
function isTaskDueOnDate(task: any, targetDate: Date | string): boolean {
  if (!task) return false
  const targetIso = typeof targetDate === 'string' ? (normalizeDateStr(targetDate) || targetDate) : toDateIso(targetDate)
  if (!targetIso) return false

  // 1. Task submission date
  const subIso = normalizeDateStr(task.submissionDate)
  if (subIso && subIso === targetIso) return true

  // 2. Task-level rescheduled date (if task itself was rescheduled)
  if (task.rescheduledDate) {
    const rIso = normalizeDateStr(task.rescheduledDate)
    if (rIso && rIso === targetIso) return true
  }

  // 3. STUDENT-LEVEL RESCHEDULED DATES:
  // If ANY student in this task was rescheduled to targetDate, the task IS due on targetDate!
  if (Array.isArray(task.submissions) && task.submissions.length > 0) {
    const hasStudentRescheduled = task.submissions.some((s: any) => {
      const sDate = s.rescheduledDate || s.rescheduled_date
      if (sDate) {
        const sIso = normalizeDateStr(sDate)
        if (sIso && sIso === targetIso) return true
      }
      return false
    })
    if (hasStudentRescheduled) return true
  }

  // 4. LocalStorage submissions check for this task
  try {
    const rawLocal = typeof window !== 'undefined' ? localStorage.getItem(`school_task_subs_${task.id}`) : null
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal)
      if (Array.isArray(parsed)) {
        const hasMatch = parsed.some((s: any) => {
          if (s.status === 'Rescheduled' && s.rescheduledDate) {
            const sIso = normalizeDateStr(s.rescheduledDate)
            if (sIso && sIso === targetIso) return true
          }
          return false
        })
        if (hasMatch) return true
      }
    }
  } catch {}

  // 5. LocalStorage school_rescheduled_remarks registry check
  try {
    const rawResched = typeof window !== 'undefined' ? localStorage.getItem('school_rescheduled_remarks') : null
    if (rawResched) {
      const parsed = JSON.parse(rawResched)
      if (Array.isArray(parsed)) {
        const hasMatch = parsed.some((r: any) => {
          if (String(r.taskId) === String(task.id) && r.rescheduledDate) {
            const rIso = normalizeDateStr(r.rescheduledDate)
            if (rIso && rIso === targetIso) return true
          }
          return false
        })
        if (hasMatch) return true
      }
    }
  } catch {}

  // 6. Fallback: text comparison (e.g. "06 Nov 2026")
  const targetParts = targetIso.split('-')
  if (targetParts.length === 3) {
    const yyyy = targetParts[0]
    const mm = targetParts[1]
    const dd = targetParts[2]
    const monthShorts = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const monStr = monthShorts[parseInt(mm, 10) - 1]
    const sLow = String(task.submissionDate || '').toLowerCase()
    if (sLow.includes(dd) && monStr && sLow.includes(monStr) && sLow.includes(yyyy)) {
      return true
    }
  }

  return false
}

// ── CHECK IF A HOMEWORK TASK IS FULLY REMARKED / COMPLETED ──
function isTaskCompleted(
  task: any,
  taskSubsMap?: Record<string, any>,
  allStudentsList?: any[]
): boolean {
  if (!task) return false
  if (task.status === 'Completed' || task.status === 'Closed' || task.status === 'Remarked') return true

  // 1. Submissions from DB or memory
  const dbSubs = Array.isArray(task.submissions) ? task.submissions : []
  const dbSubmittedCount = typeof task.submittedCount === 'number'
    ? task.submittedCount
    : dbSubs.filter((s: any) => s.status === 'Submitted' || s.status === 'Completed').length

  // 2. Submissions from localStorage
  let localSubmittedCount = 0
  let localTotal = 0
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`school_task_subs_${task.id}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          localSubmittedCount = parsed.filter((s: any) => s.status === 'Submitted' || s.status === 'Completed').length
          localTotal = parsed.length
        }
      }
    } catch {}
  }

  // 3. Submissions from active task map
  let activeSubsCount = 0
  if (taskSubsMap && Object.keys(taskSubsMap).length > 0 && task.id) {
    activeSubsCount = Object.values(taskSubsMap).filter((s: any) => s.status === 'Submitted' || s.status === 'Completed').length
  }

  const effectiveSubmitted = Math.max(dbSubmittedCount, localSubmittedCount, activeSubsCount)

  // Determine total assigned students
  let totalAssigned = 0
  if (Array.isArray(task.assignedStudentIds) && task.assignedStudentIds.length > 0) {
    totalAssigned = task.assignedStudentIds.length
  } else if (typeof task.studentsCount === 'number' && task.studentsCount > 0) {
    totalAssigned = task.studentsCount
  } else if (allStudentsList && allStudentsList.length > 0) {
    const classStuds = allStudentsList.filter(s => matchesClassAndSection(s, task.classes, task.section))
    totalAssigned = classStuds.length > 0 ? classStuds.length : Math.max(1, localTotal, dbSubs.length)
  } else {
    totalAssigned = Math.max(1, localTotal, dbSubs.length)
  }

  if (totalAssigned > 0 && effectiveSubmitted >= totalAssigned) {
    return true
  }

  // Also if effectiveSubmitted > 0 and all remaining students are rescheduled
  const dbResched = typeof task.rescheduledCount === 'number'
    ? task.rescheduledCount
    : dbSubs.filter((s: any) => s.status === 'Rescheduled').length
  if (totalAssigned > 0 && (effectiveSubmitted + dbResched) >= totalAssigned && effectiveSubmitted > 0) {
    return true
  }

  return false
}

// Default timetable seed for Class 1 Section A
const DEFAULT_CLASS1_TIMETABLE = {
  id: 'tt-class-1-sec-a',
  classes: 'Class 1',
  section: 'Section A',
  schedule: {
    'Monday': [
      { subject: 'English', teacher: 'Kamlesh Kumar' },
      { subject: 'Physics', teacher: 'SK Verma' },
      { subject: 'Mathematics', teacher: 'Kamlesh Kumar' },
      { subject: 'Science', teacher: 'SK Verma' },
    ],
    'Tuesday': [
      { subject: 'Mathematics', teacher: 'Kamlesh Kumar' },
      { subject: 'English', teacher: 'Kamlesh Kumar' },
      { subject: 'Science', teacher: 'SK Verma' },
      { subject: 'Physics', teacher: 'SK Verma' },
    ],
    'Wednesday': [
      { subject: 'Physics', teacher: 'SK Verma' },
      { subject: 'English', teacher: 'Kamlesh Kumar' },
      { subject: 'Computer', teacher: 'SK Verma' },
      { subject: 'Mathematics', teacher: 'Kamlesh Kumar' },
    ],
    'Thursday': [
      { subject: 'English', teacher: 'Kamlesh Kumar' },
      { subject: 'Physics', teacher: 'SK Verma' },
      { subject: 'Mathematics', teacher: 'Kamlesh Kumar' },
      { subject: 'Science', teacher: 'SK Verma' },
    ],
    'Friday': [
      { subject: 'Science', teacher: 'SK Verma' },
      { subject: 'Mathematics', teacher: 'Kamlesh Kumar' },
      { subject: 'English', teacher: 'Kamlesh Kumar' },
      { subject: 'Physics', teacher: 'SK Verma' },
    ],
    'Saturday': [
      { subject: 'Physical Education', teacher: 'Kamlesh Kumar' },
      { subject: 'Art & Craft', teacher: 'SK Verma' },
      { subject: 'English', teacher: 'Kamlesh Kumar' },
    ]
  }
}

function findTeacherForClassSubject(
  allTeachers: any[],
  className: string,
  sectionName: string,
  subjectName: string
): string | null {
  if (!allTeachers || allTeachers.length === 0) return null

  const targetClassNorm = normalizeClassKey(className)
  const targetSubNorm = (subjectName || '').trim().toLowerCase()

  for (const t of allTeachers) {
    const list = Array.isArray(t.assignedClasses)
      ? t.assignedClasses
      : (Array.isArray(t.assigned_classes) ? t.assigned_classes : [])
    for (const item of list) {
      const itemStr = String(item).toLowerCase()
      const subMatch = targetSubNorm ? itemStr.includes(targetSubNorm) : true
      const classMatch = targetClassNorm ? itemStr.includes(targetClassNorm) : true
      if (subMatch && classMatch) {
        return t.name || t.username
      }
    }
  }

  for (const t of allTeachers) {
    const list = Array.isArray(t.assignedClasses)
      ? t.assignedClasses
      : (Array.isArray(t.assigned_classes) ? t.assigned_classes : [])
    for (const item of list) {
      const itemStr = String(item).toLowerCase()
      const classMatch = targetClassNorm ? itemStr.includes(targetClassNorm) : true
      if (classMatch) {
        return t.name || t.username
      }
    }
  }

  return null
}

function resolveTeacherForSubject(
  subName: string,
  clsName: string,
  secName: string,
  tasks: HomeworkTaskItem[],
  allTeachers: any[],
  slotTeacher?: string
): string {
  // 1. If slot / provided teacher is valid
  if (slotTeacher && slotTeacher.trim() && slotTeacher.trim() !== 'Not Assigned') {
    return slotTeacher.trim()
  }

  // 2. Check any task for this class, section & subject with an assignedBy
  const matchedTask = tasks.find(t =>
    matchesClassAndSection({ class: t.classes, section: t.section }, clsName, secName) &&
    t.subject?.toLowerCase().trim() === subName.toLowerCase().trim() &&
    t.assignedBy &&
    t.assignedBy.trim() !== '' &&
    t.assignedBy.trim() !== 'Not Assigned'
  )
  if (matchedTask?.assignedBy) {
    return matchedTask.assignedBy.trim()
  }

  // 3. Check any task for this subject across all tasks
  const anyTask = tasks.find(t =>
    t.subject?.toLowerCase().trim() === subName.toLowerCase().trim() &&
    t.assignedBy &&
    t.assignedBy.trim() !== '' &&
    t.assignedBy.trim() !== 'Not Assigned'
  )
  if (anyTask?.assignedBy) {
    return anyTask.assignedBy.trim()
  }

  // 4. Check timetable records in localStorage or default seed
  try {
    let timetablesArr: any[] = []
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('school_timetables')
      if (raw) timetablesArr = JSON.parse(raw)
    }
    const allTimetables = [...timetablesArr, DEFAULT_CLASS1_TIMETABLE]
    for (const tt of allTimetables) {
      if (!tt || !tt.schedule) continue
      const cMatch = normalizeClassKey(tt.classes) === normalizeClassKey(clsName)
      if (!cMatch) continue
      for (const day of Object.keys(tt.schedule)) {
        const slots = tt.schedule[day] || []
        for (const slot of (slots as any[])) {
          if (slot.subject?.toLowerCase().trim() === subName.toLowerCase().trim() && slot.teacher && slot.teacher !== 'Not Assigned') {
            return slot.teacher.trim()
          }
        }
      }
    }
  } catch (e) {}

  // 5. Match from allTeachers via assignedClasses
  const fromTeachers = findTeacherForClassSubject(allTeachers, clsName, secName, subName)
  if (fromTeachers) return fromTeachers

  // 6. Subject-based defaults matching teachers in DB
  const sLow = subName.toLowerCase().trim()
  if (sLow.includes('physic') || sLow.includes('science') || sLow.includes('computer') || sLow.includes('art') || sLow.includes('chem') || sLow.includes('bio')) {
    const sk = allTeachers.find((t: any) =>
      (t.name || '').toLowerCase().includes('sk') || (t.name || '').toLowerCase().includes('verma')
    )
    if (sk?.name) return sk.name
    return 'SK Verma'
  }

  if (sLow.includes('english') || sLow.includes('math') || sLow.includes('hindi') || sLow.includes('pe') || sLow.includes('physical') || sLow.includes('social') || sLow.includes('history')) {
    const kam = allTeachers.find((t: any) =>
      (t.name || '').toLowerCase().includes('kamlesh')
    )
    if (kam?.name) return kam.name
    return 'Kamlesh Kumar'
  }

  // 7. General fallback from allTeachers
  if (allTeachers && allTeachers.length > 0) {
    return allTeachers[0].name || allTeachers[0].username || 'Kamlesh Kumar'
  }

  return 'Kamlesh Kumar'
}

function resolveClassTeacher(
  cName: string,
  c: any,
  allTeachers: any[],
  tasks: HomeworkTaskItem[]
): string {
  if (c?.classTeacher && c.classTeacher !== 'Not Assigned') return c.classTeacher
  if (c?.class_teacher && c.class_teacher !== 'Not Assigned') return c.class_teacher

  const normTarget = normalizeClassKey(cName)
  for (const t of allTeachers) {
    const list = Array.isArray(t.assignedClasses)
      ? t.assignedClasses
      : (Array.isArray(t.assigned_classes) ? t.assigned_classes : [])
    for (const item of list) {
      if (normalizeClassKey(String(item)).includes(normTarget)) {
        return t.name || t.username
      }
    }
  }

  const classTask = tasks.find(t =>
    normalizeClassKey(t.classes) === normTarget &&
    t.assignedBy &&
    t.assignedBy.trim() !== '' &&
    t.assignedBy.trim() !== 'Not Assigned'
  )
  if (classTask?.assignedBy) return classTask.assignedBy

  if (allTeachers && allTeachers.length > 0) {
    return allTeachers[0].name || allTeachers[0].username || 'Kamlesh Kumar'
  }
  return 'Kamlesh Kumar'
}

export default function RemarkHomeworkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    }>
      <RemarkHomeworkContent />
    </Suspense>
  )
}

function RemarkHomeworkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTaskId = searchParams.get('taskId')

  // ── ACTIVE STEP SCREEN ──
  const [currentScreen, setCurrentScreen] = useState<StepScreen>('classes')

  // Selection states
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [activeTask, setActiveTask] = useState<HomeworkTaskItem | null>(null)

  // Masters Data
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  // Real DB Data
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [allTeachers, setAllTeachers] = useState<any[]>([])
  const [tasks, setTasks] = useState<HomeworkTaskItem[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)

  // Submissions map for active task: studentId -> submission data
  const [taskSubmissions, setTaskSubmissions] = useState<Record<string, {
    status: 'Submitted' | 'Pending' | 'Rescheduled'
    remark: string
    rating: number
    submittedAt?: string
    rescheduledDate?: string
    attachmentName?: string
  }>>({})
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)

  // Page 1 Filters (Class & Section)
  const [filterClass, setFilterClass] = useState<string>('All')
  const [filterSection, setFilterSection] = useState<string>('All')

  // Page 4 Search & Filter (Students)
  const [studentSearch, setStudentSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Not Completed' | 'Completed' | 'Rescheduled'>('All')
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)

  // Track students that have received an action in this session
  const [sessionActionedIds, setSessionActionedIds] = useState<string[]>([])

  // Modal: Already Remarked Warning Alert Modal
  const [alreadyRemarkWarning, setAlreadyRemarkWarning] = useState<{
    student: StudentSubmissionItem
    actionType: 'complete' | 'incomplete' | 'reschedule' | 'rate' | 'remark'
    starRating?: number
  } | null>(null)

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

  // Page 1: 7-Day Date Slider Strip matching Screenshot 1
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(() => new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date())
  const hasUserManuallySelectedDate = useRef(false)
  const hasAutoSelectedDate = useRef(false)

  // Page 2 & Page 3 Date Filter ('selected' = due on selected date, 'all' = all tasks/subjects)
  const [subjectDateFilter, setSubjectDateFilter] = useState<'selected' | 'all'>('selected')
  const [taskDateFilter, setTaskDateFilter] = useState<'selected' | 'all'>('selected')

  // Task Reschedule Modal State (Allows rescheduling whole task)
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
    if (!newTaskDueDate) {
      showToast('Please select a valid reschedule date', 'error')
      return
    }

    setIsReschedulingTask(true)
    try {
      let formattedDue = newTaskDueDate
      if (newTaskDueDate.includes('-')) {
        const parts = newTaskDueDate.split('-').map(Number)
        const y = parts[0] > 1000 ? parts[0] : parts[2]
        const m = parts[0] > 1000 ? parts[1] : parts[1]
        const d = parts[0] > 1000 ? parts[2] : parts[0]
        if (y && m && d) {
          const dueDt = new Date(y, m - 1, d)
          if (!isNaN(dueDt.getTime())) {
            formattedDue = dueDt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          }
        }
      }
      const formattedAssign = rescheduleTaskModal.assignDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

      try {
        const res = await rescheduleHomeworkTask(
          rescheduleTaskModal.id,
          formattedAssign,
          formattedDue,
          taskRescheduleReason.trim()
        )
        if (res && res.success === false) {
          console.warn('rescheduleHomeworkTask notice:', res.error)
        }
      } catch (err: any) {
        console.warn('rescheduleHomeworkTask error:', err)
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
      if (activeTask && activeTask.id === rescheduleTaskModal.id) {
        setActiveTask(prev => prev ? {
          ...prev,
          assignDate: formattedAssign,
          submissionDate: formattedDue,
          description: taskRescheduleReason.trim()
            ? `${prev.description} (Rescheduled: ${taskRescheduleReason.trim()})`
            : prev.description
        } : null)
      }
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
      try {
        await deleteHomeworkTask(id)
      } catch (err: any) {
        console.warn('deleteHomeworkTask server error:', err)
      }
      const updated = tasks.filter(t => t.id !== id)
      setTasks(updated)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
          localStorage.removeItem(`school_task_subs_${id}`)
        } catch (e) {}
      }
      if (activeTask?.id === id) setActiveTask(null)
      showToast('Homework task deleted successfully', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error')
    }
  }

  // Early client mount sync from localStorage: immediately set remark date to created task submission date
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasUserManuallySelectedDate.current && !hasAutoSelectedDate.current) {
      try {
        const raw = localStorage.getItem('school_homework_tasks')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const targetTask = initialTaskId ? (parsed.find((t: any) => t.id === initialTaskId) || parsed[0]) : parsed[0]
            if (targetTask?.submissionDate) {
              const norm = normalizeDateStr(targetTask.submissionDate)
              if (norm) {
                const taskDate = parseIsoToLocalDate(norm)
                setSelectedCalendarDate(taskDate)
                setCalendarAnchorDate(taskDate)
              }
            }
          }
        }
      } catch {}
    }
  }, [initialTaskId])

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

      const dayIso = toDateIso(d)
      const dayTasks = tasks.filter(t => isTaskDueOnDate(t, d))
      const hasTasks = dayTasks.length > 0
      const taskCount = dayTasks.length

      days.push({ date: d, dayNum, dayName, isSelected, hasTasks, taskCount, dayIso })
    }
    return days
  }, [calendarAnchorDate, selectedCalendarDate, tasks])

  const shiftCalendar = (offsetDays: number) => {
    hasUserManuallySelectedDate.current = true
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
        const key = getStudentKey(item) || `stu-local-${idx}`
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
        const gender = s.gender || 'Student'
        const id = String(s.id || admissionNo || `stu-${idx}`)

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
            class_name: s.class_name || loc.class_name || loc.className || loc.class || '',
            section_name: s.section_name || loc.section_name || loc.section || ''
          }, idx)
        })
        combinedStuds = dbStuds
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

      // Fetch Real Homework Tasks
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
          studentsCount: combinedStuds.filter(s => matchesClassAndSection(s, t.classes, t.section)).length,
          submissions: Array.isArray(t.submissions) ? t.submissions : [],
          rescheduledCount: t.rescheduledCount || 0,
          submittedCount: t.submittedCount || 0,
          rescheduledDate: t.rescheduledDate || t.rescheduled_date || undefined
        }))
      } else {
        const rawTasks = parseLocal('school_homework_tasks')
        if (Array.isArray(rawTasks) && rawTasks.length > 0) {
          loadedTasks = rawTasks.map((t: any) => ({
            ...t,
            submissions: Array.isArray(t.submissions) ? t.submissions : [],
            studentsCount: combinedStuds.filter(s => matchesClassAndSection(s, t.classes, t.section)).length
          }))
        }
      }

      // Enrich loaded tasks with local client-side submissions and rescheduled remarks
      loadedTasks = loadedTasks.map((task: any) => {
        let subs = Array.isArray(task.submissions) ? [...task.submissions] : []
        try {
          const rawLocal = localStorage.getItem(`school_task_subs_${task.id}`)
          if (rawLocal) {
            const parsed = JSON.parse(rawLocal)
            if (Array.isArray(parsed)) {
              parsed.forEach((p: any) => {
                const pKey = getStudentKey(p)
                const existingIdx = subs.findIndex((s: any) => String(s.studentId || s.student_id) === pKey)
                const item = {
                  studentId: pKey,
                  studentName: p.name || p.studentName,
                  status: p.status,
                  remark: p.remark,
                  rescheduledDate: p.rescheduledDate || p.rescheduled_date
                }
                if (existingIdx >= 0) subs[existingIdx] = { ...subs[existingIdx], ...item }
                else subs.push(item)
              })
            }
          }
        } catch {}

        try {
          const rawResched = localStorage.getItem('school_rescheduled_remarks')
          if (rawResched) {
            const parsed = JSON.parse(rawResched)
            if (Array.isArray(parsed)) {
              parsed.filter((r: any) => String(r.taskId) === String(task.id)).forEach((r: any) => {
                const rKey = String(r.studentId)
                const existingIdx = subs.findIndex((s: any) => String(s.studentId || s.student_id) === rKey)
                const item = {
                  studentId: rKey,
                  studentName: r.studentName,
                  status: 'Rescheduled' as const,
                  remark: r.description || r.remark,
                  rescheduledDate: r.rescheduledDate
                }
                if (existingIdx >= 0) subs[existingIdx] = { ...subs[existingIdx], ...item }
                else subs.push(item)
              })
            }
          }
        } catch {}

        return { ...task, submissions: subs }
      })

      setTasks(loadedTasks)

      // Auto-set Remark Date according to created task submission date
      if (loadedTasks.length > 0 && !hasUserManuallySelectedDate.current && !hasAutoSelectedDate.current) {
        let targetTask = initialTaskId ? loadedTasks.find(t => t.id === initialTaskId) : undefined
        if (!targetTask) {
          targetTask = loadedTasks.find(t => !!normalizeDateStr(t.submissionDate)) || loadedTasks[0]
        }

        if (targetTask?.submissionDate) {
          const norm = normalizeDateStr(targetTask.submissionDate)
          if (norm) {
            const taskDate = parseIsoToLocalDate(norm)
            setSelectedCalendarDate(taskDate)
            setCalendarAnchorDate(taskDate)
            hasAutoSelectedDate.current = true
          }
        }
      }

      // Check if taskId was provided via query param to jump directly into remark evaluation
      if (initialTaskId) {
        const found = loadedTasks.find(t => t.id === initialTaskId)
        if (found) {
          setSelectedClass(found.classes)
          setSelectedSection(found.section)
          setSelectedSubject(found.subject)
          setActiveTask(found)
          setCurrentScreen('evaluation')
        }
      }

    } catch (err) {
      console.error('Error loading remark data:', err)
    } finally {
      setLoadingTasks(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [initialTaskId])

  // Load Submissions whenever activeTask changes
  useEffect(() => {
    if (!activeTask) return
    let isMounted = true

    const loadSubs = async () => {
      setLoadingSubmissions(true)
      try {
        const res = await fetchTaskSubmissions(activeTask.id)
        if (isMounted && res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const map: Record<string, { status: 'Submitted' | 'Pending' | 'Rescheduled'; remark: string; rating: number; submittedAt?: string; rescheduledDate?: string; attachmentName?: string }> = {}
          res.data.forEach((row: any) => {
            const sid = String(row.studentId || row.student_id || row.admissionNo)
            const r = typeof row.rating === 'number' && row.rating >= 1 && row.rating <= 5 ? row.rating : 5
            const item = {
              status: (row.status === 'Submitted' ? 'Submitted' : (row.status === 'Rescheduled' ? 'Rescheduled' : 'Pending')) as 'Submitted' | 'Pending' | 'Rescheduled',
              remark: row.remark || '',
              rating: r,
              rescheduledDate: row.rescheduledDate || undefined,
              attachmentName: row.attachmentName || undefined,
              submittedAt: row.submittedAt || undefined
            }
            map[sid] = item
            if (row.studentId) map[String(row.studentId)] = item
            if (row.student_id) map[String(row.student_id)] = item
            if (row.admissionNo) map[String(row.admissionNo)] = item
            if (row.rollNo) map[String(row.rollNo)] = item
          })

          // Sync any localStorage rescheduled remarks
          try {
            const rawResched = localStorage.getItem('school_rescheduled_remarks')
            if (rawResched) {
              const parsedResched = JSON.parse(rawResched)
              if (Array.isArray(parsedResched)) {
                parsedResched.filter((r: any) => r.taskId === activeTask.id).forEach((r: any) => {
                  if (map[r.studentId]) {
                    map[r.studentId].status = 'Rescheduled'
                    map[r.studentId].rescheduledDate = r.rescheduledDate
                    map[r.studentId].remark = r.description || map[r.studentId].remark
                  }
                })
              }
            }
          } catch {}

          setTaskSubmissions(map)
          return
        }
      } catch (e) {}

      // Fallback: check localStorage cached submissions for this task
      try {
        const rawLocalSub = localStorage.getItem(`school_task_subs_${activeTask.id}`)
        if (rawLocalSub && isMounted) {
          const parsed = JSON.parse(rawLocalSub)
          if (Array.isArray(parsed)) {
            const map: Record<string, any> = {}
            parsed.forEach((s: any) => {
              const sid = getStudentKey(s)
              map[sid] = {
                status: s.status || 'Pending',
                remark: s.remark || '',
                rating: s.rating || 5,
                rescheduledDate: s.rescheduledDate || undefined,
                attachmentName: s.attachmentName || undefined
              }
            })

            try {
              const rawResched = localStorage.getItem('school_rescheduled_remarks')
              if (rawResched) {
                const parsedResched = JSON.parse(rawResched)
                if (Array.isArray(parsedResched)) {
                  parsedResched.filter((r: any) => r.taskId === activeTask.id).forEach((r: any) => {
                    if (map[r.studentId]) {
                      map[r.studentId].status = 'Rescheduled'
                      map[r.studentId].rescheduledDate = r.rescheduledDate
                      map[r.studentId].remark = r.description || map[r.studentId].remark
                    }
                  })
                }
              }
            } catch {}

            setTaskSubmissions(map)
            return
          }
        }
      } catch (e) {}

      if (isMounted) setTaskSubmissions({})
      setLoadingSubmissions(false)
    }

    loadSubs()
    return () => { isMounted = false }
  }, [activeTask])

  const selectedDateIso = useMemo(() => {
    return toDateIso(selectedCalendarDate)
  }, [selectedCalendarDate])

  const totalTasksDueOnSelectedDate = useMemo(() => {
    return tasks.filter(t => isTaskDueOnDate(t, selectedCalendarDate)).length
  }, [tasks, selectedCalendarDate])

  // ── Class Cards for Page 1 (Matching Screenshot 1 with Total / Completed / Pending pills) ──
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
    const rawSubjects = parseLocal('school_masters_subjects')
    const mergedClasses = Array.isArray(classesData) && classesData.length > 0 ? classesData : rawClasses
    const mergedSubjects = Array.isArray(subjectsData) && subjectsData.length > 0 ? subjectsData : rawSubjects
    const selectedIso = toDateIso(selectedCalendarDate)

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
          const studentCount = allStudents.length > 0 ? matchedCount : (matchedCount > 0 ? matchedCount : masterCount)

          // All tasks for this class & section
          const allClassTasks = tasks.filter(t => matchesClassAndSection({ class: t.classes, section: t.section }, cName, sec))

          // Filter tasks due on selected submission date (strictly matching selected calendar date)
          const classTasksOnDate = allClassTasks.filter(t => isTaskDueOnDate(t, selectedCalendarDate))
          
          let completed = 0
          let dueRemarks = 0
          const completedTasksOnDate = classTasksOnDate.filter(t => isTaskCompleted(t, taskSubmissions, allStudents)).length
          const pendingTasksOnDate = classTasksOnDate.length - completedTasksOnDate
          const isClassCompletedOnDate = classTasksOnDate.length > 0 && pendingTasksOnDate === 0

          if (classTasksOnDate.length > 0) {
            classTasksOnDate.forEach(t => {
              const isComp = isTaskCompleted(t, taskSubmissions, allStudents)
              const dbSubs = Array.isArray(t.submissions) ? t.submissions : []
              let dbSubmitted = typeof t.submittedCount === 'number'
                ? t.submittedCount
                : dbSubs.filter((s: any) => s.status === 'Submitted' || s.status === 'Completed').length

              let localSubmitted = 0
              let localTotal = 0
              try {
                const raw = localStorage.getItem(`school_task_subs_${t.id}`)
                if (raw) {
                  const parsed = JSON.parse(raw)
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    localSubmitted = parsed.filter((s: any) => s.status === 'Submitted' || s.status === 'Completed').length
                    localTotal = parsed.length
                  }
                }
              } catch (e) {}

              const effectiveSubmitted = Math.max(dbSubmitted, localSubmitted)
              const assignedCount = Array.isArray(t.assignedStudentIds) && t.assignedStudentIds.length > 0
                ? t.assignedStudentIds.length
                : (studentCount || localTotal || 1)

              completed += effectiveSubmitted
              if (!isComp) {
                dueRemarks += Math.max(0, assignedCount - effectiveSubmitted)
              }
            })
          }

          const pending = classTasksOnDate.length > 0 ? Math.max(0, (studentCount * classTasksOnDate.length) - completed) : 0

          // Calculate unique subjects for this class that have tasks due on selected date
          const subjectsOnDate = new Set(
            classTasksOnDate
              .map(t => t.subject?.toLowerCase().trim())
              .filter(Boolean)
          )
          const totalSubjects = subjectsOnDate.size
          const teacher = resolveClassTeacher(cName, c, allTeachers, tasks)

          list.push({
            id: `${cName}-${sec}`,
            className: cName,
            section: sec,
            classTeacher: teacher,
            studentsCount: studentCount,
            completedCount: completed,
            pendingCount: pending,
            tasksCount: classTasksOnDate.length,
            completedTasksCount: completedTasksOnDate,
            pendingTasksCount: pendingTasksOnDate,
            allTasksCount: allClassTasks.length,
            totalSubjects,
            dueRemarks: isClassCompletedOnDate ? 0 : dueRemarks,
            isCompleted: isClassCompletedOnDate
          })
        })
      })
    }

    // Fallback if masters is empty
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
        const allClassTasks = tasks.filter(t => matchesClassAndSection({ class: t.classes, section: t.section }, item.className, item.section))
        const classTasksOnDate = allClassTasks.filter(t => isTaskDueOnDate(t, selectedCalendarDate))

        let completed = 0
        let dueRemarks = 0
        const completedTasksOnDate = classTasksOnDate.filter(t => isTaskCompleted(t, taskSubmissions, allStudents)).length
        const pendingTasksOnDate = classTasksOnDate.length - completedTasksOnDate
        const isClassCompletedOnDate = classTasksOnDate.length > 0 && pendingTasksOnDate === 0

        if (classTasksOnDate.length > 0) {
          classTasksOnDate.forEach(t => {
            const isComp = isTaskCompleted(t, taskSubmissions, allStudents)
            const dbSubs = Array.isArray(t.submissions) ? t.submissions : []
            const dbSubmitted = typeof t.submittedCount === 'number'
              ? t.submittedCount
              : dbSubs.filter((s: any) => s.status === 'Submitted' || s.status === 'Completed').length

            let localSubmitted = 0
            let localTotal = 0
            try {
              const raw = localStorage.getItem(`school_task_subs_${t.id}`)
              if (raw) {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed) && parsed.length > 0) {
                  localSubmitted = parsed.filter((s: any) => s.status === 'Submitted' || s.status === 'Completed').length
                  localTotal = parsed.length
                }
              }
            } catch (e) {}

            const effectiveSubmitted = Math.max(dbSubmitted, localSubmitted)
            const assignedCount = Array.isArray(t.assignedStudentIds) && t.assignedStudentIds.length > 0
              ? t.assignedStudentIds.length
              : (item.count || localTotal || 1)

            completed += effectiveSubmitted
            if (!isComp) {
              dueRemarks += Math.max(0, assignedCount - effectiveSubmitted)
            }
          })
        }

        const pending = classTasksOnDate.length > 0 ? Math.max(0, (item.count * classTasksOnDate.length) - completed) : 0

        // Calculate unique subjects for this class that have tasks due on selected date
        const subjectsOnDate = new Set(
          classTasksOnDate
            .map(t => t.subject?.toLowerCase().trim())
            .filter(Boolean)
        )
        const totalSubjects = subjectsOnDate.size

        list.push({
          id: `${item.className}-${item.section}`,
          className: item.className,
          section: item.section,
          classTeacher: resolveClassTeacher(item.className, null, allTeachers, tasks),
          studentsCount: item.count,
          completedCount: completed,
          pendingCount: pending,
          tasksCount: classTasksOnDate.length,
          completedTasksCount: completedTasksOnDate,
          pendingTasksCount: pendingTasksOnDate,
          allTasksCount: allClassTasks.length,
          totalSubjects,
          dueRemarks: isClassCompletedOnDate ? 0 : dueRemarks,
          isCompleted: isClassCompletedOnDate
        })
      })
    }

    // Sort classes: classes with tasks due on selectedCalendarDate appear first
    list.sort((a, b) => b.tasksCount - a.tasksCount)

    return list
  }, [classesData, subjectsData, allStudents, allTeachers, tasks, selectedCalendarDate, taskSubmissions])

  // Initial Class Selection
  useEffect(() => {
    if (classCards.length > 0 && (!selectedClass || !classCards.some(c => c.className === selectedClass))) {
      setSelectedClass(classCards[0].className)
      setSelectedSection(classCards[0].section)
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

  // ── Subject Cards for Page 2 (Matching Screenshot 2) ──
  const subjectCards = useMemo<SubjectCard[]>(() => {
    const parseLocal = (k: string) => {
      if (typeof window === 'undefined') return []
      try {
        const raw = localStorage.getItem(k)
        return raw ? JSON.parse(raw) : []
      } catch { return [] }
    }

    const rawSubjects = parseLocal('school_masters_subjects')
    const mergedSubjects = Array.isArray(subjectsData) && subjectsData.length > 0 ? subjectsData : rawSubjects

    const list: SubjectCard[] = []
    const seenSubs = new Set<string>()

    if (Array.isArray(mergedSubjects) && mergedSubjects.length > 0) {
      const active = mergedSubjects.filter((s: any) => !s.deleted && s.subjectName)
      active.forEach((s: any, idx: number) => {
        const subName = s.subjectName.trim()
        if (seenSubs.has(subName.toLowerCase())) return
        seenSubs.add(subName.toLowerCase())

        const presetColor = PASTEL_PALETTES[list.length % PASTEL_PALETTES.length]
        const teacher = resolveTeacherForSubject(
          subName,
          selectedClass,
          selectedSection,
          tasks,
          allTeachers,
          s.teacherName || s.assignedTeacher || s.teacher
        )

        list.push({
          id: s.id || `sub-${list.length}`,
          subjectName: subName,
          teacherName: teacher,
          bgColor: presetColor.bgColor,
          borderColor: presetColor.borderColor,
          textColor: presetColor.textColor,
          badgeColor: presetColor.badgeColor
        })
      })
    }

    // Also include subjects from tasks
    tasks.forEach(t => {
      if (t.subject && !seenSubs.has(t.subject.toLowerCase())) {
        seenSubs.add(t.subject.toLowerCase())
        const idx = list.length
        const presetColor = PASTEL_PALETTES[idx % PASTEL_PALETTES.length]
        const teacher = resolveTeacherForSubject(
          t.subject,
          selectedClass,
          selectedSection,
          tasks,
          allTeachers,
          t.assignedBy
        )

        list.push({
          id: `task-sub-${idx}`,
          subjectName: t.subject,
          teacherName: teacher,
          bgColor: presetColor.bgColor,
          borderColor: presetColor.borderColor,
          textColor: presetColor.textColor,
          badgeColor: presetColor.badgeColor
        })
      }
    })

    return list
  }, [subjectsData, allTeachers, tasks, selectedClass, selectedSection])

  // Filtered Subject Cards for Page 2 (Only subjects that have tasks due on selectedCalendarDate for this class)
  const displayedSubjectCards = useMemo(() => {
    const subjectsDueOnDate = subjectCards.filter(sub => {
      return tasks.some(t => {
        const classMatch = matchesClassAndSection({ class: t.classes, section: t.section }, selectedClass, selectedSection)
        const subMatch = t.subject.toLowerCase().trim() === sub.subjectName.toLowerCase().trim()
        if (!classMatch || !subMatch) return false
        return isTaskDueOnDate(t, selectedCalendarDate)
      })
    })

    if (subjectDateFilter === 'selected') {
      return subjectsDueOnDate
    }
    return subjectCards
  }, [subjectCards, tasks, selectedClass, selectedSection, selectedCalendarDate, subjectDateFilter])

  // ── Subject Tasks for Page 3 (Matching Screenshot 3) ──
  const activeSubjectTasks = useMemo(() => {
    return tasks.filter(t => {
      const classMatch = matchesClassAndSection({ class: t.classes, section: t.section }, selectedClass, selectedSection)
      const subMatch = t.subject.toLowerCase().trim() === selectedSubject.toLowerCase().trim()
      return classMatch && subMatch
    })
  }, [tasks, selectedClass, selectedSection, selectedSubject])

  const tasksDueOnSelectedDate = useMemo(() => {
    return activeSubjectTasks.filter(t => isTaskDueOnDate(t, selectedCalendarDate))
  }, [activeSubjectTasks, selectedCalendarDate])

  // Only tasks due on the selected date are shown (All Dates tab selection removed as requested)
  const displayedSubjectTasks = useMemo(() => {
    return tasksDueOnSelectedDate
  }, [tasksDueOnSelectedDate])

  // ── Page 4: "REMARK THOSE THAT ASSIGNED" (Filtered strictly to Assigned Students) ──
  const assignedStudentsForActiveTask = useMemo<StudentSubmissionItem[]>(() => {
    if (!activeTask) return []

    // 1. Get all students enrolled in this class & section
    const classEnrolledStudents = allStudents.filter(s =>
      matchesClassAndSection(s, activeTask.classes, activeTask.section)
    )

    // 2. Check if specific assignments were recorded in localStorage or DB submissions
    let assignedIdsSet: Set<string> | null = null

    try {
      const raw = localStorage.getItem(`school_task_subs_${activeTask.id}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          assignedIdsSet = new Set(parsed.map((s: any) => getStudentKey(s)))
        }
      }
    } catch (e) {}

    // If submissions exist in state, those IDs are assigned
    const subKeys = Object.keys(taskSubmissions)
    if (subKeys.length > 0) {
      if (!assignedIdsSet) assignedIdsSet = new Set()
      subKeys.forEach(k => assignedIdsSet!.add(k))
    }

    // "remark those that assigned": If specific assignment records exist, filter to them;
    // Otherwise fallback to all enrolled students for this class & section
    const targetStudents = assignedIdsSet && assignedIdsSet.size > 0
      ? classEnrolledStudents.filter(st => assignedIdsSet!.has(getStudentKey(st)))
      : classEnrolledStudents

    return targetStudents.map(st => {
      const sId = getStudentKey(st)
      const sub = taskSubmissions[sId]
      const status = sub?.status || 'Pending'
      const remark = sub?.remark || ''
      const rating = sub?.rating || 5

      return {
        studentId: sId,
        name: st.name || 'Student',
        rollNo: st.rollNo || '001',
        admissionNo: st.admissionNo || 'ADM-001',
        avatar: st.photo || st.avatar || '',
        gender: st.gender || 'Student',
        status,
        remark,
        rating,
        rescheduledDate: sub?.rescheduledDate,
        attachmentName: sub?.attachmentName,
        submittedAt: sub?.submittedAt
      }
    })
  }, [activeTask, allStudents, taskSubmissions])

  // Search & Filtered Students for Page 4 - Show ALL students by default
  const filteredAssignedStudents = useMemo(() => {
    const list = assignedStudentsForActiveTask.filter(st => {
      // Rescheduled homework is still awaiting completion, so will not remove from Not Completed
      if (statusFilter === 'Not Completed' && st.status !== 'Pending' && st.status !== 'Rescheduled') return false
      if (statusFilter === 'Completed' && st.status !== 'Submitted') return false
      if (statusFilter === 'Rescheduled' && st.status !== 'Rescheduled') return false

      if (!studentSearch.trim()) return true
      const q = studentSearch.toLowerCase().trim()
      return (
        st.name.toLowerCase().includes(q) ||
        st.rollNo.toLowerCase().includes(q) ||
        st.admissionNo.toLowerCase().includes(q)
      )
    })

    // Sort: students rescheduled to selectedCalendarDate come FIRST, then by rollNo
    const selectedIso = toDateIso(selectedCalendarDate)
    return list.sort((a, b) => {
      const aIsTodayResched = a.status === 'Rescheduled' && normalizeDateStr(a.rescheduledDate) === selectedIso
      const bIsTodayResched = b.status === 'Rescheduled' && normalizeDateStr(b.rescheduledDate) === selectedIso
      if (aIsTodayResched && !bIsTodayResched) return -1
      if (!aIsTodayResched && bIsTodayResched) return 1
      return (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true })
    })
  }, [assignedStudentsForActiveTask, statusFilter, studentSearch, selectedCalendarDate])

  // Categorized student lists for headlines
  // When a student is rescheduled, they will NOT remove from old date; they stay listed in Not Completed with their Rescheduled badge
  const notCompletedStudents = useMemo(() => {
    return filteredAssignedStudents.filter(st => st.status === 'Pending' || st.status === 'Rescheduled')
  }, [filteredAssignedStudents])

  const completedStudents = useMemo(() => {
    return filteredAssignedStudents.filter(st => st.status === 'Submitted')
  }, [filteredAssignedStudents])

  const rescheduledStudents = useMemo(() => {
    return filteredAssignedStudents.filter(st => st.status === 'Rescheduled')
  }, [filteredAssignedStudents])

  // Check if a student already has a remark / evaluated action
  const isStudentAlreadyRemarked = (st: StudentSubmissionItem) => {
    if (sessionActionedIds.includes(st.studentId)) return true
    if (st.status === 'Submitted' || st.status === 'Rescheduled') return true
    if (st.remark && st.remark.trim() && st.remark !== 'No evaluation remark added yet.') return true
    return false
  }

  // Execute student action directly
  const executeStudentAction = (
    st: StudentSubmissionItem,
    actionType: 'complete' | 'incomplete' | 'reschedule' | 'rate' | 'remark',
    starRating?: number
  ) => {
    if (actionType === 'complete') {
      setCompleteModalStudent(st)
      setCompleteRating(st.rating || 5)
      setCompleteReview(st.remark || 'Excellent work, all questions answered with clear steps.')
      setCompleteFileName(st.attachmentName || '')
    } else if (actionType === 'incomplete') {
      setNotCompleteModalStudent(st)
      setNotCompleteRemark(st.remark || 'Incomplete assignment, please finish and resubmit.')
      setNotCompleteFileName(st.attachmentName || '')
    } else if (actionType === 'reschedule') {
      setRescheduleModalStudent(st)
      const defaultDate = st.rescheduledDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
      setRescheduleDate(defaultDate)
      setRescheduleDescription(
        st.remark && st.remark !== 'Excellent work, all questions answered with clear steps.'
          ? st.remark
          : 'Homework rescheduled to a new date.'
      )
    } else if (actionType === 'rate') {
      setCompleteModalStudent(st)
      setCompleteRating(starRating || 5)
      setCompleteReview(st.remark || 'Excellent work, all questions answered with clear steps.')
      setCompleteFileName(st.attachmentName || '')
    } else if (actionType === 'remark') {
      if (st.status === 'Submitted') {
        setCompleteModalStudent(st)
        setCompleteRating(st.rating || 5)
        setCompleteReview(st.remark || '')
        setCompleteFileName(st.attachmentName || '')
      } else {
        setNotCompleteModalStudent(st)
        setNotCompleteRemark(st.remark || '')
        setNotCompleteFileName(st.attachmentName || '')
      }
    }
  }

  // Intercept action with warning if student is already remarked
  const handleActionWithWarning = (
    st: StudentSubmissionItem,
    actionType: 'complete' | 'incomplete' | 'reschedule' | 'rate' | 'remark',
    starRating?: number
  ) => {
    if (isStudentAlreadyRemarked(st)) {
      setAlreadyRemarkWarning({ student: st, actionType, starRating })
    } else {
      executeStudentAction(st, actionType, starRating)
    }
  }

  // ── HANDLERS FOR STUDENT EVALUATION & MODALS ──

  // 1. Save Complete Modal (Screenshot 3)
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

      setTaskSubmissions(prev => ({
        ...prev,
        [stId]: {
          status: 'Submitted',
          remark: reviewText,
          rating: completeRating,
          attachmentName: completeFileName || undefined,
          submittedAt: new Date().toISOString()
        }
      }))

      // Update localStorage
      try {
        const raw = localStorage.getItem(`school_task_subs_${activeTask.id}`)
        let arr = raw ? JSON.parse(raw) : []
        const idx = arr.findIndex((x: any) => getStudentKey(x) === stId)
        const updatedItem = {
          ...completeModalStudent,
          status: 'Submitted',
          remark: reviewText,
          rating: completeRating,
          attachmentName: completeFileName || undefined,
          submittedAt: new Date().toISOString()
        }
        if (idx >= 0) arr[idx] = updatedItem
        else arr.push(updatedItem)
        localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(arr))

        // Also clean up any rescheduled entry for this student & task
        const rawResched = localStorage.getItem('school_rescheduled_remarks')
        if (rawResched) {
          const parsedResched = JSON.parse(rawResched)
          const filteredResched = parsedResched.filter((r: any) => !(r.taskId === activeTask.id && r.studentId === stId))
          localStorage.setItem('school_rescheduled_remarks', JSON.stringify(filteredResched))
        }
      } catch (e) {}

      // Update tasks & activeTask in memory
      setTasks(prevTasks => {
        const updated = prevTasks.map(t => {
          if (t.id !== activeTask.id) return t
          const existingSubs = Array.isArray(t.submissions) ? [...t.submissions] : []
          const subIdx = existingSubs.findIndex(s => String(s.studentId || s.student_id) === String(stId))
          const newSubItem = {
            studentId: stId,
            studentName: completeModalStudent.name,
            status: 'Submitted' as const,
            remark: reviewText,
            rating: completeRating
          }
          if (subIdx >= 0) existingSubs[subIdx] = { ...existingSubs[subIdx], ...newSubItem }
          else existingSubs.push(newSubItem)

          const submittedCount = existingSubs.filter(s => s.status === 'Submitted').length
          const totalCount = t.studentsCount || existingSubs.length || 1
          const isNowCompleted = submittedCount >= totalCount

          return {
            ...t,
            status: isNowCompleted ? 'Completed' as const : t.status,
            submissions: existingSubs,
            submittedCount
          }
        })
        try {
          localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
        } catch {}
        return updated
      })

      setActiveTask(prev => {
        if (!prev) return prev
        const existingSubs = Array.isArray(prev.submissions) ? [...prev.submissions] : []
        const subIdx = existingSubs.findIndex(s => String(s.studentId || s.student_id) === String(stId))
        const newSubItem = {
          studentId: stId,
          studentName: completeModalStudent.name,
          status: 'Submitted' as const,
          remark: reviewText,
          rating: completeRating
        }
        if (subIdx >= 0) existingSubs[subIdx] = { ...existingSubs[subIdx], ...newSubItem }
        else existingSubs.push(newSubItem)
        const submittedCount = existingSubs.filter(s => s.status === 'Submitted').length
        const totalCount = prev.studentsCount || existingSubs.length || 1
        const isNowCompleted = submittedCount >= totalCount
        return {
          ...prev,
          status: isNowCompleted ? 'Completed' as const : prev.status,
          submissions: existingSubs,
          submittedCount
        }
      })

      showToast(`Completed evaluation saved for ${completeModalStudent.name}!`, 'success')
      setSessionActionedIds(prev => Array.from(new Set([...prev, stId])))
      setCompleteModalStudent(null)
      setCompleteFileName('')
    } catch (err: any) {
      console.error('Failed to save complete modal:', err)
      showToast(err.message || 'Failed to save', 'error')
    } finally {
      setIsSavingModal(false)
    }
  }

  // 2. Save Not Complete Modal (Screenshot 4)
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

      setTaskSubmissions(prev => ({
        ...prev,
        [stId]: {
          status: 'Pending',
          remark: remarkText,
          rating: notCompleteModalStudent.rating || 5,
          attachmentName: notCompleteFileName || undefined
        }
      }))

      // Update localStorage
      try {
        const raw = localStorage.getItem(`school_task_subs_${activeTask.id}`)
        let arr = raw ? JSON.parse(raw) : []
        const idx = arr.findIndex((x: any) => getStudentKey(x) === stId)
        const updatedItem = {
          ...notCompleteModalStudent,
          status: 'Pending',
          remark: remarkText,
          rating: notCompleteModalStudent.rating || 5,
          attachmentName: notCompleteFileName || undefined
        }
        if (idx >= 0) arr[idx] = updatedItem
        else arr.push(updatedItem)
        localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(arr))
      } catch (e) {}

      showToast(`Not Complete remark saved for ${notCompleteModalStudent.name}!`, 'success')
      setSessionActionedIds(prev => Array.from(new Set([...prev, stId])))
      setNotCompleteModalStudent(null)
      setNotCompleteFileName('')
    } catch (err: any) {
      console.error('Failed to save not complete modal:', err)
      showToast(err.message || 'Failed to save', 'error')
    } finally {
      setIsSavingModal(false)
    }
  }

  // 3. Save Reschedule Modal (Screenshot 2)
  const handleSaveRescheduleModal = async () => {
    if (!activeTask || !rescheduleModalStudent) return
    setIsSavingModal(true)
    const stId = rescheduleModalStudent.studentId
    const formattedReschedDate = rescheduleDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const desc = rescheduleDescription.trim() || 'Homework rescheduled to a new date.'

    try {
      await updateStudentTaskSubmission(activeTask.id, stId, 'Rescheduled', {
        studentName: rescheduleModalStudent.name,
        admissionNo: rescheduleModalStudent.admissionNo,
        rollNo: rescheduleModalStudent.rollNo,
        remark: desc,
        rating: 5,
        rescheduledDate: formattedReschedDate
      })

      setTaskSubmissions(prev => ({
        ...prev,
        [stId]: {
          status: 'Rescheduled',
          remark: desc,
          rating: 5,
          rescheduledDate: formattedReschedDate
        }
      }))

      // Update tasks state immediately in memory and in localStorage so calendar & task lists update without refresh
      setTasks(prevTasks => {
        const updated = prevTasks.map(t => {
          if (t.id !== activeTask.id) return t
          const existingSubs = Array.isArray(t.submissions) ? [...t.submissions] : []
          const subIdx = existingSubs.findIndex(s => String(s.studentId || s.student_id) === String(stId))
          const newSubItem = {
            studentId: stId,
            studentName: rescheduleModalStudent.name,
            status: 'Rescheduled' as const,
            remark: desc,
            rescheduledDate: formattedReschedDate
          }
          if (subIdx >= 0) existingSubs[subIdx] = { ...existingSubs[subIdx], ...newSubItem }
          else existingSubs.push(newSubItem)

          return {
            ...t,
            submissions: existingSubs,
            rescheduledCount: existingSubs.filter(s => s.status === 'Rescheduled').length
          }
        })
        try {
          localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
        } catch {}
        return updated
      })

      setActiveTask(prev => {
        if (!prev) return prev
        const existingSubs = Array.isArray(prev.submissions) ? [...prev.submissions] : []
        const subIdx = existingSubs.findIndex(s => String(s.studentId || s.student_id) === String(stId))
        const newSubItem = {
          studentId: stId,
          studentName: rescheduleModalStudent.name,
          status: 'Rescheduled' as const,
          remark: desc,
          rescheduledDate: formattedReschedDate
        }
        if (subIdx >= 0) existingSubs[subIdx] = { ...existingSubs[subIdx], ...newSubItem }
        else existingSubs.push(newSubItem)
        return {
          ...prev,
          submissions: existingSubs,
          rescheduledCount: existingSubs.filter(s => s.status === 'Rescheduled').length
        }
      })

      // Update localStorage task submissions
      try {
        const raw = localStorage.getItem(`school_task_subs_${activeTask.id}`)
        let arr = raw ? JSON.parse(raw) : []
        const idx = arr.findIndex((x: any) => getStudentKey(x) === stId)
        const updatedItem = {
          ...rescheduleModalStudent,
          status: 'Rescheduled',
          remark: desc,
          rating: 5,
          rescheduledDate: formattedReschedDate
        }
        if (idx >= 0) arr[idx] = updatedItem
        else arr.push(updatedItem)
        localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(arr))
      } catch (e) {}

      // Store in school_rescheduled_remarks registry for pending-remark
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
      } catch (e) {}

      showToast(`${rescheduleModalStudent.name} rescheduled to ${formattedReschedDate}! Moved to Pending Remark.`, 'success')
      setSessionActionedIds(prev => Array.from(new Set([...prev, stId])))
      setRescheduleModalStudent(null)
    } catch (err: any) {
      console.error('Failed to reschedule:', err)
      showToast(err.message || 'Failed to reschedule', 'error')
    } finally {
      setIsSavingModal(false)
    }
  }

  // 4. Selection Helpers
  const toggleStudentSelect = (id: string) => {
    setBulkSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (bulkSelectedStudentIds.length === filteredAssignedStudents.length) {
      setBulkSelectedStudentIds([])
    } else {
      setBulkSelectedStudentIds(filteredAssignedStudents.map(s => s.studentId))
    }
  }

  const handleOpenBulkModal = () => {
    if (bulkSelectedStudentIds.length === 0) {
      setBulkSelectedStudentIds(filteredAssignedStudents.map(s => s.studentId))
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

  // 5. Bulk Action Execution
  const handleExecuteBulkAction = async () => {
    if (!activeTask || bulkSelectedStudentIds.length === 0) {
      showToast('Please select students for bulk action.', 'error')
      return
    }

    setIsBulkSubmitting(true)
    try {
      const selectedStudents = assignedStudentsForActiveTask.filter(s =>
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

        setTaskSubmissions(prev => {
          const next = { ...prev }
          selectedStudents.forEach(st => {
            next[st.studentId] = {
              status: 'Submitted',
              remark: text,
              rating: bulkRating,
              attachmentName: bulkFileName || undefined,
              submittedAt: new Date().toISOString()
            }
          })
          return next
        })

        setTasks(prevTasks => {
          const updated = prevTasks.map(t => {
            if (t.id !== activeTask.id) return t
            const existingSubs = Array.isArray(t.submissions) ? [...t.submissions] : []
            selectedStudents.forEach(st => {
              const subIdx = existingSubs.findIndex(s => String(s.studentId || s.student_id) === String(st.studentId))
              const newSubItem = {
                studentId: st.studentId,
                studentName: st.name,
                status: 'Submitted' as const,
                remark: text,
                rating: bulkRating
              }
              if (subIdx >= 0) existingSubs[subIdx] = { ...existingSubs[subIdx], ...newSubItem }
              else existingSubs.push(newSubItem)
            })
            const submittedCount = existingSubs.filter(s => s.status === 'Submitted').length
            const totalCount = t.studentsCount || existingSubs.length || 1
            const isNowCompleted = submittedCount >= totalCount

            return {
              ...t,
              status: isNowCompleted ? 'Completed' as const : t.status,
              submissions: existingSubs,
              submittedCount
            }
          })
          try {
            localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
          } catch {}
          return updated
        })

        setActiveTask(prev => {
          if (!prev) return prev
          const existingSubs = Array.isArray(prev.submissions) ? [...prev.submissions] : []
          selectedStudents.forEach(st => {
            const subIdx = existingSubs.findIndex(s => String(s.studentId || s.student_id) === String(st.studentId))
            const newSubItem = {
              studentId: st.studentId,
              studentName: st.name,
              status: 'Submitted' as const,
              remark: text,
              rating: bulkRating
            }
            if (subIdx >= 0) existingSubs[subIdx] = { ...existingSubs[subIdx], ...newSubItem }
            else existingSubs.push(newSubItem)
          })
          const submittedCount = existingSubs.filter(s => s.status === 'Submitted').length
          const totalCount = prev.studentsCount || existingSubs.length || 1
          const isNowCompleted = submittedCount >= totalCount
          return {
            ...prev,
            status: isNowCompleted ? 'Completed' as const : prev.status,
            submissions: existingSubs,
            submittedCount
          }
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

        setTaskSubmissions(prev => {
          const next = { ...prev }
          selectedStudents.forEach(st => {
            next[st.studentId] = {
              status: 'Pending',
              remark: text,
              rating: 5,
              attachmentName: bulkFileName || undefined
            }
          })
          return next
        })

        setTasks(prevTasks => {
          const updated = prevTasks.map(t => {
            if (t.id !== activeTask.id) return t
            const existingSubs = Array.isArray(t.submissions) ? [...t.submissions] : []
            selectedStudents.forEach(st => {
              const subIdx = existingSubs.findIndex(s => String(s.studentId || s.student_id) === String(st.studentId))
              const newSubItem = {
                studentId: st.studentId,
                studentName: st.name,
                status: 'Pending' as const,
                remark: text,
                rating: 5
              }
              if (subIdx >= 0) existingSubs[subIdx] = { ...existingSubs[subIdx], ...newSubItem }
              else existingSubs.push(newSubItem)
            })
            return {
              ...t,
              submissions: existingSubs
            }
          })
          try {
            localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
          } catch {}
          return updated
        })

        showToast(`Marked ${selectedStudents.length} students as Not Complete!`, 'success')
      } else if (bulkActionMode === 'Reschedule') {
        const formattedReschedDate = bulkRescheduleDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
        const desc = bulkRescheduleDescription.trim() || 'Homework rescheduled to a new date.'

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

        setTaskSubmissions(prev => {
          const next = { ...prev }
          selectedStudents.forEach(st => {
            next[st.studentId] = {
              status: 'Rescheduled',
              remark: desc,
              rating: 5,
              rescheduledDate: formattedReschedDate
            }
          })
          return next
        })

        setTasks(prevTasks => {
          const updated = prevTasks.map(t => {
            if (t.id !== activeTask.id) return t
            const existingSubs = Array.isArray(t.submissions) ? [...t.submissions] : []
            selectedStudents.forEach(st => {
              const subIdx = existingSubs.findIndex(s => String(s.studentId || s.student_id) === String(st.studentId))
              const newSubItem = {
                studentId: st.studentId,
                studentName: st.name,
                status: 'Rescheduled' as const,
                remark: desc,
                rescheduledDate: formattedReschedDate
              }
              if (subIdx >= 0) existingSubs[subIdx] = { ...existingSubs[subIdx], ...newSubItem }
              else existingSubs.push(newSubItem)
            })
            return {
              ...t,
              submissions: existingSubs,
              rescheduledCount: existingSubs.filter(s => s.status === 'Rescheduled').length
            }
          })
          try {
            localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
          } catch {}
          return updated
        })

        setActiveTask(prev => {
          if (!prev) return prev
          const existingSubs = Array.isArray(prev.submissions) ? [...prev.submissions] : []
          selectedStudents.forEach(st => {
            const subIdx = existingSubs.findIndex(s => String(s.studentId || s.student_id) === String(st.studentId))
            const newSubItem = {
              studentId: st.studentId,
              studentName: st.name,
              status: 'Rescheduled' as const,
              remark: desc,
              rescheduledDate: formattedReschedDate
            }
            if (subIdx >= 0) existingSubs[subIdx] = { ...existingSubs[subIdx], ...newSubItem }
            else existingSubs.push(newSubItem)
          })
          return {
            ...prev,
            submissions: existingSubs,
            rescheduledCount: existingSubs.filter(s => s.status === 'Rescheduled').length
          }
        })

        // Also update school_rescheduled_remarks in localStorage
        try {
          const raw = localStorage.getItem('school_rescheduled_remarks')
          let arr: any[] = raw ? JSON.parse(raw) : []
          selectedStudents.forEach(st => {
            const existingIdx = arr.findIndex((x: any) => x.taskId === activeTask.id && x.studentId === st.studentId)
            const record = {
              id: `resched-${activeTask.id}-${st.studentId}`,
              taskId: activeTask.id,
              taskTitle: activeTask.title,
              taskDescription: activeTask.description,
              subject: activeTask.subject,
              classes: activeTask.classes,
              section: activeTask.section,
              assignDate: activeTask.assignDate,
              submissionDate: activeTask.submissionDate,
              studentId: st.studentId,
              studentName: st.name,
              admissionNo: st.admissionNo,
              rollNo: st.rollNo,
              avatar: st.avatar,
              gender: st.gender,
              rescheduledDate: formattedReschedDate,
              description: desc,
              status: 'Rescheduled',
              updatedAt: new Date().toISOString()
            }
            if (existingIdx >= 0) arr[existingIdx] = record
            else arr.push(record)
          })
          localStorage.setItem('school_rescheduled_remarks', JSON.stringify(arr))
        } catch (e) {}

        showToast(`Rescheduled ${selectedStudents.length} students to ${formattedReschedDate}! Moved to Pending Remark.`, 'success')
      }

      setSessionActionedIds(prev => Array.from(new Set([...prev, ...selectedStudents.map(s => s.studentId)])))
      setBulkModalOpen(false)
      setBulkSelectedStudentIds([])
    } catch (err: any) {
      console.error('Bulk update error:', err)
      showToast(err.message || 'Failed to apply bulk remarks', 'error')
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  // ── RENDER INDIVIDUAL STUDENT CARD ──
  const renderStudentCard = (st: StudentSubmissionItem) => {
    const isCompleted = st.status === 'Submitted'
    const isRescheduled = st.status === 'Rescheduled'
    const isSelected = bulkSelectedStudentIds.includes(st.studentId)
    const alreadyRemarked = isStudentAlreadyRemarked(st)

    return (
      <div
        key={st.studentId}
        className={`bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 shadow-xs border transition-all hover:shadow-md space-y-2.5 sm:space-y-3 w-full ${
          isSelected ? 'border-teal-500 ring-1 ring-teal-500/30' : 'border-slate-200/80 dark:border-slate-700/80'
        }`}
      >
        {/* Top Row: Checkbox, Photo, Name, Gender, Roll No, Status Badge & Already Remarked */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Checkbox for Bulk Selection */}
            <button
              type="button"
              onClick={() => toggleStudentSelect(st.studentId)}
              className="cursor-pointer text-slate-400 hover:text-teal-600 transition-colors"
              title="Select for bulk action"
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-teal-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
              )}
            </button>

            {st.avatar ? (
              <img
                src={st.avatar}
                alt={st.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-teal-500/30 p-0.5 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border-2 border-teal-500/40 text-[#0f766e] dark:text-teal-300 flex items-center justify-center font-bold text-base shrink-0">
                {st.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-white leading-tight">
                {st.name}
              </h4>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-[11px] font-bold">
                {st.gender}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
              Roll No. : {st.rollNo}
            </span>

            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {alreadyRemarked && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1 shadow-2xs">
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                  Already Remarked
                </span>
              )}

              <span className={`px-3 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 ${
                isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                  : isRescheduled
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200'
              }`}>
                {isCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : null}
                {isRescheduled ? <CalendarClock className="w-3 h-3" /> : null}
                {!isCompleted && !isRescheduled ? <X className="w-3 h-3 stroke-[2.5]" /> : null}
                {isCompleted ? 'Completed' : (isRescheduled ? 'Rescheduled' : 'Not Completed')}
              </span>
            </div>

            {isRescheduled && st.rescheduledDate && (
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 mt-0.5">
                <CalendarClock className="w-3 h-3" />
                Rescheduled: {st.rescheduledDate}
              </span>
            )}
          </div>
        </div>

        {/* Middle Row: Remark Text line */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2.5">
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 italic">
              {st.remark ? `"${st.remark}"` : 'No evaluation remark added yet.'}
            </p>
          </div>
        </div>

        {/* Bottom Row: Evaluation Action Buttons (Check, Cross, Calendar) - Remark button removed as requested */}
        <div className="flex items-center justify-end gap-2 pt-1">
          {/* Mark Completed (Green) -> Opens Complete Modal with warning if already remarked */}
          <button
            type="button"
            onClick={() => handleActionWithWarning(st, 'complete')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
            }`}
            title="Mark Completed"
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Mark Incomplete / Not Complete (Red) -> Opens Not Complete Modal */}
          <button
            type="button"
            onClick={() => handleActionWithWarning(st, 'incomplete')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              !isCompleted && !isRescheduled
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 border border-rose-200'
            }`}
            title="Mark Not Completed"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Reschedule (Orange) -> Opens Reschedule Modal */}
          <button
            type="button"
            onClick={() => handleActionWithWarning(st, 'reschedule')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isRescheduled
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 hover:bg-amber-100 border border-amber-200'
            }`}
            title="Reschedule Homework"
          >
            <CalendarClock className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 p-2 sm:p-4 md:p-6 lg:p-8 space-y-3.5 sm:space-y-5 md:space-y-6">

      {/* ── TOP UNIFIED LOCATION / DESTINATION BAR (DATE - CLASS - SECTION - TASK) ────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-3.5 sm:p-4 md:p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Dynamic Destination Breadcrumbs: Date -> Class -> Section -> Task */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold flex-wrap">
            {/* 1. Date */}
            <button
              type="button"
              onClick={() => {
                setSelectedClass('')
                setSelectedSection('')
                setSelectedSubject('')
                setActiveTask(null)
                setCurrentScreen('classes')
              }}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentScreen === 'classes'
                  ? 'text-[#0f766e] dark:text-teal-400 font-black'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#0f766e] dark:text-teal-400" />
              <span>{selectedCalendarDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </button>

            {/* 2. Class */}
            {currentScreen !== 'classes' && selectedClass && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubject('')
                    setActiveTask(null)
                    setCurrentScreen('subjects')
                  }}
                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                    currentScreen === 'subjects'
                      ? 'text-[#0f766e] dark:text-teal-400 font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{selectedClass}</span>
                </button>
              </>
            )}

            {/* 3. Section */}
            {currentScreen !== 'classes' && selectedSection && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubject('')
                    setActiveTask(null)
                    setCurrentScreen('subjects')
                  }}
                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                    currentScreen === 'subjects'
                      ? 'text-[#0f766e] dark:text-teal-400 font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{selectedSection.toLowerCase().startsWith('sec') ? selectedSection : `Section ${selectedSection}`}</span>
                </button>
              </>
            )}

            {/* 4. Task */}
            {currentScreen === 'tasks' && selectedSubject && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="flex items-center gap-1.5 font-black text-[#0f766e] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                  <FileText className="w-3.5 h-3.5 text-[#0f766e] dark:text-teal-400 shrink-0" />
                  <span>{selectedSubject} Tasks</span>
                </span>
              </>
            )}

            {currentScreen === 'evaluation' && activeTask && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="flex items-center gap-1.5 font-black text-[#0f766e] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800 max-w-[240px] sm:max-w-xs truncate">
                  <FileText className="w-3.5 h-3.5 text-[#0f766e] dark:text-teal-400 shrink-0" />
                  <span className="truncate">Task: {activeTask.title}</span>
                </span>
              </>
            )}
          </div>

          {/* Back Button on Right */}
          <div className="flex items-center gap-2 shrink-0">
            {currentScreen !== 'classes' && (
              <button
                type="button"
                onClick={() => {
                  if (currentScreen === 'evaluation') setCurrentScreen('tasks')
                  else if (currentScreen === 'tasks') setCurrentScreen('subjects')
                  else if (currentScreen === 'subjects') {
                    setSelectedClass('')
                    setSelectedSection('')
                    setCurrentScreen('classes')
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PAGE 1: REMARK HOMEWORK - SELECT CLASS (MATCHING SCREENSHOT 1)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'classes' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          
          {/* Top Curved Teal Header matching Screenshot 1 */}
          <div className="bg-[#0f766e] text-white px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
            <Link
              href="/institute/dashboard"
              className="w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs active:scale-95 transition-transform"
              title="Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex-1 text-center pr-11">
              Remark Homework
            </h1>
          </div>

          {/* 7-Day Date Slider Strip matching Screenshot 1 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-3 w-full">
            {/* Header bar above calendar strip: active date, due tasks count, Jump to Date input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/80">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0f766e] animate-pulse"></span>
                <span className="text-xs md:text-sm font-black text-slate-900 dark:text-white">
                  Due Date: {formatDisplayDate(selectedCalendarDate)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {totalTasksDueOnSelectedDate} Task{totalTasksDueOnSelectedDate !== 1 ? 's' : ''} Due
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <label htmlFor="remark-date-picker" className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 cursor-pointer">
                  <Calendar className="w-4 h-4 text-[#0f766e]" />
                  <span>Jump to Date:</span>
                </label>
                <input
                  id="remark-date-picker"
                  type="date"
                  value={selectedDateIso}
                  onChange={e => {
                    if (e.target.value) {
                      hasUserManuallySelectedDate.current = true
                      const [y, m, d] = e.target.value.split('-').map(Number)
                      const dt = new Date(y, m - 1, d)
                      setSelectedCalendarDate(dt)
                      setCalendarAnchorDate(dt)
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500 shadow-2xs cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    hasUserManuallySelectedDate.current = true
                    const today = new Date()
                    setSelectedCalendarDate(today)
                    setCalendarAnchorDate(today)
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  Today
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 w-full">
              <button
                type="button"
                onClick={() => shiftCalendar(-7)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Previous Week"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 flex-1 max-w-2xl mx-auto">
                {weekDays.map(item => (
                  <button
                    key={item.dayNum + item.dayName}
                    type="button"
                    onClick={() => {
                      hasUserManuallySelectedDate.current = true
                      setSelectedCalendarDate(item.date)
                    }}
                    className={`relative flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 rounded-2xl transition-all cursor-pointer ${
                      item.isSelected
                        ? 'bg-[#0f766e] text-white font-black shadow-md shadow-teal-900/20 scale-105'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-sm sm:text-base font-black leading-none">{item.dayNum}</span>
                    <span className={`text-[10px] sm:text-xs font-semibold mt-1 ${item.isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                      {item.dayName}
                    </span>
                    {item.hasTasks && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1 ${
                          item.isSelected ? 'bg-amber-300 ring-2 ring-teal-700/60' : 'bg-[#0f766e] dark:bg-teal-400'
                        }`}
                        title={`${item.taskCount} task(s) due for evaluation`}
                      />
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => shiftCalendar(7)}
                className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Next Week"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Submission Date Status Bar */}
            <div className="flex items-center justify-between px-2 pt-1 border-t border-slate-100 dark:border-slate-700 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0f766e]" />
                Remark Due Date: <strong className="text-slate-800 dark:text-white">{formatDisplayDate(selectedCalendarDate)}</strong>
              </span>

              {(() => {
                const tasksOnDate = tasks.filter(t => isTaskDueOnDate(t, selectedCalendarDate))
                const completedOnDate = tasksOnDate.filter(t => isTaskCompleted(t, taskSubmissions, allStudents)).length
                const pendingOnDate = tasksOnDate.length - completedOnDate

                if (tasksOnDate.length === 0) {
                  return (
                    <span className="text-[11px] text-slate-400 font-medium">
                      No task due on this date
                    </span>
                  )
                }
                if (pendingOnDate === 0 && completedOnDate > 0) {
                  return (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 stroke-[2.5]" />
                      <span>{completedOnDate} Task(s) Remarked Completed</span>
                    </span>
                  )
                }
                return (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 border border-teal-200/80">
                      {pendingOnDate} Task(s) Due
                    </span>
                    {completedOnDate > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {completedOnDate} Completed
                      </span>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Filter Dropdowns matching Screenshot 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Class
              </label>
              <div className="relative">
                <select
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs cursor-pointer"
                >
                  <option value="All">All Classes</option>
                  {uniqueClassNames.map(cn => (
                    <option key={cn} value={cn}>{cn}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Section
              </label>
              <div className="relative">
                <select
                  value={filterSection}
                  onChange={e => setFilterSection(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs cursor-pointer"
                >
                  <option value="All">All Sections</option>
                  {uniqueSectionNames.map(sn => (
                    <option key={sn} value={sn}>Section {sn}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Section Heading matching Screenshot 1 */}
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
              Classes
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {filteredClassCards.length} Classes Available
            </span>
          </div>

          {/* Real Class Cards List matching Screenshot 1 */}
          <div className="space-y-4 w-full">
            {filteredClassCards.map(cls => (
              <div
                key={cls.id}
                className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-3 sm:gap-4 transition-all hover:shadow-md w-full"
              >
                {/* Top Row: Class Name & Enrolled Student Count */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight">
                          {cls.className} - Section {cls.section}
                        </h3>
                        {cls.tasksCount > 0 ? (
                          (cls.isCompleted || cls.dueRemarks === 0) ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 stroke-[2.5]" />
                              <span>Remarked Completed</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 border border-teal-200">
                              {cls.dueRemarks} Remark{cls.dueRemarks > 1 ? 's' : ''} Due
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-400">
                            No Task Due
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Class Teacher: <span className="text-slate-600 dark:text-slate-300 font-bold">{cls.classTeacher}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 flex items-center gap-1.5 shrink-0">
                    <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[11px] md:text-xs font-black text-blue-700 dark:text-blue-300">
                      {cls.studentsCount} Students
                    </span>
                  </span>
                </div>

                {/* Middle Row: Total Subject / Total Task / Due Remarks Pills */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 pt-1">
                  <div className="px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 text-center flex items-center justify-center gap-1 sm:gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                    <span className="text-[10px] sm:text-xs font-black text-sky-800 dark:text-sky-200 truncate">
                      Total Subject: {cls.totalSubjects}
                    </span>
                  </div>
                  <div className="px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/60 text-center flex items-center justify-center gap-1 sm:gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                    <span className="text-[10px] sm:text-xs font-black text-purple-800 dark:text-purple-200 truncate">
                      Total Task: {cls.tasksCount}
                    </span>
                  </div>
                  <div className={`px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-center flex items-center justify-center gap-1 sm:gap-1.5 ${
                    (cls.isCompleted || (cls.tasksCount > 0 && cls.dueRemarks === 0))
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-800/60'
                  }`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      (cls.isCompleted || (cls.tasksCount > 0 && cls.dueRemarks === 0)) ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                    <span className={`text-[10px] sm:text-xs font-black truncate ${
                      (cls.isCompleted || (cls.tasksCount > 0 && cls.dueRemarks === 0))
                        ? 'text-emerald-800 dark:text-emerald-200'
                        : 'text-amber-800 dark:text-amber-200'
                    }`}>
                      {(cls.isCompleted || (cls.tasksCount > 0 && cls.dueRemarks === 0))
                        ? 'Remarked: Completed'
                        : `Due Remarks: ${cls.dueRemarks}`}
                    </span>
                  </div>
                </div>

                {/* Bottom Row Action Button: "Remark Homework" / "Review Remark" */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClass(cls.className)
                      setSelectedSection(cls.section)
                      setSelectedTeacherName(cls.classTeacher)
                      setCurrentScreen('subjects')
                    }}
                    className={`px-6 py-2.5 rounded-2xl text-white text-xs md:text-sm font-bold shadow-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer ${
                      (cls.isCompleted || (cls.tasksCount > 0 && cls.dueRemarks === 0))
                        ? 'bg-emerald-700 hover:bg-emerald-800'
                        : 'bg-[#0f766e] hover:bg-[#0d655f]'
                    }`}
                  >
                    {(cls.isCompleted || (cls.tasksCount > 0 && cls.dueRemarks === 0)) ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Remark Completed</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        <span>Remark Homework</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          PAGE 2: SELECT SUBJECT (MATCHING SCREENSHOT 2)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'subjects' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          
          {/* Top Curved Teal Header matching Screenshot 2 */}
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
              Select Subject
            </h1>
          </div>

          {/* Class Banner Card matching Screenshot 2 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between flex-wrap gap-3 w-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center shadow-sm shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {selectedClass}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs md:text-sm text-slate-400 font-semibold">
                    {subjectCards.length} Subjects Assigned
                  </span>
                  {(() => {
                    const classTasksOnDate = tasks.filter(t => 
                      matchesClassAndSection({ class: t.classes, section: t.section }, selectedClass, selectedSection) &&
                      isTaskDueOnDate(t, selectedCalendarDate)
                    )
                    const isAllDone = classTasksOnDate.length > 0 && classTasksOnDate.every(t => isTaskCompleted(t, taskSubmissions, allStudents))
                    if (isAllDone) {
                      return (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                          <CheckCircle className="w-3 h-3 stroke-[2.5]" />
                          <span>Remarked Completed</span>
                        </span>
                      )
                    }
                    return null
                  })()}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-700/80 px-2 py-0.5 rounded-xl border border-teal-200/80 dark:border-teal-800 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarDate(prev => new Date(prev.getTime() - 86400000))}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 cursor-pointer"
                      title="Previous Day"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-1 cursor-pointer relative px-1">
                      <Calendar className="w-3 h-3 text-teal-600" />
                      <span className="text-xs font-black text-teal-800 dark:text-teal-200">
                        Due: {formatDisplayDate(selectedCalendarDate)}
                      </span>
                      <input
                        type="date"
                        value={toDateIso(selectedCalendarDate)}
                        onChange={e => {
                          if (e.target.value) setSelectedCalendarDate(parseIsoToLocalDate(e.target.value))
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Click to pick date"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarDate(prev => new Date(prev.getTime() + 86400000))}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 cursor-pointer"
                      title="Next Day"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarDate(new Date())}
                      className="px-1.5 py-0.5 rounded text-[10px] font-black bg-teal-100 hover:bg-teal-200 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 cursor-pointer"
                      title="Jump to Today"
                    >
                      Today
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <span className="px-4 py-1.5 rounded-xl bg-[#0f766e] text-white font-bold text-xs shadow-xs">
              Section {selectedSection}
            </span>
          </div>

          {/* Section Heading & Filter switcher */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
              Subjects ({displayedSubjectCards.length})
            </h3>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                type="button"
                onClick={() => setSubjectDateFilter('selected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  subjectDateFilter === 'selected'
                    ? 'bg-[#0f766e] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Due on Date
              </button>
              <button
                type="button"
                onClick={() => setSubjectDateFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  subjectDateFilter === 'all'
                    ? 'bg-[#0f766e] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                All Subjects ({subjectCards.length})
              </button>
            </div>
          </div>

          {/* Pastel Subject Cards matching Screenshot 2 */}
          {displayedSubjectCards.length === 0 ? (
            <div className="py-12 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2 w-full">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {subjectDateFilter === 'selected'
                  ? `No subjects have tasks due on ${formatDisplayDate(selectedCalendarDate)}.`
                  : 'No subjects assigned.'}
              </p>
              {subjectDateFilter === 'selected' && subjectCards.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSubjectDateFilter('all')}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0f766e] text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95 transition-transform"
                >
                  <span>View All {subjectCards.length} Subjects</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5 w-full">
              {displayedSubjectCards.map(sub => {
                const selectedIso = toDateIso(selectedCalendarDate)
                const subjectTasksOnDate = tasks.filter(t => 
                  matchesClassAndSection({ class: t.classes, section: t.section }, selectedClass, selectedSection) &&
                  t.subject.toLowerCase().trim() === sub.subjectName.toLowerCase().trim() &&
                  isTaskDueOnDate(t, selectedCalendarDate)
                )

                const completedTasksCount = subjectTasksOnDate.filter(t => isTaskCompleted(t, taskSubmissions, allStudents)).length
                const pendingTasksCount = subjectTasksOnDate.length - completedTasksCount

                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubject(sub.subjectName)
                      setSelectedTeacherName(sub.teacherName)
                      setCurrentScreen('tasks')
                    }}
                    className={`${sub.bgColor} dark:bg-slate-800/90 rounded-2xl md:rounded-3xl p-4 md:p-5 border ${sub.borderColor} flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] w-full`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm md:text-base font-black ${sub.textColor} dark:text-white leading-tight`}>
                          Subject : {sub.subjectName}
                        </h4>

                        {/* Status Pills: Remarked Completed vs Tasks Due */}
                        {subjectTasksOnDate.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {pendingTasksCount === 0 && completedTasksCount > 0 ? (
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                                <CheckCircle className="w-3 h-3 stroke-[2.5]" />
                                <span>Remarked Completed</span>
                              </span>
                            ) : null}

                            {pendingTasksCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-lg bg-[#0f766e] text-white text-[10px] font-bold">
                                {pendingTasksCount} Task{pendingTasksCount > 1 ? 's' : ''} Due
                              </span>
                            ) : null}

                            {pendingTasksCount > 0 && completedTasksCount > 0 ? (
                              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                                <CheckCircle className="w-3 h-3 stroke-[2.5]" />
                                <span>{completedTasksCount} Remarked</span>
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${sub.badgeColor} dark:bg-slate-700 dark:text-slate-200 shadow-2xs`}>
                        Teacher : {sub.teacherName}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-xs flex items-center justify-center text-slate-400 hover:text-slate-700 shrink-0">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          PAGE 3: SELECT TASK TO REMARK (MATCHING SCREENSHOT 3)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'tasks' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          
          {/* Top Curved Teal Header matching Screenshot 3 */}
          <div className="bg-[#0f766e] text-white px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setCurrentScreen('subjects')}
              className="w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer"
              title="Back to Subjects"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex-1 text-center pr-11">
              Select Task to Remark
            </h1>
          </div>

          {/* Subject Banner Card matching Screenshot 3 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between w-full">
            <div className="flex items-center gap-3 sm:gap-4 w-full">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#0f766e] text-white flex items-center justify-center shadow-sm shrink-0">
                <FileText className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight truncate">
                  {selectedSubject}
                </h2>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold">
                    {selectedClass} - Sec {selectedSection}
                  </span>
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-white dark:bg-slate-700/80 px-1.5 sm:px-2 py-0.5 rounded-lg sm:rounded-xl border border-teal-200/80 dark:border-teal-800 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarDate(prev => new Date(prev.getTime() - 86400000))}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 cursor-pointer"
                      title="Previous Day"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-1 cursor-pointer relative px-1">
                      <Calendar className="w-3 h-3 text-teal-600" />
                      <span className="text-[11px] font-black text-teal-800 dark:text-teal-200">
                        Due Date: {formatDisplayDate(selectedCalendarDate)}
                      </span>
                      <input
                        type="date"
                        value={toDateIso(selectedCalendarDate)}
                        onChange={e => {
                          if (e.target.value) setSelectedCalendarDate(parseIsoToLocalDate(e.target.value))
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Click to pick date"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarDate(prev => new Date(prev.getTime() + 86400000))}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 cursor-pointer"
                      title="Next Day"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarDate(new Date())}
                      className="px-1.5 py-0.5 rounded text-[10px] font-black bg-teal-100 hover:bg-teal-200 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 cursor-pointer"
                      title="Jump to Today"
                    >
                      Today
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Heading (All Dates tab selection removed - strictly selected date tasks) */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
              Assigned Tasks ({displayedSubjectTasks.length})
            </h3>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Due Date: {formatDisplayDate(selectedCalendarDate)}
            </span>
          </div>

          {/* Tasks List matching Screenshot 3 */}
          {displayedSubjectTasks.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 w-full">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No homework tasks due on {formatDisplayDate(selectedCalendarDate)}.
              </p>
              <Link
                href="/institute/homework/assign"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0f766e] text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Assign New Homework</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {displayedSubjectTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-3 sm:space-y-4 w-full transition-all hover:shadow-md"
                >
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between">
                    {(() => {
                      const isCompleted = isTaskCompleted(task, taskSubmissions, allStudents)
                      return (
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {isCompleted ? 'Completed' : 'Active'}
                        </span>
                      )
                    })()}

                    {task.hasAttachment && (
                      <span className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/80 text-[11px] font-bold flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5" />
                        Attachment
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Faculty Assigned By */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Assigned by: <strong className="text-slate-700 dark:text-slate-300">{task.assignedBy}</strong></span>
                  </div>

                  {/* Dates Row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs space-y-1.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Assign: <strong className="text-slate-700 dark:text-slate-300">{task.assignDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>Submission: <strong className="text-orange-700 dark:text-orange-300">{task.submissionDate}</strong></span>
                      </div>
                    </div>
                    {normalizeDateStr(task.submissionDate) !== toDateIso(selectedCalendarDate) && (
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
                        <CalendarClock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Due on Date: Rescheduled to {formatDisplayDate(selectedCalendarDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Row Action Buttons: Reschedule, Delete, and Remark Students */}
                  <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                    <span className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      {task.studentsCount ?? 1} Students
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
                          setStudentSearch('')
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
          PAGE 4: REMARK HOMEWORK EVALUATION (MATCHING SCREENSHOT 4)
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

          {/* Task Summary Header Card matching Screenshot 4 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 sm:space-y-3 w-full">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center shadow-sm shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {activeTask.classes}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    Subject: {activeTask.subject}
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-xl bg-[#0f766e] text-white font-bold text-xs shadow-xs">
                Section {activeTask.section}
              </span>
            </div>

            {/* Sub-strip with Task Title and Due Date matching Screenshot 4 */}
            <div className="bg-teal-50/70 dark:bg-teal-950/30 rounded-xl px-4 py-2.5 border border-teal-100 dark:border-teal-900/40 flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-[#0f766e] dark:text-teal-300 flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">{activeTask.title}</span>
                {isTaskCompleted(activeTask, taskSubmissions, allStudents) && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black shrink-0 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 stroke-[2.5]" />
                    <span>Completed</span>
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-orange-600 dark:text-orange-400 font-bold">
                  Due: {activeTask.submissionDate}
                </span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <div className="flex items-center gap-1 cursor-pointer relative">
                    <Calendar className="w-3 h-3 text-teal-600" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      View Date: {formatDisplayDate(selectedCalendarDate)}
                    </span>
                    <input
                      type="date"
                      value={toDateIso(selectedCalendarDate)}
                      onChange={e => {
                        if (e.target.value) setSelectedCalendarDate(parseIsoToLocalDate(e.target.value))
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Change filter date"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar & Filter Dropdown matching Screenshot 4 & 5 (image_8 and image_9) */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search By Name, Roll No."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl text-xs md:text-sm font-semibold outline-none focus:border-teal-500 shadow-2xs"
              />
            </div>

            {/* Filter Button with Dropdown Popup matching image_9 */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setFilterDropdownOpen(prev => !prev)}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                  statusFilter !== 'All'
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:text-slate-900 shadow-2xs'
                }`}
                title="Filter Students"
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700 dark:text-teal-300" />
              </button>

              {filterDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setFilterDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => { setStatusFilter('All'); setFilterDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-bold flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer ${
                        statusFilter === 'All' ? 'text-teal-800 dark:text-teal-200 bg-teal-50/50 dark:bg-teal-950/40' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0"></span>
                      <span>All ({assignedStudentsForActiveTask.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setStatusFilter('Completed'); setFilterDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-bold flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer ${
                        statusFilter === 'Completed' ? 'text-emerald-800 dark:text-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/40' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Completed ({completedStudents.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setStatusFilter('Not Completed'); setFilterDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-bold flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer ${
                        statusFilter === 'Not Completed' ? 'text-rose-800 dark:text-rose-200 bg-rose-50/50 dark:bg-rose-950/40' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                      <span>Not Completed ({notCompletedStudents.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setStatusFilter('Rescheduled'); setFilterDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-bold flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer ${
                        statusFilter === 'Rescheduled' ? 'text-amber-800 dark:text-amber-200 bg-amber-50/50 dark:bg-amber-950/40' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                      <span>Rescheduled ({rescheduledStudents.length})</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Subheading Row matching image_8: Students (count) & Bulk Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                Students ({filteredAssignedStudents.length})
              </h3>

              {statusFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  <span>Filtered: {statusFilter}</span>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('All')}
                    className="p-0.5 hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filteredAssignedStudents.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors cursor-pointer"
                >
                  {bulkSelectedStudentIds.length === filteredAssignedStudents.length ? (
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
              className="px-3.5 sm:px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-teal-600/40 text-[#0f766e] dark:text-teal-300 hover:bg-teal-50 text-xs font-black shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Bulk Action {bulkSelectedStudentIds.length > 0 ? `(${bulkSelectedStudentIds.length})` : ''}</span>
            </button>
          </div>

          {/* Single Unified List of Student Cards matching image_8 */}
          {filteredAssignedStudents.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2 w-full">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No assigned students found matching your criteria.
              </p>
              <p className="text-xs text-slate-400">
                Try switching the filter back to All or clearing your search.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 w-full pb-8">
              {filteredAssignedStudents.map(st => renderStudentCard(st))}
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
              <div>
                <h3 className="text-xl font-bold text-[#0f766e] dark:text-teal-400">
                  Complete
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {completeModalStudent.name} (Roll: {completeModalStudent.rollNo})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompleteModalStudent(null)}
                className="w-7 h-7 rounded-full border border-slate-400 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning if already remarked */}
            {isStudentAlreadyRemarked(completeModalStudent) && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Notice: Already Remarked</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    This student's homework was already evaluated. Submitting this form will overwrite the existing remark.
                  </p>
                </div>
              </div>
            )}

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
              <div>
                <h3 className="text-xl font-bold text-[#0f766e] dark:text-teal-400">
                  Not Complete
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {notCompleteModalStudent.name} (Roll: {notCompleteModalStudent.rollNo})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotCompleteModalStudent(null)}
                className="w-7 h-7 rounded-full border border-slate-400 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning if already remarked */}
            {isStudentAlreadyRemarked(notCompleteModalStudent) && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Notice: Already Remarked</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    This student's homework was already evaluated. Submitting this form will update the existing remark.
                  </p>
                </div>
              </div>
            )}

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
              <div>
                <h3 className="text-xl font-bold text-[#0f766e] dark:text-teal-400">
                  Reschedule
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {rescheduleModalStudent.name} (Roll: {rescheduleModalStudent.rollNo})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleModalStudent(null)}
                className="w-7 h-7 rounded-full border border-slate-400 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning if already remarked */}
            {isStudentAlreadyRemarked(rescheduleModalStudent) && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Notice: Already Remarked</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    This student's homework was already evaluated. Rescheduling will move them to pending remark on the new date.
                  </p>
                </div>
              </div>
            )}

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
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
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

            {/* Student Selection with Select All checkbox matching user request */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Students ({bulkSelectedStudentIds.length}/{assignedStudentsForActiveTask.length})
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (bulkSelectedStudentIds.length === assignedStudentsForActiveTask.length) {
                      setBulkSelectedStudentIds([])
                    } else {
                      setBulkSelectedStudentIds(assignedStudentsForActiveTask.map(s => s.studentId))
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#0f766e] dark:text-teal-400 hover:underline cursor-pointer"
                >
                  {bulkSelectedStudentIds.length === assignedStudentsForActiveTask.length && assignedStudentsForActiveTask.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{bulkSelectedStudentIds.length === assignedStudentsForActiveTask.length ? 'Deselect All' : 'Select All'}</span>
                </button>
              </div>

              {/* Scrollable list of students */}
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-2 bg-slate-50/50 dark:bg-slate-800/50">
                {assignedStudentsForActiveTask.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">No students found.</p>
                ) : (
                  assignedStudentsForActiveTask.map(st => {
                    const isSelected = bulkSelectedStudentIds.includes(st.studentId)
                    return (
                      <div
                        key={st.studentId}
                        onClick={() => toggleStudentSelect(st.studentId)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700'
                            : 'bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation()
                              toggleStudentSelect(st.studentId)
                            }}
                            className="text-slate-400 hover:text-teal-600 cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-teal-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                            )}
                          </button>

                          {st.avatar ? (
                            <img
                              src={st.avatar}
                              alt={st.name}
                              className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-teal-100 text-[#0f766e] font-bold text-xs flex items-center justify-center shrink-0">
                              {st.name.charAt(0)}
                            </div>
                          )}

                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {st.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Roll No. : {st.rollNo}
                            </p>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          st.status === 'Submitted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : st.status === 'Rescheduled'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {st.status === 'Submitted' ? 'Completed' : (st.status === 'Rescheduled' ? 'Rescheduled' : 'Not Complete')}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Warning if any selected student is already remarked */}
            {bulkSelectedStudentIds.some(id => {
              const st = assignedStudentsForActiveTask.find(s => s.studentId === id)
              return st && isStudentAlreadyRemarked(st)
            }) && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Warning: Contains Already Remarked Students</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    One or more selected students already have evaluation remarks on record. Applying this bulk action will overwrite their existing remarks.
                  </p>
                </div>
              </div>
            )}

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
                    Reschedule Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={bulkRescheduleDate}
                      onChange={e => setBulkRescheduleDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-teal-600 pr-10 shadow-2xs cursor-pointer"
                      placeholder="DD-MM-YYYY"
                    />
                    <Calendar className="w-5 h-5 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
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

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL 5: ALREADY REMARKED WARNING CONFIRMATION MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {alreadyRemarkWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    Already Remarked Warning
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                    Student has already received a remark
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAlreadyRemarkWarning(null)}
                className="w-7 h-7 rounded-full border border-slate-300 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Student:</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {alreadyRemarkWarning.student.name} (Roll: {alreadyRemarkWarning.student.rollNo})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Current Status:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  alreadyRemarkWarning.student.status === 'Submitted'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : alreadyRemarkWarning.student.status === 'Rescheduled'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {alreadyRemarkWarning.student.status === 'Submitted' ? 'Completed' : alreadyRemarkWarning.student.status}
                </span>
              </div>
              {alreadyRemarkWarning.student.remark && (
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Existing Remark:</span>
                  <p className="text-slate-600 dark:text-slate-300 italic bg-white/70 dark:bg-slate-800/70 p-2 rounded-xl border border-amber-100 dark:border-amber-900/40">
                    "{alreadyRemarkWarning.student.remark}"
                  </p>
                </div>
              )}
              {alreadyRemarkWarning.student.status === 'Rescheduled' && alreadyRemarkWarning.student.rescheduledDate && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Rescheduled For:</span>
                  <span className="font-bold text-purple-700 dark:text-purple-300">{alreadyRemarkWarning.student.rescheduledDate}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              An action has already been taken on this student's homework. Are you sure you want to overwrite or modify the existing remark?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAlreadyRemarkWarning(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const warningData = alreadyRemarkWarning
                  setAlreadyRemarkWarning(null)
                  executeStudentAction(warningData.student, warningData.actionType, warningData.starRating)
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Yes, Modify Remark</span>
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

            <div className="space-y-3.5 py-1">
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5 text-xs sm:text-sm">
                  Reschedule Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 cursor-pointer text-xs sm:text-sm shadow-2xs pr-10"
                  />
                  <Calendar className="w-4 h-4 text-amber-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Select the new due date for this homework task.
                </p>
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

'use client'

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import {
  ArrowLeft, ChevronLeft, ChevronRight, GraduationCap, Users, User,
  BookOpen, FileText, Paperclip, Calendar, Clock, Check, Plus,
  Search, Upload, X, Loader2, Sparkles, Send, Signal, Wifi,
  Battery, AlertCircle, CheckCircle2, ChevronDown, Download,
  Trash2, Eye, RefreshCw, Filter, Layers, CheckSquare, Square, Star,
  Award, MessageSquare, XCircle, CalendarClock, AlertTriangle
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
  status: 'Active' | 'Closed'
  studentsCount?: number
  assignedStudentIds?: string[]
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

  // 3. Fallback: text comparison (e.g. "06 Nov 2026")
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
            map[sid] = {
              status: row.status === 'Submitted' ? 'Submitted' : (row.status === 'Rescheduled' ? 'Rescheduled' : 'Pending'),
              remark: row.remark || '',
              rating: r,
              rescheduledDate: row.rescheduledDate || undefined,
              attachmentName: row.attachmentName || undefined,
              submittedAt: row.submittedAt || undefined
            }
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
          const studentCount = matchedCount > 0 ? matchedCount : masterCount

          // All tasks for this class & section
          const allClassTasks = tasks.filter(t => matchesClassAndSection({ class: t.classes, section: t.section }, cName, sec))

          // Filter tasks due on selected submission date (strictly matching selected calendar date)
          const classTasksOnDate = allClassTasks.filter(t => isTaskDueOnDate(t, selectedCalendarDate))
          
          // Calculate completed submissions vs pending for tasks due on this date
          let completed = 0
          if (classTasksOnDate.length > 0) {
            classTasksOnDate.forEach(t => {
              try {
                const raw = localStorage.getItem(`school_task_subs_${t.id}`)
                if (raw) {
                  const parsed = JSON.parse(raw)
                  if (Array.isArray(parsed)) {
                    completed += parsed.filter((s: any) => s.status === 'Submitted' || s.status === 'Completed').length
                  }
                }
              } catch (e) {}
            })
          }

          const pending = classTasksOnDate.length > 0 ? Math.max(0, studentCount - completed) : 0

          // Calculate unique subjects for this class that have tasks due on selected date
          const subjectsOnDate = new Set(
            classTasksOnDate
              .map(t => t.subject?.toLowerCase().trim())
              .filter(Boolean)
          )
          const totalSubjects = subjectsOnDate.size

          // Calculate dueRemarks: pending remarks strictly for tasks due on this date
          let dueRemarks = 0
          classTasksOnDate.forEach(t => {
            try {
              const raw = localStorage.getItem(`school_task_subs_${t.id}`)
              if (raw) {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const submittedCount = parsed.filter((s: any) => s.status === 'Submitted').length
                  dueRemarks += Math.max(0, parsed.length - submittedCount)
                  return
                }
              }
            } catch (e) {}

            const assignedCount = Array.isArray(t.assignedStudentIds) && t.assignedStudentIds.length > 0
              ? t.assignedStudentIds.length
              : studentCount
            dueRemarks += assignedCount
          })

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
            allTasksCount: allClassTasks.length,
            totalSubjects,
            dueRemarks
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
        if (classTasksOnDate.length > 0) {
          classTasksOnDate.forEach(t => {
            try {
              const raw = localStorage.getItem(`school_task_subs_${t.id}`)
              if (raw) {
                const parsed = JSON.parse(raw)
                if (Array.isArray(parsed)) {
                  completed += parsed.filter((s: any) => s.status === 'Submitted' || s.status === 'Completed').length
                }
              }
            } catch (e) {}
          })
        }

        const pending = classTasksOnDate.length > 0 ? Math.max(0, item.count - completed) : 0

        // Calculate unique subjects for this class that have tasks due on selected date
        const subjectsOnDate = new Set(
          classTasksOnDate
            .map(t => t.subject?.toLowerCase().trim())
            .filter(Boolean)
        )
        const totalSubjects = subjectsOnDate.size

        let dueRemarks = 0
        classTasksOnDate.forEach(t => {
          try {
            const raw = localStorage.getItem(`school_task_subs_${t.id}`)
            if (raw) {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed) && parsed.length > 0) {
                const submittedCount = parsed.filter((s: any) => s.status === 'Submitted').length
                dueRemarks += Math.max(0, parsed.length - submittedCount)
                return
              }
            }
          } catch (e) {}

          const assignedCount = Array.isArray(t.assignedStudentIds) && t.assignedStudentIds.length > 0
            ? t.assignedStudentIds.length
            : item.count
          dueRemarks += assignedCount
        })

        list.push({
          id: `${item.className}-${item.section}`,
          className: item.className,
          section: item.section,
          classTeacher: resolveClassTeacher(item.className, null, allTeachers, tasks),
          studentsCount: item.count,
          completedCount: completed,
          pendingCount: pending,
          tasksCount: classTasksOnDate.length,
          allTasksCount: allClassTasks.length,
          totalSubjects,
          dueRemarks
        })
      })
    }

    // Sort classes: classes with tasks due on selectedCalendarDate appear first
    list.sort((a, b) => b.tasksCount - a.tasksCount)

    return list
  }, [classesData, subjectsData, allStudents, allTeachers, tasks, selectedCalendarDate])

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
    return assignedStudentsForActiveTask.filter(st => {
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
  }, [assignedStudentsForActiveTask, statusFilter, studentSearch])

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
      setRescheduleDescription(st.remark || 'Excellent work, all questions answered with clear steps.')
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

      setTaskSubmissions(prev => ({
        ...prev,
        [stId]: {
          status: 'Rescheduled',
          remark: desc,
          rating: 5,
          rescheduledDate: formattedReschedDate
        }
      }))

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
        className={`bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs border transition-all hover:shadow-md space-y-3 w-full ${
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
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center font-bold text-base shrink-0">
                {st.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-white leading-tight">
                {st.name}
              </h4>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
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
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                  : isRescheduled
                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200'
              }`}>
                {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                {isCompleted ? 'Completed' : (isRescheduled ? 'Rescheduled' : 'Pending')}
              </span>
            </div>

            {isRescheduled && st.rescheduledDate && (
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1 mt-0.5">
                <CalendarClock className="w-3 h-3" />
                Rescheduled: {st.rescheduledDate}
              </span>
            )}
          </div>
        </div>

        {/* Middle Row: Remark Text line (Stars removed as requested) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2.5">
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 italic">
              {st.remark ? `"${st.remark}"` : 'No evaluation remark added yet.'}
            </p>
          </div>
        </div>

        {/* Bottom Row: Evaluation Action Buttons (Check, Cross, Calendar, Remark) */}
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

          {/* Mark Incomplete / Pending (Red) -> Opens Not Complete Modal */}
          <button
            type="button"
            onClick={() => handleActionWithWarning(st, 'incomplete')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              !isCompleted && !isRescheduled
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 border border-rose-200'
            }`}
            title="Mark Incomplete / Pending"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Reschedule (Orange) -> Opens Reschedule Modal */}
          <button
            type="button"
            onClick={() => handleActionWithWarning(st, 'reschedule')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isRescheduled
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 hover:bg-orange-100 border border-orange-200'
            }`}
            title="Reschedule Homework"
          >
            <CalendarClock className="w-4 h-4" />
          </button>

          {/* Remark (Teal) -> Opens Remark Modal */}
          <button
            type="button"
            onClick={() => handleActionWithWarning(st, 'remark')}
            className="px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-[#0f766e] dark:text-teal-300 border border-teal-200 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Remark</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 p-3 sm:p-5 md:p-8 space-y-6">

      {/* ═══════════════════════════════════════════════════════════════════
          PAGE 1: REMARK HOMEWORK - SELECT CLASS (MATCHING SCREENSHOT 1)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentScreen === 'classes' && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-200">
          
          {/* Top Curved Teal Header matching Screenshot 1 */}
          <div className="bg-[#0f766e] text-white px-6 md:px-8 py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
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

              {tasks.some(t => normalizeDateStr(t.submissionDate) === toDateIso(selectedCalendarDate)) ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 border border-teal-200/80">
                  {tasks.filter(t => normalizeDateStr(t.submissionDate) === toDateIso(selectedCalendarDate)).length} Task(s) Due
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  No task due on this date
                </span>
              )}
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
                className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-4 transition-all hover:shadow-md w-full"
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
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 border border-teal-200">
                            {cls.tasksCount} Task{cls.tasksCount > 1 ? 's' : ''} Due
                          </span>
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
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 text-center flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                    <span className="text-xs font-black text-sky-800 dark:text-sky-200 truncate">
                      Total Subject: {cls.totalSubjects}
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/60 text-center flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                    <span className="text-xs font-black text-purple-800 dark:text-purple-200 truncate">
                      Total Task: {cls.tasksCount}
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/60 text-center flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span className="text-xs font-black text-amber-800 dark:text-amber-200 truncate">
                      Due Remarks: {cls.dueRemarks}
                    </span>
                  </div>
                </div>

                {/* Bottom Row Action Button: "Remark Homework" */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClass(cls.className)
                      setSelectedSection(cls.section)
                      setSelectedTeacherName(cls.classTeacher)
                      setCurrentScreen('subjects')
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs md:text-sm font-bold shadow-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Remark Homework</span>
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

          {/* Class Banner Card matching Screenshot 2 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between w-full">
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
                const tasksDueCount = tasks.filter(t => 
                  matchesClassAndSection({ class: t.classes, section: t.section }, selectedClass, selectedSection) &&
                  t.subject.toLowerCase().trim() === sub.subjectName.toLowerCase().trim() &&
                  isTaskDueOnDate(t, selectedCalendarDate)
                ).length

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
                        {tasksDueCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-lg bg-[#0f766e] text-white text-[10px] font-bold">
                            {tasksDueCount} Task{tasksDueCount > 1 ? 's' : ''} Due
                          </span>
                        ) : null}
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
              Select Task to Remark
            </h1>
          </div>

          {/* Subject Banner Card matching Screenshot 3 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center shadow-sm shrink-0">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {selectedSubject}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold">
                    {selectedClass} - Sec {selectedSection}
                  </span>
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
                  className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-4 w-full transition-all hover:shadow-md"
                >
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                      task.status === 'Active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {task.status}
                    </span>

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
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Assign: <strong className="text-slate-700 dark:text-slate-300">{task.assignDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>Submission: <strong className="text-orange-700 dark:text-orange-300">{task.submissionDate}</strong></span>
                    </div>
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
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer shadow-2xs active:scale-95"
                        title="Reschedule this task"
                      >
                        <CalendarClock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={e => handleDeleteTask(task.id, e)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer shadow-2xs active:scale-95"
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
                        className="px-5 py-2.5 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs md:text-sm font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
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

          {/* Task Summary Header Card matching Screenshot 4 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-3 w-full">
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

          {/* Search Bar & Filter Options matching Screenshot 4 */}
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search By Name, Roll No..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-semibold outline-none focus:border-teal-500 shadow-2xs"
              />
            </div>

            {/* Filter Pills: All / Not Completed / Completed / Rescheduled */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  statusFilter === 'All' ? 'bg-[#0f766e] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                All ({assignedStudentsForActiveTask.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Not Completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  statusFilter === 'Not Completed' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                Not Completed ({notCompletedStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  statusFilter === 'Completed' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                Completed ({completedStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Rescheduled')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  statusFilter === 'Rescheduled' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                Rescheduled ({rescheduledStudents.length})
              </button>
            </div>
          </div>

          {/* Section Header: Students Count, Select All & "Bulk Action" button matching Screenshot 4 */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                Students ({filteredAssignedStudents.length})
              </h3>
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
              className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-teal-600/40 text-[#0f766e] dark:text-teal-300 hover:bg-teal-50 text-xs font-black shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Bulk Action {bulkSelectedStudentIds.length > 0 ? `(${bulkSelectedStudentIds.length})` : ''}</span>
            </button>
          </div>

          {/* Student Remark Cards categorized with small headlines before each category */}
          {filteredAssignedStudents.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2 w-full">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No assigned students found matching your criteria.
              </p>
              <p className="text-xs text-slate-400">
                Only students assigned to this homework task are shown here.
              </p>
            </div>
          ) : (
            <div className="space-y-6 w-full pb-8">
              {/* Category 1: Not Completed */}
              {(statusFilter === 'All' || statusFilter === 'Not Completed') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pt-1 pb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                    <h4 className="text-xs md:text-sm font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <span>Not Completed</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                        {notCompletedStudents.length}
                      </span>
                    </h4>
                    <div className="h-px bg-amber-200/60 dark:bg-amber-800/40 flex-1"></div>
                  </div>

                  {notCompletedStudents.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-dashed border-amber-200/80 dark:border-amber-800/40 text-center text-xs text-amber-700/80 dark:text-amber-300/80 font-medium">
                      No students pending evaluation in Not Completed.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notCompletedStudents.map(st => renderStudentCard(st))}
                    </div>
                  )}
                </div>
              )}

              {/* Category 2: Completed */}
              {(statusFilter === 'All' || statusFilter === 'Completed') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pt-2 pb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <h4 className="text-xs md:text-sm font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                      <span>Completed</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                        {completedStudents.length}
                      </span>
                    </h4>
                    <div className="h-px bg-emerald-200/60 dark:bg-emerald-800/40 flex-1"></div>
                  </div>

                  {completedStudents.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-dashed border-emerald-200/80 dark:border-emerald-800/40 text-center text-xs text-emerald-700/80 dark:text-emerald-300/80 font-medium">
                      No students marked as Completed yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {completedStudents.map(st => renderStudentCard(st))}
                    </div>
                  )}
                </div>
              )}

              {/* Category 3: Rescheduled */}
              {(statusFilter === 'All' || statusFilter === 'Rescheduled') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pt-2 pb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                    <h4 className="text-xs md:text-sm font-black text-purple-800 dark:text-purple-300 uppercase tracking-wider flex items-center gap-2">
                      <span>Rescheduled</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold">
                        {rescheduledStudents.length}
                      </span>
                    </h4>
                    <div className="h-px bg-purple-200/60 dark:bg-purple-800/40 flex-1"></div>
                  </div>

                  {rescheduledStudents.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-dashed border-purple-200/80 dark:border-purple-800/40 text-center text-xs text-purple-700/80 dark:text-purple-300/80 font-medium">
                      No students rescheduled for this task.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rescheduledStudents.map(st => renderStudentCard(st))}
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

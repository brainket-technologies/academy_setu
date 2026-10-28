'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  ChevronLeft, ChevronRight, Users, GraduationCap, 
  Calendar, FileText, Paperclip, Plus, Search, Check, 
  X, ArrowLeft, Clock, CheckCircle2, User, BookOpen, AlertCircle,
  Filter, Sparkles, Download, Eye, ChevronDown, Upload,
  CheckSquare, Square, Database, RotateCcw, Loader2,
  Edit3, MessageSquare, Award, CheckCircle, XCircle
} from 'lucide-react'
import Link from 'next/link'
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

// Types
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

interface TaskItem {
  id: string
  title: string
  description: string
  subject: string
  classes: string
  section: string
  status: 'Active' | 'Closed'
  hasAttachment: boolean
  attachmentName?: string
  assignedBy: string
  assignDate: string
  submissionDate: string
  studentsCount: number
}

interface RemarkStudentItem {
  id: string
  name: string
  rollNo: string
  admissionNo: string
  gender: 'Male' | 'Female'
  avatar: string
  status: 'Completed' | 'Pending'
  remark: string
  submittedAt?: string
}

interface PendingDateItem {
  id: string
  dayNumber: string
  dayName: string
  monthName: string
  year: string
  fullDate: string
}

// Generate default pending dates
const DEFAULT_PENDING_DATES: PendingDateItem[] = [
  { id: 'pd-1', dayNumber: '08', dayName: 'Mon', monthName: 'July', year: '2026', fullDate: '2026-07-08' },
  { id: 'pd-2', dayNumber: '04', dayName: 'Mon', monthName: 'July', year: '2026', fullDate: '2026-07-04' },
  { id: 'pd-3', dayNumber: '01', dayName: 'Mon', monthName: 'July', year: '2026', fullDate: '2026-07-01' },
  { id: 'pd-4', dayNumber: '25', dayName: 'Mon', monthName: 'June', year: '2026', fullDate: '2026-06-25' },
  { id: 'pd-5', dayNumber: '22', dayName: 'Mon', monthName: 'June', year: '2026', fullDate: '2026-06-22' },
  { id: 'pd-6', dayNumber: '10', dayName: 'Mon', monthName: 'June', year: '2026', fullDate: '2026-06-10' },
  { id: 'pd-7', dayNumber: '02', dayName: 'Mon', monthName: 'June', year: '2026', fullDate: '2026-06-02' },
  { id: 'pd-8', dayNumber: '24', dayName: 'Mon', monthName: 'May', year: '2026', fullDate: '2026-05-24' },
  { id: 'pd-9', dayNumber: '14', dayName: 'Mon', monthName: 'May', year: '2026', fullDate: '2026-05-14' },
  { id: 'pd-10', dayNumber: '10', dayName: 'Mon', monthName: 'May', year: '2026', fullDate: '2026-05-10' },
  { id: 'pd-11', dayNumber: '03', dayName: 'Mon', monthName: 'May', year: '2026', fullDate: '2026-05-03' },
  { id: 'pd-12', dayNumber: '01', dayName: 'Mon', monthName: 'May', year: '2026', fullDate: '2026-05-01' }
]

const DEFAULT_CLASSES: ClassCardItem[] = [
  { id: 'c-1', className: 'Class V', section: 'A', classTeacher: 'Pooja Sharma', studentsCount: 40 },
  { id: 'c-2', className: 'Class V', section: 'B', classTeacher: 'Ramesh Chandra', studentsCount: 38 },
  { id: 'c-3', className: 'Class VI', section: 'A', classTeacher: 'Sunita Sharma', studentsCount: 35 },
  { id: 'c-4', className: 'Class VI', section: 'B', classTeacher: 'Ashok Kumar', studentsCount: 36 }
]

const DEFAULT_SUBJECTS: SubjectItem[] = [
  {
    id: 's-1',
    subjectName: 'Mathematics',
    teacherName: 'Ashok Kumar',
    bgColor: 'bg-sky-50 hover:bg-sky-100/90',
    borderColor: 'border-sky-200/80',
    textColor: 'text-sky-950',
    badgeColor: 'bg-sky-100 text-sky-800'
  },
  {
    id: 's-2',
    subjectName: 'Science',
    teacherName: 'Sunita Sharma',
    bgColor: 'bg-teal-50 hover:bg-emerald-100/90',
    borderColor: 'border-teal-200/80',
    textColor: 'text-emerald-950',
    badgeColor: 'bg-emerald-100 text-teal-800'
  },
  {
    id: 's-3',
    subjectName: 'English',
    teacherName: 'Priya Verma',
    bgColor: 'bg-rose-50 hover:bg-rose-100/90',
    borderColor: 'border-rose-200/80',
    textColor: 'text-rose-950',
    badgeColor: 'bg-rose-100 text-rose-800'
  },
  {
    id: 's-4',
    subjectName: 'Hindi',
    teacherName: 'Ramesh Chandra',
    bgColor: 'bg-amber-50 hover:bg-amber-100/90',
    borderColor: 'border-amber-200/80',
    textColor: 'text-amber-950',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  {
    id: 's-5',
    subjectName: 'Social Studies',
    teacherName: 'Vikas Gupta',
    bgColor: 'bg-purple-50 hover:bg-purple-100/90',
    borderColor: 'border-purple-200/80',
    textColor: 'text-purple-950',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    id: 's-6',
    subjectName: 'Computer Science',
    teacherName: 'Neha Singh',
    bgColor: 'bg-orange-50 hover:bg-orange-100/90',
    borderColor: 'border-orange-200/80',
    textColor: 'text-orange-950',
    badgeColor: 'bg-orange-100 text-orange-800'
  }
]

const PRESET_REMARKS = [
  'Completed assignment on time with neat presentation.',
  'All 15 problems solved correctly in homework notebook.',
  'Submitted homework notebook on time.',
  'Exercise fully completed with diagrams.',
  'Excellent step-by-step reasoning and calculations.',
  'Good effort, but needs slight practice on final equations.',
  'Incomplete submission. Please complete remaining questions.',
  'Late submission. Notebook evaluated.'
]

function parseStudentClassAndSection(student: any): { className: string; section: string } {
  let rawClass = String(student.class || student.className || '').trim()
  let rawSection = String(student.section || student.sectionName || student.section_name || '').trim()
  const rawCombined = String(student.class_name || '').trim()

  if (rawCombined) {
    const parenMatch = rawCombined.match(/^([^(]+?)\s*\(([^)]+)\)$/)
    if (parenMatch) {
      if (!rawClass) rawClass = parenMatch[1].trim()
      if (!rawSection) rawSection = parenMatch[2].trim()
    } else {
      const dashMatch = rawCombined.match(/^(.+?)\s*-\s*(.+?)$/)
      if (dashMatch) {
        if (!rawClass) rawClass = dashMatch[1].trim()
        if (!rawSection) rawSection = dashMatch[2].trim()
      } else if (!rawClass) {
        rawClass = rawCombined
      }
    }
  }

  const cleanSection = rawSection.replace(/^section\s+/i, '').replace(/[-_]/g, '').trim()

  return {
    className: rawClass,
    section: cleanSection
  }
}

function matchesClassAndSection(student: any, cardClassName: string, cardSection: string): boolean {
  if (student.deleted || student.status === 'Deleted' || student.status === 'Dropped' || student.status === 'Passed') {
    return false
  }

  const { className: sClass, section: sSec } = parseStudentClassAndSection(student)
  if (!sClass) return false

  const normClass = (s: string) =>
    s.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/^class\s+/i, '')
      .replace(/^grade\s+/i, '')
      .replace(/^std\s+/i, '')
      .replace(/(st|nd|rd|th)$/i, '')
      .trim()

  const cardNorm = normClass(cardClassName)
  const studentNorm = normClass(sClass)

  if (cardNorm !== studentNorm && sClass.toLowerCase().trim() !== cardClassName.toLowerCase().trim()) {
    return false
  }

  const normSec = (s: string) =>
    s.toLowerCase()
      .replace(/^section\s+/i, '')
      .replace(/[-_\s]/g, '')
      .trim()

  const cardSec = normSec(cardSection)
  const studentSec = normSec(sSec)

  if (!cardSec || cardSec === 'all') return true

  if (studentSec) {
    return studentSec === cardSec
  }

  return cardSec === 'a' || cardSec === ''
}

const DEFAULT_TEACHERS_BY_SUBJECT: Record<string, string> = {
  english: 'Priya Verma',
  physics: 'Dr. R.K. Verma',
  chemistry: 'Suman Lata',
  biology: 'Dr. Neha Kapoor',
  mathematics: 'Ashok Kumar',
  maths: 'Ashok Kumar',
  math: 'Ashok Kumar',
  science: 'Sunita Sharma',
  hindi: 'Ramesh Chandra',
  'social studies': 'Vikas Gupta',
  'social science': 'Vikas Gupta',
  history: 'Vikas Gupta',
  geography: 'Anuradha Roy',
  computer: 'Neha Singh',
  'computer science': 'Neha Singh',
  sanskrit: 'Acharya Vidyadhar',
  economics: 'Meenakshi Iyer',
  commerce: 'Suresh Kumar',
  accounts: 'Rakesh Singhal',
  art: 'Kavita Joshi'
}

function getTeacherForSubject(
  subject: any,
  className: string,
  section: string,
  classTeacher: string,
  registeredTeachers: any[]
): string {
  const direct = subject.teacherName || subject.teacher || subject.faculty
  if (direct && typeof direct === 'string' && direct.trim() && direct.trim() !== '—' && direct.trim() !== '-') {
    return direct.trim()
  }

  const cleanSubject = String(subject.subjectName || subject.name || '').trim()
  const cleanSubjectLower = cleanSubject.toLowerCase()

  if (DEFAULT_TEACHERS_BY_SUBJECT[cleanSubjectLower]) {
    return DEFAULT_TEACHERS_BY_SUBJECT[cleanSubjectLower]
  }

  for (const [key, name] of Object.entries(DEFAULT_TEACHERS_BY_SUBJECT)) {
    if (cleanSubjectLower.includes(key) || key.includes(cleanSubjectLower)) {
      return name
    }
  }

  if (classTeacher && classTeacher.trim() && classTeacher.trim() !== '—') {
    return classTeacher.trim()
  }

  return 'Faculty'
}

export default function PendingRemarkHomeworkPage() {
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  const [allStudents, setAllStudents] = useState<any[]>([])
  const [registeredTeachers, setRegisteredTeachers] = useState<any[]>([])

  // Screen flow: 'dates' -> 'classes' -> 'subjects' -> 'students'
  const [currentStep, setCurrentStep] = useState<'dates' | 'classes' | 'subjects' | 'students'>('dates')

  // Screen 1: Date selection
  const [selectedPendingDate, setSelectedPendingDate] = useState<PendingDateItem>(DEFAULT_PENDING_DATES[0])
  const [monthFilter, setMonthFilter] = useState<string>('All')
  const [customDateInput, setCustomDateInput] = useState<string>('')

  // Screen 2: Classes filter
  const [selectedClassItem, setSelectedClassItem] = useState<ClassCardItem>(DEFAULT_CLASSES[0])
  const [filterClass, setFilterClass] = useState<string>('All')
  const [filterSection, setFilterSection] = useState<string>('All')
  const [searchClassQuery, setSearchClassQuery] = useState<string>('')

  // Screen 3: Subjects & Tasks
  const [selectedSubjectItem, setSelectedSubjectItem] = useState<SubjectItem>(DEFAULT_SUBJECTS[0])
  const [selectedTaskItem, setSelectedTaskItem] = useState<TaskItem | null>(null)
  const [tasksList, setTasksList] = useState<TaskItem[]>([])

  // Screen 4: Students Search, Filter & Submissions
  const [studentSearch, setStudentSearch] = useState<string>('')
  const [studentStatusFilter, setStudentStatusFilter] = useState<'All' | 'Completed' | 'Pending'>('All')
  const [taskSubmissions, setTaskSubmissions] = useState<Record<string, { status: 'Completed' | 'Pending'; remark?: string; submittedAt?: string }>>({})
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [isUpdatingSubmissions, setIsUpdatingSubmissions] = useState<boolean>(false)

  // Remark Modal State
  const [remarkModalOpen, setRemarkModalOpen] = useState<boolean>(false)
  const [activeRemarkStudent, setActiveRemarkStudent] = useState<RemarkStudentItem | null>(null)
  const [modalRemarkText, setModalRemarkText] = useState<string>('')
  const [modalRemarkStatus, setModalRemarkStatus] = useState<'Completed' | 'Pending'>('Completed')

  // Bulk Remark Modal State
  const [bulkModalOpen, setBulkModalOpen] = useState<boolean>(false)
  const [bulkRemarkText, setBulkRemarkText] = useState<string>('')
  const [bulkRemarkStatus, setBulkRemarkStatus] = useState<'Completed' | 'Pending'>('Completed')

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Load students & teachers
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      const parseLocal = (key: string) => {
        try {
          const raw = localStorage.getItem(key)
          if (!raw) return []
          const parsed = JSON.parse(raw)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      }

      const l1 = parseLocal('school_students')
      const l2 = parseLocal('school_institute_students')
      const l3 = parseLocal('students')
      const localCombined = [...l1, ...l2, ...l3]

      if (isMounted && localCombined.length > 0) {
        setAllStudents(localCombined)
      }

      try {
        const res = await fetchStudents()
        if (isMounted && res && res.success && Array.isArray(res.data)) {
          const dbStudents = res.data
          const dbIds = new Set(dbStudents.map((s: any) => String(s.id || s.admission_no || s.admissionNo)))
          const uniqueLocal = localCombined.filter((s: any) => !dbIds.has(String(s.id || s.admission_no || s.admissionNo)))
          setAllStudents([...dbStudents, ...uniqueLocal])
        }
      } catch (e) {}

      try {
        const tRes = await fetchTeachers()
        if (isMounted && tRes && tRes.success && Array.isArray(tRes.data)) {
          setRegisteredTeachers(tRes.data)
        }
      } catch (e) {}
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  // Load tasks from database & shared localStorage
  useEffect(() => {
    let isMounted = true

    const loadTasksFromDB = async () => {
      try {
        const cached = localStorage.getItem('school_homework_tasks')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTasksList(parsed)
          }
        }
      } catch {}

      try {
        const res = await fetchHomeworkTasks()
        if (isMounted && res && res.success && Array.isArray(res.data)) {
          const dbTasks: TaskItem[] = res.data.map((t: any) => ({
            id: String(t.id),
            title: t.title,
            description: t.description || '',
            subject: t.subject,
            classes: t.classes,
            section: t.section,
            status: (t.status === 'Closed' ? 'Closed' : 'Active') as 'Active' | 'Closed',
            hasAttachment: !!t.hasAttachment,
            attachmentName: t.attachmentName || undefined,
            assignedBy: t.assignedBy || 'Faculty',
            assignDate: t.assignDate || '',
            submissionDate: t.submissionDate || '',
            studentsCount: 0
          }))

          if (dbTasks.length > 0) {
            setTasksList(dbTasks)
            try {
              localStorage.setItem('school_homework_tasks', JSON.stringify(dbTasks))
            } catch {}
          }
        }
      } catch (err) {
        console.error('Failed to load homework tasks from DB:', err)
      }
    }

    loadTasksFromDB()
    return () => {
      isMounted = false
    }
  }, [])

  // Build real class cards from masters data
  const realClassCards = useMemo<ClassCardItem[]>(() => {
    const activeClasses = classesData.filter((c: any) => !c.deleted && c.className)
    if (activeClasses.length === 0) return DEFAULT_CLASSES

    const activeSections = sectionsData.filter((s: any) => !s.deleted && s.sectionName)
    const cards: ClassCardItem[] = []

    activeClasses.forEach((cls: any) => {
      const linkedSections = activeSections
        .filter((s: any) => s.className && s.className.toLowerCase() === cls.className.toLowerCase())
        .map((s: any) => {
          const name: string = s.sectionName.trim()
          return name.toLowerCase().startsWith('section ') ? name.replace(/^section /i, '') : name
        })

      const classObjSections: string[] = Array.isArray(cls.sections)
        ? cls.sections.map((s: string) => {
            const name = s.trim()
            return name.toLowerCase().startsWith('section ') ? name.replace(/^section /i, '') : name
          })
        : []

      const mergedSections = Array.from(new Set([...linkedSections, ...classObjSections]))
      const finalSections = mergedSections.length > 0 ? mergedSections : ['A']

      finalSections.forEach(sec => {
        const matchedCount = allStudents.filter(s => matchesClassAndSection(s, cls.className, sec)).length
        const studentsCount = allStudents.length > 0 ? matchedCount : (cls.totalStudents ?? 0)

        cards.push({
          id: `${cls.id ?? cls.className}-${sec}`,
          className: cls.className,
          section: sec,
          classTeacher: cls.classTeacher ?? '',
          studentsCount
        })
      })
    })

    return cards.length > 0 ? cards : DEFAULT_CLASSES
  }, [classesData, sectionsData, allStudents])

  const activeClassItem = useMemo(() => {
    return (
      realClassCards.find(
        c =>
          c.className.toLowerCase() === selectedClassItem.className.toLowerCase() &&
          c.section.toLowerCase() === selectedClassItem.section.toLowerCase()
      ) || realClassCards[0] || selectedClassItem
    )
  }, [realClassCards, selectedClassItem])

  const uniqueClassNames = useMemo(() => Array.from(new Set(realClassCards.map(c => c.className))), [realClassCards])
  const uniqueSections = useMemo(() => Array.from(new Set(realClassCards.map(c => c.section))), [realClassCards])

  // Filtered classes for Screen 2
  const filteredClasses = useMemo(() => {
    return realClassCards.filter(c => {
      if (filterClass !== 'All' && c.className !== filterClass) return false
      if (filterSection !== 'All' && c.section !== filterSection) return false
      if (searchClassQuery.trim()) {
        const q = searchClassQuery.toLowerCase()
        const matchName = c.className.toLowerCase().includes(q)
        const matchSec = c.section.toLowerCase().includes(q)
        const matchTeacher = c.classTeacher.toLowerCase().includes(q)
        if (!matchName && !matchSec && !matchTeacher) return false
      }
      return true
    })
  }, [realClassCards, filterClass, filterSection, searchClassQuery])

  // Color palette for subjects
  const SUBJECT_COLORS = [
    { bgColor: 'bg-sky-50 hover:bg-sky-100/90', borderColor: 'border-sky-200/80', textColor: 'text-sky-950', badgeColor: 'bg-sky-100 text-sky-800' },
    { bgColor: 'bg-teal-50 hover:bg-emerald-100/90', borderColor: 'border-teal-200/80', textColor: 'text-emerald-950', badgeColor: 'bg-emerald-100 text-teal-800' },
    { bgColor: 'bg-rose-50 hover:bg-rose-100/90', borderColor: 'border-rose-200/80', textColor: 'text-rose-950', badgeColor: 'bg-rose-100 text-rose-800' },
    { bgColor: 'bg-amber-50 hover:bg-amber-100/90', borderColor: 'border-amber-200/80', textColor: 'text-amber-950', badgeColor: 'bg-amber-100 text-amber-800' },
    { bgColor: 'bg-purple-50 hover:bg-purple-100/90', borderColor: 'border-purple-200/80', textColor: 'text-purple-950', badgeColor: 'bg-purple-100 text-purple-800' },
    { bgColor: 'bg-orange-50 hover:bg-orange-100/90', borderColor: 'border-orange-200/80', textColor: 'text-orange-950', badgeColor: 'bg-orange-100 text-orange-800' }
  ]

  // Real subjects for the selected class (Screen 3)
  const classSubjects = useMemo<SubjectItem[]>(() => {
    const activeSubjects = subjectsData.filter(
      (s: any) => !s.deleted && s.subjectName &&
        s.className?.toLowerCase() === activeClassItem.className?.toLowerCase()
    )
    if (activeSubjects.length === 0) return []
    return activeSubjects.map((s: any, idx: number) => ({
      id: String(s.id ?? idx),
      subjectName: s.subjectName,
      teacherName: getTeacherForSubject(
        s,
        activeClassItem.className,
        activeClassItem.section,
        activeClassItem.classTeacher,
        registeredTeachers
      ),
      ...SUBJECT_COLORS[idx % SUBJECT_COLORS.length]
    }))
  }, [subjectsData, activeClassItem, registeredTeachers])

  const activeSubjectItem = useMemo(() => {
    return (
      classSubjects.find(
        s => s.subjectName.toLowerCase() === selectedSubjectItem.subjectName.toLowerCase()
      ) || classSubjects[0] || selectedSubjectItem
    )
  }, [classSubjects, selectedSubjectItem])

  // Real enrolled students for selected class & section
  const classStudents = useMemo(() => {
    const matched = allStudents.filter(s =>
      matchesClassAndSection(s, activeClassItem.className, activeClassItem.section)
    )

    if (matched.length === 0) return []

    return matched.map((s: any, idx: number) => {
      const firstName = s.firstName || s.first_name || ''
      const lastName = s.lastName || s.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim() || s.name || 'Student'
      const gender = (s.gender && s.gender.toLowerCase() === 'female') ? 'Female' : 'Male'

      return {
        id: String(s.id || s.admission_no || s.admissionNo || `st-${idx}`),
        name: fullName,
        rollNo: String(s.rollNo || s.roll_no || `${idx < 9 ? '0' : ''}${idx + 1}`),
        admissionNo: String(s.admissionNo || s.admission_no || `ADM-${1000 + idx}`),
        gender: gender as 'Male' | 'Female',
        avatar: (s.avatar && typeof s.avatar === 'string' && s.avatar.trim() !== '')
          ? s.avatar
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
        status: 'Pending' as const,
        remark: 'Pending submission.'
      }
    })
  }, [allStudents, activeClassItem])

  // Students merged with DB submissions
  const studentsWithRemarks = useMemo<RemarkStudentItem[]>(() => {
    return classStudents.map(st => {
      const sub = taskSubmissions[st.id] || taskSubmissions[st.admissionNo] || taskSubmissions[st.rollNo]
      const rawStatus = (sub?.status as string) || ''
      const effectiveStatus: 'Completed' | 'Pending' = (rawStatus === 'Completed' || rawStatus === 'Submitted') ? 'Completed' : 'Pending'
      const effectiveRemark = sub?.remark !== undefined && sub?.remark !== null && sub?.remark !== ''
        ? sub.remark
        : (effectiveStatus === 'Completed' ? 'Completed assignment on time with neat presentation.' : 'Pending submission.')

      return {
        ...st,
        status: effectiveStatus,
        remark: effectiveRemark,
        submittedAt: sub?.submittedAt
      }
    })
  }, [classStudents, taskSubmissions])

  // Status counters
  const statusCounters = useMemo(() => {
    const total = studentsWithRemarks.length
    const completed = studentsWithRemarks.filter(s => s.status === 'Completed').length
    const pending = total - completed
    return { total, completed, pending }
  }, [studentsWithRemarks])

  // Filtered students for Screen 4
  const filteredStudents = useMemo(() => {
    return studentsWithRemarks.filter(s => {
      if (studentStatusFilter !== 'All' && s.status !== studentStatusFilter) return false
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase()
        const matchName = s.name.toLowerCase().includes(q)
        const matchRoll = s.rollNo.includes(q)
        const matchAdm = s.admissionNo.toLowerCase().includes(q)
        const matchRemark = s.remark.toLowerCase().includes(q)
        if (!matchName && !matchRoll && !matchAdm && !matchRemark) return false
      }
      return true
    })
  }, [studentsWithRemarks, studentSearch, studentStatusFilter])

  // Filtered dates list
  const filteredPendingDates = useMemo(() => {
    if (monthFilter === 'All') return DEFAULT_PENDING_DATES
    return DEFAULT_PENDING_DATES.filter(d => d.monthName.toLowerCase() === monthFilter.toLowerCase())
  }, [monthFilter])

  // Handlers
  const handleSelectPendingDate = (d: PendingDateItem) => {
    setSelectedPendingDate(d)
    setCurrentStep('classes')
  }

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customDateInput) return
    const dt = new Date(customDateInput)
    const dayNumber = String(dt.getDate()).padStart(2, '0')
    const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' })
    const monthName = dt.toLocaleDateString('en-US', { month: 'long' })
    const year = String(dt.getFullYear())

    const customItem: PendingDateItem = {
      id: `custom-${Date.now()}`,
      dayNumber,
      dayName,
      monthName,
      year,
      fullDate: customDateInput
    }

    setSelectedPendingDate(customItem)
    setCurrentStep('classes')
  }

  const handleSelectClass = (cls: ClassCardItem) => {
    setSelectedClassItem(cls)
    setCurrentStep('subjects')
  }

  const handleSelectSubject = async (sub: SubjectItem) => {
    setSelectedSubjectItem(sub)

    // Find any existing task for this subject, class & pending date
    const matchedTask = tasksList.find(
      t =>
        t.subject.toLowerCase() === sub.subjectName.toLowerCase() &&
        t.classes.toLowerCase() === activeClassItem.className.toLowerCase() &&
        t.section.toLowerCase() === activeClassItem.section.toLowerCase()
    )

    const targetTask: TaskItem = matchedTask || {
      id: `task-${Date.now()}`,
      title: `${sub.subjectName} Homework Assignment`,
      description: `Pending homework review for ${selectedPendingDate.dayNumber} ${selectedPendingDate.monthName} ${selectedPendingDate.year}`,
      subject: sub.subjectName,
      classes: activeClassItem.className,
      section: activeClassItem.section,
      status: 'Active',
      hasAttachment: false,
      assignedBy: `${sub.teacherName} (Faculty)`,
      assignDate: `${selectedPendingDate.dayNumber} ${selectedPendingDate.monthName.slice(0, 3)} ${selectedPendingDate.year}`,
      submissionDate: 'Pending Review',
      studentsCount: activeClassItem.studentsCount
    }

    setSelectedTaskItem(targetTask)
    setCurrentStep('students')

    // Fetch submissions from DB
    try {
      const res = await fetchTaskSubmissions(targetTask.id)
      if (res && res.success && Array.isArray(res.data)) {
        const subMap: Record<string, any> = {}
        res.data.forEach((s: any) => {
          subMap[String(s.studentId)] = {
            status: s.status === 'Submitted' ? 'Completed' : s.status,
            remark: s.remark,
            submittedAt: s.submittedAt
          }
        })
        setTaskSubmissions(subMap)
      } else {
        setTaskSubmissions({})
      }
    } catch {
      setTaskSubmissions({})
    }
  }

  // Quick 1-click status update
  const handleQuickStatusChange = async (student: RemarkStudentItem, newStatus: 'Completed' | 'Pending') => {
    if (!selectedTaskItem) return
    const dbStatus = newStatus === 'Completed' ? 'Submitted' : 'Pending'
    const defaultText = newStatus === 'Completed'
      ? (student.remark && !student.remark.toLowerCase().includes('pending') ? student.remark : 'Completed assignment on time with neat presentation.')
      : 'Pending submission. Notebook not submitted.'

    const updated = {
      ...taskSubmissions,
      [student.id]: {
        ...(taskSubmissions[student.id] || {}),
        status: newStatus,
        remark: defaultText,
        submittedAt: newStatus === 'Completed' ? 'Just now' : undefined
      }
    }
    setTaskSubmissions(updated)
    try {
      localStorage.setItem(`hw_sub_${selectedTaskItem.id}`, JSON.stringify(updated))
    } catch {}

    showToast(`${student.name} marked as ${newStatus}! (Saved in DB)`)

    try {
      await updateStudentTaskSubmission(
        selectedTaskItem.id,
        student.id,
        dbStatus,
        {
          studentName: student.name,
          admissionNo: student.admissionNo,
          rollNo: student.rollNo,
          remark: defaultText
        }
      )
    } catch (err) {
      console.error('Failed to save to DB:', err)
    }
  }

  // Open Edit Remark Modal
  const handleOpenEditRemarkModal = (student: RemarkStudentItem) => {
    setActiveRemarkStudent(student)
    setModalRemarkText(student.remark || '')
    setModalRemarkStatus(student.status)
    setRemarkModalOpen(true)
  }

  // Save Student Remark
  const handleSaveStudentRemark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeRemarkStudent || !selectedTaskItem) return

    const trimmed = modalRemarkText.trim()
    const dbStatus = modalRemarkStatus === 'Completed' ? 'Submitted' : 'Pending'

    const updated = {
      ...taskSubmissions,
      [activeRemarkStudent.id]: {
        ...(taskSubmissions[activeRemarkStudent.id] || {}),
        status: modalRemarkStatus,
        remark: trimmed,
        submittedAt: modalRemarkStatus === 'Completed' ? 'Just now' : undefined
      }
    }
    setTaskSubmissions(updated)
    try {
      localStorage.setItem(`hw_sub_${selectedTaskItem.id}`, JSON.stringify(updated))
    } catch {}

    setRemarkModalOpen(false)
    showToast(`Remark saved for ${activeRemarkStudent.name}! (Saved in DB)`)

    try {
      await updateStudentRemark(
        selectedTaskItem.id,
        activeRemarkStudent.id,
        trimmed,
        dbStatus,
        {
          studentName: activeRemarkStudent.name,
          admissionNo: activeRemarkStudent.admissionNo,
          rollNo: activeRemarkStudent.rollNo
        }
      )
    } catch (err) {
      console.error('Failed to save remark in DB:', err)
    }
  }

  // Multi-select toggle
  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id))
    }
  }

  const handleToggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    )
  }

  // Bulk Remark Modal
  const handleOpenBulkModal = () => {
    if (selectedStudentIds.length === 0) {
      setSelectedStudentIds(filteredStudents.map(s => s.id))
    }
    setBulkRemarkText('Completed assignment on time with neat presentation.')
    setBulkRemarkStatus('Completed')
    setBulkModalOpen(true)
  }

  // Execute Bulk Remark
  const handleExecuteBulkRemark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedStudentIds.length === 0 || !selectedTaskItem) return
    setIsUpdatingSubmissions(true)

    const selectedSet = new Set(selectedStudentIds)
    const targetStudents = studentsWithRemarks.filter(s => selectedSet.has(s.id))
    const trimmedRemark = bulkRemarkText.trim()
    const dbStatus = bulkRemarkStatus === 'Completed' ? 'Submitted' : 'Pending'

    const nextSubmissions = { ...taskSubmissions }
    targetStudents.forEach(st => {
      nextSubmissions[st.id] = {
        ...(nextSubmissions[st.id] || {}),
        status: bulkRemarkStatus,
        remark: trimmedRemark,
        submittedAt: bulkRemarkStatus === 'Completed' ? 'Just now' : undefined
      }
    })
    setTaskSubmissions(nextSubmissions)
    try {
      localStorage.setItem(`hw_sub_${selectedTaskItem.id}`, JSON.stringify(nextSubmissions))
    } catch {}

    const count = targetStudents.length
    setBulkModalOpen(false)
    setSelectedStudentIds([])
    showToast(`Updated remarks for ${count} students in database!`)

    try {
      await bulkUpdateStudentTaskSubmissions(
        selectedTaskItem.id,
        targetStudents.map(st => ({
          studentId: st.id,
          studentName: st.name,
          admissionNo: st.admissionNo,
          rollNo: st.rollNo,
          remark: trimmedRemark
        })),
        dbStatus,
        trimmedRemark
      )
    } catch (err) {
      console.error('Failed to bulk save remarks in DB:', err)
    } finally {
      setIsUpdatingSubmissions(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-3 sm:p-5 md:p-8 space-y-5 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-xl transition-all animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-teal-600 text-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (currentStep === 'students') setCurrentStep('subjects')
                else if (currentStep === 'subjects') setCurrentStep('classes')
                else if (currentStep === 'classes') setCurrentStep('dates')
                else window.history.back()
              }}
              className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                {currentStep === 'dates' && 'Pending Remark Homework'}
                {currentStep === 'classes' && 'Pending Remark Homework'}
                {currentStep === 'subjects' && 'Select Subject'}
                {currentStep === 'students' && 'Remark Homework'}
              </h1>
              <p className="text-xs text-teal-100/80 font-medium">
                {currentStep === 'dates' && 'Pick a date to review pending student homework remarks'}
                {currentStep === 'classes' && `Reviewing remarks for ${selectedPendingDate.dayNumber} ${selectedPendingDate.monthName} ${selectedPendingDate.year}`}
                {currentStep === 'subjects' && `${activeClassItem.className} (Sec ${activeClassItem.section})`}
                {currentStep === 'students' && `${selectedSubjectItem.subjectName} • ${activeClassItem.className}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 font-medium text-teal-100">
              <Database className="w-3.5 h-3.5" />
              DB Synced
            </span>
            <Link
              href="/institute/homework"
              className="px-3 py-1.5 rounded-xl bg-white text-teal-600 font-bold text-xs hover:bg-teal-50 transition-colors"
            >
              Homework Hub
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SCREEN 1: SELECT DATE FOR PENDING REMARK
          ========================================================================= */}
      {currentStep === 'dates' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Select Date
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pick a date to evaluate pending student homework remarks
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <form onSubmit={handleCustomDateSubmit} className="flex items-center gap-2">
                <input
                  type="date"
                  value={customDateInput}
                  onChange={e => setCustomDateInput(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <button
                  type="submit"
                  disabled={!customDateInput}
                  className="px-3 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Go
                </button>
              </form>

              <div className="relative">
                <select
                  value={monthFilter}
                  onChange={e => setMonthFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-2xl pl-9 pr-8 py-2.5 text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs cursor-pointer"
                >
                  <option value="All">All Months</option>
                  <option value="July">Jul 2026</option>
                  <option value="June">Jun 2026</option>
                  <option value="May">May 2026</option>
                </select>
                <Calendar className="w-3.5 h-3.5 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {filteredPendingDates.map(date => (
              <button
                key={date.id}
                type="button"
                onClick={() => handleSelectPendingDate(date)}
                className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 hover:border-teal-500 hover:shadow-md transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer group active:scale-95"
              >
                <span className="text-xs font-extrabold text-slate-700">
                  {date.monthName}
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-teal-600 group-hover:scale-105 transition-transform tracking-tight">
                  {date.dayNumber}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {date.dayName}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: SELECT CLASS TO REMARK
          ========================================================================= */}
      {currentStep === 'classes' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Pending Remark Date</p>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {selectedPendingDate.dayNumber} {selectedPendingDate.monthName} {selectedPendingDate.year} ({selectedPendingDate.dayName})
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep('dates')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Change Date
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Class</label>
              <div className="relative">
                <select
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs cursor-pointer"
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
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Section</label>
              <div className="relative">
                <select
                  value={filterSection}
                  onChange={e => setFilterSection(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs cursor-pointer"
                >
                  <option value="All">All Sections</option>
                  {uniqueSections.map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Search Class</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search class or teacher..."
                  value={searchClassQuery}
                  onChange={e => setSearchClassQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Classes</h2>
            <span className="text-xs font-bold text-slate-400">
              {filteredClasses.length} Available
            </span>
          </div>

          <div className="space-y-4">
            {filteredClasses.map(cls => {
              const total = cls.studentsCount
              let completed = 0
              const relevantTasks = tasksList.filter(
                t => t.classes.toLowerCase() === cls.className.toLowerCase() &&
                     t.section.toLowerCase() === cls.section.toLowerCase()
              )
              if (total > 0 && relevantTasks.length > 0) {
                relevantTasks.forEach(t => {
                  try {
                    const cached = localStorage.getItem(`hw_sub_${t.id}`)
                    if (cached) {
                      const parsed = JSON.parse(cached)
                      Object.values(parsed).forEach((sub: any) => {
                        if (sub.status === 'Completed' || sub.status === 'Submitted') completed++
                      })
                    }
                  } catch {}
                })
                completed = Math.min(total, completed)
              }
              const pending = total > 0 ? Math.max(0, total - completed) : 0

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                          {cls.className} - Section {cls.section}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                          Teacher: {cls.classTeacher || 'Assigned Faculty'}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs inline-flex items-center gap-1.5 shrink-0 border border-blue-100">
                      <Users className="w-3.5 h-3.5" />
                      {total} {total === 1 ? 'Student' : 'Students'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-800">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Total: {total}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-teal-50 text-teal-800">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      Completed: {completed}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-800">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Pending: {pending}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSelectClass(cls)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Remark Homework</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: SELECT SUBJECT
          ========================================================================= */}
      {currentStep === 'subjects' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {activeClassItem.className}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {classSubjects.length} Subjects Assigned
                </p>
              </div>
            </div>

            <span className="px-4 py-2 rounded-2xl bg-teal-600 text-white font-bold text-xs shadow-xs">
              Section {activeClassItem.section}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Subjects</h2>
            <button
              type="button"
              onClick={() => setCurrentStep('classes')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Change Class
            </button>
          </div>

          {classSubjects.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">No Subjects Added For This Class</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                No subjects have been mapped for {activeClassItem.className} (Sec {activeClassItem.section}) in Masters.
              </p>
              <Link
                href="/institute/masters"
                className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Subjects in Masters
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {classSubjects.map(sub => (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubject(sub)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-md ${sub.bgColor} ${sub.borderColor}`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <h4 className={`text-sm md:text-base font-extrabold truncate ${sub.textColor}`}>
                      Subject : {sub.subjectName}
                    </h4>
                    <div className="inline-block bg-white/90 px-3 py-1 rounded-xl shadow-2xs">
                      <span className="text-xs font-semibold text-slate-700">
                        Teacher : {sub.teacherName}
                      </span>
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-xs shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SCREEN 4: REMARK STUDENTS FOR PENDING TASK
          ========================================================================= */}
      {currentStep === 'students' && selectedTaskItem && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {activeClassItem.className}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                    Subject: {selectedTaskItem.subject}
                  </p>
                </div>
              </div>

              <span className="px-4 py-2 rounded-2xl bg-teal-600 text-white font-bold text-xs shrink-0 shadow-xs">
                Section {activeClassItem.section}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 min-w-0 truncate">
                <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="truncate">{selectedTaskItem.title}</span>
              </div>
              <span className="font-semibold text-orange-600 shrink-0">
                Date: {selectedPendingDate.dayNumber} {selectedPendingDate.monthName} {selectedPendingDate.year}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search By Name, Roll No."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
                {(['All', 'Completed', 'Pending'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStudentStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      studentStatusFilter === tab
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab} ({tab === 'All' ? statusCounters.total : tab === 'Completed' ? statusCounters.completed : statusCounters.pending})
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleOpenBulkModal}
                className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 text-teal-600 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bulk Action</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-slate-800">
              Students ({filteredStudents.length})
            </h3>

            {selectedStudentIds.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                <span>{selectedStudentIds.length} Selected</span>
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds([])}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">No Students Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                No students enrolled in {activeClassItem.className} (Sec {activeClassItem.section}).
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map(student => {
                const isCompleted = student.status === 'Completed'
                const isSelected = selectedStudentIds.includes(student.id)

                return (
                  <div
                    key={student.id}
                    className={`bg-white rounded-3xl p-4 sm:p-5 shadow-xs border transition-all space-y-3.5 ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/10'
                        : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleStudentSelection(student.id)}
                          className="mt-1 text-slate-300 hover:text-teal-600 transition-colors shrink-0"
                          title="Select student"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-teal-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 shadow-xs shrink-0"
                        />

                        <div className="min-w-0">
                          <h4 className="text-base font-extrabold text-slate-900 truncate">
                            {student.name}
                          </h4>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                              {student.gender}
                            </span>

                            {isCompleted ? (
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 inline-flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Completed
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-100 shrink-0">
                        Roll No. : {student.rollNo}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed italic flex-1">
                        &quot;{student.remark}&quot;
                      </p>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(student, 'Completed')}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-teal-50 hover:bg-emerald-100 text-teal-700 border border-teal-200'
                          }`}
                          title="Mark as Completed"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(student, 'Pending')}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            !isCompleted
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                          title="Mark as Incomplete / Pending"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditRemarkModal(student)}
                          className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center transition-all shadow-2xs"
                          title="Edit Remark Note"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Single Student Remark Modal */}
          {remarkModalOpen && activeRemarkStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="px-6 py-4 bg-teal-600 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Edit Pending Homework Remark</h3>
                      <p className="text-xs text-teal-100/90">{activeRemarkStudent.name} (Roll: {activeRemarkStudent.rollNo})</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRemarkModalOpen(false)}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveStudentRemark} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Completion Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setModalRemarkStatus('Completed')}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          modalRemarkStatus === 'Completed'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalRemarkStatus('Pending')}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          modalRemarkStatus === 'Pending'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        Pending
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Teacher Remark / Feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={modalRemarkText}
                      onChange={e => setModalRemarkText(e.target.value)}
                      placeholder="Enter specific teacher remark or evaluation notes..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                      Quick Presets (Click to insert):
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {PRESET_REMARKS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setModalRemarkText(preset)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-teal-800 text-[11px] text-slate-600 transition-colors text-left truncate max-w-full"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setRemarkModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Save Remark in DB
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Bulk Action Modal */}
          {bulkModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="px-6 py-4 bg-teal-600 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Bulk Homework Remark</h3>
                      <p className="text-xs text-teal-100/90">
                        Applying to {selectedStudentIds.length} students at once
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBulkModalOpen(false)}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleExecuteBulkRemark} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Set Status for Selected</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBulkRemarkStatus('Completed')}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          bulkRemarkStatus === 'Completed'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark All Completed
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkRemarkStatus('Pending')}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          bulkRemarkStatus === 'Pending'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        Mark All Pending
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Bulk Remark to Apply
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={bulkRemarkText}
                      onChange={e => setBulkRemarkText(e.target.value)}
                      placeholder="e.g. Completed assignment on time with neat presentation."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                      Presets (Click to select):
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {PRESET_REMARKS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setBulkRemarkText(preset)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-teal-800 text-[11px] text-slate-600 transition-colors text-left truncate max-w-full"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setBulkModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingSubmissions}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {isUpdatingSubmissions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Apply to {selectedStudentIds.length} Students in DB
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

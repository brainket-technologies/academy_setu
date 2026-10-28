'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { 
  ChevronLeft, ChevronRight, Users, GraduationCap, 
  Calendar, FileText, Paperclip, Plus, Search, Check, 
  X, ArrowLeft, Clock, CheckCircle2, User, BookOpen, AlertCircle,
  Filter, Sparkles, Download, Eye, ChevronDown, Upload,
  CheckSquare, Square, Database, RotateCcw, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'
import { fetchStudents } from '@/app/institute/students/actions'
import { fetchTeachers } from '@/app/institute/teachers/actions'
import { 
  fetchHomeworkTasks, 
  createHomeworkTask, 
  fetchTaskSubmissions, 
  updateStudentTaskSubmission, 
  bulkUpdateStudentTaskSubmissions 
} from './actions'

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

interface StudentItem {
  id: string
  name: string
  rollNo: string
  admissionNo: string
  avatar: string
  status: 'Submitted' | 'Pending'
}

// Default mock classes matching Screenshot 1
const DEFAULT_CLASSES: ClassCardItem[] = [
  { id: 'c-1', className: 'Class V', section: 'A', classTeacher: 'Pooja Sharma', studentsCount: 40 },
  { id: 'c-2', className: 'Class V', section: 'B', classTeacher: 'Ramesh Chandra', studentsCount: 38 },
  { id: 'c-3', className: 'Class VI', section: 'A', classTeacher: 'Sunita Sharma', studentsCount: 35 },
  { id: 'c-4', className: 'Class VI', section: 'B', classTeacher: 'Vikas Gupta', studentsCount: 36 },
  { id: 'c-5', className: 'Class VII', section: 'A', classTeacher: 'Anuradha Roy', studentsCount: 42 },
  { id: 'c-6', className: 'Class VII', section: 'B', classTeacher: 'Suresh Kumar', studentsCount: 39 },
  { id: 'c-7', className: 'Class VIII', section: 'A', classTeacher: 'Meenakshi Iyer', studentsCount: 41 },
  { id: 'c-8', className: 'Class VIII', section: 'B', classTeacher: 'Ashok Mehra', studentsCount: 40 },
]

// Subjects list matching Screenshot 2
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
    bgColor: 'bg-emerald-50 hover:bg-emerald-100/90',
    borderColor: 'border-emerald-200/80',
    textColor: 'text-emerald-950',
    badgeColor: 'bg-emerald-100 text-emerald-800'
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

// Initial Tasks matching Screenshot 3
const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Algebra: Linear Equations Exercise 4.2',
    description: 'Solve questions 1 to 15 from Chapter 4 Exercise 4.2. Show all calculation steps clearly in your notebook.',
    subject: 'Mathematics',
    classes: 'Class V',
    section: 'A',
    status: 'Active',
    hasAttachment: true,
    attachmentName: 'Exercise_4_2_worksheet.pdf',
    assignedBy: 'Pooja Sharma (You)',
    assignDate: '15 Sep 2026',
    submissionDate: '18 Sep 2026',
    studentsCount: 40
  },
  {
    id: 't-2',
    title: 'Geometry: Triangles Theorem 3 & 4',
    description: 'Write statements and proofs of Pythagoras Theorem and solve practical problems on page 78.',
    subject: 'Mathematics',
    classes: 'Class V',
    section: 'A',
    status: 'Closed',
    hasAttachment: false,
    assignedBy: 'Vikram Malhotra',
    assignDate: '10 Sep 2026',
    submissionDate: '13 Sep 2026',
    studentsCount: 40
  }
]

// Students list matching Screenshot 4
const DEFAULT_STUDENTS: StudentItem[] = [
  {
    id: 'st-1',
    name: 'Aarav Sharma',
    rollNo: '001',
    admissionNo: 'ADM-2024-101',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    status: 'Submitted'
  },
  {
    id: 'st-2',
    name: 'Priya Gupta',
    rollNo: '002',
    admissionNo: 'ADM-2024-102',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    status: 'Submitted'
  },
  {
    id: 'st-3',
    name: 'Rohan Verma',
    rollNo: '003',
    admissionNo: 'ADM-2024-103',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    status: 'Pending'
  },
  {
    id: 'st-4',
    name: 'Sneha Patel',
    rollNo: '004',
    admissionNo: 'ADM-2024-104',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'Submitted'
  },
  {
    id: 'st-5',
    name: 'Arjun Singh',
    rollNo: '005',
    admissionNo: 'ADM-2024-105',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    status: 'Pending'
  },
  {
    id: 'st-6',
    name: 'Divya Mehta',
    rollNo: '006',
    admissionNo: 'ADM-2024-106',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    status: 'Submitted'
  },
  {
    id: 'st-7',
    name: 'Kabir Khanna',
    rollNo: '007',
    admissionNo: 'ADM-2024-107',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    status: 'Submitted'
  },
  {
    id: 'st-8',
    name: 'Ananya Deshmukh',
    rollNo: '008',
    admissionNo: 'ADM-2024-108',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    status: 'Pending'
  }
]

// Helper to parse class and section from various student record formats
function parseStudentClassAndSection(student: any): { className: string; section: string } {
  let rawClass = String(student.class || student.className || '').trim()
  let rawSection = String(student.section || student.sectionName || student.section_name || '').trim()
  const rawCombined = String(student.class_name || '').trim()

  if (rawCombined) {
    // Matches e.g. "Class 1 (A)", "Class 1 (Section A)"
    const parenMatch = rawCombined.match(/^([^(]+?)\s*\(([^)]+)\)$/)
    if (parenMatch) {
      if (!rawClass) rawClass = parenMatch[1].trim()
      if (!rawSection) rawSection = parenMatch[2].trim()
    } else {
      // Matches e.g. "Class 1 - Section A", "Class 1 - A"
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

// Helper to determine if a student belongs to a given class card
function matchesClassAndSection(student: any, cardClassName: string, cardSection: string): boolean {
  if (student.deleted || student.status === 'Deleted' || student.status === 'Dropped' || student.status === 'Passed') {
    return false
  }

  const { className: sClass, section: sSec } = parseStudentClassAndSection(student)
  if (!sClass) return false

  // Canonical class name comparison: "Class 1" vs "1", "Class 1st" vs "Class 1", case-insensitive
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

  // Section comparison:
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

  // If student record does not specify a section, default to Section A
  return cardSec === 'a' || cardSec === ''
}

// Subject faculty map for automatic reputable teacher assignment
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
  'art & craft': 'Kavita Joshi',
  art: 'Kavita Joshi',
  music: 'Pandit Ravi Shankar',
  'physical education': 'Coach Balbir Singh',
  sports: 'Coach Balbir Singh',
  evs: 'Sunita Sharma',
  'environmental studies': 'Sunita Sharma',
  gk: 'Pooja Sharma',
  'general knowledge': 'Pooja Sharma'
}

// Helper to determine the teacher name for any subject
function getTeacherForSubject(
  subject: any,
  className: string,
  section: string,
  classTeacher: string,
  registeredTeachers: any[]
): string {
  // 1. Direct teacher on subject record if specified
  const direct = subject.teacherName || subject.teacher || subject.faculty
  if (direct && typeof direct === 'string' && direct.trim() && direct.trim() !== '—' && direct.trim() !== '-') {
    return direct.trim()
  }

  const cleanSubject = String(subject.subjectName || subject.name || '').trim()
  const cleanSubjectLower = cleanSubject.toLowerCase()
  const cleanClassLower = className.toLowerCase().trim()
  const cleanSecLower = section.toLowerCase().replace(/^section\s+/i, '').trim()

  // 2. Search in registered teachers
  if (Array.isArray(registeredTeachers) && registeredTeachers.length > 0) {
    for (const t of registeredTeachers) {
      const tName = t.name?.trim()
      if (!tName) continue

      // Check details.classes.assignedClasses
      const assigned = t.details?.classes?.assignedClasses
      if (Array.isArray(assigned)) {
        const found = assigned.some((a: any) => {
          const aClass = String(a.class || '').toLowerCase().trim()
          const aSub = String(a.subject || '').toLowerCase().trim()
          const aSec = String(a.section || '').toLowerCase().replace(/^section\s+/i, '').trim()
          const matchClass = aClass === cleanClassLower || aClass.replace(/^class\s+/i, '') === cleanClassLower.replace(/^class\s+/i, '')
          const matchSub = aSub === cleanSubjectLower
          const matchSec = !aSec || aSec === 'all' || aSec === cleanSecLower
          return matchClass && matchSub && matchSec
        })
        if (found) return tName
      }

      // Check assignedClasses string array
      const arr = t.assignedClasses || t.assigned_classes
      if (Array.isArray(arr)) {
        const found = arr.some((str: string) => {
          const sLower = str.toLowerCase()
          return sLower.includes(cleanSubjectLower) && (sLower.includes(cleanClassLower) || sLower.includes(cleanClassLower.replace(/^class\s+/i, '')))
        })
        if (found) return tName
      }
    }
  }

  // 3. Search in timetables from localStorage
  try {
    const rawTt = localStorage.getItem('school_timetables')
    if (rawTt) {
      const ttList = JSON.parse(rawTt)
      if (Array.isArray(ttList)) {
        for (const tt of ttList) {
          const ttClass = String(tt.classes || '').toLowerCase().trim()
          const ttSec = String(tt.section || '').toLowerCase().replace(/^section\s+/i, '').trim()
          if (
            (ttClass === cleanClassLower || ttClass.replace(/^class\s+/i, '') === cleanClassLower.replace(/^class\s+/i, '')) &&
            (!ttSec || ttSec === cleanSecLower)
          ) {
            if (tt.schedule && typeof tt.schedule === 'object') {
              for (const day of Object.keys(tt.schedule)) {
                const periods = tt.schedule[day]
                if (Array.isArray(periods)) {
                  const matchPeriod = periods.find(
                    (p: any) =>
                      String(p.subject || '').toLowerCase().trim() === cleanSubjectLower &&
                      p.teacher &&
                      p.teacher.trim() &&
                      p.teacher.trim() !== '—'
                  )
                  if (matchPeriod) return matchPeriod.teacher.trim()
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {}

  // 4. Match curated subject faculty dictionary
  if (DEFAULT_TEACHERS_BY_SUBJECT[cleanSubjectLower]) {
    return DEFAULT_TEACHERS_BY_SUBJECT[cleanSubjectLower]
  }

  for (const [key, name] of Object.entries(DEFAULT_TEACHERS_BY_SUBJECT)) {
    if (cleanSubjectLower.includes(key) || key.includes(cleanSubjectLower)) {
      return name
    }
  }

  // 5. Fallback to assigned class teacher if present
  if (classTeacher && classTeacher.trim() && classTeacher.trim() !== '—' && classTeacher.trim() !== '-') {
    return classTeacher.trim()
  }

  // 6. Stable consistent teacher assignment from faculty pool
  const FALLBACK_TEACHERS = [
    'Dr. R.K. Verma',
    'Priya Verma',
    'Ashok Kumar',
    'Sunita Sharma',
    'Ramesh Chandra',
    'Vikas Gupta',
    'Neha Singh',
    'Anil Saxena',
    'Meenakshi Iyer'
  ]
  const charCodeSum = cleanSubject.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return FALLBACK_TEACHERS[charCodeSum % FALLBACK_TEACHERS.length]
}

export default function AssignHomeworkPage() {
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  // Real students state loaded from localStorage & database
  const [allStudents, setAllStudents] = useState<any[]>([])
  // Registered teachers loaded from database & localStorage
  const [registeredTeachers, setRegisteredTeachers] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true

    const loadAllStudents = async () => {
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
      } catch (e) {
        // Fallback to local
      }

      try {
        const tRes = await fetchTeachers()
        if (isMounted && tRes && tRes.success && Array.isArray(tRes.data)) {
          setRegisteredTeachers(tRes.data)
        }
      } catch (e) {}
    }

    loadAllStudents()

    const handleUpdate = () => {
      loadAllStudents()
    }
    window.addEventListener('storage', handleUpdate)
    window.addEventListener('focus', handleUpdate)
    return () => {
      isMounted = false
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('focus', handleUpdate)
    }
  }, [])

  // Navigation steps:
  // 'classes' (Screen 1) -> 'subjects' (Screen 2) -> 'tasks' (Screen 3) -> 'students' (Screen 4)
  const [currentStep, setCurrentStep] = useState<'classes' | 'subjects' | 'tasks' | 'students'>('classes')

  // Selected State
  const [selectedClassItem, setSelectedClassItem] = useState<ClassCardItem>(DEFAULT_CLASSES[0])
  const [selectedSubjectItem, setSelectedSubjectItem] = useState<SubjectItem>(DEFAULT_SUBJECTS[0])
  const [selectedTaskItem, setSelectedTaskItem] = useState<TaskItem>(INITIAL_TASKS[0])

  // Screen 1: Calendar Carousel State
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(22) // default 22
  const [filterClass, setFilterClass] = useState<string>('All')
  const [filterSection, setFilterSection] = useState<string>('All')
  const [searchClassQuery, setSearchClassQuery] = useState<string>('')

  // Screen 3: Tasks list & Create Modal
  const [tasksList, setTasksList] = useState<TaskItem[]>(INITIAL_TASKS)
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState<boolean>(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')

  // Date states using standard YYYY-MM-DD for native <input type="date">
  const todayYMD = useMemo(() => new Date().toISOString().split('T')[0], [])
  const defaultDueYMD = useMemo(() => new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], [])

  const [newTaskAssignDate, setNewTaskAssignDate] = useState(todayYMD)
  const [newTaskDueDate, setNewTaskDueDate] = useState(defaultDueYMD)

  // Proper attachment state & file input ref
  const [newTaskAttachmentName, setNewTaskAttachmentName] = useState<string>('')
  const [newTaskAttachmentSize, setNewTaskAttachmentSize] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewTaskAttachmentName(file.name)
      const sizeKb = file.size / 1024
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`
      setNewTaskAttachmentSize(sizeStr)
    }
  }

  const handleRemoveAttachment = () => {
    setNewTaskAttachmentName('')
    setNewTaskAttachmentSize('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Screen 4: Students Search, Filter & Submissions
  const [studentSearch, setStudentSearch] = useState<string>('')
  const [studentStatusFilter, setStudentStatusFilter] = useState<'All' | 'Submitted' | 'Pending'>('All')

  // Screen 4: Task Submissions map (studentId -> submission info), multiple selection, and loading
  const [taskSubmissions, setTaskSubmissions] = useState<Record<string, { status: 'Submitted' | 'Pending'; remark?: string; submittedAt?: string }>>({})
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [isUpdatingSubmissions, setIsUpdatingSubmissions] = useState<boolean>(false)

  // Load homework tasks from DB institutewise on component mount
  useEffect(() => {
    let isMounted = true

    const loadTasksFromDB = async () => {
      // 1. Try local storage cache
      try {
        const cached = localStorage.getItem('school_homework_tasks')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTasksList(parsed)
          }
        }
      } catch {}

      // 2. Fetch from database (scoped to authenticated institution_id)
      try {
        const res = await fetchHomeworkTasks()
        if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
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

          setTasksList(prev => {
            const dbIds = new Set(dbTasks.map(t => t.id))
            const nonDb = prev.filter(t => !dbIds.has(t.id))
            const merged = [...dbTasks, ...nonDb]
            try {
              localStorage.setItem('school_homework_tasks', JSON.stringify(merged))
            } catch {}
            return merged
          })
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

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Generate 7-day strip based on offset
  const weekDays = useMemo(() => {
    const days = [
      { dayNumber: 19, dayName: 'Mon' },
      { dayNumber: 20, dayName: 'Tue' },
      { dayNumber: 21, dayName: 'Wed' },
      { dayNumber: 22, dayName: 'Thu' },
      { dayNumber: 23, dayName: 'Fri' },
      { dayNumber: 24, dayName: 'Sat' },
      { dayNumber: 25, dayName: 'Sun' }
    ]
    if (currentWeekOffset === 0) return days
    return days.map(d => ({
      ...d,
      dayNumber: ((d.dayNumber + currentWeekOffset * 7 - 1) % 30) + 1
    }))
  }, [currentWeekOffset])

  // Build real class cards from masters data (classes + sections) with dynamic student counts
  const realClassCards = useMemo<ClassCardItem[]>(() => {
    const activeClasses = classesData.filter((c: any) => !c.deleted && c.className)
    if (activeClasses.length === 0) return DEFAULT_CLASSES

    const activeSections = sectionsData.filter((s: any) => !s.deleted && s.sectionName)

    const cards: ClassCardItem[] = []
    activeClasses.forEach((cls: any) => {
      // Sections linked via school_masters_sections
      const linkedSections = activeSections
        .filter((s: any) => s.className && s.className.toLowerCase() === cls.className.toLowerCase())
        .map((s: any) => {
          const name: string = s.sectionName.trim()
          return name.toLowerCase().startsWith('section ') ? name.replace(/^section /i, '') : name
        })

      // Sections from class record itself
      const classObjSections: string[] = Array.isArray(cls.sections)
        ? cls.sections.map((s: string) => {
            const name = s.trim()
            return name.toLowerCase().startsWith('section ') ? name.replace(/^section /i, '') : name
          })
        : []

      const mergedSections = Array.from(new Set([...linkedSections, ...classObjSections]))
      const finalSections = mergedSections.length > 0 ? mergedSections : ['A']

      finalSections.forEach((sec, idx) => {
        // Calculate exact student count class-wise and section-wise
        const matchedCount = allStudents.filter(s => matchesClassAndSection(s, cls.className, sec)).length
        const studentsCount = allStudents.length > 0 ? matchedCount : (cls.totalStudents ?? 0)

        cards.push({
          id: `${cls.id ?? cls.className}-${sec}`,
          className: cls.className,
          section: sec,
          classTeacher: cls.classTeacher ?? '',
          studentsCount,
        })
      })
    })
    return cards.length > 0 ? cards : DEFAULT_CLASSES
  }, [classesData, sectionsData, allStudents])

  // Keep selectedClassItem synchronized with live studentsCount
  const activeClassItem = useMemo(() => {
    return (
      realClassCards.find(
        c =>
          c.className.toLowerCase() === selectedClassItem.className.toLowerCase() &&
          c.section.toLowerCase() === selectedClassItem.section.toLowerCase()
      ) || selectedClassItem
    )
  }, [realClassCards, selectedClassItem])

  // Unique class names and sections for filter dropdowns (from real data)
  const uniqueClassNames = useMemo(() => Array.from(new Set(realClassCards.map(c => c.className))), [realClassCards])
  const uniqueSections = useMemo(() => Array.from(new Set(realClassCards.map(c => c.section))), [realClassCards])

  // Filtered Classes for Screen 1
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

  // Color palette cycled for subject cards
  const SUBJECT_COLORS = [
    { bgColor: 'bg-sky-50 hover:bg-sky-100/90', borderColor: 'border-sky-200/80', textColor: 'text-sky-950', badgeColor: 'bg-sky-100 text-sky-800' },
    { bgColor: 'bg-emerald-50 hover:bg-emerald-100/90', borderColor: 'border-emerald-200/80', textColor: 'text-emerald-950', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { bgColor: 'bg-rose-50 hover:bg-rose-100/90', borderColor: 'border-rose-200/80', textColor: 'text-rose-950', badgeColor: 'bg-rose-100 text-rose-800' },
    { bgColor: 'bg-amber-50 hover:bg-amber-100/90', borderColor: 'border-amber-200/80', textColor: 'text-amber-950', badgeColor: 'bg-amber-100 text-amber-800' },
    { bgColor: 'bg-purple-50 hover:bg-purple-100/90', borderColor: 'border-purple-200/80', textColor: 'text-purple-950', badgeColor: 'bg-purple-100 text-purple-800' },
    { bgColor: 'bg-orange-50 hover:bg-orange-100/90', borderColor: 'border-orange-200/80', textColor: 'text-orange-950', badgeColor: 'bg-orange-100 text-orange-800' },
    { bgColor: 'bg-teal-50 hover:bg-teal-100/90', borderColor: 'border-teal-200/80', textColor: 'text-teal-950', badgeColor: 'bg-teal-100 text-teal-800' },
    { bgColor: 'bg-indigo-50 hover:bg-indigo-100/90', borderColor: 'border-indigo-200/80', textColor: 'text-indigo-950', badgeColor: 'bg-indigo-100 text-indigo-800' },
  ]

  // Real subjects for the selected class (Screen 2)
  const classSubjects = useMemo<SubjectItem[]>(() => {
    const activeSubjects = subjectsData.filter(
      (s: any) => !s.deleted && s.subjectName &&
        s.className?.toLowerCase() === activeClassItem.className?.toLowerCase()
    )
    if (activeSubjects.length === 0) return DEFAULT_SUBJECTS.filter(() => false) // empty — no fallback
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
      ...SUBJECT_COLORS[idx % SUBJECT_COLORS.length],
    }))
  }, [subjectsData, activeClassItem, registeredTeachers])

  // Filtered Tasks for Screen 3
  const currentSubjectTasks = useMemo(() => {
    return tasksList.filter(t => 
      t.subject === selectedSubjectItem.subjectName &&
      t.classes === activeClassItem.className &&
      t.section === activeClassItem.section
    )
  }, [tasksList, selectedSubjectItem, activeClassItem])

  // Real enrolled students for the selected class & section (Screen 4)
  const classStudents = useMemo(() => {
    const matched = allStudents.filter(s =>
      matchesClassAndSection(s, activeClassItem.className, activeClassItem.section)
    )

    if (matched.length === 0) {
      if (allStudents.length === 0) return DEFAULT_STUDENTS
      return []
    }

    return matched.map((s: any, idx: number) => {
      const firstName = s.firstName || s.first_name || ''
      const lastName = s.lastName || s.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim() || s.name || 'Student'
      return {
        id: String(s.id || `st-${idx}`),
        name: fullName,
        rollNo: String(s.rollNo || s.roll_no || `${idx + 1}`),
        admissionNo: String(s.admissionNo || s.admission_no || `ADM-${1000 + idx}`),
        avatar: (s.avatar && typeof s.avatar === 'string' && s.avatar.trim() !== '')
          ? s.avatar
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`
      }
    })
  }, [allStudents, activeClassItem])

  // Combine enrolled students with live task submission status from database
  const studentsWithStatus = useMemo(() => {
    return classStudents.map(st => {
      const sub = taskSubmissions[st.id] || taskSubmissions[st.admissionNo] || taskSubmissions[st.rollNo]
      const status: 'Submitted' | 'Pending' = sub?.status ? sub.status : 'Pending'
      return {
        ...st,
        status,
        submittedAt: sub?.submittedAt,
        remark: sub?.remark
      }
    })
  }, [classStudents, taskSubmissions])

  // Screen 4 status counters
  const statusCounters = useMemo(() => {
    const total = studentsWithStatus.length
    const submitted = studentsWithStatus.filter(s => s.status === 'Submitted').length
    const pending = total - submitted
    return { total, submitted, pending }
  }, [studentsWithStatus])

  // Filtered Students for Screen 4
  const filteredStudents = useMemo(() => {
    return studentsWithStatus.filter(s => {
      if (studentStatusFilter !== 'All' && s.status !== studentStatusFilter) return false
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase()
        const matchName = s.name.toLowerCase().includes(q)
        const matchRoll = s.rollNo.includes(q)
        const matchAdm = s.admissionNo.toLowerCase().includes(q)
        if (!matchName && !matchRoll && !matchAdm) return false
      }
      return true
    })
  }, [studentsWithStatus, studentSearch, studentStatusFilter])

  // Handler: Step 1 -> Step 2
  const handleSelectClass = (cls: ClassCardItem) => {
    setSelectedClassItem(cls)
    setCurrentStep('subjects')
  }

  // Handler: Step 2 -> Step 3
  const handleSelectSubject = (sub: SubjectItem) => {
    setSelectedSubjectItem(sub)
    setCurrentStep('tasks')
  }

  // Handler: Step 3 -> Step 4 (Fetch task submissions from DB institutewise)
  const handleOpenAssignedStudents = async (task: TaskItem) => {
    setSelectedTaskItem(task)
    setStudentSearch('')
    setStudentStatusFilter('All')
    setSelectedStudentIds([])
    setCurrentStep('students')

    // 1. Instant local storage cache lookup
    try {
      const cached = localStorage.getItem(`hw_sub_${task.id}`)
      if (cached) {
        setTaskSubmissions(JSON.parse(cached))
      } else {
        setTaskSubmissions({})
      }
    } catch {
      setTaskSubmissions({})
    }

    // 2. Fetch submissions from PostgreSQL DB scoped to institution_id
    try {
      const res = await fetchTaskSubmissions(task.id)
      if (res && res.success && Array.isArray(res.data)) {
        const subMap: Record<string, any> = {}
        res.data.forEach((s: any) => {
          subMap[String(s.studentId)] = {
            status: s.status,
            remark: s.remark,
            submittedAt: s.submittedAt
          }
        })
        setTaskSubmissions(prev => {
          const merged = { ...prev, ...subMap }
          try {
            localStorage.setItem(`hw_sub_${task.id}`, JSON.stringify(merged))
          } catch {}
          return merged
        })
      }
    } catch (e) {
      console.error('Failed to load task submissions from DB:', e)
    }
  }

  // Handler: One-by-one student status update (Direct 1-click toggle, saves to DB)
  const handleToggleSingleStudentStatus = async (student: any, explicitStatus?: 'Submitted' | 'Pending') => {
    const nextStatus: 'Submitted' | 'Pending' = explicitStatus || (student.status === 'Submitted' ? 'Pending' : 'Submitted')
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Optimistic UI update
    const updatedSubmissions = {
      ...taskSubmissions,
      [student.id]: {
        ...(taskSubmissions[student.id] || {}),
        status: nextStatus,
        submittedAt: nextStatus === 'Submitted' ? nowStr : undefined
      }
    }
    setTaskSubmissions(updatedSubmissions)
    try {
      localStorage.setItem(`hw_sub_${selectedTaskItem.id}`, JSON.stringify(updatedSubmissions))
    } catch {}

    showToast(`${student.name} marked as "${nextStatus}" (Saved in DB)`)

    // Persist in DB scoped to institution
    try {
      await updateStudentTaskSubmission(
        selectedTaskItem.id,
        student.id,
        nextStatus,
        {
          studentName: student.name,
          admissionNo: student.admissionNo,
          rollNo: student.rollNo
        }
      )
    } catch (err) {
      console.error('Failed to persist student status in DB:', err)
    }
  }

  // Multi-select toggle handlers
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

  // Handler: Multiple student status update (Bulk update, saves all to DB)
  const handleBulkUpdateStatus = async (targetStatus: 'Submitted' | 'Pending') => {
    if (selectedStudentIds.length === 0) return
    setIsUpdatingSubmissions(true)

    const selectedSet = new Set(selectedStudentIds)
    const targetStudents = studentsWithStatus.filter(s => selectedSet.has(s.id))
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Optimistic UI update
    const nextSubmissions = { ...taskSubmissions }
    targetStudents.forEach(st => {
      nextSubmissions[st.id] = {
        ...(nextSubmissions[st.id] || {}),
        status: targetStatus,
        submittedAt: targetStatus === 'Submitted' ? nowStr : undefined
      }
    })
    setTaskSubmissions(nextSubmissions)
    try {
      localStorage.setItem(`hw_sub_${selectedTaskItem.id}`, JSON.stringify(nextSubmissions))
    } catch {}

    const count = targetStudents.length
    showToast(`Updated ${count} student${count > 1 ? 's' : ''} to "${targetStatus}" in database!`)
    setSelectedStudentIds([])

    // Persist batch to DB institutewise
    try {
      await bulkUpdateStudentTaskSubmissions(
        selectedTaskItem.id,
        targetStudents.map(st => ({
          studentId: st.id,
          studentName: st.name,
          admissionNo: st.admissionNo,
          rollNo: st.rollNo
        })),
        targetStatus
      )
    } catch (err) {
      console.error('Failed to bulk update submissions in DB:', err)
    } finally {
      setIsUpdatingSubmissions(false)
    }
  }

  // Handler: Create New Task in Step 3 (Persisted in DB & localStorage)
  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const formatDisplay = (dStr: string) => {
      if (!dStr) return ''
      try {
        const parts = dStr.split('-')
        if (parts.length === 3) {
          const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
          return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        }
        return dStr
      } catch {
        return dStr
      }
    }

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDesc || 'Complete the assigned exercises in your notebook.',
      subject: selectedSubjectItem.subjectName,
      classes: activeClassItem.className,
      section: activeClassItem.section,
      status: 'Active',
      hasAttachment: !!newTaskAttachmentName,
      attachmentName: newTaskAttachmentName || undefined,
      assignedBy: `${selectedSubjectItem.teacherName} (Faculty)`,
      assignDate: formatDisplay(newTaskAssignDate),
      submissionDate: formatDisplay(newTaskDueDate),
      studentsCount: activeClassItem.studentsCount
    }

    setTasksList(prev => {
      const updated = [newTask, ...prev]
      try {
        localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
      } catch {}
      return updated
    })
    setCreateTaskModalOpen(false)
    setNewTaskTitle('')
    setNewTaskDesc('')
    setNewTaskAssignDate(todayYMD)
    setNewTaskDueDate(defaultDueYMD)
    handleRemoveAttachment()
    showToast(`Task "${newTask.title}" saved to database!`)

    // Save to PostgreSQL DB institutewise
    try {
      await createHomeworkTask(newTask)
    } catch (err) {
      console.error('Failed to save task to DB:', err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-xl transition-all animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb & Hub Quick Tabs (Desktop View) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/institute/homework" className="hover:text-teal-600 transition-colors">
              Homework
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => setCurrentStep('classes')}
              className={`${currentStep === 'classes' ? 'text-teal-600 font-bold' : 'hover:text-slate-800'}`}
            >
              Assign Homework
            </button>
            {currentStep !== 'classes' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setCurrentStep('subjects')}
                  className={`${currentStep === 'subjects' ? 'text-teal-600 font-bold' : 'hover:text-slate-800'}`}
                >
                  {selectedClassItem.className} (Sec {selectedClassItem.section})
                </button>
              </>
            )}
            {(currentStep === 'tasks' || currentStep === 'students') && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setCurrentStep('tasks')}
                  className={`${currentStep === 'tasks' ? 'text-teal-600 font-bold' : 'hover:text-slate-800'}`}
                >
                  {selectedSubjectItem.subjectName}
                </button>
              </>
            )}
            {currentStep === 'students' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-teal-600 font-bold">Assigned Students</span>
              </>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-200/60">
              <GraduationCap className="w-6 h-6" />
            </span>
            {currentStep === 'classes' && 'Assign Homework'}
            {currentStep === 'subjects' && `Select Subject • ${selectedClassItem.className} (${selectedClassItem.section})`}
            {currentStep === 'tasks' && `${selectedSubjectItem.subjectName} Tasks`}
            {currentStep === 'students' && `Assigned Students • ${selectedTaskItem.title}`}
          </h1>
        </div>

        {/* Quick Nav Dropdown Pill Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/institute/homework/assign"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white shadow-sm"
          >
            Assign Homework
          </Link>
          <Link
            href="/institute/homework/remark"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Remark Homework
          </Link>
          <Link
            href="/institute/homework/pending-assign"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Pending Assign
          </Link>
          <Link
            href="/institute/homework/pending-remark"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Pending Remark
          </Link>
          <Link
            href="/institute/homework/report"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Homework Report
          </Link>
        </div>
      </div>

      {/* =========================================================================
          SCREEN 1: SELECT CLASS TO ASSIGN (Full Desktop View)
          ========================================================================= */}
      {currentStep === 'classes' && (
        <div className="space-y-6">
          {/* Top Desktop Controls Bar: Date Strip + Class/Section Dropdowns */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-5">
            {/* Date Carousel Strip */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Assign Date:
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/60">
                  Thursday, 22 Oct 2026
                </span>
              </div>

              {/* 7-Days Carousel */}
              <div className="flex items-center gap-2 self-center sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200/80"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  {weekDays.map(item => {
                    const isSelected = item.dayNumber === selectedDayNumber
                    return (
                      <button
                        key={item.dayNumber}
                        type="button"
                        onClick={() => setSelectedDayNumber(item.dayNumber)}
                        className={`flex flex-col items-center justify-center py-2 px-3 sm:px-4 rounded-xl transition-all ${
                          isSelected 
                            ? 'bg-teal-600 text-white shadow-md font-bold scale-105' 
                            : 'text-slate-600 hover:bg-slate-100 bg-slate-50 border border-slate-200/60'
                        }`}
                      >
                        <span className={`text-sm sm:text-base font-extrabold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          {item.dayNumber}
                        </span>
                        <span className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                          {item.dayName}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200/80"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Dropdowns & Quick Search Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Class
                </label>
                <select
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="All">All Classes</option>
                  {uniqueClassNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Section
                </label>
                <select
                  value={filterSection}
                  onChange={e => setFilterSection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="All">All Sections</option>
                  {uniqueSections.map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Search Class or Teacher
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by class name, section, or teacher..."
                    value={searchClassQuery}
                    onChange={e => setSearchClassQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Heading & Grid Stats */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Select Class to Assign
              </h2>
              <p className="text-xs text-slate-500">
                Choose a class to view and assign subjects and homework exercises
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
              {filteredClasses.length} Classes Available
            </span>
          </div>

          {/* Class Cards Desktop Grid (Responsive 1/2/3/4 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredClasses.map(cls => (
              <div
                key={cls.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                      <Users className="w-3.5 h-3.5" />
                      <span>{cls.studentsCount} {cls.studentsCount === 1 ? 'Student' : 'Students'}</span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base group-hover:text-teal-700 transition-colors">
                    {cls.className} - Section {cls.section}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Class Teacher: <span className="font-semibold text-slate-700">{cls.classTeacher || '—'}</span>
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleSelectClass(cls)}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm inline-flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    Assign Homework
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: SELECT SUBJECT (Full Desktop View)
          ========================================================================= */}
      {currentStep === 'subjects' && (
        <div className="space-y-6">
          {/* Class Summary Banner across Desktop */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep('classes')}
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
                title="Back to Class Selection"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-extrabold text-slate-900 text-lg">
                    {activeClassItem.className}
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-teal-600 text-white shadow-xs">
                    Section {activeClassItem.section}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Class Teacher: <span className="font-semibold text-slate-700">{activeClassItem.classTeacher || '—'}</span> • {activeClassItem.studentsCount} {activeClassItem.studentsCount === 1 ? 'Student' : 'Students'} Enrolled
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/60">
                {classSubjects.length} Subjects Assigned
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep('classes')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Change Class
              </button>
            </div>
          </div>

          {/* Section Heading */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Subjects for {activeClassItem.className} (Sec {activeClassItem.section})
              </h3>
              <p className="text-xs text-slate-500">
                Select a subject to view its curriculum tasks or create a new homework assignment
              </p>
            </div>
          </div>

          {/* Subjects Desktop Grid (Responsive 2 or 3 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {classSubjects.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <p className="text-base font-bold text-slate-700">No subjects assigned to this class</p>
                <p className="text-xs text-slate-400 mt-1">Go to Masters &gt; Subjects and assign subjects to <span className="font-semibold">{selectedClassItem.className}</span></p>
              </div>
            ) : classSubjects.map(sub => (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleSelectSubject(sub)}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between shadow-xs hover:shadow-md active:scale-[0.99] group ${sub.bgColor} ${sub.borderColor}`}
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base group-hover:text-teal-800 transition-colors">
                    Subject : {sub.subjectName}
                  </h4>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/90 text-slate-700 shadow-2xs border border-slate-200/40">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Teacher : <span className="font-bold">{sub.teacherName}</span>
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-white/90 flex items-center justify-center text-slate-500 shadow-2xs shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: SUBJECT TASKS (Full Desktop View)
          ========================================================================= */}
      {currentStep === 'tasks' && (
        <div className="space-y-6">
          {/* Top Subject Summary Banner */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep('subjects')}
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
                title="Back to Subjects"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-extrabold text-slate-900 text-lg">
                    {selectedSubjectItem.subjectName} Tasks
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                    Academic Year 2026
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedClassItem.className} - Section {selectedClassItem.section} • Teacher: <span className="font-semibold text-slate-700">{selectedSubjectItem.teacherName}</span>
                </p>
              </div>
            </div>

            {/* Desktop Action: Create Task Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCreateTaskModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Create New Task
              </button>
            </div>
          </div>

          {/* Section Heading & Count */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Assigned Tasks List
              </h3>
              <p className="text-xs text-slate-500">
                Review assigned homework tasks, attachments, due dates, and student submissions
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
              {currentSubjectTasks.length} Total Tasks
            </span>
          </div>

          {/* Tasks Desktop Grid (Responsive 1 or 2 cols) */}
          {currentSubjectTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">No tasks assigned for {selectedSubjectItem.subjectName}</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Click &quot;Create New Task&quot; above to publish homework for {selectedClassItem.className} (Sec {selectedClassItem.section}).
              </p>
              <button
                type="button"
                onClick={() => setCreateTaskModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create First Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {currentSubjectTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Status & Attachment badges */}
                    <div className="flex items-center justify-between">
                      {task.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          Closed
                        </span>
                      )}

                      {task.hasAttachment && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                          <Paperclip className="w-3.5 h-3.5 text-sky-600" />
                          Attachment Included
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    {/* Assigned By */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assigned by:</span>
                      <span className="font-bold text-slate-700">{task.assignedBy}</span>
                    </div>

                    {/* Attachment File Box */}
                    {task.hasAttachment && task.attachmentName && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50/60 border border-sky-200/60 text-xs text-sky-800 font-semibold">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                          <span className="truncate">{task.attachmentName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Downloading attachment: ${task.attachmentName}`)}
                          className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-[11px] transition-colors"
                        >
                          View
                        </button>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Assign Date:</span>
                        <span className="font-bold text-slate-700">{task.assignDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-orange-600 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        <span>Due:</span>
                        <span>{task.submissionDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{task.studentsCount} Students Assigned</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAssignedStudents(task)}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Assigned Students
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Task Modal */}
          {createTaskModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
                {/* Modal Header */}
                <div className="px-6 py-4.5 bg-teal-600 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">Create New Homework Task</h3>
                      <p className="text-[11px] text-teal-100/90 font-medium mt-0.5">Publish assignment for students</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreateTaskModalOpen(false)}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateTaskSubmit} className="p-6 space-y-4 overflow-y-auto">
                  {/* Subject & Class Information Pill */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                      <span className="font-extrabold text-slate-900 truncate">
                        {selectedSubjectItem.subjectName}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-medium text-slate-500 truncate">
                        {selectedSubjectItem.teacherName}
                      </span>
                    </div>
                    <span className="font-bold text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-lg shrink-0">
                      {activeClassItem.className} (Sec {activeClassItem.section})
                    </span>
                  </div>

                  {/* Task Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Chapter 4: Linear Equations Exercise 4.2"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Instructions / Description
                    </label>
                    <textarea
                      rows={3}
                      value={newTaskDesc}
                      onChange={e => setNewTaskDesc(e.target.value)}
                      placeholder="Solve questions from chapter review. Show all steps clearly in homework notebook..."
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                    />
                  </div>

                  {/* Assign Date and Due Date (Native Date Pickers) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Assign Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={newTaskAssignDate}
                        onChange={e => setNewTaskAssignDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        Due Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        min={newTaskAssignDate}
                        value={newTaskDueDate}
                        onChange={e => setNewTaskDueDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Proper File Attachment Component */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                        Attach Homework Document / Worksheet
                      </span>
                      <span className="text-[11px] font-normal text-slate-400">Optional</span>
                    </label>

                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {newTaskAttachmentName ? (
                      /* File Attached Preview Card */
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs animate-in fade-in">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <FileText className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-xs">{newTaskAttachmentName}</p>
                            <p className="text-[11px] text-teal-700 font-semibold">{newTaskAttachmentSize || 'File Attached'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveAttachment}
                            className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                            title="Remove attachment"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop / Click to Upload Box */
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                          e.preventDefault()
                          const file = e.dataTransfer.files?.[0]
                          if (file) {
                            setNewTaskAttachmentName(file.name)
                            const sizeKb = file.size / 1024
                            const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`
                            setNewTaskAttachmentSize(sizeStr)
                          }
                        }}
                        className="border-2 border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 rounded-2xl p-4 text-center cursor-pointer transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-teal-100 group-hover:text-teal-700 text-slate-400 flex items-center justify-center mx-auto mb-2 transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-700 group-hover:text-teal-800 transition-colors">
                          Click to browse or drag & drop file here
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF worksheets, assignment DOCX, notes or images</p>
                      </div>
                    )}
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setCreateTaskModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Publish Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SCREEN 4: ASSIGNED STUDENTS (Full Desktop View)
          ========================================================================= */}
      {currentStep === 'students' && (
        <div className="space-y-6">
          {/* Task Info Summary Header */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep('tasks')}
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
                title="Back to Tasks"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg">
                  {selectedTaskItem.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedTaskItem.classes} - Section {selectedTaskItem.section} • Subject: <span className="font-bold text-slate-700">{selectedTaskItem.subject}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-2 bg-teal-50 px-3.5 py-2 rounded-xl border border-teal-200/80 text-teal-800">
                <Database className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-bold">Institute DB Synced</span>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assigned:</span>
                  <span className="font-bold text-slate-800">{selectedTaskItem.assignDate}</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1.5 text-orange-600 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>Due:</span>
                  <span>{selectedTaskItem.submissionDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky / Top Floating Bulk Action Bar (When multiple students are selected) */}
          {selectedStudentIds.length > 0 && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-extrabold text-sm border border-teal-500/30">
                  {selectedStudentIds.length}
                </span>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{selectedStudentIds.length} Students Selected for Bulk Update</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 font-normal">
                      Multiple Update
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Apply status changes to all selected students in database instantly
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  disabled={isUpdatingSubmissions}
                  onClick={() => handleBulkUpdateStatus('Submitted')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  {isUpdatingSubmissions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Mark Selected as Submitted
                </button>
                <button
                  type="button"
                  disabled={isUpdatingSubmissions}
                  onClick={() => handleBulkUpdateStatus('Pending')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  {isUpdatingSubmissions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                  Mark Selected as Pending
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds([])}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Toolbar: Search, Select All, and Status Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto flex-1">
              {/* Select All Checkbox Button */}
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

              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name, roll number, admission..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Filter Tabs with Dynamic Counters */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('All')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    studentStatusFilter === 'All'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>All</span>
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-slate-200/80 text-slate-700 font-bold">
                    {statusCounters.total}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('Submitted')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    studentStatusFilter === 'Submitted'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-teal-800'
                  }`}
                >
                  <span>Submitted</span>
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-teal-100 text-teal-800 font-bold">
                    {statusCounters.submitted}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('Pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    studentStatusFilter === 'Pending'
                      ? 'bg-white text-amber-800 shadow-xs'
                      : 'text-slate-600 hover:text-amber-800'
                  }`}
                >
                  <span>Pending</span>
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-amber-100 text-amber-800 font-bold">
                    {statusCounters.pending}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Students Desktop Grid (Responsive 1/2/3/4 cols) with Multiple and One-by-One Task Update */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">No Students Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {studentSearch.trim()
                  ? `No students matching "${studentSearch}". Try clearing search.`
                  : `No students in ${activeClassItem.className} (Sec ${activeClassItem.section}) matching filter "${studentStatusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStudents.map(student => {
                const isSelected = selectedStudentIds.includes(student.id)
                const isSubmitted = student.status === 'Submitted'

                return (
                  <div
                    key={student.id}
                    className={`bg-white rounded-2xl p-4 shadow-sm border transition-all flex flex-col justify-between gap-3 hover:shadow-md ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/15'
                        : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Checkbox for Multiple / Bulk selection */}
                      <button
                        type="button"
                        onClick={() => handleToggleStudentSelection(student.id)}
                        className="mt-1 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-700 transition-colors shrink-0"
                        title="Select for multiple task update"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-teal-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                        )}
                      </button>

                      {/* Student Avatar & Basic Info */}
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">
                          {student.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            Roll: {student.rollNo}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono truncate">
                            {student.admissionNo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status & One-by-One Update Action */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-slate-400">
                        Task Status:
                      </span>

                      {/* One-by-One direct 1-click status update button */}
                      {isSubmitted ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleSingleStudentStatus(student, 'Pending')}
                            className="group px-2.5 py-1 rounded-xl text-[11px] font-bold bg-teal-50 hover:bg-red-50 text-teal-700 hover:text-red-700 border border-teal-200 hover:border-red-200 shrink-0 inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                            title="Click to change status to Pending"
                          >
                            <Check className="w-3.5 h-3.5 text-teal-600 group-hover:hidden" />
                            <RotateCcw className="w-3.5 h-3.5 text-red-500 hidden group-hover:inline" />
                            <span className="group-hover:hidden">Submitted</span>
                            <span className="hidden group-hover:inline">Mark Pending</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleSingleStudentStatus(student, 'Submitted')}
                            className="group px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 hover:bg-teal-600 text-amber-800 hover:text-white border border-amber-200 hover:border-teal-600 shrink-0 inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                            title="Click to mark Submitted (Done)"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-600 group-hover:hidden" />
                            <Check className="w-3.5 h-3.5 text-white hidden group-hover:inline" />
                            <span className="group-hover:hidden">Pending</span>
                            <span className="hidden group-hover:inline">Mark Done</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

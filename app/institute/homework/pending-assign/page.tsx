'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { 
  ChevronLeft, ChevronRight, Users, GraduationCap, 
  Calendar, FileText, Paperclip, Plus, Search, Check, 
  X, ArrowLeft, Clock, CheckCircle2, User, BookOpen, AlertCircle,
  Filter, Sparkles, Download, Eye, ChevronDown, Upload,
  CheckSquare, Square, Database, RotateCcw, Loader2, CloudUpload
} from 'lucide-react'
import Link from 'next/link'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'
import { fetchStudents } from '@/app/institute/students/actions'
import { fetchTeachers } from '@/app/institute/teachers/actions'
import { 
  fetchHomeworkTasks, 
  createHomeworkTask 
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

interface PendingDateItem {
  id: string
  dayNumber: string
  dayName: string
  monthName: string
  year: string
  fullDate: string
}

// Generate default pending past dates matching Screenshot 1
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

export default function PendingAssignHomeworkPage() {
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  // Real students & registered teachers
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [registeredTeachers, setRegisteredTeachers] = useState<any[]>([])

  // Screen flow: 'dates' (Screenshot 1) -> 'classes' (Screenshot 4) -> 'subjects' (Screenshot 2) -> 'form' (Screenshot 3)
  const [currentStep, setCurrentStep] = useState<'dates' | 'classes' | 'subjects' | 'form'>('dates')

  // Screen 1: Selected Pending Date
  const [selectedPendingDate, setSelectedPendingDate] = useState<PendingDateItem>(DEFAULT_PENDING_DATES[0])
  const [monthFilter, setMonthFilter] = useState<string>('All')
  const [customDateInput, setCustomDateInput] = useState<string>('')

  // Screen 2: Classes filter
  const [selectedClassItem, setSelectedClassItem] = useState<ClassCardItem>(DEFAULT_CLASSES[0])
  const [filterClass, setFilterClass] = useState<string>('All')
  const [filterSection, setFilterSection] = useState<string>('All')
  const [searchClassQuery, setSearchClassQuery] = useState<string>('')

  // Screen 3: Subjects
  const [selectedSubjectItem, setSelectedSubjectItem] = useState<SubjectItem>(DEFAULT_SUBJECTS[0])

  // Screen 4: Form state matching Screenshot 3
  const [taskTitle, setTaskTitle] = useState<string>('')
  const [taskDescription, setTaskDescription] = useState<string>('')
  const [taskDueDate, setTaskDueDate] = useState<string>(() => {
    return new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  })
  const [attachmentName, setAttachmentName] = useState<string>('')
  const [attachmentSize, setAttachmentSize] = useState<string>('')
  const [assignTarget, setAssignTarget] = useState<'entire' | 'specific'>('entire')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Load real students and teachers
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

  // Build real class cards from masters data with live student counts
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

  // Keep selectedClassItem synchronized
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

  // Real enrolled students for selected class & section (for specific students selection)
  const classStudents = useMemo(() => {
    const matched = allStudents.filter(s =>
      matchesClassAndSection(s, activeClassItem.className, activeClassItem.section)
    )

    return matched.map((s: any, idx: number) => {
      const firstName = s.firstName || s.first_name || ''
      const lastName = s.lastName || s.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim() || s.name || 'Student'

      return {
        id: String(s.id || s.admission_no || s.admissionNo || `st-${idx}`),
        name: fullName,
        rollNo: String(s.rollNo || s.roll_no || `${idx < 9 ? '0' : ''}${idx + 1}`),
        admissionNo: String(s.admissionNo || s.admission_no || `ADM-${1000 + idx}`)
      }
    })
  }, [allStudents, activeClassItem])

  // Filtered dates list
  const filteredPendingDates = useMemo(() => {
    if (monthFilter === 'All') return DEFAULT_PENDING_DATES
    return DEFAULT_PENDING_DATES.filter(d => d.monthName.toLowerCase() === monthFilter.toLowerCase())
  }, [monthFilter])

  // Handlers for step transitions
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

  const handleSelectSubject = (sub: SubjectItem) => {
    setSelectedSubjectItem(sub)
    setCurrentStep('form')
  }

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachmentName(file.name)
      const sizeKb = file.size / 1024
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`
      setAttachmentSize(sizeStr)
    }
  }

  const handleRemoveAttachment = () => {
    setAttachmentName('')
    setAttachmentSize('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Submit Homework for Pending Date
  const handleSubmitPendingHomework = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) {
      alert('Please enter assignment title')
      return
    }

    setIsSubmitting(true)

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

    const newTask = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      description: taskDescription.trim() || 'Complete the assigned exercises in your notebook.',
      subject: activeSubjectItem.subjectName,
      classes: activeClassItem.className,
      section: activeClassItem.section,
      status: 'Active' as const,
      hasAttachment: !!attachmentName,
      attachmentName: attachmentName || undefined,
      assignedBy: `${activeSubjectItem.teacherName} (Faculty)`,
      assignDate: `${selectedPendingDate.dayNumber} ${selectedPendingDate.monthName.slice(0, 3)} ${selectedPendingDate.year}`,
      submissionDate: formatDisplay(taskDueDate),
      studentsCount: activeClassItem.studentsCount
    }

    // 1. Cache to shared localStorage
    try {
      const existingRaw = localStorage.getItem('school_homework_tasks')
      const existing = existingRaw ? JSON.parse(existingRaw) : []
      localStorage.setItem('school_homework_tasks', JSON.stringify([newTask, ...existing]))
    } catch {}

    // 2. Persist in Neon PostgreSQL database institutewise
    try {
      await createHomeworkTask(newTask)
      showToast(`Homework published for pending date ${newTask.assignDate} in database!`)
      // Reset form
      setTaskTitle('')
      setTaskDescription('')
      handleRemoveAttachment()
      setAssignTarget('entire')
      setSelectedStudentIds([])
      // Return to dates screen
      setCurrentStep('dates')
    } catch (err) {
      console.error('Failed to save pending homework in DB:', err)
      showToast('Task saved locally.')
      setCurrentStep('dates')
    } finally {
      setIsSubmitting(false)
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

      {/* Top Emerald Header matching Screenshots */}
      <div className="bg-teal-600 text-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (currentStep === 'form') setCurrentStep('subjects')
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
                {currentStep === 'dates' && 'Pending Assign Homework'}
                {currentStep === 'classes' && 'Pending Assign Homework'}
                {currentStep === 'subjects' && 'Select Subject'}
                {currentStep === 'form' && 'Assign Homework'}
              </h1>
              <p className="text-xs text-teal-100/80 font-medium">
                {currentStep === 'dates' && 'Pick a pending or missed date to assign homework'}
                {currentStep === 'classes' && `Assigning for ${selectedPendingDate.dayNumber} ${selectedPendingDate.monthName} ${selectedPendingDate.year}`}
                {currentStep === 'subjects' && `${activeClassItem.className} (Sec ${activeClassItem.section})`}
                {currentStep === 'form' && `${activeSubjectItem.subjectName} • ${activeClassItem.className} - ${activeClassItem.section}`}
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
          SCREEN 1: SELECT PENDING DATE (Screenshot 1)
          ========================================================================= */}
      {currentStep === 'dates' && (
        <div className="space-y-5">
          {/* Section Header with Month Dropdown & Custom Date Picker matching Screenshot 1 */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Select Date
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pick a pending date to assign homework
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Custom Date Input for ANY missed date */}
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

              {/* Month Dropdown matching Screenshot 1 */}
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

          {/* Grid of Pending Dates matching Screenshot 1 */}
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
          SCREEN 2: SELECT CLASS TO ASSIGN FOR CHOSEN DATE (Screenshot 4)
          ========================================================================= */}
      {currentStep === 'classes' && (
        <div className="space-y-5">
          {/* Pending Assign Date Pill Card matching Screenshot 4 */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Pending Assign Date</p>
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

          {/* Filters: Class, Section Dropdowns & Search */}
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

          {/* Section Heading */}
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Select Class to Assign
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {filteredClasses.length} Available
            </span>
          </div>

          {/* Class Cards List matching Screenshot 4 */}
          <div className="space-y-4">
            {filteredClasses.map(cls => (
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
                      <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Class Teacher:</span>
                        <span className="font-bold text-slate-700">{cls.classTeacher || 'Assigned Faculty'}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs inline-flex items-center gap-1.5 shrink-0 border border-blue-100">
                    <Users className="w-3.5 h-3.5" />
                    {cls.studentsCount} {cls.studentsCount === 1 ? 'Student' : 'Students'}
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSelectClass(cls)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Assign Homework</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: SELECT SUBJECT (Screenshot 2)
          ========================================================================= */}
      {currentStep === 'subjects' && (
        <div className="space-y-5">
          {/* Class Header Card matching Screenshot 2 */}
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

          {/* Section Heading */}
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

          {/* Subject Items List matching Screenshot 2 */}
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
          SCREEN 4: ASSIGN HOMEWORK FORM FOR PENDING DATE (Screenshot 3)
          ========================================================================= */}
      {currentStep === 'form' && (
        <div className="space-y-5">
          {/* Class & Subject Selected Banner matching Screenshot 3 */}
          <div className="bg-teal-600 text-white rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white leading-tight">
                  {activeClassItem.className} - {activeClassItem.section}
                </h3>
                <p className="text-xs text-teal-100 font-medium mt-0.5">
                  Subject: {activeSubjectItem.subjectName}
                </p>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-2xl bg-white/20 text-white font-bold text-xs border border-white/30">
              Selected
            </span>
          </div>

          {/* Form Container matching Screenshot 3 */}
          <form onSubmit={handleSubmitPendingHomework} className="bg-white rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 space-y-4">
            {/* Title * */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="Enter assignment title"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={taskDescription}
                onChange={e => setTaskDescription(e.target.value)}
                placeholder="Enter detailed description"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
              />
            </div>

            {/* Submission Date * */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Submission Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={taskDueDate}
                  onChange={e => setTaskDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Attachment Box matching Screenshot 3 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Attachment
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                onChange={handleFileChange}
                className="hidden"
              />

              {attachmentName ? (
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{attachmentName}</p>
                      <p className="text-[11px] text-teal-700">{attachmentSize || 'Attached'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 group-hover:bg-teal-600 text-teal-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <CloudUpload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 group-hover:text-teal-600 transition-colors">
                    Tap to upload document, image, or PDF
                  </p>
                </div>
              )}
            </div>

            {/* Assign To Radio Buttons matching Screenshot 3 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Assign To
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="assignTarget"
                    value="entire"
                    checked={assignTarget === 'entire'}
                    onChange={() => setAssignTarget('entire')}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Entire Class</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="assignTarget"
                    value="specific"
                    checked={assignTarget === 'specific'}
                    onChange={() => setAssignTarget('specific')}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Specific Students</span>
                </label>
              </div>

              {/* If Specific Students chosen, list students checkboxes */}
              {assignTarget === 'specific' && (
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 max-h-48 overflow-y-auto">
                  {classStudents.map(st => (
                    <label key={st.id} className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(st.id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedStudentIds(prev => [...prev, st.id])
                          else setSelectedStudentIds(prev => prev.filter(x => x !== st.id))
                        }}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>{st.name} (Roll: {st.rollNo})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Homework Button matching Screenshot 3 */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                <span>Submit Homework</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import {
  ArrowLeft, ChevronLeft, ChevronRight, GraduationCap, Users, User,
  BookOpen, FileText, Paperclip, Calendar, Clock, Check, Plus,
  Search, Upload, X, Loader2, Sparkles, Send, Signal, Wifi,
  Battery, AlertCircle, CheckCircle2, ChevronDown, Download,
  Trash2, Eye, RefreshCw, Filter, Layers, CheckSquare, Star,
  Award, MessageSquare, XCircle, CalendarClock
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
  bulkUpdateStudentTaskSubmissions
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
  const [taskSubmissions, setTaskSubmissions] = useState<Record<string, { status: 'Submitted' | 'Pending' | 'Rescheduled'; remark: string; rating: number; submittedAt?: string }>>({})
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)

  // Page 1 Filters (Class & Section)
  const [filterClass, setFilterClass] = useState<string>('All')
  const [filterSection, setFilterSection] = useState<string>('All')

  // Page 4 Search & Filter (Students)
  const [studentSearch, setStudentSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'Pending'>('All')

  // Modal State for Individual Remark Editing
  const [remarkModalStudent, setRemarkModalStudent] = useState<StudentSubmissionItem | null>(null)
  const [modalRemarkText, setModalRemarkText] = useState('')
  const [modalRating, setModalRating] = useState<number>(5)
  const [modalStatus, setModalStatus] = useState<'Submitted' | 'Pending' | 'Rescheduled'>('Submitted')
  const [isSavingModal, setIsSavingModal] = useState(false)

  // Bulk Action Modal State
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [bulkSelectedStudentIds, setBulkSelectedStudentIds] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState<'Submitted' | 'Pending'>('Submitted')
  const [bulkRating, setBulkRating] = useState<number>(5)
  const [bulkRemarkText, setBulkRemarkText] = useState('')
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

  // Page 1: 7-Day Date Slider Strip matching Screenshot 1
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(() => new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date())

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

      const l1 = parseLocal('school_students')
      const l2 = parseLocal('school_institute_students')
      const l3 = parseLocal('students')
      const l4 = parseLocal('school_all_fees')
      const l5 = parseLocal('school_draft_students')
      const localCombined = [...l1, ...l2, ...l3, ...l4, ...l5]

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
          const map: Record<string, { status: 'Submitted' | 'Pending' | 'Rescheduled'; remark: string; rating: number; submittedAt?: string }> = {}
          res.data.forEach((row: any) => {
            const sid = String(row.studentId || row.student_id || row.admissionNo)
            const r = typeof row.rating === 'number' && row.rating >= 1 && row.rating <= 5 ? row.rating : 5
            map[sid] = {
              status: row.status === 'Submitted' ? 'Submitted' : (row.status === 'Rescheduled' ? 'Rescheduled' : 'Pending'),
              remark: row.remark || '',
              rating: r,
              submittedAt: row.submittedAt || undefined
            }
          })
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
                rating: s.rating || 5
              }
            })
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

          // Find tasks belonging to this class & section
          const classTasks = tasks.filter(t => matchesClassAndSection({ class: t.classes, section: t.section }, cName, sec))
          
          // Calculate completed submissions vs pending
          let completed = 0
          classTasks.forEach(t => {
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

          const pending = Math.max(0, studentCount - completed)

          const teacher = c.classTeacher || c.class_teacher || allTeachers.find((t: any) => {
            const tClass = String(t.class_teacher || t.className || t.class || '').toLowerCase()
            return tClass.includes(cName.toLowerCase())
          })?.name || 'Not Assigned'

          list.push({
            id: `${cName}-${sec}`,
            className: cName,
            section: sec,
            classTeacher: teacher,
            studentsCount: studentCount,
            completedCount: completed,
            pendingCount: pending,
            tasksCount: classTasks.length
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
        list.push({
          id: `${item.className}-${item.section}`,
          className: item.className,
          section: item.section,
          classTeacher: 'Not Assigned',
          studentsCount: item.count,
          completedCount: 0,
          pendingCount: item.count,
          tasksCount: 0
        })
      })
    }

    return list
  }, [classesData, allStudents, allTeachers, tasks])

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
        const teacher = s.teacherName || s.assignedTeacher || s.teacher || allTeachers.find((t: any) => t.subject?.toLowerCase() === subName.toLowerCase())?.name || 'Not Assigned'

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
        list.push({
          id: `task-sub-${idx}`,
          subjectName: t.subject,
          teacherName: t.assignedBy || 'Not Assigned',
          bgColor: presetColor.bgColor,
          borderColor: presetColor.borderColor,
          textColor: presetColor.textColor,
          badgeColor: presetColor.badgeColor
        })
      }
    })

    return list
  }, [subjectsData, allTeachers, tasks])

  // ── Subject Tasks for Page 3 (Matching Screenshot 3) ──
  const activeSubjectTasks = useMemo(() => {
    return tasks.filter(t => {
      const cMatch = t.classes.toLowerCase().trim() === selectedClass.toLowerCase().trim()
      const sMatch = t.section.toLowerCase().trim() === selectedSection.toLowerCase().trim()
      const subMatch = t.subject.toLowerCase().trim() === selectedSubject.toLowerCase().trim()
      return cMatch && sMatch && subMatch
    })
  }, [tasks, selectedClass, selectedSection, selectedSubject])

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
        submittedAt: sub?.submittedAt
      }
    })
  }, [activeTask, allStudents, taskSubmissions])

  // Search & Filtered Students for Page 4
  const filteredAssignedStudents = useMemo(() => {
    return assignedStudentsForActiveTask.filter(st => {
      if (statusFilter === 'Submitted' && st.status !== 'Submitted') return false
      if (statusFilter === 'Pending' && st.status !== 'Pending') return false

      if (!studentSearch.trim()) return true
      const q = studentSearch.toLowerCase().trim()
      return (
        st.name.toLowerCase().includes(q) ||
        st.rollNo.toLowerCase().includes(q) ||
        st.admissionNo.toLowerCase().includes(q)
      )
    })
  }, [assignedStudentsForActiveTask, statusFilter, studentSearch])

  // ── HANDLERS FOR STUDENT EVALUATION ──

  // Quick Status Toggle (Completed <-> Pending)
  const handleToggleStudentStatus = async (st: StudentSubmissionItem, newStatus: 'Submitted' | 'Pending' | 'Rescheduled') => {
    if (!activeTask) return

    // Optimistic UI update
    setTaskSubmissions(prev => ({
      ...prev,
      [st.studentId]: {
        ...prev[st.studentId],
        status: newStatus,
        remark: st.remark,
        rating: st.rating,
        submittedAt: newStatus === 'Submitted' ? new Date().toISOString() : undefined
      }
    }))

    try {
      await updateStudentTaskSubmission(activeTask.id, st.studentId, newStatus === 'Submitted' ? 'Submitted' : 'Pending', {
        studentName: st.name,
        admissionNo: st.admissionNo,
        rollNo: st.rollNo,
        remark: st.remark,
        rating: st.rating
      })

      // Update localStorage cache
      try {
        const raw = localStorage.getItem(`school_task_subs_${activeTask.id}`)
        let arr = raw ? JSON.parse(raw) : []
        const idx = arr.findIndex((x: any) => getStudentKey(x) === st.studentId)
        const updatedItem = { ...st, status: newStatus }
        if (idx >= 0) arr[idx] = updatedItem
        else arr.push(updatedItem)
        localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(arr))
      } catch (e) {}

      showToast(`${st.name} marked as ${newStatus === 'Submitted' ? 'Completed' : newStatus}!`, 'success')
    } catch (err: any) {
      console.error('Failed to update submission status:', err)
      showToast(err.message || 'Failed to update status', 'error')
    }
  }

  // Open Edit Remark Modal for individual student
  const handleOpenRemarkModal = (st: StudentSubmissionItem) => {
    setRemarkModalStudent(st)
    setModalRemarkText(st.remark || '')
    setModalRating(st.rating || 5)
    setModalStatus(st.status || 'Submitted')
  }

  // Save Modal Remark
  const handleSaveModalRemark = async () => {
    if (!activeTask || !remarkModalStudent) return

    setIsSavingModal(true)
    const stId = remarkModalStudent.studentId

    try {
      await updateStudentRemark(
        activeTask.id,
        stId,
        modalRemarkText,
        modalStatus === 'Submitted' ? 'Submitted' : 'Pending',
        modalRating,
        {
          studentName: remarkModalStudent.name,
          admissionNo: remarkModalStudent.admissionNo,
          rollNo: remarkModalStudent.rollNo
        }
      )

      setTaskSubmissions(prev => ({
        ...prev,
        [stId]: {
          status: modalStatus,
          remark: modalRemarkText,
          rating: modalRating
        }
      }))

      // Update localStorage
      try {
        const raw = localStorage.getItem(`school_task_subs_${activeTask.id}`)
        let arr = raw ? JSON.parse(raw) : []
        const idx = arr.findIndex((x: any) => getStudentKey(x) === stId)
        const updatedItem = {
          ...remarkModalStudent,
          status: modalStatus,
          remark: modalRemarkText,
          rating: modalRating
        }
        if (idx >= 0) arr[idx] = updatedItem
        else arr.push(updatedItem)
        localStorage.setItem(`school_task_subs_${activeTask.id}`, JSON.stringify(arr))
      } catch (e) {}

      showToast(`Remark & ${modalRating}★ rating saved for ${remarkModalStudent.name}!`, 'success')
      setRemarkModalStudent(null)
    } catch (err: any) {
      console.error('Failed to save remark:', err)
      showToast(err.message || 'Failed to save remark', 'error')
    } finally {
      setIsSavingModal(false)
    }
  }

  // Bulk Action Execution
  const handleExecuteBulkAction = async () => {
    if (!activeTask || bulkSelectedStudentIds.length === 0) {
      showToast('Please select students for bulk action.', 'error')
      return
    }

    setIsBulkSubmitting(true)
    try {
      const selectedStudents = assignedStudentsForActiveTask
        .filter(s => bulkSelectedStudentIds.includes(s.studentId))
        .map(s => ({
          studentId: s.studentId,
          studentName: s.name,
          admissionNo: s.admissionNo,
          rollNo: s.rollNo,
          remark: bulkRemarkText || s.remark,
          rating: bulkRating
        }))

      await bulkUpdateStudentTaskSubmissions(
        activeTask.id,
        selectedStudents,
        bulkStatus,
        bulkRemarkText,
        bulkRating
      )

      // Update state map
      setTaskSubmissions(prev => {
        const next = { ...prev }
        selectedStudents.forEach(st => {
          next[st.studentId] = {
            status: bulkStatus,
            remark: st.remark || '',
            rating: st.rating || 5
          }
        })
        return next
      })

      showToast(`Bulk evaluation applied to ${selectedStudents.length} students!`, 'success')
      setBulkModalOpen(false)
      setBulkSelectedStudentIds([])
      setBulkRemarkText('')
    } catch (err: any) {
      console.error('Bulk update error:', err)
      showToast(err.message || 'Failed to apply bulk remarks', 'error')
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 p-3 sm:p-5 md:p-8 space-y-6">

      {/* ── BREADCRUMB / TOP SUBMENU ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href="/institute/homework/assign" className="hover:text-teal-600 transition-colors">
            Homework
          </Link>
          <span>&gt;</span>
          <button
            type="button"
            onClick={() => setCurrentScreen('classes')}
            className={`cursor-pointer transition-colors ${currentScreen === 'classes' ? 'text-[#0f766e] font-black' : 'hover:text-teal-600'}`}
          >
            1. Classes
          </button>
          {selectedClass && (
            <>
              <span>&gt;</span>
              <button
                type="button"
                onClick={() => setCurrentScreen('subjects')}
                className={`cursor-pointer transition-colors ${currentScreen === 'subjects' ? 'text-[#0f766e] font-black' : 'hover:text-teal-600'}`}
              >
                2. {selectedClass} - Sec {selectedSection} (Subjects)
              </button>
            </>
          )}
          {selectedSubject && (
            <>
              <span>&gt;</span>
              <button
                type="button"
                onClick={() => setCurrentScreen('tasks')}
                className={`cursor-pointer transition-colors ${currentScreen === 'tasks' ? 'text-[#0f766e] font-black' : 'hover:text-teal-600'}`}
              >
                3. {selectedSubject} Tasks
              </button>
            </>
          )}
          {currentScreen === 'evaluation' && activeTask && (
            <>
              <span>&gt;</span>
              <span className="text-[#0f766e] font-black">
                4. Remark Students
              </span>
            </>
          )}
        </div>

        {/* Top Direct Section Tabs */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/institute/homework/assign"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors"
          >
            Assign
          </Link>
          <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#0f766e] text-white shadow-xs">
            Remark Homework
          </span>
          <Link
            href="/institute/homework/pending-assign"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors"
          >
            Pending Assign
          </Link>
          <Link
            href="/institute/homework/report"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors"
          >
            Report
          </Link>
        </div>
      </div>

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
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 w-full">
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
                  onClick={() => setSelectedCalendarDate(item.date)}
                  className={`flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 rounded-2xl transition-all cursor-pointer ${
                    item.isSelected
                      ? 'bg-[#0f766e] text-white font-black shadow-md shadow-teal-900/20 scale-105'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-sm sm:text-base font-black leading-none">{item.dayNum}</span>
                  <span className={`text-[10px] sm:text-xs font-semibold mt-1 ${item.isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                    {item.dayName}
                  </span>
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
                      <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight">
                        {cls.className} - Section {cls.section}
                      </h3>
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

                {/* Middle Row: Total / Completed / Pending Pills matching Screenshot 1 */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 text-center flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    <span className="text-xs font-black text-sky-800 dark:text-sky-200">
                      Total: {cls.studentsCount}
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 text-center flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-200">
                      Completed: {cls.completedCount}
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800/60 text-center flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-xs font-black text-rose-800 dark:text-rose-200">
                      Pending: {cls.pendingCount}
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
                <p className="text-xs md:text-sm text-slate-400 font-semibold mt-1">
                  {subjectCards.length} Subjects Assigned
                </p>
              </div>
            </div>

            <span className="px-4 py-1.5 rounded-xl bg-[#0f766e] text-white font-bold text-xs shadow-xs">
              Section {selectedSection}
            </span>
          </div>

          {/* Section Heading matching Screenshot 2 */}
          <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white pt-1">
            Subjects
          </h3>

          {/* Pastel Subject Cards matching Screenshot 2 */}
          <div className="space-y-3.5 w-full">
            {subjectCards.map(sub => (
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
                  <h4 className={`text-sm md:text-base font-black ${sub.textColor} dark:text-white leading-tight`}>
                    Subject : {sub.subjectName}
                  </h4>
                  <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${sub.badgeColor} dark:bg-slate-700 dark:text-slate-200 shadow-2xs`}>
                    Teacher : {sub.teacherName}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-xs flex items-center justify-center text-slate-400 hover:text-slate-700 shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>

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
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                    Academic Year 2026
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Heading matching Screenshot 3 */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
              Assigned Tasks
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {activeSubjectTasks.length} total
            </span>
          </div>

          {/* Tasks List matching Screenshot 3 */}
          {activeSubjectTasks.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 w-full">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No homework tasks found for {selectedSubject} in {selectedClass} - Section {selectedSection}.
              </p>
              <Link
                href="/institute/homework/assign"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0f766e] text-white font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Assign New Homework</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {activeSubjectTasks.map(task => (
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

                  {/* Bottom Row Action Button: "Remark Students >" matching Screenshot 3 */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      {task.studentsCount ?? 1} Students
                    </span>

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
              <span className="text-orange-600 dark:text-orange-400 font-bold shrink-0">
                Due: {activeTask.submissionDate}
              </span>
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

            {/* Filter Pill: All / Submitted / Pending */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'All' ? 'bg-[#0f766e] text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Submitted')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'Submitted' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'Pending' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                Pending
              </button>
            </div>
          </div>

          {/* Section Header: Students Count & "Bulk Action" button matching Screenshot 4 */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
              Students ({filteredAssignedStudents.length})
            </h3>

            <button
              type="button"
              onClick={() => {
                setBulkSelectedStudentIds(filteredAssignedStudents.map(s => s.studentId))
                setBulkModalOpen(true)
              }}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-teal-600/40 text-[#0f766e] dark:text-teal-300 hover:bg-teal-50 text-xs font-black shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Bulk Action</span>
            </button>
          </div>

          {/* Student Remark Cards matching Screenshot 4 */}
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
            <div className="space-y-4 w-full pb-8">
              {filteredAssignedStudents.map(st => {
                const isCompleted = st.status === 'Submitted'
                const isRescheduled = st.status === 'Rescheduled'

                return (
                  <div
                    key={st.studentId}
                    className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-3 w-full transition-all hover:shadow-md"
                  >
                    {/* Top Row: Photo, Name, Gender, Roll No, Status Badge matching Screenshot 4 */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
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
                    </div>

                    {/* Middle Row: Remark Text line and Interactive 5-Star Rating matching Screenshot 4 */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 italic">
                          {st.remark ? `"${st.remark}"` : 'No evaluation remark added yet.'}
                        </p>
                      </div>

                      {/* Interactive 5-Star Rating */}
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map(starNum => (
                          <button
                            key={starNum}
                            type="button"
                            onClick={() => {
                              handleOpenRemarkModal(st)
                              setModalRating(starNum)
                            }}
                            className="cursor-pointer transition-transform hover:scale-125"
                            title={`Rate ${starNum} Stars`}
                          >
                            <Star className={`w-4 h-4 ${
                              starNum <= st.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200 dark:text-slate-600'
                            }`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Row: Evaluation Action Buttons matching Screenshot 4 (Check, Cross, Calendar, Edit) */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      {/* Mark Completed (Green) */}
                      <button
                        type="button"
                        onClick={() => handleToggleStudentStatus(st, 'Submitted')}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                        title="Mark Completed"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Mark Incomplete / Pending (Red) */}
                      <button
                        type="button"
                        onClick={() => handleToggleStudentStatus(st, 'Pending')}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          !isCompleted && !isRescheduled
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 border border-rose-200'
                        }`}
                        title="Mark Incomplete / Pending"
                      >
                        <X className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Reschedule (Orange) */}
                      <button
                        type="button"
                        onClick={() => handleToggleStudentStatus(st, 'Rescheduled')}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isRescheduled
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 hover:bg-orange-100 border border-orange-200'
                        }`}
                        title="Reschedule Homework"
                      >
                        <CalendarClock className="w-4 h-4" />
                      </button>

                      {/* Edit Remark (Teal) */}
                      <button
                        type="button"
                        onClick={() => handleOpenRemarkModal(st)}
                        className="px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-[#0f766e] dark:text-teal-300 border border-teal-200 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Remark</span>
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          )}

        </div>
      )}

      {/* ── MODAL: EDIT INDIVIDUAL REMARK & RATING ── */}
      {remarkModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Remark for {remarkModalStudent.name}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Roll No: {remarkModalStudent.rollNo} • {remarkModalStudent.admissionNo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRemarkModalStudent(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Evaluation Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Submitted', 'Pending', 'Rescheduled'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setModalStatus(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all border ${
                      modalStatus === st
                        ? 'bg-[#0f766e] text-white border-[#0f766e]'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {st === 'Submitted' ? 'Completed' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Rating ({modalRating} of 5 Stars)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(starNum => (
                  <button
                    key={starNum}
                    type="button"
                    onClick={() => setModalRating(starNum)}
                    className="p-1 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star className={`w-6 h-6 ${
                      starNum <= modalRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-600'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Remark Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Quick Remark Suggestions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REMARK_CHIPS.map(chip => (
                  <button
                    key={chip.text}
                    type="button"
                    onClick={() => {
                      setModalRemarkText(chip.text)
                      setModalRating(chip.rating)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors text-left"
                  >
                    {chip.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Remark Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Remark
              </label>
              <textarea
                rows={3}
                value={modalRemarkText}
                onChange={e => setModalRemarkText(e.target.value)}
                placeholder="Enter evaluation notes, feedback or corrections..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold outline-none focus:border-teal-500 resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRemarkModalStudent(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalRemark}
                disabled={isSavingModal}
                className="px-6 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs font-black flex items-center gap-2 shadow-xs"
              >
                {isSavingModal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save Remark</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: BULK ACTION EVALUATION ── */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Bulk Evaluation
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Apply status, rating and remark to {bulkSelectedStudentIds.length} students at once
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Set Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBulkStatus('Submitted')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all ${
                    bulkStatus === 'Submitted'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200'
                  }`}
                >
                  ✓ Mark Completed
                </button>
                <button
                  type="button"
                  onClick={() => setBulkStatus('Pending')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all ${
                    bulkStatus === 'Pending'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200'
                  }`}
                >
                  ✕ Mark Pending
                </button>
              </div>
            </div>

            {/* Set Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(starNum => (
                  <button
                    key={starNum}
                    type="button"
                    onClick={() => setBulkRating(starNum)}
                    className="p-1 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star className={`w-6 h-6 ${
                      starNum <= bulkRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-600'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Remark Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Quick Remark Suggestions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REMARK_CHIPS.map(chip => (
                  <button
                    key={chip.text}
                    type="button"
                    onClick={() => {
                      setBulkRemarkText(chip.text)
                      setBulkRating(chip.rating)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors text-left"
                  >
                    {chip.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Remark Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Remark Text
              </label>
              <textarea
                rows={3}
                value={bulkRemarkText}
                onChange={e => setBulkRemarkText(e.target.value)}
                placeholder="Enter remark to apply to all selected students..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold outline-none focus:border-teal-500 resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkAction}
                disabled={isBulkSubmitting || bulkSelectedStudentIds.length === 0}
                className="px-6 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs font-black flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isBulkSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                <span>Apply to {bulkSelectedStudentIds.length} Students</span>
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

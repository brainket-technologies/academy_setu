'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, ChevronRight, Users, GraduationCap, 
  Calendar, FileText, Search, Check, X, ArrowLeft, 
  Clock, CheckCircle2, User, BookOpen, AlertCircle,
  Filter, Sparkles, Download, Eye, ChevronDown,
  BarChart3, MessageSquare, Award, CheckCircle, XCircle,
  LayoutGrid, Table as TableIcon, Printer, ArrowUpRight,
  RefreshCw, TrendingUp, Star, Paperclip, UserCheck, Layers
} from 'lucide-react'
import Link from 'next/link'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'
import { fetchStudents } from '@/app/institute/students/actions'
import { fetchTeachers } from '@/app/institute/teachers/actions'
import { 
  fetchHomeworkTasks, 
  fetchTaskSubmissions 
} from '@/app/institute/homework/assign/actions'

// Helper to format Date into YYYY-MM-DD locally without UTC shift
function formatDateToISO(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function normalizeDateStr(dStr: any): string {
  if (!dStr) return ''
  const str = String(dStr).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str

  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  }
  const parts = str.split(/[\s-]+/)
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
    }
    const dd = parts[0].padStart(2, '0')
    const mStr = parts[1].toLowerCase().slice(0, 3)
    const mm = monthMap[mStr] || '01'
    const yyyy = parts[2]
    return `${yyyy}-${mm}-${dd}`
  }
  try {
    const dt = new Date(str)
    if (!isNaN(dt.getTime())) {
      return formatDateToISO(dt)
    }
  } catch {}
  return str
}

// Types
interface ClassCardItem {
  id: string
  className: string
  section: string
  classTeacher: string
  studentsCount: number
  totalSubjects: number
  assignedSubjects: number
  notAssignedSubjects: number
  remarkDoneSubjects: number
  remarkPendingSubjects: number
  assignedCount: number
  completedCount: number
  notCompletedCount: number
  rescheduledCount: number
  tasksCount: number
  completionRate: number
}

interface SubjectItem {
  id: string
  subjectName: string
  teacherName: string
  bgColor: string
  borderColor: string
  textColor: string
  badgeColor: string
  hasTask?: boolean
  assignedCount?: number
  completedCount?: number
  notCompletedCount?: number
  rescheduledCount?: number
  completionPct?: number
  isRemarkDone?: boolean
  taskTitle?: string
  taskId?: string
  assignDate?: string
  dueDate?: string
}

interface StudentReportItem {
  id: string
  name: string
  fatherName?: string
  rollNo: string
  admissionNo: string
  avatar?: string
  status: 'Completed' | 'Not Completed' | 'Rescheduled' | 'Pending'
  rating?: number
  remark?: string
  submittedAt?: string
  rescheduledDate?: string
  isAssigned?: boolean
}

// Subject color palettes for dynamic subjects
const SUBJECT_PALETTES = [
  { bgColor: 'bg-sky-50/80 hover:bg-sky-100/90', borderColor: 'border-sky-200', textColor: 'text-sky-950', badgeColor: 'bg-white text-sky-800' },
  { bgColor: 'bg-teal-50/80 hover:bg-emerald-100/90', borderColor: 'border-teal-200', textColor: 'text-emerald-950', badgeColor: 'bg-white text-teal-800' },
  { bgColor: 'bg-rose-50/80 hover:bg-rose-100/90', borderColor: 'border-rose-200', textColor: 'text-rose-950', badgeColor: 'bg-white text-rose-800' },
  { bgColor: 'bg-amber-50/80 hover:bg-amber-100/90', borderColor: 'border-amber-200', textColor: 'text-amber-950', badgeColor: 'bg-white text-amber-800' },
  { bgColor: 'bg-purple-50/80 hover:bg-purple-100/90', borderColor: 'border-purple-200', textColor: 'text-purple-950', badgeColor: 'bg-white text-purple-800' },
  { bgColor: 'bg-orange-50/80 hover:bg-orange-100/90', borderColor: 'border-orange-200', textColor: 'text-orange-950', badgeColor: 'bg-white text-orange-800' },
]

// Canonical class and section matching helper
function matchesClassAndSection(student: any, cardClassName: string, cardSection: string): boolean {
  const sClass = String(
    student.class || student.className || student.class_name || student.current_class || student.classes || ''
  ).trim()
  const sSec = String(
    student.section || student.sectionName || student.section_name || student.current_section || ''
  ).trim()

  const normClass = (c: string) =>
    c.toLowerCase()
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
      .replace(/^sec\s+/i, '')
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

// Safe submissions array normalizer
function getSafeSubmissionsArray(val: any): any[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'object' && val !== null) {
    return Object.values(val)
  }
  return []
}

export default function HomeworkReportPage() {
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()
  const router = useRouter()

  // Real data state
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [allTeachers, setAllTeachers] = useState<any[]>([])
  const [allTasks, setAllTasks] = useState<any[]>([])
  const [taskSubmissionsMap, setTaskSubmissionsMap] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState<boolean>(true)

  // Two Main Report Types requested by user: 'remark' (default) vs 'assign'
  const [reportType, setReportType] = useState<'remark' | 'assign'>('remark')

  // Navigation steps: 'classes' (Screen 1) -> 'subjects' (Screen 2) -> 'report' (Screen 3)
  const [currentStep, setCurrentStep] = useState<'classes' | 'subjects' | 'report'>('classes')

  // Selections
  const [selectedClassCard, setSelectedClassCard] = useState<ClassCardItem | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)

  // Date selection state - default to today
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [dateStripCenter, setDateStripCenter] = useState<Date>(() => new Date())

  // Filter & View Mode
  const [classFilter, setClassFilter] = useState<string>('All Classes')
  const [sectionFilter, setSectionFilter] = useState<string>('All Sections')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Search & Filter on Screen 3
  const [studentSearch, setStudentSearch] = useState<string>('')
  const [statusTab, setStatusTab] = useState<'All' | 'Completed' | 'Not Completed' | 'Rescheduled' | 'Pending'>('All')
  const [remarkSubjectFilter, setRemarkSubjectFilter] = useState<string>('All')

  // Generate 7-day strip centered on dateStripCenter
  const dateStrip = useMemo(() => {
    const days = []
    const base = new Date(dateStripCenter)
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      const dayNum = d.getDate()
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      const isSelected = 
        d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      days.push({
        date: d,
        dayNum,
        dayName,
        fullDateStr: formatDateToISO(d),
        isSelected
      })
    }
    return days
  }, [dateStripCenter, selectedDate])

  const handlePrevWeek = () => {
    const next = new Date(dateStripCenter)
    next.setDate(next.getDate() - 7)
    setDateStripCenter(next)
  }

  const handleNextWeek = () => {
    const next = new Date(dateStripCenter)
    next.setDate(next.getDate() + 7)
    setDateStripCenter(next)
  }

  // Load 100% Real Data on Mount
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const parseLocal = (k: string) => {
          try {
            const raw = localStorage.getItem(k)
            return raw ? JSON.parse(raw) : []
          } catch { return [] }
        }

        // 1. Fetch Real Students from DB and LocalStorage
        let combinedStudents: any[] = []
        const l1 = parseLocal('school_students')
        const l2 = parseLocal('school_institute_students')
        const l3 = parseLocal('students')
        const localCombined = [...l1, ...l2, ...l3]

        const studentsRes = await fetchStudents()
        if (studentsRes?.success && Array.isArray(studentsRes.data)) {
          const dbStudents = studentsRes.data
          const dbIds = new Set(dbStudents.map((s: any) => String(s.id || s.admission_no || s.admissionNo)))
          const uniqueLocal = localCombined.filter(
            (s: any) => !dbIds.has(String(s.id || s.admission_no || s.admissionNo))
          )
          combinedStudents = [...dbStudents, ...uniqueLocal]
        } else {
          combinedStudents = localCombined
        }
        setAllStudents(combinedStudents)

        // 2. Fetch Real Teachers from DB and LocalStorage
        let combinedTeachers: any[] = []
        const localTeachers = parseLocal('school_teachers')
        const teachersRes = await fetchTeachers()
        if (teachersRes?.success && Array.isArray(teachersRes.data)) {
          const dbTeachers = teachersRes.data
          const dbIds = new Set(dbTeachers.map((t: any) => String(t.id)))
          const uniqueLocalT = localTeachers.filter((t: any) => !dbIds.has(String(t.id)))
          combinedTeachers = [...dbTeachers, ...uniqueLocalT]
        } else {
          combinedTeachers = localTeachers
        }
        setAllTeachers(combinedTeachers)

        // 3. Fetch Real Tasks from DB and LocalStorage
        let combinedTasks: any[] = []
        const localTasks1 = parseLocal('school_homework_tasks')
        const localTasks2 = parseLocal('school_homeworks')
        const localTasksCombined = [...localTasks1, ...localTasks2]

        const tasksRes = await fetchHomeworkTasks()
        if (tasksRes?.success && Array.isArray(tasksRes.data)) {
          const dbTasks = tasksRes.data
          const dbTaskIds = new Set(dbTasks.map((t: any) => String(t.id)))
          const uniqueLocalTasks = localTasksCombined.filter((t: any) => !dbTaskIds.has(String(t.id)))
          combinedTasks = [...dbTasks, ...uniqueLocalTasks]
        } else {
          combinedTasks = localTasksCombined
        }
        setAllTasks(combinedTasks)

        // 4. Preload Real Submissions from LocalStorage & DB
        const subMap: Record<string, any[]> = {}
        for (const task of combinedTasks) {
          if (task.id) {
            const rawSubs = localStorage.getItem(`school_task_subs_${task.id}`) || localStorage.getItem(`hw_sub_${task.id}`)
            if (rawSubs) {
              try {
                const parsed = JSON.parse(rawSubs)
                subMap[task.id] = getSafeSubmissionsArray(parsed)
              } catch {}
            }
          }
        }
        setTaskSubmissionsMap(subMap)

        // Asynchronously preload DB submissions
        combinedTasks.forEach(task => {
          if (task.id) {
            fetchTaskSubmissions(task.id).then(res => {
              if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
                setTaskSubmissionsMap(prev => ({
                  ...prev,
                  [task.id]: res.data
                }))
              }
            }).catch(() => {})
          }
        })

      } catch (err) {
        console.error('Failed to load homework report data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Sync data dynamically on storage change or window focus
  useEffect(() => {
    const syncData = () => {
      try {
        const rawTasks = localStorage.getItem('school_homework_tasks')
        if (rawTasks) {
          const parsed = JSON.parse(rawTasks)
          if (Array.isArray(parsed)) {
            setAllTasks(prev => {
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

  // When viewing Screen 3, fetch submissions for active task
  useEffect(() => {
    const currentTaskId = selectedTask?.id || activeTask?.id
    if (currentStep === 'report' && currentTaskId && !taskSubmissionsMap[currentTaskId]) {
      fetchTaskSubmissions(currentTaskId).then(res => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setTaskSubmissionsMap(prev => ({
            ...prev,
            [currentTaskId]: res.data
          }))
        }
      }).catch(() => {})
    }
  }, [currentStep, selectedTask, taskSubmissionsMap])

  // Build Real Class Cards (Deduplicated, 100% Real Enrolled Students & Real Tasks)
  const classCards: ClassCardItem[] = useMemo(() => {
    const list: ClassCardItem[] = []
    const processedKeys = new Set<string>()
    const selectedDateStr = formatDateToISO(selectedDate)

    const classesSource = (classesData && classesData.length > 0)
      ? classesData
      : Array.from(new Set(allStudents.map(s => s.class || s.className || s.class_name).filter(Boolean)))
          .map(name => ({ className: name }))

    classesSource.forEach((cls: any) => {
      const cName = String(cls.className || cls.name || '').trim()
      if (!cName) return

      let secList: string[] = []
      if (Array.isArray(cls.sections) && cls.sections.length > 0) {
        secList = Array.from(new Set(
          cls.sections.map((s: any) => String(s.name || s.sectionName || s).trim().toUpperCase())
        )).filter(Boolean) as string[]
      } else {
        const studentSecs = Array.from(new Set(
          allStudents
            .filter(s => matchesClassAndSection(s, cName, 'all'))
            .map(s => String(s.section || s.section_name || s.sectionName || '').trim().toUpperCase())
        )).filter(Boolean) as string[]

        if (studentSecs.length > 0) {
          secList = studentSecs
        } else if (sectionsData && sectionsData.length > 0) {
          secList = Array.from(new Set(
            sectionsData.map((s: any) => String(s.sectionName || s.name || s).trim().toUpperCase())
          )).filter(Boolean) as string[]
        } else {
          secList = ['A']
        }
      }

      secList.forEach(sec => {
        const uniqueKey = `${cName.toLowerCase()}___${sec.toLowerCase()}`
        if (processedKeys.has(uniqueKey)) return
        processedKeys.add(uniqueKey)

        const matchedStudents = allStudents.filter(s => matchesClassAndSection(s, cName, sec))
        const count = matchedStudents.length

        const fromMasters = (subjectsData && subjectsData.length > 0)
          ? subjectsData.filter((s: any) => !s.deleted && (!s.className || s.className.toLowerCase().trim() === cName.toLowerCase().trim()))
          : []
        const masterSubNames = fromMasters.map((s: any) => String(s.subjectName || s.name || '').trim()).filter(Boolean)

        const allClassTasks = allTasks.filter(t => matchesClassAndSection({ class: t.classes, section: t.section }, cName, sec))
        const taskSubs = allClassTasks.map(t => String(t.subject || '').trim()).filter(Boolean)

        const allSubjectNames = Array.from(new Set([...masterSubNames, ...taskSubs]))
        const totalSubjects = allSubjectNames.length > 0 ? allSubjectNames.length : (masterSubNames.length > 0 ? masterSubNames.length : 1)

        // Filter tasks that belong to this date
        const matchingTasks = allClassTasks.filter(t => {
          const aDate = normalizeDateStr(t.assignDate || t.assign_date)
          const sDate = normalizeDateStr(t.submissionDate || t.submission_date)
          const cDate = normalizeDateStr(t.createdAt || t.created_at)
          return aDate === selectedDateStr || sDate === selectedDateStr || cDate === selectedDateStr
        })

        const relevantTasks = matchingTasks.length > 0 ? matchingTasks : allClassTasks

        const assignedSubjectSet = new Set(
          relevantTasks.map(t => String(t.subject || '').trim().toLowerCase()).filter(Boolean)
        )

        const assignedSubjects = assignedSubjectSet.size
        const notAssignedSubjects = Math.max(0, totalSubjects - assignedSubjects)

        let remarkDoneCount = 0
        let remarkPendingCount = 0

        assignedSubjectSet.forEach(subLower => {
          const subTasks = relevantTasks.filter(t => String(t.subject || '').trim().toLowerCase() === subLower)
          let hasEvaluated = false

          subTasks.forEach(task => {
            let subs: any[] = []
            try {
              const rawLocal = localStorage.getItem(`school_task_subs_${task.id}`) || localStorage.getItem(`hw_sub_${task.id}`)
              if (rawLocal) subs = JSON.parse(rawLocal)
            } catch {}

            if ((!subs || subs.length === 0) && taskSubmissionsMap[task.id]) {
              subs = taskSubmissionsMap[task.id]
            }

            if (Array.isArray(subs) && subs.length > 0) {
              const done = subs.some((s: any) => {
                const st = String(s.status || '').toLowerCase()
                return st === 'completed' || st === 'done' || st === 'submitted' || st === 'rescheduled' || !!s.remark || (typeof s.rating === 'number' && s.rating > 0)
              })
              if (done) hasEvaluated = true
            }
          })

          if (hasEvaluated) {
            remarkDoneCount++
          } else {
            remarkPendingCount++
          }
        })

        let completed = 0
        let notCompleted = 0
        let rescheduled = 0

        relevantTasks.forEach(task => {
          let subs: any[] = []
          try {
            const rawLocal = localStorage.getItem(`school_task_subs_${task.id}`) || localStorage.getItem(`hw_sub_${task.id}`)
            if (rawLocal) subs = JSON.parse(rawLocal)
          } catch {}

          if ((!subs || subs.length === 0) && taskSubmissionsMap[task.id]) {
            subs = taskSubmissionsMap[task.id]
          }

          if (Array.isArray(subs)) {
            subs.forEach((sub: any) => {
              const st = String(sub.status || '').toLowerCase()
              if (st === 'completed' || st === 'done' || st === 'submitted') completed++
              else if (st === 'incomplete' || st === 'not completed') notCompleted++
              else if (st === 'rescheduled') rescheduled++
            })
          }
        })

        const assigned = relevantTasks.length > 0 ? (count > 0 ? count : 1) : 0
        const completionRate = assigned > 0 ? Math.min(100, Math.round(((completed + rescheduled) / assigned) * 100)) : 0

        const matchedTeacher = allTeachers.find((t: any) => {
          const assignedClasses = t.assigned_classes || t.assignedClasses || []
          const text = JSON.stringify(assignedClasses).toLowerCase()
          return text.includes(cName.toLowerCase()) && (sec ? text.includes(sec.toLowerCase()) : true)
        })

        list.push({
          id: `cls-${uniqueKey}`,
          className: cName,
          section: sec,
          classTeacher: matchedTeacher?.name || matchedTeacher?.teacherName || 'Unassigned',
          studentsCount: count,
          totalSubjects,
          assignedSubjects,
          notAssignedSubjects,
          remarkDoneSubjects: remarkDoneCount,
          remarkPendingSubjects: remarkPendingCount,
          assignedCount: assigned,
          completedCount: completed,
          notCompletedCount: notCompleted,
          rescheduledCount: rescheduled,
          tasksCount: relevantTasks.length,
          completionRate
        })
      })
    })

    return list
  }, [classesData, sectionsData, allStudents, allTeachers, allTasks, taskSubmissionsMap, selectedDate])

  // Dependent sections based on selected class filter
  const availableFilterSections = useMemo(() => {
    if (!classFilter || classFilter === 'All Classes') return []
    const target = classFilter.trim().toLowerCase()
    const set = new Set<string>()
    classCards.forEach(c => {
      if (c.className.trim().toLowerCase() === target) {
        set.add(c.section)
      }
    })
    return Array.from(set)
  }, [classCards, classFilter])

  // Filter Class Cards based on user selections
  const filteredClassCards = useMemo(() => {
    return classCards.filter(card => {
      if (classFilter !== 'All Classes' && card.className.toLowerCase() !== classFilter.toLowerCase()) {
        return false
      }
      if (sectionFilter !== 'All Sections') {
        const secFilterClean = sectionFilter.replace(/^section\s+/i, '').trim().toLowerCase()
        const cardSecClean = card.section.replace(/^section\s+/i, '').trim().toLowerCase()
        if (secFilterClean !== cardSecClean) return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim()
        const matchClass = card.className.toLowerCase().includes(q)
        const matchTeacher = card.classTeacher.toLowerCase().includes(q)
        if (!matchClass && !matchTeacher) return false
      }
      return true
    })
  }, [classCards, classFilter, sectionFilter, searchQuery])

  // Overall Statistics for Screen 1
  const overallStats = useMemo(() => {
    const totalClasses = new Set(filteredClassCards.map(c => c.className)).size
    const totalStudents = filteredClassCards.reduce((acc, c) => acc + c.studentsCount, 0)
    const totalAssigned = filteredClassCards.reduce((acc, c) => acc + c.assignedCount, 0)
    const totalCompleted = filteredClassCards.reduce((acc, c) => acc + c.completedCount, 0)
    const totalTasks = filteredClassCards.reduce((acc, c) => acc + c.tasksCount, 0)
    const totalRemarksDone = filteredClassCards.reduce((acc, c) => acc + c.remarkDoneSubjects, 0)
    const totalUnassigned = filteredClassCards.reduce((acc, c) => acc + c.notAssignedSubjects, 0)
    const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0

    return { 
      totalClasses, 
      totalStudents, 
      totalAssigned, 
      totalCompleted, 
      totalTasks,
      totalRemarksDone,
      totalUnassigned,
      completionRate 
    }
  }, [filteredClassCards])

  // Real Subjects for Selected Class with Subject-Wise Remarks & Completion Rate
  const classSubjects: SubjectItem[] = useMemo(() => {
    if (!selectedClassCard) return []

    const cName = selectedClassCard.className.toLowerCase().trim()
    const cSec = selectedClassCard.section.toLowerCase().trim()
    const studentCount = selectedClassCard.studentsCount
    const selectedDateStr = formatDateToISO(selectedDate)

    const subjectsMap = new Map<string, any>()

    if (subjectsData && subjectsData.length > 0) {
      const filtered = subjectsData.filter((s: any) => 
        !s.deleted && (!s.className || s.className.toLowerCase().trim() === cName)
      )
      filtered.forEach((s: any, idx: number) => {
        const sName = String(s.subjectName || s.name || `Subject ${idx + 1}`).trim()
        if (sName && !subjectsMap.has(sName.toLowerCase())) {
          subjectsMap.set(sName.toLowerCase(), {
            id: s.id || `subj-${idx}`,
            subjectName: sName,
            teacherName: s.teacherName || s.teacher || ''
          })
        }
      })
    }

    const tasksForClass = allTasks.filter(t => 
      matchesClassAndSection({ class: t.classes, section: t.section }, cName, cSec)
    )

    tasksForClass.forEach((t, idx) => {
      const sName = String(t.subject || '').trim()
      if (sName && !subjectsMap.has(sName.toLowerCase())) {
        subjectsMap.set(sName.toLowerCase(), {
          id: `task-subj-${idx}`,
          subjectName: sName,
          teacherName: t.assignedBy || 'Faculty'
        })
      }
    })

    const rawList = Array.from(subjectsMap.values())

    return rawList.map((s, idx) => {
      const palette = SUBJECT_PALETTES[idx % SUBJECT_PALETTES.length]
      const sLower = s.subjectName.toLowerCase().trim()

      const subTasks = allTasks.filter(t => 
        matchesClassAndSection({ class: t.classes, section: t.section }, cName, cSec) &&
        t.subject && t.subject.toLowerCase().trim() === sLower
      )

      const dateTasks = subTasks.filter(t => {
        const aDate = normalizeDateStr(t.assignDate || t.assign_date)
        const sDate = normalizeDateStr(t.submissionDate || t.submission_date)
        const cDate = normalizeDateStr(t.createdAt || t.created_at)
        return aDate === selectedDateStr || sDate === selectedDateStr || cDate === selectedDateStr
      })
      const activeSubTasks = dateTasks.length > 0 ? dateTasks : subTasks

      const hasTask = activeSubTasks.length > 0
      const activeT = hasTask ? activeSubTasks[0] : null
      const taskTitle = activeT?.title || undefined
      const taskId = activeT?.id || undefined
      const assignDate = activeT?.assignDate || activeT?.assign_date || undefined
      const dueDate = activeT?.submissionDate || activeT?.submission_date || undefined

      let completed = 0
      let notCompleted = 0
      let rescheduled = 0

      activeSubTasks.forEach(task => {
        let subs: any[] = []
        try {
          const rawLocal = localStorage.getItem(`school_task_subs_${task.id}`) || localStorage.getItem(`hw_sub_${task.id}`)
          if (rawLocal) subs = JSON.parse(rawLocal)
        } catch {}

        if ((!subs || subs.length === 0) && taskSubmissionsMap[task.id]) {
          subs = taskSubmissionsMap[task.id]
        }

        if (Array.isArray(subs)) {
          subs.forEach((sub: any) => {
            const st = String(sub.status || '').toLowerCase()
            if (st === 'completed' || st === 'done' || st === 'submitted') completed++
            else if (st === 'incomplete' || st === 'not completed') notCompleted++
            else if (st === 'rescheduled') rescheduled++
          })
        }
      })

      const assignedCount = hasTask ? (studentCount > 0 ? studentCount : 1) : 0
      const completionPct = assignedCount > 0 ? Math.min(100, Math.round((completed / assignedCount) * 100)) : 0
      const isRemarkDone = hasTask && (completed > 0 || subTasks.some(t => {
        const rawLocal = localStorage.getItem(`school_task_subs_${t.id}`)
        return rawLocal && rawLocal.includes('remark')
      }))

      const matchedTeacher = allTeachers.find((t: any) => {
        const assigned = JSON.stringify(t.assigned_classes || t.assignedClasses || []).toLowerCase()
        return assigned.includes(s.subjectName.toLowerCase())
      })?.name || s.teacherName || 'Faculty'

      return {
        id: s.id || `subj-${idx}`,
        subjectName: s.subjectName,
        teacherName: matchedTeacher,
        bgColor: palette.bgColor,
        borderColor: palette.borderColor,
        textColor: palette.textColor,
        badgeColor: palette.badgeColor,
        hasTask,
        taskId,
        taskTitle,
        assignDate,
        dueDate,
        assignedCount,
        completedCount: completed,
        notCompletedCount: notCompleted,
        rescheduledCount: rescheduled,
        completionPct,
        isRemarkDone
      }
    })
  }, [selectedClassCard, subjectsData, allTeachers, allTasks, taskSubmissionsMap, selectedDate])

  // Task-Wise Remarks for Selected Class (for Remark Report Screen 2)
  const classTasksForRemark = useMemo(() => {
    if (!selectedClassCard) return []
    const cName = selectedClassCard.className.toLowerCase().trim()
    const cSec = selectedClassCard.section.toLowerCase().trim()
    const selectedDateStr = formatDateToISO(selectedDate)

    const allClassTasks = allTasks.filter(t => 
      matchesClassAndSection({ class: t.classes, section: t.section }, cName, cSec)
    )

    const dateTasks = allClassTasks.filter(t => {
      const aDate = normalizeDateStr(t.assignDate || t.assign_date)
      const sDate = normalizeDateStr(t.submissionDate || t.submission_date)
      const cDate = normalizeDateStr(t.createdAt || t.created_at)
      return aDate === selectedDateStr || sDate === selectedDateStr || cDate === selectedDateStr
    })

    const tasksToUse = dateTasks.length > 0 ? dateTasks : allClassTasks

    return tasksToUse.map((task, idx) => {
      let subs: any[] = []
      try {
        const rawLocal = localStorage.getItem(`school_task_subs_${task.id}`) || localStorage.getItem(`hw_sub_${task.id}`)
        if (rawLocal) subs = JSON.parse(rawLocal)
      } catch {}

      if ((!subs || subs.length === 0) && taskSubmissionsMap[task.id]) {
        subs = getSafeSubmissionsArray(taskSubmissionsMap[task.id])
      }

      let completed = 0
      let rescheduled = 0
      let notCompleted = 0
      let evaluated = 0

      if (Array.isArray(subs)) {
        subs.forEach((sub: any) => {
          const st = String(sub.status || '').toLowerCase()
          const hasRatingOrRemark = !!sub.remark || (typeof sub.rating === 'number' && sub.rating > 0)
          if (st === 'completed' || st === 'done' || st === 'submitted') {
            completed++
            evaluated++
          } else if (st === 'rescheduled') {
            rescheduled++
            evaluated++
          } else if (st === 'not completed' || st === 'incomplete') {
            notCompleted++
            evaluated++
          } else if (hasRatingOrRemark) {
            evaluated++
          }
        })
      }

      const assignedCount = Array.isArray(task.assignedStudentIds) && task.assignedStudentIds.length > 0
        ? task.assignedStudentIds.length
        : (task.studentsCount || selectedClassCard.studentsCount || 1)

      const pendingCount = Math.max(0, assignedCount - evaluated)
      const evaluationPct = assignedCount > 0 ? Math.min(100, Math.round((evaluated / assignedCount) * 100)) : 0
      const strictlyCompletedPct = assignedCount > 0 ? Math.min(100, Math.round((completed / assignedCount) * 100)) : 0

      const isRemarkDone = evaluated > 0

      const matchedTeacher = allTeachers.find((t: any) => {
        const assigned = JSON.stringify(t.assigned_classes || t.assignedClasses || []).toLowerCase()
        return (
          t.name?.toLowerCase() === String(task.teacherName || task.assignedBy || task.assigned_by || '').toLowerCase() ||
          assigned.includes(String(task.subject || '').toLowerCase())
        )
      })?.name || task.teacherName || task.assignedBy || task.assigned_by || 'Assigned Teacher'

      const palette = SUBJECT_PALETTES[idx % SUBJECT_PALETTES.length]

      return {
        id: task.id,
        rawTask: task,
        title: task.title,
        description: task.description,
        subject: task.subject,
        assignDate: task.assignDate || task.assign_date || '—',
        dueDate: task.submissionDate || task.submission_date || '—',
        teacherName: matchedTeacher,
        assignedCount,
        completedCount: completed,
        rescheduledCount: rescheduled,
        notCompletedCount: notCompleted,
        pendingCount,
        evaluatedCount: evaluated,
        completionPct: evaluationPct,
        strictlyCompletedPct,
        isRemarkDone,
        palette
      }
    })
  }, [selectedClassCard, allTasks, taskSubmissionsMap, allTeachers, selectedDate])

  // Unique subjects with tasks for Remark Screen 2 filter
  const remarkSubjectsList = useMemo(() => {
    const set = new Set<string>()
    classTasksForRemark.forEach(t => {
      if (t.subject) set.add(t.subject)
    })
    return Array.from(set)
  }, [classTasksForRemark])

  // Filtered tasks by subject tab in Screen 2
  const filteredRemarkTasks = useMemo(() => {
    if (remarkSubjectFilter === 'All') return classTasksForRemark
    return classTasksForRemark.filter(t => t.subject?.toLowerCase() === remarkSubjectFilter.toLowerCase())
  }, [classTasksForRemark, remarkSubjectFilter])

  // Unassigned master subjects for the selected class
  const unassignedSubjectsForClass = useMemo(() => {
    if (!selectedClassCard) return []
    const cName = selectedClassCard.className.toLowerCase().trim()
    const fromMasters = (subjectsData && subjectsData.length > 0)
      ? subjectsData.filter((s: any) => !s.deleted && (!s.className || s.className.toLowerCase().trim() === cName))
      : []
    const masterSubNames = fromMasters.map((s: any) => String(s.subjectName || s.name || '').trim()).filter(Boolean)
    const assignedSubs = new Set(classTasksForRemark.map(t => String(t.subject || '').toLowerCase().trim()))
    return masterSubNames.filter(m => !assignedSubs.has(m.toLowerCase()))
  }, [selectedClassCard, subjectsData, classTasksForRemark])

  // Assigned Tasks for Selected Class (for Assign Report Screen 2)
  const assignedClassTasks = useMemo(() => {
    if (!selectedClassCard) return []
    const cName = selectedClassCard.className.toLowerCase().trim()
    const cSec = selectedClassCard.section.toLowerCase().trim()
    const selectedDateStr = formatDateToISO(selectedDate)

    const allClassTasks = allTasks.filter(t => 
      matchesClassAndSection({ class: t.classes, section: t.section }, cName, cSec)
    )

    const dateTasks = allClassTasks.filter(t => {
      const aDate = normalizeDateStr(t.assignDate || t.assign_date)
      const sDate = normalizeDateStr(t.submissionDate || t.submission_date)
      const cDate = normalizeDateStr(t.createdAt || t.created_at)
      return aDate === selectedDateStr || sDate === selectedDateStr || cDate === selectedDateStr
    })

    return dateTasks.length > 0 ? dateTasks : allClassTasks
  }, [selectedClassCard, allTasks, selectedDate])

  // Active Task for Screen 3 in Remark Report
  const activeTask = useMemo(() => {
    if (selectedTask) return selectedTask
    if (!selectedClassCard || !selectedSubject) return null
    return allTasks.find(t => 
      matchesClassAndSection({ class: t.classes, section: t.section }, selectedClassCard.className, selectedClassCard.section) &&
      t.subject && selectedSubject.subjectName &&
      t.subject.toLowerCase().trim() === selectedSubject.subjectName.toLowerCase().trim()
    ) || null
  }, [selectedTask, selectedClassCard, selectedSubject, allTasks])

  // Student Report Items for Screen 3 in Remark Report
  const studentReports: StudentReportItem[] = useMemo(() => {
    if (!selectedClassCard) return []

    const enrolled = allStudents.filter(s => 
      matchesClassAndSection(s, selectedClassCard.className, selectedClassCard.section)
    )

    if (enrolled.length === 0) return []

    let submissions: any[] = []
    if (activeTask?.id) {
      try {
        const rawLocal = localStorage.getItem(`school_task_subs_${activeTask.id}`) || localStorage.getItem(`hw_sub_${activeTask.id}`)
        if (rawLocal) submissions = JSON.parse(rawLocal)
      } catch {}
      if ((!submissions || submissions.length === 0) && taskSubmissionsMap[activeTask.id]) {
        submissions = getSafeSubmissionsArray(taskSubmissionsMap[activeTask.id])
      }
    }

    const subMap = new Map<string, any>()
    submissions.forEach((sub: any) => {
      subMap.set(String(sub.student_id || sub.studentId || sub.id), sub)
      if (sub.admissionNo || sub.admission_no) {
        subMap.set(String(sub.admissionNo || sub.admission_no).toLowerCase(), sub)
      }
      if (sub.rollNo || sub.roll_no) {
        subMap.set(`roll_${sub.rollNo || sub.roll_no}`, sub)
      }
    })

    return enrolled.map((s, idx) => {
      const sId = String(s.id || s.admission_no || s.admissionNo || idx)
      const sub = subMap.get(sId) || subMap.get(String(s.admissionNo || s.admission_no).toLowerCase()) || subMap.get(`roll_${s.rollNo}`)
      
      let status: 'Completed' | 'Not Completed' | 'Rescheduled' | 'Pending' = 'Pending'
      if (sub?.status) {
        const st = String(sub.status).toLowerCase()
        if (st === 'completed' || st === 'done' || st === 'submitted') status = 'Completed'
        else if (st === 'not completed' || st === 'incomplete') status = 'Not Completed'
        else if (st === 'rescheduled') status = 'Rescheduled'
      }

      const rawRating = typeof sub?.rating === 'number' && sub.rating >= 1 && sub.rating <= 5
        ? sub.rating
        : (status === 'Completed' ? 5 : undefined)

      const fullName = s.first_name 
        ? `${s.first_name} ${s.last_name || ''}`.trim() 
        : (s.name || s.student_name || s.fullName || `Student ${idx + 1}`)

      return {
        id: sId,
        name: fullName,
        fatherName: s.father_name || s.fatherName || s.parent_name || '—',
        rollNo: String(s.roll_no || s.rollNo || s.roll || '—'),
        admissionNo: String(s.admission_no || s.admissionNo || '—'),
        avatar: s.avatar || s.photo,
        status,
        rating: rawRating,
        remark: sub?.remark || '',
        rescheduledDate: sub?.rescheduled_date || sub?.rescheduledDate || ''
      }
    })
  }, [selectedClassCard, allStudents, activeTask, taskSubmissionsMap])

  // Assigned Students for Screen 3 in Assign Report
  const assignedStudentsForTask: StudentReportItem[] = useMemo(() => {
    if (!selectedClassCard || !selectedTask) return []

    const enrolled = allStudents.filter(s =>
      matchesClassAndSection(s, selectedClassCard.className, selectedClassCard.section)
    )

    let taskSubs: any[] = []
    try {
      const rawLocal = localStorage.getItem(`school_task_subs_${selectedTask.id}`) || localStorage.getItem(`hw_sub_${selectedTask.id}`)
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal)
        if (Array.isArray(parsed) && parsed.length > 0) {
          taskSubs = parsed
        }
      }
    } catch {}

    if (taskSubs.length === 0 && taskSubmissionsMap[selectedTask.id]) {
      taskSubs = taskSubmissionsMap[selectedTask.id]
    }

    const subMap = new Map<string, any>()
    taskSubs.forEach((sub: any) => {
      const k = String(sub.id || sub.student_id || sub.studentId || sub.admissionNo || sub.admission_no || sub.rollNo || sub.roll_no)
      subMap.set(k, sub)
      if (sub.admissionNo || sub.admission_no) {
        subMap.set(String(sub.admissionNo || sub.admission_no).toLowerCase(), sub)
      }
      if (sub.rollNo || sub.roll_no) {
        subMap.set(`roll_${sub.rollNo || sub.roll_no}`, sub)
      }
    })

    if (Array.isArray(selectedTask.assignedStudentIds) && selectedTask.assignedStudentIds.length > 0) {
      const assignedSet = new Set(selectedTask.assignedStudentIds.map((id: any) => String(id).toLowerCase()))
      const matched = enrolled.filter(s => {
        const sId = String(s.id || '').toLowerCase()
        const sAdm = String(s.admissionNo || s.admission_no || '').toLowerCase()
        const sRoll = String(s.rollNo || s.roll_no || '').toLowerCase()
        return assignedSet.has(sId) || assignedSet.has(sAdm) || assignedSet.has(sRoll)
      })

      if (matched.length > 0) {
        return matched.map((s, idx) => {
          const sKey = String(s.id || s.admissionNo || s.admission_no || idx)
          const sub = subMap.get(sKey) || subMap.get(String(s.admissionNo || s.admission_no).toLowerCase()) || subMap.get(`roll_${s.rollNo}`)
          return {
            id: sKey,
            name: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || `Student ${idx + 1}`,
            fatherName: s.fatherName || s.father_name || '—',
            rollNo: String(s.rollNo || s.roll_no || '—'),
            admissionNo: String(s.admissionNo || s.admission_no || '—'),
            avatar: s.avatar || s.photo,
            status: (sub?.status || 'Pending') as 'Completed' | 'Not Completed' | 'Rescheduled' | 'Pending',
            remark: sub?.remark || '',
            rating: sub?.rating,
            isAssigned: true
          }
        })
      }
    }

    if (taskSubs.length > 0) {
      return enrolled.map((s, idx) => {
        const sKey = String(s.id || s.admissionNo || s.admission_no || idx)
        const sub = subMap.get(sKey) || subMap.get(String(s.admissionNo || s.admission_no).toLowerCase()) || subMap.get(`roll_${s.rollNo}`)
        const isAssigned = !!sub || !selectedTask.assignedStudentIds || selectedTask.assignedStudentIds.length === 0
        return {
          id: sKey,
          name: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || `Student ${idx + 1}`,
          fatherName: s.fatherName || s.father_name || '—',
          rollNo: String(s.rollNo || s.roll_no || '—'),
          admissionNo: String(s.admissionNo || s.admission_no || '—'),
          avatar: s.avatar || s.photo,
          status: (sub?.status || 'Pending') as 'Completed' | 'Not Completed' | 'Rescheduled' | 'Pending',
          remark: sub?.remark || '',
          rating: sub?.rating,
          isAssigned
        }
      }).filter(s => s.isAssigned)
    }

    return enrolled.map((s, idx) => ({
      id: String(s.id || s.admissionNo || s.admission_no || idx),
      name: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || `Student ${idx + 1}`,
      fatherName: s.fatherName || s.father_name || '—',
      rollNo: String(s.rollNo || s.roll_no || '—'),
      admissionNo: String(s.admissionNo || s.admission_no || '—'),
      avatar: s.avatar || s.photo,
      status: 'Pending' as const,
      remark: '',
      rating: undefined,
      isAssigned: true
    }))
  }, [selectedClassCard, selectedTask, allStudents, taskSubmissionsMap])

  // Calculated stats for Screen 3 Remark Report
  const remarkReportStats = useMemo(() => {
    const completed = studentReports.filter(s => s.status === 'Completed').length
    const notCompleted = studentReports.filter(s => s.status === 'Not Completed').length
    const rescheduled = studentReports.filter(s => s.status === 'Rescheduled').length
    const pending = studentReports.filter(s => s.status === 'Pending').length
    const total = studentReports.length

    const evaluated = studentReports.filter(s => 
      s.status === 'Completed' || 
      s.status === 'Rescheduled' || 
      s.status === 'Not Completed' || 
      !!s.remark || 
      (typeof s.rating === 'number' && s.rating > 0)
    ).length

    const evaluationPct = total > 0 ? Math.min(100, Math.round((evaluated / total) * 100)) : 0
    const completedPct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0
    const rescheduledPct = total > 0 ? Math.min(100, Math.round((rescheduled / total) * 100)) : 0
    const notCompletedPct = total > 0 ? Math.min(100, Math.round((notCompleted / total) * 100)) : 0

    return {
      completed,
      notCompleted,
      rescheduled,
      pending,
      evaluated,
      total,
      evaluationPct,
      completedPct,
      notCompletedPct,
      rescheduledPct
    }
  }, [studentReports])

  // Calculated stats for Screen 3 Assign Report
  const assignReportStats = useMemo(() => {
    const totalAssigned = assignedStudentsForTask.length
    const totalEnrolled = selectedClassCard ? selectedClassCard.studentsCount : totalAssigned
    const completed = assignedStudentsForTask.filter(s => s.status === 'Completed').length
    const pending = totalAssigned - completed
    const completionPct = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0

    return {
      totalAssigned,
      totalEnrolled,
      completed,
      pending,
      completionPct
    }
  }, [assignedStudentsForTask, selectedClassCard])

  // Filtered Students for Screen 3
  const activeStudentList = reportType === 'remark' ? studentReports : assignedStudentsForTask
  const filteredStudents = useMemo(() => {
    return activeStudentList.filter(s => {
      if (statusTab !== 'All' && s.status !== statusTab) {
        return false
      }
      if (studentSearch) {
        const query = studentSearch.toLowerCase().trim()
        const matchName = s.name.toLowerCase().includes(query)
        const matchRoll = s.rollNo.toLowerCase().includes(query)
        const matchAdm = s.admissionNo.toLowerCase().includes(query)
        if (!matchName && !matchRoll && !matchAdm) return false
      }
      return true
    })
  }, [activeStudentList, statusTab, studentSearch])

  // Export CSV Handler
  const handleExportCSV = () => {
    if (reportType === 'remark') {
      if (studentReports.length === 0) return
      const headers = ['Roll No', 'Student Name', "Father's Name", 'Admission No', 'Class', 'Section', 'Subject', 'Status', 'Rating', 'Remarks']
      const rows = studentReports.map(s => [
        s.rollNo,
        `"${s.name}"`,
        `"${s.fatherName || ''}"`,
        s.admissionNo,
        selectedClassCard?.className || '',
        selectedClassCard?.section || '',
        selectedSubject?.subjectName || '',
        s.status,
        s.rating || 5,
        `"${s.remark || ''}"`
      ])
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `homework_remark_report_${selectedClassCard?.className}_${selectedSubject?.subjectName}_${formatDateToISO(selectedDate)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      if (assignedStudentsForTask.length === 0) return
      const headers = ['Roll No', 'Student Name', "Father's Name", 'Admission No', 'Class', 'Section', 'Subject', 'Task Title', 'Assign Date', 'Due Date', 'Status', 'Remark']
      const rows = assignedStudentsForTask.map(s => [
        s.rollNo,
        `"${s.name}"`,
        `"${s.fatherName || ''}"`,
        s.admissionNo,
        selectedClassCard?.className || '',
        selectedClassCard?.section || '',
        selectedTask?.subject || '',
        `"${selectedTask?.title || ''}"`,
        selectedTask?.assignDate || selectedTask?.assign_date || '',
        selectedTask?.submissionDate || selectedTask?.submission_date || '',
        s.status,
        `"${s.remark || ''}"`
      ])
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `assigned_students_report_${selectedClassCard?.className}_${selectedTask?.subject}_${formatDateToISO(selectedDate)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Navigation Handlers
  const handleViewReport = (card: ClassCardItem) => {
    setSelectedClassCard(card)
    setSelectedSubject(null)
    setSelectedTask(null)
    setRemarkSubjectFilter('All')
    setCurrentStep('subjects')
  }

  const handleSelectTaskForRemark = (item: any) => {
    setSelectedTask(item.rawTask)
    setSelectedSubject({
      id: item.id,
      subjectName: item.subject,
      teacherName: item.teacherName,
      bgColor: item.palette.bgColor,
      borderColor: item.palette.borderColor,
      textColor: item.palette.textColor,
      badgeColor: item.palette.badgeColor,
      taskId: item.id,
      taskTitle: item.title,
      assignDate: item.assignDate,
      dueDate: item.dueDate,
      assignedCount: item.assignedCount,
      completedCount: item.completedCount,
      rescheduledCount: item.rescheduledCount,
      notCompletedCount: item.notCompletedCount,
      completionPct: item.completionPct,
      isRemarkDone: item.isRemarkDone
    })
    setStatusTab('All')
    setStudentSearch('')
    setCurrentStep('report')
  }

  const handleSelectSubject = (subj: SubjectItem) => {
    setSelectedSubject(subj)
    if (subj.taskId) {
      const t = allTasks.find(x => x.id === subj.taskId)
      if (t) setSelectedTask(t)
    }
    setStatusTab('All')
    setStudentSearch('')
    setCurrentStep('report')
  }

  const handleSelectTaskForAssign = (task: any) => {
    setSelectedTask(task)
    setStatusTab('All')
    setStudentSearch('')
    setCurrentStep('report')
  }

  return (
    <div className="flex flex-col gap-5 w-full pb-16 animate-in fade-in duration-200">
      
      {/* ── TOP CURVED TEAL HEADER ── */}
      <div className="bg-[#0f766e] text-white px-6 md:px-8 py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between w-full">
        <button
          type="button"
          onClick={() => {
            if (currentStep === 'report') setCurrentStep('subjects')
            else if (currentStep === 'subjects') setCurrentStep('classes')
            else router.push('/institute/homework')
          }}
          className="w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer shrink-0"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex-1 text-center px-4">
          {currentStep === 'classes' && (reportType === 'remark' ? 'Homework Remark Report' : 'Homework Assign Report')}
          {currentStep === 'subjects' && (
            reportType === 'remark' 
              ? `Subject Remarks — ${selectedClassCard?.className} Sec ${selectedClassCard?.section}`
              : `Assigned Homework — ${selectedClassCard?.className} Sec ${selectedClassCard?.section}`
          )}
          {currentStep === 'report' && (
            reportType === 'remark'
              ? `${selectedSubject?.subjectName || 'Subject'} Homework Remark Report`
              : `${selectedTask?.subject || 'Assigned'} Homework — Assigned Students`
          )}
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          {currentStep === 'report' ? (
            <>
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-teal-800 hover:bg-teal-50 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </>
          ) : (
            <div className="w-11 h-11" />
          )}
        </div>
      </div>

      {/* ── 2 REPORT MODES TOGGLE (REMARK REPORT vs ASSIGN REPORT) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setReportType('remark')
              setStatusTab('All')
            }}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              reportType === 'remark'
                ? 'bg-[#0f766e] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Remark Report</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setReportType('assign')
              setStatusTab('All')
            }}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              reportType === 'assign'
                ? 'bg-[#0f766e] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Assign Report</span>
          </button>
        </div>

        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0f766e]" />
          <span>
            {reportType === 'remark'
              ? 'Subject-wise remarks, evaluation ratings & student completion rates'
              : 'Assigned homework tasks and their assigned student lists'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 1: CLASSES OVERVIEW (DESKTOP WEB VIEW - REAL DATA)                  */}
      {/* ========================================================================= */}
      {currentStep === 'classes' && (
        <div className="space-y-6">

          {/* 4 Metric Summary Cards Tailored to Selected Report Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Active Classes</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{overallStats.totalClasses}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Enrolled</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{overallStats.totalStudents} Students</h3>
              </div>
            </div>

            {reportType === 'remark' ? (
              <>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Remarks Done</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{overallStats.totalRemarksDone} Subjects</h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 flex items-center justify-center font-bold">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Avg Completion Rate</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{overallStats.completionRate}%</h3>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 flex items-center justify-center font-bold">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Tasks Assigned</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{overallStats.totalTasks} Tasks</h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 flex items-center justify-center font-bold">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Unassigned Subjects</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{overallStats.totalUnassigned} Left</h3>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Desktop Date Ribbon & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            
            {/* Top row: Date navigation ribbon */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Selected Date:</h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* 7-Day Date Ribbon */}
              <div className="flex items-center gap-1.5 self-center">
                <button
                  type="button"
                  onClick={handlePrevWeek}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 sm:gap-2">
                  {dateStrip.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDate(item.date)}
                      className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        item.isSelected
                          ? 'bg-[#0f766e] text-white shadow-sm font-bold scale-105'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xs font-semibold opacity-80">{item.dayName}</span>
                      <span className="text-sm font-extrabold">{item.dayNum}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextWeek}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                  title="Next Week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Native Calendar Picker for any date */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={formatDateToISO(selectedDate)}
                  onChange={e => {
                    if (e.target.value) {
                      const parts = e.target.value.split('-')
                      if (parts.length === 3) {
                        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
                        setSelectedDate(d)
                        setDateStripCenter(d)
                      }
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs cursor-pointer"
                />
              </div>
            </div>

            {/* Bottom row: Filters, Search, and View Mode Toggle */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search class or teacher name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs"
                />
              </div>

              {/* Class & Section Filters */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={classFilter}
                  onChange={e => {
                    setClassFilter(e.target.value)
                    setSectionFilter('All Sections')
                  }}
                  className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs cursor-pointer"
                >
                  <option value="All Classes">All Classes</option>
                  {Array.from(new Set(classCards.map(c => c.className))).map(cName => (
                    <option key={cName} value={cName}>{cName}</option>
                  ))}
                </select>

                <select
                  disabled={!classFilter || classFilter === 'All Classes'}
                  value={sectionFilter}
                  onChange={e => setSectionFilter(e.target.value)}
                  className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs cursor-pointer disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <option value="All Sections">{!classFilter || classFilter === 'All Classes' ? 'Select Class First' : 'All Sections'}</option>
                  {availableFilterSections.map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>

                {/* View Mode Toggle: Grid vs Table */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="Table View"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* ===================================================================== */}
          {/* VIEW MODE 1: DESKTOP MULTI-COLUMN CARD GRID (REAL DATA)               */}
          {/* ===================================================================== */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredClassCards.map(card => {
                return (
                  <div
                    key={card.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-teal-500 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      {/* Top Row: Class Info & Section Pill */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 flex items-center justify-center font-bold shadow-xs">
                            <GraduationCap className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                              {card.className}
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">
                              {card.classTeacher}
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200/60 text-[11px] font-bold shadow-2xs">
                          Sec {card.section}
                        </span>
                      </div>

                      {/* Total Subjects Banner */}
                      <div className="mt-4 flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <BookOpen className="w-4 h-4 text-teal-600" />
                          Total Subjects
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-black shadow-2xs border border-slate-200 dark:border-slate-600">
                          {card.totalSubjects} Subjects
                        </span>
                      </div>

                      {/* 4 Metric Badges in 2x2 Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/60 rounded-xl px-2.5 py-2 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300">
                            Assigned
                          </span>
                          <span className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                            {card.assignedSubjects} <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">Subjects</span>
                          </span>
                        </div>

                        <div className="bg-slate-100/90 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-2 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
                            Not Assigned
                          </span>
                          <span className="text-sm font-black text-slate-900 dark:text-slate-200">
                            {card.notAssignedSubjects} <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Subjects</span>
                          </span>
                        </div>

                        <div className="bg-teal-50/80 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-800/60 rounded-xl px-2.5 py-2 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-teal-700 dark:text-teal-300">
                            Remark Done
                          </span>
                          <span className="text-sm font-black text-teal-950 dark:text-teal-200">
                            {card.remarkDoneSubjects} <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300">Subjects</span>
                          </span>
                        </div>

                        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/60 rounded-xl px-2.5 py-2 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300">
                            Remark Pending
                          </span>
                          <span className="text-sm font-black text-amber-950 dark:text-amber-200">
                            {card.remarkPendingSubjects} <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">Subjects</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{card.studentsCount} Students</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewReport(card)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-bold shadow-2xs group-hover:scale-102 transition-all cursor-pointer"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>{reportType === 'remark' ? 'View Remark Report' : 'View Assign Report'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}

              {filteredClassCards.length === 0 && (
                <div className="col-span-full bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                  No classes match the selected filter. Please verify enrolled students or classes in Masters.
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW MODE 2: DESKTOP DATA TABLE (REAL DATA)                           */}
          {/* ===================================================================== */}
          {viewMode === 'table' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-extrabold border-b">
                    <tr>
                      <th className="px-5 py-3.5">Class & Section</th>
                      <th className="px-5 py-3.5">Class Teacher</th>
                      <th className="px-5 py-3.5">Enrolled</th>
                      <th className="px-5 py-3.5">Total Subjects</th>
                      <th className="px-5 py-3.5 text-emerald-700">Assigned</th>
                      <th className="px-5 py-3.5 text-slate-600">Not Assigned</th>
                      <th className="px-5 py-3.5 text-teal-700">Remark Done</th>
                      <th className="px-5 py-3.5 text-amber-700">Remark Pending</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                    {filteredClassCards.map(card => {
                      return (
                        <tr key={card.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                            {card.className} - Sec {card.section}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                            {card.classTeacher}
                          </td>
                          <td className="px-5 py-3.5 font-bold">
                            {card.studentsCount} Students
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                            {card.totalSubjects} Subjects
                          </td>
                          <td className="px-5 py-3.5 font-bold text-emerald-700 dark:text-emerald-400">
                            {card.assignedSubjects} Subjects
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-600 dark:text-slate-400">
                            {card.notAssignedSubjects} Subjects
                          </td>
                          <td className="px-5 py-3.5 font-bold text-teal-700 dark:text-teal-400">
                            {card.remarkDoneSubjects} Subjects
                          </td>
                          <td className="px-5 py-3.5 font-bold text-amber-600 dark:text-amber-400">
                            {card.remarkPendingSubjects} Subjects
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewReport(card)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                              <span>{reportType === 'remark' ? 'View' : 'Assign'}</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: SUBJECTS / TASKS REPORT VIEW FOR SELECTED CLASS                 */}
      {/* ========================================================================= */}
      {currentStep === 'subjects' && selectedClassCard && (
        <div className="space-y-6">
          
          {/* Class Summary Banner */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center font-bold shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedClassCard.className}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#0f766e] text-white text-xs font-bold">
                    Section {selectedClassCard.section}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Class Teacher: <strong className="text-slate-700 dark:text-slate-300">{selectedClassCard.classTeacher}</strong> • Enrolled: <strong className="text-slate-700 dark:text-slate-300">{selectedClassCard.studentsCount} Students</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep('classes')}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                ‹ Choose Different Class
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              CASE A: REMARK REPORT (TASK-WISE REMARKS & COMPLETION RATE)
             ───────────────────────────────────────────────────────────── */}
          {reportType === 'remark' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Assigned Homework Tasks & Evaluation ({classTasksForRemark.length})
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Click any task to inspect student-wise evaluations, star ratings, and teacher remarks.
                  </p>
                </div>

                {/* Filter Pills by Subject */}
                {remarkSubjectsList.length > 1 && (
                  <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setRemarkSubjectFilter('All')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        remarkSubjectFilter === 'All'
                          ? 'bg-white dark:bg-slate-700 text-[#0f766e] dark:text-teal-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      All Tasks ({classTasksForRemark.length})
                    </button>
                    {remarkSubjectsList.map(subj => {
                      const count = classTasksForRemark.filter(t => t.subject?.toLowerCase() === subj.toLowerCase()).length
                      return (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => setRemarkSubjectFilter(subj)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            remarkSubjectFilter.toLowerCase() === subj.toLowerCase()
                              ? 'bg-white dark:bg-slate-700 text-[#0f766e] dark:text-teal-300 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          {subj} ({count})
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Task Cards Grid with Task-Wise Completion Rates */}
              {filteredRemarkTasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                  <p className="text-base font-black text-slate-800 dark:text-slate-200">
                    No homework tasks assigned for {selectedClassCard.className} on this date.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You can assign homework directly or pick another date from the date strip above.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/institute/homework/assign"
                      className="px-5 py-2.5 rounded-xl bg-[#0f766e] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs hover:bg-[#0d655f] transition-all"
                    >
                      Assign Homework Now &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRemarkTasks.map(item => {
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectTaskForRemark(item)}
                        className={`rounded-2xl p-5 shadow-xs border transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group ${item.palette.bgColor} ${item.palette.borderColor}`}
                      >
                        <div className="space-y-3">
                          {/* Subject Badge & Remark Status */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800 text-xs font-extrabold shadow-2xs">
                              {item.subject}
                            </span>
                            {item.isRemarkDone ? (
                              <span className="px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Remark Done
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Remark Pending
                              </span>
                            )}
                          </div>

                          {/* Task Title & Description */}
                          <div>
                            <h3 className={`font-black text-base leading-tight group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors ${item.palette.textColor}`}>
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Teacher & Due Date */}
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 pt-1">
                            <span className="truncate max-w-[55%]">Teacher: <strong className="text-slate-800 dark:text-slate-200 font-bold">{item.teacherName}</strong></span>
                            <span className="text-amber-700 dark:text-amber-400 font-bold">Due: {item.dueDate}</span>
                          </div>

                          {/* Task-Wise Completion / Evaluation Rate Bar */}
                          <div className="bg-white/90 dark:bg-slate-900/90 rounded-xl p-3 border border-slate-100 dark:border-slate-700 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                                Completion Rate
                              </span>
                              <span className="text-teal-700 dark:text-teal-300 font-black">{item.completionPct}%</span>
                            </div>

                            <div className="w-full bg-slate-200/80 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#0f766e] h-full rounded-full transition-all duration-300"
                                style={{ width: `${item.completionPct}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-0.5">
                              <span>Completed: <strong className="text-slate-800 dark:text-slate-200 font-bold">{item.completedCount}</strong>/{item.assignedCount}</span>
                              {item.rescheduledCount > 0 && (
                                <span className="text-amber-700 dark:text-amber-400 font-bold">{item.rescheduledCount} Resched.</span>
                              )}
                              {item.pendingCount > 0 && (
                                <span className="text-slate-400 font-medium">{item.pendingCount} Pending</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-teal-700 dark:text-teal-300 group-hover:text-teal-800">
                          <span>View Student Remarks & Evaluation</span>
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Unassigned Subjects Summary if any */}
              {unassignedSubjectsForClass.length > 0 && (
                <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                      Subjects Not Assigned on this Date ({unassignedSubjectsForClass.length})
                    </h3>
                    <Link
                      href="/institute/homework/pending-assign"
                      className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                    >
                      Assign Pending Work &rarr;
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {unassignedSubjectsForClass.map(s => (
                      <div
                        key={s}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2"
                      >
                        <span>{s}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 font-bold">No Task</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              CASE B: ASSIGN REPORT (TASKS ASSIGNED & ENROLLED STUDENTS)
             ───────────────────────────────────────────────────────────── */}
          {reportType === 'assign' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Assigned Homework Tasks ({assignedClassTasks.length})
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Click any task to view all assigned students and their assignment status.
                  </p>
                </div>

                <Link
                  href="/institute/homework/assign"
                  className="px-4 py-2 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  + Assign New Homework
                </Link>
              </div>

              {assignedClassTasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                  <p className="text-base font-black text-slate-800 dark:text-slate-200">
                    No homework assigned for {selectedClassCard.className} on this date.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You can assign homework directly or pick another date from the date strip above.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/institute/homework/assign"
                      className="px-5 py-2.5 rounded-xl bg-[#0f766e] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs"
                    >
                      Assign Homework Now &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedClassTasks.map(task => {
                    const taskAssignedCount = Array.isArray(task.assignedStudentIds) && task.assignedStudentIds.length > 0
                      ? task.assignedStudentIds.length
                      : (task.studentsCount || selectedClassCard.studentsCount || 0)

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleSelectTaskForAssign(task)}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-bold">
                              {task.subject}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                              Due: {task.submissionDate || task.submission_date || '—'}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight group-hover:text-teal-700 transition-colors">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-700 text-xs">
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                              <span>Teacher:</span>
                              <strong className="text-slate-900 dark:text-white">{task.assignedBy || 'Faculty'}</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                              <span>Assign Date:</span>
                              <strong>{task.assignDate || task.assign_date || '—'}</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                              <span>Assigned To:</span>
                              <span className="inline-flex items-center gap-1 font-bold text-teal-700 dark:text-teal-300">
                                <Users className="w-3.5 h-3.5" />
                                {taskAssignedCount} Students
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-teal-700 dark:text-teal-300">
                          <span>View Assigned Students ({taskAssignedCount})</span>
                          <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: DETAILED STUDENT REPORT (REMARK OR ASSIGN REPORT)               */}
      {/* ========================================================================= */}
      {currentStep === 'report' && selectedClassCard && (
        <div className="space-y-6">

          {/* ─────────────────────────────────────────────────────────────
              CASE 3A: REMARK REPORT (STUDENT REMARKS, RATINGS & COMPLETION)
             ───────────────────────────────────────────────────────────── */}
          {reportType === 'remark' && selectedSubject && (
            <>
              {/* Assignment Overview Banner */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-xs font-bold">
                          {selectedSubject.subjectName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold">
                          {selectedClassCard.className} Sec {selectedClassCard.section}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          Due: {activeTask?.submissionDate || activeTask?.submission_date || '—'}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5 leading-tight">
                        {activeTask?.title || `${selectedSubject.subjectName} Homework Remarks & Evaluation`}
                      </h2>
                    </div>
                  </div>

                  {/* Progress Bar Badge */}
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500">Evaluation Rate</span>
                      <p className="text-lg font-black text-teal-600">{remarkReportStats.evaluationPct}%</p>
                    </div>
                    <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#0f766e] h-full" style={{ width: `${remarkReportStats.evaluationPct}%` }} />
                    </div>
                  </div>
                </div>

                {/* 4 Metric Summary Boxes */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div 
                    onClick={() => setStatusTab('All')}
                    className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                      statusTab === 'All' ? 'ring-2 ring-teal-500 bg-teal-50/50 dark:bg-teal-950/40 border-teal-200 shadow-xs' : 'bg-slate-50 dark:bg-slate-900 border-slate-200/70 dark:border-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="text-2xl font-black text-slate-800 dark:text-white">{remarkReportStats.total}</div>
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">Total Enrolled</div>
                  </div>

                  <div 
                    onClick={() => setStatusTab('Completed')}
                    className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                      statusTab === 'Completed' ? 'ring-2 ring-emerald-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 shadow-xs' : 'bg-teal-50/50 dark:bg-teal-950/20 border-emerald-100 hover:bg-teal-50'
                    }`}
                  >
                    <div className="text-2xl font-black text-teal-700 dark:text-teal-300">{remarkReportStats.completed}</div>
                    <div className="text-xs font-bold text-teal-800 dark:text-teal-200 mt-1">Completed ({remarkReportStats.completedPct}%)</div>
                  </div>

                  <div 
                    onClick={() => setStatusTab('Rescheduled')}
                    className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                      statusTab === 'Rescheduled' ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 shadow-xs' : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 hover:bg-amber-50'
                    }`}
                  >
                    <div className="text-2xl font-black text-amber-700 dark:text-amber-300">{remarkReportStats.rescheduled}</div>
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-200 mt-1">Rescheduled ({remarkReportStats.rescheduledPct}%)</div>
                  </div>

                  <div 
                    onClick={() => setStatusTab('Pending')}
                    className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                      statusTab === 'Pending' ? 'ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 shadow-xs' : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 hover:bg-rose-50'
                    }`}
                  >
                    <div className="text-2xl font-black text-rose-700 dark:text-rose-300">{remarkReportStats.pending + remarkReportStats.notCompleted}</div>
                    <div className="text-xs font-bold text-rose-800 dark:text-rose-200 mt-1">Pending / Not Done</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─────────────────────────────────────────────────────────────
              CASE 3B: ASSIGN REPORT (ASSIGNED STUDENTS FOR SELECTED TASK)
             ───────────────────────────────────────────────────────────── */}
          {reportType === 'assign' && selectedTask && (
            <>
              {/* Task Details Overview Banner */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-xs font-bold">
                          {selectedTask.subject}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold">
                          {selectedClassCard.className} Sec {selectedClassCard.section}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          Assigned: {selectedTask.assignDate || selectedTask.assign_date || '—'}
                        </span>
                        <span className="text-xs text-amber-600 font-bold">
                          Due: {selectedTask.submissionDate || selectedTask.submission_date || '—'}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5 leading-tight">
                        {selectedTask.title}
                      </h2>
                      {selectedTask.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {selectedTask.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500">Teacher</span>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{selectedTask.assignedBy || 'Faculty'}</p>
                    </div>
                  </div>
                </div>

                {/* 4 Summary Boxes for Assign Report */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div 
                    onClick={() => setStatusTab('All')}
                    className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                      statusTab === 'All' ? 'ring-2 ring-teal-500 bg-teal-50/50 dark:bg-teal-950/40 border-teal-200 shadow-xs' : 'bg-slate-50 dark:bg-slate-900 border-slate-200/70 dark:border-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="text-2xl font-black text-slate-800 dark:text-white">{assignReportStats.totalAssigned}</div>
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">Students Assigned</div>
                  </div>

                  <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700">
                    <div className="text-2xl font-black text-slate-800 dark:text-white">{assignReportStats.totalEnrolled}</div>
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">Class Enrolled</div>
                  </div>

                  <div 
                    onClick={() => setStatusTab('Completed')}
                    className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                      statusTab === 'Completed' ? 'ring-2 ring-emerald-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 shadow-xs' : 'bg-teal-50/50 dark:bg-teal-950/20 border-emerald-100 hover:bg-teal-50'
                    }`}
                  >
                    <div className="text-2xl font-black text-teal-700 dark:text-teal-300">{assignReportStats.completed}</div>
                    <div className="text-xs font-bold text-teal-800 dark:text-teal-200 mt-1">Completed ({assignReportStats.completionPct}%)</div>
                  </div>

                  <div 
                    onClick={() => setStatusTab('Pending')}
                    className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                      statusTab === 'Pending' ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 shadow-xs' : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 hover:bg-amber-50'
                    }`}
                  >
                    <div className="text-2xl font-black text-amber-700 dark:text-amber-300">{assignReportStats.pending}</div>
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-200 mt-1">Pending Submission</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Search, Status Filter Tabs & Export */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Search by student name, roll no, adm no..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs"
              />
              {studentSearch && (
                <button
                  type="button"
                  onClick={() => setStudentSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex-wrap">
              <button
                type="button"
                onClick={() => setStatusTab('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusTab === 'All' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({activeStudentList.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('Completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusTab === 'Completed' ? 'bg-white dark:bg-slate-800 text-teal-700 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-teal-700'
                }`}
              >
                Completed ({activeStudentList.filter(s => s.status === 'Completed').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('Rescheduled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusTab === 'Rescheduled' ? 'bg-white dark:bg-slate-800 text-amber-700 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-amber-700'
                }`}
              >
                Rescheduled ({activeStudentList.filter(s => s.status === 'Rescheduled').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('Pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusTab === 'Pending' ? 'bg-white dark:bg-slate-800 text-amber-700 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-amber-700'
                }`}
              >
                Pending ({activeStudentList.filter(s => s.status === 'Pending').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('Not Completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusTab === 'Not Completed' ? 'bg-white dark:bg-slate-800 text-rose-700 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-rose-700'
                }`}
              >
                Not Done ({activeStudentList.filter(s => s.status === 'Not Completed').length})
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-200 rounded-xl text-xs font-bold transition-colors border border-teal-200 dark:border-teal-800 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

          </div>

          {/* Student Data Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-extrabold border-b">
                  <tr>
                    <th className="px-5 py-4 w-14">#</th>
                    <th className="px-5 py-4">Student Name</th>
                    <th className="px-5 py-4">Roll No</th>
                    <th className="px-5 py-4">Admission No</th>
                    {reportType === 'assign' && (
                      <th className="px-5 py-4">Assignment Scope</th>
                    )}
                    <th className="px-5 py-4">Status</th>
                    {reportType === 'remark' ? (
                      <>
                        <th className="px-5 py-4">Rating</th>
                        <th className="px-5 py-4">Teacher Remark</th>
                      </>
                    ) : (
                      <th className="px-5 py-4">Submission Remark</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 font-bold">
                        {idx + 1}.
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shadow-inner flex-shrink-0 border border-slate-300/40">
                            {student.avatar ? (
                              <img src={student.avatar} alt={student.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span>{student.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              Father: {student.fatherName || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                        {student.rollNo}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-mono">
                        {student.admissionNo}
                      </td>

                      {reportType === 'assign' && (
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-[11px] font-bold">
                            <Check className="w-3 h-3 text-teal-600 stroke-[3]" />
                            Assigned
                          </span>
                        </td>
                      )}

                      <td className="px-5 py-3.5">
                        {student.status === 'Completed' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 text-xs font-bold shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Completed
                          </span>
                        )}
                        {student.status === 'Not Completed' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 text-xs font-bold shadow-2xs">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Not Completed
                          </span>
                        )}
                        {student.status === 'Rescheduled' && (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 text-xs font-bold shadow-2xs w-fit">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Rescheduled
                            </span>
                            {student.rescheduledDate && (
                              <span className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold">
                                Due: {student.rescheduledDate}
                              </span>
                            )}
                          </div>
                        )}
                        {student.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 text-xs font-bold shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Pending
                          </span>
                        )}
                      </td>

                      {reportType === 'remark' ? (
                        <>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 text-xs font-bold shadow-2xs">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              {student.rating ? `${student.rating}★` : '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {student.remark ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-bold">
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                {student.remark}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                        </>
                      ) : (
                        <td className="px-5 py-3.5">
                          {student.remark ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-teal-800 dark:text-teal-200 text-xs font-bold">
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              {student.remark}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={reportType === 'assign' ? 7 : 7} className="px-5 py-10 text-center text-slate-400 font-bold">
                        No students found for the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Back Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('subjects')}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              ‹ Back to Assigned Tasks
            </button>
          </div>

        </div>
      )}

    </div>
  )
}

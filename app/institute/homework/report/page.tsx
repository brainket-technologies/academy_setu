'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  ChevronLeft, ChevronRight, Users, GraduationCap, 
  Calendar, FileText, Search, Check, X, ArrowLeft, 
  Clock, CheckCircle2, User, BookOpen, AlertCircle,
  Filter, Sparkles, Download, Eye, ChevronDown,
  BarChart3, MessageSquare, Award, CheckCircle, XCircle,
  LayoutGrid, Table as TableIcon, Printer, ArrowUpRight,
  RefreshCw, TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'
import { fetchStudents } from '@/app/institute/students/actions'
import { fetchTeachers } from '@/app/institute/teachers/actions'
import { 
  fetchHomeworkTasks, 
  fetchTaskSubmissions 
} from '@/app/institute/homework/assign/actions'

// Types
interface ClassCardItem {
  id: string
  className: string
  section: string
  classTeacher: string
  studentsCount: number
  assignedCount: number
  completedCount: number
  notCompletedCount: number
  rescheduledCount: number
  tasksCount: number
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

interface StudentReportItem {
  id: string
  name: string
  fatherName?: string
  rollNo: string
  admissionNo: string
  avatar?: string
  status: 'Completed' | 'Not Completed' | 'Rescheduled' | 'Pending'
  remark?: string
  submittedAt?: string
}

// Subject color palettes for dynamic subjects
const SUBJECT_PALETTES = [
  { bgColor: 'bg-sky-50/80 hover:bg-sky-100/90', borderColor: 'border-sky-200', textColor: 'text-sky-950', badgeColor: 'bg-white text-sky-800' },
  { bgColor: 'bg-emerald-50/80 hover:bg-emerald-100/90', borderColor: 'border-emerald-200', textColor: 'text-emerald-950', badgeColor: 'bg-white text-emerald-800' },
  { bgColor: 'bg-rose-50/80 hover:bg-rose-100/90', borderColor: 'border-rose-200', textColor: 'text-rose-950', badgeColor: 'bg-white text-rose-800' },
  { bgColor: 'bg-amber-50/80 hover:bg-amber-100/90', borderColor: 'border-amber-200', textColor: 'text-amber-950', badgeColor: 'bg-white text-amber-800' },
  { bgColor: 'bg-purple-50/80 hover:bg-purple-100/90', borderColor: 'border-purple-200', textColor: 'text-purple-950', badgeColor: 'bg-white text-purple-800' },
  { bgColor: 'bg-orange-50/80 hover:bg-orange-100/90', borderColor: 'border-orange-200', textColor: 'text-orange-950', badgeColor: 'bg-white text-orange-800' },
]

// Canonical class and section matching helper
function matchesClassAndSection(student: any, cardClassName: string, cardSection: string): boolean {
  const sClass = String(
    student.class || student.className || student.class_name || student.current_class || ''
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

  // Real data state
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [allTeachers, setAllTeachers] = useState<any[]>([])
  const [allTasks, setAllTasks] = useState<any[]>([])
  const [taskSubmissionsMap, setTaskSubmissionsMap] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState<boolean>(true)

  // Navigation steps: 'classes' (Screen 1) -> 'subjects' (Screen 2) -> 'report' (Screen 3)
  const [currentStep, setCurrentStep] = useState<'classes' | 'subjects' | 'report'>('classes')

  // Selections
  const [selectedClassCard, setSelectedClassCard] = useState<ClassCardItem | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null)

  // Date selection state
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(2026, 9, 24))
  const [dateStripCenter, setDateStripCenter] = useState<Date>(() => new Date(2026, 9, 24))

  // Filter & View Mode
  const [classFilter, setClassFilter] = useState<string>('All Classes')
  const [sectionFilter, setSectionFilter] = useState<string>('All Sections')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Search & Filter on Screen 3
  const [studentSearch, setStudentSearch] = useState<string>('')
  const [statusTab, setStatusTab] = useState<'All' | 'Completed' | 'Not Completed' | 'Rescheduled' | 'Pending'>('All')

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
        fullDateStr: d.toISOString().split('T')[0],
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
        // 1. Fetch Real Students from DB and LocalStorage
        let combinedStudents: any[] = []
        const parseLocal = (k: string) => {
          try {
            const raw = localStorage.getItem(k)
            return raw ? JSON.parse(raw) : []
          } catch { return [] }
        }

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

        // 4. Preload Real Submissions from LocalStorage
        const subMap: Record<string, any[]> = {}
        for (const task of combinedTasks) {
          if (task.id) {
            const rawSubs = localStorage.getItem(`hw_sub_${task.id}`)
            if (rawSubs) {
              try {
                const parsed = JSON.parse(rawSubs)
                subMap[task.id] = getSafeSubmissionsArray(parsed)
              } catch {}
            }
          }
        }
        setTaskSubmissionsMap(subMap)

      } catch (err) {
        console.error('Failed to load homework report data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // When viewing Screen 3, fetch submissions for active task
  useEffect(() => {
    if (currentStep === 'report' && selectedClassCard && selectedSubject) {
      const matchedTask = allTasks.find(t => 
        t.classes && selectedClassCard.className &&
        t.classes.toLowerCase().trim() === selectedClassCard.className.toLowerCase().trim() &&
        t.subject && selectedSubject.subjectName &&
        t.subject.toLowerCase().trim() === selectedSubject.subjectName.toLowerCase().trim()
      )
      if (matchedTask?.id && !taskSubmissionsMap[matchedTask.id]) {
        fetchTaskSubmissions(matchedTask.id).then(res => {
          if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
            setTaskSubmissionsMap(prev => ({
              ...prev,
              [matchedTask.id]: res.data
            }))
          }
        })
      }
    }
  }, [currentStep, selectedClassCard, selectedSubject, allTasks, taskSubmissionsMap])

  // Build Real Class Cards (Deduplicated, 100% Real Enrolled Students & Real Tasks)
  const classCards: ClassCardItem[] = useMemo(() => {
    const list: ClassCardItem[] = []
    const processedKeys = new Set<string>()

    // Selected date formatted string
    const selectedDateStr = selectedDate.toISOString().split('T')[0]

    // 1. Gather all unique classes either from mastersData or from enrolled students
    const classesSource = (classesData && classesData.length > 0)
      ? classesData
      : Array.from(new Set(allStudents.map(s => s.class || s.className || s.class_name).filter(Boolean)))
          .map(name => ({ className: name }))

    classesSource.forEach((cls: any, cIdx: number) => {
      const cName = String(cls.className || cls.name || '').trim()
      if (!cName) return

      // Determine valid sections for this class without duplicating
      let secList: string[] = []

      if (Array.isArray(cls.sections) && cls.sections.length > 0) {
        secList = Array.from(new Set(
          cls.sections.map((s: any) => String(s.name || s.sectionName || s).trim().toUpperCase())
        )).filter(Boolean) as string[]
      } else {
        // Check sections of students enrolled in this class
        const studentSecs = Array.from(new Set(
          allStudents
            .filter(s => matchesClassAndSection(s, cName, 'all'))
            .map(s => String(s.section || s.section_name || s.sectionName || '').trim().toUpperCase())
        )).filter(Boolean) as string[]

        if (studentSecs.length > 0) {
          secList = studentSecs
        } else if (sectionsData && sectionsData.length > 0) {
          // Use unique section names from sectionsData
          secList = Array.from(new Set(
            sectionsData.map((s: any) => String(s.sectionName || s.name || s).trim().toUpperCase())
          )).filter(Boolean) as string[]
        } else {
          secList = ['A']
        }
      }

      // Add each section once
      secList.forEach(sec => {
        const uniqueKey = `${cName.toLowerCase()}___${sec.toLowerCase()}`
        if (processedKeys.has(uniqueKey)) return
        processedKeys.add(uniqueKey)

        // Real enrolled students in this class and section
        const matchedStudents = allStudents.filter(s => matchesClassAndSection(s, cName, sec))
        const count = matchedStudents.length

        // Match real tasks assigned for this class and section on selectedDate
        const matchingTasks = allTasks.filter(t => {
          const classMatch = matchesClassAndSection({ class: t.classes, section: t.section }, cName, sec)
          if (!classMatch) return false
          const tDate = t.assignDate || t.assign_date
          return !tDate || tDate === selectedDateStr
        })

        // Real submission counts from actual submissions
        let completed = 0
        let notCompleted = 0
        let rescheduled = 0

        matchingTasks.forEach(task => {
          const subs = getSafeSubmissionsArray(taskSubmissionsMap[task.id])
          subs.forEach((sub: any) => {
            const st = String(sub.status || '').toLowerCase()
            if (st === 'completed' || st === 'done') completed++
            else if (st === 'incomplete' || st === 'not completed') notCompleted++
            else if (st === 'rescheduled') rescheduled++
          })
        })

        // Real assigned count: if tasks exist, count enrolled students; else 0
        const assigned = matchingTasks.length > 0 ? (count > 0 ? count : 0) : 0

        // Find real class teacher from allTeachers
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
          assignedCount: assigned,
          completedCount: completed,
          notCompletedCount: notCompleted,
          rescheduledCount: rescheduled,
          tasksCount: matchingTasks.length
        })
      })
    })

    return list
  }, [classesData, sectionsData, allStudents, allTeachers, allTasks, taskSubmissionsMap, selectedDate])

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

  // Overall Statistics for Screen 1 (100% Real Calculations)
  const overallStats = useMemo(() => {
    const totalClasses = new Set(filteredClassCards.map(c => c.className)).size
    const totalStudents = filteredClassCards.reduce((acc, c) => acc + c.studentsCount, 0)
    const totalAssigned = filteredClassCards.reduce((acc, c) => acc + c.assignedCount, 0)
    const totalCompleted = filteredClassCards.reduce((acc, c) => acc + c.completedCount, 0)
    const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0

    return { totalClasses, totalStudents, totalAssigned, totalCompleted, completionRate }
  }, [filteredClassCards])

  // Build Real Subjects for Selected Class
  const classSubjects: SubjectItem[] = useMemo(() => {
    if (!selectedClassCard) return []

    if (subjectsData && subjectsData.length > 0) {
      const filtered = subjectsData.filter((s: any) => 
        !s.deleted && (
          !s.className || 
          s.className.toLowerCase().trim() === selectedClassCard.className.toLowerCase().trim()
        )
      )

      if (filtered.length > 0) {
        return filtered.map((s: any, idx: number) => {
          const sName = s.subjectName || s.name || `Subject ${idx + 1}`
          const palette = SUBJECT_PALETTES[idx % SUBJECT_PALETTES.length]

          // Find real teacher teaching this subject for this class
          const teacher = allTeachers.find((t: any) => {
            const assigned = JSON.stringify(t.assigned_classes || t.assignedClasses || []).toLowerCase()
            return assigned.includes(sName.toLowerCase())
          })

          return {
            id: s.id || `subj-${idx}`,
            subjectName: sName,
            teacherName: teacher?.name || s.teacherName || s.teacher || 'Unassigned',
            bgColor: palette.bgColor,
            borderColor: palette.borderColor,
            textColor: palette.textColor,
            badgeColor: palette.badgeColor
          }
        })
      }
    }

    // Also check if any tasks exist for this class with subjects
    const tasksForClass = allTasks.filter(t => 
      t.classes && selectedClassCard.className &&
      t.classes.toLowerCase().trim() === selectedClassCard.className.toLowerCase().trim()
    )
    const taskSubjects = Array.from(new Set(tasksForClass.map(t => t.subject).filter(Boolean)))
    if (taskSubjects.length > 0) {
      return taskSubjects.map((sName, idx) => {
        const palette = SUBJECT_PALETTES[idx % SUBJECT_PALETTES.length]
        return {
          id: `task-subj-${idx}`,
          subjectName: sName,
          teacherName: 'Faculty',
          bgColor: palette.bgColor,
          borderColor: palette.borderColor,
          textColor: palette.textColor,
          badgeColor: palette.badgeColor
        }
      })
    }

    return []
  }, [selectedClassCard, subjectsData, allTeachers, allTasks])

  // Active Task for Screen 3
  const activeTask = useMemo(() => {
    if (!selectedClassCard || !selectedSubject) return null
    return allTasks.find(t => 
      t.classes && selectedClassCard.className &&
      t.classes.toLowerCase().trim() === selectedClassCard.className.toLowerCase().trim() &&
      t.subject && selectedSubject.subjectName &&
      t.subject.toLowerCase().trim() === selectedSubject.subjectName.toLowerCase().trim()
    ) || null
  }, [selectedClassCard, selectedSubject, allTasks])

  // Student Report Items for Screen 3 (100% Real Enrolled Students Only)
  const studentReports: StudentReportItem[] = useMemo(() => {
    if (!selectedClassCard) return []

    // Only get students really enrolled in this specific class & section
    const enrolled = allStudents.filter(s => 
      matchesClassAndSection(s, selectedClassCard.className, selectedClassCard.section)
    )

    if (enrolled.length === 0) return []

    const rawSubs = activeTask?.id ? taskSubmissionsMap[activeTask.id] : []
    const submissions = getSafeSubmissionsArray(rawSubs)
    const subMap = new Map<string, any>()
    submissions.forEach((sub: any) => {
      subMap.set(String(sub.student_id || sub.studentId || sub.id), sub)
    })

    return enrolled.map((s, idx) => {
      const sId = String(s.id || s.admission_no || s.admissionNo || idx)
      const sub = subMap.get(sId)
      
      let status: 'Completed' | 'Not Completed' | 'Rescheduled' | 'Pending' = 'Pending'
      if (sub?.status) {
        const st = String(sub.status).toLowerCase()
        if (st === 'completed' || st === 'done') status = 'Completed'
        else if (st === 'not completed' || st === 'incomplete') status = 'Not Completed'
        else if (st === 'rescheduled') status = 'Rescheduled'
      }

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
        remark: sub?.remark || ''
      }
    })
  }, [selectedClassCard, allStudents, activeTask, taskSubmissionsMap])

  // Calculated stats for Screen 3 overview
  const reportStats = useMemo(() => {
    const completed = studentReports.filter(s => s.status === 'Completed').length
    const notCompleted = studentReports.filter(s => s.status === 'Not Completed').length
    const rescheduled = studentReports.filter(s => s.status === 'Rescheduled').length
    const pending = studentReports.filter(s => s.status === 'Pending').length
    const total = studentReports.length

    return {
      completed,
      notCompleted,
      rescheduled,
      pending,
      total,
      completedPct: total > 0 ? Math.round((completed / total) * 100) : 0,
      notCompletedPct: total > 0 ? Math.round((notCompleted / total) * 100) : 0,
      rescheduledPct: total > 0 ? Math.round((rescheduled / total) * 100) : 0
    }
  }, [studentReports])

  // Filtered Students for Screen 3
  const filteredStudents = useMemo(() => {
    return studentReports.filter(s => {
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
  }, [studentReports, statusTab, studentSearch])

  // Export CSV Handler
  const handleExportCSV = () => {
    if (studentReports.length === 0) return
    const headers = ['Roll No', 'Student Name', "Father's Name", 'Admission No', 'Class', 'Section', 'Subject', 'Status', 'Remarks']
    const rows = studentReports.map(s => [
      s.rollNo,
      `"${s.name}"`,
      `"${s.fatherName || ''}"`,
      s.admissionNo,
      selectedClassCard?.className || '',
      selectedClassCard?.section || '',
      selectedSubject?.subjectName || '',
      s.status,
      `"${s.remark || ''}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `homework_report_${selectedClassCard?.className}_${selectedSubject?.subjectName}_${selectedDate.toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Navigation Handlers
  const handleViewReport = (card: ClassCardItem) => {
    setSelectedClassCard(card)
    setCurrentStep('subjects')
  }

  const handleSelectSubject = (subj: SubjectItem) => {
    setSelectedSubject(subj)
    setCurrentStep('report')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. DESKTOP WEB BREADCRUMB & HEADER                                        */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-teal-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-emerald-100 font-semibold mb-2">
            <Link href="/institute/homework" className="hover:underline flex items-center gap-1">
              <span>Homework Hub</span>
            </Link>
            <span>/</span>
            <button 
              onClick={() => setCurrentStep('classes')} 
              className={`hover:underline ${currentStep === 'classes' ? 'text-white font-bold' : ''}`}
            >
              Classes Overview
            </button>
            {selectedClassCard && currentStep !== 'classes' && (
              <>
                <span>/</span>
                <button 
                  onClick={() => setCurrentStep('subjects')}
                  className={`hover:underline ${currentStep === 'subjects' ? 'text-white font-bold' : ''}`}
                >
                  {selectedClassCard.className} (Sec {selectedClassCard.section})
                </button>
              </>
            )}
            {selectedSubject && currentStep === 'report' && (
              <>
                <span>/</span>
                <span className="text-white font-bold">{selectedSubject.subjectName} Report</span>
              </>
            )}
          </div>

          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
            {currentStep === 'classes' && 'Homework Reports & Analytics'}
            {currentStep === 'subjects' && `Select Subject — ${selectedClassCard?.className} Sec ${selectedClassCard?.section}`}
            {currentStep === 'report' && `${selectedSubject?.subjectName} Homework Report`}
          </h1>
          <p className="text-xs lg:text-sm text-emerald-100 mt-1 max-w-2xl">
            {currentStep === 'classes' && 'Real-time homework submission stats, enrolled student counts, and class curriculum evaluations.'}
            {currentStep === 'subjects' && 'Choose a subject below to view enrolled students, evaluation status, and remarks.'}
            {currentStep === 'report' && 'Evaluation breakdown, submission status, and individual student remarks for this assignment.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {currentStep !== 'classes' && (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 'report') setCurrentStep('subjects')
                else if (currentStep === 'subjects') setCurrentStep('classes')
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {currentStep === 'report' && (
            <>
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/60 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold border border-emerald-500/40 transition-all"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </>
          )}

          {currentStep === 'classes' && (
            <Link
              href="/institute/homework/assign"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Assign Homework
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 1: CLASSES OVERVIEW (DESKTOP WEB VIEW - REAL DATA)                  */}
      {/* ========================================================================= */}
      {currentStep === 'classes' && (
        <div className="space-y-6">

          {/* 4 Desktop Metric Summary Cards (100% Real Numbers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Active Classes</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{overallStats.totalClasses}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Enrolled</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{overallStats.totalStudents} Students</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Completed</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{overallStats.totalCompleted} Submissions</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Avg Completion Rate</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{overallStats.completionRate}%</h3>
              </div>
            </div>
          </div>

          {/* Desktop Date Ribbon & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            
            {/* Top row: Date navigation ribbon */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
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
                      className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all ${
                        item.isSelected
                          ? 'bg-[#0d8065] text-white shadow-sm font-bold scale-105'
                          : 'hover:bg-slate-100 text-slate-700 dark:text-slate-300'
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
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={e => {
                    if (e.target.value) {
                      const d = new Date(e.target.value)
                      setSelectedDate(d)
                      setDateStripCenter(d)
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl outline-none focus:border-teal-600 bg-white shadow-2xs"
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
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-600 shadow-2xs"
                />
              </div>

              {/* Class & Section Filters */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-600 bg-white shadow-2xs cursor-pointer"
                >
                  <option value="All Classes">All Classes</option>
                  {Array.from(new Set(classCards.map(c => c.className))).map(cName => (
                    <option key={cName} value={cName}>{cName}</option>
                  ))}
                </select>

                <select
                  value={sectionFilter}
                  onChange={e => setSectionFilter(e.target.value)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-600 bg-white shadow-2xs cursor-pointer"
                >
                  <option value="All Sections">All Sections</option>
                  {Array.from(new Set(classCards.map(c => c.section))).map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>

                {/* View Mode Toggle: Grid vs Table */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'table' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
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
                const completionPct = card.assignedCount > 0 ? Math.round((card.completedCount / card.assignedCount) * 100) : 0

                return (
                  <div
                    key={card.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      {/* Top Row: Class Info & Section Pill */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#0d8065] text-white flex items-center justify-center font-bold shadow-xs">
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

                        <span className="px-2.5 py-1 rounded-lg bg-[#0d8065] text-white text-[11px] font-bold shadow-2xs">
                          Sec {card.section}
                        </span>
                      </div>

                      {/* 4 Metric Badges in 2x2 Grid (100% Real Numbers) */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-purple-50/80 border border-purple-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                          <span className="text-[11px] font-bold text-purple-900">
                            Assigned: {card.assignedCount}
                          </span>
                        </div>

                        <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          <span className="text-[11px] font-bold text-emerald-900">
                            Completed: {card.completedCount}
                          </span>
                        </div>

                        <div className="bg-rose-50/80 border border-rose-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                          <span className="text-[11px] font-bold text-rose-900">
                            Not Done: {card.notCompletedCount}
                          </span>
                        </div>

                        <div className="bg-amber-50/80 border border-amber-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                          <span className="text-[11px] font-bold text-amber-900">
                            Rescheduled: {card.rescheduledCount}
                          </span>
                        </div>
                      </div>

                      {/* Visual Completion Progress Bar */}
                      <div className="mt-3.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                          <span>Completion Rate</span>
                          <span className="font-bold text-slate-800">{completionPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#0d8065] h-full transition-all duration-300" 
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{card.studentsCount} Students</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewReport(card)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0d8065] hover:bg-[#0a6c55] text-white rounded-xl text-xs font-bold shadow-2xs group-hover:scale-102 transition-all cursor-pointer"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        View Report
                      </button>
                    </div>
                  </div>
                )
              })}

              {filteredClassCards.length === 0 && (
                <div className="col-span-full bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-400 font-bold border border-slate-200">
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
                      <th className="px-5 py-3.5">Assigned</th>
                      <th className="px-5 py-3.5 text-emerald-700">Completed</th>
                      <th className="px-5 py-3.5 text-rose-700">Not Completed</th>
                      <th className="px-5 py-3.5 text-amber-700">Rescheduled</th>
                      <th className="px-5 py-3.5">Completion %</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {filteredClassCards.map(card => {
                      const completionPct = card.assignedCount > 0 ? Math.round((card.completedCount / card.assignedCount) * 100) : 0

                      return (
                        <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            {card.className} - Sec {card.section}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 font-medium">
                            {card.classTeacher}
                          </td>
                          <td className="px-5 py-3.5 font-bold">
                            {card.studentsCount} Students
                          </td>
                          <td className="px-5 py-3.5 font-bold text-purple-700">
                            {card.assignedCount}
                          </td>
                          <td className="px-5 py-3.5 font-extrabold text-emerald-700">
                            {card.completedCount}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-rose-600">
                            {card.notCompletedCount}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-amber-600">
                            {card.rescheduledCount}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-extrabold text-slate-800">{completionPct}%</span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewReport(card)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d8065] hover:bg-[#0a6c55] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                              View
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
      {/* SCREEN 2: SELECT SUBJECT (DESKTOP WEB VIEW - REAL SUBJECTS ONLY)           */}
      {/* ========================================================================= */}
      {currentStep === 'subjects' && selectedClassCard && (
        <div className="space-y-6">
          
          {/* Class Summary Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0d8065] text-white flex items-center justify-center font-bold shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedClassCard.className}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#0d8065] text-white text-xs font-bold">
                    Section {selectedClassCard.section}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Class Teacher: <strong className="text-slate-700">{selectedClassCard.classTeacher}</strong> • Enrolled: <strong className="text-slate-700">{selectedClassCard.studentsCount} Students</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep('classes')}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Choose Different Class
              </button>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Available Subjects ({classSubjects.length})
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Click on any subject below to view student evaluations and detailed report
              </p>
            </div>
          </div>

          {/* Responsive Multi-Column Subjects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {classSubjects.map(subj => (
              <div
                key={subj.id}
                onClick={() => handleSelectSubject(subj)}
                className={`rounded-2xl p-5 shadow-xs border transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md hover:scale-[1.02] active:scale-[0.99] group ${subj.bgColor} ${subj.borderColor}`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="w-8 h-8 rounded-xl bg-white/90 shadow-2xs flex items-center justify-center text-slate-700 font-bold">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                    </span>
                    <div className="w-7 h-7 rounded-full bg-white shadow-2xs flex items-center justify-center text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className={`font-black text-base mt-3 leading-tight ${subj.textColor}`}>
                    {subj.subjectName}
                  </h3>

                  <div className="mt-3 inline-block px-3 py-1 rounded-lg bg-white shadow-2xs border border-slate-100 text-xs font-bold text-slate-700">
                    Teacher: {subj.teacherName}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>View Student Reports</span>
                  <span className="text-emerald-700 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}

            {classSubjects.length === 0 && (
              <div className="col-span-full bg-white dark:bg-slate-800 rounded-2xl p-10 text-center text-slate-400 font-bold border border-slate-200">
                No subjects configured for {selectedClassCard.className}. Please add subjects in Masters &gt; Subjects.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: DETAILED STUDENT HOMEWORK REPORT (REAL ENROLLED STUDENTS ONLY)   */}
      {/* ========================================================================= */}
      {currentStep === 'report' && selectedClassCard && selectedSubject && (
        <div className="space-y-6">
          
          {/* Assignment Overview Wide Banner */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-5">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0d8065] text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {selectedSubject.subjectName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                      {selectedClassCard.className} Sec {selectedClassCard.section}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Due: {activeTask?.submissionDate || activeTask?.submission_date || '—'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5 leading-tight">
                    {activeTask?.title || `${selectedSubject.subjectName} Homework Assignment`}
                  </h2>
                </div>
              </div>

              {/* Progress Bar Badge */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500">Overall Completion</span>
                  <p className="text-lg font-black text-[#0d8065]">{reportStats.completedPct}%</p>
                </div>
                <div className="w-20 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#0d8065] h-full" style={{ width: `${reportStats.completedPct}%` }} />
                </div>
              </div>
            </div>

            {/* 4 Metric Summary Boxes in a Grid (100% Real Numbers) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div 
                onClick={() => setStatusTab('All')}
                className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                  statusTab === 'All' ? 'ring-2 ring-teal-500 bg-teal-50/50 border-teal-200 shadow-xs' : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100/70'
                }`}
              >
                <div className="text-2xl font-black text-slate-800">{reportStats.total}</div>
                <div className="text-xs font-bold text-slate-600 mt-1">Total Enrolled</div>
              </div>

              <div 
                onClick={() => setStatusTab('Completed')}
                className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                  statusTab === 'Completed' ? 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-200 shadow-xs' : 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50'
                }`}
              >
                <div className="text-2xl font-black text-emerald-700">{reportStats.completed}</div>
                <div className="text-xs font-bold text-emerald-800 mt-1">Completed ({reportStats.completedPct}%)</div>
              </div>

              <div 
                onClick={() => setStatusTab('Not Completed')}
                className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                  statusTab === 'Not Completed' ? 'ring-2 ring-rose-500 bg-rose-50 border-rose-200 shadow-xs' : 'bg-rose-50/50 border-rose-100 hover:bg-rose-50'
                }`}
              >
                <div className="text-2xl font-black text-rose-700">{reportStats.notCompleted}</div>
                <div className="text-xs font-bold text-rose-800 mt-1">Not Completed ({reportStats.notCompletedPct}%)</div>
              </div>

              <div 
                onClick={() => setStatusTab('Pending')}
                className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                  statusTab === 'Pending' ? 'ring-2 ring-amber-500 bg-amber-50 border-amber-200 shadow-xs' : 'bg-amber-50/50 border-amber-100 hover:bg-amber-50'
                }`}
              >
                <div className="text-2xl font-black text-amber-700">{reportStats.pending}</div>
                <div className="text-xs font-bold text-amber-800 mt-1">Pending / Rescheduled</div>
              </div>
            </div>

          </div>

          {/* Desktop Toolbar: Search, Status Filter Tabs & Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Search by student name, roll no..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-600 shadow-2xs"
              />
              {studentSearch && (
                <button
                  type="button"
                  onClick={() => setStudentSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setStatusTab('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusTab === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({reportStats.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('Completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusTab === 'Completed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Completed ({reportStats.completed})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('Not Completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusTab === 'Not Completed' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                Not Done ({reportStats.notCompleted})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('Pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusTab === 'Pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                Pending ({reportStats.pending})
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors border border-teal-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>

          </div>

          {/* Desktop Student Data Table (100% Real Enrolled Students) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-extrabold border-b">
                  <tr>
                    <th className="px-5 py-4 w-14">#</th>
                    <th className="px-5 py-4">Student Name</th>
                    <th className="px-5 py-4">Roll No</th>
                    <th className="px-5 py-4">Admission No</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Teacher Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
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
                      <td className="px-5 py-3.5 font-bold text-slate-700">
                        {student.rollNo}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-mono">
                        {student.admissionNo}
                      </td>
                      <td className="px-5 py-3.5">
                        {student.status === 'Completed' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Completed
                          </span>
                        )}
                        {student.status === 'Not Completed' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-2xs">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Not Completed
                          </span>
                        )}
                        {student.status === 'Rescheduled' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Rescheduled
                          </span>
                        )}
                        {student.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {student.remark ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                            <MessageSquare className="w-3 h-3 text-emerald-600" />
                            {student.remark}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-400 font-bold">
                        No students enrolled in {selectedClassCard.className} Section {selectedClassCard.section}.
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
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              ‹ Choose Different Subject
            </button>
          </div>

        </div>
      )}

    </div>
  )
}

'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  ArrowLeft, ChevronLeft, ChevronRight, GraduationCap, Users, User,
  BookOpen, FileText, Paperclip, Calendar, Clock, Check, Plus,
  Search, Upload, X, Loader2, Sparkles, Send, Signal, Wifi,
  Battery, AlertCircle, CheckCircle2, ChevronDown, Download,
  Trash2, Eye, RefreshCw, Filter, Layers, CheckSquare
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'
import { fetchStudents } from '@/app/institute/students/actions'
import { fetchTeachers } from '@/app/institute/teachers/actions'
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

export default function HomeworkAssignPage() {
  const router = useRouter()

  // ── CURRENT 4-PAGE ACTIVE STEP ──
  const [currentScreen, setCurrentScreen] = useState<StepScreen>('classes')

  // Selected State
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
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
  const [tasks, setTasks] = useState<HomeworkTaskItem[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)

  // Page 1 Filters (Class & Section)
  const [filterClass, setFilterClass] = useState<string>('All')
  const [filterSection, setFilterSection] = useState<string>('All')

  // Page 4 Search (Students)
  const [studentSearch, setStudentSearch] = useState('')

  // Page 1: 7-Day Date Slider Strip matching Screenshot 1
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(() => new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date())

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

    } catch (err) {
      console.error('Error loading real homework data:', err)
    } finally {
      setLoadingTasks(false)
    }
  }

  useEffect(() => {
    loadData()
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

          const teacher = c.classTeacher || c.class_teacher || allTeachers.find((t: any) => {
            const tClass = String(t.class_teacher || t.className || t.class || '').toLowerCase()
            return tClass.includes(cName.toLowerCase())
          })?.name || 'Not Assigned'

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
        list.push({
          id: `${item.className}-${item.section}`,
          className: item.className,
          section: item.section,
          classTeacher: 'Not Assigned',
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

  // ── Subject Cards for Page 2 (Built ONLY from Real Masters & Real Tasks) ──
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

    // Also include any subjects created in real tasks for this institute (e.g. 'Physics')
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

  const allClassStudentIds = useMemo(() => {
    return currentClassStudents.map(st => getStudentKey(st))
  }, [currentClassStudents])

  const isAllStudentsSelected = useMemo(() => {
    if (allClassStudentIds.length === 0) return false
    return allClassStudentIds.every(id => assignedStudentIds.includes(id))
  }, [allClassStudentIds, assignedStudentIds])

  const handleToggleSelectAll = () => {
    if (isAllStudentsSelected) {
      setAssignedStudentIds([])
    } else {
      setAssignedStudentIds(allClassStudentIds)
    }
  }

  const toggleStudentSelection = (stId: string) => {
    setAssignedStudentIds(prev => {
      const exists = prev.includes(stId)
      return exists ? prev.filter(id => id !== stId) : [...prev, stId]
    })
  }

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
  const [formAssignTarget, setFormAssignTarget] = useState<'entire' | 'specific'>('entire')
  const [formSelectedStudentIds, setFormSelectedStudentIds] = useState<string[]>([])
  const [formAttachmentName, setFormAttachmentName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      studentsCount: formAssignTarget === 'specific' ? formSelectedStudentIds.length : currentClassStudents.length
    }

    try {
      await createHomeworkTask(newTask)
      const updated = [newTask, ...tasks]
      setTasks(updated)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
        } catch (e) {}
      }

      showToast('Task created and published successfully!', 'success')
      setFormTitle('')
      setFormDesc('')
      setFormAttachmentName('')
      setFormSelectedStudentIds([])
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
      
      {/* ── BREADCRUMBS BAR (Full Width) ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-slate-500 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Link href="/institute/homework" className="hover:text-teal-600 transition-colors shrink-0 font-bold">
            Homework
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          
          <button
            type="button"
            onClick={() => setCurrentScreen('classes')}
            className={`cursor-pointer transition-colors shrink-0 ${
              currentScreen === 'classes' ? 'text-[#0f766e] font-black' : 'hover:text-teal-600'
            }`}
          >
            1. Classes
          </button>

          {currentScreen !== 'classes' && selectedClass && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                type="button"
                onClick={() => setCurrentScreen('subjects')}
                className={`cursor-pointer transition-colors shrink-0 ${
                  currentScreen === 'subjects' ? 'text-[#0f766e] font-black' : 'hover:text-teal-600'
                }`}
              >
                2. {selectedClass} - Sec {selectedSection} (Subjects)
              </button>
            </>
          )}

          {(currentScreen === 'tasks' || currentScreen === 'students' || currentScreen === 'create_task') && selectedSubject && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                type="button"
                onClick={() => setCurrentScreen('tasks')}
                className={`cursor-pointer transition-colors shrink-0 ${
                  currentScreen === 'tasks' ? 'text-[#0f766e] font-black' : 'hover:text-teal-600'
                }`}
              >
                3. {selectedSubject} Tasks
              </button>
            </>
          )}

          {currentScreen === 'students' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[#0f766e] font-black shrink-0">4. Assigned Students</span>
            </>
          )}

          {currentScreen === 'create_task' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[#0f766e] font-black shrink-0">4. Create Task</span>
            </>
          )}
        </div>

        {/* Quick Hub Navigation Pills */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <Link
            href="/institute/homework/remark"
            className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Remark
          </Link>
          <Link
            href="/institute/homework/pending-assign"
            className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Pending Assign
          </Link>
          <Link
            href="/institute/homework/report"
            className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Report
          </Link>
        </div>
      </div>

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
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Class Teacher: <strong className="text-slate-700 dark:text-slate-200">{selectedTeacherName || 'Not Assigned'}</strong> • {subjectCards.length} Subjects Configured
                </p>
              </div>
            </div>

            <span className="px-4 py-2 rounded-2xl bg-[#0f766e] text-white text-xs md:text-sm font-black shadow-xs">
              Section {selectedSection || 'A'}
            </span>
          </div>

          {/* Section Heading matching Screenshot 2 */}
          <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white pt-1">
            Subjects
          </h3>

          {/* Real Pastel Subject Cards matching Screenshot 2 (Full Width Stack) */}
          {subjectCards.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2 w-full">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No subjects configured in Masters</p>
              <p className="text-xs text-slate-400">Add subjects in Masters &gt; Subjects, or create a task directly to start.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedSubject('General')
                  setCurrentScreen('create_task')
                }}
                className="mt-3 px-5 py-2.5 rounded-2xl bg-[#0f766e] text-white text-xs font-bold shadow-xs hover:bg-[#0d655f] cursor-pointer"
              >
                + Create Task with Custom Subject
              </button>
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
                  <div className="space-y-2 min-w-0">
                    <h4 className={`text-base md:text-lg font-black truncate ${sub.textColor}`}>
                      Subject : {sub.subjectName}
                    </h4>
                    <div className="inline-block bg-white/95 dark:bg-slate-900/90 px-3.5 py-1.5 rounded-xl shadow-2xs">
                      <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                        Teacher : {sub.teacherName}
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

          {/* Student List Section Heading with Select All & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                Student List
              </h3>
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                {assignedStudentIds.length} of {currentClassStudents.length} Selected
              </span>
            </div>

            {/* Select All Toggle Button */}
            {currentClassStudents.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors w-fit"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  isAllStudentsSelected
                    ? 'bg-[#0f766e] border-[#0f766e] text-white'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                }`}>
                  {isAllStudentsSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {isAllStudentsSelected ? 'Deselect All' : 'Select All'} ({currentClassStudents.length})
                </span>
              </button>
            )}
          </div>

          {/* Real Student Cards List matching Screenshot 4 with Clean Toggle */}
          {currentClassStudents.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 space-y-2 w-full">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No students enrolled in {selectedClass} - Section {selectedSection}
              </p>
              <p className="text-xs text-slate-400">
                Add students in Student Management to populate this classroom roster.
              </p>
            </div>
          ) : (
            <div className="space-y-3 w-full">
              {currentClassStudents.map((st: any) => {
                const sId = getStudentKey(st)
                const sName = st.name || 'Student'
                const sRoll = st.rollNo || '001'
                const sAdm = st.admissionNo || 'ADM-001'
                const isChecked = assignedStudentIds.includes(sId)

                return (
                  <div
                    key={sId}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleStudentSelection(sId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleStudentSelection(sId)
                      }
                    }}
                    className={`rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs border transition-all flex items-center justify-between gap-3.5 w-full cursor-pointer select-none active:scale-[0.99] ${
                      isChecked
                        ? 'bg-teal-50/50 dark:bg-teal-950/20 border-[#0f766e] dark:border-teal-500 shadow-teal-950/5'
                        : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Styled Checkbox box */}
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-[#0f766e] border-[#0f766e] text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

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

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-teal-100 dark:bg-teal-900/60 text-[#0f766e] dark:text-teal-300 border border-teal-200 dark:border-teal-700'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {isChecked ? 'Assigned' : 'Not Assigned'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Assign / Update Homework Action Button */}
          {currentClassStudents.length > 0 && (
            <div className="pt-2 pb-8">
              <button
                type="button"
                onClick={handleSaveStudentAssignment}
                disabled={isAssigningStudents || assignedStudentIds.length === 0}
                className="w-full py-4 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white font-black text-sm md:text-base shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2.5 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAssigningStudents ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5 stroke-[3]" />
                )}
                <span>
                  {assignedStudentIds.length === 0
                    ? 'Select at least 1 student to assign'
                    : `Assign Homework to Selected (${assignedStudentIds.length} ${assignedStudentIds.length === 1 ? 'Student' : 'Students'})`}
                </span>
              </button>
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
            <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 w-full">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Assign To
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => setFormAssignTarget('entire')}
                  className={`py-2.5 px-4 rounded-2xl text-xs font-black transition-all border ${
                    formAssignTarget === 'entire'
                      ? 'bg-[#0f766e] text-white border-[#0f766e]'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Entire Class ({currentClassStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFormAssignTarget('specific')}
                  className={`py-2.5 px-4 rounded-2xl text-xs font-black transition-all border ${
                    formAssignTarget === 'specific'
                      ? 'bg-[#0f766e] text-white border-[#0f766e]'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Specific Students ({formSelectedStudentIds.length})
                </button>
              </div>

              {formAssignTarget === 'specific' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-h-56 overflow-y-auto space-y-1.5 mt-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700 dark:text-slate-200 select-none">
                      <input
                        type="checkbox"
                        checked={currentClassStudents.length > 0 && formSelectedStudentIds.length === currentClassStudents.length}
                        onChange={e => {
                          if (e.target.checked) setFormSelectedStudentIds(currentClassStudents.map(s => String(s.id || s.admissionNo)))
                          else setFormSelectedStudentIds([])
                        }}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 accent-[#0f766e] cursor-pointer"
                      />
                      <span>Select All ({currentClassStudents.length})</span>
                    </label>
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300">
                      {formSelectedStudentIds.length} of {currentClassStudents.length} Selected
                    </span>
                  </div>

                  {currentClassStudents.map((st: any) => {
                    const sId = String(st.id || st.admission_no)
                    const isChecked = formSelectedStudentIds.includes(sId)
                    return (
                      <label key={sId} className="flex items-center gap-2 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 cursor-pointer">
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
                        <span className="text-[11px] text-slate-400 ml-auto shrink-0">
                          Roll No: {st.rollNo}
                        </span>
                      </label>
                    )
                  })}
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

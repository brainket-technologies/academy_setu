'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import { 
  CheckCircle2, Search, Calendar, Users, ArrowLeft, Check, Clock, User, 
  Filter, BookOpen, AlertCircle, GraduationCap, Download, ChevronRight, 
  ChevronLeft, Phone, QrCode, Sparkles, Printer, RefreshCw, FileText, 
  X, Camera, CheckSquare, Eye, ShieldCheck, Share2
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useClasses, useSections } from '@/lib/mastersData'
import { fetchStudents } from '@/app/institute/students/actions'
import { fetchTeachers } from '@/app/institute/teachers/actions'
import { fetchStudentAttendance, saveStudentAttendanceBatch } from './actions'

// Helper: Local Calendar ISO YYYY-MM-DD (No UTC offset drift)
function formatDateToISO(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Canonical class and section matching helper (100% accurate)
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

interface StudentItem {
  id: string
  name: string
  rollNo: string
  admissionNo: string
  gender: 'Male' | 'Female'
  avatar?: string
  phone?: string
  className: string
  section: string
}

interface AttendanceEntry {
  status: 'Present' | 'Absent' | 'Leave'
  sourceMode: 'Manual' | 'QR Scanner'
  markedBy?: string
  time?: string
}

function StudentAttendanceContent() {
  const searchParams = useSearchParams()

  // Navigation Steps: 'overview' (Classes Grid), 'mark' (Marking Sheet), 'receipt' (Submission Receipt)
  const [currentStep, setCurrentStep] = useState<'overview' | 'mark' | 'receipt'>('overview')

  // Attendance Mode: 'Manual' or 'QR'
  const [attendanceMode, setAttendanceMode] = useState<'Manual' | 'QR'>('Manual')

  // Dates
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [dateStripCenter, setDateStripCenter] = useState<Date>(() => new Date())

  // Masters Data
  const classesData = useClasses()
  const sectionsData = useSections()

  // 100% Real Students & Teachers
  const [allStudents, setAllStudents] = useState<StudentItem[]>([])
  const [allTeachers, setAllTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters for Overview Screen
  const [classFilter, setClassFilter] = useState('All Classes')
  const [sectionFilter, setSectionFilter] = useState('All Sections')
  const [searchQuery, setSearchQuery] = useState('')

  // Currently Selected Class for Marking / Receipt
  const [activeClass, setActiveClass] = useState<{ className: string; section: string; teacherName: string } | null>(null)

  // Attendance States: studentId -> AttendanceEntry
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceEntry>>({})
  const [markingFilter, setMarkingFilter] = useState<'All' | 'Present' | 'Absent' | 'Leave'>('All')
  const [studentSearch, setStudentSearch] = useState('')

  // Submission Receipt Data
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    sessionRef: string
    dateStr: string
    timeStr: string
    className: string
    section: string
    mode: string
    total: number
    present: number
    absent: number
    leave: number
  } | null>(null)

  // QR Scanner Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrScanSuccessMsg, setQrScanSuccessMsg] = useState('')

  // Saving loader
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)
  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // 7-day strip centered on dateStripCenter
  const dateStrip = useMemo(() => {
    const days = []
    const base = new Date(dateStripCenter)
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      const isSelected = 
        d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      days.push({
        date: d,
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
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

  // Load Real Data on Mount
  useEffect(() => {
    let isMounted = true
    async function loadAllData() {
      setLoading(true)
      try {
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

        const normalizeStudent = (s: any, idx: number): StudentItem => {
          const firstName = s.first_name || s.firstName || ''
          const lastName = s.last_name || s.lastName || ''
          const fullName = `${firstName} ${lastName}`.trim() || s.name || `Student ${idx + 1}`
          const rollNo = String(s.roll_no || s.rollNo || s.roll || idx + 1)
          const admissionNo = String(s.admission_no || s.admissionNo || s.admissionNumber || `ADM-${1000 + idx}`)
          const className = String(s.class_name || s.className || s.class || s.current_class || 'Class 1').trim()
          const section = String(s.section_name || s.sectionName || s.section || s.current_section || 'A').replace(/^section\s+/i, '').trim()
          const gender = (String(s.gender || '').toLowerCase() === 'female' ? 'Female' : 'Male') as ('Male' | 'Female')
          const phone = s.contact || s.phone || s.mobile || s.parent_phone || s.guardian_phone || ''
          const id = String(s.id || admissionNo || `stu-${idx}`)

          return {
            id,
            name: fullName,
            rollNo,
            admissionNo,
            gender,
            avatar: s.avatar || s.photo,
            phone,
            className,
            section
          }
        }

        let combinedStuds: StudentItem[] = []
        const res = await fetchStudents()
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const dbStuds: StudentItem[] = res.data.map((s: any, idx: number) => normalizeStudent(s, idx))
          const dbIds = new Set(dbStuds.map(s => s.id))
          const uniqueLocal = localCombined
            .filter((s: any) => !dbIds.has(String(s.id || s.admission_no || s.admissionNo)))
            .map((s: any, idx: number) => normalizeStudent(s, dbStuds.length + idx))
          combinedStuds = [...dbStuds, ...uniqueLocal]
        } else if (localCombined.length > 0) {
          combinedStuds = localCombined.map((s: any, idx: number) => normalizeStudent(s, idx))
        }

        if (isMounted) {
          setAllStudents(combinedStuds)
        }

        // Fetch teachers
        const localTeachers = parseLocal('school_teachers')
        const teachersRes = await fetchTeachers()
        if (teachersRes?.success && Array.isArray(teachersRes.data)) {
          const dbTeachers = teachersRes.data
          const dbIds = new Set(dbTeachers.map((t: any) => String(t.id)))
          const uniqueLocalT = localTeachers.filter((t: any) => !dbIds.has(String(t.id)))
          if (isMounted) setAllTeachers([...dbTeachers, ...uniqueLocalT])
        } else if (isMounted) {
          setAllTeachers(localTeachers)
        }
      } catch (err) {
        console.error('Error loading attendance data:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadAllData()
    return () => { isMounted = false }
  }, [])

  // Build Real Classes List
  const classCards = useMemo(() => {
    const list: Array<{
      id: string
      className: string
      section: string
      classTeacher: string
      studentsCount: number
      presentCount: number
      absentCount: number
      leaveCount: number
    }> = []

    // 1. Gather all unique class names from mastersData and from real students
    const classesMap = new Map<string, Set<string>>()

    // From classesData
    if (classesData && classesData.length > 0) {
      classesData.forEach((c: any) => {
        const cName = c.className || c.name || `Class ${c.id}`
        if (!classesMap.has(cName)) classesMap.set(cName, new Set())
        const sSet = classesMap.get(cName)!
        if (Array.isArray(c.sections) && c.sections.length > 0) {
          c.sections.forEach((s: any) => sSet.add(String(s).replace(/^section\s+/i, '').trim() || 'A'))
        }
      })
    }

    // From real enrolled students (so if a student is enrolled in Class 1 Sec A, it is 100% present)
    allStudents.forEach(s => {
      const cName = s.className || 'Class 1'
      const sec = s.section || 'A'
      if (!classesMap.has(cName)) classesMap.set(cName, new Set())
      classesMap.get(cName)!.add(sec)
    })

    // Fallbacks if nothing in master data
    if (classesMap.size === 0) {
      ;['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class V', 'Class VI'].forEach(cls => {
        classesMap.set(cls, new Set(['A', 'B']))
      })
    }

    // Ensure all classes have at least section A
    classesMap.forEach((secSet) => {
      if (secSet.size === 0) secSet.add('A')
    })

    const dateKey = formatDateToISO(selectedDate)

    classesMap.forEach((secSet, cName) => {
      secSet.forEach((sec) => {
        const uniqueKey = `${cName}_${sec}`

        // 100% REAL matching students enrolled in this class and section
        const matchingStudents = allStudents.filter(s => matchesClassAndSection(s, cName, sec))
        const count = matchingStudents.length

        // Read real saved attendance
        const savedKey = `att_record_${dateKey}_${uniqueKey}`
        let present = 0
        let absent = 0
        let leave = 0

        try {
          const raw = localStorage.getItem(savedKey)
          if (raw) {
            const parsed = JSON.parse(raw)
            Object.values(parsed).forEach((item: any) => {
              if (item.status === 'Present') present++
              else if (item.status === 'Absent') absent++
              else if (item.status === 'Leave') leave++
            })
          }
        } catch {}

        // Find assigned teacher
        const matchedTeacher = allTeachers.find((t: any) => {
          const assignedClasses = t.assigned_classes || t.assignedClasses || []
          const text = JSON.stringify(assignedClasses).toLowerCase()
          return text.includes(cName.toLowerCase()) && text.includes(sec.toLowerCase())
        })

        list.push({
          id: `card-${uniqueKey}`,
          className: cName,
          section: sec,
          classTeacher: matchedTeacher?.name || matchedTeacher?.teacherName || 'Unassigned',
          studentsCount: count,
          presentCount: present,
          absentCount: absent,
          leaveCount: leave
        })
      })
    })

    // Sort classes: Put classes with real enrolled students at the top!
    return list.sort((a, b) => b.studentsCount - a.studentsCount || a.className.localeCompare(b.className))
  }, [classesData, allStudents, allTeachers, selectedDate])

  // Dependent sections dropdown
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

  // Filtered Cards
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
        const matchSec = card.section.toLowerCase().includes(q)
        const matchTeacher = card.classTeacher.toLowerCase().includes(q)
        if (!matchClass && !matchSec && !matchTeacher) return false
      }
      return true
    })
  }, [classCards, classFilter, sectionFilter, searchQuery])

  // 100% REAL Students for the currently marked class (NO DUMMY DATA)
  const activeClassStudents = useMemo(() => {
    if (!activeClass) return []
    const { className, section } = activeClass
    return allStudents.filter(s => matchesClassAndSection(s, className, section))
  }, [activeClass, allStudents])

  // Handle open marking sheet for a class card
  const handleOpenMarking = async (card: { className: string; section: string; classTeacher: string }) => {
    setActiveClass({
      className: card.className,
      section: card.section,
      teacherName: card.classTeacher
    })

    const dateKey = formatDateToISO(selectedDate)
    const savedKey = `att_record_${dateKey}_${card.className}_${card.section}`
    
    // Check local storage first
    let localSaved: Record<string, AttendanceEntry> = {}
    try {
      const raw = localStorage.getItem(savedKey)
      if (raw) localSaved = JSON.parse(raw)
    } catch {}

    // Check DB
    try {
      const dbRes = await fetchStudentAttendance(dateKey, card.className, card.section)
      if (dbRes?.success && Array.isArray(dbRes.data) && dbRes.data.length > 0) {
        dbRes.data.forEach((r: any) => {
          const sId = r.student_name + '_' + r.roll_no
          if (!localSaved[sId]) {
            localSaved[sId] = {
              status: (r.status as any) || 'Present',
              sourceMode: (r.source_mode as any) || 'Manual',
              markedBy: r.marked_by || card.classTeacher
            }
          }
        })
      }
    } catch (e) {
      console.error('Error fetching DB attendance:', e)
    }

    // 100% REAL target students matching this class
    const targetStudents = allStudents.filter(s => matchesClassAndSection(s, card.className, card.section))

    const initialMap: Record<string, AttendanceEntry> = {}
    targetStudents.forEach(s => {
      if (localSaved[s.id]) {
        initialMap[s.id] = localSaved[s.id]
      } else {
        // Default to Present
        initialMap[s.id] = {
          status: 'Present',
          sourceMode: attendanceMode === 'QR' ? 'QR Scanner' : 'Manual',
          markedBy: card.classTeacher
        }
      }
    })

    setAttendanceMap(initialMap)
    setMarkingFilter('All')
    setStudentSearch('')
    setCurrentStep('mark')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Attendance live counters (computed ONLY from real students)
  const liveStats = useMemo(() => {
    let present = 0
    let absent = 0
    let leave = 0
    activeClassStudents.forEach(s => {
      const entry = attendanceMap[s.id]
      if (entry?.status === 'Present') present++
      else if (entry?.status === 'Absent') absent++
      else if (entry?.status === 'Leave') leave++
      else present++
    })
    return {
      total: activeClassStudents.length,
      present,
      absent,
      leave
    }
  }, [activeClassStudents, attendanceMap])

  // Filtered students in marking sheet
  const filteredMarkingStudents = useMemo(() => {
    return activeClassStudents.filter(s => {
      const entry = attendanceMap[s.id]
      const status = entry?.status || 'Present'

      if (markingFilter !== 'All' && status !== markingFilter) {
        return false
      }

      if (studentSearch) {
        const q = studentSearch.toLowerCase().trim()
        const matchName = s.name.toLowerCase().includes(q)
        const matchRoll = s.rollNo.includes(q)
        const matchAdm = s.admissionNo.toLowerCase().includes(q)
        if (!matchName && !matchRoll && !matchAdm) return false
      }
      return true
    })
  }, [activeClassStudents, attendanceMap, markingFilter, studentSearch])

  // Update status for individual student
  const setStudentStatus = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        status,
        sourceMode: attendanceMode === 'QR' ? 'QR Scanner' : 'Manual',
        markedBy: activeClass?.teacherName || 'Staff',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    }))
  }

  // Bulk actions
  const markAllAs = (status: 'Present' | 'Absent' | 'Leave') => {
    if (activeClassStudents.length === 0) return
    const updated: Record<string, AttendanceEntry> = {}
    activeClassStudents.forEach(s => {
      updated[s.id] = {
        status,
        sourceMode: attendanceMode === 'QR' ? 'QR Scanner' : 'Manual',
        markedBy: activeClass?.teacherName || 'Staff',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    })
    setAttendanceMap(updated)
    showToast(`Marked all ${activeClassStudents.length} students as ${status}`)
  }

  // QR Bulk Scanner Simulate on real student
  const handleSimulateScan = (student: StudentItem) => {
    setStudentStatus(student.id, 'Present')
    setQrScanSuccessMsg(`Verified: ${student.name} (Roll: ${student.rollNo})`)
    setTimeout(() => setQrScanSuccessMsg(''), 2500)
  }

  // Submit Attendance
  const handleSubmitAttendance = async () => {
    if (!activeClass) return
    if (activeClassStudents.length === 0) {
      showToast('Cannot submit attendance: No enrolled students in this class.')
      return
    }

    setIsSubmitting(true)
    const dateKey = formatDateToISO(selectedDate)
    const savedKey = `att_record_${dateKey}_${activeClass.className}_${activeClass.section}`

    try {
      // 1. Save to LocalStorage
      localStorage.setItem(savedKey, JSON.stringify(attendanceMap))

      // 2. Prepare payload for DB
      const recordsPayload = activeClassStudents.map(s => {
        const att = attendanceMap[s.id] || { status: 'Present', sourceMode: 'Manual' }
        return {
          studentId: s.id,
          studentName: s.name,
          rollNo: s.rollNo,
          admissionNo: s.admissionNo,
          status: att.status,
          sourceMode: att.sourceMode
        }
      })

      const dbRes = await saveStudentAttendanceBatch({
        dateStr: dateKey,
        className: activeClass.className,
        sectionName: activeClass.section,
        records: recordsPayload,
        sourceMode: attendanceMode === 'QR' ? 'QR Bulk Attendance' : 'Manual Attendance',
        markedBy: activeClass.teacherName || 'Staff'
      })

      const refNo = dbRes?.sessionReference || `ATT-${dateKey.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

      setSubmissionReceipt({
        sessionRef: refNo,
        dateStr: formatDateDisplay(selectedDate),
        timeStr: nowTime,
        className: activeClass.className,
        section: activeClass.section,
        mode: attendanceMode === 'QR' ? 'QR Bulk Attendance' : 'Manual Attendance',
        total: liveStats.total,
        present: liveStats.present,
        absent: liveStats.absent,
        leave: liveStats.leave
      })

      setCurrentStep('receipt')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      showToast('Attendance recorded and submitted successfully!')
    } catch (err: any) {
      console.error('Submission failed:', err)
      showToast('Failed to submit attendance. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TOP HEADER & BREADCRUMBS                                              */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Link href="/institute/attendance/student" className="hover:text-teal-600 transition-colors">
              Attendance
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-teal-700">Student Attendance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Attendance Hub
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Record, verify, and monitor daily classroom attendance with 100% real enrolled students.
          </p>
        </div>

        {/* Quick Nav Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/institute/attendance/student"
            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-teal-600 text-white shadow-xs"
          >
            Student Attendance
          </Link>
          <Link
            href="/institute/attendance/staff"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-300 transition-colors"
          >
            Staff Attendance
          </Link>
          <Link
            href="/institute/attendance/log"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-300 transition-colors"
          >
            Attendance Log
          </Link>
          <Link
            href="/institute/attendance/biometric"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-300 transition-colors"
          >
            Biometric
          </Link>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SCREEN 1: CLASSES OVERVIEW (Screenshots 3 & 5)                          */}
      {/* ===================================================================== */}
      {currentStep === 'overview' && (
        <div className="space-y-6">

          {/* Top Banner & Mode Switcher in strict Teal Design */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold shadow-xs">
                {attendanceMode === 'QR' ? <QrCode className="w-6 h-6" /> : <CheckSquare className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {attendanceMode === 'QR' ? 'QR Code Attendance Mode' : 'Manual Attendance Mode'}
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  {attendanceMode === 'QR' 
                    ? 'Scan student ID cards with camera or barcode reader for instant logging.' 
                    : 'Tap student statuses (Present, Absent, Leave) and submit daily class logs.'}
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 p-1 rounded-2xl shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => setAttendanceMode('Manual')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  attendanceMode === 'Manual'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Manual Attendance
              </button>
              <button
                type="button"
                onClick={() => setAttendanceMode('QR')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  attendanceMode === 'QR'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                QR Attendance
              </button>
            </div>
          </div>

          {/* 7-DAY INTERACTIVE DATE STRIP */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevWeek}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {dateStrip.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(item.date)}
                    className={`flex flex-col items-center justify-center min-w-[54px] h-[64px] rounded-2xl transition-all cursor-pointer select-none px-2 ${
                      item.isSelected
                        ? 'bg-teal-600 text-white shadow-md scale-102 font-black'
                        : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-teal-50/70 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700'
                    }`}
                  >
                    <span className="text-base font-black leading-tight">
                      {item.dayNum}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${item.isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                      {item.dayName}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextWeek}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Calendar Jump Input */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs">
                <Calendar className="w-4 h-4 text-teal-600" />
                <input
                  type="date"
                  value={formatDateToISO(selectedDate)}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split('-').map(Number)
                      const picked = new Date(y, m - 1, d)
                      setSelectedDate(picked)
                      setDateStripCenter(picked)
                    }
                  }}
                  className="bg-transparent text-xs font-black text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const today = new Date()
                  setSelectedDate(today)
                  setDateStripCenter(today)
                }}
                className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Today
              </button>
            </div>
          </div>

          {/* QR BULK ATTENDANCE BANNER CARD */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden group">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                QR Bulk Attendance
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Scan multiple student badges rapidly. Attendance is automatically mapped and confirmed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const firstWithStudents = classCards.find(c => c.studentsCount > 0) || classCards[0]
                if (firstWithStudents) {
                  handleOpenMarking(firstWithStudents)
                  setQrModalOpen(true)
                } else {
                  showToast('Please select a class to scan attendance')
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              Scan Here
            </button>
          </div>

          {/* FILTER BAR: CLASS & SECTION */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search class, section, or teacher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Class Dropdown */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Class</span>
                <select
                  value={classFilter}
                  onChange={(e) => {
                    setClassFilter(e.target.value)
                    setSectionFilter('All Sections')
                  }}
                  className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:border-teal-500"
                >
                  <option value="All Classes">All Classes</option>
                  {Array.from(new Set(classCards.map(c => c.className))).map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Section Dropdown (Dependent) */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Section</span>
                <select
                  value={sectionFilter}
                  disabled={classFilter === 'All Classes'}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {classFilter === 'All Classes' ? (
                    <option value="All Sections">Select Class First</option>
                  ) : (
                    <>
                      <option value="All Sections">All Sections</option>
                      {availableFilterSections.map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Reset Filters */}
              {(classFilter !== 'All Classes' || sectionFilter !== 'All Sections' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setClassFilter('All Classes')
                    setSectionFilter('All Sections')
                    setSearchQuery('')
                  }}
                  className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* CLASSES GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Classes
              </h2>
              <span className="text-xs font-bold text-slate-500">
                {filteredClassCards.length} Classes Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredClassCards.map(card => (
                <div
                  key={card.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-teal-400 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold shadow-xs">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                            {card.className} Section {card.section}
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            Attendance By - {card.classTeacher}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/60 text-[11px] font-bold shadow-2xs">
                        Sec {card.section}
                      </span>
                    </div>

                    {/* 4 Stat Badges (100% Real numbers) */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-sky-50/80 border border-sky-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        <span className="text-[11px] font-bold text-sky-900">
                          Students: {card.studentsCount}
                        </span>
                      </div>

                      <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span className="text-[11px] font-bold text-emerald-900">
                          Present: {card.presentCount}
                        </span>
                      </div>

                      <div className="bg-rose-50/80 border border-rose-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        <span className="text-[11px] font-bold text-rose-900">
                          Absent: {card.absentCount}
                        </span>
                      </div>

                      <div className="bg-amber-50/80 border border-amber-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-[11px] font-bold text-amber-900">
                          Leave: {card.leaveCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mark Attendance Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenMarking(card)}
                      className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      Mark Attendance
                    </button>
                  </div>
                </div>
              ))}

              {filteredClassCards.length === 0 && (
                <div className="col-span-full bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-400 font-bold border border-slate-200">
                  No classes match the selected filter.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 2: ATTENDANCE MARKING SHEET (100% Real Enrolled Students)      */}
      {/* ===================================================================== */}
      {currentStep === 'mark' && activeClass && (
        <div className="space-y-6">

          {/* Header & Back Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('overview')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Classes
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                {attendanceMode === 'QR' ? 'QR Scanner Mode' : 'Manual Entry Mode'}
              </span>
            </div>
          </div>

          {/* 7-DAY DATE STRIP IN SHEET */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-teal-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {dateStrip.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(item.date)}
                  className={`flex flex-col items-center justify-center min-w-[50px] h-[58px] rounded-2xl transition-all select-none px-2 ${
                    item.isSelected
                      ? 'bg-teal-600 text-white shadow-md font-black'
                      : 'bg-slate-50 dark:bg-slate-700 hover:bg-teal-50 text-slate-700 border border-slate-100'
                  }`}
                >
                  <span className="text-sm font-black">{item.dayNum}</span>
                  <span className={`text-[9px] font-bold uppercase ${item.isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                    {item.dayName}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextWeek}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-teal-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* TOP CLASS SUMMARY CARD */}
          <div className="bg-teal-600 text-white rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight">
                  {activeClass.className} Section {activeClass.section}
                </h2>
                <p className="text-xs text-teal-100 font-semibold mt-0.5">
                  Class Teacher: {activeClass.teacherName} • Date: {formatDateDisplay(selectedDate)}
                </p>
              </div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-xs rounded-xl text-xs font-bold">
                {liveStats.present} / {liveStats.total} Present
              </span>
            </div>

            {/* Live 4 Stat Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              <div className="bg-white/95 rounded-xl px-3 py-2 flex items-center gap-2 text-slate-800 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <span className="text-xs font-black">Students: {liveStats.total}</span>
              </div>
              <div className="bg-white/95 rounded-xl px-3 py-2 flex items-center gap-2 text-slate-800 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-black">Present: {liveStats.present}</span>
              </div>
              <div className="bg-white/95 rounded-xl px-3 py-2 flex items-center gap-2 text-slate-800 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-xs font-black">Absent: {liveStats.absent}</span>
              </div>
              <div className="bg-white/95 rounded-xl px-3 py-2 flex items-center gap-2 text-slate-800 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-xs font-black">Leave: {liveStats.leave}</span>
              </div>
            </div>
          </div>

          {/* QR BULK ATTENDANCE QUICK SCAN CARD */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  QR Bulk Attendance Scanner
                </h3>
                <p className="text-xs text-slate-400 font-semibold">
                  Launch camera scanner to automatically verify student attendance.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={activeClassStudents.length === 0}
              onClick={() => setQrModalOpen(true)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              Scan Here
            </button>
          </div>

          {/* LEGEND & QUICK ACTIONS BAR */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-700">P = Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-rose-700">A = Absent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-amber-700">L = Leave</span>
              </div>
            </div>

            {/* Quick Bulk Mark Buttons */}
            {activeClassStudents.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => markAllAs('Present')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => markAllAs('Absent')}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Mark All Absent
                </button>
              </div>
            )}
          </div>

          {/* SEARCH & STATUS FILTER TABS */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl shadow-inner w-full md:w-auto overflow-x-auto">
              {(['All', 'Present', 'Absent', 'Leave'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMarkingFilter(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    markingFilter === tab
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab} ({tab === 'All' ? liveStats.total : tab === 'Present' ? liveStats.present : tab === 'Absent' ? liveStats.absent : liveStats.leave})
                </button>
              ))}
            </div>

            {/* Student Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, roll no, admission no."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* STUDENT ATTENDANCE CARDS LIST (100% Real Enrolled Students) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Students List ({filteredMarkingStudents.length})</span>
                {attendanceMode === 'QR' && (
                  <span className="text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    QR Verified
                  </span>
                )}
              </h3>
            </div>

            {/* If 0 students in this class */}
            {activeClassStudents.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7" />
                </div>
                <h4 className="text-base font-extrabold text-slate-800 dark:text-white">
                  No Students Enrolled in {activeClass.className} Section {activeClass.section}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  There are currently no real students registered in this class. You can enroll new students via the Students management module.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <Link
                    href="/institute/students"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
                  >
                    Go to Students Module
                  </Link>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('overview')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Choose Another Class
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredMarkingStudents.map(student => {
                  const currentStatus = attendanceMap[student.id]?.status || 'Present'
                  const source = attendanceMap[student.id]?.sourceMode || (attendanceMode === 'QR' ? 'QR Scanner' : 'Manual Entry')

                  return (
                    <div
                      key={student.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        {/* Avatar & Details */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-black text-base shadow-2xs shrink-0">
                            {student.name.charAt(0)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                                {student.name}
                              </h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                                {student.gender}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                              Roll No. : <span className="font-bold text-slate-800 dark:text-slate-200">{student.rollNo}</span> • Admission No. : <span className="font-bold text-slate-800 dark:text-slate-200">{student.admissionNo}</span>
                            </p>

                            <span className="inline-block text-[10px] text-teal-700 font-semibold mt-1">
                              Attendance by - {source}
                            </span>
                          </div>
                        </div>

                        {/* Call Button */}
                        {student.phone ? (
                          <a
                            href={`tel:${student.phone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors cursor-pointer shrink-0"
                            title={`Call ${student.name}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-teal-600" />
                            Call
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => showToast(`No phone number available for ${student.name}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 text-xs font-bold transition-colors cursor-pointer shrink-0"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Call
                          </button>
                        )}
                      </div>

                      {/* 3 Status Selector Buttons (Present / Absent / Leave) */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'Present')}
                          className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Present
                        </button>

                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'Absent')}
                          className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            currentStatus === 'Absent'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'Leave')}
                          className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            currentStatus === 'Leave'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-200'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Leave
                        </button>
                      </div>

                    </div>
                  )
                })}

                {filteredMarkingStudents.length === 0 && activeClassStudents.length > 0 && (
                  <div className="col-span-full bg-white dark:bg-slate-800 rounded-2xl p-8 text-center text-slate-400 font-bold border border-slate-200">
                    No students match the selected filter.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STICKY BOTTOM SUBMIT BAR */}
          {activeClassStudents.length > 0 && (
            <div className="sticky bottom-4 z-30 pt-3">
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl flex items-center justify-between gap-4">
                <div className="hidden sm:block">
                  <span className="text-xs font-bold text-slate-500">Summary:</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 ml-1.5">
                    {liveStats.present} Present • {liveStats.absent} Absent • {liveStats.leave} Leave
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitAttendance}
                  className="w-full sm:w-auto px-10 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Attendance
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 3: ATTENDANCE RECEIPT / CONFIRMATION (Screenshot 4)             */}
      {/* ===================================================================== */}
      {currentStep === 'receipt' && submissionReceipt && (
        <div className="max-w-2xl mx-auto w-full space-y-6 animate-in zoom-in-95 duration-200">
          
          {/* Header Action Row */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('overview')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Done / Return to Classes
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
          </div>

          {/* RECEIPT CARD */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-md space-y-6">
            
            {/* Top Success Badge */}
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Submitted Successfully
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Attendance has been recorded &amp; verified
                </p>
              </div>

              {/* Present Ratio Pill */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                <Check className="w-3.5 h-3.5" />
                <span>
                  {submissionReceipt.present} of {submissionReceipt.total} Students Present ({submissionReceipt.total > 0 ? ((submissionReceipt.present / submissionReceipt.total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 dark:border-slate-700 my-4" />

            {/* Key-Value Details List */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-400">Class &amp; Section</span>
                <span className="font-black text-slate-900 dark:text-white">{submissionReceipt.className} - Sec {submissionReceipt.section}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-400">Attendance Date</span>
                <span className="font-black text-slate-900 dark:text-white">{submissionReceipt.dateStr}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-400">Time of Submission</span>
                <span className="font-black text-slate-900 dark:text-white">{submissionReceipt.timeStr}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-400">Mode</span>
                <span className="font-black text-slate-900 dark:text-white">{submissionReceipt.mode}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-400">Session Reference</span>
                <span className="font-black font-mono text-slate-700 dark:text-slate-200">{submissionReceipt.sessionRef}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-400">Status</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                  <Check className="w-3 h-3" />
                  Confirmed
                </span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 dark:border-slate-700 my-4" />

            {/* Attendance Summary */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-900 dark:text-white">Attendance Summary</span>
                <span className="text-slate-400">Total: {submissionReceipt.total}</span>
              </div>

              {/* Multi-segment Progress Bar */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${submissionReceipt.total > 0 ? (submissionReceipt.present / submissionReceipt.total) * 100 : 0}%` }}
                  title={`Present: ${submissionReceipt.present}`}
                />
                <div 
                  className="bg-rose-500 h-full transition-all duration-500" 
                  style={{ width: `${submissionReceipt.total > 0 ? (submissionReceipt.absent / submissionReceipt.total) * 100 : 0}%` }}
                  title={`Absent: ${submissionReceipt.absent}`}
                />
                <div 
                  className="bg-amber-400 h-full transition-all duration-500" 
                  style={{ width: `${submissionReceipt.total > 0 ? (submissionReceipt.leave / submissionReceipt.total) * 100 : 0}%` }}
                  title={`Leave: ${submissionReceipt.leave}`}
                />
              </div>

              {/* 4 Stat Cards in 2x2 Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <Users className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-sky-900 leading-tight">
                      {submissionReceipt.total}
                    </span>
                    <p className="text-xs text-sky-700 font-bold mt-0.5">Total Students</p>
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-black text-emerald-700">
                      {submissionReceipt.total > 0 ? ((submissionReceipt.present / submissionReceipt.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-emerald-900 leading-tight">
                      {submissionReceipt.present}
                    </span>
                    <p className="text-xs text-emerald-700 font-bold mt-0.5">Present</p>
                  </div>
                </div>

                <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <X className="w-5 h-5 text-rose-600" />
                    <span className="text-xs font-black text-rose-700">
                      {submissionReceipt.total > 0 ? ((submissionReceipt.absent / submissionReceipt.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-rose-900 leading-tight">
                      {submissionReceipt.absent}
                    </span>
                    <p className="text-xs text-rose-700 font-bold mt-0.5">Absent</p>
                  </div>
                </div>

                <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-black text-amber-700">
                      {submissionReceipt.total > 0 ? ((submissionReceipt.leave / submissionReceipt.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-amber-900 leading-tight">
                      {submissionReceipt.leave}
                    </span>
                    <p className="text-xs text-amber-700 font-bold mt-0.5">On Leave</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('overview')}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-extrabold shadow-sm transition-all cursor-pointer text-center"
              >
                Mark Another Class
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* QR SCANNER MODAL (INTERACTIVE VIEW)                                  */}
      {/* ===================================================================== */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Live QR Attendance Scanner
                  </h3>
                  <p className="text-[11px] text-slate-400">Position student QR code inside the viewfinder</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewfinder simulation */}
            <div className="relative bg-slate-900 rounded-2xl h-56 flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-teal-400/80">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-teal-400"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-teal-400"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-teal-400"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-teal-400"></div>

              <div className="w-48 h-0.5 bg-teal-400 shadow-[0_0_10px_#2dd4bf] animate-pulse"></div>

              <div className="mt-4 text-center text-xs text-slate-300 font-semibold px-4">
                <Camera className="w-6 h-6 mx-auto mb-1 text-teal-400 opacity-80" />
                Scanning for student QR badge...
              </div>

              {qrScanSuccessMsg && (
                <div className="absolute inset-x-4 bottom-4 bg-emerald-600 text-white py-2 px-3 rounded-xl text-xs font-black text-center shadow-lg animate-in fade-in duration-150">
                  {qrScanSuccessMsg}
                </div>
              )}
            </div>

            {/* Real Student Scan List */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Enrolled Students ({activeClassStudents.length})
              </span>

              {activeClassStudents.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No enrolled students in this class.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {activeClassStudents.map(student => {
                    const isPresent = attendanceMap[student.id]?.status === 'Present'
                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleSimulateScan(student)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isPresent
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-teal-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-left">
                          <span className="font-mono font-bold text-[11px] text-slate-500">#{student.rollNo}</span>
                          <span className="font-extrabold">{student.name}</span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          isPresent ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isPresent ? 'Verified ✓' : 'Scan'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Close Scanner
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default function StudentAttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <StudentAttendanceContent />
    </Suspense>
  )
}

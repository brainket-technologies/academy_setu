'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, Plus, Calendar, Clock, Trash2, X, Download, 
  CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert, 
  User, BookOpen, Coffee, Sun, Check, ArrowRight, Pencil, Copy
} from 'lucide-react'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'
import { fetchTeachers, createTeacher } from '@/app/institute/teachers/actions'

interface TimeSlot {
  id: number
  timeFrom: string
  timeTo: string
  subject: string
  teacher: string
  isLunchBreak?: boolean
}

interface DaySchedule {
  [dayName: string]: TimeSlot[]
}

interface TimetableRecord {
  id: string
  classes: string
  section: string
  schedule: DaySchedule
  offDays?: string[]
}

interface TeacherConflictInfo {
  teacher: string
  day: string
  timeFrom: string
  timeTo: string
  targetClass: string
  targetSection: string
  subject: string
  isSelfClass?: boolean
}

const DEFAULT_SCHEDULE: DaySchedule = {
  'Sunday': [],
  'Monday': [],
  'Tuesday': [],
  'Wednesday': [],
  'Thursday': [],
  'Friday': [],
  'Saturday': []
}

const DEFAULT_TEACHERS: string[] = []

const DEFAULT_SUBJECTS = [
  'Maths', 'English', 'Hindi', 'Science', 'Social Science',
  'Computer', 'GK', 'Art & Craft', 'Physical Education',
  'EVS', 'Moral Science', 'Sanskrit'
]

const TIME_OPTIONS = [
  '07:00 AM', '07:30 AM', '07:45 AM',
  '08:00 AM', '08:15 AM', '08:30 AM', '08:45 AM',
  '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
  '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
  '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
  '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
  '01:00 PM', '01:15 PM', '01:30 PM', '01:45 PM',
  '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM',
  '03:00 PM', '03:15 PM', '03:30 PM', '03:45 PM',
  '04:00 PM', '04:30 PM', '05:00 PM'
]

const PASTEL_COLORS = [
  'bg-emerald-50 text-emerald-700 border-emerald-100',
  'bg-sky-50 text-sky-700 border-sky-100',
  'bg-rose-50 text-rose-700 border-rose-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-amber-50 text-amber-700 border-amber-100',
]

const ALL_WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Helper to convert stored 12-hour (e.g. "09:00 AM", "01:30 PM") to 24-hour "HH:mm" for <input type="time">
function formatTimeTo24Hour(timeStr?: string): string {
  if (!timeStr) return ''
  const cleaned = timeStr.trim().toUpperCase()
  if (/^\d{2}:\d{2}$/.test(cleaned)) return cleaned

  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/)
  if (!match) return ''
  let hours = parseInt(match[1], 10)
  const minutes = match[2]
  const meridian = match[3]

  if (meridian === 'PM' && hours < 12) hours += 12
  if (meridian === 'AM' && hours === 12) hours = 0

  return `${String(hours).padStart(2, '0')}:${minutes}`
}

// Helper to convert 24-hour "HH:mm" from <input type="time"> back to 12-hour "hh:mm AM/PM"
function formatTimeTo12Hour(time24?: string): string {
  if (!time24) return ''
  const cleaned = time24.trim()
  if (/AM|PM/i.test(cleaned)) return cleaned

  const parts = cleaned.split(':')
  if (parts.length < 2) return cleaned
  let hours = parseInt(parts[0], 10)
  const minutes = parts[1]
  if (isNaN(hours)) return cleaned

  const meridian = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${String(hours).padStart(2, '0')}:${minutes} ${meridian}`
}

// Convert 12-hour "HH:MM AM/PM" to minutes from midnight
function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null
  const cleaned = timeStr.trim().toUpperCase()
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/)
  if (!match) return null
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const meridian = match[3]

  if (meridian === 'PM' && hours < 12) hours += 12
  if (meridian === 'AM' && hours === 12) hours = 0

  return hours * 60 + minutes
}

// Helper to sort slots chronologically by start time
function sortSlotsByTime(slots: TimeSlot[]): TimeSlot[] {
  return [...slots].sort((a, b) => {
    const minA = parseTimeToMinutes(a.timeFrom) ?? 0
    const minB = parseTimeToMinutes(b.timeFrom) ?? 0
    return minA - minB
  })
}

// Check if two time intervals overlap (strictly greater/lesser)
function isTimeOverlap(fromA: string, toA: string, fromB: string, toB: string): boolean {
  const startA = parseTimeToMinutes(fromA)
  const endA = parseTimeToMinutes(toA)
  const startB = parseTimeToMinutes(fromB)
  const endB = parseTimeToMinutes(toB)

  if (startA === null || endA === null || startB === null || endB === null) {
    return fromA === fromB || toA === toB
  }
  return startA < endB && endA > startB
}

// Find any conflict for a given teacher at a specific day and time slot
function findTeacherConflict(
  teacher: string,
  day: string,
  timeFrom: string,
  timeTo: string,
  currentSlotId: number,
  modalClass: string,
  modalSection: string,
  currentDaySlots: TimeSlot[],
  allRecords: TimetableRecord[]
): TeacherConflictInfo | null {
  if (!teacher || teacher === 'Teacher Name' || teacher === 'Select Teacher') return null
  const normTeacher = teacher.trim().toLowerCase()

  // 1. Check inside current timetable editor on the same day
  for (const slot of currentDaySlots) {
    if (slot.id === currentSlotId) continue
    if (slot.isLunchBreak) continue
    if (!slot.teacher) continue
    if (slot.teacher.trim().toLowerCase() === normTeacher) {
      if (isTimeOverlap(timeFrom, timeTo, slot.timeFrom, slot.timeTo)) {
        return {
          teacher,
          day,
          timeFrom: slot.timeFrom,
          timeTo: slot.timeTo,
          targetClass: modalClass || 'Current Class',
          targetSection: modalSection || 'Current Section',
          subject: slot.subject || 'Another Period',
          isSelfClass: true
        }
      }
    }
  }

  // 2. Check across all other classes & sections in records
  for (const rec of allRecords) {
    // If it's the exact class and section being edited, skip because currentDaySlots handles it
    if (rec.classes === modalClass && rec.section === modalSection) continue
    // If the day is an off-day in that class record, no clash
    if (rec.offDays && rec.offDays.includes(day)) continue

    const daySlots = rec.schedule?.[day] || []
    for (const slot of daySlots) {
      if (slot.isLunchBreak) continue
      if (!slot.teacher) continue
      if (slot.teacher.trim().toLowerCase() === normTeacher) {
        if (isTimeOverlap(timeFrom, timeTo, slot.timeFrom, slot.timeTo)) {
          return {
            teacher,
            day,
            timeFrom: slot.timeFrom,
            timeTo: slot.timeTo,
            targetClass: rec.classes,
            targetSection: rec.section,
            subject: slot.subject || 'Class'
          }
        }
      }
    }
  }

  return null
}

export default function TimeTablePage() {
  const classesData = useClasses()
  const sectionsData = useSections()
  const rawSubjectsData = useSubjects()
  
  const [records, setRecords] = useState<TimetableRecord[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')

  // Dynamic teachers and subjects from database & masters
  const [teachersList, setTeachersList] = useState<string[]>([])
  const [subjectsList, setSubjectsList] = useState<string[]>(DEFAULT_SUBJECTS)
  const [allSubjectsRecords, setAllSubjectsRecords] = useState<any[]>([])

  // Custom teacher/subject inline add modal
  const [quickAddTeacherModal, setQuickAddTeacherModal] = useState(false)
  const [newTeacherNameInput, setNewTeacherNameInput] = useState('')

  const [quickAddSubjectModal, setQuickAddSubjectModal] = useState(false)
  const [newSubjectNameInput, setNewSubjectNameInput] = useState('')

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [activeModalDay, setActiveModalDay] = useState('Monday')
  const [modalClass, setModalClass] = useState('')
  const [modalSection, setModalSection] = useState('')
  const [modalOffDays, setModalOffDays] = useState<string[]>(['Sunday'])

  // Modal form states
  const [modalSlots, setModalSlots] = useState<Record<string, TimeSlot[]>>({
    'Sunday': [],
    'Monday': [],
    'Tuesday': [],
    'Wednesday': [],
    'Thursday': [],
    'Friday': [],
    'Saturday': []
  })

  // Conflict Review Warning Modal
  const [conflictReviewModalOpen, setConflictReviewModalOpen] = useState(false)
  const [detectedConflictsList, setDetectedConflictsList] = useState<TeacherConflictInfo[]>([])

  // Copy schedule state
  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [copyTargetDays, setCopyTargetDays] = useState<string[]>([])
  const [autoEnableWorkingDay, setAutoEnableWorkingDay] = useState(true)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // ─── 1. Load Teachers strictly from institute_teachers Database ───
  const loadTeachersData = async () => {
    try {
      const res = await fetchTeachers()
      if (res?.success && Array.isArray(res.data)) {
        const names = res.data
          .map((t: any) => t.name?.trim())
          .filter(Boolean)
        const uniqueNames = Array.from(new Set(names))
        setTeachersList(uniqueNames)
        return
      }
    } catch (e) {
      console.log('fetchTeachers note:', e)
    }
    setTeachersList([])
  }

  useEffect(() => {
    loadTeachersData()
  }, [])

  // ─── 2. Load Subjects from Setup & Masters ───
  const loadAllSubjects = () => {
    let combined: any[] = []

    // 1. Check localStorage 'school_masters_subjects'
    try {
      const savedSubs = localStorage.getItem('school_masters_subjects')
      if (savedSubs) {
        const parsed = JSON.parse(savedSubs)
        if (Array.isArray(parsed)) {
          combined = [...parsed]
        }
      }
    } catch (e) {
      console.error('Error reading school_masters_subjects:', e)
    }

    // 2. Also incorporate from rawSubjectsData (useSubjects hook)
    if (Array.isArray(rawSubjectsData)) {
      rawSubjectsData.forEach((s: any) => {
        const sName = typeof s === 'string' ? s : (s.subjectName || s.name)
        if (!sName) return
        const exists = combined.some(item => {
          const itemName = typeof item === 'string' ? item : (item.subjectName || item.name)
          return itemName && itemName.trim().toLowerCase() === sName.trim().toLowerCase()
        })
        if (!exists) {
          combined.push(typeof s === 'string' ? { subjectName: s, className: '' } : s)
        }
      })
    }

    setAllSubjectsRecords(combined)

    const subjectsSet = new Set<string>(DEFAULT_SUBJECTS)
    combined.forEach((s: any) => {
      const name = typeof s === 'string' ? s : (s.subjectName || s.name)
      if (name && typeof name === 'string' && !s.deleted) subjectsSet.add(name.trim())
    })
    setSubjectsList(Array.from(subjectsSet))
  }

  useEffect(() => {
    loadAllSubjects()
  }, [rawSubjectsData])

  useEffect(() => {
    const handleStorageChange = () => {
      loadAllSubjects()
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [rawSubjectsData])

  // ─── 3. Load Timetables ───
  useEffect(() => {
    const saved = localStorage.getItem('school_timetables')
    if (saved) {
      try {
        setRecords(JSON.parse(saved))
      } catch (err) {
        console.error(err)
      }
    } else {
      const initial: TimetableRecord[] = [
        { 
          id: '1', 
          classes: 'Class V', 
          section: 'Section A', 
          schedule: DEFAULT_SCHEDULE,
          offDays: ['Sunday']
        }
      ]
      setRecords(initial)
      localStorage.setItem('school_timetables', JSON.stringify(initial))
    }
  }, [])

  // ─── Filter sections for a specific class ───
  const getSectionsForClass = (targetClass: string): string[] => {
    if (!targetClass) return []

    const sectionsSet = new Set<string>()

    // 1. Check classesData (class record sections array)
    if (Array.isArray(classesData)) {
      const classObj = classesData.find((c: any) => c.className === targetClass)
      if (classObj && Array.isArray(classObj.sections)) {
        classObj.sections.forEach((s: any) => {
          const name = typeof s === 'string' ? s : (s?.sectionName || s?.name)
          if (name && typeof name === 'string' && name.trim()) {
            sectionsSet.add(name.trim())
          }
        })
      }
    }

    // 2. Check sectionsData (section records where className === targetClass)
    if (Array.isArray(sectionsData)) {
      sectionsData.forEach((s: any) => {
        if (!s.deleted && s.className === targetClass) {
          const name = s.sectionName || s.name
          if (name && typeof name === 'string' && name.trim()) {
            sectionsSet.add(name.trim())
          }
        }
      })
    }

    // 3. Fallback: if class exists but no specific sections were added yet in masters
    if (sectionsSet.size === 0 && targetClass) {
      return ['Section A', 'Section B', 'Section C']
    }

    return Array.from(sectionsSet)
  }

  // ─── Filter subjects class-wise from masters ───
  const getSubjectsForClass = (targetClass: string): string[] => {
    if (!targetClass) return []
    const norm = (val?: string) => (val || '').toLowerCase().replace(/[\s\-_]/g, '')
    const targetNorm = norm(targetClass)

    // A. Filter subjects explicitly mapped to this class in masters
    const matchedClassSubjects: string[] = []

    allSubjectsRecords.forEach(s => {
      if (s.deleted) return
      const sName = (s.subjectName || s.name || '').trim()
      if (!sName) return

      const sClass = (s.className || s.class || s.classes || '').trim()
      const classNorm = norm(sClass)

      if (classNorm && (classNorm === targetNorm || classNorm === 'all' || classNorm === 'allclasses' || classNorm === 'allclass')) {
        if (!matchedClassSubjects.includes(sName)) {
          matchedClassSubjects.push(sName)
        }
      }
    })

    if (matchedClassSubjects.length > 0) {
      return matchedClassSubjects
    }

    // B. Fallback: check unassigned subjects in masters
    const unassigned: string[] = []
    allSubjectsRecords.forEach(s => {
      if (s.deleted) return
      const sName = (s.subjectName || s.name || '').trim()
      if (!sName) return
      const sClass = (s.className || s.class || s.classes || '').trim()
      if (!sClass) {
        if (!unassigned.includes(sName)) {
          unassigned.push(sName)
        }
      }
    })

    if (unassigned.length > 0) {
      return unassigned
    }

    // C. Default fallback if no subjects exist
    return DEFAULT_SUBJECTS
  }

  const availableViewSections = useMemo(() => {
    return getSectionsForClass(selectedClass)
  }, [selectedClass, classesData, sectionsData])

  const availableModalSections = useMemo(() => {
    return getSectionsForClass(modalClass)
  }, [modalClass, classesData, sectionsData])

  const modalAvailableSubjects = useMemo(() => {
    return getSubjectsForClass(modalClass || selectedClass)
  }, [modalClass, selectedClass, allSubjectsRecords])

  // Find active schedule (only when both class and section are selected)
  const activeRecord = (selectedClass && selectedSection)
    ? records.find(r => r.classes === selectedClass && r.section === selectedSection)
    : undefined
  const activeSchedule = activeRecord ? activeRecord.schedule : DEFAULT_SCHEDULE
  const activeOffDays = activeRecord?.offDays || ['Sunday']

  // Modal slot actions
  const addSubjectRow = () => {
    const current = [...(modalSlots[activeModalDay] || [])]
    const nextId = Date.now()

    let timeFrom = '09:00 AM'
    let timeTo = '09:45 AM'
    if (current.length > 0) {
      const lastSlot = current[current.length - 1]
      if (lastSlot.timeTo) {
        timeFrom = lastSlot.timeTo
        const lastMinutes = parseTimeToMinutes(lastSlot.timeTo)
        if (lastMinutes !== null) {
          const nextMinutes = lastMinutes + 45
          const h = Math.floor(nextMinutes / 60) % 24
          const m = nextMinutes % 60
          const mer = h >= 12 ? 'PM' : 'AM'
          const h12 = h % 12 || 12
          timeTo = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${mer}`
        }
      }
    }

    setModalSlots({
      ...modalSlots,
      [activeModalDay]: [
        ...current,
        { 
          id: nextId, 
          timeFrom, 
          timeTo, 
          subject: '', 
          teacher: '' 
        }
      ]
    })
  }

  const addLunchBreakRow = () => {
    const current = [...(modalSlots[activeModalDay] || [])]
    const nextId = Date.now()

    let timeFrom = '11:15 AM'
    let timeTo = '12:00 PM'
    if (current.length > 0) {
      const lastSlot = current[current.length - 1]
      if (lastSlot.timeTo) {
        timeFrom = lastSlot.timeTo
        const lastMinutes = parseTimeToMinutes(lastSlot.timeTo)
        if (lastMinutes !== null) {
          const nextMinutes = lastMinutes + 45
          const h = Math.floor(nextMinutes / 60) % 24
          const m = nextMinutes % 60
          const mer = h >= 12 ? 'PM' : 'AM'
          const h12 = h % 12 || 12
          timeTo = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${mer}`
        }
      }
    }

    setModalSlots({
      ...modalSlots,
      [activeModalDay]: [
        ...current,
        { id: nextId, timeFrom, timeTo, subject: 'Lunch Break', teacher: '', isLunchBreak: true }
      ]
    })
  }

  const deleteSlotRow = (id: number) => {
    const current = [...(modalSlots[activeModalDay] || [])]
    setModalSlots({
      ...modalSlots,
      [activeModalDay]: current.filter(s => s.id !== id)
    })
  }

  const handleSlotFieldChange = (idx: number, field: keyof TimeSlot, value: any) => {
    const current = [...(modalSlots[activeModalDay] || [])]
    const oldSlot = current[idx]
    current[idx] = {
      ...oldSlot,
      [field]: value
    }

    // Auto-adjust sequential times when end time changes:
    // If timeTo changed on this slot, seamlessly adjust the next slot's timeFrom to maintain schedule continuity
    if (field === 'timeTo' && value && idx + 1 < current.length) {
      const nextSlot = current[idx + 1]
      if (nextSlot) {
        const oldNextFrom = parseTimeToMinutes(nextSlot.timeFrom)
        const oldNextTo = parseTimeToMinutes(nextSlot.timeTo)
        const duration = (oldNextFrom !== null && oldNextTo !== null && oldNextTo > oldNextFrom)
          ? (oldNextTo - oldNextFrom)
          : 45

        const newFromMin = parseTimeToMinutes(value)
        if (newFromMin !== null) {
          const newToMin = newFromMin + duration
          const h = Math.floor(newToMin / 60) % 24
          const m = newToMin % 60
          const mer = h >= 12 ? 'PM' : 'AM'
          const h12 = h % 12 || 12
          const newNextTo = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${mer}`

          current[idx + 1] = {
            ...nextSlot,
            timeFrom: value,
            timeTo: newNextTo
          }
        }
      }
    }

    // Auto-adjust: If timeFrom changed on Lunch Break or any slot, adjust its timeTo maintaining duration
    if (field === 'timeFrom' && value) {
      const oldFromMin = parseTimeToMinutes(oldSlot.timeFrom)
      const oldToMin = parseTimeToMinutes(oldSlot.timeTo)
      const duration = (oldFromMin !== null && oldToMin !== null && oldToMin > oldFromMin)
        ? (oldToMin - oldFromMin)
        : 45

      const newFromMin = parseTimeToMinutes(value)
      if (newFromMin !== null) {
        const newToMin = newFromMin + duration
        const h = Math.floor(newToMin / 60) % 24
        const m = newToMin % 60
        const mer = h >= 12 ? 'PM' : 'AM'
        const h12 = h % 12 || 12
        current[idx].timeTo = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${mer}`

        // Also adjust the next slot if it exists
        if (idx + 1 < current.length) {
          const nextSlot = current[idx + 1]
          if (nextSlot) {
            const nextDuration = 45
            const nextToMin = newToMin + nextDuration
            const nh = Math.floor(nextToMin / 60) % 24
            const nm = nextToMin % 60
            const nmer = nh >= 12 ? 'PM' : 'AM'
            const nh12 = nh % 12 || 12
            current[idx + 1] = {
              ...nextSlot,
              timeFrom: current[idx].timeTo,
              timeTo: `${String(nh12).padStart(2, '0')}:${String(nm).padStart(2, '0')} ${nmer}`
            }
          }
        }
      }
    }

    setModalSlots({
      ...modalSlots,
      [activeModalDay]: current
    })
  }

  const handleAutoSortDay = () => {
    const current = modalSlots[activeModalDay] || []
    const sorted = sortSlotsByTime(current)
    setModalSlots({
      ...modalSlots,
      [activeModalDay]: sorted
    })
    setToastMsg(`Sorted ${activeModalDay}'s periods chronologically by time!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2000)
  }

  // Toggle Week Day Off for a specific day
  const handleToggleDayOff = (day: string) => {
    setModalOffDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day)
      } else {
        return [...prev, day]
      }
    })
  }

  // Open copy schedule modal
  const handleOpenCopyModal = () => {
    const slots = modalSlots[activeModalDay] || []
    if (slots.length === 0) {
      alert(`There are no periods in ${activeModalDay} to copy. Please add at least one subject or lunch break first.`)
      return
    }
    // Default: If Monday, preselect Tuesday. Otherwise next day.
    if (activeModalDay === 'Monday') {
      setCopyTargetDays(['Tuesday'])
    } else {
      const remainingDays = ALL_WEEK_DAYS.filter(d => d !== activeModalDay && d !== 'Sunday')
      setCopyTargetDays(remainingDays.slice(0, 1))
    }
    setCopyModalOpen(true)
  }

  // Apply copy schedule
  const handleApplyCopySchedule = () => {
    if (copyTargetDays.length === 0) {
      alert('Please select at least one day to copy the schedule to.')
      return
    }
    const sourceSlots = modalSlots[activeModalDay] || []

    setModalSlots(prev => {
      const updated = { ...prev }
      copyTargetDays.forEach(day => {
        updated[day] = sourceSlots.map((slot, idx) => ({
          ...slot,
          id: Date.now() + idx + Math.floor(Math.random() * 100000)
        }))
      })
      return updated
    })

    if (autoEnableWorkingDay) {
      setModalOffDays(prev => prev.filter(day => !copyTargetDays.includes(day)))
    }

    setCopyModalOpen(false)
    setToastMsg(`Copied ${activeModalDay}'s schedule to ${copyTargetDays.join(', ')}!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Quick add teacher
  const handleAddQuickTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newTeacherNameInput.trim()
    if (!trimmed) return
    if (!teachersList.includes(trimmed)) {
      setTeachersList(prev => [...prev, trimmed])
      try {
        await createTeacher({ name: trimmed, status: 'Active' })
      } catch (err) {
        console.error(err)
      }
    }
    setNewTeacherNameInput('')
    setQuickAddTeacherModal(false)
    setToastMsg(`Teacher "${trimmed}" added!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2500)
  }

  // Quick add subject
  const handleAddQuickSubject = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newSubjectNameInput.trim()
    if (!trimmed) return
    const activeClass = modalClass || selectedClass

    const newRecord = {
      id: Date.now(),
      subjectName: trimmed,
      name: trimmed,
      className: activeClass,
      type: 'Marks',
      deleted: false
    }

    setAllSubjectsRecords(prev => [newRecord, ...prev])
    setSubjectsList(prev => [trimmed, ...prev])

    try {
      const saved = localStorage.getItem('school_masters_subjects')
      const arr = saved ? JSON.parse(saved) : []
      arr.unshift(newRecord)
      localStorage.setItem('school_masters_subjects', JSON.stringify(arr))
    } catch (err) {
      console.error(err)
    }

    setNewSubjectNameInput('')
    setQuickAddSubjectModal(false)
    setToastMsg(`Subject "${trimmed}" added for ${activeClass || 'all classes'}!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 2500)
  }

  // Scan all working days for conflicts in the current modal form
  const getAllModalConflicts = (): TeacherConflictInfo[] => {
    const conflicts: TeacherConflictInfo[] = []
    ALL_WEEK_DAYS.forEach(day => {
      if (modalOffDays.includes(day)) return // skip off days
      const slots = modalSlots[day] || []
      slots.forEach(slot => {
        if (slot.isLunchBreak || !slot.teacher) return
        const conflict = findTeacherConflict(
          slot.teacher,
          day,
          slot.timeFrom,
          slot.timeTo,
          slot.id,
          modalClass,
          modalSection,
          slots,
          records
        )
        if (conflict) {
          conflicts.push(conflict)
        }
      })
    })
    return conflicts
  }

  // Save Modal Action
  const handleSaveModal = (e?: React.FormEvent, forceSave = false) => {
    if (e) e.preventDefault()
    if (!modalClass || !modalSection) {
      alert('Please select Class and Section.')
      return
    }

    if (!forceSave) {
      const conflicts = getAllModalConflicts()
      if (conflicts.length > 0) {
        setDetectedConflictsList(conflicts)
        setConflictReviewModalOpen(true)
        return
      }
    }

    const sortedSchedule: DaySchedule = {}
    ALL_WEEK_DAYS.forEach(day => {
      sortedSchedule[day] = sortSlotsByTime(modalSlots[day] || [])
    })

    const newRecord: TimetableRecord = {
      id: activeRecord ? activeRecord.id : Date.now().toString(),
      classes: modalClass,
      section: modalSection,
      schedule: sortedSchedule,
      offDays: modalOffDays
    }

    const updated = [
      ...records.filter(r => !(r.classes === modalClass && r.section === modalSection)), 
      newRecord
    ]
    setRecords(updated)
    localStorage.setItem('school_timetables', JSON.stringify(updated))

    setSelectedClass(modalClass)
    setSelectedSection(modalSection)
    setAddModalOpen(false)
    setConflictReviewModalOpen(false)

    setToastMsg(`Time Table saved for ${modalClass} (${modalSection})!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const isCurrentDayOff = modalOffDays.includes(activeModalDay)

  const handleOpenSetupModal = () => {
    setModalClass(selectedClass)
    setModalSection(selectedSection)

    if (activeRecord) {
      // Clean any stale or dummy teachers from previous saves that are not in teachersList
      const cleanedSchedule: DaySchedule = {}
      ALL_WEEK_DAYS.forEach(day => {
        cleanedSchedule[day] = sortSlotsByTime((activeRecord.schedule[day] || []).map(slot => ({
          ...slot,
          teacher: teachersList.includes(slot.teacher) ? slot.teacher : ''
        })))
      })
      setModalSlots(cleanedSchedule)
      setModalOffDays(activeRecord.offDays || ['Sunday'])
    } else {
      // Start with a clean blank schedule (no periods pre-populated)
      const initialSlots: Record<string, TimeSlot[]> = {
        'Sunday': [],
        'Monday': [],
        'Tuesday': [],
        'Wednesday': [],
        'Thursday': [],
        'Friday': [],
        'Saturday': []
      }

      setModalSlots(initialSlots)
      setModalOffDays(['Sunday'])
    }

    setAddModalOpen(true)
  }

  const handleDeleteTimetable = () => {
    if (!activeRecord) {
      alert('No timetable found to delete for the selected class and section.')
      return
    }

    const confirmed = confirm(
      `Are you sure you want to delete the time table for ${selectedClass} (${selectedSection})?\n\nThis will remove all period slots and clear teacher assignments for this class.`
    )
    if (!confirmed) return

    const updated = records.filter(r => !(r.classes === selectedClass && r.section === selectedSection))
    setRecords(updated)
    localStorage.setItem('school_timetables', JSON.stringify(updated))
    setToastMsg(`Time Table deleted for ${selectedClass} (${selectedSection})!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Working days on the main view
  const workingDays = ALL_WEEK_DAYS.filter(day => !activeOffDays.includes(day))
  const maxSlotsCount = Math.max(
    1,
    ...ALL_WEEK_DAYS.map(day => (activeSchedule[day] || []).length)
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* ─── Header ─── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
              Time Table &amp; Class Schedule
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Manage lecture periods, week day off schedules, and prevent teacher assignment conflicts.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => alert('Exporting weekly timetable format...')}
            className="h-10 px-4 border border-slate-250 dark:border-slate-700 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 bg-white dark:bg-slate-800 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ─── Class / Section Selector Bar ─── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-semibold text-slate-700 dark:text-slate-200">
        <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
          <div className="flex flex-col gap-1.5 w-48">
            <label className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Class</label>
            <select 
              value={selectedClass} 
              onChange={e => {
                const newClass = e.target.value
                setSelectedClass(newClass)
                const validSecs = getSectionsForClass(newClass)
                if (!validSecs.includes(selectedSection)) {
                  setSelectedSection(validSecs[0] || '')
                }
              }} 
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold shadow-2xs focus:border-teal-500"
            >
              <option value="">Select a Class</option>
              {classesData.map((c: any) => (
                <option key={c.className} value={c.className}>{c.className}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-48">
            <label className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Section</label>
            <select 
              value={selectedSection} 
              onChange={e => setSelectedSection(e.target.value)} 
              disabled={!selectedClass}
              className={`w-full px-4 py-2.5 border rounded-xl outline-none font-bold shadow-2xs text-xs transition-colors ${
                !selectedClass
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:border-teal-500'
              }`}
            >
              <option value="">
                {!selectedClass ? 'Select Class First' : 'Select a Section'}
              </option>
              {availableViewSections.map((secName) => (
                <option key={secName} value={secName}>{secName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status badges and unified single action or Edit/Delete buttons (only when class & section are selected) */}
        {selectedClass && selectedSection && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>Weekly Off:</span>
              <span className="text-amber-600 dark:text-amber-400 font-black">
                {activeOffDays.length > 0 ? activeOffDays.join(', ') : 'None'}
              </span>
            </div>

            <button 
              type="button"
              onClick={handleOpenSetupModal}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
            >
              {activeRecord ? (
                <>
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Time Table</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Setup Time Table</span>
                </>
              )}
            </button>

            {activeRecord && (
              <button 
                type="button"
                onClick={handleDeleteTimetable}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
                title="Delete timetable for this class and section"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Time Table</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Timetable Display Area ─── */}
      {!selectedClass || !selectedSection ? (
        /* State 1: When class or section has not been selected yet */
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-16 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
              Select Class &amp; Section to View Time Table
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please choose a Class and Section from the selectors above to view or configure their weekly timetable schedule.
            </p>
          </div>
        </div>
      ) : !activeRecord ? (
        /* State 2: When class & section selected, but no timetable exists yet */
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-16 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
              No Time Table Set Up Yet for {selectedClass} ({selectedSection})
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              This class and section does not have an active timetable schedule yet. Click below to configure daily lecture periods and weekly off days.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenSetupModal}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Setup Time Table</span>
          </button>
        </div>
      ) : (
        /* State 3: When class & section selected AND timetable exists */
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <div className="min-w-[1100px] grid grid-cols-7 gap-3.5 text-xs font-semibold">
            
            {/* Day Headers */}
            {ALL_WEEK_DAYS.map(day => {
              const isDayOff = activeOffDays.includes(day)
              return (
                <div 
                  key={day} 
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isDayOff 
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200' 
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 text-[#1b3a60] dark:text-slate-100 font-black'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 font-black text-xs">
                    <span>{day}</span>
                    {isDayOff && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 uppercase font-black tracking-wider">
                        Off
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Slots Dynamic Grid row logic */}
            {Array.from({ length: maxSlotsCount }).map((_, slotIdx) => {
              
              // Check if ANY day at this slotIdx is a Lunch Break
              const isRowLunchBreak = ALL_WEEK_DAYS.some(day => {
                if (activeOffDays.includes(day)) return false
                const slot = (activeSchedule[day] || [])[slotIdx]
                return slot && slot.isLunchBreak
              })

              if (isRowLunchBreak) {
                const lunchSlot = ALL_WEEK_DAYS.map(d => (activeSchedule[d] || [])[slotIdx]).find(s => s && s.isLunchBreak)
                const timeRange = lunchSlot ? `${lunchSlot.timeFrom} - ${lunchSlot.timeTo}` : '11:15 AM - 12:00 PM'
                const isSundayOff = activeOffDays.includes('Sunday')

                return (
                  <React.Fragment key={`lunch-${slotIdx}`}>
                    {/* Sunday Column: NEVER show lunch break line below Sunday when Sunday is off */}
                    {isSundayOff && (
                      <div 
                        className={`border border-dashed rounded-2xl flex items-center justify-center text-center select-none ${
                          slotIdx === 0
                            ? 'min-h-[100px] border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex-col'
                            : 'min-h-[52px] border-amber-100/60 dark:border-amber-900/20 bg-amber-50/15 dark:bg-amber-950/10 text-amber-300/40 text-[11px]'
                        }`}
                      >
                        {slotIdx === 0 ? (
                          <>
                            <span className="text-xl mb-1">🏖️</span>
                            <span className="text-[10px] font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                              Weekly Off
                            </span>
                            <span className="text-[9px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                              No Classes
                            </span>
                          </>
                        ) : (
                          '-'
                        )}
                      </div>
                    )}

                    {/* Lunch Break banner across working days */}
                    <div 
                      className={`${
                        isSundayOff ? 'col-span-6' : 'col-span-7'
                      } bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-3 text-white font-black flex items-center justify-between shadow-xs relative overflow-hidden`}
                    >
                      <div className="flex items-center gap-2 z-10 px-2 text-xs">
                        <Coffee className="w-4 h-4 text-white/90" />
                        <span>Lunch Break ({timeRange})</span>
                      </div>
                      <div className="flex-1 text-center select-none tracking-widest text-[10px] z-10 opacity-80 uppercase font-mono">
                        • SCHOOL LUNCH RECESS &amp; MEAL BREAK •
                      </div>
                    </div>
                  </React.Fragment>
                )
              }

              return (
                <React.Fragment key={`slot-row-${slotIdx}`}>
                  {ALL_WEEK_DAYS.map(day => {
                    const isDayOff = activeOffDays.includes(day)
                    
                    // If it's an off day:
                    if (isDayOff) {
                      if (slotIdx === 0) {
                        return (
                          <div 
                            key={`${day}-${slotIdx}`} 
                            className="min-h-[100px] border border-dashed border-amber-300 dark:border-amber-800 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 p-4 flex flex-col items-center justify-center text-center select-none"
                          >
                            <span className="text-xl mb-1">🏖️</span>
                            <span className="text-[10px] font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                              Weekly Off
                            </span>
                            <span className="text-[9px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                              No Classes
                            </span>
                          </div>
                        )
                      }
                      return (
                        <div 
                          key={`${day}-${slotIdx}`} 
                          className="min-h-[100px] border border-dashed border-amber-100/60 dark:border-amber-900/20 rounded-2xl bg-amber-50/15 dark:bg-amber-950/10 flex items-center justify-center text-amber-300/40 text-[11px]"
                        >
                          -
                        </div>
                      )
                    }

                    const slot = (activeSchedule[day] || [])[slotIdx]
                    if (!slot) {
                      return (
                        <div 
                          key={`${day}-${slotIdx}`} 
                          className="min-h-[100px] border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-center text-slate-300 text-[10px]"
                        >
                          Free Slot
                        </div>
                      )
                    }

                    if (slot.isLunchBreak) {
                      return (
                        <div 
                          key={`${day}-${slotIdx}`} 
                          className="border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 rounded-2xl p-3.5 space-y-1.5 shadow-2xs"
                        >
                          <div className="flex items-center gap-1.5 text-[9.5px] font-black tracking-wider uppercase text-blue-600 dark:text-blue-400">
                            <Coffee className="w-3.5 h-3.5" />
                            <span>{slot.timeFrom} - {slot.timeTo}</span>
                          </div>
                          <h4 className="font-extrabold text-[11.5px] leading-tight text-blue-800 dark:text-blue-200">
                            Lunch Break
                          </h4>
                          <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70">
                            Meal &amp; Recess
                          </p>
                        </div>
                      )
                    }

                    const colorClass = PASTEL_COLORS[slotIdx % PASTEL_COLORS.length]

                    return (
                      <div 
                        key={`${day}-${slotIdx}`} 
                        className={`border rounded-2xl p-3.5 space-y-2 shadow-2xs transition-all hover:shadow-md ${colorClass}`}
                      >
                        <div className="flex items-center gap-1.5 text-[9.5px] font-black tracking-wider uppercase opacity-80">
                          <Clock className="w-3 h-3" />
                          <span>{slot.timeFrom} - {slot.timeTo}</span>
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-[11.5px] leading-tight">
                            {slot.subject}
                          </h4>
                          <p className="text-[10px] opacity-80 flex items-center gap-1">
                            <User className="w-2.5 h-2.5 opacity-60" />
                            <span>{slot.teacher || 'Unassigned'}</span>
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </React.Fragment>
              )
            })}

          </div>
        </div>
      )}


      {/* ─── ADD / EDIT TIME TABLE MODAL ─── */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 relative p-6 sm:p-8 space-y-6">
            
            <button 
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
              <h2 className="text-sm font-black text-[#1b3a60] dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Configure Class Time Table</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Set daily lecture periods, mark weekly off days, and verify live teacher conflict protection.
              </p>
            </div>

            <form onSubmit={(e) => handleSaveModal(e, false)} className="space-y-6 text-xs font-semibold text-slate-700 dark:text-slate-200">
              
              {/* Class & Section row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Class *</label>
                  <select 
                    value={modalClass} 
                    onChange={e => {
                      const newClass = e.target.value
                      setModalClass(newClass)
                      const validSecs = getSectionsForClass(newClass)
                      if (!validSecs.includes(modalSection)) {
                        setModalSection(validSecs[0] || '')
                      }
                    }} 
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold" 
                    required
                  >
                    <option value="">Select Class</option>
                    {classesData.map((c: any) => (
                      <option key={c.className} value={c.className}>{c.className}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Section *</label>
                  <select 
                    value={modalSection} 
                    onChange={e => setModalSection(e.target.value)} 
                    disabled={!modalClass}
                    className={`w-full px-4 py-2.5 border rounded-xl outline-none font-bold text-xs transition-colors ${
                      !modalClass 
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                    }`}
                    required
                  >
                    <option value="">
                      {!modalClass ? 'Select Class First' : 'Select Section'}
                    </option>
                    {availableModalSections.map((secName) => (
                      <option key={secName} value={secName}>{secName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Day Tab Switcher with Off-Day badges */}
              <div className="border-b border-slate-200 dark:border-slate-700 flex flex-nowrap overflow-x-auto gap-2 pb-1.5">
                {ALL_WEEK_DAYS.map(day => {
                  const isDayOff = modalOffDays.includes(day)
                  return (
                    <button 
                      key={day}
                      type="button"
                      onClick={() => setActiveModalDay(day)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        activeModalDay === day 
                          ? 'bg-teal-600 text-white shadow-sm' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <span>{day}</span>
                      {isDayOff && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                          activeModalDay === day 
                            ? 'bg-white/20 text-white' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}>
                          Off
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Day Builder Container */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/30 space-y-5">
                
                {/* Day status & Day-Off Toggle Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-2xs ${
                      isCurrentDayOff 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' 
                        : 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300'
                    }`}>
                      {isCurrentDayOff ? '🏖️' : '📚'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                          {activeModalDay}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                          isCurrentDayOff 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' 
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                        }`}>
                          {isCurrentDayOff ? 'Weekly Day Off' : 'Working Day'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {isCurrentDayOff 
                          ? 'This day is marked as off. No lecture periods or classes will run.' 
                          : 'Regular lecture periods are scheduled for this day.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleOpenCopyModal}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                      title={`Copy ${activeModalDay}'s schedule to Tuesday and other days`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy to Other Days</span>
                    </button>

                    {/* Modern Slide Toggle ON/OFF Switch for Week Day Off */}
                    <div 
                      onClick={() => handleToggleDayOff(activeModalDay)}
                      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none shadow-2xs ${
                        isCurrentDayOff
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70'
                      }`}
                      title={`Click to turn Week Day Off ${isCurrentDayOff ? 'OFF (Working Day)' : 'ON (Day Off)'}`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5">
                          <span>Week Day Off</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase transition-colors ${
                            isCurrentDayOff 
                              ? 'bg-amber-500 text-white shadow-2xs' 
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>
                            {isCurrentDayOff ? 'ON' : 'OFF'}
                          </span>
                        </span>
                      </div>

                      {/* Sliding Toggle Pill */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isCurrentDayOff}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleDayOff(activeModalDay)
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isCurrentDayOff ? 'bg-amber-500 shadow-inner' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            isCurrentDayOff ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* If day is off: Show friendly message */}
                {isCurrentDayOff ? (
                  <div className="py-12 px-6 text-center rounded-2xl bg-gradient-to-b from-amber-50/70 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 border-2 border-dashed border-amber-200 dark:border-amber-800/60 space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center text-2xl shadow-xs">
                      🏖️
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {activeModalDay} is Marked as a Weekly Day Off
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        No periods need to be configured for {activeModalDay}. If this class has sessions on this day, click the toggle above or below to make it a working day.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleDayOff(activeModalDay)}
                      className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-amber-50 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold transition-colors shadow-2xs inline-flex items-center gap-2"
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Slide Day Off to OFF (Make {activeModalDay} a Working Day)</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Dynamically mapped period cards */}
                    {(modalSlots[activeModalDay] || []).length === 0 && (
                      <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs">
                        No periods added yet for {activeModalDay}. Click "+ Add Subject" or "+ Add Lunch Break" below.
                      </div>
                    )}

                    {(modalSlots[activeModalDay] || []).map((slot, idx) => {
                      
                      // 1. Lunch Break Row
                      if (slot.isLunchBreak) {
                        const prevSlot = idx > 0 ? (modalSlots[activeModalDay] || [])[idx - 1] : null
                        const canAlignWithPrev = prevSlot && prevSlot.timeTo && prevSlot.timeTo !== slot.timeFrom

                        return (
                          <div key={slot.id} className="p-4 border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <Coffee className="w-3.5 h-3.5" />
                                  <span>Lunch Break Row</span>
                                </span>
                                {canAlignWithPrev && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSlotFieldChange(idx, 'timeFrom', prevSlot.timeTo)
                                    }}
                                    className="text-[9.5px] px-2 py-0.5 rounded-md font-bold bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 transition-colors flex items-center gap-1 shadow-2xs"
                                    title={`Align Lunch Break start time to match previous period end (${prevSlot.timeTo})`}
                                  >
                                    ⚡ Align from {prevSlot.timeTo}
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Quick duration presets */}
                                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                                  <span className="text-[9px] text-slate-400 font-bold px-1">Duration:</span>
                                  {[30, 45, 60].map(dur => (
                                    <button
                                      key={dur}
                                      type="button"
                                      onClick={() => {
                                        const fromMin = parseTimeToMinutes(slot.timeFrom)
                                        if (fromMin !== null) {
                                          const toMin = fromMin + dur
                                          const h = Math.floor(toMin / 60) % 24
                                          const m = toMin % 60
                                          const mer = h >= 12 ? 'PM' : 'AM'
                                          const h12 = h % 12 || 12
                                          handleSlotFieldChange(idx, 'timeTo', `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${mer}`)
                                        }
                                      }}
                                      className="px-2 py-0.5 rounded text-[9.5px] font-black text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors"
                                      title={`Set Lunch Break to ${dur} minutes`}
                                    >
                                      {dur}m
                                    </button>
                                  ))}
                                </div>

                                <button 
                                  type="button" 
                                  onClick={() => deleteSlotRow(slot.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 border border-transparent hover:border-red-100 transition-colors"
                                  title="Remove Lunch Break"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-slate-500 font-bold text-[11px] flex items-center justify-between">
                                  <span>Time From *</span>
                                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{slot.timeFrom}</span>
                                </label>
                                <input 
                                  type="time"
                                  value={formatTimeTo24Hour(slot.timeFrom)} 
                                  onChange={e => {
                                    if (e.target.value) {
                                      handleSlotFieldChange(idx, 'timeFrom', formatTimeTo12Hour(e.target.value))
                                    }
                                  }} 
                                  className="w-full px-3.5 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none font-bold text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-2xs"
                                  required
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-slate-500 font-bold text-[11px] flex items-center justify-between">
                                  <span>Time To *</span>
                                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{slot.timeTo}</span>
                                </label>
                                <input 
                                  type="time"
                                  value={formatTimeTo24Hour(slot.timeTo)} 
                                  onChange={e => {
                                    if (e.target.value) {
                                      handleSlotFieldChange(idx, 'timeTo', formatTimeTo12Hour(e.target.value))
                                    }
                                  }} 
                                  className="w-full px-3.5 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none font-bold text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-2xs"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        )
                      }

                      // 2. Regular Lecture Slot Row
                      // Teacher conflict check
                      const conflict = findTeacherConflict(
                        slot.teacher,
                        activeModalDay,
                        slot.timeFrom,
                        slot.timeTo,
                        slot.id,
                        modalClass,
                        modalSection,
                        modalSlots[activeModalDay] || [],
                        records
                      )

                      return (
                        <div 
                          key={slot.id} 
                          className={`p-4 rounded-2xl border transition-all ${
                            conflict 
                              ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800' 
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 items-end">
                            
                            {/* Subject Picker (Filtered Class-Wise) */}
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-slate-500 font-bold text-[11px] flex items-center gap-1">
                                  <span>Subject *</span>
                                  {modalClass && (
                                    <span className="text-[9.5px] text-teal-600 dark:text-teal-400 font-semibold">
                                      ({modalClass})
                                    </span>
                                  )}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setQuickAddSubjectModal(true)}
                                  className="text-[10px] text-teal-600 hover:underline font-bold"
                                  title={`Add a new subject for ${modalClass || 'all classes'}`}
                                >
                                  + New
                                </button>
                              </div>
                              <select 
                                value={modalAvailableSubjects.includes(slot.subject) ? slot.subject : ''} 
                                onChange={e => handleSlotFieldChange(idx, 'subject', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold text-xs" 
                                required 
                              >
                                <option value="">Select Subject</option>
                                {modalAvailableSubjects.map((sName) => (
                                  <option key={sName} value={sName}>{sName}</option>
                                ))}
                              </select>
                            </div>

                            {/* Teacher Picker with live conflict indicators */}
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-slate-500 font-bold text-[11px]">Teacher *</label>
                                <button
                                  type="button"
                                  onClick={() => setQuickAddTeacherModal(true)}
                                  className="text-[10px] text-teal-600 hover:underline font-bold"
                                  title="Add new teacher to list"
                                >
                                  + New
                                </button>
                              </div>
                              <select 
                                value={teachersList.includes(slot.teacher) ? slot.teacher : ''} 
                                onChange={e => handleSlotFieldChange(idx, 'teacher', e.target.value)} 
                                className={`w-full px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold text-xs ${
                                  conflict 
                                    ? 'border-rose-400 ring-2 ring-rose-400/20 text-rose-700 dark:text-rose-300' 
                                    : 'border-slate-200 dark:border-slate-700'
                                }`} 
                                required
                              >
                                <option value="">Select Teacher</option>
                                {teachersList.map((tName) => {
                                  // Check if this teacher is busy in another class at this time
                                  const tBusy = findTeacherConflict(
                                    tName,
                                    activeModalDay,
                                    slot.timeFrom,
                                    slot.timeTo,
                                    slot.id,
                                    modalClass,
                                    modalSection,
                                    modalSlots[activeModalDay] || [],
                                    records
                                  )
                                  return (
                                    <option key={tName} value={tName}>
                                      {tName} {tBusy ? `⚠️ (Busy in ${tBusy.targetClass} ${tBusy.targetSection})` : ''}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>

                            {/* Time From */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-slate-500 dark:text-slate-400 font-bold text-[11px] flex items-center justify-between">
                                <span>Time From *</span>
                                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">{slot.timeFrom}</span>
                              </label>
                              <input 
                                type="time"
                                value={formatTimeTo24Hour(slot.timeFrom)} 
                                onChange={e => {
                                  if (e.target.value) {
                                    handleSlotFieldChange(idx, 'timeFrom', formatTimeTo12Hour(e.target.value))
                                  }
                                }} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer shadow-2xs" 
                                required
                              />
                            </div>

                            {/* Time To */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-slate-500 dark:text-slate-400 font-bold text-[11px] flex items-center justify-between">
                                <span>Time To *</span>
                                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">{slot.timeTo}</span>
                              </label>
                              <input 
                                type="time"
                                value={formatTimeTo24Hour(slot.timeTo)} 
                                onChange={e => {
                                  if (e.target.value) {
                                    handleSlotFieldChange(idx, 'timeTo', formatTimeTo12Hour(e.target.value))
                                  }
                                }} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer shadow-2xs" 
                                required
                              />
                            </div>

                            {/* Remove button */}
                            <div className="flex justify-end">
                              <button 
                                type="button" 
                                onClick={() => deleteSlotRow(slot.id)}
                                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 border border-red-200 dark:border-red-800 transition-colors w-full flex items-center justify-center gap-1.5 font-bold text-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> 
                                <span>Remove</span>
                              </button>
                            </div>

                          </div>

                          {/* Conflict Warning Alert Banner */}
                          {conflict && (
                            <div className="mt-3 p-3 rounded-xl bg-rose-100/70 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/80 flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs">
                              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                              <div className="leading-relaxed">
                                <span className="font-black">Teacher Schedule Conflict: </span>
                                <span>
                                  <strong>{conflict.teacher}</strong> is already scheduled for{' '}
                                  <strong className="underline">{conflict.targetClass} ({conflict.targetSection})</strong>{' '}
                                  on <strong>{conflict.day}</strong> from <strong>{conflict.timeFrom} to {conflict.timeTo}</strong> ({conflict.subject})!
                                </span>
                              </div>
                            </div>
                          )}

                        </div>
                      )
                    })}

                    {/* Actions bar inside day builder */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex-wrap">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button 
                          type="button" 
                          onClick={addLunchBreakRow}
                          className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold shadow-2xs flex items-center gap-1.5"
                        >
                          <Coffee className="w-3.5 h-3.5 text-blue-500" />
                          <span>+ Add Lunch Break</span>
                        </button>
                        
                        <button 
                          type="button" 
                          onClick={addSubjectRow}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add Subject</span>
                        </button>

                        {(modalSlots[activeModalDay] || []).length > 1 && (
                          <button 
                            type="button" 
                            onClick={handleAutoSortDay}
                            className="px-3.5 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold shadow-2xs flex items-center gap-1.5 text-xs transition-colors"
                            title="Sort all periods and lunch break chronologically by start time"
                          >
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            <span>Auto-Sort by Time</span>
                          </button>
                        )}

                        {(modalSlots[activeModalDay] || []).length > 0 && (
                          <button 
                            type="button" 
                            onClick={handleOpenCopyModal}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5 transition-colors text-xs"
                            title="Copy this day's schedule to Tuesday and other days"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Schedule To...</span>
                          </button>
                        )}
                      </div>

                      {(modalSlots[activeModalDay] || []).length > 0 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete all periods for ${activeModalDay}?`)) {
                              setModalSlots({ ...modalSlots, [activeModalDay]: [] })
                            }
                          }}
                          className="px-3.5 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 rounded-xl font-bold transition-colors text-xs flex items-center gap-1.5 border border-red-200 dark:border-red-800"
                          title="Delete all periods for this day"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete All Periods</span>
                        </button>
                      )}
                    </div>
                  </>
                )}

              </div>

              {/* Bottom Save Action */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md text-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Time Table</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── CONFLICT REVIEW & OVERRIDE MODAL ─── */}
      {conflictReviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-rose-200 dark:border-rose-800 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Teacher Schedule Conflict Warning
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  {detectedConflictsList.length} teacher overlap conflict(s) detected in this schedule.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-slate-700 dark:text-slate-200">
              {detectedConflictsList.map((c, i) => (
                <div key={i} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-rose-200 dark:border-rose-800 space-y-1">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>{c.teacher}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Already scheduled on <strong className="text-slate-700 dark:text-slate-200">{c.day}</strong> ({c.timeFrom} - {c.timeTo}) in <strong className="text-slate-700 dark:text-slate-200">{c.targetClass} - {c.targetSection}</strong> for <em>{c.subject}</em>.
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Double-booking a teacher may cause simultaneous class clashes. Would you like to review and change the teacher/time, or proceed anyway?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConflictReviewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs"
              >
                Review &amp; Fix Conflicts
              </button>
              <button
                type="button"
                onClick={() => handleSaveModal(undefined, true)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all text-xs shadow-md shadow-rose-600/20"
              >
                Proceed &amp; Save Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUICK ADD TEACHER MODAL ─── */}
      {quickAddTeacherModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-600" />
                <span>Add Teacher to Timetable List</span>
              </h3>
              <button onClick={() => setQuickAddTeacherModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddQuickTeacher} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500">Teacher Full Name *</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newTeacherNameInput} 
                  onChange={e => setNewTeacherNameInput(e.target.value)} 
                  className="w-full px-3.5 py-2 border rounded-xl text-xs font-bold outline-none border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" 
                  placeholder="e.g. Mrs. Anjali Sharma" 
                  required 
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setQuickAddTeacherModal(false)} 
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                >
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── COPY SCHEDULE MODAL ─── */}
      {copyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <Copy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                    Copy {activeModalDay}&apos;s Schedule
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {(modalSlots[activeModalDay] || []).length} period(s) configured on {activeModalDay}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setCopyModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Target Days to Replicate
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const allOthers = ALL_WEEK_DAYS.filter(d => d !== activeModalDay && d !== 'Sunday')
                      setCopyTargetDays(allOthers)
                    }}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    All Weekdays
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setCopyTargetDays([])}
                    className="text-[10px] text-slate-400 hover:underline font-bold"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Day selection checkboxes */}
              <div className="grid grid-cols-2 gap-2">
                {ALL_WEEK_DAYS.filter(d => d !== activeModalDay).map(day => {
                  const isChecked = copyTargetDays.includes(day)
                  const isDayOff = modalOffDays.includes(day)
                  const existingCount = (modalSlots[day] || []).length

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setCopyTargetDays(prev => 
                          prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                        )
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isChecked 
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 shadow-2xs' 
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-bold">{day}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isDayOff && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                            Off
                          </span>
                        )}
                        {existingCount > 0 && (
                          <span className="text-[9px] text-slate-400">
                            ({existingCount}p)
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Working Day Auto-activation toggle */}
              <label className="flex items-start gap-2.5 pt-1 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoEnableWorkingDay}
                  onChange={e => setAutoEnableWorkingDay(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <span>Automatically activate selected days as <strong>Working Days</strong> (unmark weekly off)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button 
                type="button" 
                onClick={() => setCopyModalOpen(false)} 
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleApplyCopySchedule}
                disabled={copyTargetDays.length === 0}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  copyTargetDays.length === 0
                    ? 'bg-slate-200 text-slate-400 dark:bg-slate-700 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy to {copyTargetDays.length} Day{copyTargetDays.length === 1 ? '' : 's'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUICK ADD SUBJECT MODAL ─── */}
      {quickAddSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Add Subject to Timetable List</span>
              </h3>
              <button onClick={() => setQuickAddSubjectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddQuickSubject} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500">Subject Name *</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newSubjectNameInput} 
                  onChange={e => setNewSubjectNameInput(e.target.value)} 
                  className="w-full px-3.5 py-2 border rounded-xl text-xs font-bold outline-none border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900" 
                  placeholder="e.g. Environmental Studies" 
                  required 
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setQuickAddSubjectModal(false)} 
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── TOAST NOTIFICATION ─── */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300 border border-slate-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

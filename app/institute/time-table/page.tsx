'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, Plus, Calendar, Clock, Trash2, X, Download, 
  CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert, 
  User, BookOpen, Coffee, Sun, Check, ArrowRight, Pencil
} from 'lucide-react'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'
import { fetchTeachers } from '@/app/institute/teachers/actions'
import { fetchEmployees } from '@/app/institute/employees/actions'

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
  'Monday': [
    { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'Maths', teacher: 'Dr. S. K. Sharma' },
    { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'English', teacher: 'Mrs. Kavita Verma' },
    { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Hindi', teacher: 'Mrs. Pooja Sen' },
    { id: 4, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
    { id: 5, timeFrom: '12:00 PM', timeTo: '12:45 PM', subject: 'Science', teacher: 'Mr. R. K. Saxena' },
    { id: 6, timeFrom: '12:45 PM', timeTo: '01:30 PM', subject: 'GK', teacher: 'Mr. Rajesh Kumar' },
    { id: 7, timeFrom: '01:30 PM', timeTo: '02:15 PM', subject: 'Computer', teacher: 'Ms. Neha Gupta' },
  ],
  'Tuesday': [
    { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'English', teacher: 'Mrs. Kavita Verma' },
    { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'Hindi', teacher: 'Mrs. Pooja Sen' },
    { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Science', teacher: 'Mr. R. K. Saxena' },
    { id: 4, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
    { id: 5, timeFrom: '12:00 PM', timeTo: '12:45 PM', subject: 'GK', teacher: 'Mr. Rajesh Kumar' },
    { id: 6, timeFrom: '12:45 PM', timeTo: '01:30 PM', subject: 'Computer', teacher: 'Ms. Neha Gupta' },
    { id: 7, timeFrom: '01:30 PM', timeTo: '02:15 PM', subject: 'Maths', teacher: 'Dr. S. K. Sharma' },
  ],
  'Wednesday': [
    { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'Hindi', teacher: 'Mrs. Pooja Sen' },
    { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'GK', teacher: 'Mr. Rajesh Kumar' },
    { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Maths', teacher: 'Dr. S. K. Sharma' },
    { id: 4, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
    { id: 5, timeFrom: '12:00 PM', timeTo: '12:45 PM', subject: 'Computer', teacher: 'Ms. Neha Gupta' },
    { id: 6, timeFrom: '12:45 PM', timeTo: '01:30 PM', subject: 'Science', teacher: 'Mr. R. K. Saxena' },
    { id: 7, timeFrom: '01:30 PM', timeTo: '02:15 PM', subject: 'English', teacher: 'Mrs. Kavita Verma' },
  ],
  'Thursday': [
    { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'Maths', teacher: 'Dr. S. K. Sharma' },
    { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'English', teacher: 'Mrs. Kavita Verma' },
    { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Hindi', teacher: 'Mrs. Pooja Sen' },
    { id: 4, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
    { id: 5, timeFrom: '12:00 PM', timeTo: '12:45 PM', subject: 'Science', teacher: 'Mr. R. K. Saxena' },
    { id: 6, timeFrom: '12:45 PM', timeTo: '01:30 PM', subject: 'GK', teacher: 'Mr. Rajesh Kumar' },
    { id: 7, timeFrom: '01:30 PM', timeTo: '02:15 PM', subject: 'Computer', teacher: 'Ms. Neha Gupta' },
  ],
  'Friday': [
    { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'English', teacher: 'Mrs. Kavita Verma' },
    { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'Hindi', teacher: 'Mrs. Pooja Sen' },
    { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Science', teacher: 'Mr. R. K. Saxena' },
    { id: 4, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
    { id: 5, timeFrom: '12:00 PM', timeTo: '12:45 PM', subject: 'GK', teacher: 'Mr. Rajesh Kumar' },
    { id: 6, timeFrom: '12:45 PM', timeTo: '01:30 PM', subject: 'Computer', teacher: 'Ms. Neha Gupta' },
    { id: 7, timeFrom: '01:30 PM', timeTo: '02:15 PM', subject: 'Maths', teacher: 'Dr. S. K. Sharma' },
  ],
  'Saturday': [
    { id: 1, timeFrom: '09:00 AM', timeTo: '09:45 AM', subject: 'Hindi', teacher: 'Mrs. Pooja Sen' },
    { id: 2, timeFrom: '09:45 AM', timeTo: '10:30 AM', subject: 'GK', teacher: 'Mr. Rajesh Kumar' },
    { id: 3, timeFrom: '10:30 AM', timeTo: '11:15 AM', subject: 'Maths', teacher: 'Dr. S. K. Sharma' },
    { id: 4, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true },
    { id: 5, timeFrom: '12:00 PM', timeTo: '12:45 PM', subject: 'Computer', teacher: 'Ms. Neha Gupta' },
    { id: 6, timeFrom: '12:45 PM', timeTo: '01:30 PM', subject: 'Science', teacher: 'Mr. R. K. Saxena' },
    { id: 7, timeFrom: '01:30 PM', timeTo: '02:15 PM', subject: 'English', teacher: 'Mrs. Kavita Verma' },
  ],
}

const DEFAULT_TEACHERS = [
  'Dr. S. K. Sharma',
  'Mrs. Kavita Verma',
  'Mr. R. K. Saxena',
  'Mrs. Pooja Sen',
  'Mr. Rajesh Kumar',
  'Ms. Neha Gupta',
  'Mr. Amit Patel',
  'Mrs. Sunita Mishra'
]

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
  const [selectedClass, setSelectedClass] = useState('Class V')
  const [selectedSection, setSelectedSection] = useState('Section A')

  // Dynamic teachers and subjects from database & masters
  const [teachersList, setTeachersList] = useState<string[]>(DEFAULT_TEACHERS)
  const [subjectsList, setSubjectsList] = useState<string[]>(DEFAULT_SUBJECTS)

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

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // ─── 1. Load Teachers from Setup and DB ───
  useEffect(() => {
    async function loadTeachersData() {
      const namesSet = new Set<string>(DEFAULT_TEACHERS)

      // A. Check localStorage masters
      try {
        const savedMastersTeachers = localStorage.getItem('school_masters_teachers')
        if (savedMastersTeachers) {
          const parsed = JSON.parse(savedMastersTeachers)
          if (Array.isArray(parsed)) {
            parsed.forEach((t: any) => {
              const name = typeof t === 'string' ? t : (t.name || t.teacherName)
              if (name && typeof name === 'string') namesSet.add(name.trim())
            })
          }
        }
      } catch (e) {
        console.error('Error reading localStorage teachers:', e)
      }

      // B. Fetch added teachers from institute_teachers table
      try {
        const res = await fetchTeachers()
        if (res?.success && Array.isArray(res.data)) {
          res.data.forEach((t: any) => {
            if (t.name) namesSet.add(t.name.trim())
          })
        }
      } catch (e) {
        console.log('fetchTeachers note:', e)
      }

      // C. Fetch employees from institute_staff_members
      try {
        const empRes = await fetchEmployees()
        if (empRes?.success && Array.isArray(empRes.data)) {
          empRes.data.forEach((e: any) => {
            if (e.name) namesSet.add(e.name.trim())
          })
        }
      } catch (e) {
        console.log('fetchEmployees note:', e)
      }

      setTeachersList(Array.from(namesSet))
    }

    loadTeachersData()
  }, [])

  // ─── 2. Load Subjects from Setup & Masters ───
  useEffect(() => {
    const subjectsSet = new Set<string>(DEFAULT_SUBJECTS)

    // A. Check hook masters data
    if (Array.isArray(rawSubjectsData)) {
      rawSubjectsData.forEach((s: any) => {
        const name = typeof s === 'string' ? s : (s.subjectName || s.name)
        if (name && typeof name === 'string') subjectsSet.add(name.trim())
      })
    }

    // B. Check localStorage school_masters_subjects
    try {
      const savedSubs = localStorage.getItem('school_masters_subjects')
      if (savedSubs) {
        const parsed = JSON.parse(savedSubs)
        if (Array.isArray(parsed)) {
          parsed.forEach((s: any) => {
            const name = typeof s === 'string' ? s : (s.subjectName || s.name)
            if (name && typeof name === 'string') subjectsSet.add(name.trim())
          })
        }
      }
    } catch (e) {
      console.error('Error reading school_masters_subjects:', e)
    }

    setSubjectsList(Array.from(subjectsSet))
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

  const availableViewSections = useMemo(() => {
    return getSectionsForClass(selectedClass)
  }, [selectedClass, classesData, sectionsData])

  const availableModalSections = useMemo(() => {
    return getSectionsForClass(modalClass)
  }, [modalClass, classesData, sectionsData])

  // Find active schedule
  const activeRecord = records.find(r => r.classes === selectedClass && r.section === selectedSection)
  const activeSchedule = activeRecord ? activeRecord.schedule : DEFAULT_SCHEDULE
  const activeOffDays = activeRecord?.offDays || ['Sunday']

  // Modal slot actions
  const addSubjectRow = () => {
    const current = [...(modalSlots[activeModalDay] || [])]
    const nextId = Date.now()
    setModalSlots({
      ...modalSlots,
      [activeModalDay]: [
        ...current,
        { 
          id: nextId, 
          timeFrom: '09:00 AM', 
          timeTo: '09:45 AM', 
          subject: subjectsList[0] || 'Maths', 
          teacher: teachersList[0] || 'Dr. S. K. Sharma' 
        }
      ]
    })
  }

  const addLunchBreakRow = () => {
    const current = [...(modalSlots[activeModalDay] || [])]
    const nextId = Date.now()
    setModalSlots({
      ...modalSlots,
      [activeModalDay]: [
        ...current,
        { id: nextId, timeFrom: '11:15 AM', timeTo: '12:00 PM', subject: 'Lunch Break', teacher: '', isLunchBreak: true }
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
    current[idx] = {
      ...current[idx],
      [field]: value
    }
    setModalSlots({
      ...modalSlots,
      [activeModalDay]: current
    })
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

  // Quick add teacher
  const handleAddQuickTeacher = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newTeacherNameInput.trim()
    if (!trimmed) return
    if (!teachersList.includes(trimmed)) {
      setTeachersList(prev => [trimmed, ...prev])
      try {
        const saved = localStorage.getItem('school_masters_teachers')
        const arr = saved ? JSON.parse(saved) : []
        arr.push({ teacherName: trimmed, name: trimmed })
        localStorage.setItem('school_masters_teachers', JSON.stringify(arr))
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
    if (!subjectsList.includes(trimmed)) {
      setSubjectsList(prev => [trimmed, ...prev])
      try {
        const saved = localStorage.getItem('school_masters_subjects')
        const arr = saved ? JSON.parse(saved) : []
        arr.push({ subjectName: trimmed, name: trimmed, type: 'Marks' })
        localStorage.setItem('school_masters_subjects', JSON.stringify(arr))
      } catch (err) {
        console.error(err)
      }
    }
    setNewSubjectNameInput('')
    setQuickAddSubjectModal(false)
    setToastMsg(`Subject "${trimmed}" added!`)
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

    const newRecord: TimetableRecord = {
      id: activeRecord ? activeRecord.id : Date.now().toString(),
      classes: modalClass,
      section: modalSection,
      schedule: modalSlots as DaySchedule,
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
    setModalSlots(activeSchedule || DEFAULT_SCHEDULE)
    setModalOffDays(activeOffDays || ['Sunday'])
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

        {/* Status badges and unified single action or Edit/Delete buttons */}
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
      </div>

      {/* ─── Weekly Schedule Grid ─── */}
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

              return (
                <div 
                  key={`lunch-${slotIdx}`} 
                  className="col-span-7 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-3 text-white font-black flex items-center justify-between shadow-xs relative overflow-hidden"
                >
                  <div className="flex items-center gap-2 z-10 px-2 text-xs">
                    <Coffee className="w-4 h-4 text-white/90" />
                    <span>Lunch Break ({timeRange})</span>
                  </div>
                  <div className="flex-1 text-center select-none tracking-widest text-[10px] z-10 opacity-80 uppercase font-mono">
                    • SCHOOL LUNCH RECESS &amp; MEAL BREAK •
                  </div>
                </div>
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

                  <button
                    type="button"
                    onClick={() => handleToggleDayOff(activeModalDay)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
                      isCurrentDayOff
                        ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isCurrentDayOff ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Day Off Active (Toggle Working)</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-3.5 h-3.5" />
                        <span>Select as Week Day Off</span>
                      </>
                    )}
                  </button>
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
                        No periods need to be configured for {activeModalDay}. If this class has sessions on this day, click below to make it a working day.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleDayOff(activeModalDay)}
                      className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-amber-50 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      Make {activeModalDay} a Working Day
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
                        return (
                          <div key={slot.id} className="p-4 border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Coffee className="w-3.5 h-3.5" />
                                <span>Lunch Break Row</span>
                              </span>
                              <button 
                                type="button" 
                                onClick={() => deleteSlotRow(slot.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 border border-transparent hover:border-red-100 transition-colors"
                                title="Remove Lunch Break"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-slate-500 font-bold text-[11px]">Time From *</label>
                                <select 
                                  value={slot.timeFrom} 
                                  onChange={e => handleSlotFieldChange(idx, 'timeFrom', e.target.value)} 
                                  className="w-full px-3.5 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none font-bold text-xs"
                                >
                                  {TIME_OPTIONS.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-slate-500 font-bold text-[11px]">Time To *</label>
                                <select 
                                  value={slot.timeTo} 
                                  onChange={e => handleSlotFieldChange(idx, 'timeTo', e.target.value)} 
                                  className="w-full px-3.5 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none font-bold text-xs"
                                >
                                  {TIME_OPTIONS.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
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
                            
                            {/* Subject Picker */}
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-slate-500 font-bold text-[11px]">Subject *</label>
                                <button
                                  type="button"
                                  onClick={() => setQuickAddSubjectModal(true)}
                                  className="text-[10px] text-teal-600 hover:underline font-bold"
                                  title="Add a new subject to list"
                                >
                                  + New
                                </button>
                              </div>
                              <select 
                                value={slot.subject} 
                                onChange={e => handleSlotFieldChange(idx, 'subject', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold text-xs" 
                                required 
                              >
                                <option value="">Select Subject</option>
                                {subjectsList.map((sName) => (
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
                                value={slot.teacher} 
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
                              <label className="text-slate-500 font-bold text-[11px]">Time From *</label>
                              <select 
                                value={slot.timeFrom} 
                                onChange={e => handleSlotFieldChange(idx, 'timeFrom', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold text-xs" 
                                required
                              >
                                {TIME_OPTIONS.map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>

                            {/* Time To */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-slate-500 font-bold text-[11px]">Time To *</label>
                              <select 
                                value={slot.timeTo} 
                                onChange={e => handleSlotFieldChange(idx, 'timeTo', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none font-bold text-xs" 
                                required
                              >
                                {TIME_OPTIONS.map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
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
                      <div className="flex items-center gap-3">
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

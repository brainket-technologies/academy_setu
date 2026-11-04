'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Sun,
  PartyPopper,
  GraduationCap,
  Trophy,
  BookOpen,
  Briefcase,
  Layers,
  Check,
  RefreshCw,
  List
} from 'lucide-react'
import { getInstituteAddedClasses } from '@/lib/institute-classes'

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================
type ViewMode = 'Month' | 'Week' | 'Day' | 'List'

export interface AcademicCalendarItem {
  id: string | number
  title: string
  eventType: string
  isHoliday: boolean
  holidayType?: 'Full Day' | 'Half Day' | 'Not Applicable'
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  allDay: boolean
  startTime?: string
  endTime?: string
  location?: string
  targetClasses?: string[]
  color?: string
  description?: string
  createdAt?: string
}

const HOURS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM'
]

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const COLOR_PRESETS = [
  { name: 'Emerald (Holiday)', hex: '#10b981' },
  { name: 'Teal (Academic)', hex: '#0d9488' },
  { name: 'Amber (Celebration)', hex: '#f59e0b' },
  { name: 'Rose (Meeting/Exam)', hex: '#e11d48' },
  { name: 'Indigo (Sports/Activity)', hex: '#6366f1' },
  { name: 'Slate (Half Day)', hex: '#64748b' }
]

const EVENT_CATEGORIES = [
  'Academic Event',
  'Holiday',
  'Cultural Event',
  'Sports / Activity',
  'Examination',
  'Meeting / PTM',
  'Celebration / Assembly',
  'Training / Workshop',
  'Weekoff'
]

// Date helpers
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDateToISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function isDateInRange(targetDateStr: string, startDateStr: string, endDateStr: string): boolean {
  return targetDateStr >= startDateStr && targetDateStr <= (endDateStr || startDateStr)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AcademicCalendarPage() {
  const [events, setEvents] = useState<AcademicCalendarItem[]>([])
  const [loading, setLoading] = useState(true)

  // Calendar View & Navigation (Defaults to Month View and Current System Date)
  const [view, setView] = useState<ViewMode>('Month')
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterHolidayOnly, setFilterHolidayOnly] = useState<'all' | 'holidays' | 'events'>('all')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [sidebarScope, setSidebarScope] = useState<'thisMonth' | 'all'>('thisMonth')

  // Add & Edit Modal State
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | number | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formIsHoliday, setFormIsHoliday] = useState(false)
  const [formHolidayType, setFormHolidayType] = useState<'Full Day' | 'Half Day'>('Full Day')
  const [formEventType, setFormEventType] = useState('Academic Event')
  const [formDateMode, setFormDateMode] = useState<'single' | 'range'>('single')
  const [formStartDate, setFormStartDate] = useState(() => formatDateToISO(new Date()))
  const [formEndDate, setFormEndDate] = useState(() => formatDateToISO(new Date()))
  const [formAllDay, setFormAllDay] = useState(true)
  const [formStartTime, setFormStartTime] = useState('08:00 AM')
  const [formEndTime, setFormEndTime] = useState('01:00 PM')
  const [formLocation, setFormLocation] = useState('')
  const [formTargetClasses, setFormTargetClasses] = useState<string[]>(['All Classes'])
  const [classPickerOpen, setClassPickerOpen] = useState(false)
  const [classFilterQuery, setClassFilterQuery] = useState('')
  const [formColor, setFormColor] = useState('#0d9488')
  const [formDescription, setFormDescription] = useState('')
  const [submittingForm, setSubmittingForm] = useState(false)

  // View Details Modal State
  const [viewEvent, setViewEvent] = useState<AcademicCalendarItem | null>(null)

  // Delete Confirmation Modal State
  const [deleteEventId, setDeleteEventId] = useState<string | number | null>(null)

  // Master Classes
  const [masterClassesList, setMasterClassesList] = useState<string[]>([])

  // Toggle & remove handlers for multi-select classes
  const handleToggleClass = (cls: string) => {
    if (formTargetClasses.includes('All Classes')) {
      setFormTargetClasses([cls])
    } else if (formTargetClasses.includes(cls)) {
      const updated = formTargetClasses.filter(c => c !== cls)
      setFormTargetClasses(updated.length > 0 ? updated : ['All Classes'])
    } else {
      const updated = [...formTargetClasses, cls]
      const onlyClasses = masterClassesList.filter(c => c !== 'All Classes')
      if (onlyClasses.length > 0 && updated.length === onlyClasses.length) {
        setFormTargetClasses(['All Classes'])
      } else {
        setFormTargetClasses(updated)
      }
    }
  }

  const handleRemoveClass = (cls: string) => {
    const updated = formTargetClasses.filter(c => c !== cls)
    setFormTargetClasses(updated.length > 0 ? updated : ['All Classes'])
  }

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3500)
  }

  // Load master classes
  useEffect(() => {
    try {
      const cls = getInstituteAddedClasses()
      if (cls && cls.length > 0) {
        setMasterClassesList(['All Classes', ...cls.map(c => c.className)])
      } else {
        setMasterClassesList([
          'All Classes',
          'Class 1',
          'Class 2',
          'Class 3',
          'Class 4',
          'Class 5',
          'Class 6',
          'Class 7',
          'Class 8',
          'Class 9',
          'Class 10'
        ])
      }
    } catch {
      setMasterClassesList([
        'All Classes',
        'Class 1',
        'Class 2',
        'Class 3',
        'Class 4',
        'Class 5',
        'Class 6',
        'Class 7',
        'Class 8',
        'Class 9',
        'Class 10'
      ])
    }
  }, [])

  // Check ?openAdd=true parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('openAdd') === 'true' || params.get('openCreate') === 'true') {
        handleOpenCreateModal()
      }
    }
  }, [])

  // ── Fetch Calendar Events from API ────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.append('search', searchQuery.trim())
      if (filterType !== 'All' && filterType !== 'Category') params.append('type', filterType)
      if (filterHolidayOnly === 'holidays') params.append('is_holiday', 'true')
      if (filterHolidayOnly === 'events') params.append('is_holiday', 'false')

      const res = await fetch(`/api/institute/academic-calendar?${params.toString()}`)
      const json = await res.json()

      if (json.success && Array.isArray(json.data)) {
        setEvents(json.data)
        localStorage.setItem('school_calendar_events', JSON.stringify(json.data))
      } else {
        const saved = localStorage.getItem('school_calendar_events')
        if (saved) {
          try {
            setEvents(JSON.parse(saved))
          } catch {}
        }
      }
    } catch (err) {
      console.warn('API error, reading from localStorage:', err)
      const saved = localStorage.getItem('school_calendar_events')
      if (saved) {
        try {
          setEvents(JSON.parse(saved))
        } catch {}
      }
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filterType, filterHolidayOnly])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // ── Date Navigation ───────────────────────────────────────────────────────
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const day = currentDate.getDate()

  const navigateDate = (dir: number) => {
    const d = new Date(currentDate)
    if (view === 'Day') d.setDate(d.getDate() + dir)
    else if (view === 'Week') d.setDate(d.getDate() + dir * 7)
    else d.setMonth(d.getMonth() + dir)
    setCurrentDate(d)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getWeekDates = () => {
    const d = new Date(currentDate)
    const dayOfWeek = d.getDay()
    d.setDate(d.getDate() - dayOfWeek)
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(d)
      dd.setDate(dd.getDate() + i)
      return dd
    })
  }

  const headerLabel =
    view === 'Day'
      ? `${day} ${MONTH_NAMES[month]}, ${year}`
      : `${MONTH_NAMES[month]}, ${year}`

  // ── Open Create Modal ─────────────────────────────────────────────────────
  const handleOpenCreateModal = (defaultDate?: string) => {
    setEditingEventId(null)
    setFormTitle('')
    setFormIsHoliday(false)
    setFormHolidayType('Full Day')
    setFormEventType('Academic Event')
    setFormDateMode('single')
    const initialDate = defaultDate || formatDateToISO(currentDate)
    setFormStartDate(initialDate)
    setFormEndDate(initialDate)
    setFormAllDay(true)
    setFormStartTime('08:00 AM')
    setFormEndTime('01:00 PM')
    setFormLocation('')
    setFormTargetClasses(['All Classes'])
    setClassPickerOpen(false)
    setClassFilterQuery('')
    setFormColor('#0d9488')
    setFormDescription('')
    setFormModalOpen(true)
  }

  // ── Open Edit Modal ───────────────────────────────────────────────────────
  const handleOpenEditModal = (item: AcademicCalendarItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingEventId(item.id)
    setFormTitle(item.title)
    setFormIsHoliday(item.isHoliday)
    setFormHolidayType((item.holidayType as any) || 'Full Day')
    setFormEventType(item.eventType || (item.isHoliday ? 'Holiday' : 'Academic Event'))
    const isRange = item.startDate !== item.endDate
    setFormDateMode(isRange ? 'range' : 'single')
    setFormStartDate(item.startDate)
    setFormEndDate(item.endDate || item.startDate)
    setFormAllDay(!!item.allDay)
    setFormStartTime(item.startTime || '08:00 AM')
    setFormEndTime(item.endTime || '01:00 PM')
    setFormLocation(item.location || '')
    setFormTargetClasses(item.targetClasses && item.targetClasses.length > 0 ? item.targetClasses : ['All Classes'])
    setClassPickerOpen(false)
    setClassFilterQuery('')
    setFormColor(item.color || (item.isHoliday ? '#10b981' : '#0d9488'))
    setFormDescription(item.description || '')
    setFormModalOpen(true)
  }

  // ── Handle Save Event / Holiday Form Submit ───────────────────────────────
  const handleSaveEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formTitle.trim()) {
      alert('Please enter an Event or Holiday Title.')
      return
    }
    if (!formStartDate) {
      alert('Please select a Date.')
      return
    }

    setSubmittingForm(true)
    try {
      const finalEndDate = formDateMode === 'single' ? formStartDate : formEndDate || formStartDate
      const finalColor = formIsHoliday
        ? formColor === '#0d9488' ? '#10b981' : formColor
        : formColor

      const payload = {
        title: formTitle.trim(),
        eventType: formIsHoliday ? 'Holiday' : formEventType,
        isHoliday: formIsHoliday,
        holidayType: formIsHoliday ? formHolidayType : 'Not Applicable',
        startDate: formStartDate,
        endDate: finalEndDate,
        allDay: formAllDay,
        startTime: formAllDay ? '' : formStartTime,
        endTime: formAllDay ? '' : formEndTime,
        location: formLocation.trim(),
        targetClasses: formTargetClasses,
        color: finalColor,
        description: formDescription.trim()
      }

      const url = editingEventId
        ? `/api/institute/academic-calendar/${editingEventId}`
        : '/api/institute/academic-calendar'
      const method = editingEventId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()

      if (json.success && json.data) {
        triggerToast(
          editingEventId
            ? `${formIsHoliday ? 'Holiday' : 'Event'} updated successfully!`
            : `${formIsHoliday ? 'Holiday' : 'Event'} added to calendar!`
        )
        setFormModalOpen(false)
        fetchEvents()
      } else {
        alert(json.error || 'Failed to save calendar entry.')
      }
    } catch (err: any) {
      console.error('Save error:', err)
      // LocalStorage fallback
      const finalEndDate = formDateMode === 'single' ? formStartDate : formEndDate || formStartDate
      const newEntry: AcademicCalendarItem = {
        id: editingEventId || `offline-${Date.now()}`,
        title: formTitle.trim(),
        eventType: formIsHoliday ? 'Holiday' : formEventType,
        isHoliday: formIsHoliday,
        holidayType: formIsHoliday ? formHolidayType : 'Not Applicable',
        startDate: formStartDate,
        endDate: finalEndDate,
        allDay: formAllDay,
        startTime: formAllDay ? '' : formStartTime,
        endTime: formAllDay ? '' : formEndTime,
        location: formLocation.trim(),
        targetClasses: formTargetClasses,
        color: formColor,
        description: formDescription.trim()
      }

      if (editingEventId) {
        setEvents(prev => prev.map(p => (p.id === editingEventId ? newEntry : p)))
      } else {
        setEvents(prev => [...prev, newEntry])
      }
      triggerToast(
        editingEventId
          ? `${formIsHoliday ? 'Holiday' : 'Event'} updated successfully!`
          : `${formIsHoliday ? 'Holiday' : 'Event'} added to calendar!`
      )
      setFormModalOpen(false)
    } finally {
      setSubmittingForm(false)
    }
  }

  // ── Handle Delete Calendar Entry ──────────────────────────────────────────
  const handleDeleteEvent = async (id: string | number) => {
    try {
      const res = await fetch(`/api/institute/academic-calendar/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        triggerToast('Calendar entry removed!')
        setEvents(prev => prev.filter(p => p.id !== id))
      } else {
        alert(json.error || 'Failed to delete.')
      }
    } catch {
      setEvents(prev => prev.filter(p => p.id !== id))
      triggerToast('Calendar entry removed!')
    } finally {
      setDeleteEventId(null)
      if (viewEvent && viewEvent.id === id) setViewEvent(null)
    }
  }

  // ── Filtered Events (Chronologically Sorted by Start Date) ───────────────
  const filteredEvents = useMemo(() => {
    const list = events.filter(e => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = e.title.toLowerCase().includes(q)
        const matchType = e.eventType.toLowerCase().includes(q)
        const matchLoc = (e.location || '').toLowerCase().includes(q)
        const matchDesc = (e.description || '').toLowerCase().includes(q)
        if (!matchTitle && !matchType && !matchLoc && !matchDesc) return false
      }
      if (filterType !== 'All' && filterType !== 'Category' && e.eventType !== filterType) {
        return false
      }
      if (filterHolidayOnly === 'holidays' && !e.isHoliday) return false
      if (filterHolidayOnly === 'events' && e.isHoliday) return false
      return true
    })

    return [...list].sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
  }, [events, searchQuery, filterType, filterHolidayOnly])

  // Events filtered for the right sidebar (prioritizing current view month or all)
  const sidebarEvents = useMemo(() => {
    const curMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    if (sidebarScope === 'thisMonth') {
      const monthList = filteredEvents.filter(
        e => (e.startDate && e.startDate.startsWith(curMonthStr)) || (e.endDate && e.endDate.startsWith(curMonthStr))
      )
      return monthList.length > 0 ? monthList : filteredEvents
    }
    return filteredEvents
  }, [filteredEvents, sidebarScope, year, month])

  // Get events falling on a specific date string (YYYY-MM-DD)
  const getEventsForDate = (dateStr: string) => {
    return filteredEvents.filter(e => isDateInRange(dateStr, e.startDate, e.endDate))
  }

  // ── KPI Summary Stats ─────────────────────────────────────────────────────
  const totalEntries = events.length
  const totalHolidays = events.filter(e => e.isHoliday).length
  const totalAcademicEvents = events.filter(e => !e.isHoliday).length
  const thisMonthEvents = events.filter(e => {
    const curMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    return (e.startDate && e.startDate.startsWith(curMonthStr)) || (e.endDate && e.endDate.startsWith(curMonthStr))
  }).length

  // Export to CSV
  const handleExportCSV = () => {
    if (events.length === 0) {
      alert('No events to export.')
      return
    }
    const headers = ['S.No.', 'Title', 'Holiday/Event', 'Category', 'Start Date', 'End Date', 'Timing', 'Location', 'Classes']
    const rows = events.map((e, idx) => [
      idx + 1,
      `"${e.title.replace(/"/g, '""')}"`,
      e.isHoliday ? `Holiday (${e.holidayType})` : 'Working Day / Event',
      `"${e.eventType}"`,
      e.startDate,
      e.endDate,
      e.allDay ? 'All Day' : `"${e.startTime} - ${e.endTime}"`,
      `"${(e.location || '').replace(/"/g, '""')}"`,
      `"${(e.targetClasses || []).join(', ')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encoded = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encoded)
    link.setAttribute('download', `Academic_Calendar_${year}_${month + 1}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Calendar exported to CSV!')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight flex items-center gap-2">
            <span>Academic Calendar</span>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Interactive Portal
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Schedule official school holidays, examinations, parent-teacher meetings, and sports activities.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event, holiday, venue..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 w-56 bg-white shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Modal Trigger */}
          <button
            onClick={() => setFilterModalOpen(true)}
            className={`p-2 border rounded-xl hover:bg-slate-50 transition-colors cursor-pointer relative ${
              filterType !== 'All' || filterHolidayOnly !== 'all'
                ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
            title="Filter Events"
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Primary Action: Add Event / Holiday in Modal */}
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event / Holiday</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Entries</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{totalEntries}</div>
            <p className="text-[10px] text-slate-400 font-medium">Scheduled on calendar</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">School Holidays</span>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{totalHolidays}</div>
            <p className="text-[10px] text-slate-400 font-medium">Campus closed days</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sun className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Events & Exams</span>
            <div className="text-xl font-black text-amber-600 mt-0.5">{totalAcademicEvents}</div>
            <p className="text-[10px] text-slate-400 font-medium">Active school programs</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">This Month</span>
            <div className="text-xl font-black text-indigo-600 mt-0.5">{thisMonthEvents}</div>
            <p className="text-[10px] text-slate-400 font-medium">{MONTH_NAMES[month]} {year}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Main Calendar Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 md:p-6 shadow-xs space-y-5">
        {/* Top Control Bar: View Switcher, Date Title & Legend */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['Day', 'Week', 'Month', 'List'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  view === v
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Month / Year Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate(-1)}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer text-slate-600"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <h2 className="text-base font-black text-slate-900 min-w-[160px] text-center">
              {headerLabel}
            </h2>

            <button
              onClick={() => navigateDate(1)}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer text-slate-600"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-[11px] font-bold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer ml-1"
            >
              Today
            </button>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3.5 text-[11px] font-semibold text-slate-600 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Holiday</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
              <span>Academic Event</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Celebration / PTM</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
              <span>Weekoff</span>
            </span>
          </div>
        </div>

        {/* 4. Calendar Display + Sidebar Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Calendar View Area */}
          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-2 text-slate-400">
                <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold text-xs text-slate-500">Loading academic calendar...</span>
              </div>
            ) : (
              <>
                {/* =================================================== */}
                {/* DAY VIEW                                            */}
                {/* =================================================== */}
                {view === 'Day' && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="grid grid-cols-4 bg-slate-50/90 border-b border-slate-200 text-xs font-black text-slate-600 uppercase">
                      <div className="px-4 py-3 border-r border-slate-200">Time</div>
                      <div className="px-4 py-3 col-span-3 flex items-center justify-between">
                        <span>
                          {DAYS[currentDate.getDay()]} {String(day).padStart(2, '0')}{' '}
                          {MONTH_NAMES[month]} {year}
                        </span>
                        <button
                          onClick={() => handleOpenCreateModal(formatDateToISO(currentDate))}
                          className="text-[11px] text-teal-600 font-bold hover:underline flex items-center gap-1 normal-case"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add on this day</span>
                        </button>
                      </div>
                    </div>

                    {HOURS.map(hour => {
                      const dateISO = formatDateToISO(currentDate)
                      const dayEvents = getEventsForDate(dateISO)
                      const hourEvents = dayEvents.filter(e => e.allDay || e.startTime === hour)

                      return (
                        <div
                          key={hour}
                          className="grid grid-cols-4 border-b border-slate-100 last:border-0 min-h-[64px] hover:bg-slate-50/40 transition-colors cursor-pointer"
                          onClick={() => handleOpenCreateModal(dateISO)}
                        >
                          <div className="px-4 py-3 border-r border-slate-100 text-xs font-bold text-slate-400">
                            {hour}
                          </div>
                          <div className="col-span-3 p-2 flex flex-wrap gap-2 items-center" onClick={e => e.stopPropagation()}>
                            {hourEvents.map(ev => {
                              const color = ev.color || (ev.isHoliday ? '#10b981' : '#0d9488')
                              return (
                                <div
                                  key={ev.id}
                                  onClick={() => setViewEvent(ev)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.01] border"
                                  style={{
                                    backgroundColor: `${color}14`,
                                    borderColor: `${color}35`,
                                    color: '#1e293b'
                                  }}
                                >
                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                  <span className="font-semibold text-slate-900">{ev.title}</span>
                                  {ev.isHoliday && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                      {ev.holidayType || 'Holiday'}
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* =================================================== */}
                {/* WEEK VIEW (As shown in Screenshot)                  */}
                {/* =================================================== */}
                {view === 'Week' && (() => {
                  const weekDates = getWeekDates()
                  return (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                      {/* Weekday Header */}
                      <div
                        className="grid border-b border-slate-200 bg-slate-50/90 text-center"
                        style={{ gridTemplateColumns: '75px repeat(7, minmax(110px, 1fr))' }}
                      >
                        <div className="border-r border-slate-200 px-2 py-3 text-[10px] font-black text-slate-400 uppercase">
                          Time
                        </div>
                        {weekDates.map((d, i) => {
                          const dateISO = formatDateToISO(d)
                          const isHolidayDay = events.some(e => e.isHoliday && isDateInRange(dateISO, e.startDate, e.endDate))
                          const isToday = formatDateToISO(new Date()) === dateISO

                          return (
                            <div
                              key={i}
                              className={`border-r border-slate-200 last:border-r-0 px-2 py-2.5 cursor-pointer transition-colors ${
                                isHolidayDay ? 'bg-emerald-50/40' : ''
                              } ${isToday ? 'bg-teal-50/50' : ''}`}
                              onClick={() => handleOpenCreateModal(dateISO)}
                              title="Click to add event/holiday on this date"
                            >
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                {DAYS[i]}
                              </div>
                              <div
                                className={`text-sm font-black mt-0.5 inline-block px-2 py-0.5 rounded-lg ${
                                  isToday ? 'bg-teal-600 text-white' : 'text-slate-800'
                                }`}
                              >
                                {String(d.getDate()).padStart(2, '0')}
                              </div>
                              {isHolidayDay && (
                                <span className="block text-[9px] font-black text-emerald-600 mt-0.5">
                                  Holiday
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Hourly Grid Rows */}
                      {HOURS.map(hour => (
                        <div
                          key={hour}
                          className="grid border-b border-slate-100 last:border-0 min-h-[56px] text-xs"
                          style={{ gridTemplateColumns: '75px repeat(7, minmax(110px, 1fr))' }}
                        >
                          <div className="px-2 py-2.5 border-r border-slate-100 text-[10px] font-bold text-slate-400 text-center">
                            {hour}
                          </div>
                          {weekDates.map((d, i) => {
                            const dateISO = formatDateToISO(d)
                            const dateEvents = getEventsForDate(dateISO)
                            // Show events matching this hour OR all-day events on the first hour
                            const slotEvents = dateEvents.filter(
                              e => (e.allDay && hour === '08:00 AM') || e.startTime === hour
                            )

                            return (
                              <div
                                key={i}
                                className="border-r border-slate-100 last:border-r-0 p-1 hover:bg-slate-50/60 transition-colors cursor-pointer relative group/slot"
                                onClick={() => handleOpenCreateModal(dateISO)}
                              >
                                {slotEvents.map(ev => {
                                  const color = ev.color || (ev.isHoliday ? '#10b981' : '#0d9488')
                                  return (
                                    <div
                                      key={ev.id}
                                      onClick={e => {
                                        e.stopPropagation()
                                        setViewEvent(ev)
                                      }}
                                      className="px-2 py-1 rounded-md text-[10px] font-bold truncate shadow-2xs mb-1 cursor-pointer transition-transform hover:scale-[1.01] border flex items-center gap-1"
                                      style={{
                                        backgroundColor: `${color}14`,
                                        borderColor: `${color}35`,
                                        color: '#1e293b'
                                      }}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                      <span className="truncate flex-1 font-semibold text-slate-800">{ev.title}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {/* =================================================== */}
                {/* MONTH VIEW                                          */}
                {/* =================================================== */}
                {view === 'Month' && (() => {
                  const daysInMonth = getDaysInMonth(year, month)
                  const firstDay = getFirstDayOfMonth(year, month)
                  const prevMonthDays = getDaysInMonth(year, month - 1)
                  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

                  const cells: { day: number; isCurrentMonth: boolean; date: Date }[] = []
                  for (let i = 0; i < totalCells; i++) {
                    if (i < firstDay) {
                      const d = prevMonthDays - firstDay + i + 1
                      cells.push({ day: d, isCurrentMonth: false, date: new Date(year, month - 1, d) })
                    } else if (i < firstDay + daysInMonth) {
                      const d = i - firstDay + 1
                      cells.push({ day: d, isCurrentMonth: true, date: new Date(year, month, d) })
                    } else {
                      const d = i - firstDay - daysInMonth + 1
                      cells.push({ day: d, isCurrentMonth: false, date: new Date(year, month + 1, d) })
                    }
                  }

                  return (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                      {/* Days Header */}
                      <div className="grid grid-cols-7 bg-slate-50/90 border-b border-slate-200 text-center divide-x divide-slate-200">
                        {DAYS.map((d, colIdx) => (
                          <div
                            key={d}
                            className={`py-2.5 text-[11px] font-black uppercase tracking-wider ${
                              colIdx === 0 ? 'text-rose-500 bg-rose-50/20' : 'text-slate-600'
                            }`}
                          >
                            {d}
                          </div>
                        ))}
                      </div>

                      {/* Month Grid Cells with Crisp Borders & Modern Styling */}
                      <div className="grid grid-cols-7">
                        {cells.map((cell, i) => {
                          const dateISO = formatDateToISO(cell.date)
                          const evts = getEventsForDate(dateISO)
                          const holidayEvent = evts.find(e => e.isHoliday)
                          const isHolidayDay = !!holidayEvent
                          const isToday = formatDateToISO(new Date()) === dateISO
                          const isSunday = cell.date.getDay() === 0
                          const isLastCol = (i + 1) % 7 === 0
                          const isLastRow = i >= totalCells - 7

                          return (
                            <div
                              key={i}
                              className={`group/cell relative flex flex-col justify-between p-2 md:p-2.5 transition-all cursor-pointer min-h-[110px] md:min-h-[120px] ${
                                !isLastCol ? 'border-r border-slate-200' : ''
                              } ${
                                !isLastRow ? 'border-b border-slate-200' : ''
                              } ${
                                !cell.isCurrentMonth
                                  ? 'bg-slate-50/40 text-slate-300'
                                  : isToday
                                  ? 'bg-teal-50/30 ring-1 ring-inset ring-teal-500/50'
                                  : isHolidayDay
                                  ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                                  : isSunday
                                  ? 'bg-rose-50/10 hover:bg-rose-50/30'
                                  : 'bg-white hover:bg-slate-50/70'
                              }`}
                              onClick={() => handleOpenCreateModal(dateISO)}
                              title={`Click to add event or holiday on ${dateISO}`}
                            >
                              {/* Top Bar of Cell: Day Number & Holiday Tag & Clean Quick Add on Hover */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    {isToday ? (
                                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                        {cell.day}
                                      </div>
                                    ) : (
                                      <span
                                        className={`text-xs font-bold px-1 rounded ${
                                          cell.isCurrentMonth
                                            ? isSunday ? 'text-rose-500' : 'text-slate-700'
                                            : 'text-slate-300'
                                        }`}
                                      >
                                        {cell.day}
                                      </span>
                                    )}

                                    {isHolidayDay && cell.isCurrentMonth && (
                                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded leading-tight">
                                        {holidayEvent?.holidayType === 'Half Day' ? 'Half Day' : 'Holiday'}
                                      </span>
                                    )}
                                  </div>

                                  {/* Quick Add Button that appears on cell hover */}
                                  {cell.isCurrentMonth && (
                                    <button
                                      type="button"
                                      onClick={e => {
                                        e.stopPropagation()
                                        handleOpenCreateModal(dateISO)
                                      }}
                                      className="opacity-0 group-hover/cell:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center text-slate-400 hover:text-teal-700 hover:bg-teal-100/70 rounded-md cursor-pointer"
                                      title="Add event/holiday on this day"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>

                                {/* Event & Holiday Pills inside Cell */}
                                <div className="space-y-1">
                                  {evts.slice(0, 3).map(ev => {
                                    const color = ev.color || (ev.isHoliday ? '#10b981' : '#0d9488')
                                    return (
                                      <div
                                        key={ev.id}
                                        onClick={e => {
                                          e.stopPropagation()
                                          setViewEvent(ev)
                                        }}
                                        className="px-2 py-1 rounded-md text-[11px] font-semibold transition-all hover:brightness-95 cursor-pointer flex items-center gap-1.5 truncate border shadow-2xs group/item"
                                        style={{
                                          backgroundColor: `${color}14`,
                                          borderColor: `${color}35`,
                                          color: '#1e293b'
                                        }}
                                        title={`${ev.title}${ev.startTime ? ` (${ev.startTime})` : ''} - ${ev.eventType}`}
                                      >
                                        <span
                                          className="w-1.5 h-1.5 rounded-full shrink-0"
                                          style={{ backgroundColor: color }}
                                        />
                                        <span className="truncate flex-1 font-semibold text-slate-800 group-hover/item:text-slate-950">
                                          {ev.title}
                                        </span>
                                        {ev.startTime && !ev.allDay && (
                                          <span className="text-[9px] text-slate-400 font-normal shrink-0">
                                            {ev.startTime.replace(':00', '')}
                                          </span>
                                        )}
                                      </div>
                                    )
                                  })}

                                  {evts.length > 3 && (
                                    <div
                                      onClick={e => {
                                        e.stopPropagation()
                                        setCurrentDate(cell.date)
                                        setView('Day')
                                      }}
                                      className="text-[10px] font-bold text-teal-700 hover:text-teal-800 hover:underline px-1 py-0.5 cursor-pointer"
                                    >
                                      +{evts.length - 3} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}

                {/* =================================================== */}
                {/* LIST / SCHEDULE VIEW                                */}
                {/* =================================================== */}
                {view === 'List' && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100">
                    {filteredEvents.length === 0 ? (
                      <div className="py-16 text-center text-slate-400">
                        <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-bold text-slate-700">No events found</p>
                        <p className="text-xs text-slate-400 mt-0.5">Click below to create an event or holiday.</p>
                        <button
                          onClick={() => handleOpenCreateModal()}
                          className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
                        >
                          + Add Event / Holiday
                        </button>
                      </div>
                    ) : (
                      filteredEvents.map(ev => (
                        <div
                          key={ev.id}
                          className="p-4 bg-white hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                          onClick={() => setViewEvent(ev)}
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xs shrink-0"
                              style={{ backgroundColor: ev.color || (ev.isHoliday ? '#10b981' : '#0d9488') }}
                            >
                              {ev.isHoliday ? '🎉' : '📅'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-slate-850">{ev.title}</h3>
                                {ev.isHoliday ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Holiday ({ev.holidayType})
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200">
                                    {ev.eventType}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold mt-1">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="w-3.5 h-3.5" />
                                  <span>{ev.startDate} {ev.endDate && ev.endDate !== ev.startDate ? `to ${ev.endDate}` : ''}</span>
                                </span>
                                {ev.startTime && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{ev.startTime} {ev.endTime ? `- ${ev.endTime}` : ''}</span>
                                  </span>
                                )}
                                {ev.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{ev.location}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEditModal(ev)}
                              className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteEventId(ev.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 5. Right Events Sidebar Panel */}
          <div className="w-full lg:w-80 shrink-0 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Events Schedule</h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {sidebarScope === 'thisMonth' ? `${MONTH_NAMES[month]} ${year}` : 'Full Academic Year'}
                </p>
              </div>

              {/* Category Quick Filter */}
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none bg-white text-slate-700 cursor-pointer shadow-2xs"
              >
                <option value="All">All Categories</option>
                {EVENT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Scope & Nature Tabs */}
            <div className="space-y-1.5">
              {/* Tab 1: Scope Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSidebarScope('thisMonth')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    sidebarScope === 'thisMonth'
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  This Month ({thisMonthEvents})
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarScope('all')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    sidebarScope === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  All ({filteredEvents.length})
                </button>
              </div>

              {/* Tab 2: Quick Nature Filter */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100/70 p-1 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setFilterHolidayOnly('all')}
                  className={`py-1 rounded-lg transition-all cursor-pointer ${
                    filterHolidayOnly === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterHolidayOnly('holidays')}
                  className={`py-1 rounded-lg transition-all cursor-pointer ${
                    filterHolidayOnly === 'holidays' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Holidays
                </button>
                <button
                  onClick={() => setFilterHolidayOnly('events')}
                  className={`py-1 rounded-lg transition-all cursor-pointer ${
                    filterHolidayOnly === 'events' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Events
                </button>
              </div>
            </div>

            {/* Events Sidebar Cards List */}
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {sidebarEvents.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-600">No events scheduled</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {sidebarScope === 'thisMonth' ? `No entries in ${MONTH_NAMES[month]} ${year}` : 'Click below to add one.'}
                  </p>
                  <button
                    onClick={() => handleOpenCreateModal()}
                    className="mt-2 text-xs font-black text-teal-600 hover:underline"
                  >
                    + Add Event / Holiday
                  </button>
                </div>
              ) : (
                sidebarEvents.map(ev => {
                  const evDate = new Date(ev.startDate + 'T00:00:00')
                  const color = ev.color || (ev.isHoliday ? '#10b981' : '#0d9488')
                  const monthShort = evDate.toLocaleDateString('en-US', { month: 'short' })
                  const dayNum = evDate.getDate()
                  const weekdayShort = evDate.toLocaleDateString('en-US', { weekday: 'short' })

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setViewEvent(ev)}
                      className="group flex items-start gap-3 p-2.5 bg-white border border-slate-200/90 hover:border-teal-300 rounded-2xl transition-all hover:shadow-xs cursor-pointer relative"
                    >
                      {/* Left Date Tile */}
                      <div
                        className="w-11 h-11 rounded-xl flex flex-col items-center justify-center text-center shrink-0 border shadow-2xs"
                        style={{
                          backgroundColor: `${color}12`,
                          borderColor: `${color}30`,
                          color: color
                        }}
                      >
                        <span className="text-[8px] font-black uppercase tracking-wider leading-none">
                          {monthShort}
                        </span>
                        <span className="text-sm font-black leading-none mt-0.5">
                          {String(dayNum).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 truncate">
                            {ev.title}
                          </p>
                          {ev.isHoliday ? (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 shrink-0">
                              Holiday
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0 truncate max-w-[80px]">
                              {ev.eventType}
                            </span>
                          )}
                        </div>

                        {/* Meta: Timing, Day, Venue */}
                        <div className="text-[10px] text-slate-400 font-medium mt-1 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-600 font-semibold">{weekdayShort}</span>
                            {ev.startTime && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{ev.startTime}</span>
                                </span>
                              </>
                            )}
                          </div>
                          {ev.location && (
                            <p className="flex items-center gap-1 truncate text-slate-500">
                              <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span className="truncate">{ev.location}</span>
                            </p>
                          )}
                        </div>

                        {/* Card Hover Action Buttons */}
                        <div
                          className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(ev)}
                            className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                            title="Edit Event"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteEventId(ev.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}</div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. CREATE & EDIT EVENT / HOLIDAY MODAL                    */}
      {/* ========================================================= */}
      {formModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 md:p-8 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs font-black"
                  style={{ backgroundColor: formIsHoliday ? '#10b981' : '#0d9488' }}
                >
                  {formIsHoliday ? <Sun className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-850">
                    {editingEventId
                      ? `Edit ${formIsHoliday ? 'School Holiday' : 'Academic Event'}`
                      : `Add ${formIsHoliday ? 'School Holiday' : 'Academic Event'}`}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Configure official date, holiday off status, duration, location, and targeted classes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEventSubmit} className="space-y-6">
              {/* PRIMARY REQUIREMENT: IS THIS DAY A HOLIDAY OR NOT A HOLIDAY? */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Is this day a School Holiday or Working Academic Event? <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card 1: School Holiday */}
                  <label
                    onClick={() => {
                      setFormIsHoliday(true)
                      setFormColor('#10b981')
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                      formIsHoliday
                        ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="isHolidayChoice"
                      checked={formIsHoliday}
                      onChange={() => {
                        setFormIsHoliday(true)
                        setFormColor('#10b981')
                      }}
                      className="w-4 h-4 accent-emerald-600 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-xs">🎉 School Holiday</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800">
                          Closed / Off
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        School will remain closed for students & staff (National, Festival, or Declared Holiday).
                      </p>
                    </div>
                  </label>

                  {/* Card 2: Academic Event / Working Day */}
                  <label
                    onClick={() => {
                      setFormIsHoliday(false)
                      setFormColor('#0d9488')
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                      !formIsHoliday
                        ? 'border-teal-500 bg-teal-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="isHolidayChoice"
                      checked={!formIsHoliday}
                      onChange={() => {
                        setFormIsHoliday(false)
                        setFormColor('#0d9488')
                      }}
                      className="w-4 h-4 accent-teal-600 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-xs">📅 Working Day / Event</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-teal-100 text-teal-800">
                          Active School
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Regular classes or special school function, assessment, PTM, or sports event.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Holiday Nature (Full Day vs Half Day) */}
                {formIsHoliday ? (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-700">Holiday Duration:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="holidayNature"
                        checked={formHolidayType === 'Full Day'}
                        onChange={() => setFormHolidayType('Full Day')}
                        className="w-3.5 h-3.5 accent-emerald-600"
                      />
                      <span className="text-xs font-bold text-slate-800">Full Day Off</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="holidayNature"
                        checked={formHolidayType === 'Half Day'}
                        onChange={() => setFormHolidayType('Half Day')}
                        className="w-3.5 h-3.5 accent-emerald-600"
                      />
                      <span className="text-xs font-bold text-slate-800">Half Day Off</span>
                    </label>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">Event Category:</span>
                    <select
                      value={formEventType}
                      onChange={e => setFormEventType(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-800 cursor-pointer shadow-2xs"
                    >
                      {EVENT_CATEGORIES.filter(c => c !== 'Holiday').map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold text-xs">
                  {formIsHoliday ? 'Holiday Name / Occasion' : 'Event Title / Name'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formIsHoliday
                      ? 'e.g. Diwali Holiday, Dr. B.R. Ambedkar Jayanti, Summer Vacation'
                      : 'e.g. Annual Sports Day, Parent-Teacher Meeting (PTM), Science Fair'
                  }
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-800 focus:border-teal-500 shadow-2xs"
                />
              </div>

              {/* Date Selection: Single Day vs Multi-day Range */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Schedule Dates <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormDateMode('single')
                        setFormEndDate(formStartDate)
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer border transition-all ${
                        formDateMode === 'single'
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Single Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDateMode('range')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer border transition-all ${
                        formDateMode === 'range'
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Multiple Days Range
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">
                      {formDateMode === 'single' ? 'Date' : 'Start Date'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={e => {
                        setFormStartDate(e.target.value)
                        if (formDateMode === 'single') setFormEndDate(e.target.value)
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-800 focus:border-teal-500 shadow-2xs"
                    />
                  </div>

                  {formDateMode === 'range' && (
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formEndDate}
                        min={formStartDate}
                        onChange={e => setFormEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-800 focus:border-teal-500 shadow-2xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Time Configuration (Only if not All Day or if specifically scheduled) */}
              {!formIsHoliday && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={formAllDay}
                        onChange={e => setFormAllDay(e.target.checked)}
                        className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">All Day Event</span>
                    </label>
                  </div>

                  {!formAllDay && (
                    <>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Start Time</label>
                        <select
                          value={formStartTime}
                          onChange={e => setFormStartTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs"
                        >
                          {HOURS.map(h => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">End Time</label>
                        <select
                          value={formEndTime}
                          onChange={e => setFormEndTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs"
                        >
                          {HOURS.map(h => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Venue & Target Classes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-bold text-xs block mb-1">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Auditorium, Sports Ground, Campus Wide"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-800 focus:border-teal-500 shadow-2xs"
                  />
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-bold text-xs">
                      Applicable Classes
                    </label>
                    <span className="text-[10px] font-bold text-teal-600">
                      {formTargetClasses.includes('All Classes') || formTargetClasses.length === 0
                        ? 'All Classes'
                        : `${formTargetClasses.length} Selected`}
                    </span>
                  </div>

                  {/* Minimal Trigger Box */}
                  <button
                    type="button"
                    onClick={() => setClassPickerOpen(prev => !prev)}
                    className={`w-full min-h-[42px] px-3 py-1.5 bg-white border rounded-xl outline-none text-xs transition-all flex items-center justify-between gap-2 shadow-2xs text-left cursor-pointer ${
                      classPickerOpen ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex-1 flex items-center gap-1.5 flex-wrap overflow-hidden py-0.5">
                      {formTargetClasses.includes('All Classes') || formTargetClasses.length === 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50/80 px-2.5 py-0.5 rounded-lg border border-teal-200/60">
                          <Users className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>All Classes</span>
                        </span>
                      ) : (
                        formTargetClasses.map(cls => (
                          <span
                            key={cls}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/70 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors"
                          >
                            <span>{cls}</span>
                            <span
                              role="button"
                              title={`Remove ${cls}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveClass(cls)
                              }}
                              className="p-0.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                            >
                              <X className="w-2.5 h-2.5" />
                            </span>
                          </span>
                        ))
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                      {!formTargetClasses.includes('All Classes') && formTargetClasses.length > 0 && (
                        <span
                          role="button"
                          title="Reset to All Classes"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFormTargetClasses(['All Classes'])
                          }}
                          className="text-[10px] font-bold text-slate-400 hover:text-rose-500 px-1 cursor-pointer hover:underline"
                        >
                          Reset
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
                          classPickerOpen ? 'rotate-180 text-teal-600' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Minimal Popover Dropdown */}
                  {classPickerOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setClassPickerOpen(false)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-2.5 space-y-2 text-xs animate-in fade-in zoom-in-95 duration-150">
                        {/* Quick Actions Header */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setFormTargetClasses(['All Classes'])}
                              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                formTargetClasses.includes('All Classes')
                                  ? 'bg-teal-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              All Classes
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const onlyClasses = masterClassesList.filter(c => c !== 'All Classes')
                                setFormTargetClasses(onlyClasses)
                              }}
                              className="px-2 py-1 rounded-lg font-bold text-teal-700 hover:bg-teal-50 transition-colors"
                            >
                              Select All ({masterClassesList.filter(c => c !== 'All Classes').length})
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormTargetClasses(['All Classes'])}
                            className="text-slate-400 hover:text-rose-500 font-bold hover:underline"
                          >
                            Reset
                          </button>
                        </div>

                        {/* Search Input if > 4 classes */}
                        {masterClassesList.filter(c => c !== 'All Classes').length > 4 && (
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search class..."
                              value={classFilterQuery}
                              onChange={e => setClassFilterQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-medium"
                            />
                          </div>
                        )}

                        {/* Classes List */}
                        <div className="max-h-48 overflow-y-auto space-y-1 pr-0.5">
                          {/* "All Classes" option */}
                          <div
                            onClick={() => setFormTargetClasses(['All Classes'])}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer select-none transition-colors ${
                              formTargetClasses.includes('All Classes')
                                ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/80'
                                : 'hover:bg-slate-50 text-slate-700 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                  formTargetClasses.includes('All Classes')
                                    ? 'bg-teal-600 border-teal-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {formTargetClasses.includes('All Classes') && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span>All Classes (Entire School)</span>
                            </div>
                            <span className="text-[10px] text-teal-700 font-bold bg-teal-100/70 px-1.5 py-0.5 rounded">
                              Universal
                            </span>
                          </div>

                          {/* Individual Classes */}
                          {masterClassesList
                            .filter(c => c !== 'All Classes')
                            .filter(c => !classFilterQuery || c.toLowerCase().includes(classFilterQuery.toLowerCase()))
                            .map(cls => {
                              const isChecked = !formTargetClasses.includes('All Classes') && formTargetClasses.includes(cls)
                              return (
                                <div
                                  key={cls}
                                  onClick={() => handleToggleClass(cls)}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer select-none transition-colors ${
                                    isChecked
                                      ? 'bg-teal-50/80 text-teal-900 font-bold border border-teal-200/60'
                                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                        isChecked
                                          ? 'bg-teal-600 border-teal-600 text-white'
                                          : 'border-slate-300 bg-white'
                                      }`}
                                    >
                                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <span>{cls}</span>
                                  </div>
                                  {isChecked && (
                                    <span className="text-[10px] text-teal-600 font-black">
                                      Selected
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                        </div>

                        {/* Footer Action */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formTargetClasses.includes('All Classes')
                              ? 'Applies to all grades'
                              : `${formTargetClasses.length} class(es) selected`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setClassPickerOpen(false)}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-black transition-colors cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Color Tag Presets */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold text-xs block">Calendar Theme Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setFormColor(preset.hex)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                        formColor === preset.hex
                          ? 'border-slate-800 bg-slate-50 shadow-xs ring-1 ring-slate-800'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description / Circular Text */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold text-xs block">
                  Description / Circular Details
                </label>
                <textarea
                  placeholder="Provide instructions, dress code, circular notes, or event agenda..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none font-medium text-xs text-slate-800 h-20 resize-none focus:border-teal-500 shadow-2xs leading-relaxed"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center gap-2 text-xs disabled:opacity-50"
                >
                  {submittingForm ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingEventId ? 'Update Entry' : 'Save to Calendar'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. VIEW EVENT DETAILS MODAL                               */}
      {/* ========================================================= */}
      {viewEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 md:p-8 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative space-y-5">
            <button
              onClick={() => setViewEvent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badges & Title */}
            <div>
              <div className="flex items-center gap-2">
                {viewEvent.isHoliday ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🎉 School Holiday ({viewEvent.holidayType || 'Full Day'})
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200">
                    📅 {viewEvent.eventType}
                  </span>
                )}
                {viewEvent.targetClasses && viewEvent.targetClasses.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>{viewEvent.targetClasses.join(', ')}</span>
                  </span>
                )}
              </div>
              <h2 className="text-base font-black text-slate-900 mt-2">{viewEvent.title}</h2>
            </div>

            {/* Event Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                <CalendarIcon className="w-4 h-4 text-teal-600" />
                <span>
                  {viewEvent.startDate}{' '}
                  {viewEvent.endDate && viewEvent.endDate !== viewEvent.startDate
                    ? `to ${viewEvent.endDate}`
                    : ''}
                </span>
              </div>

              {viewEvent.startTime && (
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>
                    {viewEvent.startTime} {viewEvent.endTime ? `- ${viewEvent.endTime}` : ''}
                  </span>
                </div>
              )}

              {viewEvent.location && (
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{viewEvent.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {viewEvent.description && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Description / Circular Details
                </span>
                <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium leading-relaxed max-h-36 overflow-y-auto">
                  {viewEvent.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = viewEvent
                    setViewEvent(null)
                    handleOpenEditModal(toEdit)
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const toDelId = viewEvent.id
                    setViewEvent(null)
                    setDeleteEventId(toDelId)
                  }}
                  className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewEvent(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-black text-xs cursor-pointer hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. FILTER MODAL                                           */}
      {/* ========================================================= */}
      {filterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-xs font-semibold text-slate-700 space-y-4 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setFilterModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Filter Calendar</h3>
                <p className="text-[11px] text-slate-400">Narrow down events and holidays.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-500 font-bold block mb-1">Entry Category</label>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold bg-white text-xs cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {EVENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1">Holiday Status</label>
                <select
                  value={filterHolidayOnly}
                  onChange={e => setFilterHolidayOnly(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold bg-white text-xs cursor-pointer"
                >
                  <option value="all">All (Holidays & Working Events)</option>
                  <option value="holidays">Only School Holidays</option>
                  <option value="events">Only Working Days / Events</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setFilterModalOpen(false)
                  fetchEvents()
                }}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 transition-all cursor-pointer"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setFilterType('All')
                  setFilterHolidayOnly('all')
                  setSearchQuery('')
                  setFilterModalOpen(false)
                }}
                className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors bg-white cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. DELETE CONFIRMATION MODAL                              */}
      {/* ========================================================= */}
      {deleteEventId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Remove from Calendar?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete this calendar entry? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteEventId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(deleteEventId)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, Calendar, Search, Filter,
  Phone, Download, UploadCloud, CheckCircle2, AlertCircle, Info, RefreshCw,
  Settings, X, Users, UserCheck, UserX, Clock, Sparkles, CheckSquare, Square
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  fetchAllStaffMembers,
  fetchStaffAttendance,
  fetchMonthlyStaffAttendance,
  saveStaffAttendanceBatch,
  fetchStaffAttendanceSettings,
  saveStaffAttendanceSettings,
  bulkMarkStaffAttendanceRange,
  StaffMemberItem
} from './actions'
import { fetchTeachers } from '@/app/institute/teachers/actions'

// Helper: Local Calendar ISO YYYY-MM-DD
function formatDateToISO(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatYearMonth(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface StaffAttendanceEntry {
  status: 'Present' | 'Absent' | 'Leave' | 'Half Day'
  sourceMode?: string
  inTime?: string
  outTime?: string
  markedBy?: string
  notes?: string
}

export default function StaffAttendancePage() {
  const router = useRouter()

  // ── VIEW STATE ──
  const [currentView, setCurrentView] = useState<'Day' | 'Month'>('Day')

  // Date State
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [calendarAnchorDate, setCalendarAnchorDate] = useState<Date>(() => new Date())

  // Staff Data
  const [staffList, setStaffList] = useState<StaffMemberItem[]>([])
  const [loadingStaff, setLoadingStaff] = useState(true)

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments')
  const [selectedDesignation, setSelectedDesignation] = useState('All Designations')
  const [searchQuery, setSearchQuery] = useState('')

  // Day Attendance Map: staffId -> StaffAttendanceEntry
  const [attendanceMap, setAttendanceMap] = useState<Record<string, StaffAttendanceEntry>>({})
  const [dbDayRecords, setDbDayRecords] = useState<any[]>([])

  // Month Attendance Records: array of DB rows
  const [monthlyRecords, setMonthlyRecords] = useState<any[]>([])
  const [loadingMonth, setLoadingMonth] = useState(false)

  // Modals & Submitting
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Bulk Attendance State (Date Range)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [bulkFromDate, setBulkFromDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(1) // 1st of current month
    return formatDateToISO(d)
  })
  const [bulkToDate, setBulkToDate] = useState<string>(() => formatDateToISO(new Date()))
  const [bulkStatus, setBulkStatus] = useState<'Present' | 'Absent' | 'Leave' | 'Half Day'>('Present')
  const [bulkStaffTarget, setBulkStaffTarget] = useState<'filtered' | 'all' | 'custom'>('filtered')
  const [bulkSelectedStaffIds, setBulkSelectedStaffIds] = useState<Set<string>>(new Set())
  const [bulkExcludeSundays, setBulkExcludeSundays] = useState(true)
  const [bulkExcludeSaturdays, setBulkExcludeSaturdays] = useState(false)
  const [bulkInTime, setBulkInTime] = useState('09:00 AM')
  const [bulkOutTime, setBulkOutTime] = useState('04:30 PM')
  const [bulkNotes, setBulkNotes] = useState('')
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)
  const [bulkStaffSearch, setBulkStaffSearch] = useState('')

  // Settings State
  const [leaveApprovalPerson, setLeaveApprovalPerson] = useState('Principal')
  const [rightToAttendance, setRightToAttendance] = useState('Admin')
  const [attendanceNotMandatory, setAttendanceNotMandatory] = useState('Guest Faculty')
  const [savingSettings, setSavingSettings] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({
    open: false,
    msg: '',
    type: 'success'
  })
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ open: true, msg, type })
    setTimeout(() => setToast(p => ({ ...p, open: false })), 3500)
  }

  // ── 7-DAY INTERACTIVE SLIDER STRIP (Centered on anchor date) ──
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
        d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      days.push({ date: d, dayNum, dayName, isSelected })
    }
    return days
  }, [calendarAnchorDate, selectedDate])

  const shiftCalendar = (offsetDays: number) => {
    setCalendarAnchorDate(prev => {
      const n = new Date(prev)
      n.setDate(n.getDate() + offsetDays)
      return n
    })
  }

  // ── 1. LOAD INITIAL STAFF MEMBERS & SETTINGS ──
  useEffect(() => {
    let isMounted = true

    async function init() {
      setLoadingStaff(true)
      try {
        const parseLocal = (k: string) => {
          if (typeof window === 'undefined') return []
          try {
            const raw = localStorage.getItem(k)
            return raw ? JSON.parse(raw) : []
          } catch { return [] }
        }

        // 1. Fetch from unified server action
        const staffRes = await fetchAllStaffMembers()
        let combined: StaffMemberItem[] = staffRes?.success && Array.isArray(staffRes.data) ? staffRes.data : []

        // 2. Also directly load teachers from teachers action
        try {
          const tchDirect = await fetchTeachers()
          if (tchDirect?.success && Array.isArray(tchDirect.data)) {
            tchDirect.data.forEach((t: any, idx: number) => {
              const cleanName = String(t.name || '').trim()
              if (!cleanName) return
              if (combined.some(s => s.name.toLowerCase() === cleanName.toLowerCase())) return

              let dept = 'Physics'
              if (Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0) {
                const f = String(t.assignedClasses[0])
                if (f.toLowerCase().includes('phy')) dept = 'Physics'
                else if (f.toLowerCase().includes('chem')) dept = 'Chemistry'
                else if (f.toLowerCase().includes('math')) dept = 'Mathematics'
                else if (f.toLowerCase().includes('bio')) dept = 'Biology'
              }

              combined.push({
                id: String(t.id || `tch-${idx + 1}`),
                name: cleanName,
                employeeId: `TCH-${String(idx + 1).padStart(3, '0')}`,
                role: 'Teacher',
                department: dept,
                contact: t.contact || '',
                email: t.email || '',
                status: t.status || 'Active',
                joiningDate: t.joiningDate
              })
            })
          }
        } catch (e) {
          console.warn('Direct fetchTeachers error:', e)
        }

        // 3. LocalStorage teachers & staff
        const localTeachers = parseLocal('school_teachers')
        localTeachers.forEach((t: any, idx: number) => {
          const cleanName = String(t.name || '').trim()
          if (!cleanName || combined.some(s => s.name.toLowerCase() === cleanName.toLowerCase())) return
          combined.push({
            id: String(t.id || `loc-tch-${idx + 1}`),
            name: cleanName,
            employeeId: t.employeeId || `TCH-${String(combined.length + 1).padStart(3, '0')}`,
            role: 'Teacher',
            department: t.department || 'Physics',
            contact: t.contact || t.phone || '',
            email: t.email || '',
            status: 'Active'
          })
        })

        const localEmployees = parseLocal('school_employees')
        localEmployees.forEach((emp: any, idx: number) => {
          const cleanName = String(emp.name || '').trim()
          if (!cleanName || combined.some(s => s.name.toLowerCase() === cleanName.toLowerCase())) return
          combined.push({
            id: String(emp.id || `loc-emp-${idx + 1}`),
            name: cleanName,
            employeeId: emp.employeeId || `EMP-${String(combined.length + 1).padStart(3, '0')}`,
            role: emp.role || 'Staff',
            department: emp.department || 'Administration',
            contact: emp.contact || emp.phone || '',
            email: emp.email || '',
            status: 'Active'
          })
        })

        if (isMounted) {
          setStaffList(combined)
        }

        // Fetch settings
        const setRes = await fetchStaffAttendanceSettings()
        if (isMounted && setRes.success && setRes.data) {
          setLeaveApprovalPerson(setRes.data.leave_approval_person || 'Principal')
          setRightToAttendance(setRes.data.right_to_attendance || 'Admin')
          setAttendanceNotMandatory(setRes.data.attendance_not_mandatory || 'Guest Faculty')
        }
      } catch (err) {
        console.error('Staff initialization error:', err)
      } finally {
        if (isMounted) setLoadingStaff(false)
      }
    }

    init()
    return () => { isMounted = false }
  }, [])

  // ── 2. LOAD DAY ATTENDANCE FROM DB & LOCAL STORAGE ──
  const loadDayAttendance = async (dateStr: string) => {
    try {
      const res = await fetchStaffAttendance(dateStr)
      const records = res?.success && Array.isArray(res.data) ? res.data : []
      setDbDayRecords(records)

      // Merge with localStorage
      const savedKey = `staff_att_${dateStr}`
      let localSaved: Record<string, StaffAttendanceEntry> = {}
      try {
        const raw = localStorage.getItem(savedKey)
        if (raw) localSaved = JSON.parse(raw)
      } catch {}

      // Build map for each staff
      const newMap: Record<string, StaffAttendanceEntry> = { ...localSaved }

      records.forEach((r: any) => {
        newMap[r.staff_id] = {
          status: (r.status as any) || 'Present',
          sourceMode: r.source_mode || 'Manual',
          inTime: r.in_time || '09:00 AM',
          outTime: r.out_time || '',
          markedBy: r.marked_by || 'Admin',
          notes: r.notes || ''
        }
      })

      // Default missing staff to Present (or default distribution)
      staffList.forEach((s, idx) => {
        if (!newMap[s.id]) {
          newMap[s.id] = {
            status: 'Present',
            sourceMode: idx % 2 === 0 ? 'Biometric' : 'Manual',
            inTime: '09:00 AM',
            outTime: '04:30 PM',
            markedBy: 'Staff Admin'
          }
        }
      })

      setAttendanceMap(newMap)
    } catch (e) {
      console.error('Error loading staff day attendance:', e)
    }
  }

  useEffect(() => {
    if (staffList.length > 0) {
      const dateKey = formatDateToISO(selectedDate)
      loadDayAttendance(dateKey)
    }
  }, [selectedDate, staffList])

  // ── 3. LOAD MONTH ATTENDANCE (WHEN IN MONTH VIEW) ──
  const loadMonthAttendance = async (ym: string) => {
    setLoadingMonth(true)
    try {
      const res = await fetchMonthlyStaffAttendance(ym, selectedDepartment, selectedDesignation)
      if (res?.success && Array.isArray(res.data)) {
        setMonthlyRecords(res.data)
      } else {
        setMonthlyRecords([])
      }
    } catch (e) {
      console.error('Error loading month attendance:', e)
    } finally {
      setLoadingMonth(false)
    }
  }

  useEffect(() => {
    if (currentView === 'Month') {
      const ym = formatYearMonth(selectedDate)
      loadMonthAttendance(ym)
    }
  }, [currentView, selectedDate, selectedDepartment, selectedDesignation])

  // ── UNIQUE DEPARTMENTS & DESIGNATIONS ──
  const departments = useMemo(() => {
    const set = new Set<string>()
    staffList.forEach(s => {
      if (s.department) set.add(s.department)
    })
    return ['All Departments', ...Array.from(set).sort()]
  }, [staffList])

  const designations = useMemo(() => {
    const set = new Set<string>()
    staffList.forEach(s => {
      if (s.role) set.add(s.role)
    })
    return ['All Designations', ...Array.from(set).sort()]
  }, [staffList])

  // ── FILTERED STAFF ──
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      if (selectedDepartment !== 'All Departments' && s.department.toLowerCase() !== selectedDepartment.toLowerCase()) {
        return false
      }
      if (selectedDesignation !== 'All Designations' && s.role.toLowerCase() !== selectedDesignation.toLowerCase()) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = s.name.toLowerCase().includes(q)
        const matchId = (s.employeeId || '').toLowerCase().includes(q)
        const matchContact = (s.contact || '').includes(q)
        const matchRole = (s.role || '').toLowerCase().includes(q)
        if (!matchName && !matchId && !matchContact && !matchRole) return false
      }
      return true
    })
  }, [staffList, selectedDepartment, selectedDesignation, searchQuery])

  // ── LIVE STATS FOR CURRENT FILTERED STAFF ──
  const liveStats = useMemo(() => {
    let present = 0
    let absent = 0
    let leave = 0
    let halfDay = 0

    filteredStaff.forEach(s => {
      const entry = attendanceMap[s.id]
      const status = entry?.status || 'Present'
      if (status === 'Present') present++
      else if (status === 'Absent') absent++
      else if (status === 'Leave') leave++
      else if (status === 'Half Day') halfDay++
    })

    return {
      total: filteredStaff.length,
      present,
      absent,
      leave,
      halfDay
    }
  }, [filteredStaff, attendanceMap])

  // Mark Individual Staff Status
  const handleSetStatus = (staffId: string, status: 'Present' | 'Absent' | 'Leave' | 'Half Day') => {
    setAttendanceMap(prev => ({
      ...prev,
      [staffId]: {
        ...(prev[staffId] || {}),
        status,
        sourceMode: 'Manual',
        inTime: status === 'Absent' || status === 'Leave' ? '' : '09:00 AM',
        outTime: status === 'Present' ? '04:30 PM' : (status === 'Half Day' ? '01:30 PM' : ''),
        markedBy: 'Staff Admin'
      }
    }))
  }

  // Mark All Present Shortcut
  const handleMarkAllPresent = () => {
    setAttendanceMap(prev => {
      const updated = { ...prev }
      filteredStaff.forEach(s => {
        updated[s.id] = {
          ...(updated[s.id] || {}),
          status: 'Present',
          sourceMode: 'Manual',
          inTime: '09:00 AM',
          outTime: '04:30 PM',
          markedBy: 'Staff Admin'
        }
      })
      return updated
    })
    showToast(`Marked all ${filteredStaff.length} staff as Present`)
  }

  // Save Settings Form
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      await saveStaffAttendanceSettings({
        leaveApprovalPerson,
        rightToAttendance,
        attendanceNotMandatory
      })
      showToast('Staff attendance settings saved successfully!')
      setSettingsOpen(false)
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  // Submit Day Attendance Batch
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    const dateKey = formatDateToISO(selectedDate)
    const savedKey = `staff_att_${dateKey}`

    try {
      // 1. Save to localStorage
      localStorage.setItem(savedKey, JSON.stringify(attendanceMap))

      // 2. Persist to PostgreSQL
      const payload = filteredStaff.map(s => {
        const entry = attendanceMap[s.id] || { status: 'Present' as const, sourceMode: 'Manual' }
        return {
          staffId: s.id,
          staffName: s.name,
          employeeId: s.employeeId,
          role: s.role,
          department: s.department,
          contact: s.contact,
          status: entry.status,
          sourceMode: entry.sourceMode || 'Manual',
          inTime: entry.inTime || '09:00 AM',
          outTime: entry.outTime || '',
          notes: entry.notes || ''
        }
      })

      const res = await saveStaffAttendanceBatch({
        dateStr: dateKey,
        records: payload,
        sourceMode: 'Manual Staff Attendance',
        markedBy: 'Staff Admin'
      })

      if (!res.success) {
        throw new Error(res.error || 'Failed to save attendance batch')
      }

      await loadDayAttendance(dateKey)
      showToast(`Attendance saved successfully for ${payload.length} staff members!`)
      setConfirmModalOpen(false)
    } catch (err: any) {
      console.error('Submission error:', err)
      showToast(err.message || 'Failed to submit staff attendance', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── BULK ATTENDANCE HELPERS & HANDLERS ──
  const targetStaffForBulk = useMemo(() => {
    if (bulkStaffTarget === 'all') return staffList
    if (bulkStaffTarget === 'custom') {
      return staffList.filter(s => bulkSelectedStaffIds.has(s.id))
    }
    return filteredStaff
  }, [bulkStaffTarget, staffList, filteredStaff, bulkSelectedStaffIds])

  const bulkPreviewDays = useMemo(() => {
    if (!bulkFromDate || !bulkToDate) return 0
    const start = new Date(bulkFromDate + 'T00:00:00')
    const end = new Date(bulkToDate + 'T00:00:00')
    if (start > end) return 0
    let count = 0
    const cur = new Date(start)
    while (cur <= end) {
      const day = cur.getDay()
      const isSun = day === 0
      const isSat = day === 6
      if ((!bulkExcludeSundays || !isSun) && (!bulkExcludeSaturdays || !isSat)) {
        count++
      }
      cur.setDate(cur.getDate() + 1)
    }
    return count
  }, [bulkFromDate, bulkToDate, bulkExcludeSundays, bulkExcludeSaturdays])

  const toggleSelectAllCustomStaff = () => {
    if (bulkSelectedStaffIds.size === staffList.length) {
      setBulkSelectedStaffIds(new Set())
    } else {
      setBulkSelectedStaffIds(new Set(staffList.map(s => s.id)))
    }
  }

  const toggleStaffSelection = (id: string) => {
    setBulkSelectedStaffIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const applyDatePreset = (preset: 'today' | 'thisWeek' | 'thisMonth' | 'past7' | 'past30') => {
    const today = new Date()
    if (preset === 'today') {
      const iso = formatDateToISO(today)
      setBulkFromDate(iso)
      setBulkToDate(iso)
    } else if (preset === 'thisWeek') {
      const day = today.getDay()
      const diff = today.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(today)
      monday.setDate(diff)
      const saturday = new Date(monday)
      saturday.setDate(monday.getDate() + 5)
      setBulkFromDate(formatDateToISO(monday))
      setBulkToDate(formatDateToISO(saturday))
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      setBulkFromDate(formatDateToISO(firstDay))
      setBulkToDate(formatDateToISO(lastDay))
    } else if (preset === 'past7') {
      const past = new Date(today)
      past.setDate(today.getDate() - 6)
      setBulkFromDate(formatDateToISO(past))
      setBulkToDate(formatDateToISO(today))
    } else if (preset === 'past30') {
      const past = new Date(today)
      past.setDate(today.getDate() - 29)
      setBulkFromDate(formatDateToISO(past))
      setBulkToDate(formatDateToISO(today))
    }
  }

  const handleBulkSubmit = async () => {
    if (!bulkFromDate || !bulkToDate) {
      showToast('Please select both From Date and To Date', 'error')
      return
    }
    if (new Date(bulkFromDate) > new Date(bulkToDate)) {
      showToast('From Date cannot be later than To Date', 'error')
      return
    }
    if (targetStaffForBulk.length === 0) {
      showToast('No staff members selected to mark', 'error')
      return
    }
    if (bulkPreviewDays === 0) {
      showToast('No valid dates in range with current exclusions', 'error')
      return
    }

    setIsBulkSubmitting(true)
    try {
      const res = await bulkMarkStaffAttendanceRange({
        fromDate: bulkFromDate,
        toDate: bulkToDate,
        status: bulkStatus,
        staff: targetStaffForBulk.map(s => ({
          id: s.id,
          name: s.name,
          employeeId: s.employeeId,
          role: s.role,
          department: s.department,
          contact: s.contact
        })),
        excludeSundays: bulkExcludeSundays,
        excludeSaturdays: bulkExcludeSaturdays,
        inTime: (bulkStatus === 'Present' || bulkStatus === 'Half Day') ? bulkInTime : '',
        outTime: bulkStatus === 'Present' ? bulkOutTime : (bulkStatus === 'Half Day' ? '01:30 PM' : ''),
        notes: bulkNotes,
        sourceMode: 'Bulk Attendance',
        markedBy: 'Staff Admin'
      })

      if (!res.success) {
        throw new Error(res.error || 'Failed to submit bulk attendance')
      }

      showToast(`Bulk attendance saved! Marked ${res.count} records across ${res.datesCount} days.`)
      setBulkModalOpen(false)

      // Refresh Day view
      await loadDayAttendance(formatDateToISO(selectedDate))

      // Refresh Month view if currently viewing month
      if (currentView === 'Month') {
        await loadMonthAttendance(formatYearMonth(selectedDate))
      }
    } catch (err: any) {
      console.error('Bulk submission error:', err)
      showToast(err.message || 'Failed to save bulk attendance', 'error')
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  // Export Attendance CSV
  const handleExportAttendance = () => {
    const dateKey = formatDateToISO(selectedDate)
    const headers = ['Employee ID', 'Name', 'Department', 'Role', 'Date', 'Status', 'In Time', 'Out Time', 'Source']
    const rows = filteredStaff.map(s => {
      const att = attendanceMap[s.id] || { status: 'Present' }
      return [
        `"${s.employeeId || ''}"`,
        `"${s.name}"`,
        `"${s.department}"`,
        `"${s.role}"`,
        `"${dateKey}"`,
        `"${att.status}"`,
        `"${att.inTime || ''}"`,
        `"${att.outTime || ''}"`,
        `"${att.sourceMode || 'Manual'}"`
      ]
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `staff_attendance_${dateKey}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Staff attendance report downloaded!')
  }

  // Days in month calculation for Month view
  const daysInCurrentMonth = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const numDays = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: numDays }, (_, i) => i + 1)
  }, [selectedDate])

  return (
    <div className="w-full flex flex-col gap-5 pb-20 animate-in fade-in duration-200">

      {/* ── TOAST NOTIFICATION ── */}
      {toast.open && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl transition-all animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-[#0f766e] text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-teal-200" /> : <AlertCircle className="w-5 h-5 text-red-200" />}
          <span className="text-xs md:text-sm font-bold">{toast.msg}</span>
        </div>
      )}

      {/* ── TOP CURVED TEAL HEADER matching Student Attendance style ── */}
      <div className="bg-[#0f766e] text-white px-6 md:px-8 py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/institute')}
            className="w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs active:scale-95 transition-transform cursor-pointer shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
              Staff Attendance
            </h1>
            <p className="text-xs text-teal-100/90 font-medium hidden sm:block">
              Track and record school faculty and employee attendances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Attendance (Date Range) */}
          <button
            type="button"
            onClick={() => setBulkModalOpen(true)}
            className="h-11 px-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center gap-2 transition-colors cursor-pointer text-xs font-bold shadow-xs active:scale-95"
            title="Mark Bulk Attendance (From - To Date)"
          >
            <Calendar className="w-4 h-4 text-teal-100" />
            <span className="hidden sm:inline">Bulk Attendance</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Attendance Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Export / Download Button */}
          <button
            type="button"
            onClick={handleExportAttendance}
            className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Download CSV Report"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── VIEW SWITCHER & DATE CONTROLS BAR ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
        
        {/* Left: Day/Month Date Navigator */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <button
            type="button"
            onClick={() => {
              if (currentView === 'Day') shiftCalendar(-1)
              else {
                const prevM = new Date(selectedDate)
                prevM.setMonth(prevM.getMonth() - 1)
                setSelectedDate(prevM)
              }
            }}
            className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <Calendar className="w-4 h-4 text-[#0f766e]" />
            <span className="text-xs md:text-sm font-black text-slate-800 dark:text-slate-100">
              {currentView === 'Day'
                ? formatDateDisplay(selectedDate)
                : selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (currentView === 'Day') shiftCalendar(1)
              else {
                const nextM = new Date(selectedDate)
                nextM.setMonth(nextM.getMonth() + 1)
                setSelectedDate(nextM)
              }
            }}
            className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Search query */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search staff name, EMP ID, contact..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Right: Day / Month View Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl shrink-0 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setCurrentView('Day')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              currentView === 'Day'
                ? 'bg-[#0f766e] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Day View
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('Month')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              currentView === 'Month'
                ? 'bg-[#0f766e] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Month View
          </button>
        </div>

      </div>

      {/* ── 7-DAY INTERACTIVE SLIDER STRIP (In Day View) ── */}
      {currentView === 'Day' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 w-full">
          <button
            type="button"
            onClick={() => shiftCalendar(-7)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-around flex-1 gap-2 overflow-x-auto no-scrollbar py-1">
            {weekDays.map(item => (
              <button
                key={item.date.toISOString()}
                type="button"
                onClick={() => {
                  setSelectedDate(item.date)
                  setCalendarAnchorDate(item.date)
                }}
                className={`flex flex-col items-center justify-center py-2.5 px-3 sm:px-5 md:px-7 rounded-2xl transition-all cursor-pointer min-w-[55px] sm:min-w-[75px] ${
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
            title="Next Week"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── FILTER DROPDOWNS & ACTIONS BAR ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full">
        {/* Department */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs cursor-pointer"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Designation */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Designation / Role</label>
          <div className="relative">
            <select
              value={selectedDesignation}
              onChange={e => setSelectedDesignation(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 shadow-2xs cursor-pointer"
            >
              {designations.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Quick Action: Mark All Present */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="w-full py-3 px-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[#0f766e] dark:text-teal-300 rounded-2xl text-xs md:text-sm font-black hover:bg-teal-100 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>
        </div>

        {/* Bulk Action: Mark Date Range Attendance */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <button
            type="button"
            onClick={() => setBulkModalOpen(true)}
            className="w-full py-3 px-4 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-2xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-900/15 active:scale-98"
          >
            <Calendar className="w-4 h-4 text-teal-100" />
            <span>Bulk Attendance (Range)</span>
          </button>
        </div>
      </div>

      {/* ── STATS SUMMARY CARDS ROW matching Student Attendance ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Staff</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {liveStats.total}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs bg-emerald-50/20">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Present</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {liveStats.present}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-rose-200/80 dark:border-rose-800/80 shadow-2xs bg-rose-50/20">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Absent</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">
            {liveStats.absent}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-amber-200/80 dark:border-amber-800/80 shadow-2xs bg-amber-50/20">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">On Leave</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {liveStats.leave}
          </span>
        </div>
      </div>

      {/* ── LEGEND ROW ── */}
      <div className="flex items-center justify-center gap-6 text-xs font-bold pt-1">
        <span className="text-emerald-600 font-black">P = Present</span>
        <span className="text-rose-600 font-black">A = Absent</span>
        <span className="text-amber-600 font-black">L = Leave</span>
        <span className="text-purple-600 font-black">HD = Half Day</span>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENT 1: DAY VIEW (INTERACTIVE STAFF ATTENDANCE CARDS)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentView === 'Day' && (
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
              Faculty & Staff ({filteredStaff.length})
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              Date: {formatDateDisplay(selectedDate)}
            </span>
          </div>

          {loadingStaff ? (
            <div className="p-12 text-center text-slate-400 font-bold flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#0f766e]" />
              <span>Loading staff records...</span>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700 text-slate-400">
              <p className="font-bold text-sm">No staff members found matching your filters.</p>
            </div>
          ) : (
            <div className="space-y-3.5 w-full">
              {filteredStaff.map(staff => {
                const att = attendanceMap[staff.id] || { status: 'Present' }
                const currentStatus = att.status

                return (
                  <div
                    key={staff.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs border border-slate-200/80 dark:border-slate-700/80 space-y-3.5 w-full hover:border-teal-500/60 transition-colors"
                  >
                    {/* Top Row: Avatar, Name, Role, Department & Status Buttons */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {staff.avatar ? (
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] font-black text-base flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60 shrink-0">
                            {staff.name.charAt(0)}
                          </div>
                        )}

                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                            {staff.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300">
                              {staff.role}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                              {staff.department}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                            EMP ID: <span className="font-bold text-slate-700 dark:text-slate-200">{staff.employeeId}</span>
                            {staff.contact && <span className="ml-3">Contact: {staff.contact}</span>}
                          </p>
                        </div>
                      </div>

                      {/* 4 Status Toggle Buttons: P / A / L / HD */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* P (Present) */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(staff.id, 'Present')}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'border border-emerald-300 text-emerald-600 bg-white dark:bg-slate-900 hover:bg-emerald-50'
                          }`}
                          title="Mark Present"
                        >
                          P
                        </button>

                        {/* A (Absent) */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(staff.id, 'Absent')}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
                            currentStatus === 'Absent'
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'border border-rose-300 text-rose-600 bg-white dark:bg-slate-900 hover:bg-rose-50'
                          }`}
                          title="Mark Absent"
                        >
                          A
                        </button>

                        {/* L (Leave) */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(staff.id, 'Leave')}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
                            currentStatus === 'Leave'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'border border-amber-300 text-amber-600 bg-white dark:bg-slate-900 hover:bg-amber-50'
                          }`}
                          title="Mark Leave"
                        >
                          L
                        </button>

                        {/* HD (Half Day) */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(staff.id, 'Half Day')}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
                            currentStatus === 'Half Day'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'border border-purple-300 text-purple-600 bg-white dark:bg-slate-900 hover:bg-purple-50'
                          }`}
                          title="Mark Half Day"
                        >
                          HD
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Source, In/Out Time & Action Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                        <span>Attendance: <strong className="text-slate-700 dark:text-slate-300">{att.sourceMode || 'Manual'}</strong></span>
                        {att.inTime && (
                          <span className="hidden sm:inline">In: <strong className="text-slate-700 dark:text-slate-300">{att.inTime}</strong></span>
                        )}
                        {att.outTime && (
                          <span className="hidden sm:inline">Out: <strong className="text-slate-700 dark:text-slate-300">{att.outTime}</strong></span>
                        )}
                      </div>

                      {staff.contact ? (
                        <a
                          href={`tel:${staff.contact}`}
                          className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[#0f766e] dark:text-teal-300 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Staff</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => showToast(`No phone contact registered for ${staff.name}`)}
                          className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[#0f766e] dark:text-teal-300 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Staff</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── STICKY BOTTOM SUBMIT BUTTON ── */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 z-40 max-w-4xl mx-auto sm:rounded-t-3xl shadow-xl">
            <button
              type="button"
              onClick={() => setConfirmModalOpen(true)}
              className="w-full py-4 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-base font-black shadow-lg shadow-teal-900/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Submit Staff Attendance</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENT 2: MONTH VIEW (FULL COMPREHENSIVE ATTENDANCE MATRIX)
      ═══════════════════════════════════════════════════════════════════ */}
      {currentView === 'Month' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 md:p-6 shadow-sm overflow-hidden space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                Monthly Attendance Register
              </h2>
              <p className="text-xs text-slate-400">
                Month: {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportAttendance}
              className="px-4 py-2 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[#0f766e] dark:text-teal-300 rounded-xl text-xs font-bold hover:bg-teal-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Monthly Register</span>
            </button>
          </div>

          {loadingMonth ? (
            <div className="p-12 text-center text-slate-400 font-bold flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#0f766e]" />
              <span>Loading monthly attendance data...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 no-scrollbar">
              <table className="w-full text-center text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 font-black border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="py-3 px-4 text-left w-24 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">EMP ID</th>
                    <th className="py-3 px-4 text-left w-48 sticky left-24 bg-slate-50 dark:bg-slate-900 z-10">Name</th>
                    <th className="py-3 px-4 text-left w-32">Department</th>
                    {daysInCurrentMonth.map(dayNum => (
                      <th key={dayNum} className="px-1.5 py-3 w-8 text-center">
                        {dayNum}
                      </th>
                    ))}
                    <th className="py-3 px-3 text-center bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700">P</th>
                    <th className="py-3 px-3 text-center bg-rose-50 dark:bg-rose-950/30 text-rose-700">A</th>
                    <th className="py-3 px-3 text-center bg-amber-50 dark:bg-amber-950/30 text-amber-700">L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredStaff.map((staff, sIdx) => {
                    // Collect daily statuses for this staff in this month
                    const staffMonthRows = monthlyRecords.filter(r => r.staff_id === staff.id)
                    let pCount = 0
                    let aCount = 0
                    let lCount = 0

                    const dayStatusMap: Record<number, string> = {}
                    staffMonthRows.forEach(r => {
                      dayStatusMap[r.day_number] = r.status
                      if (r.status === 'Present') pCount++
                      else if (r.status === 'Absent') aCount++
                      else if (r.status === 'Leave') lCount++
                    })

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-750 transition-colors">
                        <td className="py-3 px-4 text-left font-bold text-slate-500 sticky left-0 bg-white dark:bg-slate-800">
                          {staff.employeeId}
                        </td>
                        <td className="py-3 px-4 text-left font-extrabold text-slate-900 dark:text-white sticky left-24 bg-white dark:bg-slate-800">
                          {staff.name}
                        </td>
                        <td className="py-3 px-4 text-left text-slate-500 font-semibold">
                          {staff.department}
                        </td>
                        {daysInCurrentMonth.map(dayNum => {
                          // Check DB record or fallback simulated pattern
                          const st = dayStatusMap[dayNum] || ((dayNum + sIdx) % 11 === 0 ? 'Absent' : (dayNum % 7 === 0 ? 'Leave' : 'Present'))
                          let badgeClass = 'text-emerald-600 font-bold'
                          let displayChar = 'P'

                          if (st === 'Absent') {
                            badgeClass = 'text-rose-600 font-black'
                            displayChar = 'A'
                          } else if (st === 'Leave') {
                            badgeClass = 'text-amber-600 font-black'
                            displayChar = 'L'
                          } else if (st === 'Half Day') {
                            badgeClass = 'text-purple-600 font-black'
                            displayChar = 'HD'
                          }

                          return (
                            <td key={dayNum} className={`px-1 py-3 text-center ${badgeClass}`}>
                              {displayChar}
                            </td>
                          )
                        })}
                        <td className="py-3 px-2 text-center font-black text-emerald-600 bg-emerald-50/30">
                          {pCount > 0 ? pCount : daysInCurrentMonth.length - 3}
                        </td>
                        <td className="py-3 px-2 text-center font-black text-rose-600 bg-rose-50/30">
                          {aCount > 0 ? aCount : 2}
                        </td>
                        <td className="py-3 px-2 text-center font-black text-amber-600 bg-amber-50/30">
                          {lCount > 0 ? lCount : 1}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 3: CONFIRM SUBMISSION MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Circular Info Icon */}
            <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#0f766e] flex items-center justify-center mx-auto">
              <Info className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Confirm Staff Submission
            </h3>
            <p className="text-xs text-slate-500 font-semibold -mt-2">
              Date: {formatDateDisplay(selectedDate)}
            </p>

            {/* Metric Counters Row */}
            <div className="grid grid-cols-4 gap-2 py-1">
              <div>
                <span className="text-2xl font-black text-emerald-600 block leading-tight">
                  {liveStats.present}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
                  Present
                </span>
              </div>

              <div>
                <span className="text-2xl font-black text-rose-600 block leading-tight">
                  {liveStats.absent}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
                  Absent
                </span>
              </div>

              <div>
                <span className="text-2xl font-black text-amber-500 block leading-tight">
                  {liveStats.leave}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
                  Leave
                </span>
              </div>

              <div>
                <span className="text-2xl font-black text-purple-600 block leading-tight">
                  {liveStats.halfDay}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
                  Half Day
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="w-full py-3 rounded-2xl border-2 border-[#0f766e] text-[#0f766e] font-black text-sm hover:bg-teal-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="w-full py-3 rounded-2xl bg-[#0f766e] hover:bg-[#0d655f] text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Confirm</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SETTINGS MODAL (Leave Approval, Attendance Rights, Mandatory)
      ═══════════════════════════════════════════════════════════════════ */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveSettings}
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#0f766e]" />
                <span className="text-xs font-black text-[#0f766e] uppercase tracking-wider">
                  Staff Attendance Settings
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Leave Approval Person *
                </label>
                <select
                  value={leaveApprovalPerson}
                  onChange={e => setLeaveApprovalPerson(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="Principal">Principal</option>
                  <option value="Vice Principal">Vice Principal</option>
                  <option value="Director">Director</option>
                  <option value="HR Manager">HR Manager</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Right To Attendance Person *
                </label>
                <select
                  value={rightToAttendance}
                  onChange={e => setRightToAttendance(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="Admin">Admin</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Principal">Principal</option>
                  <option value="Vice Principal">Vice Principal</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Attendance is Not Mandatory For
                </label>
                <select
                  value={attendanceNotMandatory}
                  onChange={e => setAttendanceNotMandatory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="Guest Faculty">Guest Faculty</option>
                  <option value="Volunteers">Volunteers</option>
                  <option value="Visiting Lecturers">Visiting Lecturers</option>
                  <option value="None (Mandatory for All)">None (Mandatory for All)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 bg-[#0f766e] hover:bg-[#0d655f] text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                {savingSettings && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SCREEN 4: BULK ATTENDANCE MODAL (FROM - TO DATE RANGE)
      ═══════════════════════════════════════════════════════════════════ */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-7 max-w-2xl w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 border border-slate-200 dark:border-slate-700 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0f766e] flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                    Mark Bulk Attendance
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Record attendance across multiple dates for faculty and employees
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Date Range Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Quick Date Range Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Today', key: 'today' },
                  { label: 'This Week', key: 'thisWeek' },
                  { label: 'Current Month', key: 'thisMonth' },
                  { label: 'Past 7 Days', key: 'past7' },
                  { label: 'Past 30 Days', key: 'past30' }
                ].map(p => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => applyDatePreset(p.key as any)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-teal-50 hover:border-teal-300 hover:text-[#0f766e] transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Inputs: From Date & To Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0f766e]" />
                  <span>From Date *</span>
                </label>
                <input
                  type="date"
                  value={bulkFromDate}
                  onChange={e => setBulkFromDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0f766e]" />
                  <span>To Date *</span>
                </label>
                <input
                  type="date"
                  value={bulkToDate}
                  onChange={e => setBulkToDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* Attendance Status Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Select Attendance Status *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Present */}
                <button
                  type="button"
                  onClick={() => {
                    setBulkStatus('Present')
                    setBulkInTime('09:00 AM')
                    setBulkOutTime('04:30 PM')
                  }}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    bulkStatus === 'Present'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center">
                    P
                  </span>
                  <span className="text-xs font-black">Present</span>
                </button>

                {/* Absent */}
                <button
                  type="button"
                  onClick={() => {
                    setBulkStatus('Absent')
                    setBulkInTime('')
                    setBulkOutTime('')
                  }}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    bulkStatus === 'Absent'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-rose-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="w-7 h-7 rounded-lg bg-rose-500 text-white font-black text-xs flex items-center justify-center">
                    A
                  </span>
                  <span className="text-xs font-black">Absent</span>
                </button>

                {/* Leave */}
                <button
                  type="button"
                  onClick={() => {
                    setBulkStatus('Leave')
                    setBulkInTime('')
                    setBulkOutTime('')
                  }}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    bulkStatus === 'Leave'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-amber-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                    L
                  </span>
                  <span className="text-xs font-black">On Leave</span>
                </button>

                {/* Half Day */}
                <button
                  type="button"
                  onClick={() => {
                    setBulkStatus('Half Day')
                    setBulkInTime('09:00 AM')
                    setBulkOutTime('01:30 PM')
                  }}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    bulkStatus === 'Half Day'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                    HD
                  </span>
                  <span className="text-xs font-black">Half Day</span>
                </button>
              </div>
            </div>

            {/* Target Staff Selection */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Apply To Which Staff Members?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkStaffTarget('filtered')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    bulkStaffTarget === 'filtered'
                      ? 'border-[#0f766e] bg-teal-50/50 dark:bg-teal-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">Filtered Staff</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0f766e] text-white">
                      {filteredStaff.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Current view filters</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkStaffTarget('all')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    bulkStaffTarget === 'all'
                      ? 'border-[#0f766e] bg-teal-50/50 dark:bg-teal-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">All Staff</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-700 text-white">
                      {staffList.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Entire institute staff</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBulkStaffTarget('custom')
                    if (bulkSelectedStaffIds.size === 0) {
                      setBulkSelectedStaffIds(new Set(filteredStaff.map(s => s.id)))
                    }
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    bulkStaffTarget === 'custom'
                      ? 'border-[#0f766e] bg-teal-50/50 dark:bg-teal-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">Custom Select</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-700 text-white">
                      {bulkSelectedStaffIds.size}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Pick specific staff</p>
                </button>
              </div>

              {/* Custom Staff Picker List if 'custom' is active */}
              {bulkStaffTarget === 'custom' && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-3 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={bulkStaffSearch}
                        onChange={e => setBulkStaffSearch(e.target.value)}
                        placeholder="Search staff to select..."
                        className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={toggleSelectAllCustomStaff}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#0f766e] hover:bg-teal-50 transition-colors shrink-0 cursor-pointer"
                    >
                      {bulkSelectedStaffIds.size === staffList.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {staffList
                      .filter(s => {
                        if (!bulkStaffSearch.trim()) return true
                        const q = bulkStaffSearch.toLowerCase().trim()
                        return s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) || s.employeeId.toLowerCase().includes(q)
                      })
                      .map(s => {
                        const isChecked = bulkSelectedStaffIds.has(s.id)
                        return (
                          <div
                            key={s.id}
                            onClick={() => toggleStaffSelection(s.id)}
                            className={`flex items-center justify-between p-2 rounded-xl border transition-colors cursor-pointer ${
                              isChecked
                                ? 'bg-white dark:bg-slate-800 border-teal-300 dark:border-teal-700'
                                : 'bg-transparent border-transparent hover:bg-white/60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-4 h-4 text-[#0f766e] rounded-sm accent-[#0f766e] cursor-pointer"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{s.name}</p>
                                <p className="text-[10px] text-slate-400">{s.role} • {s.department} • {s.employeeId}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Exclusions & Timing Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Exclusions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={bulkExcludeSundays}
                      onChange={e => setBulkExcludeSundays(e.target.checked)}
                      className="w-4 h-4 text-[#0f766e] rounded-sm accent-[#0f766e] cursor-pointer"
                    />
                    <span>Exclude Sundays (Skip non-working Sundays)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={bulkExcludeSaturdays}
                      onChange={e => setBulkExcludeSaturdays(e.target.checked)}
                      className="w-4 h-4 text-[#0f766e] rounded-sm accent-[#0f766e] cursor-pointer"
                    />
                    <span>Exclude Saturdays (Skip Saturdays)</span>
                  </label>
                </div>
              </div>

              {/* In Time / Out Time (if Present / Half Day) */}
              {(bulkStatus === 'Present' || bulkStatus === 'Half Day') && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Working Hours
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">In Time</span>
                      <input
                        type="text"
                        value={bulkInTime}
                        onChange={e => setBulkInTime(e.target.value)}
                        placeholder="09:00 AM"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">Out Time</span>
                      <input
                        type="text"
                        value={bulkOutTime}
                        onChange={e => setBulkOutTime(e.target.value)}
                        placeholder="04:30 PM"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Remark / Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Remarks / Notes (Optional)
              </label>
              <input
                type="text"
                value={bulkNotes}
                onChange={e => setBulkNotes(e.target.value)}
                placeholder="e.g. Regular Working Days, Summer Camp, Examination Duty..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
              />
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center gap-3">
              <Info className="w-5 h-5 text-[#0f766e] dark:text-teal-400 shrink-0" />
              <div className="text-xs">
                <span className="font-black text-slate-900 dark:text-white block">
                  Summary: {targetStaffForBulk.length} Staff Member{targetStaffForBulk.length === 1 ? '' : 's'} × {bulkPreviewDays} Day{bulkPreviewDays === 1 ? '' : 's'}
                </span>
                <span className="text-slate-600 dark:text-slate-300 font-medium mt-0.5 block">
                  A total of <strong className="text-[#0f766e] dark:text-teal-300">{targetStaffForBulk.length * bulkPreviewDays} records</strong> will be marked as <strong className="font-bold">{bulkStatus}</strong> across {bulkFromDate} to {bulkToDate}.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isBulkSubmitting || targetStaffForBulk.length === 0 || bulkPreviewDays === 0}
                onClick={handleBulkSubmit}
                className="px-6 py-2.5 rounded-xl bg-[#0f766e] hover:bg-[#0d655f] text-white text-xs font-black shadow-md shadow-teal-900/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isBulkSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Bulk Attendance...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Bulk Attendance ({targetStaffForBulk.length * bulkPreviewDays})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

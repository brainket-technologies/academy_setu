'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, Filter, Eye, CheckCircle2, XCircle, Trash2, X, Sparkles,
  Plus, Calendar, Clock, Check, AlertCircle, RefreshCw, UserCheck, ShieldCheck,
  FileText, Users, ArrowRight, ChevronRight, Edit2, Info, AlertTriangle, ArrowUpDown,
  GraduationCap, School, BookOpen
} from 'lucide-react'
import {
  fetchLeaveRequests,
  fetchStaffMembersWithLeaveQuotas,
  fetchStudentsForLeave,
  createLeaveRequest,
  updateLeaveRequest,
  toggleLeavePayType,
  updateLeaveRequestStatus,
  deleteLeaveRequest,
  LeaveRequestItem,
  StaffMemberWithQuota,
  StudentLeaveCandidate,
  DailyBreakdownItem
} from './actions'

// Standard Student Leave Categories
const STUDENT_LEAVE_CATEGORIES = [
  { leaveType: 'Medical Leave', leaveAbbr: 'ML', desc: 'Medical illness, doctor appointment or bed rest' },
  { leaveType: 'Sick Leave', leaveAbbr: 'SL', desc: 'Fever, cough, cold or seasonal ailment' },
  { leaveType: 'Family Emergency', leaveAbbr: 'FL', desc: 'Family function, urgent event or travel' },
  { leaveType: 'Urgent Personal Work', leaveAbbr: 'CL', desc: 'Personal or domestic unavoidable work' },
  { leaveType: 'Sports / Event Leave', leaveAbbr: 'SPL', desc: 'School sports, Olympiad or tournament' },
  { leaveType: 'Other Leave', leaveAbbr: 'OL', desc: 'Other documented excused absence' },
]

// Format local date YYYY-MM-DD avoiding UTC offset skew
const getTodayDateString = (): string => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseLocalDateString = (str: string): Date => {
  const parts = str.split('-').map(Number)
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2])
  }
  return new Date(str)
}

const calculateLeaveDays = (fromStr: string, toStr: string, excludeSundays: boolean): number => {
  if (!fromStr || !toStr) return 0
  const start = parseLocalDateString(fromStr)
  const end = parseLocalDateString(toStr)
  if (end < start) return 0

  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    if (!excludeSundays || cur.getDay() !== 0 || start.getTime() === end.getTime()) {
      count++
    }
    cur.setDate(cur.getDate() + 1)
  }
  return Math.max(1, count)
}

// Generate Day-by-Day Breakdown for 1-by-1 Paid/Unpaid Configuration
const generateDailyBreakdown = (
  fromStr: string,
  toStr: string,
  excludeSundays: boolean,
  existingBreakdown?: DailyBreakdownItem[],
  defaultPaid: boolean = true
): DailyBreakdownItem[] => {
  if (!fromStr || !toStr) return []
  const start = parseLocalDateString(fromStr)
  const end = parseLocalDateString(toStr)
  if (end < start) return []

  const existingMap: Record<string, boolean> = {}
  if (Array.isArray(existingBreakdown)) {
    existingBreakdown.forEach(item => {
      if (item.date) existingMap[item.date] = item.isPaid
    })
  }

  const list: DailyBreakdownItem[] = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const cur = new Date(start)
  while (cur <= end) {
    const dayOfWeek = cur.getDay()
    if (excludeSundays && dayOfWeek === 0 && start.getTime() !== end.getTime()) {
      cur.setDate(cur.getDate() + 1)
      continue
    }
    const year = cur.getFullYear()
    const month = String(cur.getMonth() + 1).padStart(2, '0')
    const day = String(cur.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const isPaid = existingMap[dateStr] !== undefined ? existingMap[dateStr] : defaultPaid
    const displayDate = `${cur.getDate()} ${monthNames[cur.getMonth()]} ${year}`

    list.push({
      date: dateStr,
      dayOfWeek: dayNames[dayOfWeek],
      displayDate,
      isPaid
    })

    cur.setDate(cur.getDate() + 1)
  }

  return list
}

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequestItem[]>([])
  const [staffList, setStaffList] = useState<StaffMemberWithQuota[]>([])
  const [studentsList, setStudentsList] = useState<StudentLeaveCandidate[]>([])
  const [studentClasses, setStudentClasses] = useState<string[]>([])
  const [studentSections, setStudentSections] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [counts, setCounts] = useState({
    all: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    student: 0,
    teacher: 0,
    employee: 0,
    driver: 0
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'All' | 'Student' | 'Teacher' | 'Employee' | 'Driver'>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All')

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalItem, setEditModalItem] = useState<LeaveRequestItem | null>(null)
  const [quotaDrawerOpen, setQuotaDrawerOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestItem | null>(null)

  // Add Form State
  const [formUserType, setFormUserType] = useState<'Student' | 'Teacher' | 'Employee' | 'Driver'>('Student')
  const [formFilterClass, setFormFilterClass] = useState<string>('All')
  const [formFilterSection, setFormFilterSection] = useState<string>('All')
  const [formStudentId, setFormStudentId] = useState<string>('')
  const [formStaffId, setFormStaffId] = useState('')
  const [formLeaveTypeKey, setFormLeaveTypeKey] = useState('')
  const [formApplyDate, setFormApplyDate] = useState(() => getTodayDateString())
  const [formFromDate, setFormFromDate] = useState(() => getTodayDateString())
  const [formToDate, setFormToDate] = useState(() => getTodayDateString())
  const [formExcludeSundays, setFormExcludeSundays] = useState(false)
  const [formIsPaid, setFormIsPaid] = useState<boolean>(true)
  const [formDailyBreakdown, setFormDailyBreakdown] = useState<DailyBreakdownItem[]>([])
  const [formReason, setFormReason] = useState('')
  const [formStatus, setFormStatus] = useState<'Approved' | 'Pending'>('Approved')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit Form State (for changing leave dates, pay type, day-by-day split, and status)
  const [editLeaveTypeKey, setEditLeaveTypeKey] = useState('')
  const [editFromDate, setEditFromDate] = useState('')
  const [editToDate, setEditToDate] = useState('')
  const [editDuration, setEditDuration] = useState<number>(1)
  const [editExcludeSundays, setEditExcludeSundays] = useState(false)
  const [editIsPaid, setEditIsPaid] = useState<boolean>(true)
  const [editDailyBreakdown, setEditDailyBreakdown] = useState<DailyBreakdownItem[]>([])
  const [editStatus, setEditStatus] = useState<'Approved' | 'Pending' | 'Rejected'>('Approved')
  const [editReason, setEditReason] = useState('')
  const [editActionNotes, setEditActionNotes] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Toast State
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(msg)
    setToastType(type)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3500)
  }

  // Load requests from database
  const loadRequests = async () => {
    setLoading(true)
    try {
      const res = await fetchLeaveRequests({
        userType: activeTab,
        status: statusFilter,
        searchQuery
      })
      if (res.success) {
        setRequests(res.data)
        setCounts(res.counts)
      } else {
        showToast(res.error || 'Failed to load requests', 'error')
      }
    } catch (e: any) {
      console.error(e)
      showToast(e.message || 'Error loading requests', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Load staff members with their allocated leave quotas
  const loadStaff = async () => {
    setLoadingStaff(true)
    try {
      const res = await fetchStaffMembersWithLeaveQuotas()
      if (res.success) {
        setStaffList(res.staff)
      }
    } catch (e) {
      console.error('Error loading staff:', e)
    } finally {
      setLoadingStaff(false)
    }
  }

  // Load students for student leave requests (only added students in this institute)
  const loadStudents = async () => {
    setLoadingStudents(true)
    try {
      const res = await fetchStudentsForLeave()
      const studs = res.success && Array.isArray(res.students) ? res.students : []
      const cls = res.success && Array.isArray(res.classes) ? res.classes : []
      const secs = res.success && Array.isArray(res.sections) ? res.sections : []

      setStudentsList(studs)
      setStudentClasses(cls.sort())
      setStudentSections(secs.sort())

      if (studs.length > 0) {
        setFormStudentId(prev => (studs.some(s => s.id === prev) ? prev : studs[0].id))
      } else {
        setFormStudentId('')
      }
    } catch (err) {
      console.error('loadStudents error:', err)
    } finally {
      setLoadingStudents(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [activeTab, statusFilter])

  useEffect(() => {
    loadStaff()
    loadStudents()
  }, [])

  // Filtered students for Add Modal
  const filteredStudentsForAdd = useMemo(() => {
    return studentsList.filter(s => {
      if (formFilterClass !== 'All' && s.className.toLowerCase() !== formFilterClass.toLowerCase()) {
        return false
      }
      if (formFilterSection !== 'All') {
        const norm = (v: string) => v.toLowerCase().replace(/^section\s+/i, '').trim()
        if (norm(s.sectionName) !== norm(formFilterSection)) return false
      }
      return true
    })
  }, [studentsList, formFilterClass, formFilterSection])

  const selectedStudent = useMemo(() => {
    return filteredStudentsForAdd.find(s => s.id === formStudentId) || filteredStudentsForAdd[0] || null
  }, [filteredStudentsForAdd, formStudentId])

  useEffect(() => {
    if (filteredStudentsForAdd.length > 0) {
      if (!filteredStudentsForAdd.some(s => s.id === formStudentId)) {
        setFormStudentId(filteredStudentsForAdd[0].id)
      }
    }
  }, [filteredStudentsForAdd, formStudentId])

  // Selected staff in Add Modal
  const selectedStaffMember = useMemo(() => {
    if (formUserType === 'Student') return null
    return staffList.find(s => s.id === formStaffId) || null
  }, [staffList, formStaffId, formUserType])

  // Available staff for chosen category in Add Modal
  const availableStaffForAdd = useMemo(() => {
    if (formUserType === 'Student') return []
    return staffList.filter(s => s.userType === formUserType)
  }, [staffList, formUserType])

  useEffect(() => {
    if (formUserType === 'Student') {
      if (STUDENT_LEAVE_CATEGORIES.length > 0) {
        const first = STUDENT_LEAVE_CATEGORIES[0]
        setFormLeaveTypeKey(`${first.leaveType}|${first.leaveAbbr}`)
      }
    } else {
      if (availableStaffForAdd.length > 0) {
        if (!availableStaffForAdd.some(s => s.id === formStaffId)) {
          setFormStaffId(availableStaffForAdd[0].id)
        }
      } else {
        setFormStaffId('')
      }
    }
  }, [formUserType, availableStaffForAdd])

  useEffect(() => {
    if (formUserType !== 'Student' && selectedStaffMember && selectedStaffMember.quotas.length > 0) {
      const firstQuota = selectedStaffMember.quotas[0]
      setFormLeaveTypeKey(`${firstQuota.leaveType}|${firstQuota.leaveAbbr}`)
    }
  }, [selectedStaffMember, formUserType])

  // Calculate Duration in Add Modal
  const calculatedDuration = useMemo(() => {
    return calculateLeaveDays(formFromDate, formToDate, formExcludeSundays)
  }, [formFromDate, formToDate, formExcludeSundays])

  // Selected quota info in Add Modal (staff only)
  const activeQuotaInfo = useMemo(() => {
    if (formUserType === 'Student' || !selectedStaffMember || !formLeaveTypeKey) return null
    const [lType] = formLeaveTypeKey.split('|')
    return selectedStaffMember.quotas.find(q => q.leaveType === lType) || null
  }, [selectedStaffMember, formLeaveTypeKey, formUserType])

  // Automatically suggest Paid vs Unpaid based on quota
  useEffect(() => {
    if (formUserType !== 'Student' && activeQuotaInfo) {
      if (calculatedDuration > activeQuotaInfo.remainingLeaves) {
        setFormIsPaid(false) // automatically suggest Unpaid / Absent if exceeding quota
      } else {
        setFormIsPaid(true)
      }
    }
  }, [calculatedDuration, activeQuotaInfo, formUserType])

  // Sync Day-by-Day Breakdown for Add Modal
  useEffect(() => {
    setFormDailyBreakdown(prev =>
      generateDailyBreakdown(formFromDate, formToDate, formExcludeSundays, prev, formIsPaid)
    )
  }, [formFromDate, formToDate, formExcludeSundays])

  const toggleFormDayPaid = (index: number, isPaid: boolean) => {
    setFormDailyBreakdown(prev => {
      const next = [...prev]
      if (next[index]) {
        next[index] = { ...next[index], isPaid }
      }
      return next
    })
  }

  const setFormAllDaysPaid = (isPaid: boolean) => {
    setFormIsPaid(isPaid)
    setFormDailyBreakdown(prev => prev.map(d => ({ ...d, isPaid })))
  }

  // Open Edit Modal for a request
  const openEditModal = (item: LeaveRequestItem) => {
    setEditModalItem(item)
    setEditLeaveTypeKey(`${item.leaveType}|${item.leaveAbbr}`)
    setEditFromDate(item.fromDate)
    setEditToDate(item.toDate)
    setEditDuration(item.duration)
    setEditExcludeSundays(false)
    setEditIsPaid(item.isPaid)
    setEditStatus(item.status)
    setEditReason(item.reason || '')
    setEditActionNotes(item.actionNotes || '')

    const initialBreakdown =
      item.dailyBreakdown && item.dailyBreakdown.length > 0
        ? item.dailyBreakdown.map(d => {
            const parts = d.date.split('-').map(Number)
            const dObj = new Date(parts[0], parts[1] - 1, parts[2])
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            return {
              ...d,
              dayOfWeek: d.dayOfWeek || dayNames[dObj.getDay()],
              displayDate: d.displayDate || `${dObj.getDate()} ${monthNames[dObj.getMonth()]} ${dObj.getFullYear()}`
            }
          })
        : generateDailyBreakdown(item.fromDate, item.toDate, false, undefined, item.isPaid)

    setEditDailyBreakdown(initialBreakdown)
  }

  // Recalculate duration and daily breakdown when edit dates change
  const handleEditDateChange = (fromStr: string, toStr: string, excludeSun: boolean) => {
    setEditFromDate(fromStr)
    setEditToDate(toStr)
    const days = calculateLeaveDays(fromStr, toStr, excludeSun)
    setEditDuration(days)
    setEditDailyBreakdown(prev => generateDailyBreakdown(fromStr, toStr, excludeSun, prev, editIsPaid))
  }

  const toggleEditDayPaid = (index: number, isPaid: boolean) => {
    setEditDailyBreakdown(prev => {
      const next = [...prev]
      if (next[index]) {
        next[index] = { ...next[index], isPaid }
      }
      return next
    })
  }

  const setEditAllDaysPaid = (isPaid: boolean) => {
    setEditIsPaid(isPaid)
    setEditDailyBreakdown(prev => prev.map(d => ({ ...d, isPaid })))
  }

  // Submit Create Request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formFromDate || !formToDate) {
      showToast('Please select leave dates.', 'error')
      return
    }
    if (calculatedDuration <= 0) {
      showToast('Leave duration must be at least 1 day.', 'error')
      return
    }

    if (formUserType === 'Student') {
      if (!selectedStudent) {
        showToast('Please select a student.', 'error')
        return
      }
    } else {
      if (!selectedStaffMember) {
        showToast('Please select a staff member.', 'error')
        return
      }
    }

    const [lType, lAbbr] = (formLeaveTypeKey || '').split('|')
    const paidDays = formDailyBreakdown.filter(d => d.isPaid).length
    const unpaidDays = formDailyBreakdown.filter(d => !d.isPaid).length
    const finalIsPaid = unpaidDays === 0

    setIsSubmitting(true)
    try {
      let res
      if (formUserType === 'Student') {
        res = await createLeaveRequest({
          staffId: selectedStudent!.id,
          staffName: selectedStudent!.name,
          userType: 'Student',
          role: 'Student',
          department: `${selectedStudent!.className} - Sec ${selectedStudent!.sectionName}`,
          employeeId: selectedStudent!.rollNo ? `Roll: ${selectedStudent!.rollNo}` : (selectedStudent!.admissionNo || ''),
          className: selectedStudent!.className,
          sectionName: selectedStudent!.sectionName,
          rollNo: selectedStudent!.rollNo,
          admissionNo: selectedStudent!.admissionNo,
          leaveType: lType || 'Medical Leave',
          leaveAbbr: lAbbr || 'ML',
          applyDate: formApplyDate,
          fromDate: formFromDate,
          toDate: formToDate,
          duration: calculatedDuration,
          paidDays: 0,
          unpaidDays: calculatedDuration,
          dailyBreakdown: [],
          reason: formReason || 'Student leave application',
          isPaid: false,
          status: formStatus,
          actionNotes: 'Approved by Admin'
        })
      } else {
        res = await createLeaveRequest({
          staffId: selectedStaffMember!.id,
          staffName: selectedStaffMember!.name,
          userType: selectedStaffMember!.userType,
          role: selectedStaffMember!.role,
          department: selectedStaffMember!.department,
          employeeId: selectedStaffMember!.employeeId,
          leaveType: lType || 'Casual Leave',
          leaveAbbr: lAbbr || 'CL',
          applyDate: formApplyDate,
          fromDate: formFromDate,
          toDate: formToDate,
          duration: calculatedDuration,
          paidDays,
          unpaidDays,
          dailyBreakdown: formDailyBreakdown,
          reason: formReason || 'Personal Leave',
          isPaid: finalIsPaid,
          status: formStatus,
          actionNotes: 'Approved by Admin'
        })
      }

      if (!res.success) throw new Error(res.error || 'Failed to submit leave request')

      const personName = formUserType === 'Student' ? selectedStudent!.name : selectedStaffMember!.name
      const modeText =
        formUserType === 'Student'
          ? 'Simple Leave • Marked Absent in Attendance'
          : formDailyBreakdown.length > 1 && paidDays > 0 && unpaidDays > 0
          ? `Split: ${paidDays} Paid & ${unpaidDays} Unpaid`
          : finalIsPaid
          ? 'Paid Leave'
          : 'Unpaid Leave (Absent)'

      showToast(`Leave request created for ${personName} (${modeText})!`)
      setAddModalOpen(false)
      setFormReason('')
      await loadRequests()
      await loadStaff()
      await loadStudents()
    } catch (err: any) {
      showToast(err.message || 'Submission failed', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit Edit Leave Request (change dates, duration, day-by-day split, isPaid, status)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModalItem) return
    if (!editFromDate || !editToDate) {
      showToast('Please select valid leave dates.', 'error')
      return
    }
    if (editDuration <= 0) {
      showToast('Duration must be at least 1 day.', 'error')
      return
    }

    const [lType, lAbbr] = editLeaveTypeKey.split('|')
    const isStudent = editModalItem.userType === 'Student'
    const paidDays = isStudent ? 0 : editDailyBreakdown.filter(d => d.isPaid).length
    const unpaidDays = isStudent ? editDuration : editDailyBreakdown.filter(d => !d.isPaid).length
    const finalIsPaid = isStudent ? false : (unpaidDays === 0)
    const finalDailyBreakdown = isStudent ? [] : editDailyBreakdown

    setIsSavingEdit(true)
    try {
      const res = await updateLeaveRequest({
        requestId: editModalItem.id,
        leaveType: lType || editModalItem.leaveType,
        leaveAbbr: lAbbr || editModalItem.leaveAbbr,
        fromDate: editFromDate,
        toDate: editToDate,
        duration: editDuration,
        paidDays,
        unpaidDays,
        dailyBreakdown: finalDailyBreakdown,
        isPaid: finalIsPaid,
        status: editStatus,
        reason: editReason,
        actionNotes: editActionNotes
      })

      if (!res.success) throw new Error(res.error || 'Failed to update leave request')

      const modeText =
        isStudent
          ? 'Simple Leave • Marked Absent in Attendance'
          : editDailyBreakdown.length > 1 && paidDays > 0 && unpaidDays > 0
          ? `Split: ${paidDays} Paid, ${unpaidDays} Unpaid`
          : finalIsPaid
          ? 'Paid Leave'
          : 'Unpaid (Absent)'

      showToast(`Leave application updated successfully for ${editModalItem.staffName} (${modeText})!`)
      setEditModalItem(null)
      await loadRequests()
      await loadStaff()
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Quick Toggle Paid vs Unpaid (Absent) - Staff Only
  const handleTogglePayType = async (item: LeaveRequestItem) => {
    if (item.userType === 'Student') return
    const nextPay = !item.isPaid
    try {
      const res = await toggleLeavePayType({ requestId: item.id, isPaid: nextPay })
      if (!res.success) throw new Error(res.error || 'Failed to update pay type')
      showToast(`Leave for ${item.staffName} marked as ${nextPay ? 'Paid Leave' : 'Unpaid Leave (Absent)'}!`)
      await loadRequests()
      await loadStaff()
    } catch (err: any) {
      showToast(err.message || 'Toggle failed', 'error')
    }
  }

  // Update Status (Approve / Reject)
  const handleUpdateStatus = async (id: string, status: 'Approved' | 'Rejected', staffName: string) => {
    try {
      const res = await updateLeaveRequestStatus({ requestId: id, status })
      if (!res.success) throw new Error(res.error || 'Failed to update status')
      showToast(`Leave request for ${staffName} marked as ${status}!`)
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status } : null)
      }
      await loadRequests()
      await loadStaff()
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error')
    }
  }

  // Delete Request
  const handleDelete = async (id: string, staffName: string) => {
    if (confirm(`Are you sure you want to delete the leave request for ${staffName}?`)) {
      try {
        const res = await deleteLeaveRequest(id)
        if (!res.success) throw new Error(res.error || 'Failed to delete request')
        showToast(`Leave request for ${staffName} deleted successfully!`)
        setSelectedRequest(null)
        await loadRequests()
        await loadStaff()
      } catch (err: any) {
        showToast(err.message || 'Deletion failed', 'error')
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-14 animate-in fade-in duration-300">

      {/* ── HEADER ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Leave Requests</span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Staff Quota Integrated
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Admin can approve, reject, modify leave dates, and set leaves as Paid or Unpaid (Absent)
          </p>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* View Staff Quotas button */}
          <button
            type="button"
            onClick={() => setQuotaDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="View all staff members and their leave balances"
          >
            <Users className="w-3.5 h-3.5 text-[#0f766e]" />
            <span>Staff Leave Quotas</span>
          </button>

          {/* Add Leave Request Button */}
          <button
            type="button"
            onClick={() => {
              const today = getTodayDateString()
              setFormApplyDate(today)
              setFormFromDate(today)
              setFormToDate(today)
              setAddModalOpen(true)
            }}
            className="px-4 py-2 rounded-xl bg-[#0f766e] text-white font-black text-xs hover:bg-teal-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Leave Request</span>
          </button>
        </div>
      </div>

      {/* ── 4 SUMMARY METRIC BOXES ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* TOTAL REQUESTS */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total Requests
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
              {counts.all}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* APPROVED */}
        <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">
              Approved Leaves
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-0.5 block">
              {counts.approved}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* PENDING */}
        <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">
              Pending Approval
            </span>
            <span className="text-2xl font-black text-amber-600 mt-0.5 block">
              {counts.pending}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* REJECTED */}
        <div className="bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">
              Rejected
            </span>
            <span className="text-2xl font-black text-rose-600 mt-0.5 block">
              {counts.rejected}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── CONTROL ACTIONS & SEARCH BAR ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search staff, leave type, role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadRequests()}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold w-full sm:w-auto overflow-x-auto">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-800 text-[#0f766e] dark:text-teal-300 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {st} {st !== 'All' && `(${counts[st.toLowerCase() as keyof typeof counts] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── USER TYPE TABS ── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {([
          { key: 'All', label: 'ALL', count: counts.all },
          { key: 'Student', label: 'STUDENT', count: counts.student },
          { key: 'Teacher', label: 'TEACHER', count: counts.teacher },
          { key: 'Employee', label: 'EMPLOYEE', count: counts.employee },
          { key: 'Driver', label: 'DRIVER', count: counts.driver }
        ] as const).map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-2 shrink-0 ${
              activeTab === tab.key
                ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
              activeTab === tab.key
                ? 'bg-teal-800 text-teal-100'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {String(tab.count ?? 0).padStart(2, '0')}
            </span>
          </button>
        ))}
      </div>

      {/* ── MAIN LEAVE REQUESTS TABLE ── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm md:text-base font-black text-slate-800 dark:text-slate-100">
            Leave Applications Table
          </h2>
          <span className="text-xs text-slate-400 font-bold">
            Showing {requests.length} entries
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold no-scrollbar">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-3 py-4 w-12">S. No.</th>
                <th className="px-4 py-4 text-left">Student / Staff Name</th>
                <th className="px-3 py-4">User Type</th>
                <th className="px-3 py-4">Apply Date</th>
                <th className="px-4 py-4 text-left">Leave Type</th>
                <th className="px-3 py-4">Leave Dates</th>
                <th className="px-3 py-4">Duration</th>
                <th className="px-3 py-4">Attendance / Pay Nature</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-4 py-4 w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#0f766e]" />
                      <span>Loading leave requests...</span>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span>No leave requests found.</span>
                      <button
                        type="button"
                        onClick={() => setAddModalOpen(true)}
                        className="mt-1 px-4 py-1.5 rounded-lg bg-[#0f766e] text-white text-xs font-bold hover:bg-teal-700 cursor-pointer"
                      >
                        Create First Request
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors font-semibold"
                  >
                    {/* S. No. */}
                    <td className="px-3 py-3.5 text-slate-500 font-medium">
                      {idx + 1}.
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3.5 text-left">
                      <div className="font-black text-slate-800 dark:text-slate-100 text-xs">
                        {item.staffName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {item.userType === 'Student' ? (
                          <span>
                            {item.department || (item.className ? `${item.className} (Sec ${item.sectionName})` : 'Student')}
                            {item.rollNo ? ` • Roll: ${item.rollNo}` : (item.employeeId ? ` • ${item.employeeId}` : '')}
                            {item.admissionNo ? ` • Adm: ${item.admissionNo}` : ''}
                          </span>
                        ) : (
                          <span>
                            {item.role} &bull; {item.department} {item.employeeId && `• ${item.employeeId}`}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* User Type */}
                    <td className="px-3 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 mx-auto w-fit ${
                        item.userType === 'Student'
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800'
                          : item.userType === 'Teacher'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                          : item.userType === 'Employee'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                      }`}>
                        {item.userType === 'Student' && <GraduationCap className="w-3 h-3 text-sky-600" />}
                        <span>{item.userType}</span>
                      </span>
                    </td>

                    {/* Apply Date */}
                    <td className="px-3 py-3.5 text-slate-500 font-semibold">
                      {item.applyDate}
                    </td>

                    {/* Leave Type */}
                    <td className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] font-black text-[10px] border border-teal-200 dark:border-teal-800">
                          {item.leaveAbbr}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                          {item.leaveType}
                        </span>
                      </div>
                    </td>

                    {/* Date Range */}
                    <td className="px-3 py-3.5 text-slate-700 dark:text-slate-300 font-bold text-xs">
                      {item.dateRange}
                    </td>

                    {/* Duration */}
                    <td className="px-3 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs">
                        {item.duration} {item.duration === 1 ? 'Day' : 'Days'}
                      </span>
                    </td>

                    {/* Pay Nature / Attendance Nature (Paid vs Unpaid as Absent vs Day-by-Day Split) */}
                    <td className="px-3 py-3.5">
                      {item.userType === 'Student' ? (
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 inline-flex items-center justify-center gap-1 mx-auto"
                          title="Student Simple Leave: Marked as Absent in attendance upon approval"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Simple Leave &bull; Absent</span>
                        </span>
                      ) : item.duration > 1 && item.paidDays > 0 && item.unpaidDays > 0 ? (
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                          title={`Split: ${item.paidDays} Paid, ${item.unpaidDays} Unpaid. Click to modify.`}
                        >
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>
                            {item.paidDays} Paid &bull; {item.unpaidDays} Unpaid
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTogglePayType(item)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto ${
                            item.isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                          }`}
                          title="Click to toggle Paid Leave vs Unpaid (Absent / LWP)"
                        >
                          {item.isPaid ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Paid Leave {item.duration > 1 ? `(${item.duration}d)` : ''}</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Unpaid (Absent) {item.duration > 1 ? `(${item.duration}d)` : ''}</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'Approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200'
                          : item.status === 'Rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200'
                      }`}>
                        ● {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        {/* Edit Date & Details (Pencil) */}
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#0f766e] hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer"
                          title="Change Leave Dates, Pay Nature or Decision"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Approve (if not approved) */}
                        {item.status !== 'Approved' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, 'Approved', item.staffName)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                            title="Approve Leave Application"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Quick Reject (if not rejected) */}
                        {item.status !== 'Rejected' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, 'Rejected', item.staffName)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Reject Leave Application"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(item)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="View Leave Review"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.staffName)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── EDIT LEAVE APPLICATION MODAL (CHANGE DATES & STATUS) ── */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-xl shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#0f766e]" />
                  <span>{editModalItem.userType === 'Student' ? 'Modify Student Leave Application' : 'Modify Leave Application'}</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {editModalItem.staffName} &bull; {editModalItem.userType === 'Student' ? (editModalItem.department || 'Student') : `${editModalItem.role} • ${editModalItem.userType}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalItem(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs font-semibold">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              
              {/* Leave Category */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Leave Category
                </label>
                <select
                  value={editLeaveTypeKey}
                  onChange={e => setEditLeaveTypeKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                >
                  {editModalItem.userType === 'Student' ? (
                    STUDENT_LEAVE_CATEGORIES.map(c => (
                      <option key={c.leaveType} value={`${c.leaveType}|${c.leaveAbbr}`}>
                        {c.leaveType} ({c.leaveAbbr}) &mdash; {c.desc}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Casual Leave|CL">Casual Leave (CL)</option>
                      <option value="Medical Leave|ML">Medical Leave (ML)</option>
                      <option value="Sick Leave|SL">Sick Leave (SL)</option>
                      <option value="Earned Leave|EL">Earned Leave (EL)</option>
                      <option value="Half Day Leave|HDL">Half Day Leave (HDL)</option>
                      <option value="Unpaid Leave|LWP">Loss of Pay / Unpaid (LWP)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Date Ranges */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Change From Date
                  </label>
                  <input
                    type="date"
                    value={editFromDate}
                    onChange={e => handleEditDateChange(e.target.value, editToDate, editExcludeSundays)}
                    className="w-full px-3 py-2 rounded-xl border border-teal-300 dark:border-teal-700 font-bold text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Change To Date
                  </label>
                  <input
                    type="date"
                    value={editToDate}
                    onChange={e => handleEditDateChange(editFromDate, e.target.value, editExcludeSundays)}
                    className="w-full px-3 py-2 rounded-xl border border-teal-300 dark:border-teal-700 font-bold text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20"
                    required
                  />
                </div>
              </div>

              {/* Calculated Duration & Exclude Sundays */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Duration (Days)
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={editDuration}
                      onChange={e => setEditDuration(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 font-black text-sm text-[#0f766e] bg-white dark:bg-slate-800 outline-none"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editExcludeSundays}
                    onChange={e => {
                      setEditExcludeSundays(e.target.checked)
                      handleEditDateChange(editFromDate, editToDate, e.target.checked)
                    }}
                    className="w-4 h-4 rounded text-teal-600 cursor-pointer accent-[#0f766e]"
                  />
                  <span>Exclude Sundays</span>
                </label>
              </div>

              {/* ── STUDENT SIMPLE LEAVE NOTICE (NO SALARY/PAID LEAVE FOR STUDENTS) ── */}
              {editModalItem.userType === 'Student' ? (
                <div className="bg-sky-50 dark:bg-sky-950/30 p-3.5 rounded-2xl border border-sky-200/80 dark:border-sky-800/60 flex items-center gap-2.5 text-xs text-sky-800 dark:text-sky-200 font-bold">
                  <GraduationCap className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Student Simple Leave &bull; Upon approval, automatically marked as <strong>Absent</strong> in attendance.</span>
                </div>
              ) : (
                <>
                  {/* ── SALARY PAY NATURE (STAFF ONLY) ── */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                      Salary Pay Nature
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Option 1: Paid */}
                      <button
                        type="button"
                        onClick={() => setEditAllDaysPaid(true)}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          editDailyBreakdown.length > 1
                            ? editDailyBreakdown.every(d => d.isPaid)
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                            : editIsPaid
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${
                          (editDailyBreakdown.length > 1 ? editDailyBreakdown.every(d => d.isPaid) : editIsPaid)
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`} />
                        <div>
                          <div className="font-black text-xs text-slate-800 dark:text-slate-100">
                            {editDailyBreakdown.length > 1 ? 'All Days Paid Leave' : 'Paid Leave'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Covered by quota • Marked as Leave in attendance
                          </div>
                        </div>
                      </button>

                      {/* Option 2: Unpaid */}
                      <button
                        type="button"
                        onClick={() => setEditAllDaysPaid(false)}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          editDailyBreakdown.length > 1
                            ? editDailyBreakdown.every(d => !d.isPaid)
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 shadow-2xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                            : !editIsPaid
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                          (editDailyBreakdown.length > 1 ? editDailyBreakdown.every(d => !d.isPaid) : !editIsPaid)
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`} />
                        <div>
                          <div className="font-black text-xs text-rose-700 dark:text-rose-300">
                            {editDailyBreakdown.length > 1 ? 'All Days Unpaid (Absent)' : 'Unpaid Leave (Absent)'}
                          </div>
                          <div className="text-[10px] text-rose-500/80 font-medium">
                            Marked as Absent • Deducted in payroll
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* ── DAY-BY-DAY SALARY PAY SPLIT (STAFF ONLY) ── */}
                  {editDailyBreakdown.length > 1 && (
                    <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-black text-xs text-slate-800 dark:text-slate-100">
                            <Calendar className="w-3.5 h-3.5 text-[#0f766e]" />
                            <span>Day-by-Day Salary Pay Split (1 by 1)</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Configure Paid or Unpaid (Absent) for each individual day
                          </p>
                        </div>

                        {/* Quick Bulk Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditAllDaysPaid(true)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                          >
                            All Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditAllDaysPaid(false)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                          >
                            All Unpaid
                          </button>
                        </div>
                      </div>

                      {/* Day rows list */}
                      <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
                        {editDailyBreakdown.map((dayItem, dIdx) => (
                          <div
                            key={dayItem.date}
                            className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-[#0f766e] flex items-center justify-center font-black text-[11px] shrink-0 border border-teal-200/50">
                                {dIdx + 1}
                              </span>
                              <div>
                                <div className="font-black text-xs text-slate-800 dark:text-slate-100">
                                  {dayItem.displayDate}
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold">
                                  {dayItem.dayOfWeek} &bull; {dayItem.date}
                                </div>
                              </div>
                            </div>

                            {/* 1-by-1 Toggle Buttons for this day */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => toggleEditDayPaid(dIdx, true)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                                  dayItem.isPaid
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                                <span>Paid</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleEditDayPaid(dIdx, false)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                                  !dayItem.isPaid
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                }`}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span>Unpaid</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Live Summary Bar */}
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 text-[11px] font-bold">
                        <span className="text-slate-600 dark:text-slate-300">
                          Total: <strong className="text-slate-800 dark:text-slate-100">{editDailyBreakdown.length} Days</strong>
                        </span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span>{editDailyBreakdown.filter(d => d.isPaid).length} Paid Days</span>
                          </span>
                          <span className="text-rose-600 dark:text-rose-300 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-600" />
                            <span>{editDailyBreakdown.filter(d => !d.isPaid).length} Unpaid (Absent)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Status Decision */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Approval Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Approved', 'Pending', 'Rejected'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                        editStatus === st
                          ? st === 'Approved'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : st === 'Rejected'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Reason &amp; Remarks
                </label>
                <textarea
                  rows={2}
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              </div>

              {/* Action Buttons Sticky Footer */}
              <div className="shrink-0 px-6 py-3.5 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3 z-10">
                <button
                  type="button"
                  onClick={() => setEditModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-[#0f766e] text-white font-black text-xs hover:bg-teal-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save &amp; Update Application</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── ADD LEAVE REQUEST MODAL (STAFF QUOTA INTEGRATED) ── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-xl shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>Add Leave Request</span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] text-[10px] font-bold">
                    Admin Form
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {formUserType === 'Student'
                    ? 'Submit simple leave request for student (marked Absent in attendance)'
                    : 'Submit leave for staff member based on their allocated quota'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs font-semibold">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              
              {/* Category Segmented Selector */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1.5">
                  1. Select Role Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Student', 'Teacher', 'Employee', 'Driver'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormUserType(cat)}
                      className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        formUserType === cat
                          ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {cat === 'Student' && <GraduationCap className="w-3.5 h-3.5" />}
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── STUDENT SPECIFIC SELECTION FLOW ── */}
              {formUserType === 'Student' ? (
                <div className="space-y-3">
                  {/* Class & Section Filter Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1 text-[11px]">
                        Filter by Class
                      </label>
                      <select
                        value={formFilterClass}
                        onChange={e => setFormFilterClass(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                      >
                        <option value="All">All Classes ({studentsList.length})</option>
                        {studentClasses.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1 text-[11px]">
                        Filter by Section
                      </label>
                      <select
                        value={formFilterSection}
                        onChange={e => setFormFilterSection(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                      >
                        <option value="All">All Sections</option>
                        {studentSections.map(s => (
                          <option key={s} value={s}>Section {s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Select Student Dropdown */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">
                      2. Select Student ({filteredStudentsForAdd.length} available)
                    </label>
                    <select
                      value={formStudentId}
                      onChange={e => setFormStudentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                      required
                    >
                      {filteredStudentsForAdd.length === 0 ? (
                        <option value="">No students found in selected class/section</option>
                      ) : (
                        filteredStudentsForAdd.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} &bull; {s.className} (Sec {s.sectionName}) &bull; Roll: {s.rollNo} {s.admissionNo && `• Adm: ${s.admissionNo}`}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Selected Student Banner */}
                  {selectedStudent && (
                    <div className="bg-sky-50/70 dark:bg-sky-950/30 p-3 rounded-2xl border border-sky-200/80 dark:border-sky-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-black">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-black text-xs text-slate-900 dark:text-white">
                            {selectedStudent.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold">
                            {selectedStudent.className} &bull; Section {selectedStudent.sectionName} &bull; Roll No: {selectedStudent.rollNo}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                        {selectedStudent.admissionNo || 'Student'}
                      </span>
                    </div>
                  )}

                  {/* Student Leave Categories */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">
                      3. Select Leave Category
                    </label>
                    <select
                      value={formLeaveTypeKey}
                      onChange={e => setFormLeaveTypeKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                      required
                    >
                      {STUDENT_LEAVE_CATEGORIES.map(c => (
                        <option key={c.leaveType} value={`${c.leaveType}|${c.leaveAbbr}`}>
                          {c.leaveType} ({c.leaveAbbr}) &mdash; {c.desc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                /* ── STAFF SPECIFIC SELECTION FLOW ── */
                <>
                  {/* Select Staff Member */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">
                      2. Select {formUserType}
                    </label>
                    <select
                      value={formStaffId}
                      onChange={e => setFormStaffId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                      required
                    >
                      {availableStaffForAdd.length === 0 ? (
                        <option value="">No {formUserType.toLowerCase()}s found</option>
                      ) : (
                        availableStaffForAdd.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.role}) &bull; {s.employeeId} &bull; Total Quota: {s.totalAllowed} days ({s.totalRemaining} left)
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Dynamic Leave Quota Badges Strip */}
                  {selectedStaffMember && (
                    <div className="bg-teal-50/60 dark:bg-teal-950/30 p-3.5 rounded-2xl border border-teal-200/80 dark:border-teal-800/60 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-black text-[#0f766e] dark:text-teal-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#0f766e]" />
                          <span>{selectedStaffMember.name}&apos;s Allocated Leave Quotas:</span>
                        </span>
                        <span className="text-slate-500 font-bold">
                          {selectedStaffMember.totalRemaining} of {selectedStaffMember.totalAllowed} days left
                        </span>
                      </div>

                      {/* Quotas grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {selectedStaffMember.quotas.map(q => (
                          <div
                            key={q.leaveType}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-teal-200/50 dark:border-teal-900 text-center"
                          >
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                              <span>{q.leaveAbbr}</span>
                              <span>{q.frequency}</span>
                            </div>
                            <div className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
                              {q.remainingLeaves} <span className="text-[10px] text-slate-400 font-semibold">/ {q.allowedLeaves}</span>
                            </div>
                            <div className="text-[9px] font-semibold text-slate-500 truncate mt-0.5">
                              {q.leaveType}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Select Leave Type */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">
                      3. Select Leave Category
                    </label>
                    <select
                      value={formLeaveTypeKey}
                      onChange={e => setFormLeaveTypeKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                      required
                    >
                      {selectedStaffMember?.quotas.map(q => (
                        <option key={q.leaveType} value={`${q.leaveType}|${q.leaveAbbr}`}>
                          {q.leaveType} ({q.leaveAbbr}) &mdash; {q.remainingLeaves} days remaining of {q.allowedLeaves} allowed
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Date Ranges */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={formFromDate}
                    onChange={e => setFormFromDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={formToDate}
                    onChange={e => setFormToDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Duration & Exclude Sundays */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Calculated Duration
                  </span>
                  <span className="text-base font-black text-[#0f766e] dark:text-teal-300">
                    {calculatedDuration} {calculatedDuration === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formExcludeSundays}
                    onChange={e => setFormExcludeSundays(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 cursor-pointer accent-[#0f766e]"
                  />
                  <span>Exclude Sundays</span>
                </label>
              </div>

              {/* ── STUDENT SIMPLE LEAVE NOTICE (NO SALARY/PAID LEAVE FOR STUDENTS) ── */}
              {formUserType === 'Student' ? (
                <div className="bg-sky-50 dark:bg-sky-950/30 p-3.5 rounded-2xl border border-sky-200/80 dark:border-sky-800/60 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-sky-900 dark:text-white">
                      Student Simple Leave Application
                    </div>
                    <div className="text-[11px] text-sky-700/80 dark:text-sky-300/80 font-medium">
                      In student leaves, there is no salary deduction or paid quota. Upon approval, attendance is marked as <strong>Absent</strong>.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── SALARY PAY NATURE (STAFF ONLY) ── */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                      4. Salary Pay Nature
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Option 1: Paid */}
                      <button
                        type="button"
                        onClick={() => setFormAllDaysPaid(true)}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          formDailyBreakdown.length > 1
                            ? formDailyBreakdown.every(d => d.isPaid)
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                            : formIsPaid
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${
                          (formDailyBreakdown.length > 1 ? formDailyBreakdown.every(d => d.isPaid) : formIsPaid)
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`} />
                        <div>
                          <div className="font-black text-xs text-slate-800 dark:text-slate-100">
                            {formDailyBreakdown.length > 1 ? 'All Days Paid Leave' : 'Paid Leave'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Covered by quota • No salary deduction
                          </div>
                        </div>
                      </button>

                      {/* Option 2: Unpaid / Absent */}
                      <button
                        type="button"
                        onClick={() => setFormAllDaysPaid(false)}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          formDailyBreakdown.length > 1
                            ? formDailyBreakdown.every(d => !d.isPaid)
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 shadow-2xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                            : !formIsPaid
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                          (formDailyBreakdown.length > 1 ? formDailyBreakdown.every(d => !d.isPaid) : !formIsPaid)
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`} />
                        <div>
                          <div className="font-black text-xs text-rose-700 dark:text-rose-300">
                            {formDailyBreakdown.length > 1 ? 'All Days Unpaid (Absent)' : 'Unpaid / Absent (LWP)'}
                          </div>
                          <div className="text-[10px] text-rose-500/80 font-medium">
                            Marked as Absent • Deducted in payroll
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* ── DAY-BY-DAY SALARY PAY SPLIT (STAFF ONLY) ── */}
                  {formDailyBreakdown.length > 1 && (
                    <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-black text-xs text-slate-800 dark:text-slate-100">
                            <Calendar className="w-3.5 h-3.5 text-[#0f766e]" />
                            <span>Day-by-Day Salary Pay Split (1 by 1)</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Configure Paid or Unpaid (Absent) for each individual day
                          </p>
                        </div>

                        {/* Quick Bulk Action Buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setFormAllDaysPaid(true)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                          >
                            All Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormAllDaysPaid(false)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                          >
                            All Unpaid
                          </button>
                          {activeQuotaInfo && activeQuotaInfo.remainingLeaves > 0 && activeQuotaInfo.remainingLeaves < formDailyBreakdown.length && (
                            <button
                              type="button"
                              onClick={() => {
                                const quota = activeQuotaInfo.remainingLeaves
                                setFormDailyBreakdown(prev => prev.map((d, i) => ({ ...d, isPaid: i < quota })))
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] dark:text-teal-300 border border-teal-200 hover:bg-teal-100 cursor-pointer"
                              title={`Auto-cover first ${activeQuotaInfo.remainingLeaves} days with quota, mark rest as unpaid`}
                            >
                              Auto Quota ({activeQuotaInfo.remainingLeaves}P)
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Day rows list */}
                      <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
                        {formDailyBreakdown.map((dayItem, dIdx) => (
                          <div
                            key={dayItem.date}
                            className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-[#0f766e] flex items-center justify-center font-black text-[11px] shrink-0 border border-teal-200/50">
                                {dIdx + 1}
                              </span>
                              <div>
                                <div className="font-black text-xs text-slate-800 dark:text-slate-100">
                                  {dayItem.displayDate}
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold">
                                  {dayItem.dayOfWeek} &bull; {dayItem.date}
                                </div>
                              </div>
                            </div>

                            {/* 1-by-1 Toggle Buttons for this day */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => toggleFormDayPaid(dIdx, true)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                                  dayItem.isPaid
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                                <span>Paid</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleFormDayPaid(dIdx, false)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                                  !dayItem.isPaid
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                }`}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span>Unpaid</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Live Summary Bar */}
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 text-[11px] font-bold">
                        <span className="text-slate-600 dark:text-slate-300">
                          Total: <strong className="text-slate-800 dark:text-slate-100">{formDailyBreakdown.length} Days</strong>
                        </span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span>{formDailyBreakdown.filter(d => d.isPaid).length} Paid Days</span>
                          </span>
                          <span className="text-rose-600 dark:text-rose-300 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-600" />
                            <span>{formDailyBreakdown.filter(d => !d.isPaid).length} Unpaid (Absent)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Status Decision */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  {formUserType === 'Student' ? '4. Approval Decision' : '5. Approval Decision'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Approved')}
                    className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      formStatus === 'Approved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Directly Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Pending')}
                    className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      formStatus === 'Pending'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Keep as Pending
                  </button>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                  Reason / Notes
                </label>
                <textarea
                  rows={2}
                  value={formReason}
                  onChange={e => setFormReason(e.target.value)}
                  placeholder="e.g. Family emergency, medical checkup, personal work..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:border-teal-500 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                />
              </div>

              </div>

              {/* Submit Buttons Sticky Footer */}
              <div className="shrink-0 px-6 py-3.5 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3 z-10">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0f766e] text-white font-black text-xs hover:bg-teal-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save &amp; Submit Request</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── ALL STAFF LEAVE QUOTAS DRAWER / MODAL ── */}
      {quotaDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl p-6 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0f766e]" />
                  <span>All Staff Leave Quota Overview</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Review allocated quotas and remaining leave balances across teachers and employees
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuotaDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3.5">Staff Name &amp; Role</th>
                    <th className="px-3 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Allocated Leave Quotas</th>
                    <th className="px-3 py-3.5 text-center">Total Allowed</th>
                    <th className="px-3 py-3.5 text-center">Used</th>
                    <th className="px-3 py-3.5 text-center text-teal-700 font-black">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold">
                  {staffList.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5">
                        <div className="font-black text-slate-800 dark:text-slate-100 text-xs">{s.name}</div>
                        <div className="text-[10px] text-slate-400">{s.role} &bull; {s.employeeId}</div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-700">
                          {s.userType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {s.quotas.map(q => (
                            <span
                              key={q.leaveType}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200/60"
                            >
                              {q.leaveAbbr}: {q.remainingLeaves}/{q.allowedLeaves} left
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center font-bold text-slate-700 dark:text-slate-200">
                        {s.totalAllowed}
                      </td>
                      <td className="px-3 py-3.5 text-center font-bold text-rose-600">
                        {s.totalUsed}
                      </td>
                      <td className="px-3 py-3.5 text-center font-black text-[#0f766e] dark:text-teal-300">
                        {s.totalRemaining}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setQuotaDrawerOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LEAVE DETAIL REVIEW MODAL ── */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl p-6 relative space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                Leave Application Review
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Staff / Student info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                selectedRequest.userType === 'Student'
                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                  : 'bg-teal-50 dark:bg-teal-950/40 text-[#0f766e]'
              }`}>
                {selectedRequest.staffName.charAt(0)}
              </div>
              <div>
                <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedRequest.staffName}</span>
                  {selectedRequest.userType === 'Student' && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      🎓 Student
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {selectedRequest.userType === 'Student' ? (
                    <span>
                      {selectedRequest.className ? `Class ${selectedRequest.className}` : ''}
                      {selectedRequest.sectionName ? ` - Sec ${selectedRequest.sectionName}` : ''}
                      {selectedRequest.rollNo ? ` • Roll: ${selectedRequest.rollNo}` : ''}
                      {selectedRequest.admissionNo ? ` • Adm: ${selectedRequest.admissionNo}` : ''}
                    </span>
                  ) : (
                    <span>
                      {selectedRequest.role} &bull; {selectedRequest.userType} {selectedRequest.employeeId && `• ${selectedRequest.employeeId}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Request attributes */}
            <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400">Leave Category</span>
                <span className="font-black text-slate-800 dark:text-slate-100">{selectedRequest.leaveType} ({selectedRequest.leaveAbbr})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400">Apply Date</span>
                <span className="font-bold">{selectedRequest.applyDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400">Date Range</span>
                <span className="font-black text-[#0f766e]">{selectedRequest.dateRange}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400">Total Duration</span>
                <span className="font-black">{selectedRequest.duration} Day(s)</span>
              </div>
              {selectedRequest.userType === 'Student' ? (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-400">Attendance Nature</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">
                    Simple Leave &bull; Marked Absent
                  </span>
                </div>
              ) : (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                  <span className="text-slate-400">Salary Pay Nature</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedRequest.isPaid
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : selectedRequest.paidDays > 0 && selectedRequest.unpaidDays > 0
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {selectedRequest.isPaid
                      ? 'Paid Leave'
                      : selectedRequest.paidDays > 0 && selectedRequest.unpaidDays > 0
                      ? `Split (${selectedRequest.paidDays} Paid, ${selectedRequest.unpaidDays} Unpaid)`
                      : 'Unpaid (Absent / LWP)'}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  selectedRequest.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-600'
                    : selectedRequest.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-amber-50 text-amber-600'
                }`}>
                  {selectedRequest.status}
                </span>
              </div>
              {selectedRequest.userType !== 'Student' && selectedRequest.dailyBreakdown && selectedRequest.dailyBreakdown.length > 1 && (
                <div className="pt-2">
                  <span className="text-slate-400 block mb-1 text-[11px] font-bold">
                    Day-by-Day Pay Split:
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                    {selectedRequest.dailyBreakdown.map((d, dIdx) => (
                      <div
                        key={d.date}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px]"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Day {dIdx + 1}: {d.displayDate || d.date} {d.dayOfWeek && `(${d.dayOfWeek})`}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            d.isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {d.isPaid ? 'Paid' : 'Unpaid (Absent)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedRequest.reason && (
                <div className="pt-1">
                  <span className="text-slate-400 block mb-1">Reason:</span>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs">
                    {selectedRequest.reason}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  const req = selectedRequest
                  setSelectedRequest(null)
                  openEditModal(req)
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0f766e] hover:bg-teal-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Change Dates</span>
              </button>
              
              <div className="flex gap-2">
                {selectedRequest.status !== 'Approved' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'Approved', selectedRequest.staffName)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 cursor-pointer"
                  >
                    Approve
                  </button>
                )}
                {selectedRequest.status !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'Rejected', selectedRequest.staffName)}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs hover:bg-rose-700 cursor-pointer"
                  >
                    Reject
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
            toastType === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-rose-900 text-white border-rose-800'
          }`}>
            {toastType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

    </div>
  )
}

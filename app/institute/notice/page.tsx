'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  FileText,
  X,
  CheckCircle2,
  Bell,
  Calendar,
  Clock,
  Users,
  Send,
  Upload,
  Paperclip,
  Eye,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Radio,
  Check,
  Building,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react'
import { getInstituteAddedClasses, MasterClassWithSections } from '@/lib/institute-classes'

interface NoticeRecord {
  id: string | number
  subjectTitle: string
  subjectCategory?: string
  sentToUser: number
  message: string
  priority?: 'Normal' | 'Important' | 'Urgent' | string
  scheduleAt: string
  scheduleDate?: string
  scheduleTime?: string
  isScheduled?: boolean
  recipientsType?: string
  targetAudience?: any
  hasFile?: boolean
  files?: boolean
  fileName?: string
  fileUrl?: string
  createdAt: string
}

// Pre-defined common school notice subjects & template suggestions
const PRESET_SUBJECTS = [
  {
    category: 'Holiday Announcement',
    label: '📅 Holiday Announcement (Festival / Break)',
    subject: 'Holiday Announcement - School Closed',
    defaultMessage:
      'Dear Parents and Students, The school will remain closed on [Date] on account of [Occasion/Festival]. Regular classes will resume as per normal schedule on the next working day.'
  },
  {
    category: 'Exam Schedule',
    label: '📝 Examination Schedule & Admit Cards Notice',
    subject: 'Upcoming Examination Schedule & Date Sheet',
    defaultMessage:
      'Dear Students and Parents, The date sheet for the upcoming term examinations has been released on the school portal. All students must bring their Admit Cards and school ID.'
  },
  {
    category: 'Fee Reminder',
    label: '💰 Tuition & Transport Fee Due Reminder',
    subject: 'Quarterly School Fee Clearance Reminder',
    defaultMessage:
      'Dear Parents, Kindly ensure all pending tuition and transport dues for the current quarter are cleared by [Due Date] to avoid late fine charges. Disregard if already paid.'
  },
  {
    category: 'PTM Meeting',
    label: '👨‍👩‍👧 Parent-Teacher Meeting (PTM) Invitation',
    subject: 'Parent-Teacher Meeting (PTM) Invitation',
    defaultMessage:
      'Dear Parents, You are cordially invited to attend the Parent-Teacher Meeting on Saturday between 8:30 AM to 12:30 PM to discuss your child\'s academic growth and term performance.'
  },
  {
    category: 'Weather & Timing',
    label: '⏰ School Timing Change / Weather Advisory',
    subject: 'Revision in School Timings & Winter Schedule',
    defaultMessage:
      'Dear Parents, Due to changing weather conditions, the school morning reporting time is revised to 8:30 AM effective from [Date]. Please plan your drop-off accordingly.'
  },
  {
    category: 'Transport',
    label: '🚌 Transport / Bus Route Schedule Update',
    subject: 'School Bus Route Timing & Stoppage Update',
    defaultMessage:
      'Dear Parents, Please note that Bus Route No. [Number] timings have been adjusted by 10 minutes due to city road maintenance. Please check your stoppage time.'
  },
  {
    category: 'Sports & Events',
    label: '🏆 Annual Sports Day & Cultural Fest Announcement',
    subject: 'Annual Sports Day & Sports Trials Selection',
    defaultMessage:
      'Dear Students, Selection trials for the upcoming Annual Inter-House Sports Championship will be held during sports periods this week. Interested participants should register with their PE teacher.'
  },
  {
    category: 'Emergency Alert',
    label: '🚨 Emergency / Weather & Rain Holiday Alert',
    subject: 'Emergency School Closure Notice',
    defaultMessage:
      'Urgent Notice: Due to heavy rainfall and administrative government orders, school will remain closed today. Online classes will be conducted as per the regular timetable.'
  },
  {
    category: 'Uniform & Discipline',
    label: '👕 Uniform & Dress Code Guidelines',
    subject: 'Strict Adherence to Winter School Uniform',
    defaultMessage:
      'Dear Parents, All students are required to wear proper school winter uniforms, including blazers and ties, starting from [Date]. Casual winter jackets are strictly not permitted.'
  },
  {
    category: 'Library',
    label: '📚 Library Book Return & Clearance Notice',
    subject: 'Annual Library Books Return Reminder',
    defaultMessage:
      'Dear Students, All library books borrowed for the term must be returned to the school central library before the end of this week for inventory verification.'
  }
]

export default function NoticeOnAppPage() {
  const [notices, setNotices] = useState<NoticeRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Search & Categories
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Filter modal
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filterPriority, setFilterPriority] = useState('All')

  // Create Notice Modal State (Opens in Modal!)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [subjectMode, setSubjectMode] = useState<'preset' | 'manual'>('preset')
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | ''>('')
  const [subjectTitle, setSubjectTitle] = useState('')
  const [subjectCategory, setSubjectCategory] = useState('General')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<'Normal' | 'Important' | 'Urgent'>('Normal')

  // Schedule settings
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('10:00')

  // Recipients
  const [audienceType, setAudienceType] = useState<'everyone' | 'students' | 'teachers' | 'parents' | 'class'>('everyone')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [classesList, setClassesList] = useState<MasterClassWithSections[]>([])

  // Attachments
  const [attachedFileName, setAttachedFileName] = useState('')
  const [attachedFileFake, setAttachedFileFake] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // View Details Modal
  const [viewNotice, setViewNotice] = useState<NoticeRecord | null>(null)

  // Delete Confirmation Modal
  const [deleteNoticeId, setDeleteNoticeId] = useState<string | number | null>(null)

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3500)
  }

  // Load institute classes for audience targeting
  useEffect(() => {
    try {
      const cls = getInstituteAddedClasses()
      setClassesList(cls)
      if (cls.length > 0) {
        setSelectedClass(cls[0].className)
        if (cls[0].sections.length > 0) setSelectedSection(cls[0].sections[0])
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Check URL query parameters for ?openCreate=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('openCreate') === 'true') {
        setCreateModalOpen(true)
      }
    }
  }, [])

  // Fetch notices from Backend API (with fallback to localStorage)
  const fetchNotices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory)
      if (filterPriority && filterPriority !== 'All') params.append('priority', filterPriority)
      if (filterStartDate) params.append('startDate', filterStartDate)
      if (filterEndDate) params.append('endDate', filterEndDate)

      const res = await fetch(`/api/institute/notices?${params.toString()}`)
      const json = await res.json()

      if (json.success && Array.isArray(json.data)) {
        setNotices(json.data)
        localStorage.setItem('school_notices_app', JSON.stringify(json.data))
      } else {
        // Fallback to local storage
        const saved = localStorage.getItem('school_notices_app')
        if (saved) {
          try {
            setNotices(JSON.parse(saved))
          } catch {}
        }
      }
    } catch (err) {
      console.warn('API error, reading from localStorage:', err)
      const saved = localStorage.getItem('school_notices_app')
      if (saved) {
        try {
          setNotices(JSON.parse(saved))
        } catch {}
      }
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, filterPriority, filterStartDate, filterEndDate])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  // Handle Preset Subject Selection
  const handleSelectPreset = (idxVal: string) => {
    if (idxVal === 'manual' || idxVal === '') {
      setSelectedPresetIndex('')
      setSubjectMode('manual')
      return
    }

    const idx = parseInt(idxVal)
    const preset = PRESET_SUBJECTS[idx]
    if (preset) {
      setSelectedPresetIndex(idx)
      setSubjectMode('preset')
      setSubjectTitle(preset.subject)
      setSubjectCategory(preset.category)

      // Auto-suggest message if currently empty or short
      if (!message.trim() || message.length < 20) {
        setMessage(preset.defaultMessage)
      }
    }
  }

  // Handle Quick Category Tag Click in Modal
  const handleQuickChipSelect = (preset: typeof PRESET_SUBJECTS[0], idx: number) => {
    setSelectedPresetIndex(idx)
    setSubjectMode('preset')
    setSubjectTitle(preset.subject)
    setSubjectCategory(preset.category)
    if (!message.trim() || message.length < 20) {
      setMessage(preset.defaultMessage)
    }
  }

  // Calculate live recipient count
  const estimatedRecipients = useMemo(() => {
    switch (audienceType) {
      case 'everyone':
        return 248
      case 'students':
        return 184
      case 'teachers':
        return 32
      case 'parents':
        return 178
      case 'class':
        return 42
      default:
        return 248
    }
  }, [audienceType])

  // Handle file attachment simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit')
        return
      }
      setAttachedFileName(file.name)
      setAttachedFileFake(true)
    }
  }

  // Handle Create / Broadcast Notice Submit
  const handleCreateNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subjectTitle.trim()) {
      alert('Please select or type a Subject / Title.')
      return
    }
    if (!message.trim()) {
      alert('Please enter Notice Message content.')
      return
    }

    setSubmitting(true)
    try {
      let audienceLabel = 'Everyone'
      if (audienceType === 'students') audienceLabel = 'All Students'
      else if (audienceType === 'teachers') audienceLabel = 'All Teachers'
      else if (audienceType === 'parents') audienceLabel = 'All Parents'
      else if (audienceType === 'class') audienceLabel = `${selectedClass} - ${selectedSection}`

      const payload = {
        subjectTitle: subjectTitle.trim(),
        subjectCategory: subjectCategory || 'General',
        message: message.trim(),
        priority,
        isScheduled,
        scheduleDate: isScheduled ? scheduleDate : null,
        scheduleTime: isScheduled ? scheduleTime : '',
        sentToUser: estimatedRecipients,
        recipientsType: audienceLabel,
        targetAudience: {
          audienceType,
          className: selectedClass,
          sectionName: selectedSection
        },
        hasFile: attachedFileFake,
        fileName: attachedFileName
      }

      const res = await fetch('/api/institute/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      if (json.success) {
        triggerToast(isScheduled ? 'Notice scheduled successfully!' : 'Notice broadcasted to mobile app!')
        setCreateModalOpen(false)
        resetForm()
        await fetchNotices()
      } else {
        alert(json.error || 'Failed to save notice')
      }
    } catch (err) {
      console.error(err)
      // Save locally if offline
      const localItem: NoticeRecord = {
        id: Date.now(),
        subjectTitle,
        subjectCategory,
        sentToUser: estimatedRecipients,
        message,
        priority,
        scheduleAt: isScheduled && scheduleDate ? `${scheduleDate} ${scheduleTime}` : 'Just Now',
        files: attachedFileFake,
        hasFile: attachedFileFake,
        fileName: attachedFileName,
        createdAt: new Date().toLocaleDateString('en-GB')
      }
      const updated = [localItem, ...notices]
      setNotices(updated)
      localStorage.setItem('school_notices_app', JSON.stringify(updated))
      triggerToast('Notice saved successfully!')
      setCreateModalOpen(false)
      resetForm()
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedPresetIndex('')
    setSubjectMode('preset')
    setSubjectTitle('')
    setSubjectCategory('General')
    setMessage('')
    setPriority('Normal')
    setIsScheduled(false)
    setScheduleDate('')
    setScheduleTime('10:00')
    setAudienceType('everyone')
    setAttachedFileName('')
    setAttachedFileFake(false)
  }

  // Delete Notice
  const handleDeleteNotice = async (id: string | number) => {
    try {
      const res = await fetch(`/api/institute/notices/${id}`, {
        method: 'DELETE'
      })
      const json = await res.json()
      if (json.success) {
        triggerToast('Notice deleted successfully!')
        setNotices(prev => prev.filter(n => n.id !== id))
      } else {
        triggerToast('Deleted notice')
        setNotices(prev => prev.filter(n => n.id !== id))
      }
    } catch {
      setNotices(prev => prev.filter(n => n.id !== id))
      triggerToast('Notice deleted')
    } finally {
      setDeleteNoticeId(null)
    }
  }

  const handleClearFilters = () => {
    setFilterStartDate('')
    setFilterEndDate('')
    setFilterPriority('All')
    setSelectedCategory('All')
    setFilterOpen(false)
  }

  // Summary Metrics
  const totalNoticesCount = notices.length
  const totalUsersReached = useMemo(() => {
    return notices.reduce((acc, curr) => acc + (curr.sentToUser || 0), 0)
  }, [notices])
  const scheduledCount = useMemo(() => {
    return notices.filter(n => n.isScheduled).length
  }, [notices])
  const urgentCount = useMemo(() => {
    return notices.filter(n => n.priority === 'Urgent').length
  }, [notices])

  // Active filter count
  const activeFiltersCount = (filterStartDate ? 1 : 0) + (filterEndDate ? 1 : 0) + (filterPriority !== 'All' ? 1 : 0)

  // Export to CSV
  const handleExportCSV = () => {
    if (notices.length === 0) {
      alert('No notices to export.')
      return
    }
    const headers = ['S.No.', 'Subject & Title', 'Category', 'Priority', 'Sent To User', 'Schedule At', 'Has Files', 'Created At']
    const rows = notices.map((n, i) => [
      i + 1,
      `"${n.subjectTitle.replace(/"/g, '""')}"`,
      `"${(n.subjectCategory || 'General').replace(/"/g, '""')}"`,
      n.priority || 'Normal',
      n.sentToUser || 204,
      `"${n.scheduleAt || ''}"`,
      n.hasFile || n.files ? 'Yes' : 'No',
      `"${n.createdAt || ''}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `School_Notices_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Notices exported to CSV successfully!')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-300">

      {/* 1. Header with Stats & Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-600 flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-850">Notice on App</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Live Mobile Broadcast
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Broadcast real-time push notices to students, teachers, and parents with subject presets or custom title
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search by Title, Message..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold bg-slate-50/50 hover:bg-white focus:bg-white transition-all"
            />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setFilterOpen(true)}
            className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeFiltersCount > 0
                ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold shadow-xs'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
            }`}
            title="Filter Notices by Date & Priority"
          >
            <Filter className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Export button */}
          <button
            onClick={handleExportCSV}
            className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 bg-white transition-colors cursor-pointer"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Compose Notice Modal Trigger (Opened in Modal!) */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Compose Notice</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Broadcasts</span>
            <div className="text-2xl font-black text-slate-850 mt-0.5">{totalNoticesCount}</div>
            <span className="text-[10px] text-teal-600 font-bold">App Notices</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Devices Reached</span>
            <div className="text-2xl font-black text-slate-850 mt-0.5">{totalUsersReached.toLocaleString()}</div>
            <span className="text-[10px] text-blue-600 font-bold">App Notifications</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Later</span>
            <div className="text-2xl font-black text-slate-850 mt-0.5">{scheduledCount}</div>
            <span className="text-[10px] text-amber-600 font-bold">Upcoming Queued</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">High / Urgent</span>
            <div className="text-2xl font-black text-slate-850 mt-0.5">{urgentCount}</div>
            <span className="text-[10px] text-rose-600 font-bold">Priority Alerts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        {['All', 'Holiday Announcement', 'Exam Schedule', 'Fee Reminder', 'PTM Meeting', 'Weather & Timing', 'Transport', 'Sports & Events', 'Emergency Alert'].map(cat => {
          const isSel = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                isSel
                  ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {cat === 'All' ? 'All Categories' : cat}
            </button>
          )
        })}
      </div>

      {/* 4. Notices Table View */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs">
          <table className="w-full text-center border-collapse">
            <thead className="bg-slate-50/80 font-black text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 w-14">S. No.</th>
                <th className="px-4 py-4 text-left min-w-[200px]">Subject & Title</th>
                <th className="px-4 py-4 w-32">Sent to User</th>
                <th className="px-4 py-4 text-left min-w-[240px]">Message</th>
                <th className="px-4 py-4 w-36">Schedule At</th>
                <th className="px-4 py-4 w-20">Files</th>
                <th className="px-4 py-4 w-36">Created At</th>
                <th className="px-4 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-slate-500">Loading notices...</span>
                    </div>
                  </td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                        <Bell className="w-6 h-6" />
                      </div>
                      <span className="text-slate-700 font-bold text-sm">No notices found</span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {searchQuery || activeFiltersCount > 0 || selectedCategory !== 'All'
                          ? 'No notices match your current filters. Try clearing search filters.'
                          : 'You have not broadcasted any app notices yet. Click below to compose your first notice.'}
                      </p>
                      <button
                        onClick={() => setCreateModalOpen(true)}
                        className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Compose Notice</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                notices.map((item, idx) => {
                  const hasAttachment = item.hasFile || item.files

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors align-top cursor-pointer"
                      onClick={() => setViewNotice(item)}
                    >
                      <td className="px-4 py-3.5 text-slate-400 font-bold">{idx + 1}.</td>

                      {/* Subject & Title */}
                      <td className="px-4 py-3.5 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-850 text-sm">{item.subjectTitle}</span>
                          {item.priority === 'Urgent' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                              Urgent
                            </span>
                          )}
                          {item.priority === 'Important' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                              Important
                            </span>
                          )}
                        </div>
                        {item.subjectCategory && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-teal-700 bg-teal-50/70 border border-teal-200/70 px-2 py-0.2 rounded-md">
                            {item.subjectCategory}
                          </span>
                        )}
                      </td>

                      {/* Sent to User */}
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black">
                          <Users className="w-3 h-3" />
                          <span>{item.sentToUser || 204} Users</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {item.recipientsType || 'Everyone'}
                        </div>
                      </td>

                      {/* Message preview */}
                      <td className="px-4 py-3.5 text-left text-slate-600 font-medium leading-relaxed max-w-xs">
                        <p className="line-clamp-2">{item.message}</p>
                      </td>

                      {/* Schedule At */}
                      <td className="px-4 py-3.5 text-slate-500 font-semibold whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.scheduleAt}</span>
                        </div>
                      </td>

                      {/* Files */}
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        {hasAttachment ? (
                          <button
                            onClick={() => setViewNotice(item)}
                            className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-600 border border-teal-200 bg-white mx-auto flex items-center justify-center transition-colors cursor-pointer"
                            title={item.fileName || 'View Attachment'}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3.5 text-slate-500 font-semibold whitespace-nowrap text-[11px]">
                        <div className="flex items-center justify-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.createdAt}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewNotice(item)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                            title="View Full Notice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteNoticeId(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. CREATE NOTICE MODAL (Notice in Modal, Not in Page!)     */}
      {/* ========================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 md:p-8 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative">
            {/* Close Button */}
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-slate-100 pb-4 mb-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shadow-xs">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-850">Broadcast Notice on App</h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Select a pre-defined subject template or type custom title manually
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNoticeSubmit} className="space-y-6">

              {/* SECTION 1: Subject Selection (Select or Type Manually) */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Subject / Notice Title <span className="text-red-500">*</span></span>
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setSubjectMode('preset')
                        if (selectedPresetIndex !== '') {
                          const p = PRESET_SUBJECTS[Number(selectedPresetIndex)]
                          if (p) {
                            setSubjectTitle(p.subject)
                            setSubjectCategory(p.category)
                          }
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        subjectMode === 'preset'
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Preset Templates
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubjectMode('manual')
                        setSelectedPresetIndex('')
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        subjectMode === 'manual'
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Type Manually
                    </button>
                  </div>
                </div>

                {/* Dropdown for Preset Subjects */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">
                    Option A: Choose Pre-defined Subject (Fills Title & Suggested Message)
                  </label>
                  <select
                    value={selectedPresetIndex}
                    onChange={e => handleSelectPreset(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-xs focus:border-teal-500 cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Click to Pick Pre-defined School Notice Subject --</option>
                    {PRESET_SUBJECTS.map((item, i) => (
                      <option key={i} value={i}>
                        {item.label}
                      </option>
                    ))}
                    <option value="manual">✍️ Custom Subject (Type Manually Below)</option>
                  </select>
                </div>

                {/* Quick Subject Chips */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 block">Quick Chips (1-Click Fill):</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {PRESET_SUBJECTS.slice(0, 5).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickChipSelect(preset, idx)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          selectedPresetIndex === idx
                            ? 'bg-teal-50 text-teal-700 border-teal-300 font-black'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option B: Editable / Manual Subject Title Field */}
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600">
                      Option B: Notice Subject / Title (Editable or Type Manually) <span className="text-red-500">*</span>
                    </label>
                    {subjectTitle && (
                      <button
                        type="button"
                        onClick={() => {
                          setSubjectTitle('')
                          setSelectedPresetIndex('')
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                      >
                        Clear text
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter or customize Subject Title..."
                    value={subjectTitle}
                    onChange={e => {
                      setSubjectTitle(e.target.value)
                      if (subjectMode !== 'manual') setSubjectMode('manual')
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl outline-none font-black text-slate-800 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* SECTION 2: Priority & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-bold text-xs">Notice Category</label>
                  <input
                    type="text"
                    value={subjectCategory}
                    onChange={e => setSubjectCategory(e.target.value)}
                    placeholder="e.g. Holiday, Exam, Fee Reminder"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl outline-none font-bold text-xs bg-white focus:border-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 font-bold text-xs">Notice Priority / Badge</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Normal', 'Important', 'Urgent'] as const).map(p => {
                      const isSel = priority === p
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`py-2 px-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            isSel
                              ? p === 'Urgent'
                                ? 'bg-rose-50 border-rose-300 text-rose-700 font-black shadow-xs ring-1 ring-rose-400'
                                : p === 'Important'
                                ? 'bg-amber-50 border-amber-300 text-amber-700 font-black shadow-xs ring-1 ring-amber-400'
                                : 'bg-teal-50 border-teal-300 text-teal-700 font-black shadow-xs ring-1 ring-teal-400'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Notice Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold text-xs">
                    Message Body <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold">{message.length} characters</span>
                </div>
                <textarea
                  required
                  placeholder="Enter detailed notice message for the mobile app..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none font-medium text-xs text-slate-850 h-28 resize-none bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed shadow-2xs"
                />
              </div>

              {/* SECTION 4: File Attachment */}
              <div className="space-y-1.5">
                <label className="text-slate-600 font-bold text-xs flex items-center justify-between">
                  <span>Attachment (Optional - PDF, Images max 10MB)</span>
                  {attachedFileName && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFileName('')
                        setAttachedFileFake(false)
                      }}
                      className="text-[10px] text-rose-500 hover:underline font-bold"
                    >
                      Remove
                    </button>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center border border-slate-200 rounded-xl bg-slate-50/60 overflow-hidden cursor-pointer hover:bg-slate-50 transition-colors">
                    <span className="flex-1 px-3.5 py-2.5 font-semibold text-slate-500 text-xs truncate">
                      {attachedFileName || 'Click to browse file from device (PDF, JPEG, PNG)...'}
                    </span>
                    <span className="px-3 py-2.5 bg-slate-100 text-slate-600 border-l border-slate-200 flex items-center gap-1.5 font-bold text-xs">
                      <Upload className="w-3.5 h-3.5" />
                      Browse
                    </span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* SECTION 5: Target Audience / Send Notice To */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Send Notice To (Target Audience)</span>
                  </label>
                  <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    ~{estimatedRecipients} Devices
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { id: 'everyone', label: 'Everyone' },
                    { id: 'students', label: 'All Students' },
                    { id: 'teachers', label: 'All Teachers' },
                    { id: 'parents', label: 'All Parents' },
                    { id: 'class', label: 'Specific Class' }
                  ].map(aud => {
                    const isSel = audienceType === aud.id
                    return (
                      <button
                        key={aud.id}
                        type="button"
                        onClick={() => setAudienceType(aud.id as any)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                          isSel
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {aud.label}
                      </button>
                    )
                  })}
                </div>

                {/* Specific Class & Section Selector */}
                {audienceType === 'class' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-200">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Select Class</label>
                      <select
                        value={selectedClass}
                        onChange={e => {
                          const cls = e.target.value
                          setSelectedClass(cls)
                          const matched = classesList.find(c => c.className === cls)
                          if (matched && matched.sections.length > 0) {
                            setSelectedSection(matched.sections[0])
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs cursor-pointer"
                      >
                        {classesList.map(c => (
                          <option key={c.className} value={c.className}>
                            {c.className}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Select Section</label>
                      <select
                        value={selectedSection}
                        onChange={e => setSelectedSection(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs cursor-pointer"
                      >
                        <option value="All Sections">All Sections</option>
                        {classesList
                          .find(c => c.className === selectedClass)
                          ?.sections.map(s => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 6: Broadcast Timing (Now vs Scheduled) */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Broadcast Timing</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsScheduled(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !isScheduled ? 'bg-teal-600 text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      Send Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsScheduled(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isScheduled ? 'bg-teal-600 text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      Schedule for Later
                    </button>
                  </div>
                </div>

                {isScheduled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Schedule Date</label>
                      <input
                        type="date"
                        required
                        value={scheduleDate}
                        onChange={e => setScheduleDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Schedule Time</label>
                      <input
                        type="time"
                        required
                        value={scheduleTime}
                        onChange={e => setScheduleTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold bg-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center gap-2 text-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Broadcasting Notice...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isScheduled ? 'Schedule Notice' : 'Broadcast Notice Now'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. NOTICE DETAILS MODAL (Read Full Notice)                 */}
      {/* ========================================================= */}
      {viewNotice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 md:p-8 text-xs font-semibold text-slate-700 animate-in zoom-in-95 duration-200 relative space-y-5">
            <button
              onClick={() => setViewNotice(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div>
              <div className="flex items-center gap-2">
                {viewNotice.priority === 'Urgent' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                    Urgent Alert
                  </span>
                )}
                {viewNotice.priority === 'Important' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                    Important
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {viewNotice.subjectCategory || 'General Notice'}
                </span>
              </div>
              <h2 className="text-base font-black text-slate-900 mt-2">{viewNotice.subjectTitle}</h2>
              <div className="flex items-center gap-3 text-slate-400 text-[11px] mt-1 font-medium">
                <span>📅 Scheduled: {viewNotice.scheduleAt}</span>
                <span>•</span>
                <span>Created: {viewNotice.createdAt}</span>
              </div>
            </div>

            {/* Notice Message Content */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {viewNotice.message}
            </div>

            {/* Recipient summary */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs font-bold text-blue-900">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Target: {viewNotice.recipientsType || 'Everyone'}</span>
              </span>
              <span>{viewNotice.sentToUser || 204} App Users</span>
            </div>

            {/* Attachment preview if present */}
            {(viewNotice.hasFile || viewNotice.files) && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-bold truncate">
                  <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate">{viewNotice.fileName || 'Notice_Attachment.pdf'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Downloading attachment: ${viewNotice.fileName || 'Notice_Attachment.pdf'}`)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-teal-700 cursor-pointer shadow-2xs"
                >
                  Download
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewNotice(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. DATE FILTER MODAL (Screenshot 2 Match)                 */}
      {/* ========================================================= */}
      {filterOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 relative p-6 md:p-8 space-y-6">
            <button
              onClick={() => setFilterOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-850 flex items-center gap-2">
                <Filter className="w-4 h-4 text-teal-600" />
                <span>Filter Notices</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Filter by date interval and notice priority</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Start Date</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={e => setFilterStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none font-bold bg-white text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">End Date</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={e => setFilterEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none font-bold bg-white text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-slate-500 font-bold">Notice Priority</label>
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none font-bold bg-white text-xs cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setFilterOpen(false)
                  fetchNotices()
                }}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/20 transition-all cursor-pointer"
              >
                Apply Filter
              </button>
              <button
                onClick={handleClearFilters}
                className="px-8 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors bg-white cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. DELETE CONFIRMATION MODAL                              */}
      {/* ========================================================= */}
      {deleteNoticeId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Delete Notice?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete this notice? It will be removed from mobile app device feeds.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteNoticeId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNotice(deleteNoticeId)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Delete Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. TOAST ALERT                                            */}
      {/* ========================================================= */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-teal-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

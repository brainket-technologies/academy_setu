'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Calendar, BookOpen, Clock, AlertCircle, CheckCircle2, 
  Plus, Search, ArrowLeft, Filter, Sparkles, X, FileText,
  Upload, ChevronRight, Layers, UserCheck
} from 'lucide-react'
import Link from 'next/link'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'

interface PendingSubjectItem {
  id: string
  subjectName: string
  subjectCode: string
  teacherName: string
  classes: string
  section: string
  lastAssignedDate: string
  status: 'Pending' | 'Assigned' | 'Holiday/Exempt'
}

const DEFAULT_SUBJECTS: PendingSubjectItem[] = [
  {
    id: 'ps-1',
    subjectName: 'Mathematics',
    subjectCode: 'MATH-101',
    teacherName: 'Vikram Joshi',
    classes: 'Class 1',
    section: 'A',
    lastAssignedDate: '20/10/2026',
    status: 'Pending'
  },
  {
    id: 'ps-2',
    subjectName: 'Science',
    subjectCode: 'SCI-102',
    teacherName: 'Dr. Neha Sen',
    classes: 'Class 1',
    section: 'A',
    lastAssignedDate: '19/10/2026',
    status: 'Pending'
  },
  {
    id: 'ps-3',
    subjectName: 'English Literature',
    subjectCode: 'ENG-103',
    teacherName: 'Anita Sharma',
    classes: 'Class 1',
    section: 'A',
    lastAssignedDate: '22/10/2026',
    status: 'Assigned'
  },
  {
    id: 'ps-4',
    subjectName: 'Social Studies',
    subjectCode: 'SST-104',
    teacherName: 'Rahul Verma',
    classes: 'Class 1',
    section: 'A',
    lastAssignedDate: '18/10/2026',
    status: 'Pending'
  },
  {
    id: 'ps-5',
    subjectName: 'Hindi',
    subjectCode: 'HIN-105',
    teacherName: 'Sunita Mehra',
    classes: 'Class 1',
    section: 'A',
    lastAssignedDate: '21/10/2026',
    status: 'Assigned'
  },
  {
    id: 'ps-6',
    subjectName: 'Computer Science',
    subjectCode: 'CS-106',
    teacherName: 'Arjun Das',
    classes: 'Class 1',
    section: 'B',
    lastAssignedDate: '17/10/2026',
    status: 'Pending'
  }
]

export default function PendingAssignHomeworkPage() {
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [selectedClass, setSelectedClass] = useState<string>('Class 1')
  const [selectedSection, setSelectedSection] = useState<string>('A')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState<'All' | 'Pending' | 'Assigned'>('Pending')

  // Subject items list
  const [subjectList, setSubjectList] = useState<PendingSubjectItem[]>(DEFAULT_SUBJECTS)

  // Direct Assign Modal
  const [modalItem, setModalItem] = useState<PendingSubjectItem | null>(null)
  const [hwTitle, setHwTitle] = useState('')
  const [hwDescription, setHwDescription] = useState('')
  const [hwDueDate, setHwDueDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [hwAttachment, setHwAttachment] = useState<string>('')

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Derived options with defaults
  const classOptions = useMemo(() => {
    if (classesData && classesData.length > 0) {
      return classesData.map((c: any) => c.className || c.name || String(c))
    }
    return ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10']
  }, [classesData])

  const sectionOptions = useMemo(() => {
    if (sectionsData && sectionsData.length > 0) {
      return sectionsData.map((s: any) => s.sectionName || s.name || String(s))
    }
    return ['A', 'B', 'C', 'D']
  }, [sectionsData])

  const subjectOptions = useMemo(() => {
    if (subjectsData && subjectsData.length > 0) {
      return subjectsData.map((s: any) => s.subjectName || s.name || String(s))
    }
    return ['Mathematics', 'Science', 'English Literature', 'Social Studies', 'Hindi', 'Computer Science']
  }, [subjectsData])

  // Filtered subjects
  const filteredList = useMemo(() => {
    return subjectList.filter(item => {
      if (selectedClass && item.classes !== selectedClass) return false
      if (selectedSection && item.section !== selectedSection) return false
      if (selectedSubject && !item.subjectName.toLowerCase().includes(selectedSubject.toLowerCase())) return false
      if (filterTab !== 'All' && item.status !== filterTab) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchTitle = item.subjectName.toLowerCase().includes(q)
        const matchTeacher = item.teacherName.toLowerCase().includes(q)
        const matchCode = item.subjectCode.toLowerCase().includes(q)
        if (!matchTitle && !matchTeacher && !matchCode) return false
      }
      return true
    })
  }, [subjectList, selectedClass, selectedSection, selectedSubject, filterTab, searchQuery])

  // Stats
  const totalCount = subjectList.length
  const pendingCount = subjectList.filter(s => s.status === 'Pending').length
  const assignedCount = subjectList.filter(s => s.status === 'Assigned').length

  const handleOpenAssignModal = (item: PendingSubjectItem) => {
    setModalItem(item)
    setHwTitle(`${item.subjectName} Daily Task - Exercise Work`)
    setHwDescription(`Complete the questions from Chapter review for ${item.subjectName}. Submit neatly handwritten responses.`)
    setHwAttachment('')
  }

  const handleSaveDirectAssign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalItem || !hwTitle.trim()) return

    // 1. Update in local subjectList
    const updated = subjectList.map(s => 
      s.id === modalItem.id 
        ? { ...s, status: 'Assigned' as const, lastAssignedDate: selectedDate }
        : s
    )
    setSubjectList(updated)

    // 2. Also push into global school_homeworks so it shows in Assign Homework / Main list
    try {
      const existing = localStorage.getItem('school_homeworks')
      const hwArray = existing ? JSON.parse(existing) : []
      const newHw = {
        id: Date.now(),
        title: hwTitle,
        classes: modalItem.classes,
        section: modalItem.section,
        subject: modalItem.subjectName,
        status: 'Active',
        scheduleDate: selectedDate,
        submissionDate: hwDueDate,
        description: hwDescription
      }
      hwArray.unshift(newHw)
      localStorage.setItem('school_homeworks', JSON.stringify(hwArray))
    } catch (err) {
      console.error(err)
    }

    showToast(`Homework assigned successfully for ${modalItem.subjectName}!`)
    setModalItem(null)
  }

  const handleMarkExempt = (item: PendingSubjectItem) => {
    const updated = subjectList.map(s => 
      s.id === item.id 
        ? { ...s, status: 'Assigned' as const }
        : s
    )
    setSubjectList(updated)
    showToast(`Marked ${item.subjectName} as no homework required today.`)
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-8 space-y-6">
      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl transition-all animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb & Hub Quick Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link href="/institute/homework" className="hover:text-emerald-700 transition-colors">
              Homework
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-emerald-700 font-semibold">Pending Assign Homework</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200/60">
              <Clock className="w-6 h-6" />
            </span>
            Pending Assign Homework
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Select date, class, and subject to directly assign pending homework to students.
          </p>
        </div>

        {/* Quick Nav Dropdown Pill Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/institute/homework/assign"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Assign Homework
          </Link>
          <Link
            href="/institute/homework/remark"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Remark Homework
          </Link>
          <Link
            href="/institute/homework/pending-assign"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm"
          >
            Pending Assign
          </Link>
          <Link
            href="/institute/homework/pending-remark"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Pending Remark
          </Link>
          <Link
            href="/institute/homework/report"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Homework Report
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Subjects</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm flex items-center gap-4 bg-gradient-to-br from-amber-50/40 to-transparent">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">Pending Assignment</p>
            <h3 className="text-2xl font-bold text-amber-900">{pendingCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center gap-4 bg-gradient-to-br from-emerald-50/40 to-transparent">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Assigned Today</p>
            <h3 className="text-2xl font-bold text-emerald-900">{assignedCount}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Selection Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
            <Filter className="w-4 h-4 text-emerald-600" />
            Select Date, Class & Subject Criteria
          </div>
          <button 
            type="button"
            onClick={() => {
              setSelectedClass('Class 1')
              setSelectedSection('A')
              setSelectedSubject('')
              setSearchQuery('')
              setFilterTab('Pending')
            }}
            className="text-xs text-slate-500 hover:text-emerald-600 font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Select Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Class Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Class *
            </label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
            >
              <option value="">All Classes</option>
              {classOptions.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Section Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Section *
            </label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
            >
              <option value="">All Sections</option>
              {sectionOptions.map((s: string) => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Subject Filter
            </label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
            >
              <option value="">All Subjects</option>
              {subjectOptions.map((sub: string) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main List Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['Pending', 'Assigned', 'All'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'Pending' && 'Pending Assign'}
                {tab === 'Assigned' && 'Assigned'}
                {tab === 'All' && 'All Subjects'}
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200/70 text-slate-700">
                  {tab === 'All' 
                    ? subjectList.length 
                    : subjectList.filter(s => s.status === tab).length
                  }
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject or teacher..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Content Table / Cards */}
        {filteredList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800">All Homeworks are Assigned!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are no pending subjects requiring homework assignment for the selected date and filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Subject & Code</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4">Assigned Teacher</th>
                  <th className="py-3 px-4">Last Assigned</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.subjectName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{item.subjectName}</p>
                          <span className="text-[11px] font-mono text-slate-400">{item.subjectCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {item.classes} - Sec {item.section}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        {item.teacherName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.lastAssignedDate}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'Pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pending Assign
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Assigned
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleMarkExempt(item)}
                            className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
                            title="No homework for today"
                          >
                            No HW Today
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(item)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Direct Assign
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(item)}
                          className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-medium transition-colors"
                        >
                          Reassign / Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Direct Assign Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-200" />
                  Direct Assign Homework
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  {modalItem.subjectName} • {modalItem.classes} (Section {modalItem.section})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="w-8 h-8 rounded-lg bg-emerald-800 hover:bg-emerald-900 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDirectAssign} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Homework Title *
                </label>
                <input
                  type="text"
                  required
                  value={hwTitle}
                  onChange={e => setHwTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Practice Questions"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Schedule / Assign Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Submission Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={hwDueDate}
                    onChange={e => setHwDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Homework Instructions & Description
                </label>
                <textarea
                  rows={4}
                  value={hwDescription}
                  onChange={e => setHwDescription(e.target.value)}
                  placeholder="Describe exercises, page numbers, instructions..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attach Reference Document (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-600 font-medium">Click to upload question sheet / PDF</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 10MB</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Assign Directly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

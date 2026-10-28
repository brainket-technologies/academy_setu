'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { 
  Plus, Search, Calendar, FileText, Paperclip, Users, 
  CheckCircle2, ArrowRight, Trash2, Edit3, Eye, 
  Upload, X, Check, Filter, BookOpen, Clock, AlertCircle,
  GraduationCap, Download, ChevronRight, User, RefreshCw
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
  fetchTaskSubmissions 
} from './actions'

interface HomeworkItem {
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
  submissionsCount?: number
  totalStudents?: number
}

// Initial fallback mock data if DB is completely empty on fresh install
const DEFAULT_HOMEWORKS: HomeworkItem[] = [
  {
    id: 'hw-101',
    title: 'Chapter 4: Linear Equations Exercise 4.2',
    description: 'Solve questions 1 through 10 in notebook. Show all steps clearly.',
    subject: 'Mathematics',
    classes: 'Class 1',
    section: 'A',
    assignedBy: 'Ashok Kumar',
    assignDate: '22/10/2026',
    submissionDate: '25/10/2026',
    hasAttachment: true,
    attachmentName: 'Linear_Equations_WS4.pdf',
    status: 'Active',
    submissionsCount: 1,
    totalStudents: 1
  },
  {
    id: 'hw-102',
    title: 'Unit 2: Plant Cell Structure & Photosynthesis',
    description: 'Draw labeled diagram of plant cell and summarize light reactions.',
    subject: 'Science',
    classes: 'Class 1',
    section: 'A',
    assignedBy: 'Sunita Sharma',
    assignDate: '20/10/2026',
    submissionDate: '24/10/2026',
    hasAttachment: false,
    status: 'Active',
    submissionsCount: 0,
    totalStudents: 1
  }
]

export default function AssignHomeworkPage() {
  const router = useRouter()

  // Masters Data
  const classesData = useClasses()
  const sectionsData = useSections()
  const subjectsData = useSubjects()

  // Registered students & teachers from DB
  const [studentsList, setStudentsList] = useState<any[]>([])
  const [teachersList, setTeachersList] = useState<any[]>([])

  // Main Homework List & Loading
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('All')
  const [selectedSection, setSelectedSection] = useState<string>('All')
  const [selectedSubject, setSelectedSubject] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Modal State for "Assign New Homework"
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form Fields
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formClass, setFormClass] = useState('')
  const [formSection, setFormSection] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [formTeacher, setFormTeacher] = useState('')

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const defaultDueStr = useMemo(() => new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], [])

  const [formAssignDate, setFormAssignDate] = useState(todayStr)
  const [formDueDate, setFormDueDate] = useState(defaultDueStr)
  const [formAttachmentName, setFormAttachmentName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // View Details Modal State
  const [viewItem, setViewItem] = useState<HomeworkItem | null>(null)

  // Toast Notification
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Load registered students and teachers
  useEffect(() => {
    let isMounted = true
    const loadInitials = async () => {
      try {
        const [stdRes, tchRes] = await Promise.all([
          fetchStudents(),
          fetchTeachers()
        ])
        if (isMounted) {
          if (stdRes?.success && Array.isArray(stdRes.data)) setStudentsList(stdRes.data)
          if (tchRes?.success && Array.isArray(tchRes.data)) setTeachersList(tchRes.data)
        }
      } catch (err) {
        console.error('Error loading initial data:', err)
      }
    }
    loadInitials()
    return () => { isMounted = false }
  }, [])

  // Load Homework Tasks from DB & Shared cache
  const loadHomeworkTasks = async () => {
    setLoading(true)
    try {
      const res = await fetchHomeworkTasks()
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const items: HomeworkItem[] = res.data.map((t: any) => ({
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
          status: (t.status === 'Closed' ? 'Closed' : 'Active') as 'Active' | 'Closed'
        }))
        setHomeworks(items)
        try {
          localStorage.setItem('school_homework_tasks', JSON.stringify(items))
        } catch {}
      } else {
        // Check local storage fallback
        const saved = localStorage.getItem('school_homework_tasks')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setHomeworks(parsed)
              setLoading(false)
              return
            }
          } catch {}
        }
        setHomeworks(DEFAULT_HOMEWORKS)
      }
    } catch (err) {
      console.error('Failed to load homework tasks:', err)
      setHomeworks(DEFAULT_HOMEWORKS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHomeworkTasks()
  }, [])

  // Auto-set initial class & section in modal when available
  useEffect(() => {
    if (classesData.length > 0 && !formClass) {
      setFormClass(classesData[0].className)
    }
    if (sectionsData.length > 0 && !formSection) {
      setFormSection(sectionsData[0].sectionName)
    }
    if (subjectsData.length > 0 && !formSubject) {
      setFormSubject(subjectsData[0].subjectName)
    }
  }, [classesData, sectionsData, subjectsData, formClass, formSection, formSubject])

  // File upload change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormAttachmentName(file.name)
    }
  }

  // Handle Create / Assign Homework Form Submission
  const handleAssignHomework = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalSubject = formSubject === '__custom__' ? customSubject.trim() : formSubject
    if (!formTitle.trim() || !formClass || !formSection || !finalSubject) {
      alert('Please fill in Title, Class, Section, and Subject.')
      return
    }

    setSubmitting(true)

    const newId = `task-${Date.now()}`
    const payload = {
      id: newId,
      title: formTitle.trim(),
      description: formDesc.trim(),
      classes: formClass,
      section: formSection,
      subject: finalSubject,
      assignedBy: formTeacher || (teachersList[0]?.name ? `${teachersList[0].name}` : 'Faculty'),
      assignDate: formAssignDate,
      submissionDate: formDueDate,
      hasAttachment: !!formAttachmentName,
      attachmentName: formAttachmentName || undefined,
      status: 'Active' as const
    }

    try {
      // 1. Save to DB
      const res = await createHomeworkTask(payload)
      
      // 2. Update local state
      const updated = [payload, ...homeworks]
      setHomeworks(updated)
      try {
        localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
      } catch {}

      showToast('Homework assigned and published successfully!')
      setIsModalOpen(false)

      // Reset form
      setFormTitle('')
      setFormDesc('')
      setFormAttachmentName('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      console.error('Failed to create homework:', err)
      alert('Could not save homework. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Delete Homework
  const handleDeleteHomework = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this homework assignment and its submission records?')) return

    try {
      await deleteHomeworkTask(id)
      const updated = homeworks.filter(h => h.id !== id)
      setHomeworks(updated)
      try {
        localStorage.setItem('school_homework_tasks', JSON.stringify(updated))
      } catch {}
      showToast('Homework assignment removed.')
    } catch (err) {
      console.error('Failed to delete homework:', err)
      alert('Failed to delete homework.')
    }
  }

  // Filtered list
  const filteredHomeworks = useMemo(() => {
    return homeworks.filter(hw => {
      if (selectedClass !== 'All' && hw.classes?.toLowerCase() !== selectedClass.toLowerCase()) return false
      if (selectedSection !== 'All' && hw.section?.toLowerCase() !== selectedSection.toLowerCase()) return false
      if (selectedSubject !== 'All' && hw.subject?.toLowerCase() !== selectedSubject.toLowerCase()) return false
      if (selectedStatus !== 'All' && hw.status !== selectedStatus) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = hw.title?.toLowerCase().includes(q)
        const matchSubject = hw.subject?.toLowerCase().includes(q)
        const matchTeacher = hw.assignedBy?.toLowerCase().includes(q)
        const matchClass = hw.classes?.toLowerCase().includes(q)
        if (!matchTitle && !matchSubject && !matchTeacher && !matchClass) return false
      }
      return true
    })
  }, [homeworks, selectedClass, selectedSection, selectedSubject, selectedStatus, searchQuery])

  // Summary Metrics
  const stats = useMemo(() => {
    const total = homeworks.length
    const active = homeworks.filter(h => h.status === 'Active').length
    const withAttachment = homeworks.filter(h => h.hasAttachment).length
    return { total, active, withAttachment }
  }, [homeworks])

  // Unique list of subjects present in data or masters
  const availableSubjects = useMemo(() => {
    const set = new Set<string>()
    subjectsData.forEach((s: any) => { if (s.subjectName) set.add(s.subjectName) })
    homeworks.forEach(h => { if (h.subject) set.add(h.subject) })
    return Array.from(set)
  }, [subjectsData, homeworks])

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-xl transition-all animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb & Hub Quick Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/institute/homework" className="hover:text-teal-600 transition-colors">
              Homework
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-teal-700 font-bold">Assign Homework</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-200/60">
              <GraduationCap className="w-6 h-6" />
            </span>
            Assign Homework
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, assign, and track homework tasks for all classes and subjects
          </p>
        </div>

        {/* Quick Nav Dropdown Pill Strip */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/institute/homework/assign"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-600 text-white shadow-sm"
          >
            Assign Homework
          </Link>
          <Link
            href="/institute/homework/remark"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-teal-700 transition-colors"
          >
            Remark Homework
          </Link>
          <Link
            href="/institute/homework/pending-assign"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-teal-700 transition-colors"
          >
            Pending Assign
          </Link>
          <Link
            href="/institute/homework/pending-remark"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-teal-700 transition-colors"
          >
            Pending Remark
          </Link>
          <Link
            href="/institute/homework/report"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-teal-700 transition-colors"
          >
            Homework Report
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Assignments</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Assigned across all classes</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Tasks</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.active}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Open for student submissions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">With Attachments</p>
            <h3 className="text-2xl font-black text-sky-600 mt-1">{stats.withAttachment}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Worksheets &amp; PDF files attached</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Paperclip className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Toolbar: Filters, Search & Assign Homework Button */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Filters Row */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Class Filter */}
            <div className="min-w-[130px]">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
              >
                <option value="All">All Classes</option>
                {classesData.map((c: any) => (
                  <option key={c.className} value={c.className}>{c.className}</option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div className="min-w-[120px]">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Section</label>
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
              >
                <option value="All">All Sections</option>
                {sectionsData.map((s: any) => (
                  <option key={s.sectionName} value={s.sectionName}>Section {s.sectionName}</option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div className="min-w-[140px]">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
              >
                <option value="All">All Subjects</option>
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="min-w-[110px]">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search title, teacher, subject..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Right: Primary Action Button */}
          <div className="flex items-end self-end lg:self-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Assign New Homework
            </button>
          </div>
        </div>
      </div>

      {/* Main Homework List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-sm">
            Assigned Homework List ({filteredHomeworks.length})
          </h2>
          <button
            type="button"
            onClick={loadHomeworkTasks}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {filteredHomeworks.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No Homework Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery || selectedClass !== 'All' 
                ? 'No assignments match the selected filters. Try clearing your filters.' 
                : 'No homework has been assigned yet. Click below to publish your first assignment.'}
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Assign New Homework
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Homework Title &amp; Description</th>
                  <th className="py-3.5 px-4">Class &amp; Section</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Teacher</th>
                  <th className="py-3.5 px-4">Assign Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-center">Attachment</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredHomeworks.map((hw, idx) => (
                  <tr key={hw.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <p className="font-extrabold text-slate-900 text-sm truncate">{hw.title}</p>
                      {hw.description && (
                        <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{hw.description}</p>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200/60">
                        {hw.classes} - Sec {hw.section}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200/60">
                        {hw.subject}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hw.assignedBy}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hw.assignDate}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-orange-600 font-bold">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>{hw.submissionDate}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {hw.hasAttachment ? (
                        <span 
                          title={hw.attachmentName || 'Attachment Included'}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold text-[11px] border border-sky-100"
                        >
                          <Paperclip className="w-3 h-3 text-sky-600" />
                          File
                        </span>
                      ) : (
                        <span className="text-slate-300 font-normal">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        hw.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {hw.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Direct link to Remark & Evaluate for this assignment */}
                        <Link
                          href={`/institute/homework/remark?taskId=${hw.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-bold text-xs border border-teal-200/80 transition-all shadow-2xs"
                          title="Evaluate & Remark Student Submissions"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Remark
                        </Link>

                        {/* View Modal */}
                        <button
                          type="button"
                          onClick={() => setViewItem(hw)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteHomework(hw.id, e)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Homework"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: ASSIGN NEW HOMEWORK
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-teal-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Assign New Homework</h3>
                  <p className="text-[11px] text-teal-100/90 font-medium mt-0.5">
                    Publish curriculum assignment for students
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAssignHomework} className="p-6 space-y-4 overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Homework Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4: Linear Equations Exercise 4.2"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Class & Section Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formClass}
                    onChange={e => setFormClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                  >
                    {classesData.length === 0 && <option value="Class 1">Class 1</option>}
                    {classesData.map((c: any) => (
                      <option key={c.className} value={c.className}>{c.className}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formSection}
                    onChange={e => setFormSection(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                  >
                    {sectionsData.length === 0 && <option value="A">Section A</option>}
                    {sectionsData.map((s: any) => (
                      <option key={s.sectionName} value={s.sectionName}>Section {s.sectionName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject & Teacher Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formSubject}
                    onChange={e => setFormSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                  >
                    {availableSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="__custom__">+ Enter custom subject...</option>
                  </select>

                  {formSubject === '__custom__' && (
                    <input
                      type="text"
                      required
                      placeholder="Type subject name..."
                      value={customSubject}
                      onChange={e => setCustomSubject(e.target.value)}
                      className="mt-2 w-full px-3.5 py-2 text-xs bg-white border border-teal-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assigned Teacher
                  </label>
                  <select
                    value={formTeacher}
                    onChange={e => setFormTeacher(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                  >
                    <option value="">Select Teacher (or Default Faculty)</option>
                    {teachersList.map((t: any) => (
                      <option key={t.id || t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assign Date and Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Assign Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formAssignDate}
                    onChange={e => setFormAssignDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={formAssignDate}
                    value={formDueDate}
                    onChange={e => setFormDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Instructions / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Instructions / Description
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Explain requirements, questions to solve, or guidelines for students..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>

              {/* Attachment File Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                    Attach Worksheet / Question Paper
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">Optional</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {formAttachmentName ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-800 truncate max-w-xs">{formAttachmentName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormAttachmentName('')
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="w-6 h-6 rounded-md bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 rounded-2xl p-4 text-center cursor-pointer transition-all group"
                  >
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-teal-600 mx-auto mb-1 transition-colors" />
                    <p className="text-xs font-bold text-slate-700 group-hover:text-teal-800">
                      Click to upload worksheet or assignment file
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, DOCX, worksheets or images</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Publishing...' : (
                    <>
                      <Check className="w-4 h-4" />
                      Publish Homework
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW HOMEWORK DETAILS
          ========================================================================= */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200/60">
                  <FileText className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm">Homework Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Title</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{viewItem.title}</p>
              </div>

              {viewItem.description && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Instructions</span>
                  <p className="text-slate-700 leading-relaxed mt-0.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {viewItem.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Class &amp; Section</span>
                  <p className="font-bold text-slate-800 mt-0.5">{viewItem.classes} (Sec {viewItem.section})</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subject</span>
                  <p className="font-bold text-teal-700 mt-0.5">{viewItem.subject}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Date</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{viewItem.assignDate}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Due Date</span>
                  <p className="font-bold text-orange-600 mt-0.5">{viewItem.submissionDate}</p>
                </div>
              </div>

              {viewItem.hasAttachment && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Attachment</span>
                  <div className="mt-1 flex items-center justify-between p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                    <span className="font-bold text-sky-800 truncate">{viewItem.attachmentName || 'Attachment Document'}</span>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading: ${viewItem.attachmentName || 'document'}`)}
                      className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <Link
                  href={`/institute/homework/remark?taskId=${viewItem.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Go to Remark &amp; Evaluate
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  ChevronLeft, ChevronRight, Users, GraduationCap, 
  Calendar, FileText, Paperclip, Plus, Search, Check, 
  X, ArrowLeft, Clock, CheckCircle2, User, BookOpen, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useClasses, useSections } from '@/lib/mastersData'

// Types
interface ClassCardItem {
  id: string
  className: string
  section: string
  classTeacher: string
  studentsCount: number
}

interface SubjectItem {
  id: string
  subjectName: string
  teacherName: string
  bgColor: string
  borderColor: string
  textColor: string
  badgeColor: string
}

interface TaskItem {
  id: string
  title: string
  description: string
  subject: string
  classes: string
  section: string
  status: 'Active' | 'Closed'
  hasAttachment: boolean
  attachmentName?: string
  assignedBy: string
  assignDate: string
  submissionDate: string
  studentsCount: number
}

interface StudentItem {
  id: string
  name: string
  rollNo: string
  admissionNo: string
  avatar: string
  status?: 'Submitted' | 'Pending'
}

// Default mock classes matching Screenshot 1
const DEFAULT_CLASSES: ClassCardItem[] = [
  { id: 'c-1', className: 'Class V', section: 'A', classTeacher: 'Pooja Sharma', studentsCount: 40 },
  { id: 'c-2', className: 'Class V', section: 'B', classTeacher: 'Ramesh Chandra', studentsCount: 38 },
  { id: 'c-3', className: 'Class VI', section: 'A', classTeacher: 'Sunita Sharma', studentsCount: 35 },
  { id: 'c-4', className: 'Class VI', section: 'B', classTeacher: 'Vikas Gupta', studentsCount: 36 },
  { id: 'c-5', className: 'Class VII', section: 'A', classTeacher: 'Anuradha Roy', studentsCount: 42 },
  { id: 'c-6', className: 'Class VII', section: 'B', classTeacher: 'Suresh Kumar', studentsCount: 39 },
  { id: 'c-7', className: 'Class VIII', section: 'A', classTeacher: 'Meenakshi Iyer', studentsCount: 41 },
]

// Subjects list matching Screenshot 2
const DEFAULT_SUBJECTS: SubjectItem[] = [
  {
    id: 's-1',
    subjectName: 'Mathematics',
    teacherName: 'Ashok Kumar',
    bgColor: 'bg-sky-50/80 hover:bg-sky-100/80',
    borderColor: 'border-sky-200/60',
    textColor: 'text-slate-800',
    badgeColor: 'bg-sky-100 text-sky-800'
  },
  {
    id: 's-2',
    subjectName: 'Science',
    teacherName: 'Sunita Sharma',
    bgColor: 'bg-emerald-50/80 hover:bg-emerald-100/80',
    borderColor: 'border-emerald-200/60',
    textColor: 'text-slate-800',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 's-3',
    subjectName: 'English',
    teacherName: 'Priya Verma',
    bgColor: 'bg-rose-50/80 hover:bg-rose-100/80',
    borderColor: 'border-rose-200/60',
    textColor: 'text-slate-800',
    badgeColor: 'bg-rose-100 text-rose-800'
  },
  {
    id: 's-4',
    subjectName: 'Hindi',
    teacherName: 'Ramesh Chandra',
    bgColor: 'bg-amber-50/80 hover:bg-amber-100/80',
    borderColor: 'border-amber-200/60',
    textColor: 'text-slate-800',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  {
    id: 's-5',
    subjectName: 'Social Studies',
    teacherName: 'Vikas Gupta',
    bgColor: 'bg-purple-50/80 hover:bg-purple-100/80',
    borderColor: 'border-purple-200/60',
    textColor: 'text-slate-800',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    id: 's-6',
    subjectName: 'Computer Science',
    teacherName: 'Neha Singh',
    bgColor: 'bg-orange-50/80 hover:bg-orange-100/80',
    borderColor: 'border-orange-200/60',
    textColor: 'text-slate-800',
    badgeColor: 'bg-orange-100 text-orange-800'
  }
]

// Initial Tasks matching Screenshot 3
const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Algebra: Linear Equations Exercise 4.2',
    description: 'Solve questions 1 to 15 from Chapter 4 Exercise 4.2. Show all calculation steps clearly in your notebook.',
    subject: 'Mathematics',
    classes: 'Class V',
    section: 'A',
    status: 'Active',
    hasAttachment: true,
    attachmentName: 'Exercise_4_2_worksheet.pdf',
    assignedBy: 'Pooja Sharma (You)',
    assignDate: '15 Sep 2026',
    submissionDate: '18 Sep 2026',
    studentsCount: 40
  },
  {
    id: 't-2',
    title: 'Geometry: Triangles Theorem 3 & 4',
    description: 'Write statements and proofs of Pythagoras Theorem and solve practical problems on page 78.',
    subject: 'Mathematics',
    classes: 'Class V',
    section: 'A',
    status: 'Closed',
    hasAttachment: false,
    assignedBy: 'Vikram Malhotra',
    assignDate: '10 Sep 2026',
    submissionDate: '13 Sep 2026',
    studentsCount: 40
  }
]

// Students list matching Screenshot 4
const DEFAULT_STUDENTS: StudentItem[] = [
  {
    id: 'st-1',
    name: 'Aarav Sharma',
    rollNo: '001',
    admissionNo: 'ADM-2024-101',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    status: 'Submitted'
  },
  {
    id: 'st-2',
    name: 'Priya Gupta',
    rollNo: '002',
    admissionNo: 'ADM-2024-102',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    status: 'Submitted'
  },
  {
    id: 'st-3',
    name: 'Rohan Verma',
    rollNo: '003',
    admissionNo: 'ADM-2024-103',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    status: 'Pending'
  },
  {
    id: 'st-4',
    name: 'Sneha Patel',
    rollNo: '004',
    admissionNo: 'ADM-2024-104',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    status: 'Submitted'
  },
  {
    id: 'st-5',
    name: 'Arjun Singh',
    rollNo: '005',
    admissionNo: 'ADM-2024-105',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    status: 'Pending'
  },
  {
    id: 'st-6',
    name: 'Divya Mehta',
    rollNo: '006',
    admissionNo: 'ADM-2024-106',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    status: 'Submitted'
  },
  {
    id: 'st-7',
    name: 'Kabir Khanna',
    rollNo: '007',
    admissionNo: 'ADM-2024-107',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    status: 'Submitted'
  },
  {
    id: 'st-8',
    name: 'Ananya Deshmukh',
    rollNo: '008',
    admissionNo: 'ADM-2024-108',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    status: 'Pending'
  }
]

export default function AssignHomeworkPage() {
  const classesData = useClasses()
  const sectionsData = useSections()

  // Navigation steps:
  // 'classes' (Screen 1) -> 'subjects' (Screen 2) -> 'tasks' (Screen 3) -> 'students' (Screen 4)
  const [currentStep, setCurrentStep] = useState<'classes' | 'subjects' | 'tasks' | 'students'>('classes')

  // Selected State
  const [selectedClassItem, setSelectedClassItem] = useState<ClassCardItem>(DEFAULT_CLASSES[0])
  const [selectedSubjectItem, setSelectedSubjectItem] = useState<SubjectItem>(DEFAULT_SUBJECTS[0])
  const [selectedTaskItem, setSelectedTaskItem] = useState<TaskItem>(INITIAL_TASKS[0])

  // Screen 1: Calendar Carousel State
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(22) // default 22 as in screenshot
  const [filterClass, setFilterClass] = useState<string>('All')
  const [filterSection, setFilterSection] = useState<string>('All')

  // Screen 3: Tasks list & Create Modal
  const [tasksList, setTasksList] = useState<TaskItem[]>(INITIAL_TASKS)
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState<boolean>(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskAssignDate, setNewTaskAssignDate] = useState('22 Sep 2026')
  const [newTaskDueDate, setNewTaskDueDate] = useState('25 Sep 2026')
  const [newTaskAttachment, setNewTaskAttachment] = useState<string>('')

  // Screen 4: Students Search
  const [studentSearch, setStudentSearch] = useState<string>('')

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Generate 7-day strip based on offset
  const weekDays = useMemo(() => {
    const days = [
      { dayNumber: 19, dayName: 'Mon' },
      { dayNumber: 20, dayName: 'Tue' },
      { dayNumber: 21, dayName: 'Wed' },
      { dayNumber: 22, dayName: 'Thu' },
      { dayNumber: 23, dayName: 'Fri' },
      { dayNumber: 24, dayName: 'Sat' },
      { dayNumber: 25, dayName: 'Sun' }
    ]
    if (currentWeekOffset === 0) return days
    return days.map(d => ({
      ...d,
      dayNumber: ((d.dayNumber + currentWeekOffset * 7 - 1) % 30) + 1
    }))
  }, [currentWeekOffset])

  // Filtered Classes for Screen 1
  const filteredClasses = useMemo(() => {
    return DEFAULT_CLASSES.filter(c => {
      if (filterClass !== 'All' && c.className !== filterClass) return false
      if (filterSection !== 'All' && c.section !== filterSection) return false
      return true
    })
  }, [filterClass, filterSection])

  // Filtered Tasks for Screen 3
  const currentSubjectTasks = useMemo(() => {
    return tasksList.filter(t => 
      t.subject === selectedSubjectItem.subjectName &&
      t.classes === selectedClassItem.className &&
      t.section === selectedClassItem.section
    )
  }, [tasksList, selectedSubjectItem, selectedClassItem])

  // Filtered Students for Screen 4
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return DEFAULT_STUDENTS
    const q = studentSearch.toLowerCase()
    return DEFAULT_STUDENTS.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.rollNo.includes(q) || 
      s.admissionNo.toLowerCase().includes(q)
    )
  }, [studentSearch])

  // Handler: Step 1 -> Step 2
  const handleSelectClass = (cls: ClassCardItem) => {
    setSelectedClassItem(cls)
    setCurrentStep('subjects')
  }

  // Handler: Step 2 -> Step 3
  const handleSelectSubject = (sub: SubjectItem) => {
    setSelectedSubjectItem(sub)
    setCurrentStep('tasks')
  }

  // Handler: Step 3 -> Step 4
  const handleOpenAssignedStudents = (task: TaskItem) => {
    setSelectedTaskItem(task)
    setStudentSearch('')
    setCurrentStep('students')
  }

  // Handler: Create New Task in Step 3
  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDesc || 'Complete the assigned exercises in your notebook.',
      subject: selectedSubjectItem.subjectName,
      classes: selectedClassItem.className,
      section: selectedClassItem.section,
      status: 'Active',
      hasAttachment: !!newTaskAttachment,
      attachmentName: newTaskAttachment || undefined,
      assignedBy: 'Pooja Sharma (You)',
      assignDate: newTaskAssignDate,
      submissionDate: newTaskDueDate,
      studentsCount: selectedClassItem.studentsCount
    }

    setTasksList(prev => [newTask, ...prev])
    setCreateTaskModalOpen(false)
    setNewTaskTitle('')
    setNewTaskDesc('')
    setNewTaskAttachment('')
    showToast(`New homework task "${newTask.title}" created successfully!`)
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] pb-16">
      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl transition-all animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* =========================================================================
          SCREEN 1: ASSIGN HOMEWORK (Main Date Strip + Class Selector)
          ========================================================================= */}
      {currentStep === 'classes' && (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-[#0d8065] text-white px-4 py-5 rounded-b-[28px] shadow-sm flex items-center justify-between mb-4">
            <Link 
              href="/institute/homework"
              className="w-10 h-10 rounded-xl bg-white text-[#0d8065] flex items-center justify-center shadow hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-center flex-1">
              Assign Homework
            </h1>
            <div className="w-10" /> {/* Spacer */}
          </div>

          <div className="px-4 space-y-4">
            {/* Date Selector Strip (Matching Screenshot 1) */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between flex-1 px-1">
                {weekDays.map(item => {
                  const isSelected = item.dayNumber === selectedDayNumber
                  return (
                    <button
                      key={item.dayNumber}
                      type="button"
                      onClick={() => setSelectedDayNumber(item.dayNumber)}
                      className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all ${
                        isSelected 
                          ? 'bg-[#0d8065] text-white shadow-md font-bold scale-105' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {item.dayNumber}
                      </span>
                      <span className={`text-[11px] font-medium mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {item.dayName}
                      </span>
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Class & Section Filter Dropdowns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Class
                </label>
                <select
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0d8065]/20 focus:border-[#0d8065]"
                >
                  <option value="All">All Classes</option>
                  <option value="Class V">Class V</option>
                  <option value="Class VI">Class VI</option>
                  <option value="Class VII">Class VII</option>
                  <option value="Class VIII">Class VIII</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Section
                </label>
                <select
                  value={filterSection}
                  onChange={e => setFilterSection(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs md:text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0d8065]/20 focus:border-[#0d8065]"
                >
                  <option value="All">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>

            {/* Section Title */}
            <div className="pt-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Select Class to Assign
              </h2>
            </div>

            {/* Class Cards List */}
            <div className="space-y-3.5">
              {filteredClasses.map(cls => (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0d8065] flex items-center justify-center shrink-0">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm md:text-base">
                          {cls.className} - Section {cls.section}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Class Teacher: <span className="font-semibold text-slate-700">{cls.classTeacher}</span>
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                      <Users className="w-3 h-3" />
                      <span>{cls.studentsCount} Students</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSelectClass(cls)}
                      className="px-4 py-2.5 rounded-xl bg-[#0d8065] hover:bg-[#0b6e56] text-white text-xs font-bold shadow-sm inline-flex items-center gap-2 transition-all active:scale-95"
                    >
                      <FileText className="w-4 h-4" />
                      Assign Homework
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: SELECT SUBJECT (Matching Screenshot 2)
          ========================================================================= */}
      {currentStep === 'subjects' && (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-[#0d8065] text-white px-4 py-5 rounded-b-[28px] shadow-sm flex items-center justify-between mb-4">
            <button 
              type="button"
              onClick={() => setCurrentStep('classes')}
              className="w-10 h-10 rounded-xl bg-white text-[#0d8065] flex items-center justify-center shadow hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-center flex-1">
              Select Subject
            </h1>
            <div className="w-10" />
          </div>

          <div className="px-4 space-y-4">
            {/* Selected Class Summary Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0d8065] text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {selectedClassItem.className}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {DEFAULT_SUBJECTS.length} Subjects Assigned
                  </p>
                </div>
              </div>

              <div className="px-4 py-1.5 rounded-xl bg-[#0d8065] text-white font-bold text-xs shadow-sm">
                Section {selectedClassItem.section}
              </div>
            </div>

            {/* Title */}
            <div className="pt-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Subjects
              </h2>
            </div>

            {/* Subjects Pastel Cards List */}
            <div className="space-y-3">
              {DEFAULT_SUBJECTS.map(sub => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSelectSubject(sub)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between shadow-xs hover:shadow-md active:scale-[0.99] ${sub.bgColor} ${sub.borderColor}`}
                >
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      Subject : {sub.subjectName}
                    </h4>
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/90 text-slate-600 shadow-2xs">
                      Teacher : {sub.teacherName}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-slate-500 shadow-2xs shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: MATHEMATICS TASKS / SUBJECT TASKS (Matching Screenshot 3)
          ========================================================================= */}
      {currentStep === 'tasks' && (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-[#0d8065] text-white px-4 py-5 rounded-b-[28px] shadow-sm flex items-center justify-between mb-4">
            <button 
              type="button"
              onClick={() => setCurrentStep('subjects')}
              className="w-10 h-10 rounded-xl bg-white text-[#0d8065] flex items-center justify-center shadow hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-center flex-1">
              {selectedSubjectItem.subjectName} Tasks
            </h1>
            <div className="w-10" />
          </div>

          <div className="px-4 space-y-4">
            {/* Subject Summary Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0d8065] text-white flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {selectedSubjectItem.subjectName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                    {selectedClassItem.className} - Sec {selectedClassItem.section}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#0d8065]">
                    Academic Year 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Title & Total Badge */}
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Assigned Tasks
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {currentSubjectTasks.length} total
              </span>
            </div>

            {/* Task Cards List */}
            {currentSubjectTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#0d8065] flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No tasks assigned yet</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Click "+ Create Task" below to assign homework to {selectedClassItem.className}.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {currentSubjectTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 space-y-3"
                  >
                    {/* Top Status & Attachment badges */}
                    <div className="flex items-center justify-between">
                      {task.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          Closed
                        </span>
                      )}

                      {task.hasAttachment && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                          <Paperclip className="w-3 h-3 text-sky-600" />
                          Attachment
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm md:text-base">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    {/* Assigned By */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assigned by:</span>
                      <span className="font-semibold text-slate-700">{task.assignedBy}</span>
                    </div>

                    {/* Attachment File Box */}
                    {task.hasAttachment && task.attachmentName && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-sky-700 font-semibold">
                        <FileText className="w-4 h-4 text-sky-600" />
                        <span className="truncate">{task.attachmentName}</span>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Assign:</span>
                        <span className="font-semibold text-slate-700">{task.assignDate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-600 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        <span>Submission:</span>
                        <span>{task.submissionDate}</span>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.studentsCount} Students</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenAssignedStudents(task)}
                        className="px-4 py-2 rounded-xl bg-[#0d8065] hover:bg-[#0b6e56] text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Assigned Students
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floating Create Task Button (Screenshot 3 bottom right) */}
          <div className="fixed bottom-6 right-6 md:right-auto md:left-1/2 md:translate-x-[180px] z-40">
            <button
              type="button"
              onClick={() => setCreateTaskModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#0d8065] hover:bg-[#0b6e56] text-white font-bold text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Create Task
            </button>
          </div>

          {/* Create Task Modal */}
          {createTaskModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 bg-[#0d8065] text-white flex items-center justify-between">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-200" />
                    Create New Homework Task
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCreateTaskModalOpen(false)}
                    className="w-8 h-8 rounded-lg bg-[#0b6e56] hover:bg-[#095945] flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateTaskSubmit} className="p-6 space-y-4 overflow-y-auto">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      {selectedSubjectItem.subjectName}
                    </span>
                    <span>
                      {selectedClassItem.className} (Sec {selectedClassItem.section})
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Algebra: Linear Equations Exercise 4.2"
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d8065]/20 focus:border-[#0d8065]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Instructions / Description
                    </label>
                    <textarea
                      rows={3}
                      value={newTaskDesc}
                      onChange={e => setNewTaskDesc(e.target.value)}
                      placeholder="Solve questions from chapter review. Show all steps clearly..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d8065]/20 focus:border-[#0d8065] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Assign Date
                      </label>
                      <input
                        type="text"
                        value={newTaskAssignDate}
                        onChange={e => setNewTaskAssignDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d8065]/20 focus:border-[#0d8065]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="text"
                        value={newTaskDueDate}
                        onChange={e => setNewTaskDueDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d8065]/20 focus:border-[#0d8065]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Attachment Filename (Optional)
                    </label>
                    <input
                      type="text"
                      value={newTaskAttachment}
                      onChange={e => setNewTaskAttachment(e.target.value)}
                      placeholder="e.g. Exercise_4_2_worksheet.pdf"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d8065]/20 focus:border-[#0d8065]"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setCreateTaskModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0d8065] hover:bg-[#0b6e56] text-white shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Publish Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SCREEN 4: ASSIGNED STUDENTS (Matching Screenshot 4)
          ========================================================================= */}
      {currentStep === 'students' && (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-[#0d8065] text-white px-4 py-5 rounded-b-[28px] shadow-sm flex items-center justify-between mb-4">
            <button 
              type="button"
              onClick={() => setCurrentStep('tasks')}
              className="w-10 h-10 rounded-xl bg-white text-[#0d8065] flex items-center justify-center shadow hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-center flex-1">
              Assigned Students
            </h1>
            <div className="w-10" />
          </div>

          <div className="px-4 space-y-4">
            {/* Task Info Summary Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0d8065] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug">
                    {selectedTaskItem.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedTaskItem.classes} - Section {selectedTaskItem.section} • {selectedTaskItem.subject}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assign:</span>
                  <span className="font-semibold text-slate-700">{selectedTaskItem.assignDate}</span>
                </div>
                <div className="flex items-center gap-1 text-orange-600 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>Due:</span>
                  <span>{selectedTaskItem.submissionDate}</span>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or roll no..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs md:text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0d8065]/20 focus:border-[#0d8065]"
              />
            </div>

            {/* Title & Students Count Badge */}
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Student List
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {selectedClassItem.studentsCount} Students
              </span>
            </div>

            {/* Students List Cards */}
            <div className="space-y-2.5">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center gap-3.5 hover:shadow-md transition-shadow"
                >
                  {/* Avatar */}
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-100 shadow-xs shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-sm truncate">
                      {student.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        Roll No: {student.rollNo}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {student.admissionNo}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

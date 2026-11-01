'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, Filter, Plus, Trash2, X, CheckCircle2, MoreVertical,
  Edit2, Calendar, Clock, Award, Users, BookOpen, Check, Eye,
  FileText, Sparkles, AlertCircle
} from 'lucide-react'
import { useClasses, useSections, useSubjects } from '@/lib/mastersData'

interface StudentMarksRecord {
  id: number
  studentName: string
  rollNo: string
  marks: Record<string, string> // subject -> mark
  obtMarks: number
  totalMarks: number
  percentage: string
  rank: number
}

interface TestRecord {
  id: number
  className: string
  section: string
  subject: string
  subjectsList: string[]
  title: string
  date: string
  fromTime: string
  toTime: string
  totalMarks: number
  passingMarks: number
  noOfStudents: number
  createdAt: string
  description?: string
  rankMethod?: string
  status: 'Upcoming' | 'Completed'
  studentMarks?: StudentMarksRecord[]
}

const DEFAULT_CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const DEFAULT_SECTIONS = ['A', 'B', 'C', 'D']
const DEFAULT_SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Physics', 'Chemistry', 'Computer Science']

const SAMPLE_STUDENTS = [
  { id: 1, studentName: 'Md Fahad', rollNo: '01' },
  { id: 2, studentName: 'Amit Kumar', rollNo: '02' },
  { id: 3, studentName: 'Priya Sharma', rollNo: '03' },
  { id: 4, studentName: 'Rahul Verma', rollNo: '04' },
  { id: 5, studentName: 'Ananya Roy', rollNo: '05' },
  { id: 6, studentName: 'Sneha Patel', rollNo: '06' }
]

const INITIAL_TESTS: TestRecord[] = [
  {
    id: 1,
    className: 'Class 10',
    section: 'A',
    subject: 'Mathematics, Science',
    subjectsList: ['Mathematics', 'Science'],
    title: 'Unit Assessment 2 - Quadratic Equations & Mechanics',
    date: '2026-11-05',
    fromTime: '09:00 AM',
    toTime: '11:00 AM',
    totalMarks: 50,
    passingMarks: 18,
    noOfStudents: 32,
    createdAt: '01/11/2026 10:30 AM',
    description: 'Covers NCERT Chapter 4 (Quadratic Equations) and Laws of Motion with numerical problems.',
    rankMethod: 'Total Marks Percent',
    status: 'Upcoming',
    studentMarks: [
      { id: 1, studentName: 'Md Fahad', rollNo: '01', marks: { Mathematics: '45', Science: '42' }, obtMarks: 87, totalMarks: 100, percentage: '87.0%', rank: 1 },
      { id: 2, studentName: 'Amit Kumar', rollNo: '02', marks: { Mathematics: '38', Science: '40' }, obtMarks: 78, totalMarks: 100, percentage: '78.0%', rank: 2 },
      { id: 3, studentName: 'Priya Sharma', rollNo: '03', marks: { Mathematics: '35', Science: '36' }, obtMarks: 71, totalMarks: 100, percentage: '71.0%', rank: 3 }
    ]
  },
  {
    id: 2,
    className: 'Class 8',
    section: 'B',
    subject: 'English, Social Science',
    subjectsList: ['English', 'Social Science'],
    title: 'Weekly Comprehension & History Review',
    date: '2026-10-28',
    fromTime: '11:30 AM',
    toTime: '01:00 PM',
    totalMarks: 40,
    passingMarks: 14,
    noOfStudents: 28,
    createdAt: '25/10/2026 02:15 PM',
    description: 'Grammar tenses, reading comprehension passage, and Revolt of 1857 timeline questions.',
    rankMethod: 'Total Marks Percent',
    status: 'Completed',
    studentMarks: [
      { id: 1, studentName: 'Md Fahad', rollNo: '01', marks: { English: '36', 'Social Science': '34' }, obtMarks: 70, totalMarks: 80, percentage: '87.5%', rank: 1 },
      { id: 2, studentName: 'Amit Kumar', rollNo: '02', marks: { English: '32', 'Social Science': '30' }, obtMarks: 62, totalMarks: 80, percentage: '77.5%', rank: 2 }
    ]
  },
  {
    id: 3,
    className: 'Class 12',
    section: 'A',
    subject: 'Physics, Chemistry',
    subjectsList: ['Physics', 'Chemistry'],
    title: 'Mid-Term Board Mock Evaluation',
    date: '2026-11-12',
    fromTime: '08:30 AM',
    toTime: '11:30 AM',
    totalMarks: 70,
    passingMarks: 24,
    noOfStudents: 35,
    createdAt: '28/10/2026 04:00 PM',
    description: 'Electrostatics, Current Electricity, Chemical Kinetics, and Coordination Compounds.',
    rankMethod: 'Subject Weightage',
    status: 'Upcoming',
    studentMarks: []
  }
]

export default function OfflineTestPage() {
  const masterClasses = useClasses()
  const masterSections = useSections()
  const masterSubjects = useSubjects()

  const [tests, setTests] = useState<TestRecord[]>(INITIAL_TESTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [marksModalOpen, setMarksModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<TestRecord | null>(null)

  // Create Form State
  const [formClass, setFormClass] = useState('')
  const [formSection, setFormSection] = useState('')
  const [formSubjects, setFormSubjects] = useState<string[]>(['Mathematics', 'Science'])
  const [formTitle, setFormTitle] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formFromTime, setFormFromTime] = useState('09:00 AM')
  const [formToTime, setFormToTime] = useState('11:00 AM')
  const [formTotalMarks, setFormTotalMarks] = useState<number>(50)
  const [formPassingMarks, setFormPassingMarks] = useState<number>(18)
  const [formRankMethod, setFormRankMethod] = useState('Total Marks Percent')
  const [formDescription, setFormDescription] = useState('')

  // Marks Editing State inside Marks Modal
  const [currentMarksList, setCurrentMarksList] = useState<StudentMarksRecord[]>([])

  // Toast
  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('school_offline_tests')
    if (saved) {
      try {
        setTests(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_offline_tests', JSON.stringify(INITIAL_TESTS))
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  // Available dropdown options
  const classOptions = useMemo(() => {
    if (masterClasses && masterClasses.length > 0) {
      return masterClasses.map((c: any) => c.className || c.name || String(c))
    }
    return DEFAULT_CLASSES
  }, [masterClasses])

  const sectionOptions = useMemo(() => {
    if (masterSections && masterSections.length > 0) {
      return masterSections.map((s: any) => s.sectionName || s.name || String(s))
    }
    return DEFAULT_SECTIONS
  }, [masterSections])

  const subjectOptions = useMemo(() => {
    if (masterSubjects && masterSubjects.length > 0) {
      return masterSubjects.map((s: any) => s.subjectName || s.name || String(s))
    }
    return DEFAULT_SUBJECTS
  }, [masterSubjects])

  // Reset Create Form
  const resetCreateForm = () => {
    setFormClass(classOptions[0] || 'Class 10')
    setFormSection(sectionOptions[0] || 'A')
    setFormSubjects(['Mathematics', 'Science'])
    setFormTitle('')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormFromTime('09:00 AM')
    setFormToTime('11:00 AM')
    setFormTotalMarks(50)
    setFormPassingMarks(18)
    setFormRankMethod('Total Marks Percent')
    setFormDescription('')
  }

  const handleOpenCreateModal = () => {
    resetCreateForm()
    setCreateModalOpen(true)
  }

  // Handle Create Test Submit
  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      alert('Please enter a test title.')
      return
    }
    if (formSubjects.length === 0) {
      alert('Please select at least one subject.')
      return
    }

    const newTest: TestRecord = {
      id: Date.now(),
      className: formClass,
      section: formSection,
      subject: formSubjects.join(', '),
      subjectsList: formSubjects,
      title: formTitle.trim(),
      date: formDate || new Date().toISOString().split('T')[0],
      fromTime: formFromTime || '09:00 AM',
      toTime: formToTime || '11:00 AM',
      totalMarks: Number(formTotalMarks) || 50,
      passingMarks: Number(formPassingMarks) || 18,
      noOfStudents: 30,
      createdAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      description: formDescription.trim(),
      rankMethod: formRankMethod,
      status: 'Upcoming',
      studentMarks: SAMPLE_STUDENTS.map((st, i) => {
        const studentMarksObj: Record<string, string> = {}
        formSubjects.forEach(sub => {
          studentMarksObj[sub] = ''
        })
        return {
          id: st.id,
          studentName: st.studentName,
          rollNo: st.rollNo,
          marks: studentMarksObj,
          obtMarks: 0,
          totalMarks: formSubjects.length * (Number(formTotalMarks) || 50),
          percentage: '0.0%',
          rank: i + 1
        }
      })
    }

    const updated = [newTest, ...tests]
    setTests(updated)
    localStorage.setItem('school_offline_tests', JSON.stringify(updated))
    setCreateModalOpen(false)
    showToast('Offline / Weekly test scheduled successfully!')
  }

  // Open Update Marks Modal Popup
  const handleOpenMarksModal = (test: TestRecord) => {
    setSelectedTest(test)
    setActiveMenuId(null)

    // Build or prefill student marks
    if (test.studentMarks && test.studentMarks.length > 0) {
      setCurrentMarksList(test.studentMarks)
    } else {
      const generated = SAMPLE_STUDENTS.map((st, i) => {
        const marksObj: Record<string, string> = {}
        test.subjectsList.forEach(sub => {
          marksObj[sub] = ''
        })
        return {
          id: st.id,
          studentName: st.studentName,
          rollNo: st.rollNo,
          marks: marksObj,
          obtMarks: 0,
          totalMarks: test.subjectsList.length * test.totalMarks,
          percentage: '0.0%',
          rank: i + 1
        }
      })
      setCurrentMarksList(generated)
    }
    setMarksModalOpen(true)
  }

  // Student mark input change
  const handleStudentMarkChange = (studentId: number, subject: string, val: string) => {
    if (!selectedTest) return
    const updated = currentMarksList.map(st => {
      if (st.id === studentId) {
        const nextMarks = { ...st.marks, [subject]: val }
        let totalObt = 0
        selectedTest.subjectsList.forEach(sub => {
          const num = parseFloat(nextMarks[sub]) || 0
          totalObt += num
        })
        const maxTotal = selectedTest.subjectsList.length * selectedTest.totalMarks
        const pct = maxTotal > 0 ? ((totalObt / maxTotal) * 100).toFixed(1) + '%' : '0.0%'
        return {
          ...st,
          marks: nextMarks,
          obtMarks: totalObt,
          totalMarks: maxTotal,
          percentage: pct
        }
      }
      return st
    })

    // Auto-calculate ranks based on obtained marks descending
    const sorted = [...updated].sort((a, b) => b.obtMarks - a.obtMarks)
    const withRank = updated.map(st => {
      const rankIdx = sorted.findIndex(s => s.id === st.id)
      return {
        ...st,
        rank: st.obtMarks > 0 ? rankIdx + 1 : st.rank
      }
    })

    setCurrentMarksList(withRank)
  }

  // Save Marks Submit
  const handleSaveMarks = () => {
    if (!selectedTest) return
    const updatedTests = tests.map(t => {
      if (t.id === selectedTest.id) {
        return {
          ...t,
          status: 'Completed' as const,
          studentMarks: currentMarksList
        }
      }
      return t
    })
    setTests(updatedTests)
    localStorage.setItem('school_offline_tests', JSON.stringify(updatedTests))
    setMarksModalOpen(false)
    showToast('Student test marks saved successfully!')
  }

  // Delete Test
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this test?')) {
      const updated = tests.filter(t => t.id !== id)
      setTests(updated)
      localStorage.setItem('school_offline_tests', JSON.stringify(updated))
      setActiveMenuId(null)
      if (selectedTest?.id === id) {
        setMarksModalOpen(false)
        setDetailsModalOpen(false)
      }
      showToast('Test removed successfully!')
    }
  }

  // Open Details Modal Popup
  const handleOpenDetails = (test: TestRecord) => {
    setSelectedTest(test)
    setActiveMenuId(null)
    setDetailsModalOpen(true)
  }

  // Filtered List
  const filteredTests = useMemo(() => {
    return tests.filter(t => {
      if (filterClass && t.className !== filterClass) return false
      if (filterSection && t.section !== filterSection) return false
      if (filterStatus !== 'All' && t.status !== filterStatus) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchTitle = t.title.toLowerCase().includes(q)
        const matchClass = t.className.toLowerCase().includes(q)
        const matchSubject = t.subject.toLowerCase().includes(q)
        return matchTitle || matchClass || matchSubject
      }
      return true
    })
  }, [tests, filterClass, filterSection, filterStatus, searchQuery])

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = tests.length
    const upcoming = tests.filter(t => t.status === 'Upcoming').length
    const completed = tests.filter(t => t.status === 'Completed').length
    const evaluatedStudents = tests.reduce((acc, t) => acc + (t.studentMarks?.length || 0), 0)
    return { total, upcoming, completed, evaluatedStudents }
  }, [tests])

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* ════════════════════════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-800 dark:text-white">Offline & Weekly Tests</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {tests.length} tests
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Schedule classroom tests, unit assessments, and update student marks directly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center gap-2 font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Test</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          METRIC CARDS OVERVIEW
      ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Tests</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1.5">{metrics.total}</p>
          <span className="text-[11px] text-slate-400 font-semibold">Scheduled in session</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Upcoming Tests</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5">{metrics.upcoming}</p>
          <span className="text-[11px] text-slate-400 font-semibold">Pending examination</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">{metrics.completed}</p>
          <span className="text-[11px] text-slate-400 font-semibold">Marks recorded</span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Students Evaluated</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1.5">{metrics.evaluatedStudents}</p>
          <span className="text-[11px] text-slate-400 font-semibold">Rankings generated</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          FILTER BAR
      ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search by Title, Class, or Subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 outline-none focus:border-teal-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Class Filter */}
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="">All Classes</option>
            {classOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Section Filter */}
          <select
            value={filterSection}
            onChange={e => setFilterSection(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="">All Sections</option>
            {sectionOptions.map(s => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>
        </div>

        {/* Status Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
          {['All', 'Upcoming', 'Completed'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TESTS TABLE
      ════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700 font-semibold text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">#</th>
                <th className="px-4 py-3.5">Test Title & Description</th>
                <th className="px-4 py-3.5">Class / Sec</th>
                <th className="px-4 py-3.5">Subjects</th>
                <th className="px-4 py-3.5">Schedule</th>
                <th className="px-4 py-3.5 text-center">Marks</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredTests.map((test, idx) => (
                <tr key={test.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3.5 text-center text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3.5 max-w-xs">
                    <p className="font-bold text-slate-800 dark:text-white line-clamp-1">
                      {test.title}
                    </p>
                    {test.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {test.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs">
                      {test.className} • {test.section}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {test.subjectsList.map((sub, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>{test.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{test.fromTime} - {test.toTime}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{test.totalMarks}</span>
                    <span className="text-[10px] text-slate-400 block">Pass: {test.passingMarks}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                      test.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${test.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {test.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenMarksModal(test)}
                        className="px-3 py-1.5 rounded-xl font-bold text-xs bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Update Marks"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Marks</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDetails(test)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(test.id)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete Test"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTests.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-sm">No Tests Found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria or create a new test.</p>
                    <button
                      type="button"
                      onClick={handleOpenCreateModal}
                      className="mt-3 px-4 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      + Create First Test
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          CREATE TEST MODAL POPUP
      ════════════════════════════════════════════════════════════════ */}
      {createModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-xs font-semibold text-slate-700 dark:text-slate-200 max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Schedule Offline / Weekly Test
                </h3>
                <p className="text-[11px] text-slate-400">Configure classroom assessment details and subjects.</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTest} className="space-y-4">
              
              {/* Class & Section Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formClass}
                    onChange={e => setFormClass(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500"
                    required
                  >
                    {classOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formSection}
                    onChange={e => setFormSection(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500"
                    required
                  >
                    {sectionOptions.map(s => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Test Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Test Title / Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Math Test 4, Physics Unit Assessment"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500"
                  required
                />
              </div>

              {/* Subjects Selection */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Subjects Covered <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Click to add/remove</span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-h-[44px]">
                  {subjectOptions.map(sub => {
                    const isSelected = formSubjects.includes(sub)
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormSubjects(formSubjects.filter(s => s !== sub))
                          } else {
                            setFormSubjects([...formSubjects, sub])
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {sub}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Schedule Date & Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold bg-white dark:bg-slate-900 outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    From Time
                  </label>
                  <input
                    type="text"
                    placeholder="09:00 AM"
                    value={formFromTime}
                    onChange={e => setFormFromTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold bg-white dark:bg-slate-900 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    To Time
                  </label>
                  <input
                    type="text"
                    placeholder="11:00 AM"
                    value={formToTime}
                    onChange={e => setFormToTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold bg-white dark:bg-slate-900 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Total Marks & Passing Marks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Marks per Subject
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={formTotalMarks}
                    onChange={e => setFormTotalMarks(parseInt(e.target.value) || 50)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formPassingMarks}
                    onChange={e => setFormPassingMarks(parseInt(e.target.value) || 18)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Rank Generation
                  </label>
                  <select
                    value={formRankMethod}
                    onChange={e => setFormRankMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold bg-white dark:bg-slate-900 outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="Total Marks Percent">Percentage</option>
                    <option value="Subject Weightage">Weightage</option>
                    <option value="Total Marks">Total Marks</option>
                  </select>
                </div>
              </div>

              {/* Description / Syllabus Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Syllabus Covered & Chapters Included
                </label>
                <textarea
                  placeholder="Detail the chapters, formula sheets, or special instructions..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold outline-none h-20 resize-none bg-white dark:bg-slate-900 text-xs focus:border-teal-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs text-xs transition-colors cursor-pointer"
                >
                  Schedule Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          UPDATE STUDENT MARKS MODAL POPUP
      ════════════════════════════════════════════════════════════════ */}
      {marksModalOpen && selectedTest && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setMarksModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-xs font-semibold text-slate-700 dark:text-slate-200 max-h-[92vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-800 dark:text-white">
                    Update Student Marks: {selectedTest.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    {selectedTest.className} - {selectedTest.section}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Max marks per subject: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedTest.totalMarks}</span> • Passing: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedTest.passingMarks}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMarksModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student Marks Table */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-700">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold text-[11px] uppercase border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 w-10">Roll</th>
                    <th className="px-3 py-3 text-left">Student Name</th>
                    {selectedTest.subjectsList.map(sub => (
                      <th key={sub} className="px-3 py-3">{sub}</th>
                    ))}
                    <th className="px-3 py-3 w-20">Obt. Marks</th>
                    <th className="px-3 py-3 w-20">Percentage</th>
                    <th className="px-3 py-3 w-16">Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {currentMarksList.map(st => (
                    <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-slate-400 font-bold">{st.rollNo}</td>
                      <td className="px-3 py-2.5 text-left font-bold text-slate-800 dark:text-white">
                        {st.studentName}
                      </td>
                      {selectedTest.subjectsList.map(sub => (
                        <td key={sub} className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            max={selectedTest.totalMarks}
                            value={st.marks[sub] || ''}
                            onChange={e => handleStudentMarkChange(st.id, sub, e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 text-center font-bold border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none focus:border-teal-500"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-white">
                        {st.obtMarks} / {st.totalMarks}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {st.percentage}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          #{st.rank}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700 shrink-0">
              <span className="text-[11px] text-slate-400">
                Obtained marks & rankings update in real time as you input scores.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMarksModalOpen(false)}
                  className="px-5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMarks}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs text-xs transition-colors cursor-pointer"
                >
                  Save Marks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          VIEW TEST DETAILS MODAL POPUP
      ════════════════════════════════════════════════════════════════ */}
      {detailsModalOpen && selectedTest && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setDetailsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 duration-150 text-xs font-semibold text-slate-700 dark:text-slate-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                  selectedTest.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {selectedTest.status} Assessment
                </span>
                <h3 className="text-base font-black text-slate-800 dark:text-white mt-1">
                  {selectedTest.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Class & Section</span>
                <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">
                  {selectedTest.className} - {selectedTest.section}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Date & Timing</span>
                <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">
                  {selectedTest.date} ({selectedTest.fromTime} - {selectedTest.toTime})
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Subjects</span>
                <span className="font-bold text-teal-700 dark:text-teal-400 mt-0.5 block">
                  {selectedTest.subject}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Total / Passing Marks</span>
                <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">
                  {selectedTest.totalMarks} Marks (Pass: {selectedTest.passingMarks})
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Syllabus / Notes</span>
              <p className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedTest.description || 'No additional syllabus notes specified.'}
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleDelete(selectedTest.id)}
                className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDetailsModalOpen(false)
                    handleOpenMarksModal(selectedTest)
                  }}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                >
                  Update Marks
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

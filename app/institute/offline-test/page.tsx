'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, Pencil, Trash2, X, CheckCircle2, MoreVertical, Edit2, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TestRecord {
  id: number
  className: string
  section: string
  subject: string
  title: string
  date: string
  fromTime: string
  toTime: string
  noOfStudents: number
  createdAt: string
  description?: string
  rankMethod?: string
}

interface StudentMarksRecord {
  id: number
  studentName: string
  hindi: string
  hindiPrac: string
  english: string
  math: string
  obtMarks: number
  totalMarks: number
  percentage: string
  rank: number
}

const INITIAL_TESTS: TestRecord[] = [
]

const INITIAL_STUDENT_MARKS: StudentMarksRecord[] = [
]

export default function OfflineTestPage() {
  const [view, setView] = useState<'list' | 'create' | 'marks'>('list')
  const [tests, setTests] = useState<TestRecord[]>(INITIAL_TESTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)

  // Filter Form State
  const [filterFromDate, setFilterFromDate] = useState('')
  const [filterToDate, setFilterToDate] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterTitle, setFilterTitle] = useState('')

  // Create Test Form State
  const [createClass, setCreateClass] = useState('')
  const [createSection, setCreateSection] = useState('')
  const [createSubjects, setCreateSubjects] = useState<string[]>(['Hindi', 'English', 'Math'])
  const [testTitle, setTestTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [fromTime, setFromTime] = useState('')
  const [toTime, setToTime] = useState('')
  const [description, setDescription] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  )
  const [rankMethod, setRankMethod] = useState('')

  // Update Marks State
  const [selectedTest, setSelectedTest] = useState<TestRecord | null>(null)
  const [studentMarks, setStudentMarks] = useState<StudentMarksRecord[]>(INITIAL_STUDENT_MARKS)

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const savedTests = localStorage.getItem('school_offline_tests')
    if (savedTests) {
      try {
        setTests(JSON.parse(savedTests))
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

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this test?')) {
      const updated = tests.filter(t => t.id !== id)
      setTests(updated)
      localStorage.setItem('school_offline_tests', JSON.stringify(updated))
      setActiveMenuId(null)
      showToast('Test deleted successfully!')
    }
  }

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createClass || !createSection || !testTitle || !startDate) {
      alert('Please fill in all mandatory fields.')
      return
    }

    const newTest: TestRecord = {
      id: Date.now(),
      className: createClass,
      section: createSection,
      subject: createSubjects.join(', '),
      title: testTitle,
      date: startDate ? new Date(startDate).toLocaleDateString('en-GB') : '12/12/2025',
      fromTime: fromTime || '12:00 PM',
      toTime: toTime || '01:00 PM',
      noOfStudents: 30,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      description,
      rankMethod
    }

    const updated = [newTest, ...tests]
    setTests(updated)
    localStorage.setItem('school_offline_tests', JSON.stringify(updated))

    // Reset Form
    setCreateClass('')
    setCreateSection('')
    setTestTitle('')
    setStartDate('')
    setFromTime('')
    setToTime('')
    setRankMethod('')
    setView('list')
    showToast('Offline test created successfully!')
  }

  const handleOpenUpdateMarks = (test: TestRecord) => {
    setSelectedTest(test)
    setActiveMenuId(null)
    setView('marks')
  }

  const handleMarkChange = (studentId: number, field: keyof StudentMarksRecord, value: string) => {
    const updated = studentMarks.map(student => {
      if (student.id === studentId) {
        const updatedStudent = { ...student, [field]: value }
        
        // Calculate obtained marks dynamically (sum of Hindi, Hindi Practical, English, Math)
        const hindiVal = parseFloat(updatedStudent.hindi) || 0
        const hindiPracVal = parseFloat(updatedStudent.hindiPrac) || 0
        const englishVal = parseFloat(updatedStudent.english) || 0
        const mathVal = parseFloat(updatedStudent.math) || 0
        
        const sum = hindiVal + hindiPracVal + englishVal + mathVal
        updatedStudent.obtMarks = sum
        
        // Calculate percentage
        const percent = ((sum / student.totalMarks) * 100).toFixed(1) + '%'
        updatedStudent.percentage = percent
        
        return updatedStudent
      }
      return student
    })
    setStudentMarks(updated)
  }

  const handleUpdateStudentMarks = (studentId: number) => {
    showToast('Student marks updated successfully!')
  }

  const handleClearFilters = () => {
    setFilterFromDate('')
    setFilterToDate('')
    setFilterClass('')
    setFilterSection('')
    setFilterSubject('')
    setFilterTitle('')
  }

  const filteredTests = tests.filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.className.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterClass && t.className !== filterClass) return false
    if (filterSection && t.section !== filterSection) return false
    if (filterSubject && !t.subject.toLowerCase().includes(filterSubject.toLowerCase())) return false
    if (filterTitle && !t.title.toLowerCase().includes(filterTitle.toLowerCase())) return false
    return true
  })

  // Basic Editor Toolbar
  const TextToolbar = () => (
    <div className="flex items-center gap-0.5 border-b border-slate-200 px-3 py-1.5 bg-slate-50 rounded-t-lg overflow-x-auto text-[10px] font-bold text-slate-500">
      <select className="px-1.5 py-1 border rounded bg-white text-slate-655 outline-none cursor-pointer">
        <option>Paragraph 1</option>
      </select>
      <select className="px-1.5 py-1 border rounded bg-white text-slate-655 outline-none ml-1 cursor-pointer">
        <option>12 px</option>
      </select>
      {['B', 'I', 'U', '≡', '⊟', '≡', '⊞', '🔗', '📷', '■', '■'].map((btn, i) => (
        <button key={i} type="button" className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 rounded transition-colors">{btn}</button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      {view === 'list' && (
        <>
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-800">Offline/Weekly Test</h1>
              <p className="text-xs text-slate-400">Manage classroom test events and student test marks</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-56 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search by Name, Mobile no..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
                />
              </div>
              <button
                onClick={() => setFilterOpen(true)}
                className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-sm"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('create')}
                className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Listing Table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 font-black text-slate-655 border-b">
                  <tr>
                    <th className="px-3 py-4 w-14">S. No.</th>
                    <th className="px-3 py-4">Class</th>
                    <th className="px-3 py-4">Section</th>
                    <th className="px-3 py-4">Subject</th>
                    <th className="px-3 py-4 text-left">Test Title</th>
                    <th className="px-3 py-4">Date</th>
                    <th className="px-3 py-4">From Time</th>
                    <th className="px-3 py-4">To Time</th>
                    <th className="px-3 py-4">No. of Students</th>
                    <th className="px-3 py-4 w-36">Created At</th>
                    <th className="px-3 py-4 w-16">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold relative">
                      <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.className}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.section}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.subject}</td>
                      <td className="px-3 py-3.5 text-left font-bold text-slate-850 max-w-[140px] truncate">{item.title}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.date}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.fromTime}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.toTime}</td>
                      <td className="px-3 py-3.5 text-slate-650">{item.noOfStudents}</td>
                      <td className="px-3 py-3.5 text-slate-450 whitespace-pre-line leading-tight text-[10px]">
                        {item.createdAt}
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 mx-auto transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-slate-550" />
                        </button>
                        {activeMenuId === item.id && (
                          <div className="absolute right-4 top-10 bg-white border rounded-xl shadow-xl z-20 py-1.5 w-36 animate-in fade-in zoom-in-95 duration-150 text-left">
                            <button
                              type="button"
                              onClick={() => handleOpenUpdateMarks(item)}
                              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 text-xs font-bold text-slate-600"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-500" /> Update Marks
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-red-50 text-xs font-bold text-red-550"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredTests.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400 font-bold">
                        No tests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-slate-400 font-semibold">
              <p>Showing 1-{filteredTests.length} of {filteredTests.length} Entries</p>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">«</button>
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">‹</button>
                <button className="w-7 h-7 rounded bg-teal-600 text-white flex items-center justify-center font-bold">1</button>
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-500 hover:bg-slate-50">2</button>
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">›</button>
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">»</button>
              </div>
            </div>
          </div>
        </>
      )}

      {view === 'create' && (
        /* CREATE TEST SCREEN */
        <div className="animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-black text-slate-800">Create Test</h1>
              <p className="text-xs text-slate-400">Configure new classroom syllabus test</p>
            </div>
            <button
              onClick={() => setView('list')}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={handleCreateTest}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 text-xs font-semibold text-slate-700"
          >
            {/* Class Information */}
            <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
              <legend className="px-3 text-sm font-black text-[#1b3a60]">Class Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Class <span className="text-red-500">*</span></label>
                  <select
                    value={createClass}
                    onChange={e => setCreateClass(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg font-bold bg-white outline-none"
                  >
                    <option value="">Select Class</option>
                    {['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VIII'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Section <span className="text-red-500">*</span></label>
                  <select
                    value={createSection}
                    onChange={e => setCreateSection(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg font-bold bg-white outline-none"
                  >
                    <option value="">Select Section</option>
                    {['Section A', 'Section B', 'Section C', 'Section D'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Subject <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap items-center gap-2 px-4 py-2 border rounded-lg min-h-[42px] bg-slate-55">
                  {createSubjects.map(sub => (
                    <span key={sub} className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] font-black border border-teal-200">
                      {sub}
                      <button
                        type="button"
                        onClick={() => setCreateSubjects(createSubjects.filter(s => s !== sub))}
                        className="text-teal-500 hover:text-teal-750"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <select
                    onChange={e => {
                      if (e.target.value && !createSubjects.includes(e.target.value)) {
                        setCreateSubjects([...createSubjects, e.target.value])
                      }
                      e.target.value = ''
                    }}
                    className="text-[10px] font-bold outline-none bg-transparent text-slate-400 cursor-pointer"
                  >
                    <option value="">+ Add Subject</option>
                    {['Hindi', 'Science', 'English', 'Math'].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Test Information */}
            <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
              <legend className="px-3 text-sm font-black text-[#1b3a60]">Test Information</legend>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Test Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter Test Title"
                  value={testTitle}
                  onChange={e => setTestTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Start Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">From Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={fromTime}
                    onChange={e => setFromTime(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">To Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={toTime}
                    onChange={e => setToTime(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Description about the test (Covering the Syllabus/Chapters)</label>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <TextToolbar />
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-3 font-semibold outline-none h-24 resize-none leading-relaxed text-slate-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 max-w-xs">
                <label className="text-slate-500 font-bold">Rank Generation Method</label>
                <select
                  value={rankMethod}
                  onChange={e => setRankMethod(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg font-bold bg-white outline-none"
                >
                  <option value="">Select an Option</option>
                  <option value="Total Marks Percent">Total Marks Percent</option>
                  <option value="Subject Weightage">Subject Weightage</option>
                </select>
              </div>
            </fieldset>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'marks' && selectedTest && (
        /* UPDATE TEST MARKS SCREEN */
        <div className="animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('list')}
                className="w-8 h-8 flex items-center justify-center rounded-full border bg-white hover:bg-slate-50 text-slate-500 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-black text-slate-800">Update Test Marks</h1>
                <p className="text-xs text-slate-400">Class: <span className="font-bold text-slate-700">{selectedTest.className}</span> | Section: <span className="font-bold text-slate-700">{selectedTest.section}</span></p>
              </div>
            </div>
            <button
              onClick={() => setView('list')}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 font-black text-slate-655 border-b">
                  <tr>
                    <th className="px-3 py-4 w-14">S. No.</th>
                    <th className="px-3 py-4 text-left">Student</th>
                    <th className="px-3 py-4">Hindi</th>
                    <th className="px-3 py-4">Hindi Practical</th>
                    <th className="px-3 py-4">English</th>
                    <th className="px-3 py-4">Math</th>
                    <th className="px-3 py-4 w-20">Obt. Marks</th>
                    <th className="px-3 py-4 w-20">Total Marks</th>
                    <th className="px-3 py-4 w-20">Percentage</th>
                    <th className="px-3 py-4 w-16">Rank</th>
                    <th className="px-3 py-4 w-24">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMarks.map((student, idx) => (
                    <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                      <td className="px-3 py-3.5 text-slate-500">{idx + 1}</td>
                      <td className="px-3 py-3.5 text-left font-bold text-slate-800">{student.studentName}</td>
                      <td className="px-3 py-3.5">
                        <input
                          type="text"
                          value={student.hindi}
                          onChange={e => handleMarkChange(student.id, 'hindi', e.target.value)}
                          className="w-16 px-2 py-1 text-center border rounded font-bold outline-none focus:border-teal-500"
                        />
                      </td>
                      <td className="px-3 py-3.5">
                        <input
                          type="text"
                          value={student.hindiPrac}
                          onChange={e => handleMarkChange(student.id, 'hindiPrac', e.target.value)}
                          className="w-16 px-2 py-1 text-center border rounded font-bold outline-none focus:border-teal-500"
                        />
                      </td>
                      <td className="px-3 py-3.5">
                        <input
                          type="text"
                          value={student.english}
                          onChange={e => handleMarkChange(student.id, 'english', e.target.value)}
                          className="w-16 px-2 py-1 text-center border rounded font-bold outline-none focus:border-teal-500"
                        />
                      </td>
                      <td className="px-3 py-3.5">
                        <input
                          type="text"
                          value={student.math}
                          onChange={e => handleMarkChange(student.id, 'math', e.target.value)}
                          className="w-16 px-2 py-1 text-center border rounded font-bold outline-none focus:border-teal-500"
                        />
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="font-bold text-slate-700">{student.obtMarks}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="w-16 py-1 bg-slate-100 text-center font-bold text-slate-500 rounded border">{student.totalMarks}</div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="w-16 py-1 bg-slate-100 text-center font-bold text-slate-550 rounded border">{student.percentage}</div>
                      </td>
                      <td className="px-3 py-3.5">
                        <input
                          type="number"
                          value={student.rank}
                          onChange={e => handleMarkChange(student.id, 'rank', e.target.value)}
                          className="w-12 px-1 py-1 text-center border rounded font-bold outline-none focus:border-teal-500"
                        />
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateStudentMarks(student.id)}
                          className="px-4 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold transition-all text-[10px]"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-slate-400 font-semibold">
              <p>Showing 1-3 of 458 Entries</p>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">«</button>
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">‹</button>
                <button className="w-7 h-7 rounded bg-teal-600 text-white flex items-center justify-center font-bold">1</button>
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-550 hover:bg-slate-50">2</button>
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">›</button>
                <button className="w-7 h-7 rounded border flex items-center justify-center text-slate-300">»</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER MODAL */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setFilterOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800">Filter Offline Tests</h3>
              <button onClick={() => setFilterOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">From Date</label>
                <input type="date" value={filterFromDate} onChange={e => setFilterFromDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">To Date</label>
                <input type="date" value={filterToDate} onChange={e => setFilterToDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Class</label>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select class</option>
                  {['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VIII'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Section</label>
                <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select section</option>
                  {['Section A', 'Section B', 'Section C', 'Section D'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Subject</label>
                <input type="text" placeholder="Enter Subject" value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Test Title</label>
                <input type="text" placeholder="Enter Title" value={filterTitle} onChange={e => setFilterTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none" />
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => setFilterOpen(false)}
                className="px-8 py-2.5 bg-teal-650 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md text-xs"
              >
                Filter
              </button>
              <button
                onClick={handleClearFilters}
                className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors text-xs"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}

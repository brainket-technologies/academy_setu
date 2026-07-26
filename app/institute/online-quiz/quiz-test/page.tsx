'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Pencil, Trash2, X, CheckCircle2, Clock, Award, Check, Eye, HelpCircle, ArrowRight, ArrowLeft, Image as ImageIcon, Upload, FileText } from 'lucide-react'

interface QuizRecord {
  id: number
  className: string
  section: string
  title: string
  totalQus: number
  maxMarks: number
  passMarks: number
  markPerAns: number
  negMark: string
  totalAttempt: number
  createdAt: string
  status: 'Active' | 'Inactive'
  testType: 'Online Test' | 'Practice'
  subjects: string[]
  allowMultipleAttempts: boolean
  randomizePerUser: boolean
  randomizePerAttempt: boolean
  examDate?: string
  examTime?: string
  resultDate?: string
  instructions?: string
}

interface QuestionItem {
  id: number
  subject: string
  type: string
  text: string
  option1: string
  option2: string
  option3?: string
  option4?: string
  answer: string
}

const INITIAL_QUIZZES: QuizRecord[] = [
]

const ALL_QUESTIONS: QuestionItem[] = [
  { id: 1, subject: 'Hindi', type: 'MCQ', text: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', option1: 'lorem ipsum dolor sit amet', option2: 'lorem ipsum dolor sit amet', option3: 'lorem ipsum dolor sit amet', option4: 'lorem ipsum dolor sit amet', answer: 'Option 1' },
  { id: 2, subject: 'Hindi', type: 'MCQ', text: 'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', option1: 'lorem ipsum dolor sit amet', option2: 'lorem ipsum dolor sit amet', option3: 'lorem ipsum dolor sit amet', option4: 'lorem ipsum dolor sit amet', answer: 'Option 2' },
  { id: 3, subject: 'Math', type: 'MCQ', text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', option1: 'lorem ipsum dolor sit amet', option2: 'lorem ipsum dolor sit amet', option3: 'lorem ipsum dolor sit amet', option4: 'lorem ipsum dolor sit amet', answer: 'Option 3' },
  { id: 4, subject: 'Math', type: 'MCQ', text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', option1: 'lorem ipsum dolor sit amet', option2: 'lorem ipsum dolor sit amet', option3: 'lorem ipsum dolor sit amet', option4: 'lorem ipsum dolor sit amet', answer: 'Option 1' },
  { id: 5, subject: 'English', type: 'MCQ', text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.', option1: 'lorem ipsum dolor sit amet', option2: 'lorem ipsum dolor sit amet', option3: 'lorem ipsum dolor sit amet', option4: 'lorem ipsum dolor sit amet', answer: 'Option 4' },
]

export default function QuizTestPage() {
  const [view, setView] = useState<'list' | 'add'>('list')
  const [quizzes, setQuizzes] = useState<QuizRecord[]>(INITIAL_QUIZZES)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)

  // Stepper state
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1: Class & Subject
  const [quizTitle, setQuizTitle] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [testType, setTestType] = useState<'Online Test' | 'Practice'>('Online Test')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Hindi', 'English', 'Math'])
  const [pickedQuestionIds, setPickedQuestionIds] = useState<number[]>([1, 2, 3, 4])

  // Modals inside step 1
  const [pickModalOpen, setPickModalOpen] = useState(false)
  const [selectedQuestionModalOpen, setSelectedQuestionModalOpen] = useState(false)
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)

  // Step 2: Marks
  const [markPerAns, setMarkPerAns] = useState(5)
  const [negMark, setNegMark] = useState('No Negative Mark')
  const [passMarks, setPassMarks] = useState(15)
  const [maxTestTime, setMaxTestTime] = useState('30')
  const [allowMultipleAttempts, setAllowMultipleAttempts] = useState(false)
  const [randomizePerUser, setRandomizePerUser] = useState(false)
  const [randomizePerAttempt, setRandomizePerAttempt] = useState(false)
  const [instructions, setInstructions] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  )
  const [examDate, setExamDate] = useState('')
  const [examTime, setExamTime] = useState('')
  const [resultDate, setResultDate] = useState('')

  // Pick question modal search/filters
  const [modalSubject, setModalSubject] = useState('')
  const [modalBook, setModalBook] = useState('')
  const [modalQType, setModalQType] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_quizzes')
    if (saved) {
      try {
        setQuizzes(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_quizzes', JSON.stringify(INITIAL_QUIZZES))
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const toggleStatus = (id: number, currentStatus: 'Active' | 'Inactive') => {
    const updated = quizzes.map(q => q.id === id ? { ...q, status: (currentStatus === 'Active' ? 'Inactive' : 'Active') as 'Active' | 'Inactive' } : q)
    setQuizzes(updated)
    localStorage.setItem('school_quizzes', JSON.stringify(updated))
    setActiveMenuId(null)
    showToast(`Status changed to ${currentStatus === 'Active' ? 'Inactive' : 'Active'}!`)
  }

  const handleDelete = (id: number) => {
    if (confirm('Delete this quiz/test?')) {
      const updated = quizzes.filter(q => q.id !== id)
      setQuizzes(updated)
      localStorage.setItem('school_quizzes', JSON.stringify(updated))
      setActiveMenuId(null)
      showToast('Quiz deleted successfully!')
    }
  }

  const handleNextStep = () => {
    if (!quizTitle || !selectedClass || !selectedSection) {
      alert('Please fill in Test Title, Class, and Section.')
      return
    }
    setStep(2)
  }

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault()

    const newQuiz: QuizRecord = {
      id: Date.now(),
      className: selectedClass,
      section: selectedSection,
      title: quizTitle,
      totalQus: pickedQuestionIds.length,
      maxMarks: pickedQuestionIds.length * markPerAns,
      passMarks,
      markPerAns,
      negMark,
      totalAttempt: 0,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Active',
      testType,
      subjects: selectedSubjects,
      allowMultipleAttempts,
      randomizePerUser,
      randomizePerAttempt,
      examDate,
      examTime,
      resultDate,
      instructions
    }

    const updated = [newQuiz, ...quizzes]
    setQuizzes(updated)
    localStorage.setItem('school_quizzes', JSON.stringify(updated))

    // Reset Form
    setQuizTitle('')
    setSelectedClass('')
    setSelectedSection('')
    setPickedQuestionIds([1, 2, 3, 4])
    setMarkPerAns(5)
    setNegMark('No Negative Mark')
    setPassMarks(15)
    setStep(1)
    setView('list')
    showToast('Quiz/Test created successfully!')
  }

  const totalQuizCount = quizzes.length
  const activeQuizCount = quizzes.filter(q => q.status === 'Active').length

  const filtered = quizzes.filter(q => {
    if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase()) && !q.className.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (statusFilter === 'Active' && q.status !== 'Active') return false
    if (statusFilter === 'Inactive' && q.status !== 'Inactive') return false
    return true
  })

  const togglePickQuestion = (id: number) => {
    if (pickedQuestionIds.includes(id)) {
      setPickedQuestionIds(pickedQuestionIds.filter(qId => qId !== id))
    } else {
      setPickedQuestionIds([...pickedQuestionIds, id])
    }
  }

  // Open detailed preview modal for picked questions
  const openPreview = (qId: number) => {
    const idx = pickedQuestionIds.indexOf(qId)
    if (idx !== -1) {
      setActivePreviewIndex(idx)
      setSelectedQuestionModalOpen(true)
    }
  }

  const currentPreviewQuestion = ALL_QUESTIONS.find(q => q.id === pickedQuestionIds[activePreviewIndex])

  // Simple rich text toolbar for step 2 instruction editor
  const TextToolbar = () => (
    <div className="flex items-center gap-0.5 border-b border-slate-200 px-3 py-1.5 bg-slate-50 rounded-t-lg overflow-x-auto text-[10px] font-bold text-slate-500">
      <select className="px-1.5 py-1 border rounded bg-white text-slate-650 outline-none">
        <option>Paragraph 1</option>
      </select>
      <select className="px-1.5 py-1 border rounded bg-white text-slate-650 outline-none ml-1">
        <option>12 px</option>
      </select>
      {['B', 'I', 'U', '≡', '⊟', '≡', '⊞', '🔗', '📷', '■', '■'].map((btn, i) => (
        <button key={i} type="button" className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 rounded transition-colors">{btn}</button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      {view === 'list' ? (
        <>
          {/* Header Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black text-slate-800">Quiz/Test</h1>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-black">
                  Total Quiz/Test <span className="bg-purple-100 px-1.5 py-0.5 rounded text-[10px]">{totalQuizCount}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black">
                  Active Quiz/Test <span className="bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">{activeQuizCount}</span>
                </span>
              </div>
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
                onClick={() => setView('add')}
                className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStatusFilter('All')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${statusFilter === 'All' ? 'bg-purple-50 text-purple-700 font-extrabold border border-purple-200' : 'bg-white border text-slate-650 hover:bg-slate-50'}`}
            >
              Total Quiz/Test <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-700">{String(totalQuizCount).padStart(2, '0')}</span>
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${statusFilter === 'Active' ? 'bg-blue-50 text-blue-700 font-extrabold border border-blue-200' : 'bg-white border text-slate-650 hover:bg-slate-50'}`}
            >
              Active Quiz/Test <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-700">{String(activeQuizCount).padStart(2, '0')}</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 font-black text-slate-655 border-b">
                  <tr>
                    <th className="px-3 py-4 w-14">S. No.</th>
                    <th className="px-3 py-4">Class</th>
                    <th className="px-3 py-4">Section</th>
                    <th className="px-3 py-4 text-left">Title</th>
                    <th className="px-3 py-4">Total Qus.</th>
                    <th className="px-3 py-4">Max. Marks</th>
                    <th className="px-3 py-4">Pass. Marks</th>
                    <th className="px-3 py-4">Mark per Ans</th>
                    <th className="px-3 py-4">Neg. Mark</th>
                    <th className="px-3 py-4">Total Attempt</th>
                    <th className="px-3 py-4 w-36">Created At</th>
                    <th className="px-3 py-4">Status</th>
                    <th className="px-3 py-4 w-16">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold relative">
                      <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.className}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.section}</td>
                      <td className="px-3 py-3.5 text-left font-bold text-slate-850 max-w-[140px] truncate">{item.title}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.totalQus}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.maxMarks}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.passMarks}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.markPerAns}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.negMark}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.totalAttempt}</td>
                      <td className="px-3 py-3.5 text-slate-450 whitespace-pre-line leading-tight text-[10px]">
                        {item.createdAt}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                          • {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 mx-auto transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-550" />
                        </button>
                        {activeMenuId === item.id && (
                          <div className="absolute right-4 top-10 bg-white border rounded-xl shadow-xl z-20 py-1.5 w-32 animate-in fade-in zoom-in-95 duration-150 text-left">
                            <button
                              onClick={() => toggleStatus(item.id, item.status)}
                              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 text-xs font-bold text-slate-600"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              {item.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => alert(`View details for ${item.title}`)}
                              className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-slate-50 text-xs font-bold text-slate-600"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500" /> View Details
                            </button>
                            <button
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
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={13} className="py-8 text-center text-slate-400 font-bold">
                        No tests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-slate-400 font-semibold">
              <p>Showing 1-{filtered.length} of {filtered.length} Entries</p>
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
      ) : (
        /* CREATE TEST WIZARD */
        <div className="animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-black text-slate-800">Create Quiz/Test</h1>
              <p className="text-xs text-slate-400">Set parameters and choose test question assets</p>
            </div>
            <button
              onClick={() => { setView('list'); setStep(1); }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Custom Stepper Steps */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${step === 1 ? 'bg-teal-600 text-white shadow-md' : 'bg-white border text-slate-500'}`}
            >
              Class & Subject
            </button>
            <div className="w-16 h-0.5 bg-slate-200" />
            <button
              type="button"
              onClick={handleNextStep}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${step === 2 ? 'bg-teal-600 text-white shadow-md' : 'bg-white border text-slate-500'}`}
            >
              {step === 2 && <Check className="w-4 h-4 text-emerald-450 mr-1" />} Marks
            </button>
          </div>

          <form onSubmit={handleCreateQuiz}>
            {step === 1 ? (
              /* STEP 1: CLASS & SUBJECT */
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 text-xs font-semibold text-slate-700">
                <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
                  <legend className="px-3 text-sm font-black text-[#1b3a60]">Class Information</legend>

                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="text-slate-500 font-bold">Quiz / Test Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter Quiz Title"
                      value={quizTitle}
                      onChange={e => setQuizTitle(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold">Class <span className="text-red-500">*</span></label>
                      <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white"
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
                        value={selectedSection}
                        onChange={e => setSelectedSection(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white"
                      >
                        <option value="">Select Section</option>
                        {['Section A', 'Section B', 'Section C', 'Section D'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold">Test Type <span className="text-red-500">*</span></label>
                      <select
                        value={testType}
                        onChange={e => setTestType(e.target.value as 'Online Test' | 'Practice')}
                        className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white"
                      >
                        <option value="Online Test">Online Test</option>
                        <option value="Practice">Practice</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 font-bold">Subject <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap items-center gap-2 px-4 py-2 border rounded-lg min-h-[42px] bg-slate-50">
                      {selectedSubjects.map(sub => (
                        <span key={sub} className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] font-black border border-teal-200">
                          {sub}
                          <button
                            type="button"
                            onClick={() => setSelectedSubjects(selectedSubjects.filter(s => s !== sub))}
                            className="text-teal-500 hover:text-teal-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <select
                        onChange={e => {
                          if (e.target.value && !selectedSubjects.includes(e.target.value)) {
                            setSelectedSubjects([...selectedSubjects, e.target.value])
                          }
                          e.target.value = ''
                        }}
                        className="text-[10px] font-bold outline-none bg-transparent text-slate-400 cursor-pointer"
                      >
                        <option value="">+ Add Subject</option>
                        {['Hindi', 'Science', 'English', 'Math', 'Geography'].map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pick Question Trigger Button */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setPickModalOpen(true)}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md flex items-center gap-2 transition-colors text-xs"
                    >
                      <Plus className="w-4 h-4" /> Pick Question
                    </button>
                  </div>
                </fieldset>

                {/* Selected Questions Table inside wizard */}
                <div className="border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-black text-[#1b3a60]">Selected Questions List</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs bg-white">
                    <table className="w-full text-center border-collapse">
                      <thead className="bg-slate-50 font-black text-slate-655 border-b">
                        <tr>
                          <th className="px-3 py-3 w-12">S. No.</th>
                          <th className="px-3 py-3">Subject</th>
                          <th className="px-3 py-3">Type</th>
                          <th className="px-3 py-3 text-left">Question</th>
                          <th className="px-3 py-3 text-left">Option 1</th>
                          <th className="px-3 py-3 text-left">Option 2</th>
                          <th className="px-3 py-3 text-left">Option 3</th>
                          <th className="px-3 py-3 text-left">Option 4</th>
                          <th className="px-3 py-3">Answer</th>
                          <th className="px-3 py-3 w-14">View</th>
                          <th className="px-3 py-3 w-14">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ALL_QUESTIONS.filter(q => pickedQuestionIds.includes(q.id)).map((q, idx) => (
                          <tr key={q.id} className="border-b border-slate-100 last:border-0 font-semibold text-slate-700">
                            <td className="px-3 py-2.5">{idx + 1}</td>
                            <td className="px-3 py-2.5">{q.subject}</td>
                            <td className="px-3 py-2.5">{q.type}</td>
                            <td className="px-3 py-2.5 text-left max-w-[120px] truncate">{q.text}</td>
                            <td className="px-3 py-2.5 text-left max-w-[80px] truncate">{q.option1}</td>
                            <td className="px-3 py-2.5 text-left max-w-[80px] truncate">{q.option2}</td>
                            <td className="px-3 py-2.5 text-left max-w-[80px] truncate">{q.option3 || '—'}</td>
                            <td className="px-3 py-2.5 text-left max-w-[80px] truncate">{q.option4 || '—'}</td>
                            <td className="px-3 py-2.5 font-bold text-teal-650">{q.answer}</td>
                            <td className="px-3 py-2.5">
                              <button type="button" onClick={() => openPreview(q.id)}>
                                <Eye className="w-3.5 h-3.5 text-blue-500 mx-auto cursor-pointer" />
                              </button>
                            </td>
                            <td className="px-3 py-2.5">
                              <button
                                type="button"
                                onClick={() => togglePickQuestion(q.id)}
                                className="w-5 h-5 rounded bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center mx-auto"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {pickedQuestionIds.length === 0 && (
                          <tr>
                            <td colSpan={11} className="py-6 text-center text-slate-400 font-bold">
                              No questions selected yet. Please click &quot;Pick Question&quot;.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Wizard buttons */}
                <div className="flex justify-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md flex items-center gap-2"
                  >
                    Save & Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: MARKS */
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6 text-xs font-semibold text-slate-700">
                <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
                  <legend className="px-3 text-sm font-black text-[#1b3a60]">Marks Information</legend>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold">Total No. of Questions</label>
                      <input
                        type="number"
                        value={pickedQuestionIds.length}
                        readOnly
                        className="w-full px-4 py-2.5 border rounded-lg font-bold bg-slate-100 text-slate-500 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold">Mark per correct answer</label>
                      <input
                        type="number"
                        placeholder="Enter Mark"
                        value={markPerAns}
                        onChange={e => setMarkPerAns(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold">Maximum marks <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        readOnly
                        value={pickedQuestionIds.length * markPerAns}
                        className="w-full px-4 py-2.5 border rounded-lg font-bold bg-slate-100 text-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold">Negative marking per incorrect answer</label>
                      <select
                        value={negMark}
                        onChange={e => setNegMark(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-lg font-bold bg-white outline-none"
                      >
                        <option value="No Negative Mark">No Negative Mark</option>
                        <option value="0.25">0.25</option>
                        <option value="0.50">0.50</option>
                        <option value="1.00">1.00</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold">Passing marks <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        placeholder="Enter Passing Marks"
                        value={passMarks}
                        onChange={e => setPassMarks(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold">Maximum test time <span className="text-red-500">*</span> <span className="text-slate-400 font-normal text-[10px]">(In minutes)</span></label>
                      <select
                        value={maxTestTime}
                        onChange={e => setMaxTestTime(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-lg font-bold bg-white outline-none"
                      >
                        <option value="10">10 Minutes</option>
                        <option value="20">20 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="45">45 Minutes</option>
                        <option value="60">60 Minutes</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowMultipleAttempts}
                        onChange={e => setAllowMultipleAttempts(e.target.checked)}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span>Allow Multiple Attempts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={randomizePerUser}
                        onChange={e => setRandomizePerUser(e.target.checked)}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span>Randomize Questions per User</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={randomizePerAttempt}
                        onChange={e => setRandomizePerAttempt(e.target.checked)}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span>Randomize Questions per Attempt</span>
                    </label>
                  </div>
                </fieldset>

                {/* Instruction rich text area */}
                <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
                  <legend className="px-3 text-sm font-black text-[#1b3a60]">Instruction</legend>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <TextToolbar />
                    <textarea
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                      className="w-full px-4 py-3 font-semibold outline-none h-24 resize-none leading-relaxed text-slate-600"
                    />
                  </div>
                </fieldset>

                {/* Date of Exam */}
                <fieldset className="border border-slate-200 rounded-2xl p-6">
                  <legend className="px-3 text-sm font-black text-[#1b3a60]">Date of Exam</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold">Date</label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={e => setExamDate(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold">Time</label>
                      <input
                        type="time"
                        value={examTime}
                        onChange={e => setExamTime(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Date of Result */}
                <fieldset className="border border-slate-200 rounded-2xl p-6">
                  <legend className="px-3 text-sm font-black text-[#1b3a60]">Date of Result</legend>
                  <div className="flex flex-col gap-1.5 max-w-xs">
                    <label className="text-slate-500 font-bold">Date</label>
                    <input
                      type="date"
                      value={resultDate}
                      onChange={e => setResultDate(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                    />
                  </div>
                </fieldset>

                {/* Wizard actions */}
                <div className="flex justify-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ===== PICK QUESTION MODAL ===== */}
      {pickModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setPickModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto text-xs font-semibold text-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 font-[#1b3a60]">Pick Question</h3>
              <button onClick={() => setPickModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Subject</label>
                <select value={modalSubject} onChange={e => setModalSubject(e.target.value)} className="px-3 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select subject</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Math">Math</option>
                  <option value="English">English</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Book</label>
                <select value={modalBook} onChange={e => setModalBook(e.target.value)} className="px-3 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Enter Book Name</option>
                  <option value="Bal Bharati">Bal Bharati</option>
                  <option value="Explore Science">Explore Science</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Question Type</label>
                <select value={modalQType} onChange={e => setModalQType(e.target.value)} className="px-3 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select type</option>
                  <option value="MCQ">MCQ</option>
                  <option value="T&F">T&F</option>
                </select>
              </div>
            </div>

            {/* Questions Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 text-[11px] font-semibold">
              <table className="w-full text-center border-collapse">
                <thead className="bg-slate-50 font-black text-slate-655 border-b">
                  <tr>
                    <th className="px-3 py-2 w-10">Select</th>
                    <th className="px-3 py-2 w-10">S. No.</th>
                    <th className="px-3 py-2 w-12">Type</th>
                    <th className="px-3 py-2 text-left">Question</th>
                    <th className="px-3 py-2 text-left">Option 1</th>
                    <th className="px-3 py-2 text-left">Option 2</th>
                    <th className="px-3 py-2 text-left">Option 3</th>
                    <th className="px-3 py-2 text-left">Option 4</th>
                    <th className="px-3 py-2">Answer</th>
                    <th className="px-3 py-2 w-12">View</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_QUESTIONS.map((q, idx) => (
                    <tr key={q.id} className="border-b border-slate-100 last:border-0 text-slate-700">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={pickedQuestionIds.includes(q.id)}
                          onChange={() => togglePickQuestion(q.id)}
                          className="accent-teal-650 w-3.5 h-3.5"
                        />
                      </td>
                      <td className="px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2">{q.type}</td>
                      <td className="px-3 py-2 text-left max-w-[150px] truncate">{q.text}</td>
                      <td className="px-3 py-2 text-left max-w-[100px] truncate">{q.option1}</td>
                      <td className="px-3 py-2 text-left max-w-[100px] truncate">{q.option2}</td>
                      <td className="px-3 py-2 text-left max-w-[100px] truncate">{q.option3 || '—'}</td>
                      <td className="px-3 py-2 text-left max-w-[100px] truncate">{q.option4 || '—'}</td>
                      <td className="px-3 py-2 font-bold text-teal-650">{q.answer}</td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => openPreview(q.id)}>
                          <Eye className="w-3.5 h-3.5 text-blue-500 mx-auto cursor-pointer" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected items grouped by subject */}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-black text-slate-400 mb-1">Hindi Selected Questions</p>
                <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg min-h-[38px] bg-slate-50">
                  {pickedQuestionIds.map(qId => {
                    const q = ALL_QUESTIONS.find(item => item.id === qId)
                    if (q?.subject !== 'Hindi') return null
                    return (
                      <span key={qId} className="flex items-center gap-1.5 px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-[9px] font-black">
                        Qus. {qId}
                        <button type="button" onClick={() => togglePickQuestion(qId)} className="text-teal-500 hover:text-teal-700">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 mb-1">Maths Selected Questions</p>
                <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg min-h-[38px] bg-slate-50">
                  {pickedQuestionIds.map(qId => {
                    const q = ALL_QUESTIONS.find(item => item.id === qId)
                    if (q?.subject !== 'Math') return null
                    return (
                      <span key={qId} className="flex items-center gap-1.5 px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-[9px] font-black">
                        Qus. {qId}
                        <button type="button" onClick={() => togglePickQuestion(qId)} className="text-teal-500 hover:text-teal-700">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setPickModalOpen(false)}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md text-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SELECTED QUESTION PREVIEW STEP-THROUGH MODAL ===== */}
      {selectedQuestionModalOpen && currentPreviewQuestion && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedQuestionModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 text-xs font-semibold text-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-[#1b3a60]">Selected Question</h3>
              <button onClick={() => setSelectedQuestionModalOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Chips at top of modal */}
            <div>
              <p className="text-[10px] font-black text-slate-400 mb-1">{currentPreviewQuestion.subject} Selected Questions</p>
              <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg bg-slate-50">
                {pickedQuestionIds.map((qId, i) => {
                  const q = ALL_QUESTIONS.find(item => item.id === qId)
                  if (q?.subject !== currentPreviewQuestion.subject) return null
                  return (
                    <span
                      key={qId}
                      onClick={() => setActivePreviewIndex(i)}
                      className={`flex items-center gap-1.5 px-2 py-0.5 border rounded text-[9px] font-black cursor-pointer transition-all ${activePreviewIndex === i ? 'bg-teal-600 text-white border-teal-600' : 'bg-teal-50 text-teal-700 border-teal-200'}`}
                    >
                      Qus. {qId}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Question Details */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <span className="font-black text-[#1b3a60] text-sm">Question</span>
                <p className="text-slate-650 leading-relaxed pt-0.5">{currentPreviewQuestion.text}</p>
              </div>

              {/* MCQ Options grid */}
              <div className="space-y-3.5 pl-8">
                {[
                  { label: 'A', value: currentPreviewQuestion.option1 },
                  { label: 'B', value: currentPreviewQuestion.option2 },
                  { label: 'C', value: currentPreviewQuestion.option3 },
                  { label: 'D', value: currentPreviewQuestion.option4 },
                ].map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="font-black text-[#1b3a60]">{opt.label}</span>
                    <div className="flex-1 flex items-center border rounded-lg bg-slate-50 px-4 py-2">
                      <span className="text-slate-600 flex-1">{opt.value || '—'}</span>
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-emerald-600 font-black pl-8 mt-2">Correct Answer : {currentPreviewQuestion.answer}</p>
            </div>

            {/* Navigation and Save Actions */}
            <div className="flex flex-col items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-4 w-full justify-between">
                <button
                  type="button"
                  disabled={activePreviewIndex === 0}
                  onClick={() => setActivePreviewIndex(activePreviewIndex - 1)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  « Previous
                </button>
                <button
                  type="button"
                  disabled={activePreviewIndex === pickedQuestionIds.length - 1}
                  onClick={() => setActivePreviewIndex(activePreviewIndex + 1)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next »
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedQuestionModalOpen(false)}
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md text-xs transition-colors"
              >
                Save
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

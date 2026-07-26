'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, Pencil, Trash2, X, Download, Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react'

interface QuestionRecord {
  id: number
  className: string
  section: string
  type: 'MCQ' | 'T&F'
  questionText: string
  option1: string
  option2: string
  option3?: string
  option4?: string
  answer: string
  createdAt: string
  subject?: string
  book?: string
}

const INITIAL_QUESTIONS: QuestionRecord[] = [
]

export default function QuestionsPage() {
  const [view, setView] = useState<'list' | 'add'>('list')
  const [questions, setQuestions] = useState<QuestionRecord[]>(INITIAL_QUESTIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  // Filter Form State
  const [filterType, setFilterType] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterBook, setFilterBook] = useState('')
  const [filterSort, setFilterSort] = useState('')

  // Create Form State
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedBook, setSelectedBook] = useState('')
  const [questionType, setQuestionType] = useState<'MCQ' | 'T&F'>('MCQ')
  const [questionText, setQuestionText] = useState('')
  const [option1, setOption1] = useState('')
  const [option2, setOption2] = useState('')
  const [option3, setOption3] = useState('')
  const [option4, setOption4] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [explanation, setExplanation] = useState('')

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('school_questions')
    if (saved) {
      try {
        setQuestions(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_questions', JSON.stringify(INITIAL_QUESTIONS))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Delete this question?')) {
      const updated = questions.filter(q => q.id !== id)
      setQuestions(updated)
      localStorage.setItem('school_questions', JSON.stringify(updated))
      showToast('Question deleted successfully!')
    }
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !selectedSubject || !questionText || !correctAnswer) {
      alert('Please fill in all mandatory fields.')
      return
    }

    const newQuestion: QuestionRecord = {
      id: Date.now(),
      className: selectedClass,
      section: 'Section A', // Default or dynamically linked
      type: questionType,
      questionText,
      option1: questionType === 'MCQ' ? option1 : 'True',
      option2: questionType === 'MCQ' ? option2 : 'False',
      option3: questionType === 'MCQ' ? option3 : undefined,
      option4: questionType === 'MCQ' ? option4 : undefined,
      answer: correctAnswer,
      createdAt: new Date().toLocaleDateString('en-GB') + '\n' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      subject: selectedSubject,
      book: selectedBook
    }

    const updated = [newQuestion, ...questions]
    setQuestions(updated)
    localStorage.setItem('school_questions', JSON.stringify(updated))

    // Reset Form fields
    setSelectedClass('')
    setSelectedSubject('')
    setSelectedBook('')
    setQuestionText('')
    setOption1('')
    setOption2('')
    setOption3('')
    setOption4('')
    setCorrectAnswer('')
    setExplanation('')
    setView('list')
    showToast('Question created successfully!')
  }

  const handleClearFilters = () => {
    setFilterType('')
    setFilterClass('')
    setFilterSection('')
    setFilterSubject('')
    setFilterBook('')
    setFilterSort('')
  }

  const filtered = questions.filter(q => {
    if (searchQuery && !q.questionText.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterType && q.type !== filterType) return false
    if (filterClass && q.className !== filterClass) return false
    if (filterSection && q.section !== filterSection) return false
    if (filterSubject && q.subject !== filterSubject) return false
    if (filterBook && q.book !== filterBook) return false
    return true
  })

  // Simple rich text toolbar placeholder
  const Toolbar = () => (
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
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-800">Questions</h1>
              <p className="text-xs text-slate-400">Manage online test question banks</p>
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
              <button className="w-9 h-9 border rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 bg-white shadow-sm">
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('add')}
                className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
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
                    <th className="px-3 py-4">Type</th>
                    <th className="px-3 py-4 text-left">Question</th>
                    <th className="px-3 py-4 text-left">Option 1</th>
                    <th className="px-3 py-4 text-left">Option 2</th>
                    <th className="px-3 py-4 text-left">Option 3</th>
                    <th className="px-3 py-4 text-left">Option 4</th>
                    <th className="px-3 py-4">Answer</th>
                    <th className="px-3 py-4 w-36">Created At</th>
                    <th className="px-3 py-4 w-24">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                      <td className="px-3 py-3.5 text-slate-500">{idx + 1}.</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.className}</td>
                      <td className="px-3 py-3.5 text-slate-600">{item.section}</td>
                      <td className="px-3 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.type === 'MCQ' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-left font-bold text-slate-800 max-w-[120px] truncate">{item.questionText}</td>
                      <td className="px-3 py-3.5 text-left text-slate-600 max-w-[100px] truncate">{item.option1}</td>
                      <td className="px-3 py-3.5 text-left text-slate-600 max-w-[100px] truncate">{item.option2}</td>
                      <td className="px-3 py-3.5 text-left text-slate-600 max-w-[100px] truncate">{item.option3 || '—'}</td>
                      <td className="px-3 py-3.5 text-left text-slate-600 max-w-[100px] truncate">{item.option4 || '—'}</td>
                      <td className="px-3 py-3.5 font-bold text-teal-650">{item.answer}</td>
                      <td className="px-3 py-3.5 text-slate-450 whitespace-pre-line leading-tight text-[10px]">
                        {item.createdAt}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 border border-teal-100">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400 font-bold">
                        No questions found.
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
        /* CREATE QUESTION FORM */
        <div className="animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-black text-slate-800">Create Question</h1>
              <p className="text-xs text-slate-400">Add a new MCQ or True/False question</p>
            </div>
            <button
              onClick={() => setView('list')}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-8 text-xs font-semibold text-slate-700"
          >
            {/* Class Information */}
            <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-4">
              <legend className="px-3 text-sm font-black text-[#1b3a60]">Class Information</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">
                    Class <span className="text-red-500">*</span>
                  </label>
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
                  <label className="text-slate-500 font-bold">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white"
                  >
                    <option value="">Select Subject</option>
                    {['Hindi', 'Science', 'English', 'Mathematics'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 font-bold">Book</label>
                  <select
                    value={selectedBook}
                    onChange={e => setSelectedBook(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white"
                  >
                    <option value="">Select Book</option>
                    {['Bal Bharati', 'Explore Science', 'Honey Dew', 'Golden Math'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Question & Answer */}
            <fieldset className="border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b pb-3 mb-2">
                <legend className="text-sm font-black text-[#1b3a60]">Question & Answer</legend>
                <select
                  value={questionType}
                  onChange={e => {
                    setQuestionType(e.target.value as 'MCQ' | 'T&F')
                    setCorrectAnswer('')
                  }}
                  className="px-3 py-1.5 border rounded-lg font-bold bg-white text-slate-700 outline-none"
                >
                  <option value="MCQ">Multiple Choice Questions</option>
                  <option value="T&F">True & False Questions</option>
                </select>
              </div>

              {/* Rich text Question box */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Question</label>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <Toolbar />
                  <textarea
                    placeholder="Enter question text here..."
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    className="w-full px-4 py-3 font-semibold outline-none h-24 resize-none"
                  />
                </div>
              </div>

              {questionType === 'MCQ' ? (
                /* MCQ Options Section */
                <div className="space-y-4 pt-2">
                  {[
                    { label: 'Option 1 *', value: option1, setter: setOption1 },
                    { label: 'Option 2 *', value: option2, setter: setOption2 },
                    { label: 'Option 3', value: option3, setter: setOption3 },
                    { label: 'Option 4', value: option4, setter: setOption4 },
                  ].map((opt, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-500 font-bold">{opt.label}</label>
                        <input
                          type="text"
                          placeholder="Enter Option"
                          value={opt.value}
                          onChange={e => opt.setter(e.target.value)}
                          className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-bold">OR</span>
                        <div className="flex-1 flex items-center border rounded-lg bg-slate-50 px-4 py-2.5">
                          <span className="text-slate-400 flex-1 truncate">Upload Image</span>
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <button
                          type="button"
                          className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 bg-white font-bold transition-all text-xs"
                        >
                          Attach
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col gap-1.5 max-w-xs">
                    <label className="text-slate-500 font-bold">
                      Correct Answer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={correctAnswer}
                      onChange={e => setCorrectAnswer(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white"
                    >
                      <option value="">Select Option</option>
                      {option1 && <option value={option1}>Option 1 ({option1})</option>}
                      {option2 && <option value={option2}>Option 2 ({option2})</option>}
                      {option3 && <option value={option3}>Option 3 ({option3})</option>}
                      {option4 && <option value={option4}>Option 4 ({option4})</option>}
                    </select>
                  </div>
                </div>
              ) : (
                /* True / False Option Section */
                <div className="flex flex-col gap-1.5 max-w-xs pt-2">
                  <label className="text-slate-500 font-bold">
                    Correct Answer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={correctAnswer}
                    onChange={e => setCorrectAnswer(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg font-bold outline-none bg-white"
                  >
                    <option value="">Select Correct Option</option>
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                </div>
              )}

              {/* Rich text Explanation box */}
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-slate-500 font-bold">Answer Explanation</label>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <Toolbar />
                  <textarea
                    placeholder="Enter answer explanation here..."
                    value={explanation}
                    onChange={e => setExplanation(e.target.value)}
                    className="w-full px-4 py-3 font-semibold outline-none h-24 resize-none"
                  />
                </div>
              </div>
            </fieldset>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-8 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 bg-white transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-md"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER MODAL */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setFilterOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800">Filter Questions</h3>
              <button onClick={() => setFilterOpen(false)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Question Type</label>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select an option</option>
                  <option value="MCQ">MCQ</option>
                  <option value="T&F">True & False</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Class</label>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select class</option>
                  {['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VIII'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Section</label>
                <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select section</option>
                  {['Section A', 'Section B', 'Section C', 'Section D'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Subject</label>
                <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select an option</option>
                  {['Hindi', 'Science', 'English', 'Mathematics'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Book</label>
                <select value={filterBook} onChange={e => setFilterBook(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Enter Book Name</option>
                  {['Bal Bharati', 'Explore Science', 'Honey Dew'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-bold">Sort By</label>
                <select value={filterSort} onChange={e => setFilterSort(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none">
                  <option value="">Select an option</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
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

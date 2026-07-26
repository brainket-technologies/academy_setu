'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react'

interface ExamSetup {
  id: number
  group: string
  exam: string
  classGrade: string
  marksGrade: string
  templateName: string
  date: string
  time: string
}

const INITIAL_SETUPS: ExamSetup[] = [
  { id: 1, group: 'Exam', exam: 'Final Exam', classGrade: 'Class V', marksGrade: 'Percentage', templateName: 'Classic Navy', date: '15/09/2025', time: '11:00 AM' },
  { id: 2, group: 'Theory Exam', exam: 'Half Yearly Exam', classGrade: 'Class II', marksGrade: 'Grade', templateName: 'Classic Navy', date: '15/09/2025', time: '11:00 AM' },
  { id: 3, group: 'Practical Exam', exam: 'Half Yearly Exam', classGrade: 'Class III', marksGrade: 'Division', templateName: 'Teal Modern', date: '15/09/2025', time: '11:00 AM' },
]

export default function ExamMarksheetSetupPage() {
  const [setups, setSetups] = useState<ExamSetup[]>(INITIAL_SETUPS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSetup, setEditingSetup] = useState<ExamSetup | null>(null)

  // Load setups from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('exam_setups')
    if (saved) {
      try {
        setSetups(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('exam_setups', JSON.stringify(INITIAL_SETUPS))
    }
  }, [])
  
  // Form fields
  const [group, setGroup] = useState('')
  const [exam, setExam] = useState('')
  const [classGrade, setClassGrade] = useState('')
  const [marksGrade, setMarksGrade] = useState('Percentage')
  const [templateName, setTemplateName] = useState('Classic Navy')

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedExam, setSelectedExam] = useState('')
  const [selectedRange, setSelectedRange] = useState('')
  const [selectedSession, setSelectedSession] = useState('2025-2026')

  const handleOpenAdd = () => {
    setEditingSetup(null)
    setGroup('')
    setExam('')
    setClassGrade('')
    setMarksGrade('Percentage')
    setTemplateName('Classic Navy')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (setup: ExamSetup) => {
    setEditingSetup(setup)
    setGroup(setup.group)
    setExam(setup.exam)
    setClassGrade(setup.classGrade)
    setMarksGrade(setup.marksGrade)
    setTemplateName(setup.templateName)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this setup?')) {
      const updated = setups.filter(item => item.id !== id)
      setSetups(updated)
      localStorage.setItem('exam_setups', JSON.stringify(updated))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!group || !exam || !classGrade) {
      alert('Please fill in all required fields.')
      return
    }

    const today = new Date()
    const formattedDate = today.toLocaleDateString('en-GB')
    const formattedTime = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    if (editingSetup) {
      // Edit mode
      setSetups(prev => prev.map(item => 
        item.id === editingSetup.id 
          ? { ...item, group, exam, classGrade, marksGrade, templateName }
          : item
      ))
    } else {
      // Add mode
      const newSetup: ExamSetup = {
        id: Date.now(),
        group,
        exam,
        classGrade,
        marksGrade,
        templateName,
        date: formattedDate,
        time: formattedTime
      }
      setSetups(prev => [newSetup, ...prev])
    }
    setIsModalOpen(false)
  }

  // Filtered setups
  const filteredSetups = setups.filter(item => {
    const matchesSearch = 
      item.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.exam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.classGrade.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesGroup = selectedGroup ? item.group === selectedGroup : true
    const matchesExam = selectedExam ? item.exam === selectedExam : true
    const matchesRange = selectedRange ? item.marksGrade === selectedRange : true

    return matchesSearch && matchesGroup && matchesExam && matchesRange
  })

  // Options lists for filters
  const uniqueGroups = Array.from(new Set(setups.map(s => s.group)))
  const uniqueExams = Array.from(new Set(setups.map(s => s.exam)))
  const uniqueRanges = Array.from(new Set(setups.map(s => s.marksGrade)))

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Exam & Marksheet</h1>
          <p className="text-xs text-slate-400">Configure exam types and grading schemes per class</p>
        </div>
        
        <Link 
          href="/institute/exam-marksheet/setup/create"
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Setup
        </Link>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        
        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Session</label>
            <select 
              value={selectedSession}
              onChange={e => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none focus:border-teal-500"
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Group</label>
            <select 
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none focus:border-teal-500"
            >
              <option value="">Select an Option</option>
              {uniqueGroups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam</label>
            <select 
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none focus:border-teal-500"
            >
              <option value="">Select an Option</option>
              {uniqueExams.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Range</label>
            <select 
              value={selectedRange}
              onChange={e => setSelectedRange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none focus:border-teal-500"
            >
              <option value="">Select an Option</option>
              {uniqueRanges.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search Setup" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-600 dark:text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4">S. No.</th>
                <th className="px-4 py-4">Group</th>
                <th className="px-4 py-4">Exam</th>
                <th className="px-4 py-4">Class</th>
                <th className="px-4 py-4">Marks & Grade</th>
                <th className="px-4 py-4">Marksheet Design</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSetups.length > 0 ? (
                filteredSetups.map((item, i) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 text-slate-500 font-medium">{i + 1}.</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-semibold">{item.group}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-semibold">{item.exam}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">{item.classGrade}</td>
                    <td className="px-4 py-4">
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold text-[10px]">
                        {item.marksGrade}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-10 h-7 bg-amber-50 rounded-sm border border-amber-200 flex items-center justify-center relative overflow-hidden" title={item.templateName}>
                           <div className="w-6 h-4 border border-amber-300"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-400">🗓 {item.date}</span>
                        <span>🕒 {item.time}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No configurations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing {filteredSetups.length} of {setups.length} Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">»</button>
          </div>
        </div>
      </div>

      {/* Add / Edit Setup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {editingSetup ? 'Modify Exam Setup' : 'Create Exam Setup'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Group Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Exam, Theory Exam, Practical Exam"
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Exam *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Half Yearly Exam, Final Exam"
                    value={exam}
                    onChange={e => setExam(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Class *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Class V, Class II"
                    value={classGrade}
                    onChange={e => setClassGrade(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Marks & Grade Scheme</label>
                    <select 
                      value={marksGrade}
                      onChange={e => setMarksGrade(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 text-slate-600"
                    >
                      <option value="Percentage">Percentage</option>
                      <option value="Grade">Grade</option>
                      <option value="Division">Division</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Marksheet Design</label>
                    <select 
                      value={templateName}
                      onChange={e => setTemplateName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 text-slate-600"
                    >
                      <option value="Classic Navy">Classic Navy (Portrait)</option>
                      <option value="Teal Modern">Teal Modern (Landscape)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  {editingSetup ? 'Save Changes' : 'Create Setup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

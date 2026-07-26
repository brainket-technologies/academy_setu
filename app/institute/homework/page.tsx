'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Eye, Trash2, X, Download, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface HomeworkRecord {
  id: number
  title: string
  classes: string
  section: string
  subject: string
  status: 'Active' | 'Inactive'
  submissionDate: string
  scheduleDate: string
  description?: string
}

interface SubmissionRecord {
  studentName: string
  rollNo: string
  submittedAt: string
  attachment: string
  grade: string
  remarks: string
  status: 'Evaluated' | 'Pending'
}

const INITIAL_HOMEWORKS: HomeworkRecord[] = [
  { id: 1, title: 'Lorem ipsum', classes: 'Class V', section: 'Section A', subject: 'Math', status: 'Active', submissionDate: '11/12/2025', scheduleDate: '15/09/2025 11:00 AM', description: 'Solve chapters 4 and 5 exercises on coordinate geometry.' },
  { id: 2, title: 'Lorem ipsum', classes: 'Class XII', section: 'Section B', subject: 'Science', status: 'Active', submissionDate: '11/12/2025', scheduleDate: '15/09/2025 11:00 AM', description: 'Draw organic chemistry reactions chart.' },
  { id: 3, title: 'Lorem ipsum', classes: 'Class VIII', section: 'Section D', subject: 'English', status: 'Inactive', submissionDate: '15/12/2025', scheduleDate: '15/09/2025 11:00 AM', description: 'Write an essay on global warming (300 words).' },
]

const MOCK_SUBMISSIONS: Record<number, SubmissionRecord[]> = {
  1: [
    { studentName: 'Abhay Singh', rollNo: '101', submittedAt: '10/12/2025 04:00 PM', attachment: 'abhay_geometry.pdf', grade: 'A', remarks: 'Excellent presentation', status: 'Evaluated' },
    { studentName: 'Ashok Kumar', rollNo: '102', submittedAt: '10/12/2025 05:00 PM', attachment: 'ashok_geometry.pdf', grade: '', remarks: '', status: 'Pending' },
    { studentName: 'Priya Kumari', rollNo: '103', submittedAt: '11/12/2025 09:00 AM', attachment: 'priya_geometry.pdf', grade: '', remarks: '', status: 'Pending' },
  ],
  2: [
    { studentName: 'Sneha Pandey', rollNo: '105', submittedAt: '10/12/2025 02:00 PM', attachment: 'sneha_chemistry.pdf', grade: 'B+', remarks: 'Well explained', status: 'Evaluated' },
    { studentName: 'Alok Tiwari', rollNo: '106', submittedAt: '11/12/2025 10:00 AM', attachment: 'alok_chemistry.pdf', grade: '', remarks: '', status: 'Pending' },
  ]
}

export default function HomeworkPage() {
  const [homeworks, setHomeworks] = useState<HomeworkRecord[]>(INITIAL_HOMEWORKS)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal Dialog states
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedHomework, setSelectedHomework] = useState<HomeworkRecord | null>(null)
  
  // Dynamic student submissions linked to selected homework
  const [submissionsList, setSubmissionsList] = useState<SubmissionRecord[]>([])

  const [toastMsg, setToastMsg] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('school_homeworks')
    if (saved) {
      try {
        setHomeworks(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('school_homeworks', JSON.stringify(INITIAL_HOMEWORKS))
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this homework assignment?')) {
      const updated = homeworks.filter(h => h.id !== id)
      setHomeworks(updated)
      localStorage.setItem('school_homeworks', JSON.stringify(updated))
      setToastMsg('Homework deleted successfully!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 3000)
    }
  }

  const handleOpenDetails = (hw: HomeworkRecord) => {
    setSelectedHomework(hw)
    const list = MOCK_SUBMISSIONS[hw.id] || [
      { studentName: 'Neeraj Rawat', rollNo: '110', submittedAt: '11/12/2025 10:30 AM', attachment: 'neeraj_work.pdf', grade: '', remarks: '', status: 'Pending' },
      { studentName: 'Garima Sharma', rollNo: '111', submittedAt: '12/12/2025 09:30 AM', attachment: 'garima_work.pdf', grade: '', remarks: '', status: 'Pending' }
    ]
    setSubmissionsList(list)
    setDetailsModalOpen(true)
  }

  const handleGradeChange = (index: number, val: string) => {
    const updated = [...submissionsList]
    updated[index].grade = val
    setSubmissionsList(updated)
  }

  const handleRemarksChange = (index: number, val: string) => {
    const updated = [...submissionsList]
    updated[index].remarks = val
    setSubmissionsList(updated)
  }

  const handleSaveEvaluation = (index: number) => {
    const updated = [...submissionsList]
    if (!updated[index].grade) {
      alert('Please assign a grade before saving.')
      return
    }
    updated[index].status = 'Evaluated'
    setSubmissionsList(updated)
    
    // Save to memory
    if (selectedHomework) {
      MOCK_SUBMISSIONS[selectedHomework.id] = updated
    }

    setToastMsg(`Successfully evaluated ${updated[index].studentName}!`)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  const filtered = homeworks.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.classes.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Homework</h1>
          <p className="text-xs text-slate-400">Assign curriculum exercises and evaluate student submissions logs</p>
        </div>
      </div>

      {/* Control Actions (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search by Title, Subject Name"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Link 
            href="/institute/homework/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Homework grid list table (Screenshot 1) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 font-semibold">
          
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-655 border-b">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Title</th>
                <th className="px-4 py-4">Classes</th>
                <th className="px-4 py-4">Section</th>
                <th className="px-4 py-4 text-left">Subject</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Submission Date</th>
                <th className="px-4 py-4">Schedule Date</th>
                <th className="px-4 py-4 w-28">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors font-semibold">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-black text-slate-800">{item.title}</td>
                  <td className="px-4 py-3.5 text-slate-600 font-bold">{item.classes}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.section}</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-750">{item.subject}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                      ● {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-bold">{item.submissionDate}</td>
                  <td className="px-4 py-3.5 text-slate-450 font-semibold">{item.scheduleDate}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenDetails(item)}
                        className="w-6 h-6 rounded bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-100 border border-sky-100 transition-colors"
                        title="Evaluate Submissions"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">No homework sheets assigned.</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

      </div>

      {/* ================================== EVALUATION / DETAILS MODAL ================================== */}
      {detailsModalOpen && selectedHomework && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-250">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 relative p-8 space-y-6">
            
            <button 
              onClick={() => setDetailsModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* General assignment details header */}
            <div className="flex items-start gap-4 border-b pb-4">
              <span className="text-3xl">📝</span>
              <div className="space-y-1">
                <h2 className="text-sm font-black text-[#1b3a60] uppercase tracking-wider">
                  Evaluate Assignment — {selectedHomework.subject} ({selectedHomework.classes})
                </h2>
                <p className="text-xs text-slate-450 font-bold leading-normal">{selectedHomework.description}</p>
                <div className="flex gap-4 text-[10px] text-slate-400 font-bold uppercase mt-1">
                  <span>Schedule: {selectedHomework.scheduleDate}</span>
                  <span>●</span>
                  <span className="text-red-500">Submission deadline: {selectedHomework.submissionDate}</span>
                </div>
              </div>
            </div>

            {/* Submissions evaluates log list */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">Student Submissions ({submissionsList.length})</h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200 font-semibold text-xs text-slate-700">
                <table className="w-full text-center border-collapse">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3 w-16">Roll No</th>
                      <th className="px-4 py-3 text-left">Student Name</th>
                      <th className="px-4 py-3">Submitted At</th>
                      <th className="px-4 py-3">Work sheet</th>
                      <th className="px-4 py-3 w-32">Grade/Marks *</th>
                      <th className="px-4 py-3">Remarks</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 w-28">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionsList.map((sub, idx) => (
                      <tr key={sub.rollNo} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-slate-500">{sub.rollNo}</td>
                        <td className="px-4 py-2.5 text-left font-black text-slate-800">{sub.studentName}</td>
                        <td className="px-4 py-2.5 text-slate-550">{sub.submittedAt}</td>
                        <td className="px-4 py-2.5">
                          <button 
                            type="button" 
                            onClick={() => alert(`Downloading student work sheet: ${sub.attachment}...`)}
                            className="flex items-center gap-1 mx-auto px-2.5 py-1 rounded bg-teal-50 text-teal-650 hover:bg-teal-100 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> View PDF
                          </button>
                        </td>
                        <td className="px-4 py-2.5">
                          {sub.status === 'Evaluated' ? (
                            <span className="font-extrabold text-slate-800">{sub.grade}</span>
                          ) : (
                            <select 
                              value={sub.grade} 
                              onChange={e => handleGradeChange(idx, e.target.value)} 
                              className="px-2.5 py-1 border rounded bg-white outline-none w-24"
                            >
                              <option value="">Grade</option>
                              <option value="A+">A+</option>
                              <option value="A">A</option>
                              <option value="B+">B+</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="F">F</option>
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {sub.status === 'Evaluated' ? (
                            <span className="text-slate-500 text-left font-medium">{sub.remarks || '-'}</span>
                          ) : (
                            <input 
                              type="text" 
                              placeholder="Add remarks" 
                              value={sub.remarks} 
                              onChange={e => handleRemarksChange(idx, e.target.value)} 
                              className="px-2 py-1 border rounded w-full outline-none font-bold" 
                            />
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            sub.status === 'Evaluated' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          {sub.status === 'Evaluated' ? (
                            <span className="text-[10px] text-slate-400 font-bold">Evaluated</span>
                          ) : (
                            <button 
                              type="button" 
                              onClick={() => handleSaveEvaluation(idx)}
                              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold"
                            >
                              Save
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button 
                onClick={() => setDetailsModalOpen(false)}
                className="px-6 py-2 border text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors bg-white shadow-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TOAST ALERT */}
      {toastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

    </div>
  )
}

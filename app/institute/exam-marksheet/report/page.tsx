'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, Filter, Download, MoreVertical, Eye, Pencil, Trash2, X, DownloadCloud, Sparkles, Check, Info } from 'lucide-react'
import { MarksheetDesign1, MarksheetDesign2, MarksheetDesign3 } from '@/components/marksheets/MarksheetTemplates'

interface StudentMarksheet {
  id: number
  studentName: string
  rollNo: string
  classGrade: string
  section: string
  exam: string
  obtainedMarks: number
  totalMarks: number
  rank: number
  templateType: 'Purple Classic' | 'Scholastic Term Split' | 'Skills Aspect Grid'
  date: string
  time: string
}

const INITIAL_MARKSHEETS: StudentMarksheet[] = [
  { id: 1, studentName: 'Alok Kumar', rollNo: '20250512', classGrade: 'Class V', section: 'Section A', exam: 'Final Exam', obtainedMarks: 350, totalMarks: 500, rank: 1, templateType: 'Purple Classic', date: '15/09/2025', time: '11:00 AM' },
  { id: 2, studentName: 'Shivam Tiwari', rollNo: '20250284', classGrade: 'Class II', section: 'Section B', exam: 'Half Yearly Exam', obtainedMarks: 354, totalMarks: 400, rank: 1, templateType: 'Scholastic Term Split', date: '15/09/2025', time: '11:00 AM' },
  { id: 3, studentName: 'Komal Singh', rollNo: '20250917', classGrade: 'Class III', section: 'Section B', exam: 'Half Yearly Exam', obtainedMarks: 287, totalMarks: 500, rank: 5, templateType: 'Skills Aspect Grid', date: '15/09/2025', time: '11:00 AM' },
  { id: 4, studentName: 'Rajesh Sharma', rollNo: '20250441', classGrade: 'Class V', section: 'Section A', exam: 'Final Exam', obtainedMarks: 410, totalMarks: 500, rank: 2, templateType: 'Purple Classic', date: '16/09/2025', time: '02:30 PM' },
  { id: 5, studentName: 'Sneha Gupta', rollNo: '20250109', classGrade: 'Class II', section: 'Section A', exam: 'Half Yearly Exam', obtainedMarks: 310, totalMarks: 400, rank: 4, templateType: 'Scholastic Term Split', date: '16/09/2025', time: '03:15 PM' },
]

export default function AllMarksheetReportPage() {
  const [marksheets, setMarksheets] = useState<StudentMarksheet[]>(INITIAL_MARKSHEETS)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [previewMarksheet, setPreviewMarksheet] = useState<StudentMarksheet | null>(null)
  
  // Dropdown row tracker
  const [activeDropdownRowId, setActiveDropdownRowId] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSession, setSelectedSession] = useState('2025-2026')
  const [filterClass, setFilterClass] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterExam, setFilterExam] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterOrderBy, setFilterOrderBy] = useState('Rank')
  const [filterOrientation, setFilterOrientation] = useState('Portrait')

  // Edit fields
  const [editingMarksheet, setEditingMarksheet] = useState<StudentMarksheet | null>(null)
  const [editName, setEditName] = useState('')
  const [editRollNo, setEditRollNo] = useState('')
  const [editObt, setEditObt] = useState(0)
  const [editTotal, setEditTotal] = useState(0)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownRowId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter actions
  const applyFilters = () => {
    setIsFilterModalOpen(false)
  }

  const clearFilters = () => {
    setFilterClass('')
    setFilterSection('')
    setFilterExam('')
    setFilterStatus('All')
    setFilterOrderBy('Rank')
    setFilterOrientation('Portrait')
    setIsFilterModalOpen(false)
  }

  // Row Delete
  const handleDeleteRow = (id: number) => {
    if (confirm('Are you sure you want to delete this marksheet report?')) {
      setMarksheets(prev => prev.filter(item => item.id !== id))
    }
    setActiveDropdownRowId(null)
  }

  // Row Edit Modal Trigger
  const handleOpenEditModal = (item: StudentMarksheet) => {
    setEditingMarksheet(item)
    setEditName(item.studentName)
    setEditRollNo(item.rollNo)
    setEditObt(item.obtainedMarks)
    setEditTotal(item.totalMarks)
    setIsEditModalOpen(true)
    setActiveDropdownRowId(null)
  }

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingMarksheet) {
      setMarksheets(prev => prev.map(item => 
        item.id === editingMarksheet.id 
          ? { ...item, studentName: editName, rollNo: editRollNo, obtainedMarks: Number(editObt), totalMarks: Number(editTotal) }
          : item
      ))
      setIsEditModalOpen(false)
    }
  }

  // Filter Logic
  const filteredData = marksheets.filter(item => {
    const matchesSearch = 
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.classGrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.exam.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesClass = filterClass ? item.classGrade === filterClass : true
    const matchesSection = filterSection ? item.section === filterSection : true
    const matchesExam = filterExam ? item.exam === filterExam : true

    // Passing Logic: 33% passing marks
    const passPct = (item.obtainedMarks / item.totalMarks) * 100
    const status = passPct >= 33 ? 'Pass' : 'Fail'
    const matchesStatus = filterStatus === 'All' ? true : status === filterStatus

    return matchesSearch && matchesClass && matchesSection && matchesExam && matchesStatus
  }).sort((a, b) => {
    if (filterOrderBy === 'Rank') return a.rank - b.rank
    if (filterOrderBy === 'Name') return a.studentName.localeCompare(b.studentName)
    if (filterOrderBy === 'Roll No') return a.rollNo.localeCompare(b.rollNo)
    return 0
  })

  // Print/Download Simulation
  const handleDownload = (item: StudentMarksheet) => {
    alert(`Downloading report for ${item.studentName} (${item.exam})...`)
    setActiveDropdownRowId(null)
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">All Marksheets</h1>
          <p className="text-xs text-slate-400">View, update and generate report cards for students</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Name, Class, Section, Exam" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-72 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-700 dark:text-slate-300"
            />
          </div>
          
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
            title="Filter Results"
          >
            <Filter className="w-4 h-4" />
          </button>

          <button 
            onClick={() => alert('Exporting all marksheets as spreadsheet...')}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
            title="Export Report"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main card containing report */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        
        <div className="flex flex-col gap-2 mb-6 w-48">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Session</label>
          <select 
            value={selectedSession}
            onChange={e => setSelectedSession(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 outline-none focus:border-teal-500"
          >
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 relative">
          <table className="w-full text-xs text-center whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4">S. No.</th>
                <th className="px-4 py-4">Student</th>
                <th className="px-4 py-4">Class</th>
                <th className="px-4 py-4">Section</th>
                <th className="px-4 py-4">Exam</th>
                <th className="px-4 py-4">Obt. Marks</th>
                <th className="px-4 py-4">Total Marks</th>
                <th className="px-4 py-4">Rank</th>
                <th className="px-4 py-4">Marksheet</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, i) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 text-slate-500 font-medium">{i + 1}.</td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-bold">{item.studentName}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">{item.classGrade}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">{item.section}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-semibold">{item.exam}</td>
                    <td className="px-4 py-4 text-teal-600 font-black">{item.obtainedMarks}</td>
                    <td className="px-4 py-4 text-slate-500 font-semibold">{item.totalMarks}</td>
                    <td className="px-4 py-4">
                      <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-black text-[10px]">
                        #{item.rank}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-10 h-7 bg-teal-50/50 rounded border border-teal-200 flex items-center justify-center relative overflow-hidden" title={item.templateType}>
                           <div className="w-6 h-4 border border-teal-300"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-400">🗓 {item.date}</span>
                        <span>🕒 {item.time}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 relative">
                      <button 
                        onClick={() => setActiveDropdownRowId(activeDropdownRowId === item.id ? null : item.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu (Screenshot 2 style overlay) */}
                      {activeDropdownRowId === item.id && (
                        <div 
                          ref={dropdownRef} 
                          className="absolute right-12 top-2 z-30 w-36 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-left animate-in fade-in slide-in-from-top-1 duration-100"
                        >
                          <button 
                            onClick={() => { setPreviewMarksheet(item); setActiveDropdownRowId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500" /> View
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(item)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5 text-emerald-600" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDownload(item)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <DownloadCloud className="w-3.5 h-3.5 text-amber-500" /> Download
                          </button>
                          <button 
                            onClick={() => handleDeleteRow(item.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-slate-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                    No matching report cards found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-{filteredData.length} of {filteredData.length} Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold shadow-sm">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">»</button>
          </div>
        </div>
      </div>

      {/* Filter Modal (Screenshot 5 design) */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Close header */}
            <div className="flex justify-end pt-4 pr-4">
              <button 
                onClick={() => setIsFilterModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content body */}
            <div className="px-10 pb-12 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">Select Class *</label>
                  <select 
                    value={filterClass}
                    onChange={e => setFilterClass(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600"
                  >
                    <option value="">Select Class</option>
                    <option value="Class II">Class II</option>
                    <option value="Class III">Class III</option>
                    <option value="Class V">Class V</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">Select Section</label>
                  <select 
                    value={filterSection}
                    onChange={e => setFilterSection(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600"
                  >
                    <option value="">Select Section</option>
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">Exams</label>
                  <select 
                    value={filterExam}
                    onChange={e => setFilterExam(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600"
                  >
                    <option value="">Select an Option</option>
                    <option value="Final Exam">Final Exam</option>
                    <option value="Half Yearly Exam">Half Yearly Exam</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">Academic Status</label>
                  <select 
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600"
                  >
                    <option value="All">All</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">Order By</label>
                  <select 
                    value={filterOrderBy}
                    onChange={e => setFilterOrderBy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600"
                  >
                    <option value="Rank">Rank</option>
                    <option value="Name">Name</option>
                    <option value="Roll No">Roll No</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700">Orientation</label>
                  <select 
                    value={filterOrientation}
                    onChange={e => setFilterOrientation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 transition-all text-slate-600"
                  >
                    <option value="Portrait">Portrait</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-center items-center gap-4">
                <button 
                  onClick={applyFilters}
                  className="px-10 py-2.5 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Filter
                </button>
                <button 
                  onClick={clearFilters}
                  className="px-10 py-2.5 rounded-lg border border-teal-600 text-teal-600 font-bold hover:bg-teal-50 transition-colors shadow-sm"
                >
                  Clear
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Edit Marksheet obtained marks Modal */}
      {isEditModalOpen && editingMarksheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Edit Marks Record</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Student Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Roll No</label>
                <input 
                  type="text" 
                  value={editRollNo}
                  onChange={e => setEditRollNo(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Obtained Marks</label>
                  <input 
                    type="number" 
                    value={editObt}
                    onChange={e => setEditObt(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Total Marks</label>
                  <input 
                    type="number" 
                    value={editTotal}
                    onChange={e => setEditTotal(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Marksheet Render Preview Modal */}
      {previewMarksheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative my-8 max-w-4xl bg-slate-100 rounded-3xl shadow-2xl border border-slate-200/50 p-4 flex flex-col gap-4 animate-in zoom-in-95 duration-200 max-h-[90vh]">
            
            {/* Control Bar */}
            <div className="flex justify-between items-center bg-white rounded-2xl p-3 border border-slate-200/50 shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Live Marksheet Preview</h3>
                  <p className="text-[10px] text-slate-400">Rendering template design: <b>{previewMarksheet.templateType}</b></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const current = previewMarksheet.templateType
                    let newTemplate: 'Purple Classic' | 'Scholastic Term Split' | 'Skills Aspect Grid' = 'Purple Classic'
                    if (current === 'Purple Classic') newTemplate = 'Scholastic Term Split'
                    else if (current === 'Scholastic Term Split') newTemplate = 'Skills Aspect Grid'
                    setPreviewMarksheet({ ...previewMarksheet, templateType: newTemplate })
                  }}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 transition-colors"
                >
                  Switch Template Design
                </button>

                <button 
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 rounded-lg text-[10px] font-bold text-white transition-colors shadow-sm"
                >
                  Print Report
                </button>

                <button 
                  onClick={() => setPreviewMarksheet(null)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Template Container */}
            <div className="overflow-auto bg-white p-4 rounded-2xl border border-slate-200/50 flex-1 flex justify-center items-start shadow-inner">
              {previewMarksheet.templateType === 'Purple Classic' ? (
                <MarksheetDesign1 data={{
                  studentName: previewMarksheet.studentName,
                  rollNo: previewMarksheet.rollNo,
                  className: previewMarksheet.classGrade,
                  section: previewMarksheet.section,
                  examName: previewMarksheet.exam,
                  session: selectedSession,
                  obtainedMarks: previewMarksheet.obtainedMarks,
                  totalMarks: previewMarksheet.totalMarks,
                  rank: previewMarksheet.rank
                }} />
              ) : previewMarksheet.templateType === 'Scholastic Term Split' ? (
                <MarksheetDesign2 data={{
                  studentName: previewMarksheet.studentName,
                  rollNo: previewMarksheet.rollNo,
                  className: previewMarksheet.classGrade,
                  section: previewMarksheet.section,
                  examName: previewMarksheet.exam,
                  session: selectedSession,
                  obtainedMarks: previewMarksheet.obtainedMarks,
                  totalMarks: previewMarksheet.totalMarks,
                  rank: previewMarksheet.rank
                }} />
              ) : (
                <MarksheetDesign3 data={{
                  studentName: previewMarksheet.studentName,
                  rollNo: previewMarksheet.rollNo,
                  className: previewMarksheet.classGrade,
                  section: previewMarksheet.section,
                  examName: previewMarksheet.exam,
                  session: selectedSession,
                  obtainedMarks: previewMarksheet.obtainedMarks,
                  totalMarks: previewMarksheet.totalMarks,
                  rank: previewMarksheet.rank
                }} />
              )}
            </div>
            
          </div>
        </div>
      )}

    </div>
  )
}

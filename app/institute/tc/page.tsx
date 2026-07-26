'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, MoreVertical, Download, Eye, Pencil, Trash2, X, Sparkles } from 'lucide-react'

interface StudentTC {
  id: number
  tcNo: string
  admissionNo: string
  studentName: string
  avatar: string
  classGrade: string
  section: string
  session: string
  dateCreated: string
  timeCreated: string
}

const INITIAL_TCS: StudentTC[] = [
]

export default function TransferCertificatesListPage() {
  const [tcs, setTcs] = useState<StudentTC[]>(INITIAL_TCS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSession, setSelectedSession] = useState('2025-26')
  const [selectedClass, setSelectedClass] = useState('Class V')
  const [selectedSection, setSelectedSection] = useState('Section B')
  
  // Actions dropdown menu tracker
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Preview target
  const [previewTC, setPreviewTC] = useState<StudentTC | null>(null)

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('student_tcs')
    if (saved) {
      try {
        setTcs(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('student_tcs', JSON.stringify(INITIAL_TCS))
    }
  }, [])

  // Close actions menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this Transfer Certificate?')) {
      const updated = tcs.filter(item => item.id !== id)
      setTcs(updated)
      localStorage.setItem('student_tcs', JSON.stringify(updated))
      setActiveMenuId(null)
    }
  }

  const filtered = tcs.filter(item => {
    const matchesSearch = 
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tcNo.includes(searchQuery)
    return matchesSearch
  })

  // 25 Details fields matching Screenshot 3
  const tcDetailsList = [
    { num: '1.', label: 'Name of Student', value: 'Kunal Mishra' },
    { num: '2.', label: 'Mobile No.', value: '9999999999' },
    { num: '3.', label: 'Whatsapp No.', value: '' },
    { num: '4.', label: 'Alternate Number', value: '' },
    { num: '5.', label: 'Email Address', value: '' },
    { num: '6.', label: 'Apaar ID', value: '' },
    { num: '7.', label: 'Class', value: 'Class VII' },
    { num: '8.', label: 'Stream', value: 'No Stream' },
    { num: '9.', label: 'Medium', value: 'English' },
    { num: '10.', label: 'Gender', value: 'Male' },
    { num: '11.', label: 'Address', value: 'Lucknow' },
    { num: '12.', label: 'Pincode', value: '226007' },
    { num: '13.', label: 'City', value: 'Lucknow' },
    { num: '14.', label: 'State', value: 'Uttarpradesh' },
    { num: '15.', label: 'Country', value: 'India' },
    { num: '16.', label: 'Aadhar No.', value: '123456789' },
    { num: '17.', label: 'Blood Group', value: '' },
    { num: '18.', label: 'Caste', value: 'General' },
    { num: '19.', label: 'Religion', value: 'Hindu' },
    { num: '20.', label: 'Nationality', value: 'Indian' },
    { num: '21.', label: 'DOB According to Admission Register', value: '21-01-2004' },
    { num: '22.', label: 'RTE Student', value: 'Yes' },
    { num: '23.', label: 'School Affiliated', value: '' },
    { num: '24.', label: 'Reason for Leaving the School', value: 'Admission New Class' },
    { num: '25.', label: 'Student Behaviour', value: 'Good' },
  ]

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Transfer Certificate</h1>
          <p className="text-xs text-slate-400">View and issue school leaving certificates</p>
        </div>
      </div>

      {/* Control Actions / Search and Filter Cards */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by Name, Admission No, TC No..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Select Session</span>
            <select 
              value={selectedSession}
              onChange={e => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none font-bold text-slate-600"
            >
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Class</span>
            <select 
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none font-bold text-slate-600"
            >
              <option value="Class V">Class V</option>
              <option value="Class III">Class III</option>
              <option value="Class VII">Class VII</option>
              <option value="Class VIII">Class VIII</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Section</span>
            <select 
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none font-bold text-slate-600"
            >
              <option value="Section B">Section B</option>
              <option value="Section A">Section A</option>
            </select>
          </div>
        </div>

      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden relative">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4">TC No.</th>
                <th className="px-4 py-4 text-left">Admission No.</th>
                <th className="px-4 py-4 text-left">Student</th>
                <th className="px-4 py-4 text-left">Class</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-350">{item.tcNo}</td>
                  <td className="px-4 py-3.5 text-left text-slate-600 dark:text-slate-400 font-semibold">{item.admissionNo}</td>
                  <td className="px-4 py-3.5 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.avatar}</span>
                      <span className="font-extrabold text-slate-850 dark:text-slate-200">{item.studentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-700 dark:text-slate-350">{item.classGrade}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col text-[10px] text-slate-550">
                      <span className="font-semibold text-slate-700 dark:text-slate-455">🗓 {item.dateCreated}</span>
                      <span>🕒 {item.timeCreated}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-500 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Actions Menu Dropdown Popover */}
                    {activeMenuId === item.id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-12 top-2 z-30 w-36 bg-white dark:bg-slate-800 border border-slate-200/80 rounded-xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <button 
                          onClick={() => {
                            setPreviewTC(item)
                            setActiveMenuId(null)
                          }}
                          className="w-full px-4 py-2 hover:bg-sky-50 dark:hover:bg-sky-950 text-left text-[11px] font-bold text-sky-600 flex items-center gap-2.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                        <button 
                          onClick={() => {
                            setPreviewTC(item)
                            setActiveMenuId(null)
                          }}
                          className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-750 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button 
                          onClick={() => {
                            alert('Edit screen is accessible from TC settings or profile changes.')
                            setActiveMenuId(null)
                          }}
                          className="w-full px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-left text-[11px] font-bold text-emerald-600 flex items-center gap-2.5 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="w-full px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950 text-left text-[11px] font-bold text-red-500 flex items-center gap-2.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-xs font-medium text-slate-500">
          <span>Showing 1-{filtered.length} of 456 Entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">«</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">‹</button>
            <button className="px-3 py-1.5 rounded bg-teal-600 text-white font-bold">1</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-teal-655">2</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">›</button>
            <button className="px-3 py-1.5 rounded hover:bg-slate-100 text-slate-400">»</button>
          </div>
        </div>

      </div>

      {/* ================================== PRINT PREVIEW MODAL ================================== */}
      {previewTC && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-100 rounded-3xl w-full max-w-[860px] h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Modal Control Bar */}
            <div className="flex justify-between items-center bg-white p-4 border-b border-slate-200/50 shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Transfer Certificate Preview</h3>
                  <p className="text-[10px] text-slate-400">Student: {previewTC.studentName} ({previewTC.admissionNo})</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-xl text-xs font-bold text-white transition-colors shadow-sm"
                >
                  Print Certificate
                </button>

                <button 
                  onClick={() => setPreviewTC(null)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Template Container */}
            <div className="overflow-auto bg-slate-100 p-6 flex-1 flex justify-center items-start shadow-inner">
              
              {/* High-Fidelity Printable Template (Screenshot 3) */}
              <div className="w-[780px] bg-white text-slate-900 border-2 border-slate-350 p-8 flex flex-col font-sans shrink-0 relative shadow-md select-none rounded-lg">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
                  <div className="flex items-center gap-4">
                    {/* Logo Circle */}
                    <div className="w-16 h-16 rounded-full border-2 border-slate-400 flex items-center justify-center font-bold text-xs shrink-0 bg-slate-50 text-slate-400">
                      Logo
                    </div>

                    <div>
                      <h1 className="text-xl font-black uppercase text-slate-900 tracking-wide">SCHOOL NAME</h1>
                      <p className="text-[10px] font-semibold text-slate-500 leading-tight">
                        Address : 123, Location, Street Name, City, State, Country, Pincode
                      </p>
                      
                      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-[9px] font-bold text-slate-700 mt-1.5">
                        <div>Aff. To : Central Board of Secondary Education</div>
                        <div>School Code : 0012</div>
                        <div>Aff. No. : 21/2024</div>
                        <div>Udise Code : 1234567890</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-10 text-[9px] font-bold text-slate-655 border-b border-slate-200 pb-2 mb-4">
                  <span>Email : School@gmail.com</span>
                  <span>Phone No. : 9999999999</span>
                </div>

                {/* Title */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black tracking-widest text-slate-900 uppercase">
                    Transfer Certificate
                  </h2>
                </div>

                {/* Sub-header numbers */}
                <div className="grid grid-cols-3 text-[10px] font-extrabold uppercase text-slate-800 mb-6 px-1">
                  <div>TC No. : {previewTC.tcNo}</div>
                  <div>SI No. : {previewTC.id}04</div>
                  <div>Admission No. : {previewTC.admissionNo}</div>
                </div>

                {/* 25 Detail fields listing with Dotted Formatting */}
                <div className="space-y-2 mb-8">
                  {tcDetailsList.map((row, idx) => (
                    <div key={idx} className="flex items-end text-xs font-bold text-slate-800 leading-none py-1">
                      
                      {/* Left: Number + Label */}
                      <span className="w-8 text-slate-500">{row.num}</span>
                      <span className="w-72 text-slate-800 font-extrabold">{row.label}</span>
                      <span className="px-1 text-slate-500">:</span>

                      {/* Right: Value + Dotted Line */}
                      <span className="flex-1 font-black text-slate-900 border-b border-dotted border-slate-400 pl-2 leading-none pb-0.5 min-h-[14px]">
                        {row.value || '—'}
                      </span>

                    </div>
                  ))}
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-4 gap-4 text-center mt-12 pb-2 text-[9px] font-black uppercase text-slate-700">
                  <div className="flex flex-col items-center">
                    <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                    <span>Class Teacher</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                    <span>Prepared By</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                    <span>Checked By</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                    <span>Principal</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}

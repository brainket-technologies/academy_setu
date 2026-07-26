'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Plus, Eye, Pencil, Trash2, X, DownloadCloud, Sparkles, QrCode } from 'lucide-react'
import Link from 'next/link'

interface AdmitCardConfig {
  id: number
  className: string
  examName: string
  admitCardLabel: string
  timeTableId: number
  session: string
  schoolName: string
  schoolAddress: string
  displayFields: { [key: string]: boolean }
  status: 'Active' | 'Inactive'
  instructions: string
  dateCreated: string
  timeCreated: string
}

const INITIAL_ADMIT_CARDS: AdmitCardConfig[] = [
  {
    id: 1,
    className: 'Class V',
    examName: 'Half Yearly Exam',
    admitCardLabel: 'Admit Card',
    timeTableId: 1,
    session: '2024-25',
    schoolName: 'SCHOOL NAME',
    schoolAddress: 'Address : 123, Location, Street Name, City, State, Country, Pincode',
    displayFields: {
      name: true, fatherName: true, motherName: true, mobileNo: true,
      admissionNo: true, registrationNo: true, rollNo: true, class: true, section: true,
      dob: true, address: true, photo: true, studentSign: true, teacherSign: true,
      principalSign: true, parentSign: true
    },
    status: 'Inactive',
    instructions: 'Please bring your identity card. Mobiles are strictly prohibited.',
    dateCreated: '15/09/2025',
    timeCreated: '11:00 AM'
  },
  {
    id: 2,
    className: 'Class V',
    examName: 'Annual Exam',
    admitCardLabel: 'Admit Card',
    timeTableId: 2,
    session: '2024-25',
    schoolName: 'SCHOOL NAME',
    schoolAddress: 'Address : 123, Location, Street Name, City, State, Country, Pincode',
    displayFields: {
      name: true, fatherName: true, motherName: true, mobileNo: true,
      admissionNo: true, registrationNo: true, rollNo: true, class: true, section: true,
      dob: true, address: true, photo: true, studentSign: true, teacherSign: true,
      principalSign: true, parentSign: true
    },
    status: 'Active',
    instructions: 'Report at least 30 minutes before exam time.',
    dateCreated: '15/09/2025',
    timeCreated: '11:00 AM'
  },
  {
    id: 3,
    className: 'Class VI',
    examName: 'Half Yearly Exam',
    admitCardLabel: 'Admit Card',
    timeTableId: 3,
    session: '2025-26',
    schoolName: 'SCHOOL NAME',
    schoolAddress: 'Address : 123, Location, Street Name, City, State, Country, Pincode',
    displayFields: {
      name: true, fatherName: true, motherName: true, mobileNo: true,
      admissionNo: true, registrationNo: true, rollNo: true, class: true, section: true,
      dob: true, address: true, photo: true, studentSign: true, teacherSign: true,
      principalSign: true, parentSign: true
    },
    status: 'Active',
    instructions: 'Mobiles and digital logs are prohibited.',
    dateCreated: '15/09/2025',
    timeCreated: '11:00 AM'
  }
]

export default function AdmitCardsPage() {
  const [admitCards, setAdmitCards] = useState<AdmitCardConfig[]>(INITIAL_ADMIT_CARDS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSession, setSelectedSession] = useState('2025-2026')
  const [filterClass, setFilterClass] = useState('')
  const [previewCard, setPreviewCard] = useState<AdmitCardConfig | null>(null)
  
  // Dynamic lookup for timetables
  const [timetables, setTimetables] = useState<any[]>([])

  useEffect(() => {
    // Load Admit Cards
    const savedCards = localStorage.getItem('exam_admit_cards')
    if (savedCards) {
      try {
        setAdmitCards(JSON.parse(savedCards))
      } catch (e) {
        console.error(e)
      }
    } else {
      localStorage.setItem('exam_admit_cards', JSON.stringify(INITIAL_ADMIT_CARDS))
    }

    // Load Timetables for lookup
    const savedTimetables = localStorage.getItem('exam_timetables')
    if (savedTimetables) {
      try {
        setTimetables(JSON.parse(savedTimetables))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this Admit Card template?')) {
      const updated = admitCards.filter(c => c.id !== id)
      setAdmitCards(updated)
      localStorage.setItem('exam_admit_cards', JSON.stringify(updated))
    }
  }

  // Filter admit cards
  const filtered = admitCards.filter(c => {
    const matchesSearch = c.className.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = filterClass ? c.className === filterClass : true
    return matchesSearch && matchesClass
  })

  // Get active subjects scheduled under selected admit card's timetable
  const getSubjectsForAdmitCard = (card: AdmitCardConfig) => {
    const table = timetables.find(t => t.id === Number(card.timeTableId))
    if (table && table.subjects) {
      return table.subjects
    }
    // Return mock fallback rows matching Screenshot 1 if none found
    return [
      { subjectName: 'Paper Name', date: '2025-03-21', fromTime: '10:00', toTime: '13:00' },
      { subjectName: 'Paper Name', date: '2025-03-22', fromTime: '10:00', toTime: '13:00' }
    ]
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Admit Card</h1>
          <p className="text-xs text-slate-400">Configure and view class student admit cards</p>
        </div>
      </div>

      {/* Control / Actions Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by Class (e.g. Class V)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select 
            value={selectedSession}
            onChange={e => setSelectedSession(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none font-bold text-slate-600 bg-white"
          >
            <option value="2025-2026">Session: 2025-2026</option>
            <option value="2024-2025">Session: 2024-2025</option>
          </select>

          <select 
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none font-bold text-slate-600 bg-white"
          >
            <option value="">All Classes</option>
            <option value="Class I">Class I</option>
            <option value="Class II">Class II</option>
            <option value="Class III">Class III</option>
            <option value="Class IV">Class IV</option>
            <option value="Class V">Class V</option>
            <option value="Class VI">Class VI</option>
          </select>

          <Link 
            href="/institute/admit-card/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Admit Card
          </Link>
        </div>

      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-4 w-16">S. No.</th>
                <th className="px-4 py-4 text-left">Title</th>
                <th className="px-4 py-4">Session</th>
                <th className="px-4 py-4 text-left">Label</th>
                <th className="px-4 py-4">View</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Created At</th>
                <th className="px-4 py-4 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="px-4 py-3.5 text-left font-bold text-slate-800 dark:text-slate-200">{item.examName} ({item.className})</td>
                  <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-350">{item.session}</td>
                  <td className="px-4 py-3.5 text-left text-slate-550 dark:text-slate-400 font-semibold">{item.admitCardLabel}</td>
                  <td className="px-4 py-3.5">
                    <button 
                      onClick={() => setPreviewCard(item)}
                      className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 hover:bg-teal-550 hover:text-teal-600 flex items-center justify-center transition-colors border border-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                      item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-400">🗓 {item.dateCreated}</span>
                      <span>🕒 {item.timeCreated}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link 
                        href={`/institute/admit-card/create?editId=${item.id}`}
                        className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 border border-emerald-100 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="w-6 h-6 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 border border-red-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">No Admit Cards found.</td>
                </tr>
              )}
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
      {previewCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-100 rounded-3xl w-full max-w-[860px] h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Modal Control Bar */}
            <div className="flex justify-between items-center bg-white p-4 border-b border-slate-200/50 shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-teal-600 animate-pulse" />
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Live Admit Card Preview</h3>
                  <p className="text-[10px] text-slate-400">Admit Card: {previewCard.examName} ({previewCard.className})</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-xl text-xs font-bold text-white transition-colors shadow-sm"
                >
                  Print Card
                </button>

                <button 
                  onClick={() => setPreviewCard(null)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Template Paper Container */}
            <div className="overflow-auto bg-slate-100 p-6 flex-1 flex justify-center items-start shadow-inner">
              
              {/* High-Fidelity Printable Template (Screenshot 1) */}
              <div className="w-[780px] bg-white text-slate-900 border-2 border-slate-300 p-6 flex flex-col font-sans shrink-0 relative shadow-md select-none rounded-lg">
                
                {/* School Header */}
                <div className="flex justify-between items-center border-b border-slate-300 pb-3 mb-4">
                  <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="w-16 h-16 rounded-full border-2 border-slate-400 flex items-center justify-center font-bold text-xs shrink-0 bg-slate-50 text-slate-400">
                      Logo
                    </div>

                    <div>
                      <h1 className="text-xl font-black uppercase text-slate-900 tracking-wide">
                        {previewCard.schoolName || 'SCHOOL NAME'}
                      </h1>
                      <p className="text-[10px] font-semibold text-slate-500 leading-tight">
                        {previewCard.schoolAddress || 'Address : 123, Location, Street Name, City, State, Country, Pincode'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-[9px] font-bold text-slate-700 mt-1.5">
                        <div>Aff. To : Central Board of Secondary Education</div>
                        <div>School Code : 0012</div>
                        <div>Aff. No. : 21/2024</div>
                        <div>Udise Code : 1234567890</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <QrCode className="w-12 h-12 text-slate-800 bg-white" />
                    <span className="text-[7px] text-slate-400 font-bold font-mono">CODE: 0012</span>
                  </div>
                </div>

                {/* Sub-Header details: Udise/Email */}
                <div className="flex justify-center gap-10 text-[9px] font-bold text-slate-655 border-b border-slate-200 pb-2 mb-4">
                  <span>Email : School@gmail.com</span>
                  <span>Phone No. : 9999999999</span>
                </div>

                {/* Admit Card Title */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black tracking-widest text-slate-900 uppercase">
                    {previewCard.admitCardLabel || 'Admit Card'}
                  </h2>
                </div>

                {/* Info row */}
                <div className="flex justify-between items-center text-[11px] font-extrabold uppercase text-slate-800 mb-4 px-2">
                  <span>Term : {previewCard.examName}</span>
                  <span>Session : {previewCard.session}</span>
                </div>

                {/* Student Details with Dotted Lines */}
                <div className="flex gap-6 items-start mb-6">
                  
                  {/* Dotted lines Grid */}
                  <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3.5 text-xs text-slate-850">
                    
                    {previewCard.displayFields.admissionNo !== false && (
                      <div className="flex col-span-2">
                        <span className="font-extrabold whitespace-nowrap">Admission No. :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {previewCard.displayFields.registrationNo !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Registration No. :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {previewCard.displayFields.rollNo !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Roll No. :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {previewCard.displayFields.name !== false && (
                      <div className="flex col-span-2">
                        <span className="font-extrabold whitespace-nowrap">Student&apos;s Name :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px] text-blue-755 font-black text-sm">
                          Arjun Kumar
                        </span>
                      </div>
                    )}

                    {previewCard.displayFields.fatherName !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Father Name :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {previewCard.displayFields.motherName !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Mother Name :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {previewCard.displayFields.class !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Class :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px] font-black">
                          {previewCard.className}
                        </span>
                      </div>
                    )}

                    {previewCard.displayFields.section !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Section :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px] font-black">
                          Section A
                        </span>
                      </div>
                    )}

                    {previewCard.displayFields.dob !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">DOB :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {previewCard.displayFields.mobileNo !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Mobile No. :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {previewCard.displayFields.address !== false && (
                      <div className="flex col-span-2">
                        <span className="font-extrabold whitespace-nowrap">Address :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                  </div>

                  {/* Student Photo */}
                  {previewCard.displayFields.photo !== false && (
                    <div className="w-24 h-28 bg-slate-100 border border-slate-300 rounded flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold shrink-0 shadow-sm relative overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-300">
                        Photo
                      </div>
                    </div>
                  )}

                </div>

                {/* Exam Time Table Section */}
                <div className="space-y-3 mt-4">
                  <h3 className="text-center font-extrabold text-sm tracking-widest text-slate-900 uppercase">
                    Exam Time Table
                  </h3>

                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-center border-collapse">
                      <thead>
                        <tr className="bg-slate-50 font-extrabold border-b border-slate-300 text-slate-700">
                          <th className="py-2 px-3 border-r border-slate-300 w-16">S.No.</th>
                          <th className="py-2 px-3 border-r border-slate-300 w-36">Date</th>
                          <th className="py-2 px-3 border-r border-slate-300 w-36">Time</th>
                          <th className="py-2 px-3 border-r border-slate-300">Exam</th>
                          <th className="py-2 px-3 w-40">Invigilator&apos;s Sign.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSubjectsForAdmitCard(previewCard).map((sub: any, sidx: number) => (
                          <tr key={sidx} className="border-b border-slate-200 font-bold text-slate-700">
                            <td className="py-2.5 border-r border-slate-200">{sidx + 1}.</td>
                            <td className="py-2.5 border-r border-slate-200">{sub.date}</td>
                            <td className="py-2.5 border-r border-slate-200">{sub.fromTime} AM - {sub.toTime || '13:00'}</td>
                            <td className="py-2.5 border-r border-slate-200 text-slate-900 font-black">{sub.subjectName}</td>
                            <td className="py-2.5"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Instructions text */}
                {previewCard.instructions && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[9px] text-slate-550 leading-relaxed italic">
                    <b>Instructions:</b> {previewCard.instructions}
                  </div>
                )}

                {/* Signatures Row */}
                <div className="grid grid-cols-4 gap-4 text-center mt-12 pb-4 text-[9px] font-black uppercase text-slate-700">
                  <div className="flex flex-col items-center">
                    <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                    <span>Student&apos;s Sign.</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                    <span>Parent&apos;s Sign.</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                    <span>Teacher&apos;s Sign.</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                    <span>Principal&apos;s Sign.</span>
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

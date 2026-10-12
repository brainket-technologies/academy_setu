'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { Plus, X, ArrowLeft, ChevronDown, Sparkles, Eye, Printer, QrCode, Calendar, Check } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { fetchMarksheetSetups, ExamMarksheetSetupRecord } from '@/app/institute/exam-marksheet/setup/actions'
import { getInstituteAddedClasses, MasterClassWithSections } from '@/lib/institute-classes'

interface TimeTableOption {
  id: number
  title: string
  classGrade: string
}

const DISPLAY_FIELDS_KEYS = [
  { key: 'name', label: 'Name' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'motherName', label: 'Mother Name' },
  { key: 'mobileNo', label: 'Mobile No.' },
  { key: 'admissionNo', label: 'Admission No.' },
  { key: 'registrationNo', label: 'Registration No.' },
  { key: 'rollNo', label: 'Roll No.' },
  { key: 'enrollmentNo', label: 'Enrollment No.' },
  { key: 'dob', label: 'DOB' },
  { key: 'address', label: 'Address' },
  { key: 'class', label: 'Class' },
  { key: 'section', label: 'Section' },
  { key: 'photo', label: 'Photo' },
  { key: 'studentSign', label: 'Student Sign.' },
  { key: 'teacherSign', label: 'Teacher Sign.' },
  { key: 'principalSign', label: 'Principal Sign.' },
  { key: 'parentSign', label: 'Parent Sign.' },
  { key: 'schoolStamp', label: 'School Stamp' }
]

function CreateAdmitCardForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('editId')

  // Available Time Tables
  const [timeTables, setTimeTables] = useState<TimeTableOption[]>([])

  // Marksheet Setups from PostgreSQL & Added Classes
  const [marksheetSetups, setMarksheetSetups] = useState<ExamMarksheetSetupRecord[]>([])
  const [masterClasses, setMasterClasses] = useState<MasterClassWithSections[]>([])
  const [isCustomExam, setIsCustomExam] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // State fields matching Screenshot 4
  const [classGrade, setClassGrade] = useState('')
  const [examName, setExamName] = useState('')
  const [admitCardLabel, setAdmitCardLabel] = useState('Admit Card')
  const [timeTableId, setTimeTableId] = useState('')
  const [session, setSession] = useState('2025-2026')
  const [schoolName, setSchoolName] = useState('SCHOOL NAME')
  const [schoolAddress, setSchoolAddress] = useState('Address : 123, Location, Street Name, City, State, Country, Pincode')

  // Checkboxes
  const [displayFields, setDisplayFields] = useState<{ [key: string]: boolean }>({
    name: true, fatherName: true, motherName: true, mobileNo: false,
    admissionNo: true, registrationNo: true, rollNo: true, enrollmentNo: false,
    dob: true, address: true, class: true, section: true, photo: true,
    studentSign: true, teacherSign: true, principalSign: true, parentSign: true,
    schoolStamp: false
  })

  // Toggles
  const [admitCardStatus, setAdmitCardStatus] = useState(true)
  const [showExamTimeTable, setShowExamTimeTable] = useState(true)

  // Custom Sizing details
  const [instructions, setInstructions] = useState('')
  const [noOfPrintPerPage, setNoOfPrintPerPage] = useState('1')
  const [headerNameFontSize, setHeaderNameFontSize] = useState('30')
  const [headerDetailsFontSize, setHeaderDetailsFontSize] = useState('30')
  const [studentDetailsFontSize, setStudentDetailsFontSize] = useState('14')
  const [timetableDetailsFontSize, setTimetableDetailsFontSize] = useState('14')
  const [headingFontSize, setHeadingFontSize] = useState('18')
  const [defaultFontSize, setDefaultFontSize] = useState('18')
  const [spacing, setSpacing] = useState('20')
  const [studentPhotoSize, setStudentPhotoSize] = useState('100')
  
  // Sign labels
  const [teacherSignLabel, setTeacherSignLabel] = useState("Class Teacher's Sign.")
  const [studentSignLabel, setStudentSignLabel] = useState("Student's Sign.")
  const [parentSignLabel, setParentSignLabel] = useState("Parent's Sign.")
  const [principalSignLabel, setPrincipalSignLabel] = useState("Principal's Sign.")
  const [signatureWidth, setSignatureWidth] = useState('30')
  const [schoolStampWidth, setSchoolStampWidth] = useState('30')

  // Load Time Tables, Marksheet Setups & Edit Data
  useEffect(() => {
    // 1. Load added master classes
    const addedClasses = getInstituteAddedClasses()
    setMasterClasses(addedClasses)

    // 2. Load Marksheet Setups from PostgreSQL
    const loadSetups = async () => {
      try {
        const res = await fetchMarksheetSetups()
        if (res.success && res.data) {
          setMarksheetSetups(res.data)
        }
      } catch (err) {
        console.error('Error fetching marksheet setups for admit card:', err)
      }
    }
    loadSetups()

    // 3. Load timetables
    const savedTT = localStorage.getItem('exam_timetables')
    if (savedTT) {
      try {
        setTimeTables(JSON.parse(savedTT))
      } catch (e) {
        console.error(e)
      }
    }

    // 4. Load edit target
    if (editId) {
      const savedCards = localStorage.getItem('exam_admit_cards')
      if (savedCards) {
        try {
          const list = JSON.parse(savedCards)
          const found = list.find((item: any) => item.id === Number(editId))
          if (found) {
            setClassGrade(found.className)
            setExamName(found.examName)
            setAdmitCardLabel(found.admitCardLabel)
            setTimeTableId(String(found.timeTableId))
            setSession(found.session)
            setSchoolName(found.schoolName || 'SCHOOL NAME')
            setSchoolAddress(found.schoolAddress || '')
            setDisplayFields(found.displayFields)
            setAdmitCardStatus(found.status === 'Active')
            setInstructions(found.instructions || '')
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [editId])

  // Extract unique exams with classes from marksheet setups
  const setupExams = useMemo(() => {
    const map = new Map<string, { exam: string; sessions: Set<string>; classes: Set<string> }>()
    marksheetSetups.forEach(s => {
      if (!s.exam) return
      const trimmed = s.exam.trim()
      if (!map.has(trimmed)) {
        map.set(trimmed, { exam: trimmed, sessions: new Set(), classes: new Set() })
      }
      const entry = map.get(trimmed)!
      if (s.session) entry.sessions.add(s.session)
      if (s.classGrade) {
        const baseClass = s.classGrade.split('(')[0].trim()
        entry.classes.add(baseClass)
      }
    })

    return Array.from(map.values()).map(e => ({
      name: e.exam,
      sessions: Array.from(e.sessions),
      classes: Array.from(e.classes)
    }))
  }, [marksheetSetups])

  const handleExamChange = (selectedVal: string) => {
    if (selectedVal === '__CUSTOM__') {
      setIsCustomExam(true)
      setExamName('')
      return
    }
    setIsCustomExam(false)
    setExamName(selectedVal)

    // Match setup to automatically sync session, class, and link timetable
    const matched = marksheetSetups.find(s => s.exam === selectedVal)
    if (matched) {
      if (matched.session) {
        setSession(matched.session)
      }
      if (matched.classGrade && !classGrade) {
        const baseClass = matched.classGrade.split('(')[0].trim()
        setClassGrade(baseClass)
      }

      // Check if a timetable already exists for this exam title or class
      const existingTT = timeTables.find(t => 
        t.title?.toLowerCase() === selectedVal.toLowerCase() || 
        t.classGrade?.toLowerCase() === matched.classGrade?.toLowerCase()
      )
      if (existingTT) {
        setTimeTableId(String(existingTT.id))
      } else {
        setTimeTableId('from-setup')
      }
    }
  }

  // Helper to get timetable subjects for preview or link
  const getSubjectsForAdmitCard = () => {
    // 1. Look up from selected timetable
    if (timeTableId && timeTableId !== 'from-setup') {
      const foundTT = timeTables.find(t => t.id === Number(timeTableId))
      if (foundTT && (foundTT as any).subjects && (foundTT as any).subjects.length > 0) {
        return (foundTT as any).subjects
      }
    }

    // 2. Look up from selected marksheet setup
    if (examName) {
      const matchedSetup = marksheetSetups.find(s => s.exam === examName)
      if (matchedSetup && matchedSetup.config?.subjects && matchedSetup.config.subjects.length > 0) {
        return matchedSetup.config.subjects.map((sub: any, idx: number) => ({
          subjectName: sub.subjectName || `Subject ${idx + 1}`,
          date: sub.examDate || matchedSetup.examDate || '2025-03-21',
          fromTime: '10:00',
          toTime: '13:00'
        }))
      }
    }

    // 3. Fallback standard subjects
    return [
      { subjectName: 'English Core', date: '2025-03-21', fromTime: '10:00', toTime: '13:00' },
      { subjectName: 'Mathematics', date: '2025-03-24', fromTime: '10:00', toTime: '13:00' },
      { subjectName: 'General Science', date: '2025-03-27', fromTime: '10:00', toTime: '13:00' }
    ]
  }

  const handleSelectAllChange = (checked: boolean) => {
    const updated: { [key: string]: boolean } = {}
    DISPLAY_FIELDS_KEYS.forEach(f => {
      updated[f.key] = checked
    })
    setDisplayFields(updated)
  }

  const handleCheckboxChange = (key: string) => {
    setDisplayFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const isAllSelected = DISPLAY_FIELDS_KEYS.every(f => displayFields[f.key])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!classGrade || !examName) {
      alert('Please fill in Class and Exam Name.')
      return
    }

    const today = new Date()
    const dateStr = today.toLocaleDateString('en-GB')
    const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const savedCards = localStorage.getItem('exam_admit_cards')
    let current: any[] = []
    if (savedCards) {
      try {
        current = JSON.parse(savedCards)
      } catch (e) {
        console.error(e)
      }
    }

    let finalTimeTableId = Number(timeTableId) || 1
    if (timeTableId === 'from-setup') {
      const newTTId = Date.now()
      const setupSubjects = getSubjectsForAdmitCard()
      const newTTEntry = {
        id: newTTId,
        title: examName,
        classGrade: classGrade,
        session: session,
        subjects: setupSubjects,
        dateCreated: dateStr,
        timeCreated: timeStr
      }
      const savedTTs = localStorage.getItem('exam_timetables')
      let ttList: any[] = []
      if (savedTTs) {
        try { ttList = JSON.parse(savedTTs) } catch (err) {}
      }
      ttList = [newTTEntry, ...ttList]
      localStorage.setItem('exam_timetables', JSON.stringify(ttList))
      finalTimeTableId = newTTId
    }

    const payload = {
      id: editId ? Number(editId) : Date.now(),
      className: classGrade,
      examName,
      admitCardLabel,
      timeTableId: finalTimeTableId,
      session,
      schoolName,
      schoolAddress,
      displayFields,
      status: admitCardStatus ? 'Active' : 'Inactive',
      instructions,
      dateCreated: editId ? (current.find(i => i.id === Number(editId))?.dateCreated || dateStr) : dateStr,
      timeCreated: editId ? (current.find(i => i.id === Number(editId))?.timeCreated || timeStr) : timeStr
    }

    let updated: any[] = []
    if (editId) {
      updated = current.map(item => item.id === Number(editId) ? payload : item)
    } else {
      updated = [payload, ...current]
    }

    localStorage.setItem('exam_admit_cards', JSON.stringify(updated))
    router.push('/institute/admit-card')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.push('/institute/admit-card')}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {editId ? 'Edit Admit Card' : 'Create Admit Card'}
            </h1>
            <p className="text-xs text-slate-400">Configure visual layout details and printing formats</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-50 dark:bg-teal-950/40 border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-100 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Eye className="w-4 h-4" /> Live Preview
          </button>
          <Link 
            href="/institute/admit-card/time-table/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 border border-teal-600 text-white hover:bg-teal-700 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            + Create Exam Time Table
          </Link>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Core details card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          
          {/* Class (Only Added Classes) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Class <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                Masters
              </span>
            </div>
            <select
              required
              value={classGrade}
              onChange={e => setClassGrade(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
            >
              <option value="">Select Class</option>
              {masterClasses.map(m => (
                <option key={m.className} value={m.className}>
                  {m.className}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400">Only added classes from Masters</span>
          </div>

          {/* Exam Name (From Exam Marksheet Setup) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exam Name <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                From Marksheet Setup
              </span>
            </div>

            {!isCustomExam ? (
              <div className="space-y-1">
                <select 
                  required
                  value={examName}
                  onChange={e => handleExamChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-bold text-slate-800 dark:text-slate-100 shadow-xs"
                >
                  <option value="">-- Select Exam from Setup --</option>
                  {setupExams.map(ex => (
                    <option key={ex.name} value={ex.name}>
                      {ex.name} {ex.classes.length > 0 ? `(${ex.classes.join(', ')})` : ''}
                    </option>
                  ))}
                  <option value="__CUSTOM__">✏️ + Enter Custom Exam Name</option>
                </select>
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                  <span>{setupExams.length} exam setup(s) available</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomExam(true)
                      setExamName('')
                    }}
                    className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                  >
                    Custom Name
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 animate-in fade-in">
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    placeholder="Enter Custom Exam Name"
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-bold text-slate-800 dark:text-slate-100 shadow-xs pr-24"
                  />
                  {setupExams.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomExam(false)
                        setExamName(setupExams[0]?.name || '')
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/40 rounded-lg border border-teal-200 hover:bg-teal-100"
                    >
                      From Setups
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 px-0.5">Typing custom exam name</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Admit Card Label *</label>
            <input 
              type="text" 
              required
              placeholder="Enter Admit Card Label"
              value={admitCardLabel}
              onChange={e => setAdmitCardLabel(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Exam Time Table <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                Auto-Linked
              </span>
            </div>
            <select
              required
              value={timeTableId}
              onChange={e => setTimeTableId(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
            >
              <option value="">Select Option</option>
              {examName && (
                <option value="from-setup" className="font-bold text-teal-700">
                  ⚡ Auto-Linked Schedule from Exam Setup ({examName})
                </option>
              )}
              {timeTables.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.classGrade})</option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400">Linked to scheduled exam papers & timings</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Session *</label>
            <select
              required
              value={session}
              onChange={e => setSession(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            >
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">School Name</label>
            <input 
              type="text" 
              placeholder="Enter School Name"
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700">School Address</label>
            <input 
              type="text" 
              placeholder="Enter School Address"
              value={schoolAddress}
              onChange={e => setSchoolAddress(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            />
          </div>

        </div>

        {/* Fields check grid (Screenshot 4) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6">
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider">
              Select fields to display on the Student Admit Card
            </h3>
            
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
              <input 
                type="checkbox"
                checked={isAllSelected}
                onChange={e => handleSelectAllChange(e.target.checked)}
                className="w-4 h-4 text-teal-600 border-slate-350 focus:ring-teal-500 rounded"
              />
              <span>Select All</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-700">
            {DISPLAY_FIELDS_KEYS.map(f => (
              <label key={f.key} className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={!!displayFields[f.key]}
                  onChange={() => handleCheckboxChange(f.key)}
                  className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                />
                <span>{f.label}</span>
              </label>
            ))}
          </div>

          {/* Toggle Switches (Screenshot 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150">
              <div>
                <span className="text-xs font-black text-slate-800 block">Admit Card Status</span>
                <span className="text-[10px] text-slate-400">If activated, students can download through App.</span>
              </div>
              <button 
                type="button" 
                onClick={() => setAdmitCardStatus(!admitCardStatus)} 
                className={`w-10 h-5.5 rounded-full relative transition-colors ${admitCardStatus ? 'bg-teal-650 bg-teal-600' : 'bg-slate-200'}`}
              >
                <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${admitCardStatus ? 'left-5' : 'left-0.5'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150">
              <div>
                <span className="text-xs font-black text-slate-800 block">Exam time table</span>
                <span className="text-[10px] text-slate-400">Do you want to show exam time table on admit card?</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowExamTimeTable(!showExamTimeTable)} 
                className={`w-10 h-5.5 rounded-full relative transition-colors ${showExamTimeTable ? 'bg-teal-600' : 'bg-slate-200'}`}
              >
                <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showExamTimeTable ? 'left-5' : 'left-0.5'}`}></div>
              </button>
            </div>

          </div>

        </div>

        {/* Customization Details Page Card (Screenshot 4) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Instruction</label>
            <textarea 
              placeholder="Write instructions..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full min-h-[80px] p-4 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">No. of print per page</label>
              <input type="text" value={noOfPrintPerPage} onChange={e => setNoOfPrintPerPage(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none text-center" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Header name font size (in px)</label>
              <input type="text" value={headerNameFontSize} onChange={e => setHeaderNameFontSize(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none text-center" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Header details font size (in px)</label>
              <input type="text" value={headerDetailsFontSize} onChange={e => setHeaderDetailsFontSize(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none text-center" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Student details font size (in px)</label>
              <input type="text" value={studentDetailsFontSize} onChange={e => setStudentDetailsFontSize(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none text-center" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Timetable details font size (in px)</label>
              <input type="text" value={timetableDetailsFontSize} onChange={e => setTimetableDetailsFontSize(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none text-center" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Heading font size (in px)</label>
              <input type="text" value={headingFontSize} onChange={e => setHeadingFontSize(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none text-center" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Default font size (in px)</label>
              <input type="text" value={defaultFontSize} onChange={e => setDefaultFontSize(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none text-center" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Spacing (in px)</label>
              <input type="text" value={spacing} onChange={e => setSpacing(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none text-center" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Student photo size (in px)</label>
              <input type="text" value={studentPhotoSize} onChange={e => setStudentPhotoSize(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none text-center" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Teacher Sign Label</label>
              <input type="text" value={teacherSignLabel} onChange={e => setTeacherSignLabel(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none font-semibold text-slate-700" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Student Sign Label</label>
              <input type="text" value={studentSignLabel} onChange={e => setStudentSignLabel(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none font-semibold text-slate-700" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Parent Sign Label</label>
              <input type="text" value={parentSignLabel} onChange={e => setParentSignLabel(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none font-semibold text-slate-700" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Principal Sign Label</label>
              <input type="text" value={principalSignLabel} onChange={e => setPrincipalSignLabel(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none font-semibold text-slate-700" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">Signature width (in pixel)</label>
              <input type="text" value={signatureWidth} onChange={e => setSignatureWidth(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none text-center" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase">School Stamp width (in px)</label>
              <input type="text" value={schoolStampWidth} onChange={e => setSchoolStampWidth(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none text-center" />
            </div>

          </div>

        </div>

        {/* Action footer */}
        <div className="flex justify-between items-center pt-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <button 
            type="button" 
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-5 py-2 border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Eye className="w-4 h-4" /> Live Preview
          </button>
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => router.push('/institute/admit-card')}
              className="px-5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Save Admit Card
            </button>
          </div>
        </div>

      </form>

      {/* ================================== LIVE PREVIEW MODAL ================================== */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl w-full max-w-[880px] h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            
            {/* Modal Control Bar */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-teal-600 animate-pulse" />
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    Live Admit Card Preview
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {examName || 'Exam Name'} ({classGrade || 'Class'}) • Session: {session}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-xl text-xs font-bold text-white transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Preview
                </button>

                <button 
                  type="button"
                  onClick={() => setIsPreviewOpen(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-250 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Template Paper Container */}
            <div className="overflow-auto bg-slate-100 dark:bg-slate-950 p-6 flex-1 flex justify-center items-start shadow-inner">
              
              {/* High-Fidelity Printable Template */}
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
                        {schoolName || 'SCHOOL NAME'}
                      </h1>
                      <p className="text-[10px] font-semibold text-slate-500 leading-tight max-w-lg">
                        {schoolAddress || 'Address : 123, Location, Street Name, City, State, Country, Pincode'}
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
                <div className="flex justify-center gap-10 text-[9px] font-bold text-slate-600 border-b border-slate-200 pb-2 mb-4">
                  <span>Email : School@gmail.com</span>
                  <span>Phone No. : 9999999999</span>
                </div>

                {/* Admit Card Title */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black tracking-widest text-slate-900 uppercase">
                    {admitCardLabel || 'Admit Card'}
                  </h2>
                </div>

                {/* Info row */}
                <div className="flex justify-between items-center text-[11px] font-extrabold uppercase text-slate-800 mb-4 px-2">
                  <span>Term : {examName || 'Examination Name'}</span>
                  <span>Session : {session}</span>
                </div>

                {/* Student Details with Dotted Lines */}
                <div className="flex gap-6 items-start mb-6">
                  
                  {/* Dotted lines Grid */}
                  <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3.5 text-xs text-slate-850">
                    
                    {displayFields.admissionNo !== false && (
                      <div className="flex col-span-2">
                        <span className="font-extrabold whitespace-nowrap">Admission No. :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {displayFields.registrationNo !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Registration No. :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {displayFields.rollNo !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Roll No. :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {displayFields.name !== false && (
                      <div className="flex col-span-2">
                        <span className="font-extrabold whitespace-nowrap">Student&apos;s Name :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px] text-blue-700 font-black text-sm">
                          Arjun Kumar
                        </span>
                      </div>
                    )}

                    {displayFields.fatherName !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Father Name :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {displayFields.motherName !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Mother Name :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {displayFields.class !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Class :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px] font-black">
                          {classGrade || 'Class I'}
                        </span>
                      </div>
                    )}

                    {displayFields.section !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Section :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px] font-black">
                          Section A
                        </span>
                      </div>
                    )}

                    {displayFields.dob !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">DOB :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {displayFields.mobileNo !== false && (
                      <div className="flex">
                        <span className="font-extrabold whitespace-nowrap">Mobile No. :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                    {displayFields.address !== false && (
                      <div className="flex col-span-2">
                        <span className="font-extrabold whitespace-nowrap">Address :</span>
                        <span className="flex-1 border-b border-dashed border-slate-400 ml-1.5 mb-0.5 min-h-[16px]"></span>
                      </div>
                    )}

                  </div>

                  {/* Student Photo */}
                  {displayFields.photo !== false && (
                    <div className="w-24 h-28 bg-slate-100 border border-slate-300 rounded flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold shrink-0 shadow-sm relative overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-300">
                        Photo
                      </div>
                    </div>
                  )}

                </div>

                {/* Exam Time Table Section */}
                {showExamTimeTable && (
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
                            <th className="py-2 px-3 border-r border-slate-300">Exam / Subject</th>
                            <th className="py-2 px-3 w-40">Invigilator&apos;s Sign.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getSubjectsForAdmitCard().map((sub: any, sidx: number) => (
                            <tr key={sidx} className="border-b border-slate-200 font-bold text-slate-700">
                              <td className="py-2.5 border-r border-slate-200">{sidx + 1}.</td>
                              <td className="py-2.5 border-r border-slate-200">{sub.date || '-'}</td>
                              <td className="py-2.5 border-r border-slate-200">{sub.fromTime || '10:00'} - {sub.toTime || '13:00'}</td>
                              <td className="py-2.5 border-r border-slate-200 text-slate-900 font-black">{sub.subjectName}</td>
                              <td className="py-2.5"></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Instructions text */}
                {instructions && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[9px] text-slate-600 leading-relaxed italic">
                    <b>Instructions:</b> {instructions}
                  </div>
                )}

                {/* Signatures Row */}
                <div className="grid grid-cols-4 gap-4 text-center mt-12 pb-4 text-[9px] font-black uppercase text-slate-700">
                  <div className="flex flex-col items-center">
                    <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                    <span>{studentSignLabel || "Student's Sign."}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                    <span>{parentSignLabel || "Parent's Sign."}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                    <span>{teacherSignLabel || "Teacher's Sign."}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[80%] h-0.5 border-t border-dashed border-slate-400 mb-2"></div>
                    <span>{principalSignLabel || "Principal's Sign."}</span>
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

export default function CreateAdmitCardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-xs text-slate-400">Loading...</div>}>
      <CreateAdmitCardForm />
    </Suspense>
  )
}

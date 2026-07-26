'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Plus, X, ArrowLeft, ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

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

  // State fields matching Screenshot 4
  const [classGrade, setClassGrade] = useState('')
  const [examName, setExamName] = useState('')
  const [admitCardLabel, setAdmitCardLabel] = useState('Admit Card')
  const [timeTableId, setTimeTableId] = useState('')
  const [session, setSession] = useState('2025-26')
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

  // Load Time Tables & Edit Data
  useEffect(() => {
    // Load timetables
    const savedTT = localStorage.getItem('exam_timetables')
    if (savedTT) {
      try {
        setTimeTables(JSON.parse(savedTT))
      } catch (e) {
        console.error(e)
      }
    }

    // Load edit target
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

    const payload = {
      id: editId ? Number(editId) : Date.now(),
      className: classGrade,
      examName,
      admitCardLabel,
      timeTableId: Number(timeTableId) || 1,
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

        <Link 
          href="/institute/admit-card/time-table/create"
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-655 border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          + Create Exam Time Table
        </Link>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Core details card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Class *</label>
            <select
              required
              value={classGrade}
              onChange={e => setClassGrade(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            >
              <option value="">Select Class</option>
              <option value="Class I">Class I</option>
              <option value="Class II">Class II</option>
              <option value="Class III">Class III</option>
              <option value="Class IV">Class IV</option>
              <option value="Class V">Class V</option>
              <option value="Class VI">Class VI</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Exam Name *</label>
            <input 
              type="text" 
              required
              placeholder="Enter Exam Name"
              value={examName}
              onChange={e => setExamName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            />
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
            <label className="text-xs font-bold text-slate-700">Exam Time Table *</label>
            <select
              required
              value={timeTableId}
              onChange={e => setTimeTableId(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
            >
              <option value="">Select Option</option>
              {timeTables.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.classGrade})</option>
              ))}
            </select>
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
        <div className="flex justify-end gap-3 pt-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
          <button 
            type="button" 
            onClick={() => router.push('/institute/admit-card')}
            className="px-5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Save
          </button>
        </div>

      </form>
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

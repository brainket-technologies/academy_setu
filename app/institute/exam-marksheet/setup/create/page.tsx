'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Save, Check, Award, Eye, FileText, LayoutTemplate, ShieldAlert } from 'lucide-react'

// Step Definitions
type StepType = 'Exams' | 'Marks & Grade Range' | 'Marksheet Design Setup' | 'Certificate Design'
const STEPS: StepType[] = ['Exams', 'Marks & Grade Range', 'Marksheet Design Setup', 'Certificate Design']

interface SubjectConfig {
  id: number
  subjectName: string
  maxMarks: string
  practicalColumn: boolean
  practicalMarks: string
}

interface ClassConfig {
  id: number
  className: string
  subjects: SubjectConfig[]
}

export default function AddSetupWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<StepType>('Exams')

  // ==================== STEP 1: EXAMS STATE ====================
  const [groupName, setGroupName] = useState('Exam')
  const [availableGroups, setAvailableGroups] = useState<string[]>(['Exam', 'Theory Exam', 'Practical Exam'])

  useEffect(() => {
    const saved = localStorage.getItem('exam_groups')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setAvailableGroups(parsed.map((item: any) => item.groupName))
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const [examName, setExamName] = useState('')
  const [session, setSession] = useState('2025-2026')
  const [dateOfExam, setDateOfExam] = useState('')
  const [admitCardDate, setAdmitCardDate] = useState('')
  const [lockExam, setLockExam] = useState(false)
  const [lastDateToEnter, setLastDateToEnter] = useState('')
  const [lockClasses, setLockClasses] = useState('Select Multiple Classes')

  const [classes, setClasses] = useState<ClassConfig[]>([
    {
      id: 1,
      className: '',
      subjects: [{ id: 1, subjectName: '', maxMarks: '100', practicalColumn: false, practicalMarks: '' }]
    }
  ])

  // Class / Subject Handlers
  const handleAddClass = () => {
    setClasses(prev => [
      ...prev,
      {
        id: Date.now(),
        className: '',
        subjects: [{ id: Date.now() + 1, subjectName: '', maxMarks: '100', practicalColumn: false, practicalMarks: '' }]
      }
    ])
  }

  const handleRemoveClass = (classId: number) => {
    if (classes.length === 1) return
    setClasses(prev => prev.filter(c => c.id !== classId))
  }

  const handleClassChange = (classId: number, name: string) => {
    setClasses(prev => prev.map(c => c.id === classId ? { ...c, className: name } : c))
  }

  const handleAddSubject = (classId: number) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          subjects: [
            ...c.subjects,
            { id: Date.now(), subjectName: '', maxMarks: '100', practicalColumn: false, practicalMarks: '' }
          ]
        }
      }
      return c
    }))
  }

  const handleSubjectChange = (classId: number, subId: number, field: keyof SubjectConfig, val: any) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          subjects: c.subjects.map(s => s.id === subId ? { ...s, [field]: val } : s)
        }
      }
      return c
    }))
  }

  // ==================== STEP 2: MARKS & GRADE STATE ====================
  const [percentRanges, setPercentRanges] = useState([
    { range: '85-100', remark: 'Excellent' },
    { range: '75-84', remark: 'Very Good' },
    { range: '60-74', remark: 'Good' },
    { range: '41-59', remark: 'Satisfactory' },
    { range: '33-40', remark: 'Need Attention' },
    { range: '00-32', remark: 'Very Poor' }
  ])

  const [gradeRanges, setGradeRanges] = useState([
    { range: '91-100', grade: 'A+' },
    { range: '81-90', grade: 'A' },
    { range: '71-80', grade: 'B+' },
    { range: '61-70', grade: 'B' },
    { range: '51-60', grade: 'C+' },
    { range: '41-50', grade: 'C' },
    { range: '33-40', grade: 'D' },
    { range: '00-32', grade: 'F' }
  ])

  const [divisionRanges, setDivisionRanges] = useState([
    { range: '75-100', div: '1st' },
    { range: '60-74', div: '2nd' },
    { range: '33-59', div: '3rd' }
  ])

  const [expandedSection, setExpandedSection] = useState<'percent' | 'grade' | 'division' | null>('percent')

  // ==================== STEP 3: MARKSHEET DESIGN STATE ====================
  // Criteria
  const [minPassingPct, setMinPassingPct] = useState('33')
  const [minPassingMarks, setMinPassingMarks] = useState('33')
  const [gradeToDisplay, setGradeToDisplay] = useState('All')
  
  // Headings
  const [heading1, setHeading1] = useState('First Term (Internal Exam)')
  const [heading2, setHeading2] = useState('Half Yearly Exam')
  const [headingHeader, setHeadingHeader] = useState('')
  const [showTestMarks, setShowTestMarks] = useState(false)

  // Layout Widths
  const [logoWidth, setLogoWidth] = useState('60')
  const [affWordWidth, setAffWordWidth] = useState('20')
  const [photoWidth, setPhotoWidth] = useState('70')
  const [photoHeight, setPhotoHeight] = useState('90')
  const [logoPos, setLogoPos] = useState('Left')
  
  // Toggles
  const [showHeaderSign, setShowHeaderSign] = useState(false)
  const [showHeaderStamp, setShowHeaderStamp] = useState(false)
  const [showStudentPhoto, setShowStudentPhoto] = useState(true)
  const [showBlankSpace, setShowBlankSpace] = useState(false)
  const [showParentMobile, setShowParentMobile] = useState(false)
  const [showRoundBorderPhoto, setShowRoundBorderPhoto] = useState(false)

  // Templates
  const [selectedTemplate, setSelectedTemplate] = useState('Purple Classic')

  // Columns Checkboxes
  const [columnsList, setColumnsList] = useState({
    rollNumber: true, motherName: true, fatherName: true, admissionNo: true,
    mobileNumber: false, classSection: true, gender: true, dob: true,
    address: false, examName: true, obtMarks: true, totalMarks: true,
    percentage: true, grade: true, remarks: true, rank: true,
    result: true, teacherSign: true, controllerSign: true, principalSign: true,
    attendance: true, examDate: false, dateOfIssue: true
  })

  // School Details Accordions
  const [schoolName, setSchoolName] = useState('Delhi Public School')
  const [affiliateTo, setAffiliateTo] = useState('CBSE New Delhi')
  const [schoolAddress, setSchoolAddress] = useState('Green Park Sector 4, New Delhi')
  const [schoolCode, setSchoolCode] = useState('123456')
  const [phone, setPhone] = useState('011-2345678')
  const [email, setEmail] = useState('dps@example.com')
  const [principalName, setPrincipalName] = useState('Mrs. Shailaja Sen')
  const [academicYear, setAcademicYear] = useState('2025-2026')

  const [activeAccordion, setActiveAccordion] = useState<string | null>('schoolDetails')

  // ==================== STEP 4: CERTIFICATE STATE ====================
  const [certTemplate, setCertTemplate] = useState('Certificate Design 1')

  // ==================== GENERAL ACTIONS ====================
  const validateStep1 = () => {
    if (!examName) {
      alert('Please fill in the Exam Name.')
      return false
    }
    for (const c of classes) {
      if (!c.className) {
        alert('Please fill in the Class Name for all class cards.')
        return false
      }
      for (const s of c.subjects) {
        if (!s.subjectName) {
          alert(`Please configure the Subject Name for ${c.className || 'all classes'}.`)
          return false
        }
      }
    }
    if (!dateOfExam || !admitCardDate) {
      alert('Please enter both Exam Date and Admit Card Generated Date.')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (currentStep === 'Exams') {
      if (validateStep1()) setCurrentStep('Marks & Grade Range')
    } else if (currentStep === 'Marks & Grade Range') {
      setCurrentStep('Marksheet Design Setup')
    } else if (currentStep === 'Marksheet Design Setup') {
      setCurrentStep('Certificate Design')
    }
  }

  const handleBack = () => {
    if (currentStep === 'Marks & Grade Range') {
      setCurrentStep('Exams')
    } else if (currentStep === 'Marksheet Design Setup') {
      setCurrentStep('Marks & Grade Range')
    } else if (currentStep === 'Certificate Design') {
      setCurrentStep('Marksheet Design Setup')
    }
  }

  const handleSaveSetup = () => {
    // Generate dates
    const today = new Date()
    const formattedDate = today.toLocaleDateString('en-GB')
    const formattedTime = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    // Build the objects for each class
    const savedSetupsStr = localStorage.getItem('exam_setups')
    let currentSetups = []
    if (savedSetupsStr) {
      try {
        currentSetups = JSON.parse(savedSetupsStr)
      } catch (e) {
        console.error(e)
      }
    }

    // Add multiple entries if they configured multiple classes
    const newSetups = classes.map((c, i) => ({
      id: Date.now() + i,
      group: groupName,
      exam: examName,
      classGrade: c.className,
      marksGrade: 'Percentage',
      templateName: selectedTemplate,
      date: formattedDate,
      time: formattedTime
    }))

    const updated = [...newSetups, ...currentSetups]
    localStorage.setItem('exam_setups', JSON.stringify(updated))

    alert('Exam and Marksheet Setup configured successfully!')
    router.push('/institute/exam-marksheet/setup')
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Add Setup</h1>
          <p className="text-xs text-slate-400">Configure exams, ranges, layouts, and designs in 4 steps</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/institute/exam-marksheet/group"
            className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-655 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors"
          >
            + Create Group
          </Link>
          <button 
            onClick={handleSaveSetup}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" /> Create Setup
          </button>
        </div>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center max-w-3xl mx-auto relative px-4">
          
          {/* Progress bar line background */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
          {/* Active progress bar line foreground */}
          <div 
            className="absolute top-1/2 left-4 h-0.5 bg-teal-600 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ 
              width: 
                currentStep === 'Exams' ? '0%' :
                currentStep === 'Marks & Grade Range' ? '33%' :
                currentStep === 'Marksheet Design Setup' ? '66%' : '100%'
            }}
          ></div>

          {STEPS.map((step, idx) => {
            const isActive = currentStep === step
            const isCompleted = STEPS.indexOf(currentStep) > idx
            return (
              <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                  isActive ? 'bg-teal-600 border-teal-600 text-white shadow-md' :
                  isCompleted ? 'bg-teal-100 border-teal-500 text-teal-600 font-bold' :
                  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  isActive ? 'text-teal-600' : 'text-slate-400'
                }`}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
        
        {/* ================================== STEP 1: EXAMS ================================== */}
        {currentStep === 'Exams' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Exam Settings & Class Config</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Copy from Session:</span>
                <select 
                  value={session} 
                  onChange={e => setSession(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border rounded text-xs outline-none font-semibold text-slate-600"
                >
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Group Name <span className="text-red-500">*</span></label>
                <select 
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                >
                  {availableGroups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Exam Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="Enter Name"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                  required
                />
              </div>
            </div>

            {/* Class Card config list */}
            <div className="space-y-4 pt-4">
              {classes.map((cls, classIdx) => (
                <div key={cls.id} className="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                  
                  {/* Remove Card button */}
                  {classes.length > 1 && (
                    <button 
                      onClick={() => handleRemoveClass(cls.id)}
                      className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
                      title="Remove Class Card"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Select Class <span className="text-red-500">*</span></label>
                      <select 
                        value={cls.className}
                        onChange={e => handleClassChange(cls.id, e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold text-slate-600"
                        required
                      >
                        <option value="">Select Class</option>
                        <option value="Class II">Class II</option>
                        <option value="Class III">Class III</option>
                        <option value="Class V">Class V</option>
                        <option value="Class VIII">Class VIII</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject configurator row inside this Class card */}
                  <div className="space-y-4">
                    {cls.subjects.map((sub, subIdx) => (
                      <div key={sub.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 rounded-xl relative shadow-sm">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Subject *</label>
                          <select 
                            value={sub.subjectName}
                            onChange={e => handleSubjectChange(cls.id, sub.id, 'subjectName', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                            required
                          >
                            <option value="">Select Subject</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Hindi Practical">Hindi Practical</option>
                            <option value="Science">Science</option>
                            <option value="EVS">EVS</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maximum Marks *</label>
                          <input 
                            type="text" 
                            placeholder="Enter Marks"
                            value={sub.maxMarks}
                            onChange={e => handleSubjectChange(cls.id, sub.id, 'maxMarks', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold text-center"
                          />
                        </div>

                        <div className="flex items-center gap-3 py-2.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Practical Column</span>
                          <button 
                            type="button"
                            onClick={() => handleSubjectChange(cls.id, sub.id, 'practicalColumn', !sub.practicalColumn)}
                            className={`w-11 h-6 rounded-full relative transition-colors ${
                              sub.practicalColumn ? 'bg-teal-600' : 'bg-slate-200'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                              sub.practicalColumn ? 'left-5.5' : 'left-0.5'
                            }`}></div>
                          </button>
                        </div>

                        {sub.practicalColumn && (
                          <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Practical Marks</label>
                            <input 
                              type="text" 
                              placeholder="Enter Practical Marks"
                              value={sub.practicalMarks}
                              onChange={e => handleSubjectChange(cls.id, sub.id, 'practicalMarks', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold text-center"
                            />
                          </div>
                        )}
                        
                        {/* Remove subject button */}
                        {cls.subjects.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                              setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, subjects: c.subjects.filter(s => s.id !== sub.id) } : c))
                            }}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                            title="Remove subject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <div className="flex justify-start">
                      <button 
                        type="button"
                        onClick={() => handleAddSubject(cls.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-[10px] font-bold border border-teal-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Subject row
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                type="button"
                onClick={handleAddClass}
                className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-teal-600 text-teal-600 rounded-2xl hover:bg-teal-50/50 transition-colors text-xs font-bold"
              >
                <Plus className="w-4 h-4" /> Add Class
              </button>
            </div>

            {/* Exam dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Date of Exam <span className="text-red-500">*</span></label>
                <input 
                  type="date"
                  value={dateOfExam}
                  onChange={e => setDateOfExam(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 text-slate-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Admit Card Generated Date <span className="text-red-500">*</span></label>
                <input 
                  type="date"
                  value={admitCardDate}
                  onChange={e => setAdmitCardDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 text-slate-500"
                  required
                />
              </div>
            </div>

            {/* Exam Lock Settings */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Lock exam modifications?</h3>
                  <p className="text-[10px] text-slate-400">Lock the exam from updating marks after a certain date.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setLockExam(!lockExam)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    lockExam ? 'bg-teal-600' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                    lockExam ? 'left-5.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>

              {lockExam && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Last date to enter marks <span className="text-red-500">*</span></label>
                    <input 
                      type="date"
                      value={lastDateToEnter}
                      onChange={e => setLastDateToEnter(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 text-slate-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Select Class <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      placeholder="e.g. Select Multiple Classes"
                      value={lockClasses}
                      onChange={e => setLockClasses(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================== STEP 2: MARKS & GRADE RANGE ================================== */}
        {currentStep === 'Marks & Grade Range' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-4">
              Configure Grading Ranges & Remarks
            </h2>

            {/* Panel 1: Percentage Remarks Range */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'percent' ? null : 'percent')}
                className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 text-left text-xs font-black text-[#1b3a60] uppercase tracking-wide"
              >
                <span>Percentage Remarks Range *</span>
                {expandedSection === 'percent' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSection === 'percent' && (
                <div className="p-6 space-y-4 animate-in slide-in-from-top-1 duration-200 bg-white">
                  <div className="grid grid-cols-2 gap-4 font-bold text-xs text-slate-500 mb-2 border-b border-slate-100 pb-2">
                    <span>Range (e.g. 85-100)</span>
                    <span>Remarks (e.g. Excellent)</span>
                  </div>
                  {percentRanges.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        value={item.range} 
                        onChange={e => {
                          const updated = [...percentRanges]
                          updated[idx].range = e.target.value
                          setPercentRanges(updated)
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                      />
                      <input 
                        type="text" 
                        value={item.remark} 
                        onChange={e => {
                          const updated = [...percentRanges]
                          updated[idx].remark = e.target.value
                          setPercentRanges(updated)
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel 2: Subject Grade Range */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'grade' ? null : 'grade')}
                className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 text-left text-xs font-black text-[#1b3a60] uppercase tracking-wide"
              >
                <span>Subject Grade Range *</span>
                {expandedSection === 'grade' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSection === 'grade' && (
                <div className="p-6 space-y-4 animate-in slide-in-from-top-1 duration-200 bg-white">
                  <div className="grid grid-cols-2 gap-4 font-bold text-xs text-slate-500 mb-2 border-b border-slate-100 pb-2">
                    <span>Range (e.g. 91-100)</span>
                    <span>Grade (e.g. A+)</span>
                  </div>
                  {gradeRanges.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        value={item.range} 
                        onChange={e => {
                          const updated = [...gradeRanges]
                          updated[idx].range = e.target.value
                          setGradeRanges(updated)
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                      />
                      <input 
                        type="text" 
                        value={item.grade} 
                        onChange={e => {
                          const updated = [...gradeRanges]
                          updated[idx].grade = e.target.value
                          setGradeRanges(updated)
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel 3: Division Remarks Range */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'division' ? null : 'division')}
                className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 text-left text-xs font-black text-[#1b3a60] uppercase tracking-wide"
              >
                <span>Division Remarks Range *</span>
                {expandedSection === 'division' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSection === 'division' && (
                <div className="p-6 space-y-4 animate-in slide-in-from-top-1 duration-200 bg-white">
                  <div className="grid grid-cols-2 gap-4 font-bold text-xs text-slate-500 mb-2 border-b border-slate-100 pb-2">
                    <span>Range (e.g. 75-100)</span>
                    <span>Division (e.g. 1st)</span>
                  </div>
                  {divisionRanges.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        value={item.range} 
                        onChange={e => {
                          const updated = [...divisionRanges]
                          updated[idx].range = e.target.value
                          setDivisionRanges(updated)
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                      />
                      <input 
                        type="text" 
                        value={item.div} 
                        onChange={e => {
                          const updated = [...divisionRanges]
                          updated[idx].div = e.target.value
                          setDivisionRanges(updated)
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================== STEP 3: MARKSHEET DESIGN SETUP ================================== */}
        {currentStep === 'Marksheet Design Setup' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-4">
              Configure Marksheet Layouts & Details
            </h2>

            {/* Sub-section: Pass/Fail criteria */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 font-semibold">Min Passing Percentage (W/T) *</label>
                <input 
                  type="text"
                  value={minPassingPct}
                  onChange={e => setMinPassingPct(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 font-semibold">Min passing marks in each subject (W/T) *</label>
                <input 
                  type="text"
                  value={minPassingMarks}
                  onChange={e => setMinPassingMarks(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 font-semibold">Select grade to show in marksheet *</label>
                <select 
                  value={gradeToDisplay}
                  onChange={e => setGradeToDisplay(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none focus:border-teal-500 text-slate-600 font-semibold"
                >
                  <option value="All">All Grades</option>
                  <option value="Scholastic">Scholastic Only</option>
                  <option value="CoScholastic">Co-Scholastic Only</option>
                </select>
              </div>
            </div>

            {/* Sub-section: Headings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 font-semibold">First Term Heading</label>
                <input 
                  type="text"
                  value={heading1}
                  onChange={e => setHeading1(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 font-semibold">Second Term Heading</label>
                <input 
                  type="text"
                  value={heading2}
                  onChange={e => setHeading2(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 font-semibold">Header Main Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Term Evaluation Report"
                  value={headingHeader}
                  onChange={e => setHeadingHeader(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold"
                />
              </div>
            </div>

            {/* Layout parameters */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-wider">Image / Brand Dimensions</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Header Logo Width (px)</label>
                  <input type="text" value={logoWidth} onChange={e => setLogoWidth(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none font-mono text-center" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Header Affiliate word (px)</label>
                  <input type="text" value={affWordWidth} onChange={e => setAffWordWidth(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none font-mono text-center" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Student Photo Width (px)</label>
                  <input type="text" value={photoWidth} onChange={e => setPhotoWidth(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none font-mono text-center" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Student Photo Height (px)</label>
                  <input type="text" value={photoHeight} onChange={e => setPhotoHeight(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none font-mono text-center" />
                </div>
              </div>

              {/* Toggles grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">Show student profile photo</span>
                  <button type="button" onClick={() => setShowStudentPhoto(!showStudentPhoto)} className={`w-9 h-5 rounded-full relative transition-colors ${showStudentPhoto ? 'bg-teal-600' : 'bg-slate-200'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showStudentPhoto ? 'left-4.5' : 'left-0.5'}`}></div></button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">Show test marks also</span>
                  <button type="button" onClick={() => setShowTestMarks(!showTestMarks)} className={`w-9 h-5 rounded-full relative transition-colors ${showTestMarks ? 'bg-teal-600' : 'bg-slate-200'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showTestMarks ? 'left-4.5' : 'left-0.5'}`}></div></button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">Header Signature visibility</span>
                  <button type="button" onClick={() => setShowHeaderSign(!showHeaderSign)} className={`w-9 h-5 rounded-full relative transition-colors ${showHeaderSign ? 'bg-teal-600' : 'bg-slate-200'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showHeaderSign ? 'left-4.5' : 'left-0.5'}`}></div></button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">Header Stamp visibility</span>
                  <button type="button" onClick={() => setShowHeaderStamp(!showHeaderStamp)} className={`w-9 h-5 rounded-full relative transition-colors ${showHeaderStamp ? 'bg-teal-600' : 'bg-slate-200'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showHeaderStamp ? 'left-4.5' : 'left-0.5'}`}></div></button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">Show parent mobile number</span>
                  <button type="button" onClick={() => setShowParentMobile(!showParentMobile)} className={`w-9 h-5 rounded-full relative transition-colors ${showParentMobile ? 'bg-teal-600' : 'bg-slate-200'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showParentMobile ? 'left-4.5' : 'left-0.5'}`}></div></button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">Show round photo border</span>
                  <button type="button" onClick={() => setShowRoundBorderPhoto(!showRoundBorderPhoto)} className={`w-9 h-5 rounded-full relative transition-colors ${showRoundBorderPhoto ? 'bg-teal-600' : 'bg-slate-200'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showRoundBorderPhoto ? 'left-4.5' : 'left-0.5'}`}></div></button>
                </div>
              </div>
            </div>

            {/* Templates Selector */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Marksheet Template Design</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div 
                  onClick={() => setSelectedTemplate('Purple Classic')}
                  className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-center gap-3 transition-all ${
                    selectedTemplate === 'Purple Classic' ? 'border-teal-600 bg-teal-50/30 ring-2 ring-teal-500/10' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-12 h-12 text-[#4c2472]" />
                  <span className="text-xs font-black text-slate-800">Purple Classic (Portrait)</span>
                </div>

                <div 
                  onClick={() => setSelectedTemplate('Scholastic Term Split')}
                  className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-center gap-3 transition-all ${
                    selectedTemplate === 'Scholastic Term Split' ? 'border-teal-600 bg-teal-50/30 ring-2 ring-teal-500/10' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <LayoutTemplate className="w-12 h-12 text-[#660033]" />
                  <span className="text-xs font-black text-slate-800">Scholastic Term Split (Maroon)</span>
                </div>

                <div 
                  onClick={() => setSelectedTemplate('Skills Aspect Grid')}
                  className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-center gap-3 transition-all ${
                    selectedTemplate === 'Skills Aspect Grid' ? 'border-teal-600 bg-teal-50/30 ring-2 ring-teal-500/10' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Award className="w-12 h-12 text-[#1b3a60]" />
                  <span className="text-xs font-black text-slate-800">Skills Aspect Grid (Indigo)</span>
                </div>
              </div>
            </div>

            {/* Columns Checkbox Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Display Fields on Marksheet</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl text-xs text-slate-700 dark:text-slate-300">
                {Object.entries(columnsList).map(([key, enabled]) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer capitalize">
                    <input 
                      type="checkbox"
                      checked={enabled}
                      onChange={() => setColumnsList(prev => ({ ...prev, [key]: !enabled }))}
                      className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                    />
                    <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Detailed Accordions */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setActiveAccordion(activeAccordion === 'schoolDetails' ? null : 'schoolDetails')}
                className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 text-left text-xs font-black text-[#1b3a60] uppercase tracking-wide"
              >
                <span>School Details Config</span>
                {activeAccordion === 'schoolDetails' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeAccordion === 'schoolDetails' && (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-white animate-in slide-in-from-top-1 duration-200">
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">School Name</label><input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Affiliated To</label><input type="text" value={affiliateTo} onChange={e => setAffiliateTo(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Address</label><input type="text" value={schoolAddress} onChange={e => setSchoolAddress(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">School Code</label><input type="text" value={schoolCode} onChange={e => setSchoolCode(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Phone No</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none" /></div>
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Email ID</label><input type="text" value={email} onChange={e => setEmail(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none" /></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================== STEP 4: CERTIFICATE DESIGN ================================== */}
        {currentStep === 'Certificate Design' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-4">
              Configure Certificate Layout Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => setCertTemplate('Certificate Design 1')}
                className={`cursor-pointer rounded-3xl border-2 p-6 flex flex-col gap-4 transition-all ${
                  certTemplate === 'Certificate Design 1' ? 'border-teal-600 bg-teal-50/20 shadow-md' : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="w-full h-44 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <Award className="w-16 h-16 text-blue-650" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Minimal Plain Blue</h3>
                  <p className="text-xs text-slate-400">Clean thin border outline with centered seal, matching Screenshot 1 layout.</p>
                </div>
              </div>

              <div 
                onClick={() => setCertTemplate('Certificate Design 2')}
                className={`cursor-pointer rounded-3xl border-2 p-6 flex flex-col gap-4 transition-all ${
                  certTemplate === 'Certificate Design 2' ? 'border-teal-600 bg-teal-50/20 shadow-md' : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="w-full h-44 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <Award className="w-16 h-16 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Navy/Gold Corners</h3>
                  <p className="text-xs text-slate-400">Professional corner accents with wreath seal placement, matching Screenshot 2.</p>
                </div>
              </div>

              <div 
                onClick={() => setCertTemplate('Certificate Design 3')}
                className={`cursor-pointer rounded-3xl border-2 p-6 flex flex-col gap-4 transition-all ${
                  certTemplate === 'Certificate Design 3' ? 'border-teal-600 bg-teal-50/20 shadow-md' : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="w-full h-44 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <Award className="w-16 h-16 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Ornate Golden Frame</h3>
                  <p className="text-xs text-slate-400">Luxurious golden floral patterns with script typography details, matching Screenshot 3.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <Link 
          href="/institute/exam-marksheet/setup"
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </Link>
        
        <div className="flex items-center gap-3">
          {currentStep !== 'Exams' && (
            <button 
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg text-xs font-bold hover:bg-teal-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          {currentStep !== 'Certificate Design' ? (
            <button 
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm"
            >
              Save & Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSaveSetup}
              className="flex items-center gap-1.5 px-6 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm"
            >
              Save Configuration <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Save, Check, CheckCircle2, Award, Eye, FileText, LayoutTemplate, ShieldAlert, Sparkles, Printer, RefreshCw, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { saveMultipleMarksheetSetups, fetchExamGroups, saveExamGroup } from '../actions'
import { MarksheetPreview } from '@/components/marksheets/MarksheetPreview'
import { getInstituteAddedClasses, MasterClassWithSections } from '@/lib/institute-classes'
import { generateAdmitCardAndTimetableForSetup } from '@/lib/admit-card-sync'

// Step Definitions
type StepType = 'Exams' | 'Marks & Grade Range' | 'Marksheet Design Setup' | 'Certificate Design'
const STEPS: StepType[] = ['Exams', 'Marks & Grade Range', 'Marksheet Design Setup', 'Certificate Design']

// Admit Card field keys
const ADMIT_DISPLAY_FIELDS_KEYS = [
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

interface SubjectConfig {
  id: number
  subjectName: string
  examDate?: string
  maxMarks: string
  practicalColumn: boolean
  practicalMarks: string
}

interface ClassConfig {
  id: number
  className: string
  sections: string[]
  subjects: SubjectConfig[]
}

export default function AddSetupWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<StepType>('Exams')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ==================== STEP 1: EXAMS STATE ====================
  const [groupName, setGroupName] = useState('Exam')
  const [availableGroups, setAvailableGroups] = useState<string[]>(['Exam', 'Theory Exam', 'Practical Exam'])
  
  // Master added classes & sections state
  const [masterClasses, setMasterClasses] = useState<MasterClassWithSections[]>([])
  const [availableMasterSubjects, setAvailableMasterSubjects] = useState<string[]>([
    'Mathematics', 'English', 'Hindi', 'Science', 'Social Science', 
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'General Knowledge', 'EVS'
  ])

  // Create Group Popup State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [isSavingGroup, setIsSavingGroup] = useState(false)

  useEffect(() => {
    loadGroups()
    const addedClasses = getInstituteAddedClasses()
    setMasterClasses(addedClasses)
    if (addedClasses.length > 0) {
      setClasses(prev => prev.map((c, i) => i === 0 && !c.className ? {
        ...c,
        className: addedClasses[0].className,
        sections: [...addedClasses[0].sections]
      } : c))
    }

    try {
      const savedSubs = localStorage.getItem('school_masters_subjects')
      if (savedSubs) {
        const parsed = JSON.parse(savedSubs)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const names = parsed.filter((s: any) => !s.deleted && s.subjectName).map((s: any) => s.subjectName.trim())
          if (names.length > 0) {
            setAvailableMasterSubjects(Array.from(new Set([...names, 'Mathematics', 'English', 'Hindi', 'Science', 'Social Science'])))
          }
        }
      }
    } catch (e) {}
  }, [])

  const loadGroups = async () => {
    try {
      const res = await fetchExamGroups()
      if (res.success && res.data && res.data.length > 0) {
        const names = res.data.map((g: any) => g.groupName)
        setAvailableGroups(names)
        if (!names.includes(groupName)) {
          setGroupName(names[0])
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name')
      return
    }

    setIsSavingGroup(true)
    try {
      const res = await saveExamGroup(newGroupName, newGroupDesc)
      if (res.success && res.data) {
        toast.success(`Exam group "${newGroupName.trim()}" created successfully!`)
        const createdName = res.data.groupName
        setAvailableGroups(prev => Array.from(new Set([...prev, createdName])))
        setGroupName(createdName)
        setNewGroupName('')
        setNewGroupDesc('')
        setIsGroupModalOpen(false)
      } else {
        toast.error(res.error || 'Failed to create group')
      }
    } catch (err: any) {
      toast.error('Error creating group: ' + err.message)
    } finally {
      setIsSavingGroup(false)
    }
  }

  const [examName, setExamName] = useState('')
  const [session, setSession] = useState('2025-2026')
  const [dateOfExam, setDateOfExam] = useState('')
  const [admitCardDate, setAdmitCardDate] = useState('')
  const [lockExam, setLockExam] = useState(true)
  const [lastDateToEnter, setLastDateToEnter] = useState('')
  const [lockClasses, setLockClasses] = useState('')

  // ==================== ADMIT CARD SETTINGS STATE ====================
  const [admitDisplayFields, setAdmitDisplayFields] = useState<{ [key: string]: boolean }>({
    name: true, fatherName: true, motherName: true, mobileNo: false,
    admissionNo: true, registrationNo: true, rollNo: true, enrollmentNo: false,
    dob: true, address: true, class: true, section: true, photo: true,
    studentSign: true, teacherSign: true, principalSign: true, parentSign: true,
    schoolStamp: false
  })
  const [admitCardStatus, setAdmitCardStatus] = useState(true)
  const [showExamTimeTableOnAdmit, setShowExamTimeTableOnAdmit] = useState(true)
  const [admitInstructions, setAdmitInstructions] = useState('')
  const [admitLabel, setAdmitLabel] = useState('Admit Card')
  const [admitNoOfPrintPerPage, setAdmitNoOfPrintPerPage] = useState('1')
  const [admitHeaderNameFontSize, setAdmitHeaderNameFontSize] = useState('30')
  const [admitHeaderDetailsFontSize, setAdmitHeaderDetailsFontSize] = useState('30')
  const [admitStudentDetailsFontSize, setAdmitStudentDetailsFontSize] = useState('14')
  const [admitTimetableDetailsFontSize, setAdmitTimetableDetailsFontSize] = useState('14')
  const [admitHeadingFontSize, setAdmitHeadingFontSize] = useState('18')
  const [admitDefaultFontSize, setAdmitDefaultFontSize] = useState('18')
  const [admitSpacing, setAdmitSpacing] = useState('20')
  const [admitStudentPhotoSize, setAdmitStudentPhotoSize] = useState('100')
  const [admitTeacherSignLabel, setAdmitTeacherSignLabel] = useState("Class Teacher's Sign.")
  const [admitStudentSignLabel, setAdmitStudentSignLabel] = useState("Student's Sign.")
  const [admitParentSignLabel, setAdmitParentSignLabel] = useState("Parent's Sign.")
  const [admitPrincipalSignLabel, setAdmitPrincipalSignLabel] = useState("Principal's Sign.")
  const [admitSignatureWidth, setAdmitSignatureWidth] = useState('30')
  const [admitSchoolStampWidth, setAdmitSchoolStampWidth] = useState('30')

  const handleAdmitCheckboxChange = (key: string) => {
    setAdmitDisplayFields(prev => ({ ...prev, [key]: !prev[key] }))
  }
  const handleAdmitSelectAllChange = (checked: boolean) => {
    const updated: { [key: string]: boolean } = {}
    ADMIT_DISPLAY_FIELDS_KEYS.forEach(f => { updated[f.key] = checked })
    setAdmitDisplayFields(updated)
  }
  const isAdmitAllSelected = ADMIT_DISPLAY_FIELDS_KEYS.every(f => admitDisplayFields[f.key])

  const [classes, setClasses] = useState<ClassConfig[]>([
    {
      id: 1,
      className: '',
      sections: [],
      subjects: [{ id: 1, subjectName: '', examDate: '', maxMarks: '100', practicalColumn: false, practicalMarks: '' }]
    }
  ])

  // Class / Subject Handlers
  const handleAddClass = () => {
    const firstCls = masterClasses[0]?.className || ''
    const firstSecs = masterClasses[0]?.sections || ['Section A']
    setClasses(prev => [
      ...prev,
      {
        id: Date.now(),
        className: firstCls,
        sections: [...firstSecs],
        subjects: [{ id: Date.now() + 1, subjectName: '', examDate: '', maxMarks: '100', practicalColumn: false, practicalMarks: '' }]
      }
    ])
  }

  const handleRemoveClass = (classId: number) => {
    if (classes.length === 1) return
    setClasses(prev => prev.filter(c => c.id !== classId))
  }

  const handleClassChange = (classId: number, name: string) => {
    const found = masterClasses.find(m => m.className === name)
    const defaultSecs = found ? found.sections : ['Section A']
    setClasses(prev => prev.map(c => c.id === classId ? {
      ...c,
      className: name,
      sections: [...defaultSecs]
    } : c))
  }

  const handleToggleSection = (classId: number, sec: string) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const exists = c.sections.includes(sec)
        const updated = exists ? c.sections.filter(s => s !== sec) : [...c.sections, sec]
        return { ...c, sections: updated }
      }
      return c
    }))
  }

  const handleSelectAllSections = (classId: number, allSecs: string[]) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const isAll = c.sections.length === allSecs.length
        return { ...c, sections: isAll ? [] : [...allSecs] }
      }
      return c
    }))
  }

  const handleAddSubject = (classId: number) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          subjects: [
            ...c.subjects,
            { id: Date.now(), subjectName: '', examDate: '', maxMarks: '100', practicalColumn: false, practicalMarks: '' }
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
      toast.error('Please fill in the Exam Name.')
      return false
    }
    for (const c of classes) {
      if (!c.className) {
        toast.error('Please select an added Class for all class cards.')
        return false
      }
      if (!c.sections || c.sections.length === 0) {
        toast.error(`Please select at least one Section for ${c.className}.`)
        return false
      }
      for (const s of c.subjects) {
        if (!s.subjectName) {
          toast.error(`Please configure the Subject Name for ${c.className}.`)
          return false
        }
      }
    }
    if (!dateOfExam || !admitCardDate) {
      toast.error('Please enter both Exam Date and Admit Card Generated Date.')
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

  const handleSaveSetup = async () => {
    if (!examName) {
      toast.error('Please enter the Exam Name in Step 1.')
      setCurrentStep('Exams')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = classes.map((c) => ({
        groupName: groupName || 'Exam',
        examName: examName,
        classGrade: c.sections.length > 0 
          ? `${c.className} (${c.sections.map(s => s.replace('Section ', 'Sec ')).join(', ')})`
          : c.className,
        marksGrade: 'Percentage',
        templateName: selectedTemplate,
        session: session,
        examDate: dateOfExam || undefined,
        admitCardDate: admitCardDate || undefined,
        lockExam: lockExam,
        lastDateToEnter: lastDateToEnter || undefined,
        config: {
          className: c.className,
          sections: c.sections,
          subjects: c.subjects,
          percentRanges,
          gradeRanges,
          divisionRanges,
          minPassingPct,
          minPassingMarks,
          gradeToDisplay,
          heading1,
          heading2,
          headingHeader,
          showTestMarks,
          logoWidth,
          affWordWidth,
          photoWidth,
          photoHeight,
          logoPos,
          showHeaderSign,
          showHeaderStamp,
          showStudentPhoto,
          showBlankSpace,
          showParentMobile,
          showRoundBorderPhoto,
          columnsList,
          schoolDetails: {
            schoolName,
            affiliateTo,
            schoolAddress,
            schoolCode,
            phone,
            email,
            principalName,
            academicYear
          },
          certTemplate,
          lockClasses
        }
      }))

      const res = await saveMultipleMarksheetSetups(payload)
      if (res.success) {
        // Simultaneously generate Admit Cards and Exam TimeTables for all classes
        payload.forEach(item => {
          try {
            generateAdmitCardAndTimetableForSetup(item)
          } catch (e) {
            console.error('Error generating simultaneous admit card:', e)
          }
        })

        toast.success(`${classes.length} marksheet setup(s) & admit card(s) created simultaneously!`)
        router.push('/institute/exam-marksheet/setup')
      } else {
        toast.error(res.error || 'Failed to save to PostgreSQL database')
      }
    } catch (err: any) {
      toast.error('Error saving setup: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-300">
      
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Add Marksheet Setup</h1>
          <p className="text-xs text-slate-400">Configure exams, ranges, layouts, and designs in 4 steps</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Eye className="w-4 h-4" /> Live Marksheet Preview
          </button>
          
          <button 
            type="button"
            onClick={() => setIsGroupModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            + Create Group
          </button>

          <button 
            onClick={handleSaveSetup}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving to DB...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Setup
              </>
            )}
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Group Name <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={() => setIsGroupModalOpen(true)}
                    className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> New Group
                  </button>
                </div>
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

                  {/* Class & Multi-Select Section Selector */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                    
                    {/* 1. Only Added Classes Dropdown */}
                    <div className="flex flex-col gap-1.5 lg:col-span-5">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                        Select Added Class <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={cls.className}
                        onChange={e => handleClassChange(cls.id, e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-bold text-slate-800 dark:text-slate-100 shadow-xs"
                        required
                      >
                        <option value="">-- Choose Added Class --</option>
                        {masterClasses.map(m => (
                          <option key={m.className} value={m.className}>
                            {m.className} ({m.sections.length} Sections)
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400">
                        Only classes added in Institute Masters
                      </p>
                    </div>

                    {/* 2. Multi-Select Sections of Selected Class */}
                    <div className="flex flex-col gap-1.5 lg:col-span-7">
                      {(() => {
                        const currentClassObj = masterClasses.find(m => m.className === cls.className)
                        const availableSecs = currentClassObj?.sections || ['Section A', 'Section B', 'Section C']
                        const allSelected = cls.sections.length === availableSecs.length && availableSecs.length > 0

                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <span>Applicable Sections (Multi-Select)</span>
                                <span className="text-red-500">*</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                  {cls.sections.length} Selected
                                </span>
                              </label>

                              <button
                                type="button"
                                onClick={() => handleSelectAllSections(cls.id, availableSecs)}
                                className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                              >
                                {allSelected ? 'Deselect All' : 'Select All Sections'}
                              </button>
                            </div>

                            {/* Section Multi-Select Badges */}
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {availableSecs.map(sec => {
                                const isChecked = cls.sections.includes(sec)
                                return (
                                  <button
                                    key={sec}
                                    type="button"
                                    onClick={() => handleToggleSection(cls.id, sec)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-xs ${
                                      isChecked 
                                        ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-500/20' 
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:bg-slate-50'
                                    }`}
                                  >
                                    <Check className={`w-3.5 h-3.5 stroke-[3] transition-all ${isChecked ? 'opacity-100' : 'opacity-20'}`} />
                                    <span>{sec}</span>
                                  </button>
                                )
                              })}
                            </div>

                            {cls.sections.length === 0 && (
                              <span className="text-[10px] font-semibold text-red-500 mt-0.5">
                                Please select at least one section for this class
                              </span>
                            )}
                          </>
                        )
                      })()}
                    </div>

                  </div>

                  {/* Subject configurator row inside this Class card */}
                  <div className="space-y-4">
                    {cls.subjects.map((sub, subIdx) => (
                      <div key={sub.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 rounded-xl relative shadow-xs">
                        
                        {/* 1. Select Subject */}
                        <div className="flex flex-col gap-1.5 lg:col-span-4">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Subject *</label>
                          <select 
                            value={sub.subjectName}
                            onChange={e => handleSubjectChange(cls.id, sub.id, 'subjectName', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold bg-white dark:bg-slate-900"
                            required
                          >
                            <option value="">Select Subject</option>
                            {availableMasterSubjects.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Exam Date for this Subject */}
                        <div className="flex flex-col gap-1.5 lg:col-span-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject Exam Date</label>
                          <input 
                            type="date"
                            value={sub.examDate || ''}
                            onChange={e => handleSubjectChange(cls.id, sub.id, 'examDate', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900"
                          />
                        </div>

                        {/* 3. Maximum Marks */}
                        <div className="flex flex-col gap-1.5 lg:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Marks *</label>
                          <input 
                            type="text" 
                            placeholder="100"
                            value={sub.maxMarks}
                            onChange={e => handleSubjectChange(cls.id, sub.id, 'maxMarks', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold text-center bg-white dark:bg-slate-900"
                          />
                        </div>

                        {/* 4. Practical Column Toggle & Marks */}
                        <div className="flex items-center gap-2.5 py-1.5 lg:col-span-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Practical</span>
                            <button 
                              type="button"
                              onClick={() => handleSubjectChange(cls.id, sub.id, 'practicalColumn', !sub.practicalColumn)}
                              className={`w-10 h-5 rounded-full relative transition-colors ${
                                sub.practicalColumn ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                                sub.practicalColumn ? 'left-5.5' : 'left-0.5'
                              }`}></div>
                            </button>
                          </div>

                          {sub.practicalColumn && (
                            <input 
                              type="text" 
                              placeholder="Pr. Marks"
                              value={sub.practicalMarks}
                              onChange={e => handleSubjectChange(cls.id, sub.id, 'practicalMarks', e.target.value)}
                              className="w-20 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold text-center bg-white dark:bg-slate-900 animate-in fade-in"
                            />
                          )}
                        </div>
                        
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
            
            {/* Exam Notification & Locking System (Default Open - No Toggle) */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Exam Notification & Locking System
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configure official schedule release dates, admit card availability, and mark entry lock deadlines
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Exam Notification Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Exam Notification Date <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date"
                    value={dateOfExam}
                    onChange={e => setDateOfExam(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Date exam notice is published</span>
                </div>

                {/* 2. Admit Card Generated Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Admit Card Generated Date <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date"
                    value={admitCardDate}
                    onChange={e => setAdmitCardDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Date hall tickets are available</span>
                </div>

                {/* 3. Last Date to Enter Marks */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Last Date to Enter Marks <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    value={lastDateToEnter}
                    onChange={e => setLastDateToEnter(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
                  />
                  <span className="text-[10px] text-slate-400">Lock entry deadline</span>
                </div>

                {/* 4. Lock Modifications for Class */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Lock Applicable Class <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={lockClasses}
                    onChange={e => setLockClasses(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
                  >
                    <option value="">All Applicable Classes</option>
                    {masterClasses.map(m => (
                      <option key={m.className} value={m.className}>{m.className}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400">Target class for lock policy</span>
                </div>
              </div>
            </div>

            {/* ================================== ADMIT CARD SETTINGS ================================== */}
            <div className="bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 rounded-2xl p-6 space-y-5 mt-2">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span>
                    Admit Card Settings
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configure fields, layout, and printing options for the auto-generated admit card
                  </p>
                </div>
              </div>

              {/* Admit Card Label */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Admit Card Label</label>
                  <input
                    type="text"
                    value={admitLabel}
                    onChange={e => setAdmitLabel(e.target.value)}
                    placeholder="Admit Card"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
                  />
                  <span className="text-[10px] text-slate-400">Title printed on the admit card</span>
                </div>
              </div>

              {/* Display Fields Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">Select Fields to Display on Student Admit Card</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={isAdmitAllSelected}
                      onChange={e => handleAdmitSelectAllChange(e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                    />
                    <span>Select All</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {ADMIT_DISPLAY_FIELDS_KEYS.map(f => (
                    <label key={f.key} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!admitDisplayFields[f.key]}
                        onChange={() => handleAdmitCheckboxChange(f.key)}
                        className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Admit Card Status</span>
                    <span className="text-[10px] text-slate-400">If activated, students can download through App.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdmitCardStatus(!admitCardStatus)}
                    className={`w-10 h-5.5 rounded-full relative transition-colors ${admitCardStatus ? 'bg-teal-600' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${admitCardStatus ? 'left-5' : 'left-0.5'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-700">
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Exam Time Table</span>
                    <span className="text-[10px] text-slate-400">Do you want to show exam time table on admit card?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExamTimeTableOnAdmit(!showExamTimeTableOnAdmit)}
                    className={`w-10 h-5.5 rounded-full relative transition-colors ${showExamTimeTableOnAdmit ? 'bg-teal-600' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showExamTimeTableOnAdmit ? 'left-5' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Instruction</label>
                <textarea
                  placeholder="Write instructions..."
                  value={admitInstructions}
                  onChange={e => setAdmitInstructions(e.target.value)}
                  className="w-full min-h-[70px] p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold bg-white dark:bg-slate-800"
                />
              </div>

              {/* Font Sizes & Print Settings */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { label: 'No. of Print Per Page', val: admitNoOfPrintPerPage, set: setAdmitNoOfPrintPerPage },
                  { label: 'Header Name Font Size (px)', val: admitHeaderNameFontSize, set: setAdmitHeaderNameFontSize },
                  { label: 'Header Details Font Size (px)', val: admitHeaderDetailsFontSize, set: setAdmitHeaderDetailsFontSize },
                  { label: 'Student Details Font Size (px)', val: admitStudentDetailsFontSize, set: setAdmitStudentDetailsFontSize },
                  { label: 'Timetable Details Font Size (px)', val: admitTimetableDetailsFontSize, set: setAdmitTimetableDetailsFontSize },
                  { label: 'Heading Font Size (px)', val: admitHeadingFontSize, set: setAdmitHeadingFontSize },
                  { label: 'Default Font Size (px)', val: admitDefaultFontSize, set: setAdmitDefaultFontSize },
                  { label: 'Spacing (px)', val: admitSpacing, set: setAdmitSpacing },
                  { label: 'Student Photo Size (px)', val: admitStudentPhotoSize, set: setAdmitStudentPhotoSize },
                ].map(({ label, val, set }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</label>
                    <input type="text" value={val} onChange={e => set(e.target.value)} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none text-center bg-white dark:bg-slate-800 font-semibold" />
                  </div>
                ))}
              </div>

              {/* Sign Labels */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Teacher Sign Label', val: admitTeacherSignLabel, set: setAdmitTeacherSignLabel },
                  { label: 'Student Sign Label', val: admitStudentSignLabel, set: setAdmitStudentSignLabel },
                  { label: 'Parent Sign Label', val: admitParentSignLabel, set: setAdmitParentSignLabel },
                  { label: 'Principal Sign Label', val: admitPrincipalSignLabel, set: setAdmitPrincipalSignLabel },
                  { label: 'Signature Width (px)', val: admitSignatureWidth, set: setAdmitSignatureWidth },
                  { label: 'School Stamp Width (px)', val: admitSchoolStampWidth, set: setAdmitSchoolStampWidth },
                ].map(({ label, val, set }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</label>
                    <input type="text" value={val} onChange={e => set(e.target.value)} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200" />
                  </div>
                ))}
              </div>
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

              {/* Live Preview Banner in Step 3 */}
              <div className="bg-gradient-to-r from-purple-50 via-teal-50 to-emerald-50 dark:from-purple-950/30 dark:to-emerald-950/30 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                      Live Marksheet Preview • {selectedTemplate}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Inspect your marksheet layout, subjects, and grading scale in real time before finalizing.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all shrink-0"
                >
                  <Eye className="w-4 h-4" />
                  Show Full Marksheet Preview
                </button>
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

      {/* ============================================================== */}
      {/* LIVE MARKSHEET PREVIEW MODAL                                    */}
      {/* ============================================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto py-8">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                    Interactive Marksheet Preview • {selectedTemplate}
                  </h3>
                  <div className="text-[11px] text-purple-600 font-semibold">
                    {examName || 'Upcoming Examination'} • {classes[0]?.className || 'Class 10'} ({session})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Marksheet Display Container */}
            <div className="p-6 md:p-8 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-x-auto">
              <div className="w-full max-w-[820px] shadow-2xl rounded-sm">
                <MarksheetPreview
                  templateName={selectedTemplate}
                  examName={examName || 'Annual Examination 2025-26'}
                  className={classes[0]?.className || 'Class 10'}
                  academicYear={session}
                  subjects={classes[0]?.subjects}
                  percentRanges={percentRanges}
                  gradeRanges={gradeRanges}
                  divisionRanges={divisionRanges}
                  schoolName={schoolName}
                  affiliateTo={affiliateTo}
                  schoolAddress={schoolAddress}
                  schoolCode={schoolCode}
                  phone={phone}
                  email={email}
                  principalName={principalName}
                  headingHeader={headingHeader}
                  showStudentPhoto={showStudentPhoto}
                  showRoundBorderPhoto={showRoundBorderPhoto}
                  showTestMarks={showTestMarks}
                  showHeaderSign={showHeaderSign}
                  showHeaderStamp={showHeaderStamp}
                  columnsList={columnsList}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Preview updating in real time with your wizard parameters</span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE GROUP POPUP MODAL                                       */}
      {/* ============================================================== */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto py-10">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            
            {/* Header */}
            <div className="px-7 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800 dark:text-slate-100">
                    Create Exam Group
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Add new scheme to PostgreSQL and select immediately
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateGroup} className="p-7 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Group Scheme Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Unit Test Scheme, Term 1 Scheme"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="e.g. Summative assessments for secondary classes"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingGroup}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingGroup ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Create & Select
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}

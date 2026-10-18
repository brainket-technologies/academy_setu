'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Save, Check, CheckCircle2, Award, Eye, FileText, LayoutTemplate, ShieldAlert, Sparkles, Printer, RefreshCw, Layers, Clock, Calendar, School, QrCode, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { saveMultipleMarksheetSetups, saveMarksheetSetup, fetchExamGroups, saveExamGroup, fetchMarksheetSetupById, fetchCurrentInstitutionDetails } from '../actions'
import { MarksheetPreview, MarksheetMiniPreview } from '@/components/marksheets/MarksheetPreview'
import { getInstituteAddedClasses, MasterClassWithSections } from '@/lib/institute-classes'
import { generateAdmitCardAndTimetableForSetup, AdmitCardConfig } from '@/lib/admit-card-sync'
import { AdmitCardModalPreview, AdmitCardPaper, AdmitCardMiniPreview } from '@/components/admit-card/AdmitCardModalPreview'
import { 
  CertificateDesign1, 
  CertificateDesign2, 
  CertificateDesign3, 
  CertificateDesign4,
  CertificatePaper,
  CertificateMiniPreview
} from '@/components/certificates/CertificateTemplates'

// Step Definitions
type StepType = 'Exams' | 'Marks & Grade Range' | 'Admit Card Setup' | 'Marksheet Design Setup' | 'Certificate Design'
const STEPS: StepType[] = ['Exams', 'Marks & Grade Range', 'Admit Card Setup', 'Marksheet Design Setup', 'Certificate Design']

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
  { key: 'principalSign', label: 'Principal Sign.' },
  { key: 'teacherSign', label: 'Teacher Sign.' },
  { key: 'studentSign', label: 'Student Sign.' },
  { key: 'parentSign', label: 'Parent Sign.' },
  { key: 'schoolStamp', label: 'School Stamp' }
]

// Marksheet field keys for Display Fields
const MARKSHEET_DISPLAY_FIELDS_KEYS = [
  { key: 'rollNumber', label: 'Roll Number' },
  { key: 'motherName', label: 'Mother Name' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'admissionNo', label: 'Admission No.' },
  { key: 'mobileNumber', label: 'Mobile Number' },
  { key: 'classSection', label: 'Class & Section' },
  { key: 'gender', label: 'Gender' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'address', label: 'Address' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'examName', label: 'Exam Name' },
  { key: 'obtMarks', label: 'Obt Marks' },
  { key: 'totalMarks', label: 'Total Marks' },
  { key: 'percentage', label: 'Percentage' },
  { key: 'grade', label: 'Grade' },
  { key: 'rank', label: 'Class Rank' },
  { key: 'result', label: 'Result Status' },
  { key: 'remarks', label: 'Teacher Remarks' },
  { key: 'examDate', label: 'Exam Date' },
  { key: 'dateOfIssue', label: 'Date of Issue' },
]

interface SubjectConfig {
  id: number
  subjectName: string
  examDate?: string
  startTime?: string
  endTime?: string
  fromTime?: string
  toTime?: string
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

function AddSetupWizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams ? (searchParams.get('id') || searchParams.get('editId')) : null
  const [editingId, setEditingId] = useState<string | null>(null)

  // 5 Step Wizard: Exams -> Marks & Grade -> Admit Card Setup -> Marksheet Design -> Certificate Design
  const [currentStep, setCurrentStep] = useState<StepType>('Exams')
  const [selectedTemplate, setSelectedTemplate] = useState('CBSE Royal Emerald')
  const [marksheetThemeColor, setMarksheetThemeColor] = useState('#065f46')
  const [admitTemplateStyle, setAdmitTemplateStyle] = useState('Classic Board')
  const [admitThemeColor, setAdmitThemeColor] = useState('#1e3a8a')

  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showAdmitPreviewModal, setShowAdmitPreviewModal] = useState(false)
  const [showCertPreviewModal, setShowCertPreviewModal] = useState(false)
  const [showAdvancedAdmitStyles, setShowAdvancedAdmitStyles] = useState(false)
  const [previewTargetTemplate, setPreviewTargetTemplate] = useState<string | null>(null)
  const [previewTargetAdmitStyle, setPreviewTargetAdmitStyle] = useState<string | null>(null)
  const [previewTargetCertTemplate, setPreviewTargetCertTemplate] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePreviewMarksheet = (templateName: string) => {
    setPreviewTargetTemplate(templateName)
    setShowPreviewModal(true)
  }

  const handlePreviewAdmitCard = (styleName: string) => {
    setPreviewTargetAdmitStyle(styleName)
    setShowAdmitPreviewModal(true)
  }

  const handlePreviewCertificate = (templateName: string) => {
    setPreviewTargetCertTemplate(templateName)
    setShowCertPreviewModal(true)
  }

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

    // Auto-fetch institution details from database
    fetchCurrentInstitutionDetails().then(res => {
      if (res && res.success && res.data) {
        if (res.data.principalName) {
          setPrincipalName(res.data.principalName)
        }
        if (res.data.name) {
          setSchoolName(res.data.name)
        }
        if (res.data.affiliatedTo) {
          setAffiliateTo(res.data.affiliatedTo)
        }
        if (res.data.mobileNo) {
          setPhone(res.data.mobileNo)
        }
        if (res.data.emailId) {
          setEmail(res.data.emailId)
        }
        if (res.data.address && res.data.address !== 'na') {
          setSchoolAddress(res.data.address)
        }
      }
    }).catch(() => {})

    if (editId) {
      setEditingId(editId)
      loadExistingSetup(editId)
    }
  }, [editId])

  const loadExistingSetup = async (id: string) => {
    try {
      const res = await fetchMarksheetSetupById(id)
      if (res.success && res.data) {
        const s = res.data
        if (s.exam) setExamName(s.exam)
        if (s.group) setGroupName(s.group)
        if (s.session) setSession(s.session)
        if (s.examDate) setDateOfExam(s.examDate)
        if (s.admitCardDate) setAdmitCardDate(s.admitCardDate)
        if (s.templateName) setSelectedTemplate(s.templateName)
        if (s.config?.marksheetThemeColor) setMarksheetThemeColor(s.config.marksheetThemeColor)
        if (s.config?.admitTemplateStyle) setAdmitTemplateStyle(s.config.admitTemplateStyle)
        if (s.config?.admitCardSettings?.templateStyle) setAdmitTemplateStyle(s.config.admitCardSettings.templateStyle)
        if (s.config?.admitThemeColor) setAdmitThemeColor(s.config.admitThemeColor)
        if (s.config?.admitCardSettings?.themeColor) setAdmitThemeColor(s.config.admitCardSettings.themeColor)

        if (s.config?.certTemplate) setCertTemplate(s.config.certTemplate)
        if (s.config?.certThemeColor) setCertThemeColor(s.config.certThemeColor)
        if (s.lastDateToEnter) setLastDateToEnter(s.lastDateToEnter)
        if (typeof s.lockExam === 'boolean') setLockExam(s.lockExam)
        if (s.config?.admitCardSettings?.admitLabel) setAdmitLabel(s.config.admitCardSettings.admitLabel)
        if (s.config?.admitCardSettings?.instructions) setAdmitInstructions(s.config.admitCardSettings.instructions)
        if (s.config?.admitCardSettings?.displayFields) setAdmitDisplayFields(s.config.admitCardSettings.displayFields)
        if (typeof s.config?.admitCardSettings?.showExamTimeTable === 'boolean') setShowExamTimeTableOnAdmit(s.config.admitCardSettings.showExamTimeTable)
        if (s.config?.admitCardSettings?.customLabels) setAdmitCustomLabels(s.config.admitCardSettings.customLabels)
        if (s.config?.marksheetCustomLabels) setMarksheetCustomLabels(s.config.marksheetCustomLabels)
        if (s.config?.minPassingPct) setMinPassingPct(String(s.config.minPassingPct))
        if (s.config?.minPassingMarks) setMinPassingMarks(String(s.config.minPassingMarks))
        if (s.config?.gradeToDisplay) setGradeToDisplay(s.config.gradeToDisplay)
        if (s.config?.heading1) setHeading1(s.config.heading1)
        if (s.config?.heading2) setHeading2(s.config.heading2)
        if (s.config?.headingHeader) setHeadingHeader(s.config.headingHeader)
        if (s.config?.schoolDetails?.schoolName) setSchoolName(s.config.schoolDetails.schoolName)
        if (s.config?.schoolDetails?.affiliateTo) setAffiliateTo(s.config.schoolDetails.affiliateTo)
        if (s.config?.schoolDetails?.schoolAddress) setSchoolAddress(s.config.schoolDetails.schoolAddress)
        if (s.config?.schoolDetails?.principalName) setPrincipalName(s.config.schoolDetails.principalName)

        const baseClassName = s.config?.className || (s.classGrade ? s.classGrade.split('(')[0].trim() : '')
        const secs = Array.isArray(s.config?.sections) && s.config.sections.length > 0 ? s.config.sections : ['Section A']
        const subs = Array.isArray(s.config?.subjects) && s.config.subjects.length > 0
          ? s.config.subjects.map((sub: any, idx: number) => ({
              id: sub.id || (idx + 1),
              subjectName: sub.subjectName || '',
              examDate: sub.examDate || s.examDate || '',
              startTime: sub.startTime || sub.fromTime || '10:00',
              endTime: sub.endTime || sub.toTime || '13:00',
              fromTime: sub.startTime || sub.fromTime || '10:00',
              toTime: sub.endTime || sub.toTime || '13:00',
              maxMarks: sub.maxMarks ? String(sub.maxMarks) : '100',
              practicalColumn: !!sub.practicalColumn,
              practicalMarks: sub.practicalMarks ? String(sub.practicalMarks) : ''
            }))
          : [{
              id: 1,
              subjectName: '',
              examDate: s.examDate || '',
              startTime: '10:00',
              endTime: '13:00',
              fromTime: '10:00',
              toTime: '13:00',
              maxMarks: '100',
              practicalColumn: false,
              practicalMarks: ''
            }]

        setClasses([{
          id: 1,
          className: baseClassName,
          sections: secs,
          subjects: subs
        }])
      }
    } catch (e) {
      console.error('Error loading setup:', e)
    }
  }

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
  const [admitInstructions, setAdmitInstructions] = useState(
    '1. Candidates must arrive at the examination center 30 minutes before the scheduled time.\n2. Bring this original Admit Card along with Institute Student ID.\n3. Electronic devices, smartwatches, and study materials are strictly prohibited in the exam hall.\n4. Maintain discipline and follow invigilator guidelines at all times.'
  )
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
  const [admitCustomLabels, setAdmitCustomLabels] = useState<Record<string, string>>({})
  const [marksheetCustomLabels, setMarksheetCustomLabels] = useState<Record<string, string>>({})

  const handleMarksheetFieldUpdate = (field: string, value: any) => {
    if (field === 'schoolName') setSchoolName(value)
    else if (field === 'schoolAddress') setSchoolAddress(value)
    else if (field === 'schoolCode') setSchoolCode(value)
    else if (field === 'affiliateTo') setAffiliateTo(value)
    else if (field === 'examName') setExamName(value)
    else if (field === 'session' || field === 'academicYear') setSession(value)
    else if (field === 'headingHeader') setHeadingHeader(value)
    else if (field === 'principalName') setPrincipalName(value)
    else if (field === 'phone') setPhone(value)
    else if (field === 'email') setEmail(value)
    else if (field === 'customLabels') {
      setMarksheetCustomLabels(prev => ({ ...prev, ...value }))
    }
  }

  const handleAdmitCardFieldUpdate = (field: string, value: any) => {
    if (field === 'schoolName') setSchoolName(value)
    else if (field === 'schoolAddress') setSchoolAddress(value)
    else if (field === 'admitCardLabel') setAdmitLabel(value)
    else if (field === 'examName') setExamName(value)
    else if (field === 'session') setSession(value)
    else if (field === 'instructions') setAdmitInstructions(value)
    else if (field === 'principalSignLabel') setAdmitPrincipalSignLabel(value)
    else if (field === 'teacherSignLabel') setAdmitTeacherSignLabel(value)
    else if (field === 'studentSignLabel') setAdmitStudentSignLabel(value)
    else if (field === 'parentSignLabel') setAdmitParentSignLabel(value)
    else if (field === 'principalName') setPrincipalName(value)
    else if (field === 'customLabels') {
      setAdmitCustomLabels(prev => ({ ...prev, ...value }))
    }
  }

  const handleAdmitCheckboxChange = (key: string) => {
    setAdmitDisplayFields(prev => ({ ...prev, [key]: !prev[key] }))
  }
  const handleAdmitSelectAllChange = (checked: boolean) => {
    const updated: { [key: string]: boolean } = {}
    ADMIT_DISPLAY_FIELDS_KEYS.forEach(f => { updated[f.key] = checked })
    setAdmitDisplayFields(updated)
  }
  const isAdmitAllSelected = ADMIT_DISPLAY_FIELDS_KEYS.every(f => admitDisplayFields[f.key])

  // Marksheet Columns & Display Fields State
  const [columnsList, setColumnsList] = useState({
    rollNumber: true, motherName: true, fatherName: true, admissionNo: true,
    mobileNumber: false, classSection: true, gender: true, dob: true,
    address: false, examName: true, obtMarks: true, totalMarks: true,
    percentage: true, grade: true, remarks: true, rank: true,
    result: true, teacherSign: true, controllerSign: true, principalSign: true,
    attendance: true, examDate: false, dateOfIssue: true, parentSign: true
  })

  const handleMarksheetCheckboxChange = (key: string) => {
    setColumnsList(prev => ({ ...prev, [key]: !(prev as any)[key] }))
  }
  const handleMarksheetSelectAllChange = (checked: boolean) => {
    setColumnsList(prev => {
      const next: Record<string, boolean> = { ...prev }
      MARKSHEET_DISPLAY_FIELDS_KEYS.forEach(f => {
        next[f.key] = checked
      })
      return next as any
    })
  }
  const isMarksheetAllSelected = MARKSHEET_DISPLAY_FIELDS_KEYS.every(f => !!(columnsList as any)[f.key])

  const [marksheetPrincipalSignLabel, setMarksheetPrincipalSignLabel] = useState("Principal's Signature")
  const [marksheetTeacherSignLabel, setMarksheetTeacherSignLabel] = useState("Class Teacher's Signature")
  const [marksheetControllerSignLabel, setMarksheetControllerSignLabel] = useState("Exam Controller")
  const [marksheetParentSignLabel, setMarksheetParentSignLabel] = useState("Parent / Guardian Sign")
  const [marksheetSealLabel, setMarksheetSealLabel] = useState("OFFICIAL SEAL")

  const [classes, setClasses] = useState<ClassConfig[]>([
    {
      id: 1,
      className: '',
      sections: [],
      subjects: [{ 
        id: 1, 
        subjectName: '', 
        examDate: '', 
        startTime: '10:00', 
        endTime: '13:00', 
        fromTime: '10:00', 
        toTime: '13:00', 
        maxMarks: '100', 
        practicalColumn: false, 
        practicalMarks: '' 
      }]
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
        subjects: [{ 
          id: Date.now() + 1, 
          subjectName: '', 
          examDate: '', 
          startTime: '10:00', 
          endTime: '13:00', 
          fromTime: '10:00', 
          toTime: '13:00', 
          maxMarks: '100', 
          practicalColumn: false, 
          practicalMarks: '' 
        }]
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
        const lastSub = c.subjects[c.subjects.length - 1]
        const defaultStartTime = lastSub?.startTime || lastSub?.fromTime || '10:00'
        const defaultEndTime = lastSub?.endTime || lastSub?.toTime || '13:00'
        return {
          ...c,
          subjects: [
            ...c.subjects,
            { 
              id: Date.now(), 
              subjectName: '', 
              examDate: '', 
              startTime: defaultStartTime, 
              endTime: defaultEndTime, 
              fromTime: defaultStartTime, 
              toTime: defaultEndTime, 
              maxMarks: '100', 
              practicalColumn: false, 
              practicalMarks: '' 
            }
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
          subjects: c.subjects.map(s => {
            if (s.id === subId) {
              const updated = { ...s, [field]: val }
              if (field === 'startTime') updated.fromTime = val
              if (field === 'fromTime') updated.startTime = val
              if (field === 'endTime') updated.toTime = val
              if (field === 'toTime') updated.endTime = val
              return updated
            }
            return s
          })
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

  // ==================== STEP 5: CERTIFICATE STATE ====================
  const [certTemplate, setCertTemplate] = useState('Certificate Design 1')
  const [certThemeColor, setCertThemeColor] = useState('#1e3a8a')

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
      setCurrentStep('Admit Card Setup')
    } else if (currentStep === 'Admit Card Setup') {
      setCurrentStep('Marksheet Design Setup')
    } else if (currentStep === 'Marksheet Design Setup') {
      setCurrentStep('Certificate Design')
    }
  }

  const handleBack = () => {
    if (currentStep === 'Certificate Design') {
      setCurrentStep('Marksheet Design Setup')
    } else if (currentStep === 'Marksheet Design Setup') {
      setCurrentStep('Admit Card Setup')
    } else if (currentStep === 'Admit Card Setup') {
      setCurrentStep('Marks & Grade Range')
    } else if (currentStep === 'Marks & Grade Range') {
      setCurrentStep('Exams')
    }
  }

  const handleSaveSetup = async () => {
    if (!validateStep1()) {
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
          templateName: selectedTemplate,
          marksheetThemeColor: marksheetThemeColor,
          admitTemplateStyle: admitTemplateStyle,
          admitThemeColor: admitThemeColor,
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
          marksheetCustomLabels,
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
          certThemeColor,
          lockClasses,
          admitCardSettings: {
            admitLabel,
            templateStyle: admitTemplateStyle,
            themeColor: admitThemeColor,
            displayFields: admitDisplayFields,
            status: admitCardStatus,
            showExamTimeTable: showExamTimeTableOnAdmit,
            instructions: admitInstructions,
            noOfPrintPerPage: admitNoOfPrintPerPage,
            headerNameFontSize: admitHeaderNameFontSize,
            headerDetailsFontSize: admitHeaderDetailsFontSize,
            studentDetailsFontSize: admitStudentDetailsFontSize,
            timetableDetailsFontSize: admitTimetableDetailsFontSize,
            headingFontSize: admitHeadingFontSize,
            defaultFontSize: admitDefaultFontSize,
            spacing: admitSpacing,
            studentPhotoSize: admitStudentPhotoSize,
            teacherSignLabel: admitTeacherSignLabel,
            studentSignLabel: admitStudentSignLabel,
            parentSignLabel: admitParentSignLabel,
            principalSignLabel: admitPrincipalSignLabel,
            signatureWidth: admitSignatureWidth,
            schoolStampWidth: admitSchoolStampWidth,
            customLabels: admitCustomLabels
          }
        }
      }))

      if (editingId) {
        const updateRes = await saveMarksheetSetup({
          id: editingId,
          groupName: payload[0].groupName,
          examName: payload[0].examName,
          classGrade: payload[0].classGrade,
          marksGrade: payload[0].marksGrade,
          templateName: selectedTemplate,
          session: payload[0].session,
          examDate: payload[0].examDate,
          config: payload[0].config
        })
        if (updateRes.success) {
          generateAdmitCardAndTimetableForSetup({ ...payload[0], id: editingId })
          toast.success('Exam Setup & Admit Card updated successfully!')
          router.push('/institute/exam-marksheet/setup')
          return
        } else {
          toast.error(updateRes.error || 'Failed to update setup')
          return
        }
      }

      const res = await saveMultipleMarksheetSetups(payload)
      if (res.success) {
        // Simultaneously generate Admit Cards and Exam TimeTables for all classes with database setup IDs
        const savedData = Array.isArray(res.data) ? res.data : []
        payload.forEach((item, idx) => {
          try {
            const savedItem = savedData[idx]
            const realId = savedItem?.id || undefined
            generateAdmitCardAndTimetableForSetup({ ...item, id: realId })
          } catch (e) {
            console.error('Error generating simultaneous admit card:', e)
          }
        })

        toast.success(`Exam Setup & Admit Card created successfully in a single event!`)
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
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
            {editingId ? 'Edit Examination Setup (Wizard)' : 'Add Marksheet Setup'}
          </h1>
          <p className="text-xs text-slate-400">
            {editingId ? 'Update exam parameters, grading, admit cards, and marksheet layouts across all steps' : 'Configure exams, grading, admit cards, and marksheet layouts in 5 steps'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            onClick={() => setShowAdmitPreviewModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Eye className="w-4 h-4" /> Live Admit Card Preview
          </button>

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
                <RefreshCw className="w-4 h-4 animate-spin" /> {editingId ? 'Updating Setup...' : 'Saving Setup & Admit Card...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {editingId ? 'Update Setup & Admit Card' : 'Save Setup & Admit Card'}
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
              width: `${(STEPS.indexOf(currentStep) / (STEPS.length - 1)) * 100}%`
            }}
          ></div>

          {STEPS.map((step, idx) => {
            const isActive = currentStep === step
            const isCompleted = STEPS.indexOf(currentStep) > idx
            return (
              <div 
                key={step} 
                onClick={() => setCurrentStep(step)}
                className="flex flex-col items-center gap-2 relative z-10 cursor-pointer group"
                title={`Jump to step ${idx + 1}: ${step}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all group-hover:scale-105 ${
                  isActive ? 'bg-teal-600 border-teal-600 text-white shadow-md ring-2 ring-teal-500/20' :
                  isCompleted ? 'bg-teal-100 border-teal-500 text-teal-600 font-bold' :
                  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-teal-400'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${
                  isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
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
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* ==================== 1. BASIC EXAM & ACADEMIC SESSION ==================== */}
            <div className="bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                      Basic Exam & Session Information
                    </h2>
                    <p className="text-[11px] text-slate-400">Select group scheme, session year, and give the official examination title</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Session:</span>
                  <select 
                    value={session} 
                    onChange={e => setSession(e.target.value)}
                    className="bg-transparent text-xs outline-none font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Group Name <span className="text-red-500">*</span></label>
                    <button
                      type="button"
                      onClick={() => setIsGroupModalOpen(true)}
                      className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> New Group
                    </button>
                  </div>
                  <select 
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-bold text-slate-800 dark:text-slate-100 shadow-xs"
                  >
                    {availableGroups.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Exam Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g. Final Term Examination 2025-26"
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-bold text-slate-800 dark:text-slate-100 shadow-xs placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ==================== 2. CLASS, SECTIONS & SUBJECT SCHEDULE ==================== */}
            <div className="bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  2
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    Class & Subject Examination Schedule
                  </h2>
                  <p className="text-[11px] text-slate-400">Map added classes, sections, and subject-wise dates & start/end times</p>
                </div>
              </div>

              {/* Class Card config list */}
              <div className="space-y-4">
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
                        <div className="flex flex-col gap-1.5 lg:col-span-3">
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
                        <div className="flex flex-col gap-1.5 lg:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Subject Exam Date</span>
                          </label>
                          <input 
                            type="date"
                            value={sub.examDate || ''}
                            onChange={e => handleSubjectChange(cls.id, sub.id, 'examDate', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900"
                          />
                        </div>

                        {/* 3. Exam Time (Start - End) */}
                        <div className="flex flex-col gap-1.5 lg:col-span-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Exam Time</span>
                            </label>
                            <span className="text-[9px] font-semibold text-slate-400">Start — End</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              type="time"
                              value={sub.startTime || sub.fromTime || ''}
                              onChange={e => handleSubjectChange(cls.id, sub.id, 'startTime', e.target.value)}
                              title="Start Time (From)"
                              className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900"
                            />
                            <input 
                              type="time"
                              value={sub.endTime || sub.toTime || ''}
                              onChange={e => handleSubjectChange(cls.id, sub.id, 'endTime', e.target.value)}
                              title="End Time (To)"
                              className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900"
                            />
                          </div>
                        </div>

                        {/* 4. Maximum Marks */}
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

                        {/* 5. Practical Column Toggle & Marks */}
                        <div className="flex items-center gap-2.5 py-1.5 lg:col-span-2">
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Practical</span>
                            <button 
                              type="button"
                              onClick={() => handleSubjectChange(cls.id, sub.id, 'practicalColumn', !sub.practicalColumn)}
                              className={`w-9 h-5 rounded-full relative transition-colors ${
                                sub.practicalColumn ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                                sub.practicalColumn ? 'left-4.5' : 'left-0.5'
                              }`}></div>
                            </button>
                          </div>

                          {sub.practicalColumn && (
                            <input 
                              type="text" 
                              placeholder="Pr. Marks"
                              value={sub.practicalMarks}
                              onChange={e => handleSubjectChange(cls.id, sub.id, 'practicalMarks', e.target.value)}
                              className="w-18 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-teal-500 font-semibold text-center bg-white dark:bg-slate-900 animate-in fade-in"
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
          </div>
            
          {/* ==================== 3. EXAM TIMELINE & ENTRY DEADLINES ==================== */}
          <div className="bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    Exam Timeline & Entry Deadlines
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configure official schedule release dates, admit card availability, and mark entry lock deadlines
                  </p>
                </div>
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

        {/* ================================== STEP 3: ADMIT CARD SETUP ================================== */}
        {currentStep === 'Admit Card Setup' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                    Step 3 of 5
                  </span>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Admit Card & Hall Ticket Setup
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Select official hall ticket template style, student display fields, timetable rules, and print layout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handlePreviewAdmitCard(admitTemplateStyle)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <Eye className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Live Hall Ticket Preview
              </button>
            </div>

            {/* Template Selector Grid & Color Customizer */}
            <div className="space-y-4">
              
              {/* Theme Color Customizer */}
              <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm transition-all shrink-0"
                      style={{ backgroundColor: admitThemeColor }}
                    >
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                          Admit Card Theme Color
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-xs font-mono"
                          style={{ backgroundColor: admitThemeColor }}
                        >
                          {admitThemeColor}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Pick any custom color or choose from curated presets — updates all templates in real-time
                      </p>
                    </div>
                  </div>

                  {/* Native Color Picker Trigger & Hex field */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                        <input
                          type="color"
                          value={admitThemeColor}
                          onChange={(e) => setAdmitThemeColor(e.target.value)}
                          className="w-6 h-6 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <span className="text-[11px] font-bold">Pick Color</span>
                      </label>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <input
                        type="text"
                        value={admitThemeColor}
                        onChange={(e) => setAdmitThemeColor(e.target.value)}
                        placeholder="#1e3a8a"
                        maxLength={7}
                        className="w-20 text-[11px] font-mono font-bold uppercase bg-transparent outline-none text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preset Swatches */}
                <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Presets:
                  </span>
                  {[
                    { name: 'Navy Blue', hex: '#1E3A8A' },
                    { name: 'Emerald', hex: '#047857' },
                    { name: 'Crimson', hex: '#991B1B' },
                    { name: 'Slate', hex: '#334155' },
                    { name: 'Indigo', hex: '#4338CA' },
                    { name: 'Ocean Teal', hex: '#0F766E' },
                    { name: 'Amber Gold', hex: '#B45309' },
                    { name: 'Plum', hex: '#701A75' },
                    { name: 'Wine', hex: '#831843' },
                    { name: 'Midnight', hex: '#0F172A' }
                  ].map(preset => {
                    const isSelected = admitThemeColor.toLowerCase() === preset.hex.toLowerCase()
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setAdmitThemeColor(preset.hex)}
                        title={`${preset.name} (${preset.hex})`}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          isSelected
                            ? 'ring-2 ring-teal-500 border-transparent text-white shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                        }`}
                        style={isSelected ? { backgroundColor: preset.hex } : {}}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Select Hall Ticket Template Style
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Choose from 4 authentic academic admit card layouts — customizable with your chosen theme color
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  4 Unique Layouts Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Classic Board Official */}
                {(() => {
                  const isSelected = admitTemplateStyle === 'Classic Board' || admitTemplateStyle === 'Classic Navy'
                  return (
                    <div 
                      onClick={() => setAdmitTemplateStyle('Classic Board')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-teal-50/20 ring-2 ring-teal-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: admitThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                          CBSE / Board Style
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <AdmitCardMiniPreview
                        template="Classic Board"
                        themeColor={admitThemeColor}
                        schoolName={schoolName || 'DELHI PUBLIC SCHOOL'}
                        examName={examName || 'Final Term Exam'}
                        session={session}
                        isSelected={isSelected}
                        displayFields={admitDisplayFields}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Classic Board</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Traditional Board Layout • Official Dual Border & Crest</span>
                      </div>
                      
                      <span className="text-[9px] text-center font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 py-1 rounded-lg">
                        Full Matrix + Specimen Sign Box
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewAdmitCard('Classic Board')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-teal-700 dark:text-teal-400 font-bold text-[11px] border border-teal-200 dark:border-teal-800 hover:border-teal-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {/* 2. Modern Split Pass */}
                {(() => {
                  const isSelected = admitTemplateStyle === 'Modern Split Pass' || admitTemplateStyle === 'Modern Emerald'
                  return (
                    <div 
                      onClick={() => setAdmitTemplateStyle('Modern Split Pass')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-teal-50/20 ring-2 ring-teal-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: admitThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Academy Pass
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <AdmitCardMiniPreview
                        template="Modern Split Pass"
                        themeColor={admitThemeColor}
                        schoolName={schoolName || 'DELHI PUBLIC SCHOOL'}
                        examName={examName || 'Final Term Exam'}
                        session={session}
                        isSelected={isSelected}
                        displayFields={admitDisplayFields}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Modern Split Pass</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Dual-Column Format • Student Profile Sidebar & QR</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 py-1 rounded-lg">
                        Left Profile Bar + Card Tiles
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewAdmitCard('Modern Split Pass')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-teal-700 dark:text-teal-400 font-bold text-[11px] border border-teal-200 dark:border-teal-800 hover:border-teal-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {/* 3. Executive Heritage */}
                {(() => {
                  const isSelected = admitTemplateStyle === 'Executive Heritage' || admitTemplateStyle === 'Executive Crimson'
                  return (
                    <div 
                      onClick={() => setAdmitTemplateStyle('Executive Heritage')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-teal-50/20 ring-2 ring-teal-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: admitThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                          Heritage Crest
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <AdmitCardMiniPreview
                        template="Executive Heritage"
                        themeColor={admitThemeColor}
                        schoolName={schoolName || 'DELHI PUBLIC SCHOOL'}
                        examName={examName || 'Final Term Exam'}
                        session={session}
                        isSelected={isSelected}
                        displayFields={admitDisplayFields}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Executive Heritage</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Prestigious Certificate Format • Ornate Double Filigree</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 py-1 rounded-lg">
                        Crest Seal + Declaration Block
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewAdmitCard('Executive Heritage')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-teal-700 dark:text-teal-400 font-bold text-[11px] border border-teal-200 dark:border-teal-800 hover:border-teal-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {/* 4. Compact Minimalist */}
                {(() => {
                  const isSelected = admitTemplateStyle === 'Compact Minimalist' || admitTemplateStyle === 'Minimalist Slate'
                  return (
                    <div 
                      onClick={() => setAdmitTemplateStyle('Compact Minimalist')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-teal-50/20 ring-2 ring-teal-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: admitThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-200 text-slate-800 border border-slate-300">
                          Detachable Stub
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <AdmitCardMiniPreview
                        template="Compact Minimalist"
                        themeColor={admitThemeColor}
                        schoolName={schoolName || 'DELHI PUBLIC SCHOOL'}
                        examName={examName || 'Final Term Exam'}
                        session={session}
                        isSelected={isSelected}
                        displayFields={admitDisplayFields}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Compact Minimalist</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">High-Density Slip • Barcode Header & Tear-Off Stub</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 py-1 rounded-lg">
                        Tear-Off Stub + Fast Print
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewAdmitCard('Compact Minimalist')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-teal-700 dark:text-teal-400 font-bold text-[11px] border border-teal-200 dark:border-teal-800 hover:border-teal-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Auto-Updating Live Admit Card Preview at Bottom of Template Selector */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                          <span>Live Admit Card Preview •</span>
                          <span className="text-teal-600 dark:text-teal-400">{admitTemplateStyle}</span>
                          <span
                            className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase text-white shadow-2xs font-mono"
                            style={{ backgroundColor: admitThemeColor }}
                          >
                            {admitThemeColor}
                          </span>
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                          ⚡ Auto-Updating
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-500">
                          Selecting any template style or color above automatically updates this live printable hall ticket preview in real time.
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-2xs">
                          ⚡ Click any label to edit text live
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePreviewAdmitCard(admitTemplateStyle)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
                  >
                    <Eye className="w-4 h-4" /> Open Full Screen / Print
                  </button>
                </div>

                {/* Live Paper Viewport */}
                <div className="overflow-x-auto flex justify-center py-3 bg-slate-200/60 dark:bg-slate-950/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
                  <div className="w-full flex justify-center max-w-[800px]">
                    <AdmitCardPaper
                      card={{
                        id: 999999,
                        className: classes[0]?.className || 'Class X',
                        examName: examName || 'Final Term Examination',
                        admitCardLabel: admitLabel || 'Admit Card',
                        timeTableId: 999999,
                        session: session,
                        schoolName: schoolName || 'COSMOPOLITAN INTER COLLEGE',
                        schoolAddress: schoolAddress || 'Green Park Sector 4, New Delhi',
                        displayFields: admitDisplayFields,
                        templateStyle: admitTemplateStyle,
                        themeColor: admitThemeColor,
                        status: admitCardStatus ? 'Active' : 'Inactive',
                        instructions: admitInstructions || '1. Candidates must arrive at the examination center 30 minutes before the scheduled time.\n2. Bring this original Admit Card along with Institute Student ID.\n3. Electronic devices, smartwatches, and study materials are strictly prohibited in the exam hall.\n4. Maintain discipline and follow invigilator guidelines at all times.',
                        showExamTimeTable: showExamTimeTableOnAdmit,
                        noOfPrintPerPage: admitNoOfPrintPerPage,
                        headerNameFontSize: admitHeaderNameFontSize,
                        headerDetailsFontSize: admitHeaderDetailsFontSize,
                        studentDetailsFontSize: admitStudentDetailsFontSize,
                        timetableDetailsFontSize: admitTimetableDetailsFontSize,
                        headingFontSize: admitHeadingFontSize,
                        defaultFontSize: admitDefaultFontSize,
                        spacing: admitSpacing,
                        studentPhotoSize: admitStudentPhotoSize,
                        teacherSignLabel: admitTeacherSignLabel,
                        studentSignLabel: admitStudentSignLabel,
                        parentSignLabel: admitParentSignLabel,
                        principalSignLabel: admitPrincipalSignLabel,
                        principalName: principalName,
                        signatureWidth: admitSignatureWidth,
                        schoolStampWidth: admitSchoolStampWidth,
                        customLabels: admitCustomLabels,
                        dateCreated: new Date().toLocaleDateString('en-GB'),
                        timeCreated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }}
                      customSubjects={classes[0]?.subjects.map(s => ({
                        subjectName: s.subjectName || 'Subject Name',
                        date: s.examDate || dateOfExam || '2025-03-20',
                        fromTime: s.startTime || s.fromTime || '10:00',
                        toTime: s.endTime || s.toTime || '13:00'
                      }))}
                      editable={true}
                      onUpdateField={handleAdmitCardFieldUpdate}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Admit Card Configuration Form */}
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-xs">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
                Hall Ticket Print & Document Configuration
              </h3>

              {/* Title & Core Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Admit Card Document Title</label>
                  <input
                    type="text"
                    value={admitLabel}
                    onChange={e => setAdmitLabel(e.target.value)}
                    placeholder="Admit Card"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-bold text-slate-800 dark:text-slate-100 shadow-xs"
                  />
                  <span className="text-[10px] text-slate-400">Heading printed on hall ticket</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Admit Card Status</span>
                    <span className="text-[10px] text-slate-400">Available to students online</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdmitCardStatus(!admitCardStatus)}
                    className={`w-10 h-5.5 rounded-full relative transition-colors ${admitCardStatus ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${admitCardStatus ? 'left-5' : 'left-0.5'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">Exam Timetable</span>
                    <span className="text-[10px] text-slate-400">Show schedule on admit card</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExamTimeTableOnAdmit(!showExamTimeTableOnAdmit)}
                    className={`w-10 h-5.5 rounded-full relative transition-colors ${showExamTimeTableOnAdmit ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showExamTimeTableOnAdmit ? 'left-5' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>

              {/* Display Fields Checkboxes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Select Fields to Display on Student Admit Card
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-teal-600 hover:text-teal-700 select-none">
                    <input
                      type="checkbox"
                      checked={isAdmitAllSelected}
                      onChange={e => handleAdmitSelectAllChange(e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                    />
                    <span>Select All Fields</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {ADMIT_DISPLAY_FIELDS_KEYS.map(f => (
                    <label key={f.key} className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                      admitDisplayFields[f.key] 
                        ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      <input
                        type="checkbox"
                        checked={!!admitDisplayFields[f.key]}
                        onChange={() => handleAdmitCheckboxChange(f.key)}
                        className="w-3.5 h-3.5 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                      />
                      <span className="truncate">{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Candidate Examination Instructions</label>
                <textarea
                  rows={4}
                  placeholder="Write official examination instructions for students..."
                  value={admitInstructions}
                  onChange={e => setAdmitInstructions(e.target.value)}
                  className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs leading-relaxed"
                />
              </div>

              {/* Authority Signatures & Official Stamp Configuration */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Authority Signatures & Official Stamp Setup
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Enable or disable required signatures with individual ON / OFF toggles and configure their printed titles.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {/* 1. Principal Sign (FIRST PLACE - Auto-fetched from Institute Details) */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    admitDisplayFields.principalSign 
                      ? 'bg-white dark:bg-slate-800 border-teal-300 dark:border-teal-700/80 shadow-xs ring-1 ring-teal-500/15' 
                      : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                  }`}>
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">Principal Sign</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          admitDisplayFields.principalSign 
                            ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {admitDisplayFields.principalSign ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdmitCheckboxChange('principalSign')}
                        className={`w-10 h-5.5 rounded-full relative transition-colors ${admitDisplayFields.principalSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${admitDisplayFields.principalSign ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    {/* Auto-fetch Institute Detail Pill */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 text-[10.5px] text-teal-800 dark:text-teal-200 mb-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Auto-fetched from Institute:</span>
                        <span className="font-extrabold capitalize text-teal-700 dark:text-teal-300">{principalName || 'fahad'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                        {principalName && (
                          <button
                            type="button"
                            onClick={() => setAdmitPrincipalSignLabel(`Principal's Sign. (${principalName})`)}
                            className="text-[9px] font-bold text-teal-600 hover:text-teal-700 underline"
                          >
                            + Add Name
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={admitPrincipalSignLabel}
                        onChange={e => setAdmitPrincipalSignLabel(e.target.value)}
                        disabled={!admitDisplayFields.principalSign}
                        placeholder="Principal's Sign."
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-teal-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* 2. Teacher Sign */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    admitDisplayFields.teacherSign 
                      ? 'bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-800/80 shadow-xs ring-1 ring-teal-500/10' 
                      : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                  }`}>
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">Teacher Sign</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          admitDisplayFields.teacherSign 
                            ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {admitDisplayFields.teacherSign ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdmitCheckboxChange('teacherSign')}
                        className={`w-10 h-5.5 rounded-full relative transition-colors ${admitDisplayFields.teacherSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${admitDisplayFields.teacherSign ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                      <input
                        type="text"
                        value={admitTeacherSignLabel}
                        onChange={e => setAdmitTeacherSignLabel(e.target.value)}
                        disabled={!admitDisplayFields.teacherSign}
                        placeholder="Class Teacher's Sign."
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-teal-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* 3. Student Sign */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    admitDisplayFields.studentSign 
                      ? 'bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-800/80 shadow-xs ring-1 ring-teal-500/10' 
                      : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                  }`}>
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">Student Sign</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          admitDisplayFields.studentSign 
                            ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {admitDisplayFields.studentSign ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdmitCheckboxChange('studentSign')}
                        className={`w-10 h-5.5 rounded-full relative transition-colors ${admitDisplayFields.studentSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${admitDisplayFields.studentSign ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                      <input
                        type="text"
                        value={admitStudentSignLabel}
                        onChange={e => setAdmitStudentSignLabel(e.target.value)}
                        disabled={!admitDisplayFields.studentSign}
                        placeholder="Student's Sign."
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-teal-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* 4. Parent Sign */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    admitDisplayFields.parentSign 
                      ? 'bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-800/80 shadow-xs ring-1 ring-teal-500/10' 
                      : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                  }`}>
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">Parent Sign</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          admitDisplayFields.parentSign 
                            ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {admitDisplayFields.parentSign ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdmitCheckboxChange('parentSign')}
                        className={`w-10 h-5.5 rounded-full relative transition-colors ${admitDisplayFields.parentSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${admitDisplayFields.parentSign ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                      <input
                        type="text"
                        value={admitParentSignLabel}
                        onChange={e => setAdmitParentSignLabel(e.target.value)}
                        disabled={!admitDisplayFields.parentSign}
                        placeholder="Parent's Sign."
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-teal-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* 5. School Stamp */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    admitDisplayFields.schoolStamp 
                      ? 'bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-800/80 shadow-xs ring-1 ring-teal-500/10' 
                      : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                  }`}>
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">School Stamp</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          admitDisplayFields.schoolStamp 
                            ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {admitDisplayFields.schoolStamp ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdmitCheckboxChange('schoolStamp')}
                        className={`w-10 h-5.5 rounded-full relative transition-colors ${admitDisplayFields.schoolStamp ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${admitDisplayFields.schoolStamp ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Seal Status</label>
                      <div className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Official Institute Seal</span>
                        <span className="text-[10px] text-teal-600 font-bold">{admitDisplayFields.schoolStamp ? 'Included' : 'Excluded'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================== STEP 4: MARKSHEET DESIGN SETUP ================================== */}
        {currentStep === 'Marksheet Design Setup' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                    Step 4 of 5
                  </span>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Marksheet Template & Design Setup
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Select examination marksheet template and configure grading rules, titles, and layout dimensions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handlePreviewMarksheet(selectedTemplate)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Live Marksheet Preview
              </button>
            </div>

            {/* Marksheet Theme Color Selector & Template Selector Grid */}
            <div className="space-y-4">
              {/* Theme Color Customizer Bar */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                          Marksheet Theme Color
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-2xs font-mono"
                          style={{ backgroundColor: marksheetThemeColor }}
                        >
                          {marksheetThemeColor}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Pick any custom color or choose from curated presets — updates all marksheet templates in real-time
                      </p>
                    </div>
                  </div>

                  {/* Native Picker + Hex Input */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="color"
                          value={marksheetThemeColor}
                          onChange={(e) => setMarksheetThemeColor(e.target.value)}
                          className="w-6 h-6 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <span className="text-[11px] font-bold">Pick Color</span>
                      </label>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <input
                        type="text"
                        value={marksheetThemeColor}
                        onChange={(e) => setMarksheetThemeColor(e.target.value)}
                        placeholder="#065f46"
                        maxLength={7}
                        className="w-20 text-[11px] font-mono font-bold uppercase bg-transparent outline-none text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preset Swatches */}
                <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Presets:
                  </span>
                  {[
                    { name: 'Royal Emerald', hex: '#065F46' },
                    { name: 'Navy Blue', hex: '#1E3A8A' },
                    { name: 'Burgundy', hex: '#660033' },
                    { name: 'Crimson', hex: '#991B1B' },
                    { name: 'Ocean Teal', hex: '#0F766E' },
                    { name: 'Slate', hex: '#334155' },
                    { name: 'Indigo', hex: '#4338CA' },
                    { name: 'Amber Gold', hex: '#B45309' },
                    { name: 'Plum', hex: '#701A75' },
                    { name: 'Midnight', hex: '#0F172A' }
                  ].map(preset => {
                    const isSelected = marksheetThemeColor.toLowerCase() === preset.hex.toLowerCase()
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setMarksheetThemeColor(preset.hex)}
                        title={`${preset.name} (${preset.hex})`}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          isSelected
                            ? 'ring-2 ring-purple-500 border-transparent text-white shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                        }`}
                        style={isSelected ? { backgroundColor: preset.hex } : {}}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Select Examination Marksheet Template
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Choose from 4 professionally crafted academic marksheet layouts — customizable with your chosen theme color
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  4 Templates Available
                </span>
              </div>

              {/* 4 Template Cards with Small Previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. CBSE Royal Emerald */}
                {(() => {
                  const isSelected = selectedTemplate === 'CBSE Royal Emerald'
                  return (
                    <div 
                      onClick={() => setSelectedTemplate('CBSE Royal Emerald')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-purple-50/20 ring-2 ring-purple-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: marksheetThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          CBSE / Board
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-purple-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <MarksheetMiniPreview
                        template="CBSE Royal Emerald"
                        themeColor={marksheetThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        examName={examName || 'Annual Examination 2025-26'}
                        academicYear={session}
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">CBSE Royal Emerald</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Official Board Format • Gold Crest</span>
                      </div>
                      
                      <span className="text-[9px] text-center font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 py-1 rounded-lg">
                        Part 1 Scholastic + Part 2 Co-Scholastic
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewMarksheet('CBSE Royal Emerald')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-400 font-bold text-[11px] border border-purple-200 dark:border-purple-800 hover:border-purple-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {/* 2. Minimalist Modern */}
                {(() => {
                  const isSelected = selectedTemplate === 'Minimalist Modern'
                  return (
                    <div 
                      onClick={() => setSelectedTemplate('Minimalist Modern')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-purple-50/20 ring-2 ring-purple-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: marksheetThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-teal-100 text-teal-800 border border-teal-200">
                          Canva / Pinterest
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-purple-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <MarksheetMiniPreview
                        template="Minimalist Modern"
                        themeColor={marksheetThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        examName={examName || 'Annual Examination 2025-26'}
                        academicYear={session}
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Minimalist Modern</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Teal & Slate • KPI Badges</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 py-1 rounded-lg">
                        Attendance Meter + Progress Bars
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewMarksheet('Minimalist Modern')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-400 font-bold text-[11px] border border-purple-200 dark:border-purple-800 hover:border-purple-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {/* 3. Dual-Term Consolidated */}
                {(() => {
                  const isSelected = selectedTemplate === 'Dual-Term Consolidated'
                  return (
                    <div 
                      onClick={() => setSelectedTemplate('Dual-Term Consolidated')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-purple-50/20 ring-2 ring-purple-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: marksheetThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-pink-100 text-pink-900 border border-pink-200">
                          ICSE / State
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-purple-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <MarksheetMiniPreview
                        template="Dual-Term Consolidated"
                        themeColor={marksheetThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        examName={examName || 'Annual Examination 2025-26'}
                        academicYear={session}
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Dual-Term Consolidated</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Burgundy & Navy • Term 1 vs 2</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 py-1 rounded-lg">
                        Class Rank #3 + 4 Signatures
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewMarksheet('Dual-Term Consolidated')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-400 font-bold text-[11px] border border-purple-200 dark:border-purple-800 hover:border-purple-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {/* 4. Holistic Early Skills */}
                {(() => {
                  const isSelected = selectedTemplate === 'Holistic Early Skills'
                  return (
                    <div 
                      onClick={() => setSelectedTemplate('Holistic Early Skills')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-purple-50/20 ring-2 ring-purple-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: marksheetThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-sky-100 text-sky-800 border border-sky-200">
                          Montessori / Primary
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-purple-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <MarksheetMiniPreview
                        template="Holistic Early Skills"
                        themeColor={marksheetThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        examName={examName || 'Annual Examination 2025-26'}
                        academicYear={session}
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Holistic Early Skills</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Kindergarten & Primary • Stars</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 py-1 rounded-lg">
                        5 Domains + Star Ratings
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewMarksheet('Holistic Early Skills')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-400 font-bold text-[11px] border border-purple-200 dark:border-purple-800 hover:border-purple-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Auto-Updating Live Marksheet Preview at Bottom of Template Selector */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                          <span>Live Marksheet Preview •</span>
                          <span className="text-purple-600 dark:text-purple-400">{selectedTemplate}</span>
                          <span
                            className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase text-white shadow-2xs font-mono"
                            style={{ backgroundColor: marksheetThemeColor }}
                          >
                            {marksheetThemeColor}
                          </span>
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                          ⚡ Auto-Updating
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60">
                          ✍️ Click Any Label to Edit Live
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Selecting any template style or color above automatically updates this live printable marksheet preview in real time. Click any primary label or header to edit text directly.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreviewMarksheet(selectedTemplate)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Full Screen / Print</span>
                  </button>
                </div>

                {/* Live Paper Viewport */}
                <div className="overflow-x-auto flex justify-center py-3 bg-slate-200/60 dark:bg-slate-950/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
                  <div className="w-full flex justify-center max-w-[820px]">
                    <MarksheetPreview
                      templateName={selectedTemplate}
                      themeColor={marksheetThemeColor}
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
                      editable={true}
                      customLabels={marksheetCustomLabels}
                      onUpdateField={handleMarksheetFieldUpdate}
                    />
                  </div>
                </div>
              </div>
            </div>

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

            {/* Display Fields on Marksheet */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide block">
                    Select Fields to Display on Marksheet
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Check or uncheck fields to show or hide them dynamically on the live printable marksheet preview.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-teal-600 hover:text-teal-700 select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={isMarksheetAllSelected}
                    onChange={e => handleMarksheetSelectAllChange(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                  />
                  <span>Select All Fields</span>
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                {MARKSHEET_DISPLAY_FIELDS_KEYS.map(f => {
                  const isChecked = !!(columnsList as any)[f.key]
                  return (
                    <label 
                      key={f.key} 
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked 
                          ? 'bg-teal-50/60 dark:bg-teal-950/20 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 shadow-2xs font-bold' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleMarksheetCheckboxChange(f.key)}
                        className="w-3.5 h-3.5 text-teal-600 border-slate-300 focus:ring-teal-500 rounded"
                      />
                      <span className="truncate">{f.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* SEPARATE AUTHORITY SIGNATURES & OFFICIAL STAMP CONFIGURATION (EXACTLY LIKE ADMIT CARD) */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 gap-2">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Authority Signatures & Official Stamp Setup
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Enable or disable required signatures with individual ON / OFF toggles and configure their printed titles.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {/* 1. Principal Sign (FIRST PLACE - Auto-fetched from Institute Details) */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  columnsList.principalSign 
                    ? 'bg-white dark:bg-slate-800 border-teal-300 dark:border-teal-700/80 shadow-xs ring-1 ring-teal-500/15' 
                    : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                }`}>
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">Principal Sign</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        columnsList.principalSign 
                          ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {columnsList.principalSign ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMarksheetCheckboxChange('principalSign')}
                      className={`w-10 h-5.5 rounded-full relative transition-colors ${columnsList.principalSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${columnsList.principalSign ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {/* Auto-fetch Institute Detail Pill */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 text-[10.5px] text-teal-800 dark:text-teal-200 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <div className="truncate">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Auto-fetched from Institute:</span>
                      <span className="font-extrabold capitalize text-teal-700 dark:text-teal-300">{principalName || 'Principal'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                      {principalName && (
                        <button
                          type="button"
                          onClick={() => {
                            const val = `Principal (${principalName})`
                            setMarksheetPrincipalSignLabel(val)
                            handleMarksheetFieldUpdate('customLabels', { principalSignLabel: val })
                          }}
                          className="text-[9px] font-bold text-teal-600 hover:text-teal-700 underline"
                        >
                          + Add Name
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={marksheetPrincipalSignLabel}
                      onChange={e => {
                        setMarksheetPrincipalSignLabel(e.target.value)
                        handleMarksheetFieldUpdate('customLabels', { principalSignLabel: e.target.value })
                      }}
                      disabled={!columnsList.principalSign}
                      placeholder="Principal's Signature"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-teal-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* 2. Class Teacher Sign */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  columnsList.teacherSign 
                    ? 'bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-800/80 shadow-xs ring-1 ring-teal-500/10' 
                    : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                }`}>
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">Teacher Sign</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        columnsList.teacherSign 
                          ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {columnsList.teacherSign ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMarksheetCheckboxChange('teacherSign')}
                      className={`w-10 h-5.5 rounded-full relative transition-colors ${columnsList.teacherSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${columnsList.teacherSign ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                    <input
                      type="text"
                      value={marksheetTeacherSignLabel}
                      onChange={e => {
                        setMarksheetTeacherSignLabel(e.target.value)
                        handleMarksheetFieldUpdate('customLabels', { teacherSignLabel: e.target.value })
                      }}
                      disabled={!columnsList.teacherSign}
                      placeholder="Class Teacher's Signature"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-teal-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* 3. Exam Controller / In-Charge Sign */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  columnsList.controllerSign 
                    ? 'bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-800/80 shadow-xs ring-1 ring-teal-500/10' 
                    : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                }`}>
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">Exam Controller Sign</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        columnsList.controllerSign 
                          ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {columnsList.controllerSign ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMarksheetCheckboxChange('controllerSign')}
                      className={`w-10 h-5.5 rounded-full relative transition-colors ${columnsList.controllerSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${columnsList.controllerSign ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                    <input
                      type="text"
                      value={marksheetControllerSignLabel}
                      onChange={e => {
                        setMarksheetControllerSignLabel(e.target.value)
                        handleMarksheetFieldUpdate('customLabels', { examInChargeSignLabel: e.target.value })
                      }}
                      disabled={!columnsList.controllerSign}
                      placeholder="Exam Controller"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-teal-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* 4. Parent / Guardian Sign */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  columnsList.parentSign 
                    ? 'bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-800/80 shadow-xs ring-1 ring-teal-500/10' 
                    : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                }`}>
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">Parent Sign</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        columnsList.parentSign 
                          ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {columnsList.parentSign ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMarksheetCheckboxChange('parentSign')}
                      className={`w-10 h-5.5 rounded-full relative transition-colors ${columnsList.parentSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${columnsList.parentSign ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                    <input
                      type="text"
                      value={marksheetParentSignLabel}
                      onChange={e => {
                        setMarksheetParentSignLabel(e.target.value)
                        handleMarksheetFieldUpdate('customLabels', { parentSignLabel: e.target.value })
                      }}
                      disabled={!columnsList.parentSign}
                      placeholder="Parent / Guardian Sign"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-teal-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* 5. Official Stamp & Seal */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  showHeaderStamp 
                    ? 'bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-800/80 shadow-xs ring-1 ring-teal-500/10' 
                    : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                }`}>
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">Official Stamp / Seal</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        showHeaderStamp 
                          ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {showHeaderStamp ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHeaderStamp(!showHeaderStamp)}
                      className={`w-10 h-5.5 rounded-full relative transition-colors ${showHeaderStamp ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showHeaderStamp ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Stamp Title</label>
                    <input
                      type="text"
                      value={marksheetSealLabel}
                      onChange={e => {
                        setMarksheetSealLabel(e.target.value)
                        handleMarksheetFieldUpdate('customLabels', { officialSealLabel: e.target.value })
                      }}
                      disabled={!showHeaderStamp}
                      placeholder="OFFICIAL SEAL"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-teal-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>
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

        {/* ================================== STEP 5: CERTIFICATE DESIGN ================================== */}
        {currentStep === 'Certificate Design' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    Step 5 of 5
                  </span>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Certificate Template & Design Setup
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Select official student award certificate template style and inspect printable preview in real time.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handlePreviewCertificate(certTemplate)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Live Certificate Preview
              </button>
            </div>

            {/* Certificate Theme Color Customizer */}
            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 transition-all duration-300"
                    style={{ backgroundColor: certThemeColor }}
                  >
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                        Certificate Theme Color
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-black uppercase text-white shadow-2xs font-mono"
                        style={{ backgroundColor: certThemeColor }}
                      >
                        {certThemeColor}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Pick any custom color or choose from curated presets — updates all 4 certificate templates and live preview in real-time
                    </p>
                  </div>
                </div>

                {/* Native Picker + Hex Input */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="color"
                        value={certThemeColor}
                        onChange={(e) => setCertThemeColor(e.target.value)}
                        className="w-6 h-6 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <span className="text-[11px] font-bold">Pick Color</span>
                    </label>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <input
                      type="text"
                      value={certThemeColor}
                      onChange={(e) => setCertThemeColor(e.target.value)}
                      placeholder="#1e3a8a"
                      maxLength={7}
                      className="w-20 text-[11px] font-mono font-bold uppercase bg-transparent outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Color Preset Swatches */}
              <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Presets:
                </span>
                {[
                  { name: 'Royal Blue', hex: '#1E3A8A' },
                  { name: 'Amber Gold', hex: '#B45309' },
                  { name: 'Royal Emerald', hex: '#047857' },
                  { name: 'Crimson Wine', hex: '#831843' },
                  { name: 'Navy & Gold', hex: '#966B2E' },
                  { name: 'Slate Charcoal', hex: '#1E293B' },
                  { name: 'Indigo', hex: '#4338CA' },
                  { name: 'Ocean Teal', hex: '#0F766E' },
                  { name: 'Plum', hex: '#701A75' },
                  { name: 'Midnight', hex: '#0F172A' }
                ].map(preset => {
                  const isSelected = certThemeColor.toLowerCase() === preset.hex.toLowerCase()
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setCertThemeColor(preset.hex)}
                      title={`${preset.name} (${preset.hex})`}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        isSelected
                          ? 'ring-2 ring-amber-500 border-transparent text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                      style={isSelected ? { backgroundColor: preset.hex } : {}}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Template Selector Grid: 4 Certificate Templates */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Select Certificate Template Style
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Choose from 4 official high-definition landscape academic award certificates with crests & QR validation
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  4 Templates Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Certificate Design 1 */}
                {(() => {
                  const isSelected = certTemplate === 'Certificate Design 1'
                  return (
                    <div 
                      onClick={() => setCertTemplate('Certificate Design 1')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: certThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-900 border border-blue-200">
                          Geometric
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <CertificateMiniPreview
                        template="Certificate Design 1"
                        themeColor={certThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        studentName="Aarav Sharma"
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Royal Blue Geometric</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Thin gold inner frame with corner accents</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 py-1 rounded-lg">
                        Official Seal + Geometric Border
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewCertificate('Certificate Design 1')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-600 hover:text-white text-amber-700 dark:text-amber-400 font-bold text-[11px] border border-amber-200 dark:border-amber-800 hover:border-amber-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {/* 2. Certificate Design 2 */}
                {(() => {
                  const isSelected = certTemplate === 'Certificate Design 2'
                  return (
                    <div 
                      onClick={() => setCertTemplate('Certificate Design 2')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: certThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                          Vintage Gold
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <CertificateMiniPreview
                        template="Certificate Design 2"
                        themeColor={certThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        studentName="Aarav Sharma"
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Navy & Gold Corners</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Fleur-de-lis ornate corners & 5 stars</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 py-1 rounded-lg">
                        Fleur-de-lis + Merit Crest
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewCertificate('Certificate Design 2')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-600 hover:text-white text-amber-700 dark:text-amber-400 font-bold text-[11px] border border-amber-200 dark:border-amber-800 hover:border-amber-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {/* 3. Certificate Design 3 */}
                {(() => {
                  const isSelected = certTemplate === 'Certificate Design 3'
                  return (
                    <div 
                      onClick={() => setCertTemplate('Certificate Design 3')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: certThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                          Luxury Emerald
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <CertificateMiniPreview
                        template="Certificate Design 3"
                        themeColor={certThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        studentName="Aarav Sharma"
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Ornate Golden Frame</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Modern luxury border with verified badge</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 py-1 rounded-lg">
                        Shield Verification + Gradient Ribbon
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewCertificate('Certificate Design 3')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-600 hover:text-white text-amber-700 dark:text-amber-400 font-bold text-[11px] border border-amber-200 dark:border-amber-800 hover:border-amber-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {/* 4. Certificate Design 4 */}
                {(() => {
                  const isSelected = certTemplate === 'Certificate Design 4'
                  return (
                    <div 
                      onClick={() => setCertTemplate('Certificate Design 4')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: certThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-100 text-purple-900 border border-purple-200">
                          Corporate
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <CertificateMiniPreview
                        template="Certificate Design 4"
                        themeColor={certThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        studentName="Aarav Sharma"
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Modern Academic Emerald</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Contemporary award with QR & dual border</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 py-1 rounded-lg">
                        Corporate Frame + Gold Seal
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewCertificate('Certificate Design 4')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-600 hover:text-white text-amber-700 dark:text-amber-400 font-bold text-[11px] border border-amber-200 dark:border-amber-800 hover:border-amber-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Auto-Updating Live Certificate Preview at Bottom of Template Selector */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                          <span>Live Certificate Preview •</span>
                          <span className="text-amber-600 dark:text-amber-400">{certTemplate}</span>
                          <span
                            className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase text-white shadow-2xs font-mono"
                            style={{ backgroundColor: certThemeColor }}
                          >
                            {certThemeColor}
                          </span>
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          ⚡ Auto-Updating
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Selecting any certificate template style or color above automatically updates this live printable certificate preview in real time.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreviewCertificate(certTemplate)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-600/20 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Full Screen / Print</span>
                  </button>
                </div>

                {/* Live Paper Viewport */}
                <div className="overflow-x-auto flex justify-center py-4 bg-slate-200/60 dark:bg-slate-950/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
                  <div className="w-full flex justify-center items-center overflow-hidden min-h-[520px]">
                    <div 
                      className="transition-transform duration-200 flex items-center justify-center origin-top shrink-0 scale-[0.62] sm:scale-[0.82] lg:scale-[0.92]"
                    >
                      <CertificatePaper
                        template={certTemplate}
                        themeColor={certThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        schoolAddress={schoolAddress || 'Knowledge Park, Sector 62, New Delhi'}
                        studentName="Aarav Sharma"
                        className={classes[0]?.className || 'Class X'}
                        date={dateOfExam || '15 October 2025'}
                        awarder="Principal & Director"
                      />
                    </div>
                  </div>
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
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
        >
          Cancel
        </Link>
        
        <div className="flex flex-wrap items-center gap-3">
          {currentStep !== 'Exams' && (
            <button 
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg text-xs font-bold hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          {/* Quick Save directly from Exams step */}
          {currentStep === 'Exams' && (
            <button 
              type="button"
              onClick={handleSaveSetup}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Save Setup & Admit Card Now
            </button>
          )}

          {currentStep !== 'Certificate Design' ? (
            <button 
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm"
            >
              Save & Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSaveSetup}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
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
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>Interactive Marksheet Preview</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                      {previewTargetTemplate || selectedTemplate}
                    </span>
                  </h3>
                  <div className="text-[11px] text-purple-600 font-semibold">
                    {examName || 'Upcoming Examination'} • {classes[0]?.className || 'Class 10'} ({session})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewTargetTemplate && previewTargetTemplate !== selectedTemplate && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(previewTargetTemplate)
                      toast.success(`Selected template: ${previewTargetTemplate}`)
                      setShowPreviewModal(false)
                      setPreviewTargetTemplate(null)
                    }}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Select Template</span>
                  </button>
                )}
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
                  onClick={() => {
                    setShowPreviewModal(false)
                    setPreviewTargetTemplate(null)
                  }}
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
                  templateName={previewTargetTemplate || selectedTemplate}
                  themeColor={marksheetThemeColor}
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
                  editable={true}
                  customLabels={marksheetCustomLabels}
                  onUpdateField={handleMarksheetFieldUpdate}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Template: <strong className="text-slate-800 dark:text-slate-200">{previewTargetTemplate || selectedTemplate}</strong></span>
                {(previewTargetTemplate || selectedTemplate) === selectedTemplate && (
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                    Currently Selected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {previewTargetTemplate && previewTargetTemplate !== selectedTemplate && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(previewTargetTemplate)
                      toast.success(`Selected template: ${previewTargetTemplate}`)
                      setShowPreviewModal(false)
                      setPreviewTargetTemplate(null)
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Select & Close
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false)
                    setPreviewTargetTemplate(null)
                  }}
                  className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Close Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* LIVE ADMIT CARD PREVIEW MODAL                                  */}
      {/* ============================================================== */}
      {showAdmitPreviewModal && (
        <AdmitCardModalPreview
          card={{
            id: 999999,
            className: classes[0]?.className || 'Class X',
            examName: examName || 'Final Term Examination',
            admitCardLabel: admitLabel || 'Admit Card',
            timeTableId: 999999,
            session: session,
            schoolName: schoolName || 'COSMOPOLITAN INTER COLLEGE',
            schoolAddress: schoolAddress || 'Green Park Sector 4, New Delhi',
            displayFields: admitDisplayFields,
            templateStyle: previewTargetAdmitStyle || admitTemplateStyle,
            themeColor: admitThemeColor,
            status: admitCardStatus ? 'Active' : 'Inactive',
            instructions: admitInstructions || '1. Candidates must arrive at the examination center 30 minutes before the scheduled time.\n2. Bring this original Admit Card along with Institute Student ID.\n3. Electronic devices, smartwatches, and study materials are strictly prohibited in the exam hall.\n4. Maintain discipline and follow invigilator guidelines at all times.',
            showExamTimeTable: showExamTimeTableOnAdmit,
            noOfPrintPerPage: admitNoOfPrintPerPage,
            headerNameFontSize: admitHeaderNameFontSize,
            headerDetailsFontSize: admitHeaderDetailsFontSize,
            studentDetailsFontSize: admitStudentDetailsFontSize,
            timetableDetailsFontSize: admitTimetableDetailsFontSize,
            headingFontSize: admitHeadingFontSize,
            defaultFontSize: admitDefaultFontSize,
            spacing: admitSpacing,
            studentPhotoSize: admitStudentPhotoSize,
            teacherSignLabel: admitTeacherSignLabel,
            studentSignLabel: admitStudentSignLabel,
            parentSignLabel: admitParentSignLabel,
            principalSignLabel: admitPrincipalSignLabel,
            principalName: principalName,
            signatureWidth: admitSignatureWidth,
            schoolStampWidth: admitSchoolStampWidth,
            customLabels: admitCustomLabels,
            dateCreated: new Date().toLocaleDateString('en-GB'),
            timeCreated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }}
          customSubjects={classes[0]?.subjects.map(s => ({
            subjectName: s.subjectName || 'Subject Name',
            date: s.examDate || dateOfExam || '2025-03-20',
            fromTime: s.startTime || s.fromTime || '10:00',
            toTime: s.endTime || s.toTime || '13:00'
          }))}
          editable={true}
          onUpdateField={handleAdmitCardFieldUpdate}
          onClose={() => {
            setShowAdmitPreviewModal(false)
            setPreviewTargetAdmitStyle(null)
          }}
        />
      )}

      {/* ============================================================== */}
      {/* LIVE CERTIFICATE PREVIEW MODAL                                 */}
      {/* ============================================================== */}
      {showCertPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto py-8">
          <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto max-h-[94vh]">
            
            {/* Header */}
            <div className="px-7 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>Certificate Live Preview</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                      {previewTargetCertTemplate || certTemplate}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    High-definition 300 DPI vector printable certificate with authorized institution credentials
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCertPreviewModal(false)
                  setPreviewTargetCertTemplate(null)
                }}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewport */}
            <div className="p-6 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950/60 min-h-[460px]">
              <div 
                className="transition-transform duration-200 flex items-center justify-center"
                style={{ transform: 'scale(0.80)', transformOrigin: 'center' }}
              >
                <CertificatePaper 
                  template={previewTargetCertTemplate || certTemplate}
                  themeColor={certThemeColor}
                  schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                  schoolAddress={schoolAddress || 'Green Park Sector 4, New Delhi'}
                  studentName="Aarav Sharma"
                  className={classes[0]?.className || 'Class X'}
                  date={dateOfExam || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  awarder="Principal & Director"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold">
                Landscape A4 / Letter Print Ready • 300 DPI Vector Crest
              </span>
              <div className="flex items-center gap-2">
                {previewTargetCertTemplate && previewTargetCertTemplate !== certTemplate && (
                  <button
                    type="button"
                    onClick={() => {
                      setCertTemplate(previewTargetCertTemplate)
                      setShowCertPreviewModal(false)
                      setPreviewTargetCertTemplate(null)
                      toast.success(`Selected ${previewTargetCertTemplate} as active Certificate template`)
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Select & Close
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowCertPreviewModal(false)
                    setPreviewTargetCertTemplate(null)
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Close Preview
                </button>
              </div>
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

export default function AddSetupWizardPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading Exam & Admit Setup Wizard...</p>
      </div>
    }>
      <AddSetupWizardContent />
    </Suspense>
  )
}

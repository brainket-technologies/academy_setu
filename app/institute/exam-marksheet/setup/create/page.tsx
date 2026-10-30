'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Save, Check, CheckCircle2, Award, Eye, FileText, LayoutTemplate, ShieldAlert, Sparkles, Printer, RefreshCw, Layers, Clock, Calendar, School, QrCode, Palette, Sliders, User, UserCheck, Stamp, MoveLeft, MoveRight, Upload, Trash2, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react'
import { toast } from 'sonner'
import { saveMultipleMarksheetSetups, saveMarksheetSetup, fetchExamGroups, saveExamGroup, fetchMarksheetSetupById, fetchCurrentInstitutionDetails } from '../actions'
import { MarksheetPreview, MarksheetMiniPreview } from '@/components/marksheets/MarksheetPreview'
import { getInstituteAddedClasses, MasterClassWithSections } from '@/lib/institute-classes'
import { generateAdmitCardAndTimetableForSetup, AdmitCardConfig } from '@/lib/admit-card-sync'
import { AdmitCardModalPreview, AdmitCardPaper, AdmitCardMiniPreview, SampleSchoolLogo } from '@/components/admit-card/AdmitCardModalPreview'
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

// Admit Card student display field keys & definitions
export const ALL_ADMIT_FIELD_DEFINITIONS: Record<string, { label: string; category: string }> = {
  // Core Student Details
  name: { label: 'Candidate Name', category: 'student' },
  fatherName: { label: "Father's Name", category: 'student' },
  motherName: { label: "Mother's Name", category: 'student' },
  dob: { label: 'Date of Birth', category: 'student' },
  class: { label: 'Class', category: 'student' },
  section: { label: 'Section', category: 'student' },
  rollNo: { label: 'Roll Number', category: 'student' },
  admissionNo: { label: 'Admission No.', category: 'student' },
  registrationNo: { label: 'Registration No.', category: 'student' },
  enrollmentNo: { label: 'Enrollment No.', category: 'student' },
  mobileNo: { label: 'Mobile No.', category: 'student' },
  address: { label: 'Exam Center Address', category: 'student' },

  // Media & Template-Specific Elements
  photo: { label: 'Candidate Photo', category: 'media' },
  logo: { label: 'Institute Logo', category: 'media' },
  qrCode: { label: 'Verification QR', category: 'feature' },
  affiliationDetails: { label: 'Affiliation & Codes', category: 'feature' },
  boardFormat: { label: 'Board Format Badge', category: 'feature' },
  verifiedPass: { label: 'Verified Pass Badge', category: 'feature' },
  centerCode: { label: 'Exam Center Code', category: 'feature' },
  helpline: { label: 'Helpline Number', category: 'feature' },
  mottoQuote: { label: 'Academy Motto / Tagline', category: 'feature' },
  gateClosure: { label: 'Gate Closure Time', category: 'feature' }
}

export const TEMPLATE_SPECIFIC_FIELD_KEYS: Record<string, string[]> = {
  'Classic Board': [
    'name', 'fatherName', 'motherName', 'dob', 'class', 'section', 'rollNo', 'admissionNo',
    'registrationNo', 'enrollmentNo', 'mobileNo', 'address', 'photo', 'qrCode',
    'affiliationDetails', 'boardFormat'
  ],
  'Modern Split Pass': [
    'name', 'fatherName', 'motherName', 'dob', 'class', 'section', 'rollNo', 'admissionNo',
    'registrationNo', 'enrollmentNo', 'mobileNo', 'address', 'photo', 'qrCode',
    'verifiedPass', 'centerCode', 'helpline'
  ],
  'Executive Heritage': [
    'name', 'fatherName', 'motherName', 'dob', 'class', 'section', 'rollNo', 'admissionNo',
    'registrationNo', 'enrollmentNo', 'mobileNo', 'address', 'photo', 'qrCode',
    'mottoQuote'
  ],
  'Compact Minimalist': [
    'name', 'fatherName', 'motherName', 'dob', 'class', 'section', 'rollNo', 'admissionNo',
    'registrationNo', 'enrollmentNo', 'mobileNo', 'address', 'photo', 'qrCode',
    'centerCode'
  ]
}

export const applyReportingTimeToInstructions = (currentText: string, repTime?: string, gateTime?: string) => {
  const timeStr = repTime && repTime.trim() ? repTime.trim() : '09:30 AM IST'
  const gateStr = gateTime && gateTime.trim() ? gateTime.trim() : '09:50 AM (Sharp)'
  const pointOne = `1. Reporting & Gate Closure Time: Candidates must report to the examination center by ${timeStr}. Gate closure time is ${gateStr}.`
  if (!currentText || !currentText.trim()) {
    return `${pointOne}\n2. Bring this original Admit Card along with Institute Student ID.\n3. Electronic devices, smartwatches, and study materials are strictly prohibited in the exam hall.\n4. Maintain discipline and follow invigilator guidelines at all times.`
  }
  const lines = currentText.split('\n')
  if (lines.length > 0 && (lines[0].trim().startsWith('1.') || lines[0].toLowerCase().includes('reporting') || lines[0].toLowerCase().includes('closure') || lines[0].toLowerCase().includes('candidates must') || lines[0].toLowerCase().includes('30 minute'))) {
    lines[0] = pointOne
    return lines.join('\n')
  }
  return `${pointOne}\n${currentText}`
}

export const getSupportedFieldsForTemplate = (templateStyle?: string): { key: string; label: string; category: string }[] => {
  const styleRaw = (templateStyle || 'Classic Board').toLowerCase()
  let key = 'Classic Board'
  if (styleRaw.includes('modern') || styleRaw.includes('emerald') || styleRaw.includes('split') || styleRaw.includes('dual')) {
    key = 'Modern Split Pass'
  } else if (styleRaw.includes('executive') || styleRaw.includes('crimson') || styleRaw.includes('heritage') || styleRaw.includes('crest')) {
    key = 'Executive Heritage'
  } else if (styleRaw.includes('compact') || styleRaw.includes('minimal') || styleRaw.includes('slate') || styleRaw.includes('ticket')) {
    key = 'Compact Minimalist'
  }

  const allowedKeys = TEMPLATE_SPECIFIC_FIELD_KEYS[key] || TEMPLATE_SPECIFIC_FIELD_KEYS['Classic Board']
  return allowedKeys.map(k => ({
    key: k,
    label: ALL_ADMIT_FIELD_DEFINITIONS[k]?.label || k,
    category: ALL_ADMIT_FIELD_DEFINITIONS[k]?.category || 'student'
  }))
}

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
  { key: 'address', label: 'Exam Center Address' },
  { key: 'class', label: 'Class' },
  { key: 'section', label: 'Section' },
  { key: 'photo', label: 'Photo' },
  { key: 'logo', label: 'Institute Logo' }
]

// Marksheet field keys for Display Fields
const MARKSHEET_DISPLAY_FIELDS_KEYS = [
  { key: 'schoolAffiliation', label: 'School Affiliation' },
  { key: 'rollNumber', label: 'Roll Number' },
  { key: 'motherName', label: 'Mother Name' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'admissionNo', label: 'Admission No.' },
  { key: 'mobileNumber', label: 'Mobile Number' },
  { key: 'classSection', label: 'Class & Section' },
  { key: 'gender', label: 'Gender' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'examName', label: 'Exam Name' },
  { key: 'rank', label: 'Class Rank' },
  { key: 'result', label: 'Result Status' },
  { key: 'dateOfIssue', label: 'Date of Issue' },
  { key: 'qrCode', label: 'Verification QR' }
]

// Certificate field keys for Display Fields (Signatures have their own dedicated section below)
export const CERTIFICATE_DISPLAY_FIELDS_KEYS: Array<{ key: string; label: string; category: 'student' | 'institutional' }> = [
  // 1. Student Personal & Academic Fields
  { key: 'studentName', label: 'Student Name', category: 'student' },
  { key: 'fatherName', label: "Father's Name", category: 'student' },
  { key: 'motherName', label: "Mother's Name", category: 'student' },
  { key: 'rollNo', label: 'Roll Number', category: 'student' },
  { key: 'admissionNo', label: 'Admission / Reg. No.', category: 'student' },
  { key: 'classSection', label: 'Class & Section', category: 'student' },
  { key: 'dob', label: 'Date of Birth', category: 'student' },
  { key: 'gender', label: 'Gender', category: 'student' },
  { key: 'studentPhoto', label: 'Student Candidate Photo', category: 'student' },
  { key: 'examName', label: 'Exam / Event Name', category: 'student' },
  { key: 'session', label: 'Academic Session', category: 'student' },

  // 2. Institutional & General Layout Fields
  { key: 'schoolName', label: 'School / Institute Name', category: 'institutional' },
  { key: 'title', label: 'Certificate Title', category: 'institutional' },
  { key: 'subtitle', label: 'Certificate Subtitle', category: 'institutional' },
  { key: 'presentedTo', label: 'Presentation Salutation', category: 'institutional' },
  { key: 'description', label: 'Narrative / Description', category: 'institutional' },
  { key: 'qrCode', label: 'Digital QR Verification', category: 'institutional' },
  { key: 'watermark', label: 'Watermark Crest', category: 'institutional' },
]


interface SubjectConfig {
  id: number
  subjectName: string
  examDate?: string
  startTime?: string
  endTime?: string
  fromTime?: string
  toTime?: string
  theoryMarks?: string
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

function normalizeSection(sec: string): string {
  if (!sec) return ''
  const t = sec.trim()
  if (t.toLowerCase().startsWith('sec ')) {
    return `Section ${t.slice(4).trim()}`
  }
  if (t.toLowerCase().startsWith('section ')) {
    return t
  }
  return `Section ${t}`
}

function formatToDateInput(val: any): string {
  if (!val) return ''
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().split('T')[0]
  }
  const str = String(val).trim()
  if (!str) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  if (str.includes('T')) {
    const p = str.split('T')[0]
    if (/^\d{4}-\d{2}-\d{2}$/.test(p)) return p
  }
  const dmy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
  }
  try {
    const d = new Date(str)
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0]
    }
  } catch (e) {}
  return ''
}

function formatDisplayDate(val: any): string {
  if (!val) return ''
  if (val instanceof Date && !isNaN(val.getTime())) {
    const day = String(val.getDate()).padStart(2, '0')
    const month = String(val.getMonth() + 1).padStart(2, '0')
    const year = val.getFullYear()
    return `${day}/${month}/${year}`
  }
  const str = String(val).trim()
  if (!str) return ''
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str
  const ymd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (ymd) {
    return `${ymd[3].padStart(2, '0')}/${ymd[2].padStart(2, '0')}/${ymd[1]}`
  }
  try {
    const d = new Date(str)
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    }
  } catch (e) {}
  return str
}

function AddSetupWizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams ? (searchParams.get('id') || searchParams.get('editId')) : null
  const [editingId, setEditingId] = useState<string | null>(null)

  // 5 Step Wizard: Exams -> Marks & Grade -> Admit Card Setup -> Marksheet Design -> Certificate Design
  const [currentStep, setCurrentStep] = useState<StepType>('Exams')
  const [selectedTemplate, setSelectedTemplate] = useState('CBSE Royal Emerald')
  const [marksheetThemeColor, setMarksheetThemeColor] = useState('#1e3a8a')
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
  const [groupName, setGroupName] = useState('Quarterly')
  const [availableGroups, setAvailableGroups] = useState<string[]>([
    'Quarterly', 'Half Yearly', 'Yearly', 'Annually'
  ])
  
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
    if (!editId && addedClasses.length > 0) {
      setClasses(prev => prev.map((c, i) => i === 0 && !c.className ? {
        ...c,
        className: addedClasses[0].className,
        sections: addedClasses[0].sections.map(s => normalizeSection(s))
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

        // Ensure s.config is parsed if returned as string from database
        let cfg = s.config
        if (typeof cfg === 'string') {
          try {
            cfg = JSON.parse(cfg)
          } catch (e) {
            cfg = {}
          }
        }
        s.config = cfg || {}

        // Format dates robustly to ensure HTML5 <input type="date"> renders them cleanly
        const rawExamDate = formatToDateInput(s.examDate || s.config?.examDate || s.config?.dateOfExam)
        const rawAdmitCardDate = formatToDateInput(s.admitCardDate || s.config?.admitCardDate || s.config?.admitCardSettings?.admitCardDate || rawExamDate)
        const rawLastDate = formatToDateInput(s.lastDateToEnter || s.config?.lastDateToEnter || s.config?.resultDate || rawExamDate)

        if (rawExamDate) setDateOfExam(rawExamDate)
        if (rawAdmitCardDate) setAdmitCardDate(rawAdmitCardDate)
        if (rawLastDate) setLastDateToEnter(rawLastDate)

        if (s.templateName) setSelectedTemplate(s.templateName)

        if (s.config?.marksheetThemeColor) setMarksheetThemeColor(s.config.marksheetThemeColor)
        if (s.config?.admitTemplateStyle) setAdmitTemplateStyle(s.config.admitTemplateStyle)
        if (s.config?.admitCardSettings?.templateStyle) setAdmitTemplateStyle(s.config.admitCardSettings.templateStyle)
        if (s.config?.admitThemeColor) setAdmitThemeColor(s.config.admitThemeColor)
        if (s.config?.admitCardSettings?.themeColor) setAdmitThemeColor(s.config.admitCardSettings.themeColor)

        if (s.config?.certTemplate) setCertTemplate(s.config.certTemplate)
        if (s.config?.certThemeColor) setCertThemeColor(s.config.certThemeColor)
        if (s.config?.certTitle) setCertTitle(s.config.certTitle)
        if (s.config?.certSubtitle) setCertSubtitle(s.config.certSubtitle)
        if (s.config?.certPresentedTo) setCertPresentedTo(s.config.certPresentedTo)
        if (s.config?.certDescription) setCertDescription(s.config.certDescription)
        if (s.config?.certDisplayFields) setCertDisplayFields(prev => ({ ...prev, ...s.config.certDisplayFields }))
        if (s.config?.certPrincipalSignLabel) setCertPrincipalSignLabel(s.config.certPrincipalSignLabel)
        if (s.config?.certPrincipalName) setCertPrincipalName(s.config.certPrincipalName)
        if (s.config?.certSecondarySignLabel) setCertSecondarySignLabel(s.config.certSecondarySignLabel)
        if (s.config?.certSecondarySignName) setCertSecondarySignName(s.config.certSecondarySignName)
        if (s.config?.certTeacherSignLabel) setCertTeacherSignLabel(s.config.certTeacherSignLabel)
        if (s.config?.certTeacherSignName) setCertTeacherSignName(s.config.certTeacherSignName)
        if (s.config?.certControllerSignLabel) setCertControllerSignLabel(s.config.certControllerSignLabel)
        if (s.config?.certControllerSignName) setCertControllerSignName(s.config.certControllerSignName)
        if (s.config?.certParentSignLabel) setCertParentSignLabel(s.config.certParentSignLabel)
        if (s.config?.certParentSignName) setCertParentSignName(s.config.certParentSignName)
        if (s.config?.certStudentSignLabel) setCertStudentSignLabel(s.config.certStudentSignLabel)
        if (s.config?.certSealLabel) setCertSealLabel(s.config.certSealLabel)
        if (s.config?.certDateOfIssue) setCertDateOfIssue(s.config.certDateOfIssue)
        if (s.config?.certSchoolNameFontSize) setCertSchoolNameFontSize(s.config.certSchoolNameFontSize)
        if (s.config?.certTitleFontSize) setCertTitleFontSize(s.config.certTitleFontSize)
        if (s.config?.certSubtitleFontSize) setCertSubtitleFontSize(s.config.certSubtitleFontSize)
        if (s.config?.certDateLabel) setCertDateLabel(s.config.certDateLabel)
        if (s.config?.certCustomLabels) setCertCustomLabelsState(s.config.certCustomLabels)
        if (s.config?.certSignatureWidth) setCertSignatureWidth(String(s.config.certSignatureWidth))
        if (s.config?.certSignatureFontSize) setCertSignatureFontSize(String(s.config.certSignatureFontSize))
        if (s.config?.certPhotoWidth) setCertPhotoWidth(String(s.config.certPhotoWidth))
        if (s.config?.certPhotoHeight) setCertPhotoHeight(String(s.config.certPhotoHeight))
        if (s.config?.certSchoolStampWidth) setCertSchoolStampWidth(String(s.config.certSchoolStampWidth))
        if (s.config?.marksheetSchoolStampWidth) setMarksheetSchoolStampWidth(String(s.config.marksheetSchoolStampWidth))
        if (s.config?.certSignatureOrder && Array.isArray(s.config.certSignatureOrder)) {
          const standardCertKeys = ['teacherSign', 'controllerSign', 'secondarySign', 'parentSign', 'studentSign', 'principalSign']
          const filtered = s.config.certSignatureOrder.filter((k: string) => standardCertKeys.includes(k))
          const missing = standardCertKeys.filter(k => !filtered.includes(k))
          setCertSignatureOrder([...filtered, ...missing])
        }
        if (typeof s.lockExam === 'boolean') setLockExam(s.lockExam)
        if (s.config?.admitCardSettings?.admitLabel) setAdmitLabel(s.config.admitCardSettings.admitLabel)
        if (s.config?.admitCardSettings?.instructions) {
          const inst = s.config.admitCardSettings.instructions
          const rTime = s.config?.admitCardSettings?.reportingTimeValue || '09:30 AM IST'
          const gTime = s.config?.admitCardSettings?.gateClosureValue || '09:50 AM (Sharp)'
          if (inst.toLowerCase().includes('30 minute') || inst.toLowerCase().includes('30 min')) {
            setAdmitInstructions(applyReportingTimeToInstructions(inst, rTime, gTime))
          } else {
            setAdmitInstructions(inst)
          }
        }
        if (s.config?.admitCardSettings?.displayFields) setAdmitDisplayFields(s.config.admitCardSettings.displayFields)
        if (typeof s.config?.admitCardSettings?.showExamTimeTable === 'boolean') setShowExamTimeTableOnAdmit(s.config.admitCardSettings.showExamTimeTable)
        if (s.config?.admitCardSettings?.studentPhotoWidth) {
          setAdmitStudentPhotoWidth(String(s.config.admitCardSettings.studentPhotoWidth))
          setAdmitStudentPhotoSize(String(s.config.admitCardSettings.studentPhotoWidth))
        } else if (s.config?.admitCardSettings?.studentPhotoSize) {
          setAdmitStudentPhotoWidth(String(s.config.admitCardSettings.studentPhotoSize))
          setAdmitStudentPhotoSize(String(s.config.admitCardSettings.studentPhotoSize))
        }
        if (s.config?.admitCardSettings?.studentPhotoHeight) setAdmitStudentPhotoHeight(String(s.config.admitCardSettings.studentPhotoHeight))
        if (s.config?.admitCardSettings?.schoolStampWidth) setAdmitSchoolStampWidth(String(s.config.admitCardSettings.schoolStampWidth))
        if (s.config?.admitCardSettings?.schoolLogo) setAdmitSchoolLogo(s.config.admitCardSettings.schoolLogo)
        if (s.config?.admitCardSettings?.schoolLogoWidth) setAdmitSchoolLogoWidth(String(s.config.admitCardSettings.schoolLogoWidth))
        if (s.config?.admitCardSettings?.schoolLogoHeight) setAdmitSchoolLogoHeight(String(s.config.admitCardSettings.schoolLogoHeight))
        if (s.config?.admitCardSettings?.logoPosition) setAdmitLogoPosition(s.config.admitCardSettings.logoPosition)
        if (s.config?.admitCardSettings?.contentPosition) setAdmitContentPosition(s.config.admitCardSettings.contentPosition)
        if (s.config?.admitCardSettings?.photoPosition) setAdmitPhotoPosition(s.config.admitCardSettings.photoPosition)
        if (Array.isArray(s.config?.admitCardSettings?.signatureOrder) && s.config.admitCardSettings.signatureOrder.length > 0) {
          const loadedOrder = s.config.admitCardSettings.signatureOrder
          const standardKeys = ['studentSign', 'parentSign', 'teacherSign', 'principalSign']
          const filtered = loadedOrder.filter((k: string) => standardKeys.includes(k))
          const missing = standardKeys.filter(k => !filtered.includes(k))
          setAdmitSignatureOrder([...filtered, ...missing])
        }
        if (s.config?.admitCardSettings?.qrCodeSize) setAdmitQrCodeSize(String(s.config.admitCardSettings.qrCodeSize))
        if (s.config?.admitCardSettings?.signatureWidth) setAdmitSignatureWidth(String(s.config.admitCardSettings.signatureWidth))
        if (s.config?.admitCardSettings?.signatureFontSize) setAdmitSignatureFontSize(String(s.config.admitCardSettings.signatureFontSize))
        if (s.config?.admitCardSettings?.headerNameFontSize) {
          const v = Number(s.config.admitCardSettings.headerNameFontSize)
          setAdmitHeaderNameFontSize(v > 32 ? '22' : String(v))
        }
        if (s.config?.admitCardSettings?.headerDetailsFontSize) {
          const v = Number(s.config.admitCardSettings.headerDetailsFontSize)
          setAdmitHeaderDetailsFontSize(v >= 20 ? '10' : String(v))
        }
        if (s.config?.admitCardSettings?.headingFontSize) {
          const v = Number(s.config.admitCardSettings.headingFontSize)
          setAdmitHeadingFontSize(v > 20 ? '13' : String(v))
        }
        if (s.config?.admitCardSettings?.studentDetailsFontSize) {
          const v = Number(s.config.admitCardSettings.studentDetailsFontSize)
          setAdmitStudentDetailsFontSize(v > 16 ? '11' : String(v))
        }
        if (s.config?.admitCardSettings?.timetableDetailsFontSize) {
          const v = Number(s.config.admitCardSettings.timetableDetailsFontSize)
          setAdmitTimetableDetailsFontSize(v > 16 ? '11' : String(v))
        }
        if (s.config?.admitCardSettings?.defaultFontSize) {
          const v = Number(s.config.admitCardSettings.defaultFontSize)
          setAdmitDefaultFontSize(v > 13 ? '9' : String(v))
        }
        if (s.config?.admitCardSettings?.reportingTimeValue) setAdmitReportingTime(s.config.admitCardSettings.reportingTimeValue)
        if (s.config?.admitCardSettings?.gateClosureValue) setAdmitGateClosureTime(s.config.admitCardSettings.gateClosureValue)
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
        if (s.config?.marksheetDateOfIssue) {
          setMarksheetDateOfIssue(s.config.marksheetDateOfIssue)
          setMarksheetExamDate(s.config.marksheetDateOfIssue)
        } else if (s.config?.marksheetExamDate) {
          setMarksheetDateOfIssue(s.config.marksheetExamDate)
          setMarksheetExamDate(s.config.marksheetExamDate)
        }
        if (s.config?.marksheetHeaderNameFontSize) setMarksheetHeaderNameFontSize(String(s.config.marksheetHeaderNameFontSize))
        if (s.config?.marksheetHeadingFontSize) setMarksheetHeadingFontSize(String(s.config.marksheetHeadingFontSize))
        if (s.config?.marksheetHeaderDetailsFontSize) setMarksheetHeaderDetailsFontSize(String(s.config.marksheetHeaderDetailsFontSize))
        if (s.config?.marksheetQrCodeSize) setMarksheetQrCodeSize(String(s.config.marksheetQrCodeSize))
        if (s.config?.certQrCodeSize) setCertQrCodeSize(String(s.config.certQrCodeSize))
        if (s.config?.marksheetSignatureOrder && Array.isArray(s.config.marksheetSignatureOrder)) {
          const standardKeys = ['teacherSign', 'controllerSign', 'parentSign', 'principalSign']
          const filtered = s.config.marksheetSignatureOrder.filter((k: string) => standardKeys.includes(k))
          const missing = standardKeys.filter((k: string) => !filtered.includes(k))
          setMarksheetSignatureOrder([...filtered, ...missing])
        }
        if (s.config?.marksheetSignatureWidth) setMarksheetSignatureWidth(String(s.config.marksheetSignatureWidth))
        if (s.config?.marksheetSignatureFontSize) setMarksheetSignatureFontSize(String(s.config.marksheetSignatureFontSize))

        if (s.marksGrade) setMarksGrade(s.marksGrade as any)
        if (s.config?.marksGrade) setMarksGrade(s.config.marksGrade as any)
        if (Array.isArray(s.config?.percentRanges) && s.config.percentRanges.length > 0) setPercentRanges(s.config.percentRanges)
        if (Array.isArray(s.config?.gradeRanges) && s.config.gradeRanges.length > 0) setGradeRanges(s.config.gradeRanges)
        if (Array.isArray(s.config?.divisionRanges) && s.config.divisionRanges.length > 0) setDivisionRanges(s.config.divisionRanges)
        if (Array.isArray(s.config?.cgpaRanges) && s.config.cgpaRanges.length > 0) setCgpaRanges(s.config.cgpaRanges)
        if (typeof s.config?.enablePercentRemarks === 'boolean') setEnablePercentRemarks(s.config.enablePercentRemarks)
        if (typeof s.config?.enableGradeRemarks === 'boolean') setEnableGradeRemarks(s.config.enableGradeRemarks)
        if (typeof s.config?.enableDivisionRemarks === 'boolean') setEnableDivisionRemarks(s.config.enableDivisionRemarks)
        if (typeof s.config?.enableCgpa === 'boolean') setEnableCgpa(s.config.enableCgpa)

        const baseClassName = s.config?.className || (s.classGrade ? s.classGrade.split('(')[0].trim() : '')
        const secs = Array.isArray(s.config?.sections) && s.config.sections.length > 0 
          ? s.config.sections.map((sec: string) => normalizeSection(sec))
          : ['Section A', 'Section B', 'Section C']
        const subs = Array.isArray(s.config?.subjects) && s.config.subjects.length > 0
          ? s.config.subjects.map((sub: any, idx: number) => ({
              id: sub.id || (idx + 1),
              subjectName: sub.subjectName || '',
              examDate: formatToDateInput(sub.examDate) || rawExamDate || '',
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
              examDate: rawExamDate || '',
              startTime: '10:00',
              endTime: '13:00',
              fromTime: '10:00',
              toTime: '13:00',
              maxMarks: '100',
              practicalColumn: false,
              practicalMarks: ''
            }]

        let loadedClasses: ClassConfig[] = []
        if (Array.isArray(s.config?.classes) && s.config.classes.length > 0) {
          loadedClasses = s.config.classes.map((c: any, cIdx: number) => ({
            id: c.id || (Date.now() + cIdx),
            className: c.className || '',
            sections: Array.isArray(c.sections) && c.sections.length > 0 
              ? c.sections.map((sec: string) => normalizeSection(sec))
              : ['Section A', 'Section B', 'Section C'],
            subjects: Array.isArray(c.subjects) && c.subjects.length > 0 
              ? c.subjects.map((sub: any) => ({
                  ...sub,
                  examDate: formatToDateInput(sub.examDate) || rawExamDate || ''
                }))
              : subs
          }))
        } else {
          // Fallback parsing if classGrade had multiple classes formatted: e.g. "Class 8 (Sec A), Class 9 (Sec B)"
          const rawClassGrade = s.classGrade || ''
          const chunks = rawClassGrade.includes('),') 
            ? rawClassGrade.split('),').map((c: string) => c.endsWith(')') ? c.trim() : `${c.trim()})`)
            : [rawClassGrade]

          if (chunks.length > 1) {
            loadedClasses = chunks.map((chunk: string, idx: number) => {
              const cName = chunk.split('(')[0].trim()
              const secMatch = chunk.match(/\((.*?)\)/)
              const secList = secMatch
                ? secMatch[1].split(',').map((sec: string) => normalizeSection(sec.trim()))
                : ['Section A', 'Section B']
              return {
                id: Date.now() + idx,
                className: cName,
                sections: secList,
                subjects: subs
              }
            })
          } else {
            loadedClasses = [{
              id: 1,
              className: baseClassName,
              sections: secs,
              subjects: subs
            }]
          }
        }

        setClasses(loadedClasses)

        // Ensure all loaded classes exist in masterClasses so dropdowns select them cleanly!
        setMasterClasses(prev => {
          const existingMap = new Map(prev.map(m => [m.className.toLowerCase(), m]))
          const updated = [...prev]
          for (const c of loadedClasses) {
            if (c.className) {
              const key = c.className.toLowerCase()
              if (!existingMap.has(key)) {
                const newClass = {
                  className: c.className,
                  sections: c.sections && c.sections.length > 0 ? c.sections : ['Section A', 'Section B', 'Section C']
                }
                updated.push(newClass)
                existingMap.set(key, newClass)
              } else {
                const existingClass = existingMap.get(key)!
                existingClass.sections = Array.from(new Set([...existingClass.sections, ...c.sections]))
              }
            }
          }
          return updated
        })
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

  const handleExamDateChange = (val: string) => {
    setDateOfExam(val)
    if (!admitCardDate) {
      setAdmitCardDate(val)
    }
    if (!lastDateToEnter) {
      setLastDateToEnter(val)
    }
    setClasses(prev => prev.map(c => ({
      ...c,
      subjects: c.subjects.map(s => s.examDate ? s : { ...s, examDate: val })
    })))
  }

  // ==================== ADMIT CARD SETTINGS STATE ====================
  const [admitDisplayFields, setAdmitDisplayFields] = useState<{ [key: string]: boolean }>({
    name: true, fatherName: true, motherName: true, mobileNo: false,
    admissionNo: true, registrationNo: true, rollNo: true, enrollmentNo: false,
    dob: true, address: true, class: true, section: true, photo: true, logo: true,
    studentSign: true, teacherSign: true, principalSign: true, parentSign: true,
    schoolStamp: false, qrCode: true, affiliationDetails: true, boardFormat: true,
    verifiedPass: true, centerCode: true, helpline: true, mottoQuote: true,
    gateClosure: true
  })
  const [admitCardStatus, setAdmitCardStatus] = useState(true)
  const [showExamTimeTableOnAdmit, setShowExamTimeTableOnAdmit] = useState(true)
  const [admitInstructions, setAdmitInstructions] = useState(
    '1. Reporting & Gate Closure Time: Candidates must report to the examination center by 09:30 AM IST. Gate closure time is 09:50 AM (Sharp).\n2. Bring this original Admit Card along with Institute Student ID.\n3. Electronic devices, smartwatches, and study materials are strictly prohibited in the exam hall.\n4. Maintain discipline and follow invigilator guidelines at all times.'
  )
  const [admitLabel, setAdmitLabel] = useState('Admit Card')
  const [admitReportingTime, setAdmitReportingTime] = useState('09:30 AM IST')
  const [admitGateClosureTime, setAdmitGateClosureTime] = useState('09:50 AM (Sharp)')
  const [admitNoOfPrintPerPage, setAdmitNoOfPrintPerPage] = useState('1')
  const [admitHeaderNameFontSize, setAdmitHeaderNameFontSize] = useState('22')
  const [admitHeaderDetailsFontSize, setAdmitHeaderDetailsFontSize] = useState('10')
  const [admitStudentDetailsFontSize, setAdmitStudentDetailsFontSize] = useState('11')
  const [admitTimetableDetailsFontSize, setAdmitTimetableDetailsFontSize] = useState('11')
  const [admitHeadingFontSize, setAdmitHeadingFontSize] = useState('13')
  const [admitDefaultFontSize, setAdmitDefaultFontSize] = useState('9')
  const [admitSpacing, setAdmitSpacing] = useState('20')
  const [admitStudentPhotoSize, setAdmitStudentPhotoSize] = useState('88')
  const [admitStudentPhotoWidth, setAdmitStudentPhotoWidth] = useState('88')
  const [admitStudentPhotoHeight, setAdmitStudentPhotoHeight] = useState('110')
  const [admitSchoolLogo, setAdmitSchoolLogo] = useState<string>('')
  const [admitSchoolLogoWidth, setAdmitSchoolLogoWidth] = useState<string>('54')
  const [admitSchoolLogoHeight, setAdmitSchoolLogoHeight] = useState<string>('54')
  const [admitLogoPosition, setAdmitLogoPosition] = useState<'left' | 'center' | 'right'>('left')
  const [admitContentPosition, setAdmitContentPosition] = useState<'left' | 'center' | 'right'>('left')
  const [admitPhotoPosition, setAdmitPhotoPosition] = useState<'left' | 'right'>('right')
  const logoFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const marksheetLogoFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const certLogoFileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [admitTeacherSignLabel, setAdmitTeacherSignLabel] = useState("Class Teacher's Sign.")
  const [admitStudentSignLabel, setAdmitStudentSignLabel] = useState("Student's Sign.")
  const [admitParentSignLabel, setAdmitParentSignLabel] = useState("Parent's Sign.")
  const [admitPrincipalSignLabel, setAdmitPrincipalSignLabel] = useState("Principal's Sign.")
  const [admitSignatureWidth, setAdmitSignatureWidth] = useState('100')
  const [admitSignatureFontSize, setAdmitSignatureFontSize] = useState('9')
  const [admitQrCodeSize, setAdmitQrCodeSize] = useState('72')
  const [marksheetQrCodeSize, setMarksheetQrCodeSize] = useState('72')
  const [certQrCodeSize, setCertQrCodeSize] = useState('72')
  const [admitSizingStudioTab, setAdmitSizingStudioTab] = useState<'media' | 'signs' | 'text'>('media')
  const [marksheetSizingStudioTab, setMarksheetSizingStudioTab] = useState<'media' | 'signs' | 'text'>('media')
  const [admitSchoolStampWidth, setAdmitSchoolStampWidth] = useState('56')
  const [admitSignatureOrder, setAdmitSignatureOrder] = useState<string[]>([
    'studentSign', 'parentSign', 'teacherSign', 'principalSign'
  ])

  const moveSignature = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= admitSignatureOrder.length) return
    const updated = [...admitSignatureOrder]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setAdmitSignatureOrder(updated)
  }

  const [marksheetSignatureWidth, setMarksheetSignatureWidth] = useState('110')
  const [marksheetSignatureFontSize, setMarksheetSignatureFontSize] = useState('10')
  const [marksheetSchoolStampWidth, setMarksheetSchoolStampWidth] = useState('56')
  const [marksheetSignatureOrder, setMarksheetSignatureOrder] = useState<string[]>([
    'teacherSign', 'controllerSign', 'parentSign', 'principalSign'
  ])

  const moveMarksheetSignature = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= marksheetSignatureOrder.length) return
    const updated = [...marksheetSignatureOrder]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setMarksheetSignatureOrder(updated)
  }
  const [admitCustomLabels, setAdmitCustomLabels] = useState<Record<string, string>>({})
  const [marksheetCustomLabels, setMarksheetCustomLabels] = useState<Record<string, string>>({})
  const [marksheetHeaderNameFontSize, setMarksheetHeaderNameFontSize] = useState('22')
  const [marksheetHeadingFontSize, setMarksheetHeadingFontSize] = useState('14')
  const [marksheetHeaderDetailsFontSize, setMarksheetHeaderDetailsFontSize] = useState('11')
  const [marksheetDateOfIssue, setMarksheetDateOfIssue] = useState('25/03/2026')
  const [marksheetExamDate, setMarksheetExamDate] = useState('25/03/2026')

  // Automatically sync Date of Issue from Step 1 Result Date (lastDateToEnter)
  useEffect(() => {
    if (lastDateToEnter) {
      const formatted = formatDisplayDate(lastDateToEnter)
      if (formatted) {
        setMarksheetDateOfIssue(formatted)
        setMarksheetExamDate(formatted)
      }
    }
  }, [lastDateToEnter])

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
    else if (field === 'dateOfIssue' || field === 'examDate') {
      setMarksheetDateOfIssue(value)
      setMarksheetExamDate(value)
    }
    else if (field === 'headerNameFontSize') setMarksheetHeaderNameFontSize(String(value))
    else if (field === 'headingFontSize') setMarksheetHeadingFontSize(String(value))
    else if (field === 'headerDetailsFontSize') setMarksheetHeaderDetailsFontSize(String(value))
    else if (field === 'logoWidth') setLogoWidth(String(value))
    else if (field === 'qrCodeSize') setMarksheetQrCodeSize(String(value))
    else if (field === 'signatureWidth') setMarksheetSignatureWidth(String(value))
    else if (field === 'signatureFontSize') setMarksheetSignatureFontSize(String(value))
    else if (field === 'signatureOrder') setMarksheetSignatureOrder(value)
    else if (field === 'triggerLogoUpload') {
      marksheetLogoFileInputRef.current?.click()
    }
    else if (field === 'customLabels') {
      setMarksheetCustomLabels(prev => ({ ...prev, ...value }))
    }
  }

  const handleAdmitCardFieldUpdate = (field: string, value: any) => {
    if (field === 'schoolName') setSchoolName(value)
    else if (field === 'schoolAddress') setSchoolAddress(value)
    else if (field === 'admitCardLabel') setAdmitLabel(value)
    else if (field === 'reportingTimeValue') {
      setAdmitReportingTime(value)
      setAdmitInstructions(prev => applyReportingTimeToInstructions(prev, value, admitGateClosureTime))
    }
    else if (field === 'gateClosureValue') {
      setAdmitGateClosureTime(value)
      setAdmitInstructions(prev => applyReportingTimeToInstructions(prev, admitReportingTime, value))
    }
    else if (field === 'examName') setExamName(value)
    else if (field === 'session') setSession(value)
    else if (field === 'instructions') setAdmitInstructions(value)
    else if (field === 'principalSignLabel') setAdmitPrincipalSignLabel(value)
    else if (field === 'teacherSignLabel') setAdmitTeacherSignLabel(value)
    else if (field === 'studentSignLabel') setAdmitStudentSignLabel(value)
    else if (field === 'parentSignLabel') setAdmitParentSignLabel(value)
    else if (field === 'principalName') setPrincipalName(value)
    else if (field === 'triggerLogoUpload') {
      logoFileInputRef.current?.click()
    }
    else if (field === 'logoPosition') setAdmitLogoPosition(value)
    else if (field === 'contentPosition') setAdmitContentPosition(value)
    else if (field === 'photoPosition') setAdmitPhotoPosition(value)
    else if (field === 'schoolLogoWidth') setAdmitSchoolLogoWidth(String(value))
    else if (field === 'schoolLogoHeight') setAdmitSchoolLogoHeight(String(value))
    else if (field === 'qrCodeSize') setAdmitQrCodeSize(String(value))
    else if (field === 'signatureWidth') setAdmitSignatureWidth(String(value))
    else if (field === 'signatureFontSize') setAdmitSignatureFontSize(String(value))
    else if (field === 'schoolStampWidth') setAdmitSchoolStampWidth(String(value))
    else if (field === 'headerNameFontSize') setAdmitHeaderNameFontSize(String(value))
    else if (field === 'headerDetailsFontSize') setAdmitHeaderDetailsFontSize(String(value))
    else if (field === 'headingFontSize') setAdmitHeadingFontSize(String(value))
    else if (field === 'studentDetailsFontSize') setAdmitStudentDetailsFontSize(String(value))
    else if (field === 'timetableDetailsFontSize') setAdmitTimetableDetailsFontSize(String(value))
    else if (field === 'defaultFontSize') setAdmitDefaultFontSize(String(value))
    else if (field === 'customLabels') {
      setAdmitCustomLabels(prev => ({ ...prev, ...value }))
    }
  }

  const availableAdmitFields = useMemo(() => {
    return getSupportedFieldsForTemplate(admitTemplateStyle)
  }, [admitTemplateStyle])

  const handleAdmitCheckboxChange = (key: string) => {
    setAdmitDisplayFields(prev => ({ ...prev, [key]: prev[key] === false ? true : false }))
  }
  const handleAdmitSelectAllChange = (checked: boolean) => {
    const updated: { [key: string]: boolean } = { ...admitDisplayFields }
    availableAdmitFields.forEach(f => { updated[f.key] = checked })
    setAdmitDisplayFields(updated)
  }
  const isAdmitAllSelected = availableAdmitFields.length > 0 && availableAdmitFields.every(f => admitDisplayFields[f.key] !== false)

  // Marksheet Columns & Display Fields State
  const [columnsList, setColumnsList] = useState({
    schoolAffiliation: true,
    rollNumber: true, motherName: true, fatherName: true, admissionNo: true,
    mobileNumber: false, classSection: true, gender: true, dob: true,
    examName: true, obtMarks: true, totalMarks: true,
    percentage: true, cgpa: true, division: true, grade: true, remarks: true, rank: true,
    result: true, teacherSign: true, controllerSign: true, principalSign: true,
    attendance: true, dateOfIssue: true, parentSign: true,
    logo: true, qrCode: true
  })

  const handleMarksheetCheckboxChange = (key: string) => {
    setColumnsList(prev => ({ ...prev, [key]: !(prev as any)[key] }))
  }
  const handleMarksheetSelectAllChange = (checked: boolean) => {
    setColumnsList(prev => {
      const next: Record<string, boolean> = { 
        ...prev, 
        obtMarks: true, 
        totalMarks: true,
        percentage: enablePercentRemarks,
        grade: enableGradeRemarks,
        division: enableDivisionRemarks,
        cgpa: enableCgpa
      }
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
    // Find next unchosen class from masterClasses
    const usedClassNames = new Set(classes.map(c => c.className.toLowerCase()).filter(Boolean))
    const nextAvailable = masterClasses.find(m => !usedClassNames.has(m.className.toLowerCase()))
    const nextClassName = nextAvailable ? nextAvailable.className : (masterClasses[0]?.className || '')
    const nextSections = nextAvailable 
      ? [...nextAvailable.sections] 
      : (masterClasses[0]?.sections || ['Section A', 'Section B', 'Section C'])

    // Pre-populate with previous class's subject schedule if available so subjects don't have to be re-entered from scratch
    const prevClassSubjects = classes[classes.length - 1]?.subjects
    const hasConfiguredSubjects = prevClassSubjects && prevClassSubjects.length > 0 && prevClassSubjects.some(s => s.subjectName)
    
    const initialSubjects = hasConfiguredSubjects
      ? prevClassSubjects.map((s, idx) => ({
          ...s,
          id: Date.now() + idx + 1,
          examDate: formatToDateInput(s.examDate) || dateOfExam || ''
        }))
      : [{
          id: Date.now() + 1,
          subjectName: '',
          examDate: dateOfExam || '',
          startTime: '10:00',
          endTime: '13:00',
          fromTime: '10:00',
          toTime: '13:00',
          maxMarks: '100',
          practicalColumn: false,
          practicalMarks: ''
        }]

    setClasses(prev => [
      ...prev,
      {
        id: Date.now(),
        className: nextClassName,
        sections: nextSections.map(s => normalizeSection(s)),
        subjects: initialSubjects
      }
    ])
  }

  const handleRemoveClass = (classId: number) => {
    if (classes.length <= 1) return
    setClasses(prev => prev.filter(c => c.id !== classId))
  }

  const handleClassChange = (classId: number, name: string) => {
    const found = masterClasses.find(m => m.className.toLowerCase() === name.toLowerCase())
    const defaultSecs = found ? found.sections : ['Section A', 'Section B', 'Section C']
    setClasses(prev => prev.map(c => c.id === classId ? {
      ...c,
      className: name,
      sections: defaultSecs.map(s => normalizeSection(s))
    } : c))
  }

  const handleToggleSection = (classId: number, sec: string) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const normSec = normalizeSection(sec).toLowerCase()
        const isPresent = c.sections.some(s => normalizeSection(s).toLowerCase() === normSec)
        const updated = isPresent
          ? c.sections.filter(s => normalizeSection(s).toLowerCase() !== normSec)
          : [...c.sections, normalizeSection(sec)]
        return { ...c, sections: updated }
      }
      return c
    }))
  }

  const handleSelectAllSections = (classId: number, allSecs: string[]) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const allPresent = allSecs.length > 0 && allSecs.every(sec => 
          c.sections.some(s => normalizeSection(s).toLowerCase() === normalizeSection(sec).toLowerCase())
        )
        return { ...c, sections: allPresent ? [] : allSecs.map(s => normalizeSection(s)) }
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
        const defaultExamDate = formatToDateInput(lastSub?.examDate) || dateOfExam || ''
        return {
          ...c,
          subjects: [
            ...c.subjects,
            { 
              id: Date.now(), 
              subjectName: '', 
              examDate: defaultExamDate, 
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

              // Auto-calculation logic for Theory + Practical = Max Marks
              if (field === 'practicalColumn') {
                if (val) {
                  const currentMax = parseFloat(s.maxMarks || '100') || 100
                  const pr = s.practicalMarks && parseFloat(s.practicalMarks) > 0 
                    ? parseFloat(s.practicalMarks) 
                    : (currentMax >= 100 ? 30 : 20)
                  const th = s.theoryMarks && parseFloat(s.theoryMarks) > 0 
                    ? parseFloat(s.theoryMarks) 
                    : (currentMax - pr > 0 ? currentMax - pr : 70)
                  updated.practicalMarks = String(pr)
                  updated.theoryMarks = String(th)
                  updated.maxMarks = String(th + pr)
                } else {
                  updated.practicalMarks = ''
                  updated.maxMarks = updated.theoryMarks || s.maxMarks || '100'
                }
              }

              if (field === 'theoryMarks') {
                if (updated.practicalColumn) {
                  const th = parseFloat(val || '0') || 0
                  const pr = parseFloat(updated.practicalMarks || '0') || 0
                  updated.maxMarks = String(th + pr)
                } else {
                  updated.maxMarks = val
                }
              }

              if (field === 'practicalMarks') {
                if (updated.practicalColumn) {
                  const th = parseFloat(updated.theoryMarks || '0') || 0
                  const pr = parseFloat(val || '0') || 0
                  updated.maxMarks = String(th + pr)
                }
              }

              if (field === 'maxMarks') {
                if (!updated.practicalColumn) {
                  updated.theoryMarks = val
                }
              }

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
  const [marksGrade, setMarksGrade] = useState<'Percentage' | 'CGPA' | 'Grade' | 'Percentage & CGPA'>('Percentage')

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
    { range: '33-59', div: '3rd' },
    { range: '0-33', div: 'Failed' }
  ])

  // ON / OFF toggle state for Step 2 range schemes (default ON for top 3, toggleable for CGPA)
  const [enablePercentRemarks, setEnablePercentRemarks] = useState(true)
  const [enableGradeRemarks, setEnableGradeRemarks] = useState(true)
  const [enableDivisionRemarks, setEnableDivisionRemarks] = useState(true)
  const [enableCgpa, setEnableCgpa] = useState(false)

  const [cgpaRanges, setCgpaRanges] = useState([
    { range: '91-100', cgpa: '10.0' },
    { range: '81-90', cgpa: '9.0' },
    { range: '71-80', cgpa: '8.0' },
    { range: '61-70', cgpa: '7.0' },
    { range: '51-60', cgpa: '6.0' },
    { range: '41-50', cgpa: '5.0' },
    { range: '33-40', cgpa: '4.0' },
    { range: '00-32', cgpa: '0.0' }
  ])

  const [expandedSection, setExpandedSection] = useState<'percent' | 'grade' | 'division' | 'cgpa' | null>('percent')

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
  const [certTitle, setCertTitle] = useState('CERTIFICATE OF ACHIEVEMENT')
  const [certSubtitle, setCertSubtitle] = useState('IN RECOGNITION OF ACADEMIC EXCELLENCE')
  const [certPresentedTo, setCertPresentedTo] = useState('THIS CERTIFICATE IS PROUDLY PRESENTED TO')
  const [certDescription, setCertDescription] = useState('This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement during the academic session.')
  const [certDateOfIssue, setCertDateOfIssue] = useState('15 October 2026')
  const [certSchoolNameFontSize, setCertSchoolNameFontSize] = useState('14')
  const [certTitleFontSize, setCertTitleFontSize] = useState('30')
  const [certSubtitleFontSize, setCertSubtitleFontSize] = useState('11')
  const [certSignatureWidth, setCertSignatureWidth] = useState('110')
  const [certSignatureFontSize, setCertSignatureFontSize] = useState('8')
  const [certPhotoWidth, setCertPhotoWidth] = useState('48')
  const [certPhotoHeight, setCertPhotoHeight] = useState('60')
  const [certSchoolStampWidth, setCertSchoolStampWidth] = useState('72')
  const [certSizingStudioTab, setCertSizingStudioTab] = useState<'media' | 'signs' | 'text'>('media')
  const [certSignatureOrder, setCertSignatureOrder] = useState<string[]>([
    'teacherSign',
    'controllerSign',
    'secondarySign',
    'parentSign',
    'studentSign',
    'principalSign'
  ])

  const moveCertSignature = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= certSignatureOrder.length) return
    const updated = [...certSignatureOrder]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setCertSignatureOrder(updated)
  }
  const [certDisplayFields, setCertDisplayFields] = useState<Record<string, boolean>>({
    schoolName: true,
    logo: true,
    title: true,
    subtitle: true,
    presentedTo: true,
    studentName: true,
    fatherName: true,
    motherName: true,
    rollNo: true,
    admissionNo: true,
    classSection: true,
    dob: true,
    gender: true,
    studentPhoto: true,
    examName: true,
    session: true,
    description: true,
    dateOfIssue: true,
    principalSign: true,
    teacherSign: true,
    controllerSign: true,
    secondarySign: true,
    parentSign: false, // Default false: any 4 signatures can be active
    studentSign: false, // Default false: any 4 signatures can be active
    officialSeal: true,
    qrCode: true,
    watermark: true,
  })

  // Signatures & Authority State
  const [certPrincipalSignLabel, setCertPrincipalSignLabel] = useState('Principal & Director')
  const [certPrincipalName, setCertPrincipalName] = useState('')
  const [certTeacherSignLabel, setCertTeacherSignLabel] = useState("Class Teacher's Sign")
  const [certTeacherSignName, setCertTeacherSignName] = useState('Mrs. Kavita Verma')
  const [certControllerSignLabel, setCertControllerSignLabel] = useState('Exam Controller')
  const [certControllerSignName, setCertControllerSignName] = useState('Mr. R. K. Saxena')
  const [certSecondarySignLabel, setCertSecondarySignLabel] = useState('Authority Signature')
  const [certSecondarySignName, setCertSecondarySignName] = useState('Authorized Signatory')
  const [certParentSignLabel, setCertParentSignLabel] = useState("Parent's Signature")
  const [certParentSignName, setCertParentSignName] = useState('Parent / Guardian')
  const [certStudentSignLabel, setCertStudentSignLabel] = useState("Student's Signature")
  const [certSealLabel, setCertSealLabel] = useState('ACADEMIC EXCELLENCE')
  const [certDateLabel, setCertDateLabel] = useState('Date of Issue')
  const [certCustomLabelsState, setCertCustomLabelsState] = useState<Record<string, string>>({})

  const handleCertCheckboxChange = (key: string) => {
    const signatureKeys = ['principalSign', 'teacherSign', 'controllerSign', 'secondarySign', 'parentSign', 'studentSign']
    if (signatureKeys.includes(key) && !certDisplayFields[key]) {
      const activeCount = signatureKeys.filter(k => !!certDisplayFields[k]).length
      if (activeCount >= 4) {
        toast.error('Only any 4 signatures can be active on the certificate at a time. Please turn OFF one signature first.')
        return
      }
    }
    setCertDisplayFields(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCertSelectAllChange = (checked: boolean) => {
    setCertDisplayFields(prev => {
      const updated: Record<string, boolean> = { ...prev, logo: true }
      CERTIFICATE_DISPLAY_FIELDS_KEYS.forEach(f => {
        updated[f.key] = checked
      })
      return updated
    })
  }

  const handleCertCategoryToggle = (category: 'student' | 'institutional', checked: boolean) => {
    setCertDisplayFields(prev => {
      const updated: Record<string, boolean> = { ...prev }
      CERTIFICATE_DISPLAY_FIELDS_KEYS.filter(f => f.category === category).forEach(f => {
        updated[f.key] = checked
      })
      return updated
    })
  }

  const isCertAllSelected = CERTIFICATE_DISPLAY_FIELDS_KEYS.every(f => !!certDisplayFields[f.key])

  const certHiddenFields = useMemo(() => {
    const hidden: string[] = []
    if (!certDisplayFields.schoolName) hidden.push('School Name')
    if (certDisplayFields.logo === false) {
      hidden.push('Logo')
      hidden.push('Institute Logo')
    }
    if (!certDisplayFields.title) hidden.push('Title')
    if (!certDisplayFields.subtitle) hidden.push('Subtitle')
    if (!certDisplayFields.presentedTo) hidden.push('Presented To')
    if (!certDisplayFields.studentName) hidden.push('Student Name')
    if (!certDisplayFields.fatherName) hidden.push('Father Name')
    if (!certDisplayFields.motherName) hidden.push('Mother Name')
    if (!certDisplayFields.rollNo) hidden.push('Roll No')
    if (!certDisplayFields.admissionNo) hidden.push('Admission No')
    if (!certDisplayFields.classSection) {
      hidden.push('Class')
      hidden.push('Section')
      hidden.push('Class & Section')
    }
    if (!certDisplayFields.dob) hidden.push('Date of Birth')
    if (!certDisplayFields.gender) hidden.push('Gender')
    if (!certDisplayFields.studentPhoto) {
      hidden.push('Student Photo')
      hidden.push('Photo')
    }
    if (!certDisplayFields.examName) hidden.push('Exam Name')
    if (!certDisplayFields.session) hidden.push('Academic Session')
    if (!certDisplayFields.description) hidden.push('Description')
    if (!certDisplayFields.dateOfIssue) {
      hidden.push('Certificate Date')
      hidden.push('Date of Issue')
    }
    if (!certDisplayFields.principalSign) hidden.push('Principal Sign')
    if (!certDisplayFields.teacherSign) hidden.push('Teacher Sign')
    if (!certDisplayFields.controllerSign) hidden.push('Controller Sign')
    if (!certDisplayFields.secondarySign) hidden.push('Secondary Sign')
    if (!certDisplayFields.parentSign) hidden.push('Parent Sign')
    if (!certDisplayFields.studentSign) hidden.push('Student Sign')
    if (!certDisplayFields.officialSeal) {
      hidden.push('Official Seal')
      hidden.push('Seal')
      hidden.push('School Stamp')
    }
    if (!certDisplayFields.qrCode) hidden.push('QR Code')
    if (!certDisplayFields.watermark) hidden.push('Water Mark')
    return hidden
  }, [certDisplayFields])

  const certCustomLabels = useMemo(() => {
    return {
      ...certCustomLabelsState,
      presented_to: certPresentedTo || 'THIS CERTIFICATE IS PROUDLY PRESENTED TO',
      seal_label: certSealLabel || 'ACADEMIC EXCELLENCE',
      date_label: certDateLabel || 'Date of Issue',
      principalSignLabel: certPrincipalSignLabel || 'Principal & Director',
      teacherSignLabel: certTeacherSignLabel || "Class Teacher's Sign",
      teacherSignName: certTeacherSignName || 'Mrs. Kavita Verma',
      controllerSignLabel: certControllerSignLabel || 'Exam Controller',
      controllerSignName: certControllerSignName || 'Mr. R. K. Saxena',
      secondarySignName: certSecondarySignName || 'Authorized Signatory',
      secondarySignLabel: certSecondarySignLabel || 'Authority Signature',
      parentSignLabel: certParentSignLabel || "Parent's Signature",
      parentSignName: certParentSignName || 'Parent / Guardian',
      studentSignLabel: certStudentSignLabel || "Student's Signature",
    }
  }, [
    certCustomLabelsState,
    certPresentedTo,
    certSealLabel,
    certDateLabel,
    certPrincipalSignLabel,
    certTeacherSignLabel,
    certTeacherSignName,
    certControllerSignLabel,
    certControllerSignName,
    certSecondarySignName,
    certSecondarySignLabel,
    certParentSignLabel,
    certParentSignName,
    certStudentSignLabel
  ])


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
      // Build a unified classGrade string combining all configured classes and sections
      const combinedClassGrade = classes
        .filter(c => c.className)
        .map(c => {
          const secStr = c.sections && c.sections.length > 0
            ? ` (${c.sections.map(s => s.replace('Section ', 'Sec ')).join(', ')})`
            : ''
          return `${c.className}${secStr}`
        })
        .join(', ')

        const singleSetup = {
        id: editingId || undefined,
        groupName: groupName || 'Quarterly',
        examName: examName.trim(),
        classGrade: combinedClassGrade || (classes[0]?.className || 'All Classes'),
        marksGrade: marksGrade || 'Percentage',
        templateName: selectedTemplate,
        session: session,
        examDate: dateOfExam || classes[0]?.subjects?.[0]?.examDate || undefined,
        admitCardDate: admitCardDate || dateOfExam || undefined,
        lockExam: lockExam,
        lastDateToEnter: lastDateToEnter || undefined,
        config: {
          classes: classes,
          className: classes.map(c => c.className).filter(Boolean).join(', '),
          sections: Array.from(new Set(classes.flatMap(c => c.sections || []))),
          subjects: classes[0]?.subjects || [],
          templateName: selectedTemplate,
          examDate: dateOfExam,
          admitCardDate: admitCardDate || dateOfExam,
          resultDate: lastDateToEnter,
          lastDateToEnter: lastDateToEnter,
          marksheetThemeColor: marksheetThemeColor,
          admitTemplateStyle: admitTemplateStyle,
          admitThemeColor: admitThemeColor,
          marksGrade,
          enablePercentRemarks,
          enableGradeRemarks,
          enableDivisionRemarks,
          enableCgpa,
          percentRanges: enablePercentRemarks ? percentRanges : [],
          gradeRanges: enableGradeRemarks ? gradeRanges : [],
          divisionRanges: enableDivisionRemarks ? divisionRanges : [],
          cgpaRanges: enableCgpa ? cgpaRanges : [],
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
          marksheetDateOfIssue,
          marksheetExamDate,
          marksheetHeaderNameFontSize,
          marksheetHeadingFontSize,
          marksheetHeaderDetailsFontSize,
          marksheetQrCodeSize,
          certQrCodeSize,
          marksheetSignatureOrder,
          marksheetSignatureWidth,
          marksheetSignatureFontSize,
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
          certTitle,
          certSubtitle,
          certPresentedTo,
          certDescription,
          certDisplayFields,
          certPrincipalSignLabel,
          certPrincipalName,
          certTeacherSignLabel,
          certTeacherSignName,
          certControllerSignLabel,
          certControllerSignName,
          certSecondarySignLabel,
          certSecondarySignName,
          certParentSignLabel,
          certParentSignName,
          certStudentSignLabel,
          certSealLabel,
          certDateLabel,
          certDateOfIssue,
          certSchoolNameFontSize,
          certTitleFontSize,
          certSubtitleFontSize,
          certSignatureWidth,
          certSignatureFontSize,
          certSignatureOrder,
          certPhotoWidth,
          certPhotoHeight,
          certSchoolStampWidth,
          marksheetSchoolStampWidth,
          certCustomLabels: certCustomLabelsState,
          lockClasses,
          admitCardSettings: {
            admitLabel,
            reportingTimeValue: admitReportingTime,
            gateClosureValue: admitGateClosureTime,
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
            studentPhotoSize: admitStudentPhotoWidth,
            studentPhotoWidth: admitStudentPhotoWidth,
            studentPhotoHeight: admitStudentPhotoHeight,
            teacherSignLabel: admitTeacherSignLabel,
            studentSignLabel: admitStudentSignLabel,
            parentSignLabel: admitParentSignLabel,
            principalSignLabel: admitPrincipalSignLabel,
            signatureWidth: admitSignatureWidth,
            signatureFontSize: admitSignatureFontSize,
            schoolStampWidth: admitSchoolStampWidth,
            qrCodeSize: admitQrCodeSize,
            schoolLogo: admitSchoolLogo,
            schoolLogoWidth: admitSchoolLogoWidth,
            schoolLogoHeight: admitSchoolLogoHeight || admitSchoolLogoWidth,
            logoPosition: admitLogoPosition,
            contentPosition: admitContentPosition,
            photoPosition: admitPhotoPosition,
            signatureOrder: admitSignatureOrder,
            customLabels: admitCustomLabels
          }
        }
      }

      const res = await saveMarksheetSetup(singleSetup)
      if (res && res.success && res.data) {
        const savedId = res.data.id || editingId || undefined
        try {
          generateAdmitCardAndTimetableForSetup({ ...singleSetup, id: savedId })
        } catch (e) {
          console.error('Error generating simultaneous admit card:', e)
        }

        toast.success(editingId ? 'Exam Setup & Admit Card updated successfully!' : 'Exam Setup created successfully as a single setup!')
        router.push('/institute/exam-marksheet/setup')
      } else {
        toast.error(res?.error || 'Failed to save setup')
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
            onClick={handleSaveSetup}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
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
            className="absolute top-1/2 left-4 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-300"
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
                  isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-500/20' :
                  isCompleted ? 'bg-blue-100 border-blue-500 text-blue-600 font-bold' :
                  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-blue-400'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
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
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
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
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> New Group
                    </button>
                  </div>
                  <select 
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500 font-bold text-slate-800 dark:text-slate-100 shadow-xs"
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
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500 font-bold text-slate-800 dark:text-slate-100 shadow-xs placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ==================== 2. CLASS, SECTIONS & SUBJECT SCHEDULE ==================== */}
            <div className="bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
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
                      type="button"
                      onClick={() => handleRemoveClass(cls.id)}
                      className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors cursor-pointer"
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
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500 font-bold text-slate-800 dark:text-slate-100 shadow-xs cursor-pointer"
                        required
                      >
                        <option value="">-- Choose Added Class --</option>
                        {/* Always include cls.className option if not in masterClasses */}
                        {cls.className && !masterClasses.some(m => m.className.toLowerCase() === cls.className.toLowerCase()) && (
                          <option value={cls.className}>
                            {cls.className} ({cls.sections?.length || 1} Sections)
                          </option>
                        )}
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
                        const currentClassObj = masterClasses.find(m => m.className.toLowerCase() === cls.className.toLowerCase())
                        const availableSecs = (currentClassObj?.sections && currentClassObj.sections.length > 0 
                          ? currentClassObj.sections 
                          : (cls.sections && cls.sections.length > 0 ? cls.sections : ['Section A', 'Section B', 'Section C'])
                        ).map(s => normalizeSection(s))
                        
                        const allSelected = availableSecs.length > 0 && availableSecs.every(sec => 
                          cls.sections.some(s => normalizeSection(s).toLowerCase() === normalizeSection(sec).toLowerCase())
                        )

                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <span>Applicable Sections (Multi-Select)</span>
                                <span className="text-red-500">*</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  {cls.sections.length} Selected
                                </span>
                              </label>

                              <button
                                type="button"
                                onClick={() => handleSelectAllSections(cls.id, availableSecs)}
                                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                {allSelected ? 'Deselect All' : 'Select All Sections'}
                              </button>
                            </div>

                            {/* Section Multi-Select Badges */}
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {availableSecs.map(sec => {
                                const isChecked = cls.sections.some(s => normalizeSection(s).toLowerCase() === normalizeSection(sec).toLowerCase())
                                return (
                                  <button
                                    key={sec}
                                    type="button"
                                    onClick={() => handleToggleSection(cls.id, sec)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-xs cursor-pointer ${
                                      isChecked 
                                        ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500/20' 
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50'
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
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold bg-white dark:bg-slate-900"
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
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900"
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
                              className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900"
                            />
                            <input 
                              type="time"
                              value={sub.endTime || sub.toTime || ''}
                              onChange={e => handleSubjectChange(cls.id, sub.id, 'endTime', e.target.value)}
                              title="End Time (To)"
                              className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900"
                            />
                          </div>
                        </div>

                        {/* 4. Practical Toggle */}
                        <div className="flex flex-col gap-1.5 lg:col-span-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Practical</label>
                          <div className="h-[38px] flex items-center">
                            <button 
                              type="button"
                              onClick={() => handleSubjectChange(cls.id, sub.id, 'practicalColumn', !sub.practicalColumn)}
                              className={`w-9 h-5 rounded-full relative transition-colors ${
                                sub.practicalColumn ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                              title={sub.practicalColumn ? 'Practical Enabled (Theory + Practical)' : 'Practical Disabled (Theory Only)'}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                                sub.practicalColumn ? 'left-4.5' : 'left-0.5'
                              }`}></div>
                            </button>
                          </div>
                        </div>

                        {/* 5. Marks Configuration: If practical is NOT on -> show only Theory (Max Marks); if practical is ON -> show Theory, Practical, Auto Max Marks */}
                        {!sub.practicalColumn ? (
                          <div className="flex flex-col gap-1.5 lg:col-span-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Theory Marks (Max) *</label>
                            <input 
                              type="number" 
                              placeholder="100"
                              value={sub.theoryMarks || sub.maxMarks || '100'}
                              onChange={e => handleSubjectChange(cls.id, sub.id, 'theoryMarks', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 font-bold text-center bg-white dark:bg-slate-900"
                            />
                          </div>
                        ) : (
                          <>
                            {/* Theory Marks */}
                            <div className="flex flex-col gap-1.5 lg:col-span-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate" title="Theory Marks">Theory *</label>
                              <input 
                                type="number" 
                                placeholder="70"
                                value={sub.theoryMarks ?? ''}
                                onChange={e => handleSubjectChange(cls.id, sub.id, 'theoryMarks', e.target.value)}
                                className="w-full px-2 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 font-bold text-center bg-white dark:bg-slate-900"
                              />
                            </div>

                            {/* Practical Marks */}
                            <div className="flex flex-col gap-1.5 lg:col-span-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate" title="Practical Marks">Practical *</label>
                              <input 
                                type="number" 
                                placeholder="30"
                                value={sub.practicalMarks ?? ''}
                                onChange={e => handleSubjectChange(cls.id, sub.id, 'practicalMarks', e.target.value)}
                                className="w-full px-2 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 font-bold text-center bg-white dark:bg-slate-900"
                              />
                            </div>

                            {/* Auto Calculated Max Marks */}
                            <div className="flex flex-col gap-1.5 lg:col-span-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider truncate" title="Auto Max Marks">
                                  Max Marks
                                </label>
                              </div>
                              <input 
                                type="text" 
                                readOnly
                                value={sub.maxMarks || '100'}
                                className="w-full px-1.5 py-2 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-black text-center bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 cursor-not-allowed select-none shadow-2xs"
                                title="Auto Calculated (Theory + Practical)"
                              />
                            </div>
                          </>
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
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-100 transition-colors"
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
                className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-blue-600 text-blue-600 rounded-2xl hover:bg-blue-50/50 transition-colors text-xs font-bold"
              >
                <Plus className="w-4 h-4" /> Add Class
              </button>
            </div>
          </div>
            
          {/* ==================== 3. EXAM TIMELINE & ENTRY DEADLINES ==================== */}
          <div className="bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    Exam Timeline & Result Deadlines
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configure official schedule release dates, admit card availability, and result announcement date
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 1. Exam Notification Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Exam Notification Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date"
                  value={dateOfExam}
                  onChange={e => handleExamDateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500 font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
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
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500 font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
                  required
                />
                <span className="text-[10px] text-slate-400">Date hall tickets are available</span>
              </div>

              {/* 3. Result Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Result Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  value={lastDateToEnter}
                  onChange={e => setLastDateToEnter(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500 font-semibold text-slate-700 dark:text-slate-200 shadow-xs"
                />
                <span className="text-[10px] text-slate-400">Official result declaration date</span>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ================================== STEP 2: MARKS & GRADE RANGE ================================== */}
        {currentStep === 'Marks & Grade Range' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    Step 2 of 5
                  </span>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Configure Grading Ranges & Remarks
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Define percentage remarks, subject grades, division rules, and CGPA score mappings for marksheet generation.
                </p>
              </div>

              {/* Evaluation Scheme Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 px-2 uppercase tracking-wider">Scheme:</span>
                {(['Percentage', 'CGPA', 'Grade', 'Percentage & CGPA'] as const).map(scheme => (
                  <button
                    key={scheme}
                    type="button"
                    onClick={() => setMarksGrade(scheme)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      marksGrade === scheme
                        ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {scheme}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel 1: Percentage Remarks Range */}
            <div className={`border rounded-2xl overflow-hidden shadow-sm transition-all ${
              enablePercentRemarks 
                ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900' 
                : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
            }`}>
              <div className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <div 
                  onClick={() => enablePercentRemarks && setExpandedSection(expandedSection === 'percent' ? null : 'percent')}
                  className="flex items-center gap-2.5 cursor-pointer select-none flex-1"
                >
                  <span className={`text-xs font-black uppercase tracking-wide ${
                    enablePercentRemarks ? 'text-[#1b3a60] dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    Percentage Remarks Range
                  </span>
                  {enablePercentRemarks && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {percentRanges.length} rules
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* ON / OFF Toggle */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      enablePercentRemarks ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400'
                    }`}>
                      {enablePercentRemarks ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const next = !enablePercentRemarks
                        setEnablePercentRemarks(next)
                        if (next) setExpandedSection('percent')
                        else if (expandedSection === 'percent') setExpandedSection(null)
                      }}
                      className={`w-9 h-5 rounded-full relative transition-colors ${
                        enablePercentRemarks ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      title={enablePercentRemarks ? 'Turn OFF Percentage Remarks' : 'Turn ON Percentage Remarks'}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                        enablePercentRemarks ? 'left-4.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  {enablePercentRemarks && (
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === 'percent' ? null : 'percent')}
                      className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                    >
                      {expandedSection === 'percent' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {enablePercentRemarks && expandedSection === 'percent' && (
                <div className="p-6 space-y-4 animate-in slide-in-from-top-1 duration-200 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-4 font-bold text-xs text-slate-500 dark:text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span>Range (e.g. 85-100)</span>
                    <span>Remarks (e.g. Excellent)</span>
                    <span className="w-8"></span>
                  </div>
                  {percentRanges.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
                      <input 
                        type="text" 
                        value={item.range} 
                        onChange={e => {
                          const updated = [...percentRanges]
                          updated[idx].range = e.target.value
                          setPercentRanges(updated)
                        }}
                        placeholder="85-100"
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold text-slate-800 dark:text-slate-100"
                      />
                      <input 
                        type="text" 
                        value={item.remark} 
                        onChange={e => {
                          const updated = [...percentRanges]
                          updated[idx].remark = e.target.value
                          setPercentRanges(updated)
                        }}
                        placeholder="Remark"
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold text-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (percentRanges.length > 1) {
                            setPercentRanges(percentRanges.filter((_, i) => i !== idx))
                          }
                        }}
                        title="Delete rule"
                        disabled={percentRanges.length <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setPercentRanges([...percentRanges, { range: '', remark: '' }])}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Remark Range
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Panel 2: Subject Grade Range */}
            <div className={`border rounded-2xl overflow-hidden shadow-sm transition-all ${
              enableGradeRemarks 
                ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900' 
                : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
            }`}>
              <div className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <div 
                  onClick={() => enableGradeRemarks && setExpandedSection(expandedSection === 'grade' ? null : 'grade')}
                  className="flex items-center gap-2.5 cursor-pointer select-none flex-1"
                >
                  <span className={`text-xs font-black uppercase tracking-wide ${
                    enableGradeRemarks ? 'text-[#1b3a60] dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    Subject Grade Range
                  </span>
                  {enableGradeRemarks && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {gradeRanges.length} rules
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* ON / OFF Toggle */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      enableGradeRemarks ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400'
                    }`}>
                      {enableGradeRemarks ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const next = !enableGradeRemarks
                        setEnableGradeRemarks(next)
                        if (next) setExpandedSection('grade')
                        else if (expandedSection === 'grade') setExpandedSection(null)
                      }}
                      className={`w-9 h-5 rounded-full relative transition-colors ${
                        enableGradeRemarks ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      title={enableGradeRemarks ? 'Turn OFF Subject Grade Range' : 'Turn ON Subject Grade Range'}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                        enableGradeRemarks ? 'left-4.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  {enableGradeRemarks && (
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === 'grade' ? null : 'grade')}
                      className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                    >
                      {expandedSection === 'grade' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {enableGradeRemarks && expandedSection === 'grade' && (
                <div className="p-6 space-y-4 animate-in slide-in-from-top-1 duration-200 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-4 font-bold text-xs text-slate-500 dark:text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span>Range (e.g. 91-100)</span>
                    <span>Grade (e.g. A+)</span>
                    <span className="w-8"></span>
                  </div>
                  {gradeRanges.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
                      <input 
                        type="text" 
                        value={item.range} 
                        onChange={e => {
                          const updated = [...gradeRanges]
                          updated[idx].range = e.target.value
                          setGradeRanges(updated)
                        }}
                        placeholder="91-100"
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold text-slate-800 dark:text-slate-100"
                      />
                      <input 
                        type="text" 
                        value={item.grade} 
                        onChange={e => {
                          const updated = [...gradeRanges]
                          updated[idx].grade = e.target.value
                          setGradeRanges(updated)
                        }}
                        placeholder="A+"
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold text-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (gradeRanges.length > 1) {
                            setGradeRanges(gradeRanges.filter((_, i) => i !== idx))
                          }
                        }}
                        title="Delete rule"
                        disabled={gradeRanges.length <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setGradeRanges([...gradeRanges, { range: '', grade: '' }])}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Grade Range
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Panel 3: Division Remarks Range */}
            <div className={`border rounded-2xl overflow-hidden shadow-sm transition-all ${
              enableDivisionRemarks 
                ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900' 
                : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
            }`}>
              <div className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <div 
                  onClick={() => enableDivisionRemarks && setExpandedSection(expandedSection === 'division' ? null : 'division')}
                  className="flex items-center gap-2.5 cursor-pointer select-none flex-1"
                >
                  <span className={`text-xs font-black uppercase tracking-wide ${
                    enableDivisionRemarks ? 'text-[#1b3a60] dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    Division Remarks Range
                  </span>
                  {enableDivisionRemarks && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {divisionRanges.length} rules
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* ON / OFF Toggle */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      enableDivisionRemarks ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400'
                    }`}>
                      {enableDivisionRemarks ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const next = !enableDivisionRemarks
                        setEnableDivisionRemarks(next)
                        if (next) setExpandedSection('division')
                        else if (expandedSection === 'division') setExpandedSection(null)
                      }}
                      className={`w-9 h-5 rounded-full relative transition-colors ${
                        enableDivisionRemarks ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      title={enableDivisionRemarks ? 'Turn OFF Division Remarks Range' : 'Turn ON Division Remarks Range'}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                        enableDivisionRemarks ? 'left-4.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  {enableDivisionRemarks && (
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === 'division' ? null : 'division')}
                      className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                    >
                      {expandedSection === 'division' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {enableDivisionRemarks && expandedSection === 'division' && (
                <div className="p-6 space-y-4 animate-in slide-in-from-top-1 duration-200 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-4 font-bold text-xs text-slate-500 dark:text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span>Range (e.g. 75-100)</span>
                    <span>Division (e.g. 1st)</span>
                    <span className="w-8"></span>
                  </div>
                  {divisionRanges.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
                      <input 
                        type="text" 
                        value={item.range} 
                        onChange={e => {
                          const updated = [...divisionRanges]
                          updated[idx].range = e.target.value
                          setDivisionRanges(updated)
                        }}
                        placeholder="75-100"
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold text-slate-800 dark:text-slate-100"
                      />
                      <input 
                        type="text" 
                        value={item.div} 
                        onChange={e => {
                          const updated = [...divisionRanges]
                          updated[idx].div = e.target.value
                          setDivisionRanges(updated)
                        }}
                        placeholder="1st"
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold text-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (divisionRanges.length > 1) {
                            setDivisionRanges(divisionRanges.filter((_, i) => i !== idx))
                          }
                        }}
                        title="Delete rule"
                        disabled={divisionRanges.length <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setDivisionRanges([...divisionRanges, { range: '', div: '' }])}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Division Range
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Panel 4: CGPA Range */}
            <div className={`border rounded-2xl overflow-hidden shadow-sm transition-all ${
              enableCgpa 
                ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900' 
                : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-75'
            }`}>
              <div className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <div 
                  onClick={() => enableCgpa && setExpandedSection(expandedSection === 'cgpa' ? null : 'cgpa')}
                  className="flex items-center gap-2.5 cursor-pointer select-none flex-1"
                >
                  <span className={`text-xs font-black uppercase tracking-wide ${
                    enableCgpa ? 'text-[#1b3a60] dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    CGPA Range
                  </span>
                  {enableCgpa && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {cgpaRanges.length} rules
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* ON / OFF Toggle */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      enableCgpa ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400'
                    }`}>
                      {enableCgpa ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const next = !enableCgpa
                        setEnableCgpa(next)
                        if (next) setExpandedSection('cgpa')
                        else if (expandedSection === 'cgpa') setExpandedSection(null)
                      }}
                      className={`w-9 h-5 rounded-full relative transition-colors ${
                        enableCgpa ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      title={enableCgpa ? 'Turn OFF CGPA Range' : 'Turn ON CGPA Range'}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                        enableCgpa ? 'left-4.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  {enableCgpa && (
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === 'cgpa' ? null : 'cgpa')}
                      className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                    >
                      {expandedSection === 'cgpa' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {enableCgpa && expandedSection === 'cgpa' && (
                <div className="p-6 space-y-4 animate-in slide-in-from-top-1 duration-200 bg-white dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Configure marks-to-CGPA scale (e.g. CBSE 10.0 scale or 4.0 scale).
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCgpaRanges([
                          { range: '91-100', cgpa: '10.0' },
                          { range: '81-90', cgpa: '9.0' },
                          { range: '71-80', cgpa: '8.0' },
                          { range: '61-70', cgpa: '7.0' },
                          { range: '51-60', cgpa: '6.0' },
                          { range: '41-50', cgpa: '5.0' },
                          { range: '33-40', cgpa: '4.0' },
                          { range: '00-32', cgpa: '0.0' }
                        ])}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        Reset 10.0 Scale
                      </button>
                      <button
                        type="button"
                        onClick={() => setCgpaRanges([
                          { range: '90-100', cgpa: '4.0' },
                          { range: '80-89', cgpa: '3.0' },
                          { range: '70-79', cgpa: '2.0' },
                          { range: '60-69', cgpa: '1.0' },
                          { range: '00-59', cgpa: '0.0' }
                        ])}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        4.0 Scale Preset
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_1fr_auto] gap-4 font-bold text-xs text-slate-500 dark:text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span>Range (e.g. 91-100)</span>
                    <span>CGPA (e.g. 10.0)</span>
                    <span className="w-8"></span>
                  </div>
                  {cgpaRanges.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
                      <input 
                        type="text" 
                        value={item.range} 
                        onChange={e => {
                          const updated = [...cgpaRanges]
                          updated[idx].range = e.target.value
                          setCgpaRanges(updated)
                        }}
                        placeholder="91-100"
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold text-slate-800 dark:text-slate-100"
                      />
                      <input 
                        type="text" 
                        value={item.cgpa} 
                        onChange={e => {
                          const updated = [...cgpaRanges]
                          updated[idx].cgpa = e.target.value
                          setCgpaRanges(updated)
                        }}
                        placeholder="10.0"
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 font-semibold text-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (cgpaRanges.length > 1) {
                            setCgpaRanges(cgpaRanges.filter((_, i) => i !== idx))
                          }
                        }}
                        title="Delete rule"
                        disabled={cgpaRanges.length <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCgpaRanges([...cgpaRanges, { range: '', cgpa: '' }])}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add CGPA Range
                    </button>
                  </div>
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
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 uppercase tracking-wider">
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Live Hall Ticket Preview
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
                            ? 'ring-2 ring-blue-500 border-transparent text-white shadow-xs'
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
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
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
                          ? 'border-2 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md' 
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
                            <span className="text-[8.5px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
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
                        showExamTimeTable={showExamTimeTableOnAdmit}
                        schoolLogo={admitSchoolLogo}
                        logoPosition={admitLogoPosition}
                        contentPosition={admitContentPosition}
                        photoPosition={admitPhotoPosition}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Classic Board</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Traditional Board Layout • Official Dual Border & Crest</span>
                      </div>
                      
                      <span className="text-[9px] text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 py-1 rounded-lg">
                        Full Matrix + Specimen Sign Box
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewAdmitCard('Classic Board')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-bold text-[11px] border border-blue-200 dark:border-blue-800 hover:border-blue-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white group-hover:scale-110 transition-all" />
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
                          ? 'border-2 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md' 
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
                            <span className="text-[8.5px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
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
                        showExamTimeTable={showExamTimeTableOnAdmit}
                        schoolLogo={admitSchoolLogo}
                        logoPosition={admitLogoPosition}
                        contentPosition={admitContentPosition}
                        photoPosition={admitPhotoPosition}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Modern Split Pass</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Dual-Column Format • Student Profile Sidebar & QR</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 py-1 rounded-lg">
                        Left Profile Bar + Card Tiles
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewAdmitCard('Modern Split Pass')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-bold text-[11px] border border-blue-200 dark:border-blue-800 hover:border-blue-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white group-hover:scale-110 transition-all" />
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
                          ? 'border-2 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md' 
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
                            <span className="text-[8.5px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
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
                        showExamTimeTable={showExamTimeTableOnAdmit}
                        schoolLogo={admitSchoolLogo}
                        logoPosition={admitLogoPosition}
                        contentPosition={admitContentPosition}
                        photoPosition={admitPhotoPosition}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Executive Heritage</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Prestigious Certificate Format • Ornate Double Filigree</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 py-1 rounded-lg">
                        Crest Seal + Declaration Block
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewAdmitCard('Executive Heritage')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-bold text-[11px] border border-blue-200 dark:border-blue-800 hover:border-blue-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white group-hover:scale-110 transition-all" />
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
                          ? 'border-2 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md' 
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
                            <span className="text-[8.5px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
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
                        showExamTimeTable={showExamTimeTableOnAdmit}
                        schoolLogo={admitSchoolLogo}
                        logoPosition={admitLogoPosition}
                        contentPosition={admitContentPosition}
                        photoPosition={admitPhotoPosition}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Compact Minimalist</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">High-Density Slip • Barcode Header & Tear-Off Stub</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 py-1 rounded-lg">
                        Tear-Off Stub + Fast Print
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewAdmitCard('Compact Minimalist')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-bold text-[11px] border border-blue-200 dark:border-blue-800 hover:border-blue-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white group-hover:scale-110 transition-all" />
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
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                          <span>Live Admit Card Preview •</span>
                          <span className="text-blue-600 dark:text-blue-400">{admitTemplateStyle}</span>
                          <span
                            className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase text-white shadow-2xs font-mono"
                            style={{ backgroundColor: admitThemeColor }}
                          >
                            {admitThemeColor}
                          </span>
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                          ⚡ Auto-Updating
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-500">
                          Selecting any template style or color above automatically updates this live printable hall ticket preview in real time.
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-2xs">
                          ⚡ Click any label to edit text live
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePreviewAdmitCard(admitTemplateStyle)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
                  >
                    <Eye className="w-4 h-4" /> Open Full Screen / Print
                  </button>
                </div>

                {/* Real-time Sizing & Typography Studio Toolbar */}
                <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                  {/* Studio Header - Sticky so tabs never scroll off-screen */}
                  <div className="sticky top-2 z-20 bg-white/95 dark:bg-slate-850/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-wrap items-center justify-between gap-3 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        Admit Card Sizing & Typography Studio
                      </span>
                      <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-800/50">
                        Live Sync Across All 4 Templates
                      </span>
                    </div>

                    {/* Studio Category Tabs */}
                    <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setAdmitSizingStudioTab('media')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                          admitSizingStudioTab === 'media'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Logo & QR Sizing</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdmitSizingStudioTab('text')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                          admitSizingStudioTab === 'text'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>Main Text Typography</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-2xs flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{admitSchoolLogo ? 'Change Logo' : 'Upload Logo'}</span>
                      </button>
                      {admitSchoolLogo && (
                        <button
                          type="button"
                          onClick={() => {
                            setAdmitSchoolLogo('')
                            toast.info('Reverted to Sample Academy Crest')
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-all"
                        >
                          Use Sample
                        </button>
                      )}
                    </div>
                  </div>

                  {/* TAB 1: LOGO & MEDIA SIZING */}
                  {admitSizingStudioTab === 'media' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Logo Sizing Box */}
                        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Institute Logo Size</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                              {admitSchoolLogoWidth} × {admitSchoolLogoHeight} px
                            </span>
                          </div>
                          
                          {/* Quick Presets */}
                          <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {[
                              { label: 'S (48px)', size: '48' },
                              { label: 'M (60px)', size: '60' },
                              { label: 'L (76px)', size: '76' },
                              { label: 'XL (96px)', size: '96' }
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => {
                                  setAdmitSchoolLogoWidth(p.size)
                                  setAdmitSchoolLogoHeight(p.size)
                                }}
                                className={`py-1 rounded text-[10px] font-bold transition-all ${
                                  admitSchoolLogoWidth === p.size
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {p.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>

                          {/* Sliders */}
                          <div className="space-y-2 pt-1 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Width:</span>
                              <input
                                type="range"
                                min="32"
                                max="140"
                                step="2"
                                value={Number(admitSchoolLogoWidth) || 60}
                                onChange={e => setAdmitSchoolLogoWidth(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitSchoolLogoWidth}px</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Height:</span>
                              <input
                                type="range"
                                min="32"
                                max="140"
                                step="2"
                                value={Number(admitSchoolLogoHeight) || 60}
                                onChange={e => setAdmitSchoolLogoHeight(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitSchoolLogoHeight}px</span>
                            </div>
                          </div>

                          {/* Logo Position & Content Alignment */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">Logo Position</label>
                              <div className="grid grid-cols-3 gap-1">
                                {(['left', 'center', 'right'] as const).map(pos => (
                                  <button
                                    key={pos}
                                    type="button"
                                    onClick={() => setAdmitLogoPosition(pos)}
                                    className={`py-1 rounded text-[10px] font-bold capitalize transition-all border ${
                                      admitLogoPosition === pos
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                    }`}
                                  >
                                    {pos}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">Content Align</label>
                              <div className="grid grid-cols-3 gap-1">
                                {(['left', 'center', 'right'] as const).map(pos => (
                                  <button
                                    key={pos}
                                    type="button"
                                    onClick={() => setAdmitContentPosition(pos)}
                                    className={`py-1 rounded text-[10px] font-bold capitalize transition-all border ${
                                      admitContentPosition === pos
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                    }`}
                                  >
                                    {pos}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* QR Code Sizing Box */}
                        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Official QR Code Size</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                              {admitQrCodeSize} px
                            </span>
                          </div>

                          {/* Quick Presets */}
                          <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {[
                              { label: 'S (52px)', size: '52' },
                              { label: 'M (72px)', size: '72' },
                              { label: 'L (92px)', size: '92' },
                              { label: 'XL (112px)', size: '112' }
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => setAdmitQrCodeSize(p.size)}
                                className={`py-1 rounded text-[10px] font-bold transition-all ${
                                  admitQrCodeSize === p.size
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {p.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>

                          <div className="pt-2 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Scale:</span>
                              <input
                                type="range"
                                min="44"
                                max="130"
                                step="2"
                                value={Number(admitQrCodeSize) || 72}
                                onChange={e => setAdmitQrCodeSize(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitQrCodeSize}px</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 mt-2">
                              <p className="text-[10px] text-slate-400">Scales QR matrix cleanly without pixel blur.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setMarksheetQrCodeSize(admitQrCodeSize)
                                  setCertQrCodeSize(admitQrCodeSize)
                                  toast.success(`Applied ${admitQrCodeSize}px QR size across Admit Card, Marksheet & Certificate!`)
                                }}
                                className="text-[9.5px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline shrink-0"
                              >
                                Apply to all templates
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Student Photo Dimensions */}
                        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Candidate Photo Size</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                              {admitStudentPhotoWidth} × {admitStudentPhotoHeight} px
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {[
                              { label: 'Passport (80×100)', w: '80', h: '100' },
                              { label: 'Standard (96×120)', w: '96', h: '120' },
                              { label: 'Large (110×140)', w: '110', h: '140' }
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => {
                                  setAdmitStudentPhotoWidth(p.w)
                                  setAdmitStudentPhotoHeight(p.h)
                                }}
                                className={`py-1 rounded text-[9.5px] font-bold transition-all ${
                                  admitStudentPhotoWidth === p.w
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {p.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-2 pt-1 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Width:</span>
                              <input
                                type="range"
                                min="60"
                                max="140"
                                step="2"
                                value={Number(admitStudentPhotoWidth) || 96}
                                onChange={e => setAdmitStudentPhotoWidth(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitStudentPhotoWidth}px</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Height:</span>
                              <input
                                type="range"
                                min="75"
                                max="170"
                                step="2"
                                value={Number(admitStudentPhotoHeight) || 120}
                                onChange={e => setAdmitStudentPhotoHeight(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitStudentPhotoHeight}px</span>
                            </div>
                          </div>

                          {/* Photo Placement */}
                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">Photo Placement:</span>
                              <div className="flex items-center gap-1">
                                {(['left', 'right'] as const).map(pos => (
                                  <button
                                    key={pos}
                                    type="button"
                                    onClick={() => setAdmitPhotoPosition(pos)}
                                    className={`px-2.5 py-1 rounded text-[10px] font-bold capitalize transition-all border ${
                                      admitPhotoPosition === pos
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                    }`}
                                  >
                                    {pos} Side
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: ALL MAIN TEXT (TYPOGRAPHY) */}
                  {admitSizingStudioTab === 'text' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {/* 1. School Name */}
                        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">1. School / Institute Name</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400">{admitHeaderNameFontSize} px</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <input
                              type="range"
                              min="14"
                              max="38"
                              step="1"
                              value={Number(admitHeaderNameFontSize) || 24}
                              onChange={e => setAdmitHeaderNameFontSize(e.target.value)}
                              className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitHeaderNameFontSize}px</span>
                          </div>
                        </div>

                        {/* 2. School Address / Sub-header */}
                        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">2. School Address & Sub-Header</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400">{admitHeaderDetailsFontSize} px</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <input
                              type="range"
                              min="8"
                              max="18"
                              step="0.5"
                              value={Number(admitHeaderDetailsFontSize) || 10}
                              onChange={e => setAdmitHeaderDetailsFontSize(e.target.value)}
                              className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitHeaderDetailsFontSize}px</span>
                          </div>
                        </div>

                        {/* 3. Admit Card Title Heading */}
                        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">3. "Admit Card" Title Banner</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400">{admitHeadingFontSize} px</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <input
                              type="range"
                              min="10"
                              max="26"
                              step="1"
                              value={Number(admitHeadingFontSize) || 14}
                              onChange={e => setAdmitHeadingFontSize(e.target.value)}
                              className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitHeadingFontSize}px</span>
                          </div>
                        </div>

                        {/* 4. Student Details Information */}
                        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">4. Candidate Info (Roll, Name, etc.)</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400">{admitStudentDetailsFontSize} px</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <input
                              type="range"
                              min="9"
                              max="18"
                              step="0.5"
                              value={Number(admitStudentDetailsFontSize) || 12}
                              onChange={e => setAdmitStudentDetailsFontSize(e.target.value)}
                              className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitStudentDetailsFontSize}px</span>
                          </div>
                        </div>

                        {/* 5. Timetable Schedule Matrix */}
                        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">5. Timetable & Exam Datesheet</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400">{admitTimetableDetailsFontSize} px</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <input
                              type="range"
                              min="9"
                              max="18"
                              step="0.5"
                              value={Number(admitTimetableDetailsFontSize) || 11}
                              onChange={e => setAdmitTimetableDetailsFontSize(e.target.value)}
                              className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitTimetableDetailsFontSize}px</span>
                          </div>
                        </div>

                        {/* 6. Candidate Instructions */}
                        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">6. Important Instructions Text</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400">{admitDefaultFontSize} px</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <input
                              type="range"
                              min="7"
                              max="15"
                              step="0.5"
                              value={Number(admitDefaultFontSize) || 9}
                              onChange={e => setAdmitDefaultFontSize(e.target.value)}
                              className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitDefaultFontSize}px</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Paper Viewport */}
                <div className="overflow-x-auto flex justify-center py-3 bg-slate-200/60 dark:bg-slate-950/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
                  <div className="w-full flex flex-col items-center max-w-[800px]">
                    <AdmitCardPaper
                      card={{
                        id: 999999,
                        className: classes[0]?.className || 'Class X',
                        examName: examName || 'Final Term Examination',
                        admitCardLabel: admitLabel || 'Admit Card',
                        reportingTimeValue: admitReportingTime,
                        gateClosureValue: admitGateClosureTime,
                        timeTableId: 999999,
                        session: session,
                        schoolName: schoolName || 'COSMOPOLITAN INTER COLLEGE',
                        schoolAddress: schoolAddress || 'Green Park Sector 4, New Delhi',
                        displayFields: admitDisplayFields,
                        templateStyle: admitTemplateStyle,
                        themeColor: admitThemeColor,
                        status: admitCardStatus ? 'Active' : 'Inactive',
                        instructions: admitInstructions,
                        showExamTimeTable: showExamTimeTableOnAdmit,
                        noOfPrintPerPage: admitNoOfPrintPerPage,
                        headerNameFontSize: admitHeaderNameFontSize,
                        headerDetailsFontSize: admitHeaderDetailsFontSize,
                        studentDetailsFontSize: admitStudentDetailsFontSize,
                        timetableDetailsFontSize: admitTimetableDetailsFontSize,
                        headingFontSize: admitHeadingFontSize,
                        defaultFontSize: admitDefaultFontSize,
                        spacing: admitSpacing,
                        studentPhotoSize: admitStudentPhotoWidth,
                        studentPhotoWidth: admitStudentPhotoWidth,
                        studentPhotoHeight: admitStudentPhotoHeight,
                        photoPosition: admitPhotoPosition,
                        schoolLogo: admitSchoolLogo,
                        schoolLogoWidth: admitSchoolLogoWidth,
                        schoolLogoHeight: admitSchoolLogoHeight || admitSchoolLogoWidth,
                        logoPosition: admitLogoPosition,
                        contentPosition: admitContentPosition,
                        qrCodeSize: admitQrCodeSize,
                        teacherSignLabel: admitTeacherSignLabel,
                        studentSignLabel: admitStudentSignLabel,
                        parentSignLabel: admitParentSignLabel,
                        principalSignLabel: admitPrincipalSignLabel,
                        principalName: principalName,
                        signatureWidth: admitSignatureWidth,
                        signatureFontSize: admitSignatureFontSize,
                        schoolStampWidth: admitSchoolStampWidth,
                        signatureOrder: admitSignatureOrder,
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

            {/* Display Fields Checkboxes (Dynamic per Template) */}
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    Select Fields to Display on Student Admit Card
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                    Template: {admitTemplateStyle}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-700 select-none">
                  <input
                    type="checkbox"
                    checked={isAdmitAllSelected}
                    onChange={e => handleAdmitSelectAllChange(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 rounded"
                  />
                  <span>Select All Fields</span>
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                {availableAdmitFields.map(f => (
                  <label key={f.key} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    admitDisplayFields[f.key] !== false 
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 shadow-2xs' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 opacity-70'
                  }`}>
                    <input
                      type="checkbox"
                      checked={admitDisplayFields[f.key] !== false}
                      onChange={() => handleAdmitCheckboxChange(f.key)}
                      className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 rounded"
                    />
                    <span className="truncate">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Authority Signatures Configuration with Reorder Controls */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 gap-2">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <span>Authority Signatures Setup</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Custom Order
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Enable or disable required signatures and arrange their left-to-right printing sequence using the Move buttons.
                  </p>
                </div>

                {/* Sequence Presets */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Order Presets:</span>
                  <button
                    type="button"
                    onClick={() => setAdmitSignatureOrder(['studentSign', 'parentSign', 'teacherSign', 'principalSign'])}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-2xs"
                  >
                    Student First
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdmitSignatureOrder(['principalSign', 'teacherSign', 'parentSign', 'studentSign'])}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-2xs"
                  >
                    Principal First
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdmitSignatureOrder(['studentSign', 'teacherSign', 'parentSign', 'principalSign'])}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-2xs"
                  >
                    Principal Last
                  </button>
                </div>
              </div>

              {/* Live Sequence Ribbon Indicator */}
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto">
                <span className="text-[10px] font-black uppercase text-slate-400 px-2 shrink-0">Print Sequence:</span>
                {admitSignatureOrder.map((key, idx) => {
                  const labelMap: Record<string, string> = {
                    studentSign: "Student's Sign",
                    parentSign: "Parent's Sign",
                    teacherSign: "Teacher's Sign",
                    principalSign: "Principal's Sign"
                  }
                  const isEnabled = !!admitDisplayFields[key]
                  return (
                    <React.Fragment key={key}>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold shrink-0 transition-all border ${
                        isEnabled 
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300' 
                          : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                      }`}>
                        <span className="w-4 h-4 rounded-full bg-white dark:bg-slate-800 text-[9px] font-black flex items-center justify-center shadow-2xs border border-slate-200 dark:border-slate-700">
                          {idx + 1}
                        </span>
                        <span>{labelMap[key] || key}</span>
                      </div>
                      {idx < admitSignatureOrder.length - 1 && (
                        <span className="text-slate-300 dark:text-slate-600 text-xs shrink-0">→</span>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>

              {/* Signature Sizing Controls (Width & Typography) directly with Signature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Signature Line Width */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Signature Line Width</span>
                    <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                      {admitSignatureWidth} px
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    {[
                      { label: 'S', size: '75' },
                      { label: 'M', size: '100' },
                      { label: 'L', size: '130' },
                      { label: 'XL', size: '165' }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setAdmitSignatureWidth(p.size)}
                        className={`py-1 rounded text-[10px] font-bold transition-all ${
                          admitSignatureWidth === p.size
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold w-12 shrink-0">Width:</span>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        step="5"
                        value={Number(admitSignatureWidth) || 100}
                        onChange={e => setAdmitSignatureWidth(e.target.value)}
                        className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitSignatureWidth}px</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Adjusts width of candidate, teacher, and principal sign lines.</p>
                  </div>
                </div>

                {/* Signature Text Size */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Signature Text Font Size</span>
                    <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                      {admitSignatureFontSize} px
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    {[
                      { label: '8px', size: '8' },
                      { label: '9px', size: '9' },
                      { label: '10px', size: '10' },
                      { label: '11px', size: '11' }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setAdmitSignatureFontSize(p.size)}
                        className={`py-1 rounded text-[10px] font-bold transition-all ${
                          admitSignatureFontSize === p.size
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold w-12 shrink-0">Font Size:</span>
                      <input
                        type="range"
                        min="7"
                        max="14"
                        step="0.5"
                        value={Number(admitSignatureFontSize) || 9}
                        onChange={e => setAdmitSignatureFontSize(e.target.value)}
                        className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{admitSignatureFontSize}px</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Controls typography of sign labels & principal designation.</p>
                  </div>
                </div>
              </div>

              {/* Dynamically Ordered Signature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {admitSignatureOrder.map((key, idx) => {
                  const isFirst = idx === 0
                  const isLast = idx === admitSignatureOrder.length - 1

                  // 1. Principal Sign
                  if (key === 'principalSign') {
                    return (
                      <div 
                        key={key} 
                        className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                          admitDisplayFields.principalSign 
                            ? 'bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-700/80 shadow-xs ring-1 ring-blue-500/15' 
                            : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100">Principal Sign</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                admitDisplayFields.principalSign 
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {admitDisplayFields.principalSign ? 'ON' : 'OFF'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAdmitCheckboxChange('principalSign')}
                              className={`w-10 h-5.5 rounded-full relative transition-colors ${admitDisplayFields.principalSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                              <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${admitDisplayFields.principalSign ? 'left-5' : 'left-0.5'}`} />
                            </button>
                          </div>

                          {/* Auto-fetch Institute Detail Pill */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-[10.5px] text-blue-800 dark:text-blue-200 mb-2.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <div className="truncate">
                              <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Auto-fetched from Institute:</span>
                              <span className="font-extrabold capitalize text-blue-700 dark:text-blue-300">{principalName || 'fahad'}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                              {principalName && (
                                <button
                                  type="button"
                                  onClick={() => setAdmitPrincipalSignLabel(`Principal's Sign. (${principalName})`)}
                                  className="text-[9px] font-bold text-blue-600 hover:text-blue-700 underline"
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
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                          <span className="text-slate-400">Position #{idx + 1}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => moveSignature(idx, -1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Left"
                            >
                              <MoveLeft className="w-3 h-3" /> Move Left
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => moveSignature(idx, 1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Right"
                            >
                              Move Right <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // 2. Teacher Sign
                  if (key === 'teacherSign') {
                    return (
                      <div 
                        key={key} 
                        className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                          admitDisplayFields.teacherSign 
                            ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                            : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100">Teacher Sign</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                admitDisplayFields.teacherSign 
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {admitDisplayFields.teacherSign ? 'ON' : 'OFF'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAdmitCheckboxChange('teacherSign')}
                              className={`w-10 h-5.5 rounded-full relative transition-colors ${admitDisplayFields.teacherSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
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
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                          <span className="text-slate-400">Position #{idx + 1}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => moveSignature(idx, -1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Left"
                            >
                              <MoveLeft className="w-3 h-3" /> Move Left
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => moveSignature(idx, 1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Right"
                            >
                              Move Right <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // 3. Student Sign
                  if (key === 'studentSign') {
                    return (
                      <div 
                        key={key} 
                        className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                          admitDisplayFields.studentSign 
                            ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                            : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100">Student Sign</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                admitDisplayFields.studentSign 
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {admitDisplayFields.studentSign ? 'ON' : 'OFF'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAdmitCheckboxChange('studentSign')}
                              className={`w-10 h-5.5 rounded-full relative transition-colors ${admitDisplayFields.studentSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
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
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                          <span className="text-slate-400">Position #{idx + 1}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => moveSignature(idx, -1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Left"
                            >
                              <MoveLeft className="w-3 h-3" /> Move Left
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => moveSignature(idx, 1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Right"
                            >
                              Move Right <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // 4. Parent Sign
                  if (key === 'parentSign') {
                    return (
                      <div 
                        key={key} 
                        className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                          admitDisplayFields.parentSign 
                            ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                            : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100">Parent Sign</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                admitDisplayFields.parentSign 
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {admitDisplayFields.parentSign ? 'ON' : 'OFF'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAdmitCheckboxChange('parentSign')}
                              className={`w-10 h-5.5 rounded-full relative transition-colors ${admitDisplayFields.parentSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
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
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                          <span className="text-slate-400">Position #{idx + 1}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => moveSignature(idx, -1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Left"
                            >
                              <MoveLeft className="w-3 h-3" /> Move Left
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => moveSignature(idx, 1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Right"
                            >
                              Move Right <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }



                  return null
                })}
              </div>
            </div>

            {/* Hall Ticket Print & Document Configuration */}
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-xs">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
                Hall Ticket Print & Document Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Admit Card Document Title</label>
                  <input
                    type="text"
                    value={admitLabel}
                    onChange={e => setAdmitLabel(e.target.value)}
                    placeholder="Admit Card"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500 font-bold text-slate-800 dark:text-slate-100 shadow-xs"
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
                    className={`w-10 h-5.5 rounded-full relative transition-colors ${admitCardStatus ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
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
                    className={`w-10 h-5.5 rounded-full relative transition-colors ${showExamTimeTableOnAdmit ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${showExamTimeTableOnAdmit ? 'left-5' : 'left-0.5'}`}></div>
                  </button>
                </div>
              </div>


              {/* Exam Timing Options: Reporting Time & Gate Closure Time */}
              <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                      Exam Center Reporting & Gate Closure Timings
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Configurable time printed on student admit cards
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>Reporting Time</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">(Auto in Instruction #1)</span>
                      </span>
                      <span className="text-[10px] font-normal text-slate-400">e.g. 09:30 AM IST</span>
                    </label>
                    <input
                      type="text"
                      placeholder="09:30 AM IST"
                      value={admitReportingTime}
                      onChange={e => {
                        const val = e.target.value
                        setAdmitReportingTime(val)
                        setAdmitInstructions(prev => applyReportingTimeToInstructions(prev, val, admitGateClosureTime))
                      }}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>Gate Closure Time</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">(Auto in Instruction #1)</span>
                      </span>
                      <span className="text-[10px] font-normal text-slate-400">e.g. 09:50 AM (Sharp)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="09:50 AM (Sharp)"
                      value={admitGateClosureTime}
                      onChange={e => {
                        const val = e.target.value
                        setAdmitGateClosureTime(val)
                        setAdmitInstructions(prev => applyReportingTimeToInstructions(prev, admitReportingTime, val))
                      }}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="flex flex-col gap-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Important Candidate Instructions</label>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Point #1 auto-syncs with Reporting & Gate Closure Times</span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Write official examination instructions for students..."
                  value={admitInstructions}
                  onChange={e => setAdmitInstructions(e.target.value)}
                  className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500 font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs leading-relaxed"
                />
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
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 uppercase tracking-wider">
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Live Marksheet Preview
              </button>
            </div>

            {/* Marksheet Theme Color Selector & Template Selector Grid */}
            <div className="space-y-4">
              {/* Theme Color Customizer Bar */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
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
                            ? 'ring-2 ring-blue-500 border-transparent text-white shadow-xs'
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
                    Choose from 3 professionally crafted academic marksheet layouts — customizable with your chosen theme color
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  3 Templates Available
                </span>
              </div>

              {/* 3 Template Cards with Small Previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. CBSE Royal Emerald */}
                {(() => {
                  const isSelected = selectedTemplate === 'CBSE Royal Emerald' || (!selectedTemplate || selectedTemplate === 'Holistic Early Skills')
                  return (
                    <div 
                      onClick={() => setSelectedTemplate('CBSE Royal Emerald')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md' 
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
                            <span className="text-[8.5px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <MarksheetMiniPreview
                        template="CBSE Royal Emerald"
                        themeColor={marksheetThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        schoolLogo={admitSchoolLogo}
                        showLogo={columnsList.logo !== false}
                        examName={examName || 'Annual Examination 2025-26'}
                        academicYear={session}
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">CBSE Royal Emerald</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Official Board Format • Gold Crest</span>
                      </div>
                      
                      <span className="text-[9px] text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 py-1 rounded-lg">
                        Part 1 Scholastic + Part 2 Co-Scholastic
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewMarksheet('CBSE Royal Emerald')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-bold text-[11px] border border-blue-200 dark:border-blue-800 hover:border-blue-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white group-hover:scale-110 transition-all" />
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
                          ? 'border-2 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: marksheetThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                          Canva / Pinterest
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <MarksheetMiniPreview
                        template="Minimalist Modern"
                        themeColor={marksheetThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        schoolLogo={admitSchoolLogo}
                        showLogo={columnsList.logo !== false}
                        examName={examName || 'Annual Examination 2025-26'}
                        academicYear={session}
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Minimalist Modern</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Teal & Slate • KPI Badges</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 py-1 rounded-lg">
                        Attendance Meter + Progress Bars
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewMarksheet('Minimalist Modern')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-bold text-[11px] border border-blue-200 dark:border-blue-800 hover:border-blue-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white group-hover:scale-110 transition-all" />
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
                          ? 'border-2 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md' 
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
                            <span className="text-[8.5px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <MarksheetMiniPreview
                        template="Dual-Term Consolidated"
                        themeColor={marksheetThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        schoolLogo={admitSchoolLogo}
                        showLogo={columnsList.logo !== false}
                        examName={examName || 'Annual Examination 2025-26'}
                        academicYear={session}
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Dual-Term Consolidated</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Burgundy & Navy • Term 1 vs 2</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 py-1 rounded-lg">
                        Class Rank #3 + 4 Signatures
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewMarksheet('Dual-Term Consolidated')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-bold text-[11px] border border-blue-200 dark:border-blue-800 hover:border-blue-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white group-hover:scale-110 transition-all" />
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
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                          <span>Live Marksheet Preview •</span>
                          <span className="text-blue-600 dark:text-blue-400">{selectedTemplate}</span>
                          <span
                            className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase text-white shadow-2xs font-mono"
                            style={{ backgroundColor: marksheetThemeColor }}
                          >
                            {marksheetThemeColor}
                          </span>
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                          ⚡ Auto-Updating
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300/60">
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
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Full Screen / Print</span>
                  </button>
                </div>

                {/* MARKSHEET SIZING & TYPOGRAPHY STUDIO (UNIFORM WITH ADMIT CARD) */}
                <div className="border border-blue-200/90 dark:border-blue-800/80 rounded-2xl bg-white dark:bg-slate-850 p-4 sm:p-5 shadow-xs space-y-4">
                  {/* Studio Top Control Strip */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                          <span>Marksheet Sizing & Typography Studio</span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            Live Controls
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Fine-tune logo proportions, candidate photo dimensions, and typography scale with real-time updates.
                        </p>
                      </div>
                    </div>

                    {/* Studio Sub-Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 self-start md:self-auto">
                      <button
                        type="button"
                        onClick={() => setMarksheetSizingStudioTab('media')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          marksheetSizingStudioTab === 'media'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Logo & Brand Sizing</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarksheetSizingStudioTab('text')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          marksheetSizingStudioTab === 'text'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>Main Text Typography</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => marksheetLogoFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-2xs flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{admitSchoolLogo ? 'Change Logo' : 'Upload Logo'}</span>
                      </button>
                      {admitSchoolLogo && (
                        <button
                          type="button"
                          onClick={() => {
                            setAdmitSchoolLogo('')
                            toast.info('Reverted to Sample Academy Crest')
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-all"
                        >
                          Use Sample
                        </button>
                      )}
                    </div>
                  </div>

                  {/* TAB 1: LOGO & MEDIA SIZING */}
                  {marksheetSizingStudioTab === 'media' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Logo Sizing Box */}
                        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Institute Logo Width</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                              {logoWidth} px
                            </span>
                          </div>
                          
                          {/* Quick Presets */}
                          <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {[
                              { label: 'S (48px)', size: '48' },
                              { label: 'M (60px)', size: '60' },
                              { label: 'L (76px)', size: '76' },
                              { label: 'XL (96px)', size: '96' }
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => setLogoWidth(p.size)}
                                className={`py-1 rounded text-[10px] font-bold transition-all ${
                                  logoWidth === p.size
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {p.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>

                          {/* Slider */}
                          <div className="space-y-2 pt-1 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Width:</span>
                              <input
                                type="range"
                                min="32"
                                max="140"
                                step="2"
                                value={Number(logoWidth) || 60}
                                onChange={e => setLogoWidth(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{logoWidth}px</span>
                            </div>
                          </div>
                        </div>

                        {/* Student Photo Sizing Box */}
                        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Candidate Photo Size</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                              {photoWidth} × {photoHeight} px
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {[
                              { label: 'Compact', w: '60', h: '75' },
                              { label: 'Standard', w: '70', h: '90' },
                              { label: 'Passport', w: '80', h: '105' }
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => {
                                  setPhotoWidth(p.w)
                                  setPhotoHeight(p.h)
                                }}
                                className={`py-1 rounded text-[10px] font-bold transition-all ${
                                  photoWidth === p.w
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-2 pt-1 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Width:</span>
                              <input
                                type="range"
                                min="50"
                                max="120"
                                step="2"
                                value={Number(photoWidth) || 70}
                                onChange={e => setPhotoWidth(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{photoWidth}px</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Height:</span>
                              <input
                                type="range"
                                min="65"
                                max="140"
                                step="2"
                                value={Number(photoHeight) || 90}
                                onChange={e => setPhotoHeight(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{photoHeight}px</span>
                            </div>
                          </div>
                        </div>

                        {/* Official QR Code Sizing Box */}
                        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Verification QR Size</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                              {marksheetQrCodeSize} px
                            </span>
                          </div>

                          {/* Quick Presets */}
                          <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {[
                              { label: 'S (56px)', size: '56' },
                              { label: 'M (72px)', size: '72' },
                              { label: 'L (88px)', size: '88' },
                              { label: 'XL (104px)', size: '104' }
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => setMarksheetQrCodeSize(p.size)}
                                className={`py-1 rounded text-[10px] font-bold transition-all ${
                                  marksheetQrCodeSize === p.size
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {p.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-2 pt-1 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Scale:</span>
                              <input
                                type="range"
                                min="48"
                                max="130"
                                step="2"
                                value={Number(marksheetQrCodeSize) || 72}
                                onChange={e => setMarksheetQrCodeSize(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{marksheetQrCodeSize}px</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 mt-2">
                              <p className="text-[10px] text-slate-400">Scales QR matrix cleanly.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setAdmitQrCodeSize(marksheetQrCodeSize)
                                  setCertQrCodeSize(marksheetQrCodeSize)
                                  toast.success(`Applied ${marksheetQrCodeSize}px QR size across Marksheet, Admit Card & Certificate!`)
                                }}
                                className="text-[9.5px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline shrink-0"
                              >
                                Apply to all templates
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: MAIN TEXT TYPOGRAPHY */}
                  {marksheetSizingStudioTab === 'text' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setMarksheetHeaderNameFontSize('22')
                            setMarksheetHeadingFontSize('14')
                            setMarksheetHeaderDetailsFontSize('11')
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline"
                        >
                          Reset Defaults
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. School Name Font Size */}
                        <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-[10.5px]">Institute Name:</span>
                            <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-[10.5px] bg-blue-50 dark:bg-blue-950/60 px-1 rounded">{marksheetHeaderNameFontSize}px</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Make Institute Name smaller"
                              onClick={() => setMarksheetHeaderNameFontSize(prev => String(Math.max(12, Number(prev) - 2)))}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              A-
                            </button>
                            <input
                              type="range"
                              min="14"
                              max="36"
                              step="1"
                              value={Number(marksheetHeaderNameFontSize) || 22}
                              onChange={e => setMarksheetHeaderNameFontSize(e.target.value)}
                              className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <button
                              type="button"
                              title="Make Institute Name bigger"
                              onClick={() => setMarksheetHeaderNameFontSize(prev => String(Math.min(42, Number(prev) + 2)))}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              A+
                            </button>
                          </div>
                        </div>

                        {/* 2. Marksheet Title Font Size */}
                        <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-[10.5px]">Report Title:</span>
                            <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-[10.5px] bg-blue-50 dark:bg-blue-950/60 px-1 rounded">{marksheetHeadingFontSize}px</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Make Report Title smaller"
                              onClick={() => setMarksheetHeadingFontSize(prev => String(Math.max(10, Number(prev) - 1)))}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              A-
                            </button>
                            <input
                              type="range"
                              min="10"
                              max="26"
                              step="1"
                              value={Number(marksheetHeadingFontSize) || 14}
                              onChange={e => setMarksheetHeadingFontSize(e.target.value)}
                              className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <button
                              type="button"
                              title="Make Report Title bigger"
                              onClick={() => setMarksheetHeadingFontSize(prev => String(Math.min(32, Number(prev) + 1)))}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              A+
                            </button>
                          </div>
                        </div>

                        {/* 3. Address & Sub-Header Font Size */}
                        <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-[10.5px]">Details/Subheader:</span>
                            <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-[10.5px] bg-blue-50 dark:bg-blue-950/60 px-1 rounded">{marksheetHeaderDetailsFontSize}px</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Make Details smaller"
                              onClick={() => setMarksheetHeaderDetailsFontSize(prev => String(Math.max(8, Number(prev) - 1)))}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              A-
                            </button>
                            <input
                              type="range"
                              min="8"
                              max="18"
                              step="0.5"
                              value={Number(marksheetHeaderDetailsFontSize) || 11}
                              onChange={e => setMarksheetHeaderDetailsFontSize(e.target.value)}
                              className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <button
                              type="button"
                              title="Make Details bigger"
                              onClick={() => setMarksheetHeaderDetailsFontSize(prev => String(Math.min(22, Number(prev) + 1)))}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              A+
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                      cgpaRanges={cgpaRanges}
                      enableGrade={enableGradeRemarks}
                      enableCgpa={enableCgpa}
                      enablePercentage={enablePercentRemarks}
                      enableDivision={enableDivisionRemarks}
                      schoolName={schoolName}
                      affiliateTo={affiliateTo}
                      schoolAddress={schoolAddress}
                      schoolCode={schoolCode}
                      schoolLogo={admitSchoolLogo}
                      logoWidth={logoWidth}
                      showLogo={columnsList.logo !== false}
                      phone={phone}
                      email={email}
                      principalName={principalName}
                      headingHeader={headingHeader}
                      headerNameFontSize={marksheetHeaderNameFontSize}
                      headingFontSize={marksheetHeadingFontSize}
                      headerDetailsFontSize={marksheetHeaderDetailsFontSize}
                      dateOfIssue={formatDisplayDate(lastDateToEnter) || marksheetDateOfIssue || '25/03/2026'}
                      showStudentPhoto={showStudentPhoto}
                      showRoundBorderPhoto={showRoundBorderPhoto}
                      showTestMarks={showTestMarks}
                      showHeaderSign={showHeaderSign}
                      columnsList={{
                        ...columnsList,
                        percentage: enablePercentRemarks,
                        grade: enableGradeRemarks,
                        division: enableDivisionRemarks,
                        cgpa: enableCgpa
                      }}
                      editable={true}
                      qrCodeSize={marksheetQrCodeSize}
                      signatureOrder={marksheetSignatureOrder}
                      signatureWidth={marksheetSignatureWidth}
                      signatureFontSize={marksheetSignatureFontSize}
                      customLabels={marksheetCustomLabels}
                      onUpdateField={handleMarksheetFieldUpdate}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Display Fields Checkboxes (Dynamic per Template) */}
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    Select Fields to Display on Marksheet
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                    Template: {selectedTemplate}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-700 select-none">
                  <input
                    type="checkbox"
                    checked={isMarksheetAllSelected}
                    onChange={e => handleMarksheetSelectAllChange(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 rounded"
                  />
                  <span>Select All Fields</span>
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                {MARKSHEET_DISPLAY_FIELDS_KEYS.map(f => {
                  const isChecked = !!(columnsList as any)[f.key]
                  return (
                    <label key={f.key} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked 
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 shadow-2xs' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 opacity-70'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleMarksheetCheckboxChange(f.key)}
                        className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 rounded"
                      />
                      <span className="truncate">{f.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Authority Signatures Configuration (Dynamic Reordering & Sizing Matching Admit Card) */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 gap-3">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <span>Authority Signatures Setup</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Custom Order & Size
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Enable or disable required signatures and arrange their left-to-right printing sequence using the Move buttons.
                  </p>
                </div>

                {/* Sequence Presets */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Order Presets:</span>
                  <button
                    type="button"
                    onClick={() => setMarksheetSignatureOrder(['teacherSign', 'controllerSign', 'parentSign', 'principalSign'])}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-2xs"
                  >
                    Teacher First
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarksheetSignatureOrder(['principalSign', 'controllerSign', 'teacherSign', 'parentSign'])}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-2xs"
                  >
                    Principal First
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarksheetSignatureOrder(['teacherSign', 'parentSign', 'controllerSign', 'principalSign'])}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-2xs"
                  >
                    Principal Last
                  </button>
                </div>
              </div>

              {/* Live Sequence Ribbon Indicator */}
              <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto">
                <span className="text-[10px] font-black uppercase text-slate-400 px-2 shrink-0">Print Sequence:</span>
                {marksheetSignatureOrder.map((key, idx) => {
                  const labelMap: Record<string, string> = {
                    teacherSign: "Teacher's Sign",
                    controllerSign: "Controller's Sign",
                    parentSign: "Parent's Sign",
                    principalSign: "Principal's Sign"
                  }
                  const isEnabled = key === 'parentSign' ? !!columnsList.parentSign : (columnsList as any)[key] !== false
                  return (
                    <React.Fragment key={key}>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold shrink-0 transition-all border ${
                        isEnabled 
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300' 
                          : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                      }`}>
                        <span className="w-4 h-4 rounded-full bg-white dark:bg-slate-800 text-[9px] font-black flex items-center justify-center shadow-2xs border border-slate-200 dark:border-slate-700">
                          {idx + 1}
                        </span>
                        <span>{labelMap[key] || key}</span>
                      </div>
                      {idx < marksheetSignatureOrder.length - 1 && (
                        <span className="text-slate-300 dark:text-slate-600 text-xs shrink-0">→</span>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>

              {/* Signature Sizing Controls (Width & Typography) directly with Signature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Signature Line Width */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Signature Line Width</span>
                    <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                      {marksheetSignatureWidth} px
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    {[
                      { label: 'S (75px)', size: '75' },
                      { label: 'M (100px)', size: '100' },
                      { label: 'L (130px)', size: '130' },
                      { label: 'XL (165px)', size: '165' }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setMarksheetSignatureWidth(p.size)}
                        className={`py-1 rounded text-[10px] font-bold transition-all ${
                          marksheetSignatureWidth === p.size
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {p.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold w-12 shrink-0">Width:</span>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        step="5"
                        value={Number(marksheetSignatureWidth) || 110}
                        onChange={e => setMarksheetSignatureWidth(e.target.value)}
                        className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{marksheetSignatureWidth}px</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Adjusts width of teacher, controller, parent, and principal sign lines.</p>
                  </div>
                </div>

                {/* Signature Font Size */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Signature Title Font Size</span>
                    <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                      {marksheetSignatureFontSize} px
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    {[
                      { label: 'S (8px)', size: '8' },
                      { label: 'M (10px)', size: '10' },
                      { label: 'L (12px)', size: '12' },
                      { label: 'XL (14px)', size: '14' }
                    ].map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setMarksheetSignatureFontSize(p.size)}
                        className={`py-1 rounded text-[10px] font-bold transition-all ${
                          marksheetSignatureFontSize === p.size
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {p.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  <div className="pt-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold w-12 shrink-0">Scale:</span>
                      <input
                        type="range"
                        min="7"
                        max="16"
                        step="1"
                        value={Number(marksheetSignatureFontSize) || 10}
                        onChange={e => setMarksheetSignatureFontSize(e.target.value)}
                        className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{marksheetSignatureFontSize}px</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 mt-2">
                      <p className="text-[10px] text-slate-400">Controls signature label typography.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setMarksheetSignatureWidth(admitSignatureWidth)
                          setMarksheetSignatureFontSize(admitSignatureFontSize)
                          toast.success(`Matched Marksheet signature size to Admit Card (${admitSignatureWidth}px width, ${admitSignatureFontSize}px font)!`)
                        }}
                        className="text-[9.5px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline shrink-0"
                      >
                        Match Admit Card Size
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamically Ordered Signature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                {marksheetSignatureOrder.map((key, idx) => {
                  const isFirst = idx === 0
                  const isLast = idx === marksheetSignatureOrder.length - 1

                  if (key === 'principalSign') {
                    return (
                      <div 
                        key={key} 
                        className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                          columnsList.principalSign 
                            ? 'bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-700/80 shadow-xs ring-1 ring-blue-500/15' 
                            : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100">Principal Sign</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                columnsList.principalSign 
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {columnsList.principalSign ? 'ON' : 'OFF'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleMarksheetCheckboxChange('principalSign')}
                              className={`w-10 h-5.5 rounded-full relative transition-colors ${columnsList.principalSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                              <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${columnsList.principalSign ? 'left-5' : 'left-0.5'}`} />
                            </button>
                          </div>

                          {/* Auto-fetch Institute Detail Pill */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-[10.5px] text-blue-800 dark:text-blue-200 mb-2.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <div className="truncate">
                              <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Auto-fetched from Institute:</span>
                              <span className="font-extrabold capitalize text-blue-700 dark:text-blue-300">{principalName || 'Principal'}</span>
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
                                  className="text-[9px] font-bold text-blue-600 hover:text-blue-700 underline"
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
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                          <span className="text-slate-400">Position #{idx + 1}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => moveMarksheetSignature(idx, -1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Left"
                            >
                              <MoveLeft className="w-3 h-3" /> Move Left
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => moveMarksheetSignature(idx, 1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Right"
                            >
                              Move Right <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (key === 'teacherSign') {
                    return (
                      <div 
                        key={key} 
                        className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                          columnsList.teacherSign 
                            ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                            : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100">Class Teacher Sign</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                columnsList.teacherSign 
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {columnsList.teacherSign ? 'ON' : 'OFF'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleMarksheetCheckboxChange('teacherSign')}
                              className={`w-10 h-5.5 rounded-full relative transition-colors ${columnsList.teacherSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
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
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                          <span className="text-slate-400">Position #{idx + 1}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => moveMarksheetSignature(idx, -1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Left"
                            >
                              <MoveLeft className="w-3 h-3" /> Move Left
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => moveMarksheetSignature(idx, 1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Right"
                            >
                              Move Right <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (key === 'controllerSign') {
                    return (
                      <div 
                        key={key} 
                        className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                          columnsList.controllerSign 
                            ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                            : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100">Exam Controller Sign</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                columnsList.controllerSign 
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {columnsList.controllerSign ? 'ON' : 'OFF'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleMarksheetCheckboxChange('controllerSign')}
                              className={`w-10 h-5.5 rounded-full relative transition-colors ${columnsList.controllerSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
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
                              placeholder="Exam In-Charge / Controller"
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                          <span className="text-slate-400">Position #{idx + 1}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => moveMarksheetSignature(idx, -1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Left"
                            >
                              <MoveLeft className="w-3 h-3" /> Move Left
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => moveMarksheetSignature(idx, 1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Right"
                            >
                              Move Right <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (key === 'parentSign') {
                    return (
                      <div 
                        key={key} 
                        className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                          columnsList.parentSign 
                            ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                            : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100">Parent Sign</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                columnsList.parentSign 
                                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {columnsList.parentSign ? 'ON' : 'OFF'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleMarksheetCheckboxChange('parentSign')}
                              className={`w-10 h-5.5 rounded-full relative transition-colors ${columnsList.parentSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
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
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Reorder Buttons */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                          <span className="text-slate-400">Position #{idx + 1}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => moveMarksheetSignature(idx, -1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Left"
                            >
                              <MoveLeft className="w-3 h-3" /> Move Left
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => moveMarksheetSignature(idx, 1)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                              title="Move Right"
                            >
                              Move Right <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return null
                })}
              </div>
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
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 uppercase tracking-wider">
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Live Certificate Preview
              </button>
            </div>

            {/* Certificate Theme Color Customizer */}
            <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
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
                      Pick any custom color or choose from curated presets — updates all 3 certificate templates and live preview in real-time
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
                          ? 'ring-2 ring-blue-500 border-transparent text-white shadow-xs'
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

            {/* ================= 2. TEMPLATE SELECTOR GRID: 3 CERTIFICATE TEMPLATES ================= */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Select Certificate Template Style
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Choose from 3 official high-definition landscape academic award certificates with crests & QR validation
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  3 Templates Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Certificate Design 1 */}
                {(() => {
                  const isSelected = certTemplate === 'Certificate Design 1'
                  return (
                    <div 
                      onClick={() => setCertTemplate('Certificate Design 1')}
                      className={`cursor-pointer rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-2 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md' 
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
                            <span className="text-[8.5px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <CertificateMiniPreview
                        template="Certificate Design 1"
                        themeColor={certThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        schoolLogo={admitSchoolLogo}
                        showLogo={certDisplayFields.logo !== false}
                        studentName="Aarav Sharma"
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Royal Blue Geometric</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Thin gold inner frame with corner accents</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 py-1 rounded-lg">
                        Official Seal + Geometric Border
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewCertificate('Certificate Design 1')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-bold text-[11px] border border-blue-200 dark:border-blue-800 hover:border-blue-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white group-hover:scale-110 transition-all" />
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
                          ? 'border-2 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={isSelected ? { borderColor: certThemeColor } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-900 border border-blue-200">
                          Vintage Gold
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-[8.5px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <CertificateMiniPreview
                        template="Certificate Design 2"
                        themeColor={certThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        schoolLogo={admitSchoolLogo}
                        showLogo={certDisplayFields.logo !== false}
                        studentName="Aarav Sharma"
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Navy & Gold Corners</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Fleur-de-lis ornate corners & 5 stars</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 py-1 rounded-lg">
                        Fleur-de-lis + Merit Crest
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewCertificate('Certificate Design 2')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-bold text-[11px] border border-blue-200 dark:border-blue-800 hover:border-blue-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white group-hover:scale-110 transition-all" />
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
                          ? 'border-2 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md' 
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
                            <span className="text-[8.5px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* Small Live Preview */}
                      <CertificateMiniPreview
                        template="Certificate Design 3"
                        themeColor={certThemeColor}
                        schoolName={schoolName || 'COSMOPOLITAN INTER COLLEGE'}
                        schoolLogo={admitSchoolLogo}
                        showLogo={certDisplayFields.logo !== false}
                        studentName="Aarav Sharma"
                        isSelected={isSelected}
                      />

                      <div className="text-center my-0.5">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Ornate Golden Frame</span>
                        <span className="text-[10px] font-semibold text-slate-500 mt-0.5 block">Modern luxury border with verified badge</span>
                      </div>

                      <span className="text-[9px] text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 py-1 rounded-lg">
                        Shield Verification + Gradient Ribbon
                      </span>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewCertificate('Certificate Design 3')
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 font-bold text-[11px] border border-blue-200 dark:border-blue-800 hover:border-blue-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white group-hover:scale-110 transition-all" />
                          <span>Preview Full Template</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* ================= 3. AUTO-UPDATING LIVE CERTIFICATE PREVIEW ================= */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                          <span>Live Certificate Preview •</span>
                          <span className="text-blue-600 dark:text-blue-400">{certTemplate}</span>
                          <span
                            className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase text-white shadow-2xs font-mono"
                            style={{ backgroundColor: certThemeColor }}
                          >
                            {certThemeColor}
                          </span>
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                          ⚡ Auto-Updating
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-500">
                          Selecting any certificate template style or color above automatically updates this live printable certificate preview in real time.
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-2xs">
                          ⚡ Click any label to edit live
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreviewCertificate(certTemplate)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Full Screen / Print</span>
                  </button>
                </div>

                {/* ================= 4. SIZING & TYPOGRAPHY STUDIO (MATCHING ADMIT CARD) ================= */}
                <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                  {/* Studio Header */}
                  <div className="sticky top-2 z-20 bg-white/95 dark:bg-slate-850/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-wrap items-center justify-between gap-3 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        Certificate Sizing & Typography Studio
                      </span>
                      <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-800/50">
                        Live Sync Across All 3 Templates
                      </span>
                    </div>

                    {/* Studio Category Tabs */}
                    <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setCertSizingStudioTab('media')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                          certSizingStudioTab === 'media'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Logo, Photo & QR Sizing</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCertSizingStudioTab('text')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                          certSizingStudioTab === 'text'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>Main Text Typography</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={certLogoFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                setAdmitSchoolLogo(reader.result)
                                toast.success('Institute Logo updated successfully for all certificate templates!')
                              }
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => certLogoFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-2xs flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{admitSchoolLogo ? 'Change Logo' : 'Upload Logo'}</span>
                      </button>
                      {admitSchoolLogo && (
                        <button
                          type="button"
                          onClick={() => {
                            setAdmitSchoolLogo('')
                            toast.info('Reverted to Sample Academy Crest')
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-all"
                        >
                          Use Sample
                        </button>
                      )}
                    </div>
                  </div>

                  {/* TAB 1: LOGO, PHOTO & QR SIZING */}
                  {certSizingStudioTab === 'media' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Logo Sizing Box */}
                        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Certificate Brand Logo Size</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCertCheckboxChange('logo')}
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase transition-all shadow-2xs ${
                                  certDisplayFields.logo !== false
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                                }`}
                              >
                                {certDisplayFields.logo !== false ? '● Visible' : '○ Hidden'}
                              </button>
                              <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                                {logoWidth} px
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {[
                              { label: 'S (48px)', size: '48' },
                              { label: 'M (60px)', size: '60' },
                              { label: 'L (76px)', size: '76' },
                              { label: 'XL (96px)', size: '96' }
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => setLogoWidth(p.size)}
                                className={`py-1 rounded text-[10px] font-bold transition-all ${
                                  logoWidth === p.size
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {p.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>

                          <div className="pt-1 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Scale:</span>
                              <input
                                type="range"
                                min="32"
                                max="130"
                                step="2"
                                value={Number(logoWidth) || 60}
                                onChange={e => setLogoWidth(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{logoWidth}px</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Unified institute crest appearing across all 3 certificate templates.</p>
                          </div>
                        </div>

                        {/* Candidate Photo Sizing Box */}
                        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Candidate Photo Size</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCertCheckboxChange('studentPhoto')}
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase transition-all shadow-2xs ${
                                  certDisplayFields.studentPhoto !== false
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                                }`}
                              >
                                {certDisplayFields.studentPhoto !== false ? '● Visible' : '○ Hidden'}
                              </button>
                              <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                                {certPhotoWidth} × {certPhotoHeight} px
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {[
                              { label: 'S (38×48)', w: '38', h: '48' },
                              { label: 'M (48×60)', w: '48', h: '60' },
                              { label: 'L (60×75)', w: '60', h: '75' },
                              { label: 'XL (74×92)', w: '74', h: '92' }
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => {
                                  setCertPhotoWidth(p.w)
                                  setCertPhotoHeight(p.h)
                                }}
                                className={`py-1 rounded text-[10px] font-bold transition-all ${
                                  certPhotoWidth === p.w && certPhotoHeight === p.h
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {p.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-2 pt-1 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Width:</span>
                              <input
                                type="range"
                                min="30"
                                max="110"
                                step="2"
                                value={Number(certPhotoWidth) || 48}
                                onChange={e => setCertPhotoWidth(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{certPhotoWidth}px</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Height:</span>
                              <input
                                type="range"
                                min="38"
                                max="140"
                                step="2"
                                value={Number(certPhotoHeight) || 60}
                                onChange={e => setCertPhotoHeight(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{certPhotoHeight}px</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 mt-2">
                            <p className="text-[10px] text-slate-400">Scales candidate photo across all certificate templates.</p>
                            <button
                              type="button"
                              onClick={() => {
                                setAdmitStudentPhotoWidth(certPhotoWidth)
                                setAdmitStudentPhotoHeight(certPhotoHeight)
                                setPhotoWidth(certPhotoWidth)
                                setPhotoHeight(certPhotoHeight)
                                toast.success(`Applied ${certPhotoWidth}×${certPhotoHeight}px photo size across Certificate, Marksheet & Admit Card!`)
                              }}
                              className="text-[9.5px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline shrink-0"
                            >
                              Apply to all templates
                            </button>
                          </div>
                        </div>

                        {/* QR Code Sizing Box */}
                        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Verification QR Code Size</span>
                            <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                              {certQrCodeSize} px
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                            {[
                              { label: 'S (48px)', size: '48' },
                              { label: 'M (64px)', size: '64' },
                              { label: 'L (72px)', size: '72' },
                              { label: 'XL (96px)', size: '96' }
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => setCertQrCodeSize(p.size)}
                                className={`py-1 rounded text-[10px] font-bold transition-all ${
                                  certQrCodeSize === p.size
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {p.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>

                          <div className="pt-1 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-semibold w-12 shrink-0">Scale:</span>
                              <input
                                type="range"
                                min="40"
                                max="130"
                                step="2"
                                value={Number(certQrCodeSize) || 68}
                                onChange={e => setCertQrCodeSize(e.target.value)}
                                className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                              />
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{certQrCodeSize}px</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 mt-2">
                              <p className="text-[10px] text-slate-400">Scales high-definition verification QR matrix.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setAdmitQrCodeSize(certQrCodeSize)
                                  setMarksheetQrCodeSize(certQrCodeSize)
                                  toast.success(`Applied ${certQrCodeSize}px QR size across Certificate, Marksheet & Admit Card!`)
                                }}
                                className="text-[9.5px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline shrink-0"
                              >
                                Apply to all templates
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: MAIN TEXT TYPOGRAPHY */}
                  {certSizingStudioTab === 'text' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Main Typography Sizing Sliders
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCertSchoolNameFontSize('14')
                            setCertTitleFontSize('30')
                            setCertSubtitleFontSize('11')
                          }}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline"
                        >
                          Reset Defaults
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. School / Institute Name Font Size */}
                        <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-[10.5px]">Institute Name:</span>
                            <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-[10.5px] bg-blue-50 dark:bg-blue-950/60 px-1 rounded">{certSchoolNameFontSize}px</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Make Institute Name smaller"
                              onClick={() => setCertSchoolNameFontSize(prev => String(Math.max(10, Number(prev) - 1)))}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              A-
                            </button>
                            <input
                              type="range"
                              min="10"
                              max="28"
                              step="1"
                              value={Number(certSchoolNameFontSize) || 14}
                              onChange={e => setCertSchoolNameFontSize(e.target.value)}
                              className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <button
                              type="button"
                              title="Make Institute Name bigger"
                              onClick={() => setCertSchoolNameFontSize(prev => String(Math.min(36, Number(prev) + 1)))}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              A+
                            </button>
                          </div>
                        </div>

                        {/* 2. Certificate Title Font Size */}
                        <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-[10.5px]">Certificate Title:</span>
                            <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-[10.5px] bg-blue-50 dark:bg-blue-950/60 px-1 rounded">{certTitleFontSize}px</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Make Certificate Title smaller"
                              onClick={() => setCertTitleFontSize(prev => String(Math.max(16, Number(prev) - 2)))}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              A-
                            </button>
                            <input
                              type="range"
                              min="16"
                              max="48"
                              step="1"
                              value={Number(certTitleFontSize) || 30}
                              onChange={e => setCertTitleFontSize(e.target.value)}
                              className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <button
                              type="button"
                              title="Make Certificate Title bigger"
                              onClick={() => setCertTitleFontSize(prev => String(Math.min(54, Number(prev) + 2)))}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              A+
                            </button>
                          </div>
                        </div>

                        {/* 3. Subtitle / Tagline Font Size */}
                        <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-[10.5px]">Subtitle / Tagline:</span>
                            <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-[10.5px] bg-blue-50 dark:bg-blue-950/60 px-1 rounded">{certSubtitleFontSize}px</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Make Subtitle smaller"
                              onClick={() => setCertSubtitleFontSize(prev => String(Math.max(8, Number(prev) - 1)))}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              A-
                            </button>
                            <input
                              type="range"
                              min="8"
                              max="20"
                              step="0.5"
                              value={Number(certSubtitleFontSize) || 11}
                              onChange={e => setCertSubtitleFontSize(e.target.value)}
                              className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                            />
                            <button
                              type="button"
                              title="Make Subtitle bigger"
                              onClick={() => setCertSubtitleFontSize(prev => String(Math.min(26, Number(prev) + 1)))}
                              className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              A+
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                        schoolLogo={admitSchoolLogo}
                        logoWidth={Number(logoWidth) || 60}
                        showLogo={certDisplayFields.logo !== false}
                        schoolNameFontSize={certSchoolNameFontSize}
                        titleFontSize={certTitleFontSize}
                        subtitleFontSize={certSubtitleFontSize}
                        title={certTitle}
                        subtitle={certSubtitle}
                        presentedTo={certPresentedTo}
                        content={certDescription}
                        editable={true}
                        signatureWidth={certSignatureWidth}
                        signatureFontSize={certSignatureFontSize}
                        signatureOrder={certSignatureOrder}
                        sealSize={certSchoolStampWidth}
                        onUpdateField={(field, val) => {
                          if (field === 'title') setCertTitle(val)
                          if (field === 'subtitle') setCertSubtitle(val)
                          if (field === 'content') setCertDescription(val)
                          if (field === 'schoolName') setSchoolName(val)
                          if (field === 'date') setCertDateOfIssue(val)
                          if (field === 'triggerLogoUpload') certLogoFileInputRef.current?.click()
                          if (field === 'schoolNameFontSize') setCertSchoolNameFontSize(String(val))
                          if (field === 'titleFontSize') setCertTitleFontSize(String(val))
                          if (field === 'subtitleFontSize') setCertSubtitleFontSize(String(val))
                          if (field === 'qrCodeSize') setCertQrCodeSize(String(val))
                          if (field === 'photoWidth') setCertPhotoWidth(String(val))
                          if (field === 'photoHeight') setCertPhotoHeight(String(val))
                        }}
                        onUpdateLabel={(key, val) => {
                          if (key === 'presented_to') setCertPresentedTo(val)
                          setCertCustomLabelsState(prev => ({ ...prev, [key]: val }))
                        }}
                        studentName="Aarav Sharma"
                        fatherName="Rajesh Sharma"
                        motherName="Sunita Sharma"
                        rollNo="24"
                        admissionNo="ADM-2025-108"
                        className={classes[0]?.className || 'Class X'}
                        section={classes[0]?.sections?.[0] || 'Section A'}
                        dob="15/08/2010"
                        gender="Male"
                        studentPhoto=""
                        examName={examName || 'Final Term Examination'}
                        session={session || '2025-2026'}
                        date={certDateOfIssue || dateOfExam || '15 October 2026'}
                        awarder={certPrincipalSignLabel || "Principal & Director"}
                        principalName={certPrincipalName || principalName || 'Dr. S. K. Sharma'}
                        principalLabel={certPrincipalSignLabel || "Principal & Director"}
                        teacherSignName={certTeacherSignName}
                        teacherSignLabel={certTeacherSignLabel}
                        controllerSignName={certControllerSignName}
                        controllerSignLabel={certControllerSignLabel}
                        secondarySignName={certSecondarySignName || 'Authorized Signatory'}
                        secondarySignLabel={certSecondarySignLabel || 'Authority Signature'}
                        parentSignName={certParentSignName}
                        parentSignLabel={certParentSignLabel}
                        studentSignLabel={certStudentSignLabel}
                        showSeal={certDisplayFields.officialSeal}
                        showQr={certDisplayFields.qrCode}
                        qrCodeSize={certQrCodeSize}
                        photoWidth={certPhotoWidth}
                        photoHeight={certPhotoHeight}
                        hiddenFields={certHiddenFields}
                        customLabels={certCustomLabels}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Content & Narrative Text Setup */}
            <div className="bg-white dark:bg-slate-900 border border-blue-200/90 dark:border-blue-800/70 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-blue-200/50 dark:border-blue-800/40 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      Certificate Content & Narrative Text Setup
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Customize certificate titles, presentation line, and the body narrative description. Changes apply instantly to all templates.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[10.5px] text-blue-800 dark:text-blue-300 font-bold self-start sm:self-auto">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Click text on preview below to edit live</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Certificate Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Certificate Main Title
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Header Title</span>
                  </div>
                  <input
                    type="text"
                    value={certTitle}
                    onChange={e => setCertTitle(e.target.value)}
                    placeholder="CERTIFICATE OF ACHIEVEMENT"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-slate-50/50 dark:bg-slate-800/70 font-bold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-all shadow-2xs"
                  />
                  {/* Quick Suggestions */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      'CERTIFICATE OF ACHIEVEMENT',
                      'CERTIFICATE OF EXCELLENCE',
                      'CERTIFICATE OF MERIT',
                      'CERTIFICATE OF COMPLETION',
                      'PARTICIPATION CERTIFICATE'
                    ].map(titlePreset => (
                      <button
                        key={titlePreset}
                        type="button"
                        onClick={() => setCertTitle(titlePreset)}
                        className={`text-[9.5px] px-2 py-0.5 rounded-lg border font-semibold transition-all ${
                          certTitle === titlePreset 
                            ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {titlePreset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Certificate Subtitle / Tagline */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Certificate Subtitle / Tagline
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Under Title</span>
                  </div>
                  <input
                    type="text"
                    value={certSubtitle}
                    onChange={e => setCertSubtitle(e.target.value)}
                    placeholder="IN RECOGNITION OF ACADEMIC EXCELLENCE"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-slate-50/50 dark:bg-slate-800/70 font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-all shadow-2xs"
                  />
                  {/* Quick Suggestions */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      'IN RECOGNITION OF ACADEMIC EXCELLENCE',
                      'FOR OUTSTANDING PERFORMANCE & CONDUCT',
                      'FOR MERITORIOUS SCHOLASTIC PERFORMANCE',
                      'ACADEMIC SESSION 2025-2026'
                    ].map(subPreset => (
                      <button
                        key={subPreset}
                        type="button"
                        onClick={() => setCertSubtitle(subPreset)}
                        className={`text-[9.5px] px-2 py-0.5 rounded-lg border font-semibold transition-all ${
                          certSubtitle === subPreset 
                            ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {subPreset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Salutation / Certify Line */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Presentation Salutation / Certify Heading
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Above Student Name</span>
                </div>
                <input
                  type="text"
                  value={certPresentedTo}
                  onChange={e => setCertPresentedTo(e.target.value)}
                  placeholder="THIS CERTIFICATE IS PROUDLY PRESENTED TO"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-slate-50/50 dark:bg-slate-800/70 font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-all shadow-2xs"
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  {[
                    'THIS CERTIFICATE IS PROUDLY PRESENTED TO',
                    'THIS IS TO CERTIFY THAT',
                    'THIS HONOR & DISTINCTION IS BESTOWED UPON',
                    'THIS OFFICIAL DOCUMENT CONFIRMS THAT'
                  ].map(pres => (
                    <button
                      key={pres}
                      type="button"
                      onClick={() => setCertPresentedTo(pres)}
                      className={`text-[9.5px] px-2 py-0.5 rounded-lg border font-semibold transition-all ${
                        certPresentedTo === pres 
                          ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {pres}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Narrative / Description Text */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Certificate Narrative / Body Description Text
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Award statement displayed below student details</span>
                </div>
                <textarea
                  rows={3}
                  value={certDescription}
                  onChange={e => setCertDescription(e.target.value)}
                  placeholder="This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement during the academic session."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-slate-50/50 dark:bg-slate-800/70 font-medium text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-all shadow-2xs leading-relaxed"
                />

                {/* Quick Narrative Presets */}
                <div className="space-y-1 pt-1">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quick Preset Templates (Click to apply):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setCertDescription('This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement during the academic session.')}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-all group"
                    >
                      <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 group-hover:underline">Academic Excellence</div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">Proudly awarded in recognition of outstanding performance and commendable achievement...</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCertDescription('This is to certify that the student named above has satisfactorily completed the prescribed curriculum and demonstrated commendable academic achievement during the academic session.')}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-all group"
                    >
                      <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 group-hover:underline">Standard "To Certify That"</div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">This is to certify that the student has satisfactorily completed the prescribed curriculum...</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCertDescription('Conferred with high distinction in recognition of securing top honors, extraordinary scholastic merit, and exemplary conduct in the annual examination.')}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-all group"
                    >
                      <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 group-hover:underline">Merit & Rank Distinction</div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">Conferred with high distinction in recognition of securing top honors and extraordinary scholastic merit...</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCertDescription('Presented in high appreciation for active participation, dedicated sportsmanship, and outstanding contribution to institutional activities and co-curricular programs.')}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-all group"
                    >
                      <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline">Sports & Co-Curricular</div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">In high appreciation for active participation, sportsmanship, and outstanding contribution...</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Categorized Display Fields on Certificate */}
            <div className="space-y-4 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-2">
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide block">
                    Show / Hide Fields on Certificate
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Check or uncheck individual student credentials or layout elements to show or hide them dynamically on the printable certificate preview. Signatures are managed below.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-700 select-none shrink-0 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800/60 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={isCertAllSelected}
                    onChange={e => handleCertSelectAllChange(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 rounded"
                  />
                  <span>Master Select All ({CERTIFICATE_DISPLAY_FIELDS_KEYS.length} Fields)</span>
                </label>
              </div>

              {/* Category 1: Student Information & Academic Credentials */}
              <div className="p-4 rounded-2xl border border-blue-200/80 dark:border-blue-800/60 bg-blue-50/20 dark:bg-blue-950/10 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200/50 dark:border-blue-800/40">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                        Student Personal & Academic Fields
                      </span>
                      <span className="ml-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                        {CERTIFICATE_DISPLAY_FIELDS_KEYS.filter(f => f.category === 'student').length} Fields
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => handleCertCategoryToggle('student', true)}
                      className="text-blue-600 hover:underline"
                    >
                      Show All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleCertCategoryToggle('student', false)}
                      className="text-slate-500 hover:underline"
                    >
                      Hide All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {CERTIFICATE_DISPLAY_FIELDS_KEYS.filter(f => f.category === 'student').map(f => {
                    const isChecked = !!certDisplayFields[f.key]
                    return (
                      <label 
                        key={f.key} 
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked 
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-200 shadow-2xs font-bold' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 font-medium hover:border-slate-300 opacity-80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCertCheckboxChange(f.key)}
                          className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 rounded"
                        />
                        <span className="truncate">{f.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Category 2: Institutional & General Layout Fields */}
              <div className="p-4 rounded-2xl border border-blue-200/80 dark:border-blue-800/60 bg-blue-50/20 dark:bg-blue-950/10 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200/50 dark:border-blue-800/40">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <School className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                        Institutional & General Layout
                      </span>
                      <span className="ml-2 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                        {CERTIFICATE_DISPLAY_FIELDS_KEYS.filter(f => f.category === 'institutional').length} Layout Items
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => handleCertCategoryToggle('institutional', true)}
                      className="text-blue-600 hover:underline"
                    >
                      Show All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleCertCategoryToggle('institutional', false)}
                      className="text-slate-500 hover:underline"
                    >
                      Hide All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {CERTIFICATE_DISPLAY_FIELDS_KEYS.filter(f => f.category === 'institutional').map(f => {
                    const isChecked = !!certDisplayFields[f.key]
                    return (
                      <label 
                        key={f.key} 
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked 
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-200 shadow-2xs font-bold' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 font-medium hover:border-slate-300 opacity-80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCertCheckboxChange(f.key)}
                          className="w-3.5 h-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 rounded"
                        />
                        <span className="truncate">{f.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* AUTHORITY SIGNATURES (CHOOSE ANY 4) & OFFICIAL SEAL SETUP CARDS */}
            {(() => {
              const certActiveSignKeys = certSignatureOrder.filter(k => !!certDisplayFields[k])

              const labelMap: Record<string, string> = {
                principalSign: 'Principal Sign',
                teacherSign: 'Class Teacher',
                controllerSign: 'Exam Controller',
                secondarySign: 'Authority Signature',
                parentSign: 'Parent / Guardian',
                studentSign: 'Student Sign Line'
              }

              return (
                <div className="border border-blue-200/80 dark:border-blue-800/60 rounded-2xl overflow-hidden bg-blue-50/30 dark:bg-slate-900/50 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-blue-200/60 dark:border-slate-800 gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <Stamp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Authority Signatures & Verification Setup</span>
                        <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                          {certActiveSignKeys.length} / 4 Active
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Enable or disable required signatories and arrange their left-to-right printing sequence using the Move buttons.
                      </p>
                    </div>

                    {/* Sequence Presets */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Order Presets:</span>
                      <button
                        type="button"
                        onClick={() => setCertSignatureOrder(['teacherSign', 'controllerSign', 'secondarySign', 'principalSign', 'parentSign', 'studentSign'])}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-2xs"
                      >
                        Teacher First
                      </button>
                      <button
                        type="button"
                        onClick={() => setCertSignatureOrder(['principalSign', 'teacherSign', 'controllerSign', 'secondarySign', 'parentSign', 'studentSign'])}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-2xs"
                      >
                        Principal First
                      </button>
                      <button
                        type="button"
                        onClick={() => setCertSignatureOrder(['teacherSign', 'controllerSign', 'secondarySign', 'studentSign', 'parentSign', 'principalSign'])}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-2xs"
                      >
                        Principal Last
                      </button>
                    </div>
                  </div>

                  {/* Live Sequence Ribbon Indicator */}
                  <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto">
                    <span className="text-[10px] font-black uppercase text-slate-400 px-2 shrink-0">Print Sequence:</span>
                    {certSignatureOrder.map((key, idx) => {
                      const isEnabled = !!certDisplayFields[key]
                      return (
                        <React.Fragment key={key}>
                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold shrink-0 transition-all border ${
                            isEnabled 
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300' 
                              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                          }`}>
                            <span className="w-4 h-4 rounded-full bg-white dark:bg-slate-800 text-[9px] font-black flex items-center justify-center shadow-2xs border border-slate-200 dark:border-slate-700">
                              {idx + 1}
                            </span>
                            <span>{labelMap[key] || key}</span>
                          </div>
                          {idx < certSignatureOrder.length - 1 && (
                            <span className="text-slate-300 dark:text-slate-600 text-xs shrink-0">→</span>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>

                  {/* Certificate Signature Sizing & Seal Controls (All Together with Signatories) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    {/* Signature Line Width */}
                    <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Signature Line Width</span>
                        <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                          {certSignatureWidth} px
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700">
                        {[
                          { label: 'S (75px)', size: '75' },
                          { label: 'M (100px)', size: '100' },
                          { label: 'L (130px)', size: '130' },
                          { label: 'XL (165px)', size: '165' }
                        ].map(p => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setCertSignatureWidth(p.size)}
                            className={`py-1 rounded text-[10px] font-bold transition-all ${
                              certSignatureWidth === p.size
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {p.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>

                      <div className="pt-1 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-semibold w-12 shrink-0">Width:</span>
                          <input
                            type="range"
                            min="50"
                            max="180"
                            step="5"
                            value={Number(certSignatureWidth) || 110}
                            onChange={e => setCertSignatureWidth(e.target.value)}
                            className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{certSignatureWidth}px</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Adjusts width of principal, teacher, controller, and authority sign lines.</p>
                      </div>
                    </div>

                    {/* Official Seal / Stamp Diameter */}
                    <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Official Seal Diameter</span>
                        <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                          {certSchoolStampWidth} px
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700">
                        {[
                          { label: 'S (44px)', size: '44' },
                          { label: 'M (56px)', size: '56' },
                          { label: 'L (70px)', size: '70' },
                          { label: 'XL (84px)', size: '84' }
                        ].map(p => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setCertSchoolStampWidth(p.size)}
                            className={`py-1 rounded text-[10px] font-bold transition-all ${
                              certSchoolStampWidth === p.size
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {p.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>

                      <div className="pt-1 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-semibold w-12 shrink-0">Diameter:</span>
                          <input
                            type="range"
                            min="36"
                            max="90"
                            step="2"
                            value={Number(certSchoolStampWidth) || 56}
                            onChange={e => setCertSchoolStampWidth(e.target.value)}
                            className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{certSchoolStampWidth}px</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Scales circular gold/merit official verification seal mark on certificate.</p>
                      </div>
                    </div>

                    {/* Signature Font Size */}
                    <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Signature Text Font Size</span>
                        <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                          {certSignatureFontSize} px
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700">
                        {[
                          { label: '8px', size: '8' },
                          { label: '9px', size: '9' },
                          { label: '10px', size: '10' },
                          { label: '11px', size: '11' }
                        ].map(p => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setCertSignatureFontSize(p.size)}
                            className={`py-1 rounded text-[10px] font-bold transition-all ${
                              certSignatureFontSize === p.size
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>

                      <div className="pt-1 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-semibold w-12 shrink-0">Scale:</span>
                          <input
                            type="range"
                            min="7"
                            max="14"
                            step="0.5"
                            value={Number(certSignatureFontSize) || 9}
                            onChange={e => setCertSignatureFontSize(e.target.value)}
                            className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{certSignatureFontSize}px</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 mt-2">
                          <p className="text-[10px] text-slate-400">Controls signatory titles & designations.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setCertSignatureWidth(admitSignatureWidth)
                              setCertSignatureFontSize(admitSignatureFontSize)
                              toast.success(`Matched Certificate signature size to Admit Card (${admitSignatureWidth}px width, ${admitSignatureFontSize}px font)!`)
                            }}
                            className="text-[9.5px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline shrink-0"
                          >
                            Match Admit Card Size
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                    {certSignatureOrder.map((key, idx) => {
                      const isFirst = idx === 0
                      const isLast = idx === certSignatureOrder.length - 1

                      if (key === 'principalSign') {
                        return (
                          <div 
                            key={key} 
                            className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                              certDisplayFields.principalSign 
                                ? 'bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-700/80 shadow-xs ring-1 ring-blue-500/15' 
                                : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">Principal Sign</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    certDisplayFields.principalSign 
                                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                  }`}>
                                    {certDisplayFields.principalSign ? 'ON' : 'OFF'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCertCheckboxChange('principalSign')}
                                  className={`w-10 h-5.5 rounded-full relative transition-colors ${certDisplayFields.principalSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                  <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${certDisplayFields.principalSign ? 'left-5' : 'left-0.5'}`} />
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-[10.5px] text-blue-800 dark:text-blue-200 mb-2.5">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <div className="truncate">
                                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Auto-fetched from Institute:</span>
                                  <span className="font-extrabold capitalize text-blue-700 dark:text-blue-300">{principalName || 'Principal'}</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signatory Name</label>
                                    {principalName && (
                                      <button
                                        type="button"
                                        onClick={() => setCertPrincipalName(principalName)}
                                        className="text-[9px] font-bold text-blue-600 hover:text-blue-700 underline"
                                      >
                                        + Use Institute
                                      </button>
                                    )}
                                  </div>
                                  <input
                                    type="text"
                                    value={certPrincipalName}
                                    onChange={e => setCertPrincipalName(e.target.value)}
                                    disabled={!certDisplayFields.principalSign}
                                    placeholder={principalName || 'Dr. S. K. Sharma'}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label / Title</label>
                                  <input
                                    type="text"
                                    value={certPrincipalSignLabel}
                                    onChange={e => setCertPrincipalSignLabel(e.target.value)}
                                    disabled={!certDisplayFields.principalSign}
                                    placeholder="Principal & Director"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Reorder Buttons */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                              <span className="text-slate-400">Position #{idx + 1}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => moveCertSignature(idx, -1)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                                  title="Move Left"
                                >
                                  <MoveLeft className="w-3 h-3" /> Move Left
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => moveCertSignature(idx, 1)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                                  title="Move Right"
                                >
                                  Move Right <MoveRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      if (key === 'teacherSign') {
                        return (
                          <div 
                            key={key} 
                            className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                              certDisplayFields.teacherSign 
                                ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                                : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">Class Teacher</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    certDisplayFields.teacherSign 
                                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                  }`}>
                                    {certDisplayFields.teacherSign ? 'ON' : 'OFF'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCertCheckboxChange('teacherSign')}
                                  className={`w-10 h-5.5 rounded-full relative transition-colors ${certDisplayFields.teacherSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                  <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${certDisplayFields.teacherSign ? 'left-5' : 'left-0.5'}`} />
                                </button>
                              </div>

                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Teacher's Name</label>
                                  <input
                                    type="text"
                                    value={certTeacherSignName}
                                    onChange={e => setCertTeacherSignName(e.target.value)}
                                    disabled={!certDisplayFields.teacherSign}
                                    placeholder="Mrs. Kavita Verma"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                                  <input
                                    type="text"
                                    value={certTeacherSignLabel}
                                    onChange={e => setCertTeacherSignLabel(e.target.value)}
                                    disabled={!certDisplayFields.teacherSign}
                                    placeholder="Class Teacher's Sign"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Reorder Buttons */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                              <span className="text-slate-400">Position #{idx + 1}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => moveCertSignature(idx, -1)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                                  title="Move Left"
                                >
                                  <MoveLeft className="w-3 h-3" /> Move Left
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => moveCertSignature(idx, 1)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                                  title="Move Right"
                                >
                                  Move Right <MoveRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      if (key === 'controllerSign') {
                        return (
                          <div 
                            key={key} 
                            className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                              certDisplayFields.controllerSign 
                                ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                                : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">Exam Controller</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    certDisplayFields.controllerSign 
                                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                  }`}>
                                    {certDisplayFields.controllerSign ? 'ON' : 'OFF'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCertCheckboxChange('controllerSign')}
                                  className={`w-10 h-5.5 rounded-full relative transition-colors ${certDisplayFields.controllerSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                  <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${certDisplayFields.controllerSign ? 'left-5' : 'left-0.5'}`} />
                                </button>
                              </div>

                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Controller Name</label>
                                  <input
                                    type="text"
                                    value={certControllerSignName}
                                    onChange={e => setCertControllerSignName(e.target.value)}
                                    disabled={!certDisplayFields.controllerSign}
                                    placeholder="Mr. R. K. Saxena"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Label</label>
                                  <input
                                    type="text"
                                    value={certControllerSignLabel}
                                    onChange={e => setCertControllerSignLabel(e.target.value)}
                                    disabled={!certDisplayFields.controllerSign}
                                    placeholder="Exam Controller"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Reorder Buttons */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                              <span className="text-slate-400">Position #{idx + 1}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => moveCertSignature(idx, -1)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                                  title="Move Left"
                                >
                                  <MoveLeft className="w-3 h-3" /> Move Left
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => moveCertSignature(idx, 1)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                                  title="Move Right"
                                >
                                  Move Right <MoveRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      if (key === 'secondarySign') {
                        return (
                          <div 
                            key={key} 
                            className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                              certDisplayFields.secondarySign 
                                ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                                : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">Authority Signature</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    certDisplayFields.secondarySign 
                                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                  }`}>
                                    {certDisplayFields.secondarySign ? 'ON' : 'OFF'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCertCheckboxChange('secondarySign')}
                                  className={`w-10 h-5.5 rounded-full relative transition-colors ${certDisplayFields.secondarySign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                  <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${certDisplayFields.secondarySign ? 'left-5' : 'left-0.5'}`} />
                                </button>
                              </div>

                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signatory Name</label>
                                  <input
                                    type="text"
                                    value={certSecondarySignName}
                                    onChange={e => setCertSecondarySignName(e.target.value)}
                                    disabled={!certDisplayFields.secondarySign}
                                    placeholder="Authorized Signatory"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signatory Title / Role</label>
                                  <input
                                    type="text"
                                    value={certSecondarySignLabel}
                                    onChange={e => setCertSecondarySignLabel(e.target.value)}
                                    disabled={!certDisplayFields.secondarySign}
                                    placeholder="Authority Signature"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Reorder Buttons */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                              <span className="text-slate-400">Position #{idx + 1}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => moveCertSignature(idx, -1)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                                  title="Move Left"
                                >
                                  <MoveLeft className="w-3 h-3" /> Move Left
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => moveCertSignature(idx, 1)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                                  title="Move Right"
                                >
                                  Move Right <MoveRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      if (key === 'parentSign') {
                        return (
                          <div 
                            key={key} 
                            className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                              certDisplayFields.parentSign 
                                ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                                : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">Parent / Guardian</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    certDisplayFields.parentSign 
                                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                  }`}>
                                    {certDisplayFields.parentSign ? 'ON' : 'OFF'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCertCheckboxChange('parentSign')}
                                  className={`w-10 h-5.5 rounded-full relative transition-colors ${certDisplayFields.parentSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                  <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${certDisplayFields.parentSign ? 'left-5' : 'left-0.5'}`} />
                                </button>
                              </div>

                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signatory Name / Label</label>
                                  <input
                                    type="text"
                                    value={certParentSignName}
                                    onChange={e => setCertParentSignName(e.target.value)}
                                    disabled={!certDisplayFields.parentSign}
                                    placeholder="Parent / Guardian"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Title</label>
                                  <input
                                    type="text"
                                    value={certParentSignLabel}
                                    onChange={e => setCertParentSignLabel(e.target.value)}
                                    disabled={!certDisplayFields.parentSign}
                                    placeholder="Parent's Signature"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Reorder Buttons */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                              <span className="text-slate-400">Position #{idx + 1}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => moveCertSignature(idx, -1)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                                  title="Move Left"
                                >
                                  <MoveLeft className="w-3 h-3" /> Move Left
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => moveCertSignature(idx, 1)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                                  title="Move Right"
                                >
                                  Move Right <MoveRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      if (key === 'studentSign') {
                        return (
                          <div 
                            key={key} 
                            className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 ${
                              certDisplayFields.studentSign 
                                ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                                : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">Student Sign Line</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    certDisplayFields.studentSign 
                                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                  }`}>
                                    {certDisplayFields.studentSign ? 'ON' : 'OFF'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCertCheckboxChange('studentSign')}
                                  className={`w-10 h-5.5 rounded-full relative transition-colors ${certDisplayFields.studentSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                  <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${certDisplayFields.studentSign ? 'left-5' : 'left-0.5'}`} />
                                </button>
                              </div>

                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signature Line Label</label>
                                  <input
                                    type="text"
                                    value={certStudentSignLabel}
                                    onChange={e => setCertStudentSignLabel(e.target.value)}
                                    disabled={!certDisplayFields.studentSign}
                                    placeholder="Student's Signature"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                                  />
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                                  Provides candidate signature verification line on the certificate footer.
                                </p>
                              </div>
                            </div>

                            {/* Reorder Buttons */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] font-bold">
                              <span className="text-slate-400">Position #{idx + 1}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => moveCertSignature(idx, -1)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                                  title="Move Left"
                                >
                                  <MoveLeft className="w-3 h-3" /> Move Left
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => moveCertSignature(idx, 1)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-950 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                                  title="Move Right"
                                >
                                  Move Right <MoveRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      return null
                    })}
                {/* 7. Official Gold Seal / Crest */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  certDisplayFields.officialSeal 
                    ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                    : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                }`}>
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">Official Seal</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        certDisplayFields.officialSeal 
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {certDisplayFields.officialSeal ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCertCheckboxChange('officialSeal')}
                      className={`w-10 h-5.5 rounded-full relative transition-colors ${certDisplayFields.officialSeal ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${certDisplayFields.officialSeal ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Seal Crest Text</label>
                      <input
                        type="text"
                        value={certSealLabel}
                        onChange={e => setCertSealLabel(e.target.value)}
                        disabled={!certDisplayFields.officialSeal}
                        placeholder="ACADEMIC EXCELLENCE"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs uppercase"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40 text-[10px] text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                      <span>Vector 300 DPI Institutional Crest with themed ribbon</span>
                    </div>
                  </div>
                </div>

                {/* 8. Date of Issue */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  certDisplayFields.dateOfIssue 
                    ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10' 
                    : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                }`}>
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">Date of Issue</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        certDisplayFields.dateOfIssue 
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {certDisplayFields.dateOfIssue ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCertCheckboxChange('dateOfIssue')}
                      className={`w-10 h-5.5 rounded-full relative transition-colors ${certDisplayFields.dateOfIssue ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${certDisplayFields.dateOfIssue ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date Footer Title</label>
                      <input
                        type="text"
                        value={certDateLabel}
                        onChange={e => setCertDateLabel(e.target.value)}
                        disabled={!certDisplayFields.dateOfIssue}
                        placeholder="Date of Issue"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Certificate Issue Date / Event Date</label>
                      <input
                        type="text"
                        value={certDateOfIssue}
                        onChange={e => setCertDateOfIssue(e.target.value)}
                        disabled={!certDisplayFields.dateOfIssue}
                        placeholder="e.g. 15 October 2026"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 focus:border-blue-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
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
              className="flex items-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}



          {currentStep !== 'Certificate Design' ? (
            <button 
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Save & Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSaveSetup}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
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
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>Interactive Marksheet Preview</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                      {previewTargetTemplate || selectedTemplate}
                    </span>
                  </h3>
                  <div className="text-[11px] text-blue-600 font-semibold">
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
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
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
                  cgpaRanges={cgpaRanges}
                  enableGrade={enableGradeRemarks}
                  enableCgpa={enableCgpa}
                  enablePercentage={enablePercentRemarks}
                  enableDivision={enableDivisionRemarks}
                  schoolName={schoolName}
                  affiliateTo={affiliateTo}
                  schoolAddress={schoolAddress}
                  schoolCode={schoolCode}
                  schoolLogo={admitSchoolLogo}
                  logoWidth={logoWidth}
                  showLogo={columnsList.logo !== false}
                  phone={phone}
                  email={email}
                  principalName={principalName}
                  headingHeader={headingHeader}
                  headerNameFontSize={marksheetHeaderNameFontSize}
                  headingFontSize={marksheetHeadingFontSize}
                  headerDetailsFontSize={marksheetHeaderDetailsFontSize}
                  dateOfIssue={marksheetDateOfIssue}
                  qrCodeSize={marksheetQrCodeSize}
                  signatureOrder={marksheetSignatureOrder}
                  signatureWidth={marksheetSignatureWidth}
                  signatureFontSize={marksheetSignatureFontSize}
                  showStudentPhoto={showStudentPhoto}
                  showRoundBorderPhoto={showRoundBorderPhoto}
                  showTestMarks={showTestMarks}
                  showHeaderSign={showHeaderSign}
                  showHeaderStamp={showHeaderStamp}
                  columnsList={{
                    ...columnsList,
                    percentage: enablePercentRemarks,
                    grade: enableGradeRemarks,
                    division: enableDivisionRemarks,
                    cgpa: enableCgpa
                  }}
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
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
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
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
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
            reportingTimeValue: admitReportingTime,
            gateClosureValue: admitGateClosureTime,
            timeTableId: 999999,
            session: session,
            schoolName: schoolName || 'COSMOPOLITAN INTER COLLEGE',
            schoolAddress: schoolAddress || 'Green Park Sector 4, New Delhi',
            displayFields: admitDisplayFields,
            templateStyle: previewTargetAdmitStyle || admitTemplateStyle,
            themeColor: admitThemeColor,
            status: admitCardStatus ? 'Active' : 'Inactive',
            instructions: admitInstructions || '1. Reporting & Gate Closure Time: Candidates must report to the examination center by 09:30 AM IST. Gate closure time is 09:50 AM (Sharp).\n2. Bring this original Admit Card along with Institute Student ID.\n3. Electronic devices, smartwatches, and study materials are strictly prohibited in the exam hall.\n4. Maintain discipline and follow invigilator guidelines at all times.',
            showExamTimeTable: showExamTimeTableOnAdmit,
            noOfPrintPerPage: admitNoOfPrintPerPage,
            headerNameFontSize: admitHeaderNameFontSize,
            headerDetailsFontSize: admitHeaderDetailsFontSize,
            studentDetailsFontSize: admitStudentDetailsFontSize,
            timetableDetailsFontSize: admitTimetableDetailsFontSize,
            headingFontSize: admitHeadingFontSize,
            defaultFontSize: admitDefaultFontSize,
            spacing: admitSpacing,
            studentPhotoSize: admitStudentPhotoWidth,
            studentPhotoWidth: admitStudentPhotoWidth,
            studentPhotoHeight: admitStudentPhotoHeight,
            teacherSignLabel: admitTeacherSignLabel,
            studentSignLabel: admitStudentSignLabel,
            parentSignLabel: admitParentSignLabel,
            principalSignLabel: admitPrincipalSignLabel,
            schoolLogo: admitSchoolLogo,
            schoolLogoWidth: admitSchoolLogoWidth,
            schoolLogoHeight: admitSchoolLogoHeight || admitSchoolLogoWidth,
            logoPosition: admitLogoPosition,
            contentPosition: admitContentPosition,
            photoPosition: admitPhotoPosition,
            signatureWidth: admitSignatureWidth,
            schoolStampWidth: admitSchoolStampWidth,
            signatureOrder: admitSignatureOrder,
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
                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>Certificate Live Preview</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
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
                  schoolLogo={admitSchoolLogo}
                  logoWidth={Number(logoWidth) || 60}
                  showLogo={certDisplayFields.logo !== false}
                  schoolNameFontSize={certSchoolNameFontSize}
                  titleFontSize={certTitleFontSize}
                  subtitleFontSize={certSubtitleFontSize}
                  title={certTitle}
                  subtitle={certSubtitle}
                  presentedTo={certPresentedTo}
                  content={certDescription}
                  editable={true}
                  onUpdateField={(field, val) => {
                    if (field === 'title') setCertTitle(val)
                    if (field === 'subtitle') setCertSubtitle(val)
                    if (field === 'content') setCertDescription(val)
                    if (field === 'schoolName') setSchoolName(val)
                    if (field === 'date') setCertDateOfIssue(val)
                    if (field === 'triggerLogoUpload') certLogoFileInputRef.current?.click()
                    if (field === 'schoolNameFontSize') setCertSchoolNameFontSize(String(val))
                    if (field === 'titleFontSize') setCertTitleFontSize(String(val))
                    if (field === 'subtitleFontSize') setCertSubtitleFontSize(String(val))
                    if (field === 'qrCodeSize') setCertQrCodeSize(String(val))
                    if (field === 'photoWidth') setCertPhotoWidth(String(val))
                    if (field === 'photoHeight') setCertPhotoHeight(String(val))
                  }}
                  onUpdateLabel={(key, val) => {
                    if (key === 'presented_to') setCertPresentedTo(val)
                    setCertCustomLabelsState(prev => ({ ...prev, [key]: val }))
                  }}
                  studentName="Aarav Sharma"
                  fatherName="Rajesh Sharma"
                  motherName="Sunita Sharma"
                  rollNo="24"
                  admissionNo="ADM-2025-108"
                  className={classes[0]?.className || 'Class X'}
                  section={classes[0]?.sections?.[0] || 'Section A'}
                  dob="15/08/2010"
                  gender="Male"
                  studentPhoto=""
                  examName={examName || 'Final Term Examination'}
                  session={session || '2025-2026'}
                  date={certDateOfIssue || dateOfExam || '15 October 2026'}
                  awarder={certPrincipalSignLabel || "Principal & Director"}
                  principalName={certPrincipalName || principalName || 'Dr. S. K. Sharma'}
                  principalLabel={certPrincipalSignLabel || "Principal & Director"}
                  teacherSignName={certTeacherSignName}
                  teacherSignLabel={certTeacherSignLabel}
                  controllerSignName={certControllerSignName}
                  controllerSignLabel={certControllerSignLabel}
                  secondarySignName={certSecondarySignName || 'Authorized Signatory'}
                  secondarySignLabel={certSecondarySignLabel || 'Authority Signature'}
                  parentSignName={certParentSignName}
                  parentSignLabel={certParentSignLabel}
                  studentSignLabel={certStudentSignLabel}
                  showSeal={certDisplayFields.officialSeal}
                  showQr={certDisplayFields.qrCode}
                  qrCodeSize={certQrCodeSize}
                  photoWidth={certPhotoWidth}
                  photoHeight={certPhotoHeight}
                  signatureWidth={certSignatureWidth}
                  signatureFontSize={certSignatureFontSize}
                  signatureOrder={certSignatureOrder}
                  sealSize={certSchoolStampWidth}
                  hiddenFields={certHiddenFields}
                  customLabels={certCustomLabels}
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
                    className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
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
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
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
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
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
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading Exam & Admit Setup Wizard...</p>
      </div>
    }>
      <AddSetupWizardContent />
    </Suspense>
  )
}

'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { 
  X, 
  Check, 
  Award, 
  Sparkles, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  CheckCircle2, 
  Palette, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sliders,
  FileText,
  ShieldCheck,
  Feather,
  LayoutTemplate,
  UserCheck,
  Users,
  GraduationCap,
  Calendar,
  QrCode,
  PenTool,
  Type,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { SampleSchoolLogo } from '@/components/admit-card/AdmitCardModalPreview'
import { 
  CertificateDesign1, 
  CertificateDesign2, 
  CertificateDesign3, 
  CertificateDesign4,
  CertificateMiniPreview,
  CERTIFICATE_COLOR_PRESETS
} from '@/components/certificates/CertificateTemplates'
import { saveCertificateType, fetchCertificateTypes } from '../../actions'
import { fetchInstituteName } from '@/app/institute/actions'

function loadInstituteAddedClasses(): string[] {
  if (typeof window === 'undefined') return []
  const classesSet = new Set<string>()

  // 1. Load from school_masters_classes (Masters > Classes)
  try {
    const saved = localStorage.getItem('school_masters_classes')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        parsed
          .filter((c: any) => !c.deleted)
          .forEach((c: any) => {
            const name = (c.className || c.name || c.title || '').trim()
            if (name) classesSet.add(name)
          })
      }
    }
  } catch (e) {}

  // 2. Load from school_masters_sections
  try {
    const saved = localStorage.getItem('school_masters_sections')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        parsed
          .filter((s: any) => !s.deleted)
          .forEach((s: any) => {
            const name = (s.className || '').trim()
            if (name) classesSet.add(name)
          })
      }
    }
  } catch (e) {}

  // 3. Load from school_classes or school_institute_classes
  try {
    const saved = localStorage.getItem('school_classes') || localStorage.getItem('school_institute_classes')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        parsed.forEach((c: any) => {
          const name = typeof c === 'string' ? c.trim() : (c.className || c.name || '').trim()
          if (name) classesSet.add(name)
        })
      }
    }
  } catch (e) {}

  // 4. Load from school_institute_students
  try {
    const saved = localStorage.getItem('school_institute_students')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        parsed.forEach((s: any) => {
          const name = (s.class || s.className || '').trim()
          if (name) classesSet.add(name)
        })
      }
    }
  } catch (e) {}

  return Array.from(classesSet)
}

const CERTIFICATE_TITLE_PRESETS = [
  {
    title: 'Character Certificate',
    subtitle: 'Official Moral Conduct & Character Verification',
    narrative: 'This is to certify that [Student Name], Son/Daughter of [Father Name], has been a bonafide student of this institution. During their tenure here, their conduct, character, and moral discipline have been found to be exemplary.',
    tag: 'Conduct'
  },
  {
    title: 'Sports Certificate',
    subtitle: 'In Recognition of Outstanding Athletic Performance',
    narrative: 'This certificate of sporting distinction is proudly presented to [Student Name] for exceptional prowess, spirit of sportsmanship, and outstanding athletic achievement in the annual sports championship.',
    tag: 'Sports'
  },
  {
    title: 'Bravery Certificate',
    subtitle: 'For Extraordinary Courage & Valor',
    narrative: 'This award of honor is solemnly presented to [Student Name] in recognition of extraordinary presence of mind, selfless valor, and commendable acts of courage exhibited with distinction.',
    tag: 'Bravery'
  },
  {
    title: 'Certificate of Achievement',
    subtitle: 'In Recognition of Academic Excellence',
    narrative: 'This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement.',
    tag: 'Academic'
  },
  {
    title: 'Certificate of Merit',
    subtitle: 'In Recognition of Outstanding Distinction & Rank',
    narrative: 'This is to certify that [Student Name] has secured an outstanding position of merit and distinction in their academic studies during the session.',
    tag: 'Merit'
  },
  {
    title: 'Course Completion Certificate',
    subtitle: 'Successful Completion of Prescribed Curriculum',
    narrative: 'This is to certify that [Student Name] has successfully completed all required coursework, academic assessments, and curriculum objectives with distinction.',
    tag: 'Curriculum'
  },
  {
    title: 'Bonafide Certificate',
    subtitle: 'Institutional Enrollment & Student Status Verification',
    narrative: 'This is to certify that [Student Name] is a bonafide student of this institution currently pursuing their studies in the designated class and academic session.',
    tag: 'Verification'
  },
  {
    title: 'School Leaving Certificate (TC)',
    subtitle: 'Transfer & Institutional Clearance Document',
    narrative: 'This is to certify that [Student Name] was a student of this school and has cleared all institutional obligations. Their general conduct and progress have been satisfactory.',
    tag: 'Transfer'
  },
  {
    title: 'Certificate of Participation',
    subtitle: 'For Active Engagement & Enthusiastic Contribution',
    narrative: 'Awarded to [Student Name] in recognition of active participation, valuable dedication, and enthusiastic involvement in institutional activities and programs.',
    tag: 'Participation'
  }
]

const TITLE_SUGGESTIONS = [
  'Certificate of Achievement',
  'Certificate of Merit & Excellence',
  'Character Certificate',
  'Sports & Athletics Award',
  'Certificate of Participation',
  'Course & Curriculum Completion',
  'Bonafide Certificate',
  'Outstanding Student Award'
]

const HIDDEN_FIELDS_LIST = [
  'Title', 'School Name', 'Tagline', 'School Address',
  'Water Mark', 'Student Name'
]

function CertificateTypeCreateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  // Top Settings
  const [prefix, setPrefix] = useState('CER/2025/')
  const [startNo, setStartNo] = useState('101')

  // Target Classes (ONLY added classes)
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [classSearch, setClassSearch] = useState('')

  // Theme & Design Selection
  const [themeColor, setThemeColor] = useState<string>('#1E3A8A')
  const [selectedDesign, setSelectedDesign] = useState<number>(1)
  const [customHexInput, setCustomHexInput] = useState('#1E3A8A')

  // Certificate Texts (Two-way synced with Canvas)
  const [title, setTitle] = useState('Certificate of Achievement')
  const [subtitle, setSubtitle] = useState('In Recognition of Academic Excellence')
  const [presentedTo, setPresentedTo] = useState('THIS CERTIFICATE IS PROUDLY PRESENTED TO')
  const [schoolName, setSchoolName] = useState('COSMOPOLITAN INTER COLLEGE')
  const [schoolAddress, setSchoolAddress] = useState('Knowledge Park, Sector 62, New Delhi')
  const [sampleStudentName, setSampleStudentName] = useState('Aarav Sharma')
  const [content, setContent] = useState(
    'This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement during the academic session.'
  )

  // ─── Signatures & Credentials State ───
  // 1. Principal & Director
  const [principalName, setPrincipalName] = useState('')
  const [principalLabel, setPrincipalLabel] = useState('Principal & Director')
  const [showPrincipalSign, setShowPrincipalSign] = useState(true)

  // 2. Class Teacher
  const [teacherSignName, setTeacherSignName] = useState('')
  const [teacherSignLabel, setTeacherSignLabel] = useState("Class Teacher's Sign")
  const [showTeacherSign, setShowTeacherSign] = useState(false)

  // 3. Exam Controller
  const [controllerSignName, setControllerSignName] = useState('')
  const [controllerSignLabel, setControllerSignLabel] = useState('Exam Controller')
  const [showControllerSign, setShowControllerSign] = useState(false)

  // 4. Authority Signature
  const [coordinatorSignName, setCoordinatorSignName] = useState('')
  const [coordinatorSignLabel, setCoordinatorSignLabel] = useState('Authority Signature')
  const [showCoordinatorSign, setShowCoordinatorSign] = useState(false)

  // Signature Order
  const [signatureOrder, setSignatureOrder] = useState<string[]>([
    'teacherSign',
    'controllerSign',
    'coordinatorSign',
    'parentSign',
    'studentSign',
    'principalSign'
  ])

  const handleMoveSignature = (key: string, direction: 'left' | 'right') => {
    setSignatureOrder(prev => {
      const index = prev.indexOf(key)
      if (index === -1) return prev
      const newIndex = direction === 'left' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= prev.length) return prev
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.splice(newIndex, 0, item)
      return next
    })
  }

  // 5. Parent / Guardian
  const [parentSignName, setParentSignName] = useState('')
  const [parentSignLabel, setParentSignLabel] = useState("Parent's Signature")
  const [showParentSign, setShowParentSign] = useState(false)

  // 6. Student / Candidate
  const [studentSignLabel, setStudentSignLabel] = useState("Student's Signature")
  const [showStudentSign, setShowStudentSign] = useState(false)

  // 7. Date of Issue
  const [issueDate, setIssueDate] = useState('15 October 2025')
  const [dateLabel, setDateLabel] = useState('Date of Issue')
  const [showIssueDate, setShowIssueDate] = useState(true)

  // 8. Seal & QR Code
  const [showSeal, setShowSeal] = useState(true)
  const [showQr, setShowQr] = useState(true)

  // Visibility / Hidden Fields (Default: only principal sign, issue date, seal & QR visible for a clean aesthetic)
  const [hiddenFields, setHiddenFields] = useState<string[]>([
    'Teacher Sign',
    'Controller Sign',
    'Coordinator Sign',
    'Parent Sign',
    'Student Sign'
  ])

  // ─── Brand Logo & Typography Studio State ───
  const [schoolLogo, setSchoolLogo] = useState<string>('')
  const [showLogo, setShowLogo] = useState<boolean>(true)
  const [logoWidth, setLogoWidth] = useState<string>('60')
  const [schoolNameFontSize, setSchoolNameFontSize] = useState<string>('14')
  const [titleFontSize, setTitleFontSize] = useState<string>('30')
  const [subtitleFontSize, setSubtitleFontSize] = useState<string>('11')
  const [photoWidth, setPhotoWidth] = useState<string>('48')
  const [qrCodeSize, setQrCodeSize] = useState<string>('68')
  const [sealSize, setSealSize] = useState<string>('60')
  const [signatureWidth, setSignatureWidth] = useState<string>('115')
  const [signatureFontSize, setSignatureFontSize] = useState<string>('9')

  const isPhotoVisible = !hiddenFields.includes('Student Photo') && !hiddenFields.includes('Photo')
  const togglePhotoVisibility = () => {
    setHiddenFields(prev => {
      if (prev.includes('Student Photo') || prev.includes('Photo')) {
        return prev.filter(f => f !== 'Student Photo' && f !== 'Photo')
      } else {
        return [...prev, 'Student Photo']
      }
    })
  }

  const handleApplyTitlePreset = (preset: typeof CERTIFICATE_TITLE_PRESETS[0], updateNarrative = false) => {
    setTitle(preset.title)
    if (updateNarrative) {
      setSubtitle(preset.subtitle)
      setContent(preset.narrative)
      setToastMessage(`Applied ${preset.title} with matching subtitle & narrative!`)
    } else {
      setToastMessage(`Certificate Title set to "${preset.title}"`)
    }
    setTimeout(() => setToastMessage(null), 3000)
  }

  const logoFileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const b64 = reader.result as string
      setSchoolLogo(b64)
      setToastMessage('Certificate Brand Logo updated!')
      setTimeout(() => setToastMessage(null), 3000)
    }
    reader.readAsDataURL(file)
  }

  // Preview Scale / Zoom
  const [previewScale, setPreviewScale] = useState<number>(0.92)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Load added classes and existing data
  useEffect(() => {
    const added = loadInstituteAddedClasses()
    setAvailableClasses(added)

    fetchInstituteName().then(name => {
      if (name && name !== 'Name') {
        setSchoolName(name)
      }
    })

    // Preload if editing
    if (editId) {
      loadExistingData(editId)
    }
  }, [editId])

  const loadExistingData = async (id: string) => {
    try {
      const res = await fetchCertificateTypes()
      if (res.success && Array.isArray(res.data)) {
        const found = res.data.find((item: any) => String(item.id) === String(id))
        if (found) {
          setTitle(found.title || 'Certificate of Achievement')
          setSubtitle(found.subtitle || 'In Recognition of Academic Excellence')
          setPrefix(found.prefix || 'CER/2025/')
          setStartNo(found.startNo || '101')
          if (Array.isArray(found.classes) && found.classes.length > 0) {
            setSelectedClasses(found.classes)
            setAvailableClasses(prev => Array.from(new Set([...prev, ...found.classes])))
          }
          if (found.designId) setSelectedDesign(Number(found.designId))
          if (found.themeColor) {
            setThemeColor(found.themeColor)
            setCustomHexInput(found.themeColor)
          } else if (found.titleBgColor) {
            setThemeColor(found.titleBgColor)
            setCustomHexInput(found.titleBgColor)
          }
          if (found.content) setContent(found.content)
          if (found.schoolName) setSchoolName(found.schoolName)
          if (found.schoolAddress) setSchoolAddress(found.schoolAddress)
          if (found.principalName) setPrincipalName(found.principalName)

          const hf: string[] = Array.isArray(found.hiddenFields) ? found.hiddenFields : []
          setHiddenFields(hf)
          setShowPrincipalSign(!hf.includes('Principal Sign') && !hf.includes('Principal / Director Sign'))
          setShowTeacherSign(!hf.includes('Teacher Sign') && !hf.includes('Class Teacher Sign'))
          setShowControllerSign(!hf.includes('Controller Sign') && !hf.includes('Exam Controller Sign'))
          setShowCoordinatorSign(!hf.includes('Coordinator Sign') && !hf.includes('Secondary Sign') && !hf.includes('Coordinator / In-Charge Sign'))
          setShowParentSign(!hf.includes('Parent Sign') && !hf.includes('Parent / Guardian Sign'))
          setShowStudentSign(!hf.includes('Student Sign') && !hf.includes('Student Signature Line'))
          setShowIssueDate(!hf.includes('Certificate Date') && !hf.includes('Date of Issue'))
          setShowSeal(!hf.includes('Official Seal') && !hf.includes('Seal') && !hf.includes('Water Mark') && !hf.includes('Official Seal / Crest'))
          setShowQr(!hf.includes('QR Code'))

          if (found.customLabels && typeof found.customLabels === 'object') {
            if (found.customLabels.principalName) setPrincipalName(found.customLabels.principalName)
            if (found.customLabels.principalLabel) setPrincipalLabel(found.customLabels.principalLabel)
            if (found.customLabels.teacherSignName) setTeacherSignName(found.customLabels.teacherSignName)
            if (found.customLabels.teacherSignLabel) setTeacherSignLabel(found.customLabels.teacherSignLabel)
            if (found.customLabels.controllerSignName) setControllerSignName(found.customLabels.controllerSignName)
            if (found.customLabels.controllerSignLabel) setControllerSignLabel(found.customLabels.controllerSignLabel)
            if (found.customLabels.secondarySignName) setCoordinatorSignName(found.customLabels.secondarySignName)
            if (found.customLabels.secondarySignLabel) setCoordinatorSignLabel(found.customLabels.secondarySignLabel)
            if (found.customLabels.parentSignName) setParentSignName(found.customLabels.parentSignName)
            if (found.customLabels.parentSignLabel) setParentSignLabel(found.customLabels.parentSignLabel)
            if (found.customLabels.studentSignLabel) setStudentSignLabel(found.customLabels.studentSignLabel)
            if (found.customLabels.date_label) setDateLabel(found.customLabels.date_label)
            if (found.customLabels.date) setIssueDate(found.customLabels.date)
            if (found.customLabels.schoolLogo) setSchoolLogo(found.customLabels.schoolLogo)
            if (found.customLabels.showLogo !== undefined) setShowLogo(found.customLabels.showLogo === 'true')
            if (found.customLabels.logoWidth) setLogoWidth(found.customLabels.logoWidth)
            if (found.customLabels.schoolNameFontSize) setSchoolNameFontSize(found.customLabels.schoolNameFontSize)
            if (found.customLabels.titleFontSize) setTitleFontSize(found.customLabels.titleFontSize)
            if (found.customLabels.subtitleFontSize) setSubtitleFontSize(found.customLabels.subtitleFontSize)
            if (found.customLabels.photoWidth) setPhotoWidth(found.customLabels.photoWidth)
            if (found.customLabels.qrCodeSize) setQrCodeSize(found.customLabels.qrCodeSize)
            if (found.customLabels.sealSize) setSealSize(found.customLabels.sealSize)
            if (found.customLabels.signatureWidth) setSignatureWidth(found.customLabels.signatureWidth)
            if (found.customLabels.signatureFontSize) setSignatureFontSize(found.customLabels.signatureFontSize)
            if (found.customLabels.presented_to || found.customLabels.presentedTo) {
              setPresentedTo(found.customLabels.presented_to || found.customLabels.presentedTo)
            }
            if (found.customLabels.signatureOrder) {
              try {
                const parsed = JSON.parse(found.customLabels.signatureOrder)
                if (Array.isArray(parsed) && parsed.length > 0) setSignatureOrder(parsed)
              } catch (e) {}
            }
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Handle color change
  const handleColorSelect = (colorHex: string) => {
    setThemeColor(colorHex)
    setCustomHexInput(colorHex)
  }

  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCustomHexInput(val)
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setThemeColor(val)
    }
  }

  // Class selection helpers
  const handleToggleClass = (cls: string) => {
    if (selectedClasses.includes(cls)) {
      setSelectedClasses(selectedClasses.filter(c => c !== cls))
    } else {
      setSelectedClasses([...selectedClasses, cls])
    }
  }

  const handleSelectAllClasses = () => {
    if (selectedClasses.length === availableClasses.length) {
      setSelectedClasses([])
    } else {
      setSelectedClasses([...availableClasses])
    }
  }

  // Dedicated Signature Toggle Handlers
  const handleTogglePrincipalSign = (checked: boolean) => {
    setShowPrincipalSign(checked)
    setHiddenFields(prev => checked 
      ? prev.filter(f => f !== 'Principal Sign' && f !== 'Principal / Director Sign') 
      : (prev.includes('Principal Sign') ? prev : [...prev, 'Principal Sign'])
    )
  }

  const handleToggleTeacherSign = (checked: boolean) => {
    setShowTeacherSign(checked)
    setHiddenFields(prev => checked 
      ? prev.filter(f => f !== 'Teacher Sign' && f !== 'Class Teacher Sign') 
      : (prev.includes('Teacher Sign') ? prev : [...prev, 'Teacher Sign'])
    )
  }

  const handleToggleControllerSign = (checked: boolean) => {
    setShowControllerSign(checked)
    setHiddenFields(prev => checked 
      ? prev.filter(f => f !== 'Controller Sign' && f !== 'Exam Controller Sign') 
      : (prev.includes('Controller Sign') ? prev : [...prev, 'Controller Sign'])
    )
  }

  const handleToggleCoordinatorSign = (checked: boolean) => {
    setShowCoordinatorSign(checked)
    setHiddenFields(prev => checked 
      ? prev.filter(f => f !== 'Coordinator Sign' && f !== 'Secondary Sign' && f !== 'Coordinator / In-Charge Sign') 
      : (prev.includes('Coordinator Sign') ? prev : [...prev, 'Coordinator Sign'])
    )
  }

  const handleToggleParentSign = (checked: boolean) => {
    setShowParentSign(checked)
    setHiddenFields(prev => checked 
      ? prev.filter(f => f !== 'Parent Sign' && f !== 'Parent / Guardian Sign') 
      : (prev.includes('Parent Sign') ? prev : [...prev, 'Parent Sign'])
    )
  }

  const handleToggleStudentSign = (checked: boolean) => {
    setShowStudentSign(checked)
    setHiddenFields(prev => checked 
      ? prev.filter(f => f !== 'Student Sign' && f !== 'Student Signature Line') 
      : (prev.includes('Student Sign') ? prev : [...prev, 'Student Sign'])
    )
  }

  const handleToggleIssueDate = (checked: boolean) => {
    setShowIssueDate(checked)
    setHiddenFields(prev => checked 
      ? prev.filter(f => f !== 'Certificate Date' && f !== 'Date of Issue') 
      : (prev.includes('Certificate Date') ? prev : [...prev, 'Certificate Date'])
    )
  }

  const handleToggleSeal = (checked: boolean) => {
    setShowSeal(checked)
    setHiddenFields(prev => checked 
      ? prev.filter(f => f !== 'Official Seal' && f !== 'Seal' && f !== 'Water Mark' && f !== 'Official Seal / Crest') 
      : (prev.includes('Official Seal') ? prev : [...prev, 'Official Seal'])
    )
  }

  const handleToggleQr = (checked: boolean) => {
    setShowQr(checked)
    setHiddenFields(prev => checked 
      ? prev.filter(f => f !== 'QR Code') 
      : (prev.includes('QR Code') ? prev : [...prev, 'QR Code'])
    )
  }

  // Fields Visibility Toggles (Checked = Show, Unchecked = Don't Show)
  const handleToggleFieldVisibility = (field: string) => {
    const isCurrentlyVisible = !hiddenFields.includes(field)
    if (isCurrentlyVisible) {
      // User unchecked -> HIDE the field (add to hiddenFields)
      setHiddenFields(prev => {
        const next = prev.includes(field) ? [...prev] : [...prev, field]
        if (field === 'Tagline' && !next.includes('Subtitle')) next.push('Subtitle')
        return next
      })
    } else {
      // User checked -> SHOW the field (remove from hiddenFields)
      setHiddenFields(prev => {
        let next = prev.filter(f => f !== field)
        if (field === 'Tagline') next = next.filter(f => f !== 'Subtitle')
        return next
      })
    }
  }

  const handleToggleHiddenField = handleToggleFieldVisibility

  const handleToggleAllVisibility = () => {
    const anyVisible = HIDDEN_FIELDS_LIST.some(f => !hiddenFields.includes(f))
    if (anyVisible) {
      // Uncheck all -> hide all in HIDDEN_FIELDS_LIST
      setHiddenFields(prev => Array.from(new Set([...prev, ...HIDDEN_FIELDS_LIST, 'Subtitle'])))
    } else {
      // Check all -> show all in HIDDEN_FIELDS_LIST
      setHiddenFields(prev => prev.filter(f => !HIDDEN_FIELDS_LIST.includes(f) && f !== 'Subtitle'))
    }
  }

  const handleSelectAllHidden = handleToggleAllVisibility

  // Insert merge tag into content
  const handleInsertTag = (tag: string) => {
    setContent(prev => `${prev} ${tag}`)
  }

  // Inline editing handler on canvas
  const handleCanvasUpdateField = (field: string, val: string) => {
    if (field === 'title') setTitle(val)
    else if (field === 'subtitle') setSubtitle(val)
    else if (field === 'schoolName') setSchoolName(val)
    else if (field === 'schoolAddress') setSchoolAddress(val)
    else if (field === 'studentName') setSampleStudentName(val)
    else if (field === 'content') setContent(val)
    else if (field === 'date') setIssueDate(val)
    else if (field === 'principalName') setPrincipalName(val)
    else if (field === 'teacherSignName') setTeacherSignName(val)
    else if (field === 'controllerSignName') setControllerSignName(val)
    else if (field === 'secondarySignName') setCoordinatorSignName(val)
    else if (field === 'parentSignName') setParentSignName(val)
    else if (field === 'schoolNameFontSize') setSchoolNameFontSize(String(val))
    else if (field === 'titleFontSize') setTitleFontSize(String(val))
    else if (field === 'subtitleFontSize') setSubtitleFontSize(String(val))
    else if (field === 'logoWidth') setLogoWidth(String(val))
    else if (field === 'schoolLogo') setSchoolLogo(String(val))
    else if (field === 'triggerLogoUpload') logoFileInputRef.current?.click()
  }

  const handleCanvasUpdateLabel = (key: string, val: string) => {
    if (key === 'principalSign') setPrincipalLabel(val)
    else if (key === 'teacherSign') setTeacherSignLabel(val)
    else if (key === 'controllerSign') setControllerSignLabel(val)
    else if (key === 'secondarySign') setCoordinatorSignLabel(val)
    else if (key === 'parentSign') setParentSignLabel(val)
    else if (key === 'studentSign') setStudentSignLabel(val)
    else if (key === 'presented_to') setPresentedTo(val)
    else if (key === 'date_label') setDateLabel(val)
  }

  // Save Certificate Type
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const effHidden = [...hiddenFields]
      const syncHidden = (active: boolean, ...tags: string[]) => {
        if (!active) {
          tags.forEach(t => {
            if (!effHidden.includes(t)) effHidden.push(t)
          })
        } else {
          tags.forEach(t => {
            const idx = effHidden.indexOf(t)
            if (idx !== -1) effHidden.splice(idx, 1)
          })
        }
      }

      syncHidden(showPrincipalSign, 'Principal Sign', 'Principal / Director Sign')
      syncHidden(showTeacherSign, 'Teacher Sign', 'Class Teacher Sign')
      syncHidden(showControllerSign, 'Controller Sign', 'Exam Controller Sign')
      syncHidden(showCoordinatorSign, 'Coordinator Sign', 'Secondary Sign', 'Coordinator / In-Charge Sign')
      syncHidden(showParentSign, 'Parent Sign', 'Parent / Guardian Sign')
      syncHidden(showStudentSign, 'Student Sign', 'Student Signature Line')
      syncHidden(showIssueDate, 'Certificate Date', 'Date of Issue')
      syncHidden(showSeal, 'Official Seal', 'Water Mark', 'Seal', 'Official Seal / Crest')
      syncHidden(showQr, 'QR Code')

      const customLabelsPayload: Record<string, string> = {
        principalName,
        principalLabel,
        teacherSignName,
        teacherSignLabel,
        controllerSignName,
        controllerSignLabel,
        secondarySignName: coordinatorSignName,
        secondarySignLabel: coordinatorSignLabel,
        parentSignName,
        parentSignLabel,
        studentSignLabel,
        date_label: dateLabel,
        presented_to: presentedTo,
        presentedTo,
        date: issueDate,
        schoolLogo,
        showLogo: String(showLogo),
        logoWidth: String(logoWidth),
        schoolNameFontSize: String(schoolNameFontSize),
        titleFontSize: String(titleFontSize),
        subtitleFontSize: String(subtitleFontSize),
        photoWidth: String(photoWidth),
        qrCodeSize: String(qrCodeSize),
        sealSize: String(sealSize),
        signatureWidth: String(signatureWidth),
        signatureFontSize: String(signatureFontSize),
        signatureOrder: JSON.stringify(signatureOrder)
      }

      const res = await saveCertificateType({
        id: editId || undefined,
        title: title || 'Certificate of Achievement',
        subtitle,
        prefix,
        startNo,
        classes: selectedClasses,
        designId: selectedDesign,
        content,
        titleBgColor: themeColor,
        themeColor,
        principalName,
        principalLabel,
        schoolName,
        schoolAddress,
        hiddenFields: effHidden,
        customLabels: customLabelsPayload
      })

      if (res.success) {
        setToastMessage('Certificate Type saved successfully to database!')
        setTimeout(() => {
          router.push('/institute/certificate/type?saved=true')
        }, 800)
      } else {
        alert('Could not save certificate type: ' + res.error)
      }
    } catch (e: any) {
      console.error(e)
      alert('Error saving certificate type: ' + (e?.message || 'Unknown error'))
    } finally {
      setIsSaving(false)
    }
  }

  const filteredAvailableClasses = availableClasses.filter(c => 
    c.toLowerCase().includes(classSearch.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 w-full pb-20 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>{editId ? 'Edit Certificate Type' : 'Configure Certificate Type'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                Setup Wizard
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Create a certificate template setup applicable to multiple target classes with live editing & theme color
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/institute/certificate/type" 
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isSaving ? 'Saving...' : 'Save Certificate Type'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-9">
        
        {/* ─── 1. NUMBERING & SERIAL SETUP ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Certificate Numbering & Serial Setup
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 mb-4">
            {/* Primary Certificate Title Field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  <span>Certificate Title / Type Name <span className="text-red-500">*</span></span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Updates live on certificate canvas</span>
              </div>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Character Certificate, Sports Certificate, Bravery Certificate" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-bold outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 shadow-xs" 
              />
              
              {/* Examples and Quick Presets */}
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
                    Popular Certificate Examples (Click to apply):
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    1-Click Auto-Fill
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {CERTIFICATE_TITLE_PRESETS.map((p) => {
                    const isCurrent = title.toLowerCase() === p.title.toLowerCase()
                    return (
                      <button
                        key={p.title}
                        type="button"
                        onClick={() => handleApplyTitlePreset(p, false)}
                        onDoubleClick={() => handleApplyTitlePreset(p, true)}
                        title={`Click to set title to "${p.title}". Double-click to also set matching subtitle & narrative.`}
                        className={`text-[11px] px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-102 ring-2 ring-blue-500/20'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      >
                        <span>{p.title}</span>
                        {isCurrent && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[10px] text-slate-400">
                  Tip: Click any preset to set the title. Double-click to also automatically load tailored subtitle and narrative text.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Certificate Serial Prefix <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="e.g. CER/2025/" 
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 font-mono shadow-xs" 
              />
              <span className="text-[11px] text-slate-400">Prefix will appear before every issued certificate number (e.g. CER/2025/101)</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Certificate No. Start From <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={startNo}
                onChange={(e) => setStartNo(e.target.value)}
                placeholder="e.g. 101" 
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 font-mono shadow-xs" 
              />
              <span className="text-[11px] text-slate-400">Initial sequence counter for newly issued certificates</span>
            </div>
          </div>
        </section>

        {/* ─── 2. APPLICABLE TARGET CLASSES ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Applicable Classes (Select Multiple Target Classes) <span className="text-red-500">*</span>
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            Select the classes eligible for this certificate type. All students in the selected classes can be issued this certificate.
          </p>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            
            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllClasses}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  {selectedClasses.length === availableClasses.length ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Select All ({availableClasses.length})</span>
                    </>
                  )}
                </button>

                <span className="text-xs text-slate-500 font-medium">
                  <strong>{selectedClasses.length}</strong> of <strong>{availableClasses.length}</strong> classes selected
                </span>
              </div>

              {/* Quick Search */}
              <input
                type="text"
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                placeholder="Search classes..."
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 w-48 shadow-2xs"
              />
            </div>

            {availableClasses.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
                <p className="text-xs text-slate-500 font-semibold">
                  No classes added yet in institute records.
                </p>
                <Link 
                  href="/institute/masters/classes"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/40 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                >
                  + Add Class in Masters
                </Link>
              </div>
            ) : filteredAvailableClasses.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No classes match &quot;{classSearch}&quot;
              </div>
            ) : (
              /* Checkbox Chips Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-52 overflow-y-auto p-1">
                {filteredAvailableClasses.map((cls) => {
                  const isSelected = selectedClasses.includes(cls)

                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => handleToggleClass(cls)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      <span className="truncate">{cls}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 stroke-[3] shrink-0 ml-1 text-white" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-xs border border-slate-300 dark:border-slate-600 shrink-0 ml-1"></span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Selected Tags Display */}
            {selectedClasses.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Active Classes:</span>
                {selectedClasses.map(cls => (
                  <span 
                    key={cls}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100/70 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-lg text-[11px] font-semibold"
                  >
                    <span>{cls}</span>
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => handleToggleClass(cls)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── 3. THEME COLOR PALETTE (WHOLE TEMPLATE REACTIVE) ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" />
              <span>Theme Color Palette (Whole Certificate Styling)</span>
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            Choose a theme color palette. Every element of the certificate (borders, ribbons, crests, title accents, and signatures) dynamically transforms according to the chosen color.
          </p>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2">
              {CERTIFICATE_COLOR_PRESETS.map((preset) => {
                const isSelected = themeColor.toLowerCase() === preset.hex.toLowerCase()
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => handleColorSelect(preset.hex)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-blue-500 shadow-md ring-2 ring-blue-500/20 scale-105'
                        : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs" 
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="text-slate-700 dark:text-slate-200">{preset.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                  </button>
                )
              })}
            </div>

            {/* Custom Hex Picker */}
            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-3 md:pt-0 md:pl-5 shrink-0">
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={themeColor}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                  title="Choose custom color"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Custom Hex</span>
                  <input 
                    type="text"
                    value={customHexInput}
                    onChange={handleCustomHexChange}
                    className="w-24 px-2 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 uppercase"
                    placeholder="#1E3A8A"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. TEMPLATE SELECTION (4 DESIGNS) ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              4
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-blue-600" />
              <span>Certificate Design Selection <span className="text-red-500">*</span></span>
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 1, name: 'Design 1: Royal Geometric', desc: 'Sleek corner ribbons with royal gold framing' },
              { id: 2, name: 'Design 2: Ornate Vintage Gold', desc: 'Classic filigree corners & heritage merit seal' },
              { id: 3, name: 'Design 3: Modern Luxury Crest', desc: 'Sports, honors & verified shield credential' },
              { id: 4, name: 'Design 4: Academic Completion', desc: 'Corporate double frame with formal seal' },
            ].map(item => {
              const isSelected = selectedDesign === item.id

              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedDesign(item.id)}
                  className={`flex flex-col gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20 scale-[1.01]' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  {/* Dynamic Miniature Preview */}
                  <div className="w-full">
                    <CertificateMiniPreview
                      template={`Certificate Design ${item.id}`}
                      themeColor={themeColor}
                      title={title}
                      subtitle={subtitle}
                      schoolName={schoolName}
                      studentName={sampleStudentName}
                      isSelected={isSelected}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">
                        {item.desc}
                      </span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── 5. LIVE INTERACTIVE CERTIFICATE CANVAS (LIVE EDITABLE) ─── */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                5
              </div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Live Interactive Certificate Canvas (Click Text to Edit)</span>
              </h2>
            </div>
            
            {/* Zoom / Scale Controls */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button 
                type="button"
                onClick={() => setPreviewScale(prev => Math.max(0.55, prev - 0.10))}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] font-bold text-slate-600 px-1">
                {Math.round(previewScale * 100)}%
              </span>
              <button 
                type="button"
                onClick={() => setPreviewScale(prev => Math.min(1.30, prev + 0.10))}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                onClick={() => setPreviewScale(0.92)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ─── COMPREHENSIVE CERTIFICATE MEDIA & SIZING STUDIO ─── */}
          <div className="border border-slate-200/90 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-850 p-4 sm:p-5 shadow-xs space-y-4 mb-3">
            <input 
              ref={logoFileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleLogoUpload} 
            />

            {/* Studio Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    Certificate Media & Sizing Studio
                  </h3>
                  <p className="text-[10.5px] text-slate-400 font-medium">
                    Adjust Institute Logo, Candidate Photo, Verification QR Code, and Seal dimensions in real time
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLogoWidth('60')
                    setPhotoWidth('48')
                    setQrCodeSize('68')
                    setSealSize('60')
                    setSignatureWidth('115')
                    setSignatureFontSize('9')
                    setShowLogo(true)
                    setShowQr(true)
                    setShowSeal(true)
                    setToastMessage('Reset all media & element sizes to standard defaults')
                    setTimeout(() => setToastMessage(null), 3000)
                  }}
                  className="text-[10.5px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                >
                  Reset Standard Sizing
                </button>
              </div>
            </div>

            {/* 3 Main Sizing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              
              {/* CARD 1: INSTITUTE LOGO SIZING */}
              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Institute Logo</span>
                    <button
                      type="button"
                      onClick={() => setShowLogo(prev => !prev)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase transition-all shadow-2xs ${
                        showLogo
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {showLogo ? '● Visible' : '○ Hidden'}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                    {logoWidth} px
                  </span>
                </div>

                {/* Upload & Sample Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{schoolLogo ? 'Change' : 'Upload'}</span>
                  </button>
                  {schoolLogo && (
                    <button
                      type="button"
                      onClick={() => {
                        setSchoolLogo('')
                        setToastMessage('Reverted to Sample Emblem')
                        setTimeout(() => setToastMessage(null), 3000)
                      }}
                      className="py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 shadow-2xs"
                    >
                      Sample
                    </button>
                  )}
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
                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-semibold w-11 shrink-0 text-[10.5px]">Width:</span>
                    <input
                      type="range"
                      min="32"
                      max="140"
                      step="2"
                      value={Number(logoWidth) || 60}
                      onChange={e => setLogoWidth(e.target.value)}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-9 text-right text-[10.5px]">{logoWidth}px</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: CANDIDATE PHOTO SIZING */}
              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Candidate Photo</span>
                    <button
                      type="button"
                      onClick={togglePhotoVisibility}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase transition-all shadow-2xs ${
                        isPhotoVisible
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isPhotoVisible ? '● Visible' : '○ Hidden'}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                    {photoWidth} × {Math.round(Number(photoWidth) * 1.25)} px
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  {[
                    { label: 'S (38px)', size: '38' },
                    { label: 'M (48px)', size: '48' },
                    { label: 'L (58px)', size: '58' },
                    { label: 'XL (70px)', size: '70' }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPhotoWidth(p.size)}
                      className={`py-1 rounded text-[10px] font-bold transition-all ${
                        photoWidth === p.size
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {p.label.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-semibold w-11 shrink-0 text-[10.5px]">Scale:</span>
                    <input
                      type="range"
                      min="30"
                      max="90"
                      step="2"
                      value={Number(photoWidth) || 48}
                      onChange={e => setPhotoWidth(e.target.value)}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-9 text-right text-[10.5px]">{photoWidth}px</span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 pt-0.5">
                    Proportionate passport aspect ratio (1 : 1.25).
                  </p>
                </div>
              </div>

              {/* CARD 3: VERIFICATION QR CODE SIZING */}
              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Verification QR</span>
                    <button
                      type="button"
                      onClick={() => setShowQr(prev => !prev)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase transition-all shadow-2xs ${
                        showQr
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {showQr ? '● Visible' : '○ Hidden'}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                    {qrCodeSize} px
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  {[
                    { label: 'S (48px)', size: '48' },
                    { label: 'M (64px)', size: '64' },
                    { label: 'L (76px)', size: '76' },
                    { label: 'XL (92px)', size: '92' }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setQrCodeSize(p.size)}
                      className={`py-1 rounded text-[10px] font-bold transition-all ${
                        qrCodeSize === p.size
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {p.label.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-semibold w-11 shrink-0 text-[10.5px]">Size:</span>
                    <input
                      type="range"
                      min="40"
                      max="120"
                      step="2"
                      value={Number(qrCodeSize) || 68}
                      onChange={e => setQrCodeSize(e.target.value)}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-9 text-right text-[10.5px]">{qrCodeSize}px</span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 pt-0.5">
                    Crisp scan verification matrix.
                  </p>
                </div>
              </div>

            </div>

            {/* Sub-Card: Official Seal & Signature Line Sizing */}
            <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Official Seal Scale:</span>
                <input
                  type="range"
                  min="40"
                  max="90"
                  step="2"
                  value={Number(sealSize) || 60}
                  onChange={e => setSealSize(e.target.value)}
                  className="w-20 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[10.5px]">{sealSize}px</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Signature Width:</span>
                <input
                  type="range"
                  min="80"
                  max="160"
                  step="5"
                  value={Number(signatureWidth) || 115}
                  onChange={e => setSignatureWidth(e.target.value)}
                  className="w-20 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[10.5px]">{signatureWidth}px</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Sign Font Size:</span>
                <input
                  type="range"
                  min="8"
                  max="13"
                  step="1"
                  value={Number(signatureFontSize) || 9}
                  onChange={e => setSignatureFontSize(e.target.value)}
                  className="w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[10.5px]">{signatureFontSize}px</span>
              </div>
            </div>
          </div>

          {/* ─── QUICK TYPOGRAPHY & FONT SIZING CONTROLS ─── */}
          <div className="border border-slate-200/90 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-850 p-4 shadow-xs space-y-3 mb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  Quick Typography & Font Sizing Controls
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold">
                  Customize institute name, certificate title, and subtitle font sizes in real time
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSchoolNameFontSize('14')
                    setTitleFontSize('30')
                    setSubtitleFontSize('11')
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline ml-2"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. School / Institute Name Font Size */}
              <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-[10.5px]">Institute Name:</span>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-[10.5px] bg-blue-50 dark:bg-blue-950/60 px-1 rounded">{schoolNameFontSize}px</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Make Institute Name smaller"
                    onClick={() => setSchoolNameFontSize(prev => String(Math.max(10, Number(prev) - 1)))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="10"
                    max="36"
                    step="1"
                    value={Number(schoolNameFontSize) || 14}
                    onChange={e => setSchoolNameFontSize(e.target.value)}
                    className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    title="Make Institute Name bigger"
                    onClick={() => setSchoolNameFontSize(prev => String(Math.min(36, Number(prev) + 1)))}
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
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-[10.5px] bg-blue-50 dark:bg-blue-950/60 px-1 rounded">{titleFontSize}px</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Make Certificate Title smaller"
                    onClick={() => setTitleFontSize(prev => String(Math.max(16, Number(prev) - 2)))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="16"
                    max="48"
                    step="1"
                    value={Number(titleFontSize) || 30}
                    onChange={e => setTitleFontSize(e.target.value)}
                    className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    title="Make Certificate Title bigger"
                    onClick={() => setTitleFontSize(prev => String(Math.min(48, Number(prev) + 2)))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* 3. Certificate Subtitle Font Size */}
              <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-[10.5px]">Subtitle / Tagline:</span>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-[10.5px] bg-blue-50 dark:bg-blue-950/60 px-1 rounded">{subtitleFontSize}px</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Make Subtitle smaller"
                    onClick={() => setSubtitleFontSize(prev => String(Math.max(8, Number(prev) - 1)))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    step="1"
                    value={Number(subtitleFontSize) || 11}
                    onChange={e => setSubtitleFontSize(e.target.value)}
                    className="w-14 sm:w-16 accent-blue-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    title="Make Subtitle bigger"
                    onClick={() => setSubtitleFontSize(prev => String(Math.min(24, Number(prev) + 1)))}
                    className="w-5 h-5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/80 rounded-xl mb-4 text-xs font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Direct Live Canvas Editing:</strong> You can click directly on the School Name, Address, Certificate Title, Subtitle, Student Name, Content narrative, or Principal Signature inside the preview below to edit them live!
            </span>
          </div>

          {/* Interactive Canvas Viewport */}
          <div className="w-full min-h-[660px] bg-slate-100 dark:bg-slate-900/80 rounded-2xl p-6 sm:p-10 flex items-center justify-center overflow-x-auto border border-slate-200 dark:border-slate-700 shadow-inner">
            <div 
              style={{ transform: `scale(${previewScale})`, transformOrigin: 'center center' }} 
              className="flex items-center justify-center transition-transform duration-200 shrink-0 my-8 py-4"
            >
              {selectedDesign === 1 && (
                <CertificateDesign1 
                  presentedTo={presentedTo}
                  signatureOrder={signatureOrder}
                  title={title} 
                  subtitle={subtitle} 
                  content={content} 
                  schoolName={schoolName}
                  schoolAddress={schoolAddress}
                  schoolLogo={schoolLogo || undefined}
                  showLogo={showLogo}
                  logoWidth={logoWidth}
                  schoolNameFontSize={schoolNameFontSize}
                  titleFontSize={titleFontSize}
                  subtitleFontSize={subtitleFontSize}
                  studentName={sampleStudentName}
                  date={issueDate}
                  principalName={principalName}
                  principalLabel={principalLabel}
                  teacherSignName={teacherSignName}
                  teacherSignLabel={teacherSignLabel}
                  controllerSignName={controllerSignName}
                  controllerSignLabel={controllerSignLabel}
                  secondarySignName={coordinatorSignName}
                  secondarySignLabel={coordinatorSignLabel}
                  parentSignName={parentSignName}
                  parentSignLabel={parentSignLabel}
                  studentSignLabel={studentSignLabel}
                  themeColor={themeColor}
                  photoWidth={photoWidth}
                  qrCodeSize={qrCodeSize}
                  sealSize={sealSize}
                  signatureWidth={signatureWidth}
                  signatureFontSize={signatureFontSize}
                  showQr={showQr}
                  showSeal={showSeal}
                  hiddenFields={hiddenFields} 
                  customLabels={{
                    date_label: dateLabel,
                    presented_to: presentedTo,
                    principalName,
                    principalLabel,
                    teacherSignName,
                    teacherSignLabel,
                    controllerSignName,
                    controllerSignLabel,
                    secondarySignName: coordinatorSignName,
                    secondarySignLabel: coordinatorSignLabel,
                    parentSignName,
                    parentSignLabel,
                    studentSignLabel
                  }}
                  editable={true}
                  onUpdateField={handleCanvasUpdateField}
                  onUpdateLabel={handleCanvasUpdateLabel}
                />
              )}
              {selectedDesign === 2 && (
                <CertificateDesign2 
                  presentedTo={presentedTo}
                  signatureOrder={signatureOrder}
                  title={title} 
                  subtitle={subtitle} 
                  content={content} 
                  schoolName={schoolName}
                  schoolAddress={schoolAddress}
                  schoolLogo={schoolLogo || undefined}
                  showLogo={showLogo}
                  logoWidth={logoWidth}
                  schoolNameFontSize={schoolNameFontSize}
                  titleFontSize={titleFontSize}
                  subtitleFontSize={subtitleFontSize}
                  studentName={sampleStudentName}
                  date={issueDate}
                  principalName={principalName}
                  principalLabel={principalLabel}
                  teacherSignName={teacherSignName}
                  teacherSignLabel={teacherSignLabel}
                  controllerSignName={controllerSignName}
                  controllerSignLabel={controllerSignLabel}
                  secondarySignName={coordinatorSignName}
                  secondarySignLabel={coordinatorSignLabel}
                  parentSignName={parentSignName}
                  parentSignLabel={parentSignLabel}
                  studentSignLabel={studentSignLabel}
                  themeColor={themeColor}
                  photoWidth={photoWidth}
                  qrCodeSize={qrCodeSize}
                  sealSize={sealSize}
                  signatureWidth={signatureWidth}
                  signatureFontSize={signatureFontSize}
                  showQr={showQr}
                  showSeal={showSeal}
                  hiddenFields={hiddenFields} 
                  customLabels={{
                    date_label: dateLabel,
                    presented_to: presentedTo,
                    principalName,
                    principalLabel,
                    teacherSignName,
                    teacherSignLabel,
                    controllerSignName,
                    controllerSignLabel,
                    secondarySignName: coordinatorSignName,
                    secondarySignLabel: coordinatorSignLabel,
                    parentSignName,
                    parentSignLabel,
                    studentSignLabel
                  }}
                  editable={true}
                  onUpdateField={handleCanvasUpdateField}
                  onUpdateLabel={handleCanvasUpdateLabel}
                />
              )}
              {selectedDesign === 3 && (
                <CertificateDesign3 
                  presentedTo={presentedTo}
                  signatureOrder={signatureOrder}
                  title={title} 
                  subtitle={subtitle} 
                  content={content} 
                  schoolName={schoolName}
                  schoolAddress={schoolAddress}
                  schoolLogo={schoolLogo || undefined}
                  showLogo={showLogo}
                  logoWidth={logoWidth}
                  schoolNameFontSize={schoolNameFontSize}
                  titleFontSize={titleFontSize}
                  subtitleFontSize={subtitleFontSize}
                  studentName={sampleStudentName}
                  date={issueDate}
                  principalName={principalName}
                  principalLabel={principalLabel}
                  teacherSignName={teacherSignName}
                  teacherSignLabel={teacherSignLabel}
                  controllerSignName={controllerSignName}
                  controllerSignLabel={controllerSignLabel}
                  secondarySignName={coordinatorSignName}
                  secondarySignLabel={coordinatorSignLabel}
                  parentSignName={parentSignName}
                  parentSignLabel={parentSignLabel}
                  studentSignLabel={studentSignLabel}
                  themeColor={themeColor}
                  photoWidth={photoWidth}
                  qrCodeSize={qrCodeSize}
                  sealSize={sealSize}
                  signatureWidth={signatureWidth}
                  signatureFontSize={signatureFontSize}
                  showQr={showQr}
                  showSeal={showSeal}
                  hiddenFields={hiddenFields} 
                  customLabels={{
                    date_label: dateLabel,
                    presented_to: presentedTo,
                    principalName,
                    principalLabel,
                    teacherSignName,
                    teacherSignLabel,
                    controllerSignName,
                    controllerSignLabel,
                    secondarySignName: coordinatorSignName,
                    secondarySignLabel: coordinatorSignLabel,
                    parentSignName,
                    parentSignLabel,
                    studentSignLabel
                  }}
                  editable={true}
                  onUpdateField={handleCanvasUpdateField}
                  onUpdateLabel={handleCanvasUpdateLabel}
                />
              )}
              {selectedDesign === 4 && (
                <CertificateDesign4 
                  presentedTo={presentedTo}
                  signatureOrder={signatureOrder}
                  title={title} 
                  subtitle={subtitle} 
                  content={content} 
                  schoolName={schoolName}
                  schoolAddress={schoolAddress}
                  schoolLogo={schoolLogo || undefined}
                  showLogo={showLogo}
                  logoWidth={logoWidth}
                  schoolNameFontSize={schoolNameFontSize}
                  titleFontSize={titleFontSize}
                  subtitleFontSize={subtitleFontSize}
                  studentName={sampleStudentName}
                  date={issueDate}
                  principalName={principalName}
                  principalLabel={principalLabel}
                  teacherSignName={teacherSignName}
                  teacherSignLabel={teacherSignLabel}
                  controllerSignName={controllerSignName}
                  controllerSignLabel={controllerSignLabel}
                  secondarySignName={coordinatorSignName}
                  secondarySignLabel={coordinatorSignLabel}
                  parentSignName={parentSignName}
                  parentSignLabel={parentSignLabel}
                  studentSignLabel={studentSignLabel}
                  themeColor={themeColor}
                  photoWidth={photoWidth}
                  qrCodeSize={qrCodeSize}
                  sealSize={sealSize}
                  signatureWidth={signatureWidth}
                  signatureFontSize={signatureFontSize}
                  showQr={showQr}
                  showSeal={showSeal}
                  hiddenFields={hiddenFields} 
                  customLabels={{
                    date_label: dateLabel,
                    presented_to: presentedTo,
                    principalName,
                    principalLabel,
                    teacherSignName,
                    teacherSignLabel,
                    controllerSignName,
                    controllerSignLabel,
                    secondarySignName: coordinatorSignName,
                    secondarySignLabel: coordinatorSignLabel,
                    parentSignName,
                    parentSignLabel,
                    studentSignLabel
                  }}
                  editable={true}
                  onUpdateField={handleCanvasUpdateField}
                  onUpdateLabel={handleCanvasUpdateLabel}
                />
              )}
            </div>
          </div>
        </section>

        {/* ─── 6. CERTIFICATE DETAILS & DYNAMIC NARRATIVE ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              6
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Certificate Title, Subtitle & Narrative Content</span>
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>

          <div className="space-y-5 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            {/* Title with suggestions */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Certificate Title <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Certificate of Achievement" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-bold outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 shadow-xs" 
              />
              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-[10px] font-semibold text-slate-400">Quick Suggestions:</span>
                {CERTIFICATE_TITLE_PRESETS.map(p => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => handleApplyTitlePreset(p, false)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all flex items-center gap-1 shadow-2xs ${
                      title.toLowerCase() === p.title.toLowerCase()
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span>{p.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle Tagline */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subtitle Tagline</label>
                <span className="text-[11px] text-slate-400">Displayed below the main certificate title</span>
              </div>
              <input 
                type="text" 
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:border-blue-500 shadow-xs text-slate-700 dark:text-slate-200" 
                placeholder="e.g. IN RECOGNITION OF ACADEMIC EXCELLENCE"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'IN RECOGNITION OF ACADEMIC EXCELLENCE',
                  'FOR OUTSTANDING SCHOLASTIC DILIGENCE & CONDUCT',
                  'HONORARY MERIT & DISTINCTION AWARD',
                  'EXTRACURRICULAR & SPORTS DISTINCTION',
                  'ACADEMIC CURRICULUM & CO-CURRICULAR'
                ].map(sub => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubtitle(sub)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                      subtitle === sub 
                        ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Presentation Salutation / Certify Heading */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Presentation Salutation / Certify Heading
                </label>
                <span className="text-[11px] text-slate-400">Above Student Name</span>
              </div>
              <input 
                type="text" 
                value={presentedTo}
                onChange={(e) => setPresentedTo(e.target.value)}
                placeholder="THIS CERTIFICATE IS PROUDLY PRESENTED TO"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:border-blue-500 shadow-xs text-slate-800 dark:text-slate-100" 
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'THIS CERTIFICATE IS PROUDLY PRESENTED TO',
                  'THIS IS TO CERTIFY THAT',
                  'THIS HONOR & DISTINCTION IS BESTOWED UPON',
                  'THIS OFFICIAL DOCUMENT CONFIRMS THAT'
                ].map(pres => (
                  <button
                    key={pres}
                    type="button"
                    onClick={() => setPresentedTo(pres)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                      presentedTo === pres 
                        ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {pres}
                  </button>
                ))}
              </div>
            </div>

            {/* Narrative Body Text & Merge Tags */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Certificate Narrative / Body Description Text
                </label>
                <span className="text-[11px] text-slate-400">Award statement displayed below student details</span>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-xs">
                {/* Dynamic Merge Tags Quick Bar */}
                <div className="flex items-center gap-1.5 p-2.5 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 flex-wrap text-xs">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Insert Dynamic Tag:</span>
                  {[
                    '{Student Name}', '{Father Name}', '{Class}', '{Roll No}', 
                    '{Admission No}', '{Academic Session}', '{Date}', '{Achievement Detail}'
                  ].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleInsertTag(tag)}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-50 transition-colors shadow-2xs"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                <textarea 
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 text-xs text-slate-700 dark:text-slate-200 outline-none resize-none leading-relaxed bg-transparent"
                  placeholder="Enter the certificate narrative text..."
                ></textarea>
              </div>

              {/* Quick Narrative Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Quick Preset Templates (Click to apply):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setContent('This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement during the academic session.')}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 group-hover:underline">Academic Excellence</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">Proudly awarded in recognition of outstanding performance and commendable achievement...</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContent('This is to certify that the student named above has satisfactorily completed the prescribed curriculum and demonstrated commendable academic achievement during the academic session.')}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 group-hover:underline">Standard "To Certify That"</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">This is to certify that the student has satisfactorily completed the prescribed curriculum...</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContent('Conferred with high distinction in recognition of securing top honors, extraordinary scholastic merit, and exemplary conduct in the annual examination.')}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 group-hover:underline">Merit & Rank Distinction</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">Conferred with high distinction in recognition of securing top honors and extraordinary scholastic merit...</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContent('Presented in high appreciation for active participation, dedicated sportsmanship, and outstanding contribution to institutional activities and co-curricular programs.')}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 group-hover:underline">Sports & Co-Curricular</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">In high appreciation for active participation, sportsmanship, and outstanding contribution...</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. SIGNATURES & STAMP CONFIGURATION (SEPARATE SECTION) ─── */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                7
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Feather className="w-4 h-4 text-blue-600" />
                  <span>Signatures & Credentials Authority Hub</span>
                </h2>
                <p className="text-[11px] text-slate-500 font-normal">
                  Configure signatures, reposition order using Left/Right controls, and customize designations.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {signatureOrder.map((key, idx) => {
              const isFirst = idx === 0
              const isLast = idx === signatureOrder.length - 1

              if (key === 'principalSign') {
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      showPrincipalSign
                        ? 'bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-700 shadow-sm ring-1 ring-blue-500/15'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Principal Sign</h3>
                            <span className="text-[10px] text-slate-400">Primary Authority</span>
                          </div>
                        </div>

                        {/* Toggle Button */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            showPrincipalSign ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {showPrincipalSign ? 'ON' : 'OFF'}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={showPrincipalSign}
                            onClick={() => handleTogglePrincipalSign(!showPrincipalSign)}
                            className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                              showPrincipalSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                              showPrincipalSign ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>

                      <div className={`space-y-2.5 transition-opacity ${showPrincipalSign ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Signatory Full Name</label>
                          <input
                            type="text"
                            value={principalName}
                            disabled={!showPrincipalSign}
                            onChange={(e) => setPrincipalName(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                            placeholder="Enter signatory name (or leave blank)"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Designation / Title</label>
                          <input
                            type="text"
                            value={principalLabel}
                            disabled={!showPrincipalSign}
                            onChange={(e) => setPrincipalLabel(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                            placeholder="e.g. Principal & Director"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order / Position Badge & Move Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        Position #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSignature(key, 'left')}
                          disabled={isFirst}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Move signature to the left"
                        >
                          ← Left
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSignature(key, 'right')}
                          disabled={isLast}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Move signature to the right"
                        >
                          Right →
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
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      showTeacherSign
                        ? 'bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-700 shadow-sm ring-1 ring-blue-500/15'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Teacher Sign</h3>
                            <span className="text-[10px] text-slate-400">Class Mentor</span>
                          </div>
                        </div>

                        {/* Toggle Button */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            showTeacherSign ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {showTeacherSign ? 'ON' : 'OFF'}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={showTeacherSign}
                            onClick={() => handleToggleTeacherSign(!showTeacherSign)}
                            className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                              showTeacherSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                              showTeacherSign ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>

                      <div className={`space-y-2.5 transition-opacity ${showTeacherSign ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Teacher Full Name</label>
                          <input
                            type="text"
                            value={teacherSignName}
                            disabled={!showTeacherSign}
                            onChange={(e) => setTeacherSignName(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                            placeholder="Enter teacher name (or leave blank)"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Designation / Title</label>
                          <input
                            type="text"
                            value={teacherSignLabel}
                            disabled={!showTeacherSign}
                            onChange={(e) => setTeacherSignLabel(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                            placeholder="e.g. Class Teacher's Sign"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order / Position Badge & Move Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        Position #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSignature(key, 'left')}
                          disabled={isFirst}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Move signature to the left"
                        >
                          ← Left
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSignature(key, 'right')}
                          disabled={isLast}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Move signature to the right"
                        >
                          Right →
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
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      showControllerSign
                        ? 'bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-700 shadow-sm ring-1 ring-blue-500/15'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Exam Controller</h3>
                            <span className="text-[10px] text-slate-400">Examination Cell</span>
                          </div>
                        </div>

                        {/* Toggle Button */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            showControllerSign ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {showControllerSign ? 'ON' : 'OFF'}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={showControllerSign}
                            onClick={() => handleToggleControllerSign(!showControllerSign)}
                            className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                              showControllerSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                              showControllerSign ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>

                      <div className={`space-y-2.5 transition-opacity ${showControllerSign ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Controller Name</label>
                          <input
                            type="text"
                            value={controllerSignName}
                            disabled={!showControllerSign}
                            onChange={(e) => setControllerSignName(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                            placeholder="Enter controller name (or leave blank)"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Designation / Title</label>
                          <input
                            type="text"
                            value={controllerSignLabel}
                            disabled={!showControllerSign}
                            onChange={(e) => setControllerSignLabel(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                            placeholder="e.g. Exam Controller"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order / Position Badge & Move Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        Position #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSignature(key, 'left')}
                          disabled={isFirst}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Move signature to the left"
                        >
                          ← Left
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSignature(key, 'right')}
                          disabled={isLast}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Move signature to the right"
                        >
                          Right →
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              if (key === 'coordinatorSign') {
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      showCoordinatorSign
                        ? 'bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-700 shadow-sm ring-1 ring-blue-500/15'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Authority Signature</h3>
                            <span className="text-[10px] text-slate-400">Authorized Signatory</span>
                          </div>
                        </div>

                        {/* Toggle Button */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            showCoordinatorSign ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {showCoordinatorSign ? 'ON' : 'OFF'}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={showCoordinatorSign}
                            onClick={() => handleToggleCoordinatorSign(!showCoordinatorSign)}
                            className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                              showCoordinatorSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                              showCoordinatorSign ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>

                      <div className={`space-y-2.5 transition-opacity ${showCoordinatorSign ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Signatory Full Name</label>
                          <input
                            type="text"
                            value={coordinatorSignName}
                            disabled={!showCoordinatorSign}
                            onChange={(e) => setCoordinatorSignName(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                            placeholder="Enter authority name (or leave blank)"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Designation / Title</label>
                          <input
                            type="text"
                            value={coordinatorSignLabel}
                            disabled={!showCoordinatorSign}
                            onChange={(e) => setCoordinatorSignLabel(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                            placeholder="e.g. Authority Signature"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order / Position Badge & Move Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        Position #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSignature(key, 'left')}
                          disabled={isFirst}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Move signature to the left"
                        >
                          ← Left
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSignature(key, 'right')}
                          disabled={isLast}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Move signature to the right"
                        >
                          Right →
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
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      showParentSign
                        ? 'bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-700 shadow-sm ring-1 ring-blue-500/15'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Parent / Guardian</h3>
                            <span className="text-[10px] text-slate-400">Family Endorsement</span>
                          </div>
                        </div>

                        {/* Toggle Button */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            showParentSign ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {showParentSign ? 'ON' : 'OFF'}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={showParentSign}
                            onClick={() => handleToggleParentSign(!showParentSign)}
                            className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                              showParentSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                              showParentSign ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>

                      <div className={`space-y-2.5 transition-opacity ${showParentSign ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Signatory Text</label>
                          <input
                            type="text"
                            value={parentSignName}
                            disabled={!showParentSign}
                            onChange={(e) => setParentSignName(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                            placeholder="Enter signatory text (or leave blank)"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Line Label</label>
                          <input
                            type="text"
                            value={parentSignLabel}
                            disabled={!showParentSign}
                            onChange={(e) => setParentSignLabel(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                            placeholder="e.g. Parent's Signature"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order / Position Badge & Move Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        Position #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSignature(key, 'left')}
                          disabled={isFirst}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Move signature to the left"
                        >
                          ← Left
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSignature(key, 'right')}
                          disabled={isLast}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Move signature to the right"
                        >
                          Right →
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
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      showStudentSign
                        ? 'bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-700 shadow-sm ring-1 ring-blue-500/15'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Candidate Sign</h3>
                            <span className="text-[10px] text-slate-400">Recipient Acceptance</span>
                          </div>
                        </div>

                        {/* Toggle Button */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            showStudentSign ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {showStudentSign ? 'ON' : 'OFF'}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={showStudentSign}
                            onClick={() => handleToggleStudentSign(!showStudentSign)}
                            className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                              showStudentSign ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                              showStudentSign ? 'translate-x-4' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>

                      <div className={`space-y-2.5 transition-opacity ${showStudentSign ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Line Label / Title</label>
                          <input
                            type="text"
                            value={studentSignLabel}
                            disabled={!showStudentSign}
                            onChange={(e) => setStudentSignLabel(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                            placeholder="e.g. Student's Signature"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Displays Candidate acknowledgment line for student endorsement on the certificate.
                        </p>
                      </div>
                    </div>

                    {/* Order / Position Badge & Move Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        Position #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSignature(key, 'left')}
                          disabled={isFirst}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Move signature to the left"
                        >
                          ← Left
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSignature(key, 'right')}
                          disabled={isLast}
                          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                          title="Move signature to the right"
                        >
                          Right →
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              return null
            })}

            {/* 7. Certificate Issue Date */}
            <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
              showIssueDate
                ? 'bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-700 shadow-sm ring-1 ring-blue-500/15'
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Date of Issue</h3>
                      <span className="text-[10px] text-slate-400">Issuance Timestamp</span>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      showIssueDate ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {showIssueDate ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showIssueDate}
                      onClick={() => handleToggleIssueDate(!showIssueDate)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                        showIssueDate ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                        showIssueDate ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className={`space-y-2.5 transition-opacity ${showIssueDate ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Sample Date Text</label>
                    <input
                      type="text"
                      value={issueDate}
                      disabled={!showIssueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                      placeholder="e.g. 15 October 2025"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Date Label</label>
                    <input
                      type="text"
                      value={dateLabel}
                      disabled={!showIssueDate}
                      onChange={(e) => setDateLabel(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-blue-500"
                      placeholder="e.g. Date of Issue"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Official Seal & QR Code */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Seal & Security QR</h3>
                    <span className="text-[10px] text-slate-400">Official Authentications</span>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Seal Toggle */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Golden Seal / Stamp</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showSeal}
                      onClick={() => handleToggleSeal(!showSeal)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                        showSeal ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                        showSeal ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* QR Toggle */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Security QR Code</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showQr}
                      onClick={() => handleToggleQr(!showQr)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                        showQr ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                        showQr ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─── 8. FIELDS VISIBILITY & DISPLAY OPTIONS ─── */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                8
              </div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Certificate Fields Visibility & Display Options</span>
              </h2>
            </div>
            
            <button
              type="button"
              onClick={handleToggleAllVisibility}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            >
              {HIDDEN_FIELDS_LIST.every(f => !hiddenFields.includes(f)) ? "Don't Show All (Hide All)" : 'Show All Fields'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            {HIDDEN_FIELDS_LIST.map((field) => {
              const isVisible = !hiddenFields.includes(field)

              return (
                <label 
                  key={field} 
                  className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none text-xs transition-all ${
                    isVisible 
                      ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-200 font-bold shadow-2xs ring-1 ring-blue-400/20' 
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => handleToggleFieldVisibility(field)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 cursor-pointer"
                    />
                    <span className={`truncate ${isVisible ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 dark:text-slate-500 line-through'}`}>
                      {isVisible ? `Show ${field}` : field}
                    </span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                    isVisible
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                  }`}>
                    {isVisible ? 'Show' : 'Hidden'}
                  </span>
                </label>
              )
            })}
          </div>
        </section>

        {/* ─── ACTIONS ─── */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Link 
            href="/institute/certificate/type" 
            className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs text-xs"
          >
            Cancel
          </Link>
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md text-xs flex items-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isSaving ? 'Saving Certificate Type...' : 'Save Certificate Type'}</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default function CertificateTypeCreatePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Certificate Setup Wizard...</div>}>
      <CertificateTypeCreateContent />
    </Suspense>
  )
}

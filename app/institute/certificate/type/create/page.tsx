'use client'

import React, { useState, useEffect, Suspense } from 'react'
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
  PenTool
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  CertificateDesign1, 
  CertificateDesign2, 
  CertificateDesign3, 
  CertificateDesign4,
  CertificateMiniPreview,
  CERTIFICATE_COLOR_PRESETS
} from '@/components/certificates/CertificateTemplates'
import { saveCertificateType, fetchCertificateTypes } from '../../actions'

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
  'Water Mark', 'Student Name', 'Certificate Date', 
  'Principal Sign', 'Teacher Sign', 'Controller Sign', 
  'Coordinator Sign', 'Parent Sign', 'Student Sign', 'Official Seal', 'QR Code'
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
  const [schoolName, setSchoolName] = useState('COSMOPOLITAN INTER COLLEGE')
  const [schoolAddress, setSchoolAddress] = useState('Knowledge Park, Sector 62, New Delhi')
  const [sampleStudentName, setSampleStudentName] = useState('Aarav Sharma')
  const [content, setContent] = useState(
    'This certificate is proudly awarded in recognition of outstanding performance, exemplary dedication, and commendable achievement during the academic session.'
  )

  // ─── Signatures & Credentials State ───
  // 1. Principal & Director
  const [principalName, setPrincipalName] = useState('Dr. S. K. Sharma')
  const [principalLabel, setPrincipalLabel] = useState('Principal & Director')
  const [showPrincipalSign, setShowPrincipalSign] = useState(true)

  // 2. Class Teacher
  const [teacherSignName, setTeacherSignName] = useState('Mrs. Kavita Verma')
  const [teacherSignLabel, setTeacherSignLabel] = useState("Class Teacher's Sign")
  const [showTeacherSign, setShowTeacherSign] = useState(false)

  // 3. Exam Controller
  const [controllerSignName, setControllerSignName] = useState('Mr. R. K. Saxena')
  const [controllerSignLabel, setControllerSignLabel] = useState('Exam Controller')
  const [showControllerSign, setShowControllerSign] = useState(false)

  // 4. Coordinator / In-Charge
  const [coordinatorSignName, setCoordinatorSignName] = useState('Authorized Signatory')
  const [coordinatorSignLabel, setCoordinatorSignLabel] = useState('Coordinator / In-Charge')
  const [showCoordinatorSign, setShowCoordinatorSign] = useState(false)

  // 5. Parent / Guardian
  const [parentSignName, setParentSignName] = useState('Parent / Guardian')
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

  // Preview Scale / Zoom
  const [previewScale, setPreviewScale] = useState<number>(0.68)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Load added classes and existing data
  useEffect(() => {
    const added = loadInstituteAddedClasses()
    setAvailableClasses(added)

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
      setHiddenFields(prev => prev.includes(field) ? prev : [...prev, field])
      if (field === 'Principal Sign') setShowPrincipalSign(false)
      if (field === 'Teacher Sign') setShowTeacherSign(false)
      if (field === 'Controller Sign') setShowControllerSign(false)
      if (field === 'Coordinator Sign') setShowCoordinatorSign(false)
      if (field === 'Parent Sign') setShowParentSign(false)
      if (field === 'Student Sign') setShowStudentSign(false)
      if (field === 'Certificate Date') setShowIssueDate(false)
      if (field === 'Official Seal' || field === 'Water Mark') setShowSeal(false)
      if (field === 'QR Code') setShowQr(false)
    } else {
      // User checked -> SHOW the field (remove from hiddenFields)
      setHiddenFields(prev => prev.filter(f => f !== field))
      if (field === 'Principal Sign') setShowPrincipalSign(true)
      if (field === 'Teacher Sign') setShowTeacherSign(true)
      if (field === 'Controller Sign') setShowControllerSign(true)
      if (field === 'Coordinator Sign') setShowCoordinatorSign(true)
      if (field === 'Parent Sign') setShowParentSign(true)
      if (field === 'Student Sign') setShowStudentSign(true)
      if (field === 'Certificate Date') setShowIssueDate(true)
      if (field === 'Official Seal' || field === 'Water Mark') setShowSeal(true)
      if (field === 'QR Code') setShowQr(true)
    }
  }

  const handleToggleHiddenField = handleToggleFieldVisibility

  const handleToggleAllVisibility = () => {
    if (hiddenFields.length === 0) {
      // Uncheck all -> hide all
      setHiddenFields([...HIDDEN_FIELDS_LIST])
      setShowPrincipalSign(false)
      setShowTeacherSign(false)
      setShowControllerSign(false)
      setShowCoordinatorSign(false)
      setShowParentSign(false)
      setShowStudentSign(false)
      setShowIssueDate(false)
      setShowSeal(false)
      setShowQr(false)
    } else {
      // Check all -> show all
      setHiddenFields([])
      setShowPrincipalSign(true)
      setShowTeacherSign(true)
      setShowControllerSign(true)
      setShowCoordinatorSign(true)
      setShowParentSign(true)
      setShowStudentSign(true)
      setShowIssueDate(true)
      setShowSeal(true)
      setShowQr(true)
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
  }

  const handleCanvasUpdateLabel = (key: string, val: string) => {
    if (key === 'principalSign') setPrincipalLabel(val)
    else if (key === 'teacherSign') setTeacherSignLabel(val)
    else if (key === 'controllerSign') setControllerSignLabel(val)
    else if (key === 'secondarySign') setCoordinatorSignLabel(val)
    else if (key === 'parentSign') setParentSignLabel(val)
    else if (key === 'studentSign') setStudentSignLabel(val)
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
        date: issueDate
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
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 flex items-center justify-center font-bold shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>{editId ? 'Edit Certificate Type' : 'Configure Certificate Type'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200">
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
            className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
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
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Certificate Numbering & Serial Setup
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:border-teal-500 transition-all text-slate-800 dark:text-slate-200 font-mono shadow-xs" 
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:border-teal-500 transition-all text-slate-800 dark:text-slate-200 font-mono shadow-xs" 
              />
              <span className="text-[11px] text-slate-400">Initial sequence counter for newly issued certificates</span>
            </div>
          </div>
        </section>

        {/* ─── 2. APPLICABLE TARGET CLASSES ─── */}
        <section>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
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
                  className="px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors flex items-center gap-1.5 shadow-2xs"
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
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-teal-500 w-48 shadow-2xs"
              />
            </div>

            {availableClasses.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
                <p className="text-xs text-slate-500 font-semibold">
                  No classes added yet in institute records.
                </p>
                <Link 
                  href="/institute/masters/classes"
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 dark:bg-teal-900/40 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
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
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-400'
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-100/70 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 rounded-lg text-[11px] font-semibold"
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
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-teal-600" />
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
                        ? 'bg-white dark:bg-slate-800 border-teal-500 shadow-md ring-2 ring-teal-500/20 scale-105'
                        : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs" 
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="text-slate-700 dark:text-slate-200">{preset.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 stroke-[3]" />}
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
                    className="w-24 px-2 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-teal-500 uppercase"
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
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              4
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-teal-600" />
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
                      ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 shadow-md ring-2 ring-teal-500/20 scale-[1.01]' 
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
                      isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
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
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                5
              </div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Live Interactive Certificate Canvas (Click Text to Edit)</span>
              </h2>
            </div>
            
            {/* Zoom / Scale Controls */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button 
                type="button"
                onClick={() => setPreviewScale(prev => Math.max(0.45, prev - 0.08))}
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
                onClick={() => setPreviewScale(prev => Math.min(1.0, prev + 0.08))}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                onClick={() => setPreviewScale(0.68)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/80 rounded-xl mb-4 text-xs font-medium text-teal-800 dark:text-teal-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>Direct Live Canvas Editing:</strong> You can click directly on the School Name, Address, Certificate Title, Subtitle, Student Name, Content narrative, or Principal Signature inside the preview below to edit them live!
            </span>
          </div>

          {/* Interactive Canvas Viewport */}
          <div className="w-full min-h-[460px] bg-slate-100 dark:bg-slate-900/80 rounded-2xl p-6 flex items-center justify-center overflow-x-auto border border-slate-200 dark:border-slate-700 shadow-inner">
            <div 
              style={{ transform: `scale(${previewScale})`, transformOrigin: 'center center' }} 
              className="flex items-center justify-center transition-transform duration-200 shrink-0 my-4"
            >
              {selectedDesign === 1 && (
                <CertificateDesign1 
                  title={title} 
                  subtitle={subtitle} 
                  content={content} 
                  schoolName={schoolName}
                  schoolAddress={schoolAddress}
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
                  showQr={showQr}
                  showSeal={showSeal}
                  hiddenFields={hiddenFields} 
                  customLabels={{
                    date_label: dateLabel,
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
                  title={title} 
                  subtitle={subtitle} 
                  content={content} 
                  schoolName={schoolName}
                  schoolAddress={schoolAddress}
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
                  showSeal={showSeal}
                  hiddenFields={hiddenFields} 
                  customLabels={{
                    date_label: dateLabel,
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
                  title={title} 
                  subtitle={subtitle} 
                  content={content} 
                  schoolName={schoolName}
                  schoolAddress={schoolAddress}
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
                  showQr={showQr}
                  hiddenFields={hiddenFields} 
                  customLabels={{
                    date_label: dateLabel,
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
                  title={title} 
                  subtitle={subtitle} 
                  content={content} 
                  schoolName={schoolName}
                  schoolAddress={schoolAddress}
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
                  showQr={showQr}
                  showSeal={showSeal}
                  hiddenFields={hiddenFields} 
                  customLabels={{
                    date_label: dateLabel,
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
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              6
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-bold outline-none focus:border-teal-500 transition-all text-slate-800 dark:text-slate-100 shadow-xs" 
              />
              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-[10px] font-semibold text-slate-400">Quick Suggestions:</span>
                {TITLE_SUGGESTIONS.map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setTitle(sug)}
                    className="text-[10px] bg-white dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium transition-colors shadow-2xs"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle & School Overrides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subtitle Tagline</label>
                <input 
                  type="text" 
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500 shadow-xs text-slate-700 dark:text-slate-200" 
                  placeholder="e.g. In Recognition of Academic Excellence"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Institution / School Name</label>
                <input 
                  type="text" 
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500 shadow-xs text-slate-700 dark:text-slate-200" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">School Address</label>
                <input 
                  type="text" 
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500 shadow-xs text-slate-700 dark:text-slate-200" 
                />
              </div>
            </div>

            {/* Narrative Body Text & Merge Tags */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Certificate Body Narrative Content
                </label>
                <span className="text-[11px] text-slate-400">Click merge tags below to insert placeholders dynamically</span>
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
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-teal-700 dark:text-teal-300 font-bold hover:bg-teal-50 transition-colors shadow-2xs"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                <textarea 
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 text-xs text-slate-700 dark:text-slate-200 outline-none resize-none leading-relaxed bg-transparent"
                  placeholder="Enter the certificate narrative text..."
                ></textarea>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. SIGNATURES & STAMP CONFIGURATION (SEPARATE SECTION) ─── */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                7
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Feather className="w-4 h-4 text-teal-600" />
                  <span>Signatures & Credentials Authority Hub</span>
                </h2>
                <p className="text-[11px] text-slate-500 font-normal">
                  Toggle individual signatures on or off to prevent crowding and format names & designations cleanly.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* 1. Principal / Director Signature */}
            <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              showPrincipalSign 
                ? 'bg-white dark:bg-slate-800 border-teal-400 dark:border-teal-700 shadow-sm' 
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Principal Sign</h3>
                      <span className="text-[10px] text-slate-400">Primary Authority</span>
                    </div>
                  </div>
                  
                  {/* Toggle Button */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      showPrincipalSign ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {showPrincipalSign ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showPrincipalSign}
                      onClick={() => handleTogglePrincipalSign(!showPrincipalSign)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                        showPrincipalSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
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
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
                      placeholder="e.g. Dr. S. K. Sharma"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Designation / Title</label>
                    <input 
                      type="text" 
                      value={principalLabel}
                      disabled={!showPrincipalSign}
                      onChange={(e) => setPrincipalLabel(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
                      placeholder="e.g. Principal & Director"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Class Teacher's Signature */}
            <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              showTeacherSign 
                ? 'bg-white dark:bg-slate-800 border-teal-400 dark:border-teal-700 shadow-sm' 
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                      <Feather className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Teacher Sign</h3>
                      <span className="text-[10px] text-slate-400">Class Mentor</span>
                    </div>
                  </div>
                  
                  {/* Toggle Button */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      showTeacherSign ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {showTeacherSign ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showTeacherSign}
                      onClick={() => handleToggleTeacherSign(!showTeacherSign)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                        showTeacherSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
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
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
                      placeholder="e.g. Mrs. Kavita Verma"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Designation / Title</label>
                    <input 
                      type="text" 
                      value={teacherSignLabel}
                      disabled={!showTeacherSign}
                      onChange={(e) => setTeacherSignLabel(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
                      placeholder="e.g. Class Teacher's Sign"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Exam Controller's Signature */}
            <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              showControllerSign 
                ? 'bg-white dark:bg-slate-800 border-teal-400 dark:border-teal-700 shadow-sm' 
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Exam Controller</h3>
                      <span className="text-[10px] text-slate-400">Examination Cell</span>
                    </div>
                  </div>
                  
                  {/* Toggle Button */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      showControllerSign ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {showControllerSign ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showControllerSign}
                      onClick={() => handleToggleControllerSign(!showControllerSign)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                        showControllerSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
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
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
                      placeholder="e.g. Mr. R. K. Saxena"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Designation / Title</label>
                    <input 
                      type="text" 
                      value={controllerSignLabel}
                      disabled={!showControllerSign}
                      onChange={(e) => setControllerSignLabel(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
                      placeholder="e.g. Exam Controller"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Coordinator / In-Charge Signature */}
            <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              showCoordinatorSign 
                ? 'bg-white dark:bg-slate-800 border-teal-400 dark:border-teal-700 shadow-sm' 
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Coordinator Sign</h3>
                      <span className="text-[10px] text-slate-400">Authorized In-Charge</span>
                    </div>
                  </div>
                  
                  {/* Toggle Button */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      showCoordinatorSign ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {showCoordinatorSign ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showCoordinatorSign}
                      onClick={() => handleToggleCoordinatorSign(!showCoordinatorSign)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                        showCoordinatorSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
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
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Coordinator Name</label>
                    <input 
                      type="text" 
                      value={coordinatorSignName}
                      disabled={!showCoordinatorSign}
                      onChange={(e) => setCoordinatorSignName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
                      placeholder="e.g. Authorized Signatory"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Designation / Title</label>
                    <input 
                      type="text" 
                      value={coordinatorSignLabel}
                      disabled={!showCoordinatorSign}
                      onChange={(e) => setCoordinatorSignLabel(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
                      placeholder="e.g. Coordinator / In-Charge"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Parent / Guardian Signature */}
            <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              showParentSign 
                ? 'bg-white dark:bg-slate-800 border-teal-400 dark:border-teal-700 shadow-sm' 
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Parent / Guardian</h3>
                      <span className="text-[10px] text-slate-400">Family Endorsement</span>
                    </div>
                  </div>
                  
                  {/* Toggle Button */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      showParentSign ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {showParentSign ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showParentSign}
                      onClick={() => handleToggleParentSign(!showParentSign)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                        showParentSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
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
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
                      placeholder="e.g. Parent / Guardian"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Line Label</label>
                    <input 
                      type="text" 
                      value={parentSignLabel}
                      disabled={!showParentSign}
                      onChange={(e) => setParentSignLabel(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
                      placeholder="e.g. Parent's Signature"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Candidate / Student Signature */}
            <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              showStudentSign 
                ? 'bg-white dark:bg-slate-800 border-teal-400 dark:border-teal-700 shadow-sm' 
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">Candidate Sign</h3>
                      <span className="text-[10px] text-slate-400">Recipient Acceptance</span>
                    </div>
                  </div>
                  
                  {/* Toggle Button */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      showStudentSign ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {showStudentSign ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showStudentSign}
                      onClick={() => handleToggleStudentSign(!showStudentSign)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                        showStudentSign ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
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
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
                      placeholder="e.g. Student's Signature"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Displays Candidate acknowledgment line for student endorsement on the certificate.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Certificate Issue Date */}
            <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              showIssueDate 
                ? 'bg-white dark:bg-slate-800 border-teal-400 dark:border-teal-700 shadow-sm' 
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
            }`}>
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
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
                      showIssueDate ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {showIssueDate ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showIssueDate}
                      onClick={() => handleToggleIssueDate(!showIssueDate)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                        showIssueDate ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
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
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
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
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs outline-none focus:border-teal-500" 
                      placeholder="e.g. Date of Issue"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Official Seal & QR Code */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
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
                        showSeal ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
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
                      <QrCode className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Security QR Code</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showQr}
                      onClick={() => handleToggleQr(!showQr)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 focus:outline-none ${
                        showQr ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
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
              <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                8
              </div>
              <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                <span>Certificate Fields Visibility & Display Options</span>
              </h2>
            </div>
            
            <button
              type="button"
              onClick={handleToggleAllVisibility}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            >
              {hiddenFields.length === 0 ? 'Don\'t Show All (Hide All)' : 'Show All Fields'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            {HIDDEN_FIELDS_LIST.map((field) => {
              const isVisible = !hiddenFields.includes(field)

              return (
                <label 
                  key={field} 
                  className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none text-xs transition-all ${
                    isVisible 
                      ? 'bg-teal-50/80 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700 text-teal-950 dark:text-teal-200 font-bold shadow-2xs ring-1 ring-teal-400/20' 
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => handleToggleFieldVisibility(field)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 shrink-0 cursor-pointer"
                    />
                    <span className={`truncate ${isVisible ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 dark:text-slate-500 line-through'}`}>
                      {isVisible ? `Show ${field}` : field}
                    </span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                    isVisible
                      ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300'
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
            className="px-8 py-2.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-md text-xs flex items-center gap-2 disabled:opacity-50"
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
